import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.search_service import SearchService
from app.models.project import Project, ProjectStatus


class MockMeiliSearchClient:
    """Mock Meilisearch client wrapper with async methods."""

    def __init__(self):
        self.index_project = AsyncMock(return_value={"taskUid": 1})
        self.index_projects = AsyncMock(return_value={"taskUid": 1})
        self.delete_project = AsyncMock(return_value={"taskUid": 1})
        self.search = AsyncMock(return_value={
            "hits": [
                {"id": 1, "title": "React Project", "description": "Build a dashboard", "required_skills": ["React"]},
                {"id": 2, "title": "Python API", "description": "Build an API", "required_skills": ["Python"]},
            ],
            "totalHits": 2,
            "page": 1,
            "totalPages": 1,
        })
        self.get_facets = AsyncMock(return_value={
            "facetsDistribution": {
                "status": {"open": 10, "in_progress": 5},
                "required_skills": {"React": 8, "Python": 5},
            }
        })
        self.delete_all_documents = AsyncMock(return_value={"taskUid": 1})

    async def reindex_all(self, projects):
        await self.delete_all_documents()
        return await self.index_projects(projects)


def create_mock_client():
    """Factory function to create a fresh mock client."""
    return MockMeiliSearchClient()


class TestSearchService:
    """Tests for the SearchService class."""

    @pytest.fixture
    def mock_meilisearch_client(self):
        """Mock Meilisearch client wrapper with async methods."""
        return create_mock_client()

    @pytest.fixture
    def sample_project(self):
        """Create a sample project."""
        return Project(
            id=1,
            client_id=1,
            title="React Dashboard",
            description="Build a modern dashboard",
            category="web",
            subcategory="frontend",
            tags=["React", "TypeScript"],
            budget_min=50000,
            budget_max=100000,
            is_fixed_price=True,
            estimated_duration_days=14,
            deadline=None,
            status=ProjectStatus.OPEN,
            required_skills=["React", "TypeScript"],
            experience_level="mid",
            english_level="fluent",
            is_featured=False,
            is_urgent=False,
            selected_freelancer_id=None,
            views_count=10,
            bids_count=2,
        )

    @pytest.mark.asyncio
    async def test_index_project(self, mock_meilisearch_client, sample_project):
        """Test indexing a project."""
        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            result = await SearchService.index_project(sample_project)

        assert result == {"taskUid": 1}
        # Can't assert on mock methods since it's a factory

    @pytest.mark.asyncio
    async def test_index_projects_bulk(self, mock_meilisearch_client, sample_project):
        """Test bulk indexing projects."""
        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            result = await SearchService.index_projects([sample_project, sample_project])

        assert result == {"taskUid": 1}

    @pytest.mark.asyncio
    async def test_delete_project(self, mock_meilisearch_client):
        """Test removing a project from index."""
        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            result = await SearchService.delete_project(1)

        assert result == {"taskUid": 1}

    @pytest.mark.asyncio
    async def test_search_projects(self, mock_meilisearch_client):
        """Test searching projects."""
        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            results = await SearchService.search_projects(
                query="React",
                filters="status = open",
                sort=["created_at:desc"],
                limit=20,
                offset=0,
            )

        assert results["totalHits"] == 2
        assert len(results["hits"]) == 2

    @pytest.mark.asyncio
    async def test_search_projects_with_filters(self, mock_meilisearch_client):
        """Test searching projects with multiple filters."""
        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            results = await SearchService.search_projects(
                query="",
                filters="status = open AND category = web AND budget_min >= 10000",
                sort=["budget_min:asc"],
                limit=20,
                offset=0,
            )

        assert results["totalHits"] == 2

    @pytest.mark.asyncio
    async def test_search_projects_empty_results(self, mock_meilisearch_client):
        """Test searching with no results."""
        mock_client = create_mock_client()
        mock_client.search.return_value = {
            "hits": [],
            "totalHits": 0,
            "page": 1,
            "totalPages": 0,
        }

        with patch('app.services.search_service.get_meilisearch_client', return_value=mock_client):
            results = await SearchService.search_projects(
                query="nonexistent",
                filters="",
                sort=[],
                limit=10,
                offset=0,
            )

        assert results["totalHits"] == 0
        assert results["hits"] == []

    @pytest.mark.asyncio
    async def test_get_facets(self, mock_meilisearch_client):
        """Test getting facet distribution for filters."""
        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            results = await SearchService.get_facets(["status", "required_skills"])

        assert "facetsDistribution" in results
        assert "status" in results["facetsDistribution"]
        assert "required_skills" in results["facetsDistribution"]

    @pytest.mark.asyncio
    async def test_rebuild_index(self, mock_meilisearch_client, sample_project):
        """Test full reindex of all projects."""
        mock_db = MagicMock()

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = [sample_project]

        # Make execute an async mock that returns the mock_result
        mock_db.execute = AsyncMock(return_value=mock_result)

        with patch('app.services.search_service.get_meilisearch_client', create_mock_client):
            result = await SearchService.rebuild_index(mock_db)

        assert result == {"taskUid": 1}

    def test_build_filters(self):
        """Test building Meilisearch filter string."""
        filters = SearchService.build_filters(
            status="open",
            category_id=1,
            skills=["React", "TypeScript"],
            budget_min=10000,
            budget_max=50000,
            is_fixed_price=True,
        )

        assert "status = open" in filters
        assert "category_id = 1" in filters
        assert "skills = 'React'" in filters
        assert "skills = 'TypeScript'" in filters
        assert "budget_min >= 10000" in filters
        assert "budget_max <= 50000" in filters
        assert "is_fixed_price = true" in filters

    def test_build_filters_empty(self):
        """Test building filter string with no filters."""
        filters = SearchService.build_filters()
        assert filters is None

    def test_build_sort(self):
        """Test building sort array."""
        sort = SearchService.build_sort("budget_min", "asc")
        assert sort == ["budget_min:asc"]

    def test_build_sort_default(self):
        """Test building sort with defaults."""
        sort = SearchService.build_sort("invalid_field", "invalid_order")
        assert sort == ["created_at:desc"]

    def test_build_sort_valid_fields(self):
        """Test building sort with all valid fields."""
        for field in ["created_at", "updated_at", "budget_min", "budget_max", "view_count", "bid_count"]:
            sort = SearchService.build_sort(field, "desc")
            assert sort == [f"{field}:desc"]