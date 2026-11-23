from typing import Tuple, Optional
from datetime import datetime
from app.core.redis import get_redis, increment_counter as incr_counter, get_counter
from app.core.config import get_settings
from app.models.user import User, UserPlan

settings = get_settings()


class LimitService:
    """Service for managing user limits (bids, projects, etc.)."""

    @staticmethod
    def _get_week_key(user_id: int) -> Tuple[int, int]:
        """Get current week number and year for Redis key."""
        now = datetime.utcnow()
        # ISO week: Monday = 1, Sunday = 7
        year, week, _ = now.isocalendar()
        if not settings.WEEK_START_MONDAY:
            # Adjust for Sunday start
            pass
        return year, week

    @staticmethod
    def _get_bid_limit_key(user_id: int) -> str:
        """Generate Redis key for bid limit counter."""
        year, week = LimitService._get_week_key(user_id)
        return f"bid_limit:{user_id}:{year}:{week}"

    @staticmethod
    async def check_bid_limit(user: User) -> Tuple[bool, int, int]:
        """
        Check if user can place a bid.
        Returns (allowed, limit, remaining).
        """
        # Unlimited for Pro and Agency
        if user.plan in (UserPlan.PRO, UserPlan.AGENCY):
            return True, -1, -1

        # Check limit for Starter
        limit = settings.get_bid_limit(user.plan.value)
        key = LimitService._get_bid_limit_key(user.id)
        current = await get_counter(key)

        if current >= limit:
            return False, limit, 0

        return True, limit, limit - current

    @staticmethod
    async def increment_bid_count(user: User) -> int:
        """Increment bid counter and return new count."""
        if user.plan in (UserPlan.PRO, UserPlan.AGENCY):
            return -1  # Unlimited

        key = LimitService._get_bid_limit_key(user.id)
        # Expire after 1 week (7 days) + buffer
        return await incr_counter(key, expire_seconds=604800 + 86400)

    @staticmethod
    async def check_and_increment_bid_limit(user: User) -> Tuple[bool, int, int]:
        """
        Check limit and increment if allowed.
        Returns (allowed, limit, remaining_after).
        """
        allowed, limit, remaining = await LimitService.check_bid_limit(user)

        if not allowed:
            return False, limit, 0

        new_count = await LimitService.increment_bid_count(user)

        if limit > 0:
            remaining = max(0, limit - new_count)

        return True, limit, remaining

    @staticmethod
    async def get_bid_usage(user: User) -> Tuple[int, int, int]:
        """
        Get current bid usage.
        Returns (used, limit, remaining).
        """
        if user.plan in (UserPlan.PRO, UserPlan.AGENCY):
            return 0, -1, -1

        limit = settings.get_bid_limit(user.plan.value)
        key = LimitService._get_bid_limit_key(user.id)
        used = await get_counter(key)
        remaining = max(0, limit - used)

        return used, limit, remaining

    @staticmethod
    async def reset_bid_limit(user: User) -> bool:
        """Reset bid limit for user (admin or weekly cron)."""
        key = LimitService._get_bid_limit_key(user.id)
        redis = await get_redis()
        return await redis.delete(key) > 0

    @staticmethod
    async def check_active_projects_limit(user: User, current_count: int) -> Tuple[bool, int]:
        """Check if user can create more active projects."""
        limit = settings.get_active_projects_limit(user.plan.value)

        if limit < 0:  # Unlimited
            return True, -1

        if current_count >= limit:
            return False, limit

        return True, limit

    @staticmethod
    async def check_ai_access(user: User) -> bool:
        """Check if user has access to AI features."""
        return settings.has_ai_access(user.plan.value)

    @staticmethod
    async def check_ai_wizard_access(user: User) -> bool:
        """Check if user has access to AI wizard."""
        return settings.has_ai_wizard(user.plan.value)