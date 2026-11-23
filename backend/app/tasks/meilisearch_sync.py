import logging
from typing import Any

import meilisearch

from app.tasks.celery_app import celery_app
from app.core.config import settings
from app.core.database import get_db_context
from app.models.project import Project, ProjectStatus

logger = logging.getLogger(__name__)


def get_meilisearch_client() -> meilisearch.Client | None:
    """Get Meilisearch client if configured."""
    if not settings.MEILISEARCH_URL or not settings.MEILISEARCH_API_KEY:
        return None
    return meilisearch.Client(settings.MEILISEARCH_URL, settings.MEILISEARCH_API_KEY)


@celery_app.task(name="app.tasks.meilisearch_sync.sync_projects_to_meilisearch")
async def sync_projects_to_meilisearch() -> dict:
    """
    Sync open projects to Meilisearch for search functionality.
    Runs every 15 minutes.
    """
    client = get_meilisearch_client()
    if not client:
        logger.info("Meilisearch not configured, skipping sync")
        return {"status": "skipped", "reason": "meilisearch_not_configured"}

    try:
        index = client.index("projects")

        async with get_db_context() as db:
            from sqlalchemy import select
            result = await db.execute(
                select(Project)
                .where(Project.status == ProjectStatus.OPEN)
                .order_by(Project.created_at.desc())
            )
            projects = result.scalars().all()

            documents = []
            for project in projects:
                documents.append({
                    "id": project.id,
                    "uuid": project.uuid,
                    "title": project.title,
                    "description": project.description,
                    "category": project.category,
                    "subcategory": project.subcategory,
                    "tags": project.tags,
                    "required_skills": project.required_skills,
                    "budget_min": project.budget_min,
                    "budget_max": project.budget_max,
                    "is_fixed_price": project.is_fixed_price,
                    "deadline": project.deadline.isoformat() if project.deadline else None,
                    "experience_level": project.experience_level,
                    "english_level": project.english_level,
                    "is_featured": project.is_featured,
                    "is_urgent": project.is_urgent,
                    "client_id": project.client_id,
                    "bids_count": project.bids_count,
                    "views_count": project.views_count,
                    "created_at": project.created_at.isoformat(),
                    "updated_at": project.updated_at.isoformat(),
                })

            if documents:
                # Update documents in batches
                batch_size = 100
                for i in range(0, len(documents), batch_size):
                    batch = documents[i:i + batch_size]
                    index.add_documents(batch)

            logger.info(f"Synced {len(documents)} projects to Meilisearch")
            return {"synced": len(documents), "status": "completed"}

    except Exception as e:
        logger.error(f"Meilisearch sync failed: {e}")
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="app.tasks.meilisearch_sync.remove_project_from_meilisearch")
async def remove_project_from_meilisearch(project_id: int) -> dict:
    """Remove a project from Meilisearch index."""
    client = get_meilisearch_client()
    if not client:
        return {"status": "skipped", "reason": "meilisearch_not_configured"}

    try:
        index = client.index("projects")
        index.delete_document(project_id)
        logger.info(f"Removed project {project_id} from Meilisearch")
        return {"status": "completed"}
    except Exception as e:
        logger.error(f"Failed to remove project from Meilisearch: {e}")
        return {"status": "failed", "error": str(e)}


@celery_app.task(name="app.tasks.meilisearch_sync.update_project_in_meilisearch")
async def update_project_in_meilisearch(project_id: int) -> dict:
    """Update a single project in Meilisearch."""
    client = get_meilisearch_client()
    if not client:
        return {"status": "skipped", "reason": "meilisearch_not_configured"}

    try:
        async with get_db_context() as db:
            from sqlalchemy import select
            result = await db.execute(
                select(Project).where(Project.id == project_id)
            )
            project = result.scalar_one_or_none()
            if not project:
                return {"status": "not_found"}

            index = client.index("projects")
            document = {
                "id": project.id,
                "uuid": project.uuid,
                "title": project.title,
                "description": project.description,
                "category": project.category,
                "subcategory": project.subcategory,
                "tags": project.tags,
                "required_skills": project.required_skills,
                "budget_min": project.budget_min,
                "budget_max": project.budget_max,
                "is_fixed_price": project.is_fixed_price,
                "deadline": project.deadline.isoformat() if project.deadline else None,
                "experience_level": project.experience_level,
                "english_level": project.english_level,
                "is_featured": project.is_featured,
                "is_urgent": project.is_urgent,
                "client_id": project.client_id,
                "bids_count": project.bids_count,
                "views_count": project.views_count,
                "created_at": project.created_at.isoformat(),
                "updated_at": project.updated_at.isoformat(),
            }

            index.add_documents([document])
            logger.info(f"Updated project {project_id} in Meilisearch")
            return {"status": "completed"}

    except Exception as e:
        logger.error(f"Failed to update project in Meilisearch: {e}")
        return {"status": "failed", "error": str(e)}