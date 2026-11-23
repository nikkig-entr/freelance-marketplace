from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

celery_app = Celery(
    "freelance_marketplace",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
    include=[
        "app.tasks.weekly_reset",
        "app.tasks.notifications",
        "app.tasks.meilisearch_sync",
    ],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes
    task_soft_time_limit=25 * 60,  # 25 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    result_expires=3600,  # 1 hour
    beat_schedule={
        "reset-weekly-bid-limits": {
            "task": "app.tasks.weekly_reset.reset_weekly_bid_limits",
            "schedule": crontab(hour=0, minute=0, day_of_week=0),  # Sunday midnight UTC
        },
        "send-daily-notifications": {
            "task": "app.tasks.notifications.send_daily_notifications",
            "schedule": crontab(hour=9, minute=0),  # 9 AM UTC daily
        },
        "sync-meilisearch": {
            "task": "app.tasks.meilisearch_sync.sync_projects_to_meilisearch",
            "schedule": crontab(minute="*/15"),  # Every 15 minutes
        },
        "cleanup-expired-tokens": {
            "task": "app.tasks.weekly_reset.cleanup_expired_tokens",
            "schedule": crontab(hour=2, minute=0),  # 2 AM UTC daily
        },
    },
)

# Auto-discover tasks
celery_app.autodiscover_tasks(["app.tasks"])


@celery_app.task(bind=True, ignore_result=True)
def debug_task(self) -> None:
    print(f"Request: {self.request!r}")