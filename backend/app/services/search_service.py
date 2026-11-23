from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.project import Project, ProjectStatus
from app.core.meilisearch import get_meilisearch_client, init_meilisearch

import logging

logger = logging.getLogger(__name__)


class SearchService:
    """Service for Meilisearch operations."""

    @staticmethod
    async def index_project(project: Project) -> Dict[str, Any]:
        """Index a single project."""
        try:
            client = get_meilisearch_client()
            return await client.index_project(project)
        except Exception as e:
            logger.error(f"Failed to index project {project.id}: {e}")
            return {"error": str(e)}

    @staticmethod
    async def index_projects(projects: List[Project]) -> Dict[str, Any]:
        """Bulk index projects."""
        try:
            client = get_meilisearch_client()
            return await client.index_projects(projects)
        except Exception as e:
            logger.error(f"Failed to bulk index projects: {e}")
            return {"error": str(e)}

    @staticmethod
    async def delete_project(project_id: int) -> Dict[str, Any]:
        """Remove project from index."""
        try:
            client = get_meilisearch_client()
            return await client.delete_project(project_id)
        except Exception as e:
            logger.error(f"Failed to delete project {project_id} from index: {e}")
            return {"error": str(e)}

    @staticmethod
    async def search_projects(
        query: str = "",
        filters: Optional[str] = None,
        sort: Optional[List[str]] = None,
        limit: int = 20,
        offset: int = 0,
        attributes: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """Search projects with filters and sorting."""
        try:
            client = get_meilisearch_client()
            return await client.search(
                query=query,
                filters=filters,
                sort=sort,
                limit=limit,
                offset=offset,
                attributes_to_retrieve=attributes,
            )
        except Exception as e:
            logger.error(f"Search failed: {e}")
            return {"hits": [], "total": 0, "error": str(e)}

    @staticmethod
    async def get_facets(facet_names: List[str]) -> Dict[str, Any]:
        """Get facet distribution for filters."""
        try:
            client = get_meilisearch_client()
            return await client.get_facets(facet_names)
        except Exception as e:
            logger.error(f"Facets failed: {e}")
            return {"facetsDistribution": {}, "error": str(e)}

    @staticmethod
    async def rebuild_index(db: AsyncSession) -> Dict[str, Any]:
        """Full reindex of all projects."""
        try:
            # Get all projects
            result = await db.execute(
                select(Project).where(Project.status != ProjectStatus.DRAFT)
            )
            projects = result.scalars().all()

            client = get_meilisearch_client()
            return await client.reindex_all(list(projects))
        except Exception as e:
            logger.error(f"Reindex failed: {e}")
            return {"error": str(e)}

    @staticmethod
    def build_filters(
        status: Optional[str] = None,
        category_id: Optional[int] = None,
        skills: Optional[List[str]] = None,
        budget_min: Optional[int] = None,
        budget_max: Optional[int] = None,
        is_fixed_price: Optional[bool] = None,
    ) -> Optional[str]:
        """Build Meilisearch filter string."""
        filters = []

        if status:
            filters.append(f"status = {status}")

        if category_id:
            filters.append(f"category_id = {category_id}")

        if skills:
            # Meilisearch array contains filter
            skill_filters = " OR ".join([f"skills = '{s}'" for s in skills])
            filters.append(f"({skill_filters})")

        if budget_min is not None:
            filters.append(f"budget_min >= {budget_min}")

        if budget_max is not None:
            filters.append(f"budget_max <= {budget_max}")

        if is_fixed_price is not None:
            filters.append(f"is_fixed_price = {str(is_fixed_price).lower()}")

        return " AND ".join(filters) if filters else None

    @staticmethod
    def build_sort(sort_by: str, sort_order: str = "desc") -> List[str]:
        """Build sort array."""
        valid_fields = ["created_at", "updated_at", "budget_min", "budget_max", "view_count", "bid_count"]
        if sort_by not in valid_fields:
            sort_by = "created_at"
        if sort_order not in ["asc", "desc"]:
            sort_order = "desc"
        return [f"{sort_by}:{sort_order}"]


async def sync_project_to_search(project: Project) -> None:
    """Sync single project to Meilisearch (for Celery task)."""
    await SearchService.index_project(project)


async def sync_all_projects_to_search(db: AsyncSession) -> None:
    """Sync all projects to Meilisearch (for Celery beat)."""
    await SearchService.rebuild_index(db)