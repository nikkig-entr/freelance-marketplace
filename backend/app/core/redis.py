import json
from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

import redis.asyncio as redis
from redis.asyncio import Redis

from app.core.config import settings


_redis_pool: redis.ConnectionPool | None = None
_redis_client: Redis | None = None


async def get_redis_pool() -> redis.ConnectionPool:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = redis.ConnectionPool.from_url(
            settings.REDIS_URL,
            encoding="utf-8",
            decode_responses=True,
            max_connections=20,
        )
    return _redis_pool


async def get_redis() -> Redis:
    global _redis_client
    if _redis_client is None:
        pool = await get_redis_pool()
        _redis_client = redis.Redis(connection_pool=pool)
    return _redis_client


async def close_redis() -> None:
    global _redis_client, _redis_pool
    if _redis_client:
        await _redis_client.close()
        _redis_client = None
    if _redis_pool:
        await _redis_pool.disconnect()
        _redis_pool = None


@asynccontextmanager
async def redis_transaction() -> AsyncGenerator[redis.client.Pipeline, None]:
    client = await get_redis()
    async with client.pipeline(transaction=True) as pipe:
        try:
            yield pipe
            await pipe.execute()
        except Exception:
            await pipe.reset()
            raise


# Rate limiting helpers
async def increment_counter(key: str, expire_seconds: int) -> int:
    client = await get_redis()
    current = await client.incr(key)
    if current == 1:
        await client.expire(key, expire_seconds)
    return current


async def get_counter(key: str) -> int:
    client = await get_redis()
    value = await client.get(key)
    return int(value) if value else 0


async def set_json(key: str, value: Any, expire_seconds: int | None = None) -> bool:
    client = await get_redis()
    return await client.set(key, json.dumps(value), ex=expire_seconds)


async def get_json(key: str) -> Any | None:
    client = await get_redis()
    value = await client.get(key)
    return json.loads(value) if value else None


async def delete_key(key: str) -> int:
    client = await get_redis()
    return await client.delete(key)


# Pub/Sub for WebSocket scaling
async def publish(channel: str, message: dict[str, Any]) -> int:
    client = await get_redis()
    return await client.publish(channel, json.dumps(message))


async def subscribe(channel: str) -> redis.client.PubSub:
    client = await get_redis()
    pubsub = client.pubsub()
    await pubsub.subscribe(channel)
    return pubsub