from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, or_, desc, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db, get_current_user, require_roles
from app.models.user import User, UserRole, UserPlan
from app.models.project import Project, ProjectStatus
from app.models.bid import Bid, BidStatus
from app.models.transaction import Transaction, TransactionType
from app.models.withdrawal import Withdrawal, WithdrawalStatus
from app.models.review import Review
from app.models.subscription import Subscription, SubscriptionStatus
from app.schemas.admin import (
    AdminStatsResponse, AdminUserListResponse, AdminUserResponse,
    AdminProjectListResponse, AdminProjectResponse,
    AdminTransactionListResponse, AdminWithdrawalListResponse,
    AdminUserUpdate, AdminProjectUpdate, WithdrawalAction
)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=AdminStatsResponse)
async def get_admin_stats(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get platform statistics."""
    # Users
    total_users = await db.scalar(select(func.count(User.id)))
    freelancers = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.FREELANCER))
    clients = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.CLIENT))

    # Plans
    plan_stats = {}
    for plan in UserPlan:
        count = await db.scalar(select(func.count(User.id)).where(User.plan == plan))
        plan_stats[plan.value] = count or 0

    # Projects
    total_projects = await db.scalar(select(func.count(Project.id)))
    open_projects = await db.scalar(select(func.count(Project.id)).where(Project.status == ProjectStatus.OPEN))
    in_progress_projects = await db.scalar(select(func.count(Project.id)).where(Project.status == ProjectStatus.IN_PROGRESS))
    completed_projects = await db.scalar(select(func.count(Project.id)).where(Project.status == ProjectStatus.COMPLETED))

    # Bids
    total_bids = await db.scalar(select(func.count(Bid.id)))
    pending_bids = await db.scalar(select(func.count(Bid.id)).where(Bid.status == BidStatus.PENDING))
    accepted_bids = await db.scalar(select(func.count(Bid.id)).where(Bid.status == BidStatus.ACCEPTED))

    # Financial
    total_revenue = await db.scalar(
        select(func.coalesce(func.sum(Transaction.amount_cents), 0))
        .where(Transaction.type == TransactionType.PLATFORM_FEE)
    ) or 0

    pending_withdrawals_amount = await db.scalar(
        select(func.coalesce(func.sum(Withdrawal.amount_cents), 0))
        .where(Withdrawal.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]))
    ) or 0

    pending_withdrawals_count = await db.scalar(
        select(func.count(Withdrawal.id))
        .where(Withdrawal.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]))
    ) or 0

    # Subscriptions
    active_subscriptions = await db.scalar(
        select(func.count(Subscription.id))
        .where(Subscription.status.in_([SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING]))
    ) or 0

    # Cross-database compatible date subtraction
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    mrr = await db.scalar(
        select(func.coalesce(func.sum(Transaction.amount_cents), 0))
        .where(
            Transaction.type == TransactionType.SUBSCRIPTION_PAYMENT,
            Transaction.created_at >= thirty_days_ago
        )
    ) or 0

    # Build users_by_plan and projects_by_status dicts
    users_by_plan = plan_stats
    projects_by_status = {
        "open": open_projects or 0,
        "in_progress": in_progress_projects or 0,
        "completed": completed_projects or 0,
    }

    return AdminStatsResponse(
        total_users=total_users or 0,
        total_freelancers=freelancers or 0,
        total_clients=clients or 0,
        total_projects=total_projects or 0,
        open_projects=open_projects or 0,
        in_progress_projects=in_progress_projects or 0,
        completed_projects=completed_projects or 0,
        total_bids=total_bids or 0,
        total_transactions_volume_cents=total_revenue,
        total_commission_cents=0,  # Not tracked separately yet
        pending_withdrawals=pending_withdrawals_count,
        pending_withdrawals_amount_cents=pending_withdrawals_amount,
        revenue_this_month_cents=mrr,
        users_by_plan=users_by_plan,
        projects_by_status=projects_by_status,
    )


@router.get("/users", response_model=AdminUserListResponse)
async def admin_list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    role: Optional[UserRole] = None,
    plan: Optional[UserPlan] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|email|full_name|balance_cents|total_earned_cents)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all users (admin only)."""
    query = select(User)

    filters = []
    if role:
        filters.append(User.role == role)
    if plan:
        filters.append(User.plan == plan)
    if is_active is not None:
        filters.append(User.is_active == is_active)
    if search:
        filters.append(
            or_(
                User.email.ilike(f"%{search}%"),
                User.full_name.ilike(f"%{search}%"),
            )
        )

    if filters:
        query = query.where(and_(*filters))

    # Sorting
    sort_column = getattr(User, sort_by, User.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    users = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return AdminUserListResponse(
        users=users,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/users/{user_id}", response_model=AdminUserResponse)
async def admin_get_user(
    user_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get user details (admin only)."""
    query = select(User).where(User.id == user_id).options(
        selectinload(User.owned_projects),
        selectinload(User.bids),
        selectinload(User.subscription),
    )
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


@router.patch("/users/{user_id}", response_model=AdminUserResponse)
async def admin_update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Update user (admin only)."""
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "is_banned":
            # Map is_banned to is_active
            user.is_active = not value
        elif hasattr(user, field):
            setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/users/{user_id}/ban", response_model=AdminUserResponse)
async def admin_ban_user(
    user_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Ban a user (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot ban yourself")

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = False
    await db.commit()
    await db.refresh(user)
    return user


@router.post("/users/{user_id}/unban", response_model=AdminUserResponse)
async def admin_unban_user(
    user_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Unban a user (admin only)."""
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.is_active = True
    await db.commit()
    await db.refresh(user)
    return user


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_user(
    user_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Delete user (admin only)."""
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete yourself")

    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(user)
    await db.commit()


@router.get("/projects", response_model=AdminProjectListResponse)
async def admin_list_projects(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ProjectStatus] = None,
    search: Optional[str] = None,
    sort_by: str = Query("created_at", pattern="^(created_at|title|budget_min|bids_count|views_count)$"),
    sort_order: str = Query("desc", pattern="^(asc|desc)$"),
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all projects (admin only)."""
    query = select(Project).options(selectinload(Project.client))

    filters = []
    if status:
        filters.append(Project.status == status)
    if search:
        filters.append(
            or_(
                Project.title.ilike(f"%{search}%"),
                Project.description.ilike(f"%{search}%"),
            )
        )

    if filters:
        query = query.where(and_(*filters))

    sort_column = getattr(Project, sort_by, Project.created_at)
    if sort_order == "desc":
        query = query.order_by(sort_column.desc())
    else:
        query = query.order_by(sort_column.asc())

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    projects = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return AdminProjectListResponse(
        projects=projects,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/projects/{project_id}", response_model=AdminProjectResponse)
async def admin_get_project(
    project_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get project details (admin only)."""
    query = select(Project).where(Project.id == project_id).options(
        selectinload(Project.client),
        selectinload(Project.freelancer),
        selectinload(Project.bids).selectinload(Bid.freelancer),
    )
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project


@router.patch("/projects/{project_id}", response_model=AdminProjectResponse)
async def admin_update_project(
    project_id: int,
    project_data: AdminProjectUpdate,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Update project (admin only)."""
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    await db.commit()
    await db.refresh(project)
    return project


@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def admin_delete_project(
    project_id: int,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Delete project (admin only)."""
    query = select(Project).where(Project.id == project_id)
    result = await db.execute(query)
    project = result.scalar_one_or_none()

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    await db.delete(project)
    await db.commit()


@router.get("/transactions", response_model=AdminTransactionListResponse)
async def admin_list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[TransactionType] = None,
    user_id: Optional[int] = None,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all transactions (admin only)."""
    query = select(Transaction).options(selectinload(Transaction.user)).order_by(Transaction.created_at.desc())

    filters = []
    if type:
        filters.append(Transaction.type == type)
    if user_id:
        filters.append(Transaction.user_id == user_id)

    if filters:
        query = query.where(and_(*filters))

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    transactions = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return AdminTransactionListResponse(
        items=transactions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/withdrawals", response_model=AdminWithdrawalListResponse)
async def admin_list_withdrawals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[WithdrawalStatus] = None,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """List all withdrawals (admin only)."""
    query = select(Withdrawal).options(selectinload(Withdrawal.user)).order_by(Withdrawal.created_at.desc())

    if status:
        query = query.where(Withdrawal.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    withdrawals = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return AdminWithdrawalListResponse(
        withdrawals=withdrawals,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.patch("/withdrawals/{withdrawal_id}", response_model=AdminWithdrawalListResponse)
async def admin_update_withdrawal(
    withdrawal_id: int,
    action_data: WithdrawalAction,
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Approve or reject a withdrawal (admin only)."""
    query = select(Withdrawal).where(Withdrawal.id == withdrawal_id)
    result = await db.execute(query)
    withdrawal = result.scalar_one_or_none()

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    if action_data.action == "approve":
        withdrawal.status = WithdrawalStatus.PROCESSING
        withdrawal.reviewed_by = current_user.id
        withdrawal.reviewed_at = datetime.now(timezone.utc)
        withdrawal.admin_notes = action_data.admin_notes
    elif action_data.action == "reject":
        withdrawal.status = WithdrawalStatus.CANCELLED
        withdrawal.reviewed_by = current_user.id
        withdrawal.reviewed_at = datetime.now(timezone.utc)
        withdrawal.rejection_reason = action_data.admin_notes

    await db.commit()
    await db.refresh(withdrawal)
    return withdrawal


@router.get("/revenue", response_model=dict)
async def admin_revenue_report(
    current_user: User = Depends(require_roles(UserRole.ADMIN)),
    db: AsyncSession = Depends(get_db),
):
    """Get revenue report (admin only)."""
    # Total revenue (platform fees)
    total_revenue = await db.scalar(
        select(func.coalesce(func.sum(Transaction.amount_cents), 0))
        .where(Transaction.type == TransactionType.PLATFORM_FEE)
    ) or 0

    # Revenue this month
    thirty_days_ago = datetime.now(timezone.utc) - timedelta(days=30)
    monthly_revenue = await db.scalar(
        select(func.coalesce(func.sum(Transaction.amount_cents), 0))
        .where(
            Transaction.type == TransactionType.PLATFORM_FEE,
            Transaction.created_at >= thirty_days_ago
        )
    ) or 0

    # Subscription revenue (MRR)
    mrr = await db.scalar(
        select(func.coalesce(func.sum(Transaction.amount_cents), 0))
        .where(
            Transaction.type == TransactionType.SUBSCRIPTION_PAYMENT,
            Transaction.created_at >= thirty_days_ago
        )
    ) or 0

    return {
        "total_revenue_cents": total_revenue,
        "monthly_revenue_cents": monthly_revenue,
        "mrr_cents": mrr,
    }