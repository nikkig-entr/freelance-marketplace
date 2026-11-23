import logging
from datetime import datetime, timezone

from app.tasks.celery_app import celery_app
from app.core.redis import get_redis

logger = logging.getLogger(__name__)


@celery_app.task(name="app.tasks.weekly_reset.reset_weekly_bid_limits")
async def reset_weekly_bid_limits() -> dict:
    """
    Reset weekly bid limits by cleaning up old Redis keys.
    This runs every Sunday at midnight UTC.
    """
    redis_client = await get_redis()

    # Scan for old bid_limit keys (older than 2 weeks)
    pattern = "bid_limit:*"
    deleted_count = 0

    async for key in redis_client.scan_iter(match=pattern):
        # Key format: bid_limit:{user_id}:{year}-W{week}
        # We keep current and previous week, delete older
        try:
            key_str = key.decode() if isinstance(key, bytes) else key
            parts = key_str.split(":")
            if len(parts) >= 3:
                week_part = parts[2]  # year-Wweek
                # Parse year and week
                year_str, week_str = week_part.split("-W")
                key_year = int(year_str)
                key_week = int(week_str)

                now = datetime.now(timezone.utc)
                current_year = now.isocalendar()[0]
                current_week = now.isocalendar()[1]

                # Calculate weeks difference
                weeks_diff = (current_year - key_year) * 52 + (current_week - key_week)

                if weeks_diff > 1:  # Keep current and previous week
                    await redis_client.delete(key)
                    deleted_count += 1
        except Exception as e:
            logger.warning(f"Error processing key {key}: {e}")

    logger.info(f"Cleaned up {deleted_count} old bid limit keys")
    return {"deleted_keys": deleted_count, "status": "completed"}


@celery_app.task(name="app.tasks.weekly_reset.cleanup_expired_tokens")
async def cleanup_expired_tokens() -> dict:
    """
    Clean up expired JWT tokens from Redis (if stored there).
    Runs daily at 2 AM UTC.
    """
    redis_client = await get_redis()

    # Clean up any token blacklist or expired token keys
    patterns = [
        "token_blacklist:*",
        "refresh_token:*",
        "password_reset:*",
        "email_verification:*",
    ]

    deleted_count = 0
    for pattern in patterns:
        async for key in redis_client.scan_iter(match=pattern):
            # Check TTL, delete if expired or no TTL
            ttl = await redis_client.ttl(key)
            if ttl == -1:  # No expiry set
                await redis_client.delete(key)
                deleted_count += 1
            elif ttl == -2:  # Key doesn't exist
                deleted_count += 1

    logger.info(f"Cleaned up {deleted_count} expired token keys")
    return {"deleted_keys": deleted_count, "status": "completed"}