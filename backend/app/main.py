import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from app.api.v1 import auth, projects, bids, chat, balance, ai, billing, admin
from app.core.config import settings
from app.core.database import close_db, init_db
from app.core.redis import close_redis
from app.core.websocket import manager
from app.core.meilisearch import init_meilisearch, close_meilisearch

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler."""
    # Startup
    logger.info("Starting up Freelance Marketplace API...")
    await init_db()
    await manager.start_listener()
    await init_meilisearch()
    logger.info("Database initialized, WebSocket manager started, Meilisearch index ready")

    yield

    # Shutdown
    logger.info("Shutting down Freelance Marketplace API...")
    await manager.shutdown()
    await close_redis()
    await close_db()
    await close_meilisearch()
    logger.info("Cleanup complete")


app = FastAPI(
    title="Freelance Marketplace API",
    description="A modern freelance marketplace platform with AI-powered features",
    version="0.1.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url="/openapi.json" if settings.DEBUG else None,
    lifespan=lifespan,
)

# Security middleware
if not settings.DEBUG:
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=settings.ALLOWED_HOSTS)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)


# Global exception handlers
@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError) -> JSONResponse:
    logger.error(f"Database error: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Database error occurred", "type": "database_error"},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.error(f"Unhandled error: {exc}", exc_info=True)
    if settings.DEBUG:
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "type": type(exc).__name__},
        )
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "type": "internal_error"},
    )


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check() -> dict:
    """Health check endpoint for load balancers."""
    return {
        "status": "healthy",
        "service": "freelance-marketplace-api",
        "version": "0.1.0",
    }


# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(balance.router, prefix="/api/v1")
app.include_router(bids.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(ai.router, prefix="/api/v1")
app.include_router(billing.router, prefix="/api/v1")
app.include_router(admin.router, prefix="/api/v1")


# Root endpoint
@app.get("/", tags=["root"])
async def root() -> dict:
    """Root endpoint with API info."""
    return {
        "name": "Freelance Marketplace API",
        "version": "0.1.0",
        "docs": "/docs" if settings.DEBUG else "disabled",
        "health": "/health",
    }