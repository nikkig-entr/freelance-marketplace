from typing import List, Dict, Any, Optional
import asyncio
import meilisearch
from meilisearch.errors import MeilisearchApiError
from app.core.config import get_settings
from app.models.project import Project, ProjectStatus

settings = get_settings()

# Index name
PROJECTS_INDEX = "projects"


class MeiliSearchClient:
    """Meilisearch client wrapper for project search."""

    def __init__(self):
        self.client = meilisearch.Client(
            settings.MEILISEARCH_URL,
            settings.MEILISEARCH_API_KEY,
        )
        self._index = None

    @property
    def index(self):
        """Get or create projects index."""
        if self._index is None:
            self._index = self.client.index(PROJECTS_INDEX)
        return self._index

    async def setup_index(self) -> None:
        """Create and configure the projects index."""
        try:
            # Create index if not exists
            await asyncio.to_thread(self.client.create_index, PROJECTS_INDEX, {"primaryKey": "id"})
        except MeilisearchApiError:
            pass  # Index already exists

        # Configure index settings
        await self._configure_index()

    async def _configure_index(self) -> None:
        """Configure searchable attributes, filters, sorting."""
        settings_update = {
            "searchableAttributes": [
                "title",
                "description",
                "category",
                "tags",
                "required_skills",
                "client_name",
            ],
            "filterableAttributes": [
                "status",
                "category",
                "required_skills",
                "budget_min",
                "budget_max",
                "is_fixed_price",
                "client_id",
                "experience_level",
            ],
            "sortableAttributes": [
                "created_at",
                "updated_at",
                "budget_min",
                "budget_max",
                "views_count",
                "bids_count",
            ],
            "rankingRules": [
                "words",
                "typo",
                "proximity",
                "attribute",
                "sort",
                "exactness",
            ],
            "pagination": {
                "maxTotalHits": 1000,
            },
        }
        await asyncio.to_thread(self.index.update_settings, settings_update)

    def _project_to_document(self, project: Project) -> Dict[str, Any]:
        """Convert Project model to Meilisearch document."""
        return {
            "id": project.id,
            "client_id": project.client_id,
            "client_name": getattr(project.client, "full_name", "") if project.client else "",
            "title": project.title,
            "description": project.description,
            "category": project.category,
            "subcategory": project.subcategory or "",
            "tags": project.tags or [],
            "budget_min": project.budget_min,
            "budget_max": project.budget_max,
            "is_fixed_price": project.is_fixed_price,
            "estimated_duration_days": project.estimated_duration_days,
            "deadline": project.deadline.isoformat() if project.deadline else "",
            "status": project.status.value,
            "required_skills": project.required_skills or [],
            "experience_level": project.experience_level,
            "english_level": project.english_level,
            "is_featured": project.is_featured,
            "is_urgent": project.is_urgent,
            "selected_freelancer_id": project.selected_freelancer_id,
            "views_count": project.views_count,
            "bids_count": project.bids_count,
            "created_at": project.created_at.isoformat() if project.created_at else "",
            "updated_at": project.updated_at.isoformat() if project.updated_at else "",
            "published_at": project.published_at.isoformat() if project.published_at else "",
        }

    async def index_project(self, project: Project) -> Dict[str, Any]:
        """Add or update a project in the index."""
        document = self._project_to_document(project)
        return await asyncio.to_thread(self.index.add_documents, [document])

    async def index_projects(self, projects: List[Project]) -> Dict[str, Any]:
        """Bulk index multiple projects."""
        documents = [self._project_to_document(p) for p in projects]
        return await asyncio.to_thread(self.index.add_documents, documents)

    async def delete_project(self, project_id: int) -> Dict[str, Any]:
        """Remove a project from the index."""
        return await asyncio.to_thread(self.index.delete_document, project_id)

    async def search(
        self,
        query: str = "",
        filters: Optional[str] = None,
        sort: Optional[List[str]] = None,
        limit: int = 20,
        offset: int = 0,
        attributes_to_retrieve: Optional[List[str]] = None,
    ) -> Dict[str, Any]:
        """
        Search projects.

        Args:
            query: Search query string
            filters: Filter string (e.g., "status = open AND required_skills = ['python']")
            sort: Sort fields (e.g., ["created_at:desc", "budget_min:asc"])
            limit: Results per page
            offset: Pagination offset
            attributes_to_retrieve: Fields to return
        """
        search_params: Dict[str, Any] = {
            "q": query,
            "limit": limit,
            "offset": offset,
        }

        if filters:
            search_params["filter"] = filters
        if sort:
            search_params["sort"] = sort
        if attributes_to_retrieve:
            search_params["attributesToRetrieve"] = attributes_to_retrieve

        return await asyncio.to_thread(self.index.search, **search_params)

    async def get_facets(self, facet_names: List[str]) -> Dict[str, Any]:
        """Get facet distribution for filters."""
        return await asyncio.to_thread(self.index.search, "", {"facets": facet_names, "limit": 0})

    async def reindex_all(self, projects: List[Project]) -> Dict[str, Any]:
        """Full reindex of all projects."""
        # Clear index
        await asyncio.to_thread(self.index.delete_all_documents)
        # Re-index
        return await self.index_projects(projects)


# Global client instance
_meilisearch_client: Optional[MeiliSearchClient] = None


def get_meilisearch_client() -> MeiliSearchClient:
    """Get or create Meilisearch client."""
    global _meilisearch_client
    if _meilisearch_client is None:
        _meilisearch_client = MeiliSearchClient()
    return _meilisearch_client


async def init_meilisearch() -> None:
    """Initialize Meilisearch index on startup."""
    client = get_meilisearch_client()
    await client.setup_index()


async def close_meilisearch() -> None:
    """Close Meilisearch connections."""
    global _meilisearch_client
    _meilisearch_client = None