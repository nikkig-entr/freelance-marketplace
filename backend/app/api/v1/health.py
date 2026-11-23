from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
import redis.asyncio as redis
import meilisearch
from app.core.database import get_db
from app.core.config import get_settings
from app.core.redis import get_redis
from app.core.meilisearch import get_meilisearch_client
from app.schemas.health import HealthResponse, ReadinessResponse

router = APIRouter()
settings = get_settings()


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)):
    """Health check endpoint."""
    checks = {}
    overall_status = "healthy"

    # Database check
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["database"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "unhealthy"

    # Redis check
    try:
        redis_client = await get_redis()
        await redis_client.ping()
        checks["redis"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["redis"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "degraded" if overall_status == "healthy" else "unhealthy"

    # Meilisearch check
    try:
        client = get_meilisearch_client()
        client.health()
        checks["meilisearch"] = {"status": "healthy", "message": "Connected"}
    except Exception as e:
        checks["meilisearch"] = {"status": "unhealthy", "message": str(e)}
        overall_status = "degraded" if overall_status == "healthy" else "unhealthy"

    # MinIO check (optional - skip if not configured)
    checks["minio"] = {"status": "unknown", "message": "Not checked"}

    return HealthResponse(
        status=overall_status,
        version="0.1.0",
        environment="development" if settings.DEBUG else "production",
        timestamp=__import__("datetime").datetime.utcnow().isoformat(),
        checks=checks,
    )


@router.get("/ready", response_model=ReadinessResponse)
async def readiness_check(db: AsyncSession = Depends(get_db)):
    """Readiness check for Kubernetes."""
    checks = {}

    # Database
    try:
        await db.execute(text("SELECT 1"))
        checks["database"] = True
    except Exception:
        checks["database"] = False

    # Redis
    try:
        redis_client = await get_redis()
        await redis_client.ping()
        checks["redis"] = True
    except Exception:
        checks["redis"] = False

    # Meilisearch
    try:
        client = get_meilisearch_client()
        client.health()
        checks["meilisearch"] = True
    except Exception:
        checks["meilisearch"] = False

    ready = all(checks.values())

    return ReadinessResponse(ready=ready, checks=checks)