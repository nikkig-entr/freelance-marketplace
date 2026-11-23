import redis.asyncio as redis
from typing import Optional
from datetime import datetime, timedelta

from app.core.config import settings
from app.core.config import PLAN_LIMITS


class LimitService:
    def __init__(self):
        self.redis_client: Optional[redis.Redis] = None

    async def initialize(self):
        """Initialize Redis connection."""
        self.redis_client = redis.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
        )

    async def close(self):
        """Close Redis connection."""
        if self.redis_client:
            await self.redis_client.close()

    def _get_weekly_key(self, user_id: int) -> str:
        """Generate Redis key for weekly bid limit."""
        now = datetime.utcnow()
        year = now.isocalendar()[0]
        week = now.isocalendar()[1]
        return f"bid_limit:{user_id}:{year}-W{week:02d}"

    def _get_daily_key(self, user_id: int, action: str) -> str:
        """Generate Redis key for daily action limit."""
        today = datetime.utcnow().strftime("%Y-%m-%d")
        return f"daily_limit:{user_id}:{action}:{today}"

    async def check_bid_limit(self, user_id: int, plan: str) -> tuple[bool, int, int]:
        """
        Check if user can place a bid.
        Returns: (allowed, current_count, limit)
        """
        if not self.redis_client:
            await self.initialize()

        limit = PLAN_LIMITS.get(plan, {}).get("weekly_bids", 10)
        if limit <= 0:
            return True, 0, 0  # Unlimited

        key = self._get_weekly_key(user_id)
        current = await self.redis_client.get(key)
        current_count = int(current) if current else 0

        allowed = current_count < limit
        return allowed, current_count, limit

    async def increment_bid_count(self, user_id: int, plan: str) -> int:
        """Increment bid count for user."""
        if not self.redis_client:
            await self.initialize()

        limit = PLAN_LIMITS.get(plan, {}).get("weekly_bids", 10)
        if limit <= 0:
            return 0  # Unlimited

        key = self._get_weekly_key(user_id)
        # Increment with expiry (8 days to cover week boundary)
        pipe = self.redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, 8 * 24 * 60 * 60)  # 8 days
        results = await pipe.execute()
        return results[0]

    async def decrement_bid_count(self, user_id: int, plan: str) -> int:
        """Decrement bid count (when bid is withdrawn)."""
        if not self.redis_client:
            await self.initialize()

        limit = PLAN_LIMITS.get(plan, {}).get("weekly_bids", 10)
        if limit <= 0:
            return 0

        key = self._get_weekly_key(user_id)
        current = await self.redis_client.get(key)
        current_count = int(current) if current else 0

        if current_count > 0:
            new_count = await self.redis_client.decr(key)
            return max(0, new_count)
        return 0

    async def get_bid_usage(self, user_id: int, plan: str) -> dict:
        """Get current bid usage for user."""
        if not self.redis_client:
            await self.initialize()

        limit = PLAN_LIMITS.get(plan, {}).get("weekly_bids", 10)
        key = self._get_weekly_key(user_id)
        current = await self.redis_client.get(key)
        current_count = int(current) if current else 0

        # Get TTL
        ttl = await self.redis_client.ttl(key)
        reset_in_seconds = ttl if ttl > 0 else 7 * 24 * 60 * 60

        return {
            "used": current_count,
            "limit": limit,
            "remaining": max(0, limit - current_count),
            "reset_in_seconds": reset_in_seconds,
            "unlimited": limit <= 0,
        }

    async def check_ai_limit(self, user_id: int, plan: str) -> tuple[bool, int, int]:
        """Check if user can make AI request."""
        if not self.redis_client:
            await self.initialize()

        limit = PLAN_LIMITS.get(plan, {}).get("ai_requests", 0)
        if limit <= 0:
            return False, 0, 0  # No AI access

        key = f"ai_limit:{user_id}:{datetime.utcnow().strftime('%Y-%m')}"
        current = await self.redis_client.get(key)
        current_count = int(current) if current else 0

        allowed = current_count < limit
        return allowed, current_count, limit

    async def increment_ai_count(self, user_id: int, plan: str) -> int:
        """Increment AI request count."""
        if not self.redis_client:
            await self.initialize()

        limit = PLAN_LIMITS.get(plan, {}).get("ai_requests", 0)
        if limit <= 0:
            return 0

        key = f"ai_limit:{user_id}:{datetime.utcnow().strftime('%Y-%m')}"
        # Monthly expiry (32 days)
        pipe = self.redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, 32 * 24 * 60 * 60)
        results = await pipe.execute()
        return results[0]

    async def check_daily_action_limit(self, user_id: int, action: str, limit: int) -> tuple[bool, int]:
        """Check daily action limit (e.g., messages sent, profile views)."""
        if not self.redis_client:
            await self.initialize()

        key = self._get_daily_key(user_id, action)
        current = await self.redis_client.get(key)
        current_count = int(current) if current else 0

        allowed = current_count < limit
        return allowed, current_count

    async def increment_daily_action(self, user_id: int, action: str, limit: int) -> int:
        """Increment daily action counter."""
        if not self.redis_client:
            await self.initialize()

        key = self._get_daily_key(user_id, action)
        pipe = self.redis_client.pipeline()
        pipe.incr(key)
        pipe.expire(key, 25 * 60 * 60)  # 25 hours
        results = await pipe.execute()
        return results[0]

    async def reset_user_limits(self, user_id: int):
        """Reset all limits for a user (admin action)."""
        if not self.redis_client:
            await self.initialize()

        pattern = f"*:{user_id}:*"
        keys = []
        async for key in self.redis_client.scan_iter(match=pattern):
            keys.append(key)
        if keys:
            await self.redis_client.delete(*keys)


# Global instance
limit_service = LimitService()