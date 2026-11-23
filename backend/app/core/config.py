from functools import lru_cache
from typing import Literal

from pydantic import AnyHttpUrl, EmailStr, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic_core import Url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # App
    APP_NAME: str = "Freelance Marketplace"
    DEBUG: bool = False
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str
    DATABASE_URL_TEST: str = "sqlite+aiosqlite:///./test.db"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    BCRYPT_ROUNDS: int = 12

    # URLs
    FRONTEND_URL: AnyHttpUrl = "http://localhost:5173"
    BACKEND_URL: AnyHttpUrl = "http://localhost:8000"
    CORS_ORIGINS: list[AnyHttpUrl] = ["http://localhost:5173"]
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]

    # Stripe
    STRIPE_SECRET_KEY: str | None = None
    STRIPE_PUBLISHABLE_KEY: str | None = None
    STRIPE_WEBHOOK_SECRET: str | None = None
    STRIPE_PRICE_PRO: str | None = None
    STRIPE_PRICE_AGENCY: str | None = None
    STRIPE_SUCCESS_URL: str = "/settings/billing?success=true"
    STRIPE_CANCEL_URL: str = "/pricing?canceled=true"

    # AI
    OPENAI_API_KEY: str | None = None
    ANTHROPIC_API_KEY: str | None = None
    AI_MODEL: str = "gpt-4o-mini"

    # Meilisearch
    MEILISEARCH_URL: str = "http://localhost:7700"
    MEILISEARCH_API_KEY: str = "masterKey"

    # MinIO
    MINIO_ENDPOINT: str = "localhost:9000"
    MINIO_ACCESS_KEY: str = "minioadmin"
    MINIO_SECRET_KEY: str = "minioadmin"
    MINIO_BUCKET: str = "freelance"
    MINIO_SECURE: bool = False
    MINIO_PUBLIC_URL: str = "http://localhost:9000/freelance"

    # Celery
    CELERY_BROKER_URL: str = "redis://localhost:6379/1"
    CELERY_RESULT_BACKEND: str = "redis://localhost:6379/2"

    # Telegram Notifications
    TELEGRAM_NOTIFY_BOT_TOKEN: str | None = None
    TELEGRAM_NOTIFY_CHAT_ID: str | None = None

    # OAuth - Google
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None

    # OAuth - GitHub
    GITHUB_CLIENT_ID: str | None = None
    GITHUB_CLIENT_SECRET: str | None = None

    # OAuth - Telegram
    TELEGRAM_BOT_TOKEN: str | None = None
    TELEGRAM_BOT_USERNAME: str | None = None

    # Email
    SMTP_HOST: str | None = None
    SMTP_PORT: int = 587
    SMTP_USER: str | None = None
    SMTP_PASSWORD: str | None = None
    EMAIL_FROM: EmailStr | None = None
    EMAIL_FROM_NAME: str = "Freelance Marketplace"

    # Plan Limits
    PLAN_LIMITS: dict = {
        "starter": {
            "bids_per_week": 2,
            "commission_pct": 5,
            "ai_matching": False,
            "team_seats": 1,
        },
        "pro": {
            "bids_per_week": -1,
            "commission_pct": 3,
            "ai_matching": True,
            "team_seats": 1,
        },
        "agency": {
            "bids_per_week": -1,
            "commission_pct": 2,
            "ai_matching": True,
            "team_seats": 5,
        },
    }

    # Week settings
    WEEK_START_MONDAY: bool = True

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        if isinstance(v, str):
            if v.startswith("["):
                return v
            return [url.strip() for url in v.split(",")]
        return v

    def get_bid_limit(self, plan: str) -> int:
        """Get bid limit for a plan."""
        return self.PLAN_LIMITS.get(plan, {}).get("bids_per_week", 2)

    def get_active_projects_limit(self, plan: str) -> int:
        """Get active projects limit for a plan."""
        limits = {"starter": 3, "pro": 10, "agency": -1}
        return limits.get(plan, 3)

    def has_ai_access(self, plan: str) -> bool:
        """Check if plan has AI access."""
        return self.PLAN_LIMITS.get(plan, {}).get("ai_matching", False)

    def has_ai_wizard(self, plan: str) -> bool:
        """Check if plan has AI wizard access."""
        return self.PLAN_LIMITS.get(plan, {}).get("ai_matching", False)


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()

UserRole = Literal["freelancer", "client", "admin"]
UserPlan = Literal["starter", "pro", "agency"]
ProjectStatus = Literal["draft", "open", "in_progress", "completed", "cancelled", "disputed"]
BidStatus = Literal["pending", "accepted", "rejected", "withdrawn"]
TransactionType = Literal["deposit", "withdrawal", "project_payment", "commission", "refund", "bonus"]
WithdrawalStatus = Literal["pending", "approved", "rejected", "completed", "failed"]
MessageType = Literal["user", "system", "file"]