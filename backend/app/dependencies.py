from datetime import datetime, timezone
from typing import Annotated

from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core import redis as redis_module
from app.core.security import get_current_user as security_get_current_user, TokenData
from app.models.user import User, UserPlan, UserRole


async def get_current_user(
    token_data: Annotated[TokenData, Depends(security_get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Get current authenticated user from database."""
    user = await db.get(User, token_data.user_id)
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


async def check_bid_limit(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Check if user has exceeded their weekly bid limit based on their plan.

    Rate limit key: bid_limit:{user_id}:{week_number}
    Expires at end of week (Sunday 23:59:59 UTC)
    """
    if current_user.role != UserRole.FREELANCER:
        return current_user

    plan_limits = settings.PLAN_LIMITS.get(current_user.plan.value, settings.PLAN_LIMITS["starter"])
    max_bids = plan_limits["bids_per_week"]

    if max_bids == -1:  # Unlimited (Agency plan)
        return current_user

    # Calculate week number (ISO week)
    now = datetime.now(timezone.utc)
    week_number = now.isocalendar()[1]
    year = now.isocalendar()[0]

    # Calculate seconds until week ends (Sunday 23:59:59 UTC)
    # ISO week ends on Sunday
    days_until_sunday = (6 - now.weekday()) % 7
    if days_until_sunday == 0:
        days_until_sunday = 7
    seconds_until_week_end = (
        days_until_sunday * 24 * 3600
        - now.hour * 3600
        - now.minute * 60
        - now.second
    )

    # Redis key with year and week for proper expiry
    key = f"bid_limit:{current_user.id}:{year}-W{week_number:02d}"

    # Get current count
    current_count = await redis_module.get_counter(key)

    if current_count >= max_bids:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={
                "error": "bid_limit_exceeded",
                "message": f"Weekly bid limit of {max_bids} reached for {current_user.plan.value} plan",
                "limit": max_bids,
                "used": current_count,
                "reset_in_seconds": seconds_until_week_end,
                "plan": current_user.plan.value,
            },
            headers={"Retry-After": str(seconds_until_week_end)},
        )

    # Increment counter (will set expiry on first increment)
    await redis_module.increment_counter(key, seconds_until_week_end + 3600)  # Add 1 hour buffer

    return current_user


async def check_ai_access(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """
    Check if user has access to AI features based on their plan.
    Both clients and freelancers with Pro and Agency plans have AI access.
    STARTER plan users do not have AI access.
    """
    if current_user.plan not in (UserPlan.PRO, UserPlan.AGENCY):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "ai_access_denied",
                "message": "AI features are only available for Pro and Agency plans",
                "current_plan": current_user.plan.value,
                "required_plans": ["pro", "agency"],
            },
        )
    return current_user


async def require_client(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require user to have client role."""
    if current_user.role not in (UserRole.CLIENT, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Client access required",
        )
    return current_user


async def require_freelancer(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require user to have freelancer role."""
    if current_user.role not in (UserRole.FREELANCER, UserRole.ADMIN):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Freelancer access required",
        )
    return current_user


async def require_admin(
    current_user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require user to have admin role."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def require_roles(
    *allowed_roles: UserRole,
):
    """Dependency factory to require specific role(s)."""
    async def _require_roles(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        # Handle both enum and string role values
        current_role_value = current_user.role.value if hasattr(current_user.role, 'value') else current_user.role
        allowed_role_values = [r.value for r in allowed_roles]

        if current_role_value not in allowed_role_values and current_role_value != UserRole.ADMIN.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "role_required",
                    "message": f"This action requires one of: {', '.join(allowed_role_values)}",
                    "current_role": current_role_value,
                    "required_roles": allowed_role_values,
                },
            )
        return current_user
    return _require_roles


async def check_project_access(
    project_uuid: str,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> User:
    """Check if user has access to a project (client, freelancer, or admin)."""
    from app.models.project import Project, ProjectStatus
    from app.models.bid import Bid, BidStatus

    query = select(Project).where(Project.uuid == project_uuid)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Admin has access to everything
    if current_user.role == UserRole.ADMIN:
        return current_user

    # Client owns the project
    if project.client_id == current_user.id:
        return current_user

    # Freelancer has accepted bid
    if current_user.role == UserRole.FREELANCER:
        bid_query = select(Bid).where(
            Bid.project_id == project.id,
            Bid.freelancer_id == current_user.id,
            Bid.status == BidStatus.ACCEPTED
        )
        bid_result = await db.execute(bid_query)
        if bid_result.scalar_one_or_none():
            return current_user

    # Public access for open projects
    if project.status == ProjectStatus.OPEN:
        return current_user

    raise HTTPException(status_code=403, detail="Not authorized to access this project")


async def require_plan(
    *allowed_plans: UserPlan,
):
    """Dependency factory to require specific plan(s)."""
    async def _require_plan(
        current_user: Annotated[User, Depends(get_current_user)],
    ) -> User:
        if current_user.plan not in allowed_plans and current_user.role != UserRole.ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "plan_required",
                    "message": f"This feature requires one of: {', '.join(p.value for p in allowed_plans)}",
                    "current_plan": current_user.plan.value,
                    "required_plans": [p.value for p in allowed_plans],
                },
            )
        return current_user
    return _require_plan


# Additional dependencies
ProjectAccess = Annotated[User, Depends(check_project_access)]
ProOrAgency = Annotated[User, Depends(require_plan(UserPlan.PRO, UserPlan.AGENCY))]
AgencyOnly = Annotated[User, Depends(require_plan(UserPlan.AGENCY))]

# Common dependency combinations
CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentClient = Annotated[User, Depends(require_client)]
CurrentFreelancer = Annotated[User, Depends(require_freelancer)]
CurrentAdmin = Annotated[User, Depends(require_admin)]
BidLimitedFreelancer = Annotated[User, Depends(check_bid_limit)]
AIEnabledUser = Annotated[User, Depends(check_ai_access)]
DatabaseSession = Annotated[AsyncSession, Depends(get_db)]
