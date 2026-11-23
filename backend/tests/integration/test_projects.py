import pytest
from httpx import AsyncClient
from app.main import app
from app.models.project import ProjectStatus


class TestProjectEndpoints:
    """Integration tests for project endpoints."""

    @pytest.mark.asyncio
    async def test_create_project_as_client(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test creating a project as a client."""
        response = await async_client.post("/api/v1/projects", json={
            "title": "Build a React Dashboard",
            "description": "Need a modern dashboard with charts and tables",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
            "skills": ["React", "TypeScript", "Chart.js"],
        }, headers=client_auth_headers)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Build a React Dashboard"
        assert data["client_id"] == test_client_user.id
        assert data["status"] == "draft"
        assert data["budget_min"] == 50000

    @pytest.mark.asyncio
    async def test_create_project_as_freelancer_fails(self, async_client, db_session, test_user, auth_headers):
        """Test freelancer cannot create projects."""
        response = await async_client.post("/api/v1/projects", json={
            "title": "Test Project",
            "description": "Test description",
            "budget_min": 10000,
            "budget_max": 20000,
            "is_fixed_price": True,
            "deadline_days": 7,
        }, headers=auth_headers)

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_create_project_unauthorized(self, async_client, db_session):
        """Test creating project without authentication."""
        response = await async_client.post("/api/v1/projects", json={
            "title": "Test Project",
            "description": "Test description",
            "budget_min": 10000,
            "budget_max": 20000,
            "is_fixed_price": True,
            "deadline_days": 7,
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_projects_list(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test getting paginated list of projects."""
        # Create a few projects first
        for i in range(3):
            resp = await async_client.post("/api/v1/projects", json={
                "title": f"Project {i}",
                "description": f"Description for project number {i} with enough characters",
                "budget_min": 10000 + i * 10000,
                "budget_max": 20000 + i * 10000,
                "is_fixed_price": True,
                "deadline_days": 7 + i,
                "skills": ["React"],
            }, headers=client_auth_headers)
            print(f"DEBUG test: create {i} response: {resp.status_code} - {resp.json()}")

        response = await async_client.get("/api/v1/projects", params={
            "page": 1,
            "page_size": 10,
        }, headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        assert len(data["projects"]) == 3

    @pytest.mark.asyncio
    async def test_get_projects_with_filters(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test getting projects with filters."""
        # Create projects with different statuses
        await async_client.post("/api/v1/projects", json={
            "title": "Published Project",
            "description": "Published",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
            "status": "open",
        }, headers=client_auth_headers)

        response = await async_client.get("/api/v1/projects", params={
            "status": "open",
        }, headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert all(p["status"] == "open" for p in data["projects"])

    @pytest.mark.asyncio
    async def test_get_project_detail(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test getting a single project detail."""
        create_response = await async_client.post("/api/v1/projects", json={
            "title": "Detail Project",
            "description": "Detailed description",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
            "skills": ["React", "TypeScript"],
        }, headers=client_auth_headers)

        project_uuid = create_response.json()["uuid"]

        response = await async_client.get(f"/api/v1/projects/{project_uuid}", headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["uuid"] == project_uuid
        assert data["title"] == "Detail Project"

    @pytest.mark.asyncio
    async def test_get_nonexistent_project(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test getting a nonexistent project."""
        response = await async_client.get("/api/v1/projects/99999", headers=client_auth_headers)

        assert response.status_code == 404

    @pytest.mark.asyncio
    async def test_update_project_as_owner(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test updating project as owner."""
        create_response = await async_client.post("/api/v1/projects", json={
            "title": "Original Title",
            "description": "Original description",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)

        project_uuid = create_response.json()["uuid"]

        response = await async_client.patch(f"/api/v1/projects/{project_uuid}", json={
            "title": "Updated Title",
            "budget_min": 60000,
        }, headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["budget_min"] == 60000

    @pytest.mark.asyncio
    async def test_update_project_as_non_owner_fails(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test freelancer cannot update client's project."""
        create_response = await async_client.post("/api/v1/projects", json={
            "title": "Client's Project",
            "description": "Description for client project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)

        project_uuid = create_response.json()["uuid"]

        response = await async_client.patch(f"/api/v1/projects/{project_uuid}", json={
            "title": "Hacked Title",
        }, headers=auth_headers)

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_publish_project(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test publishing a project."""
        create_response = await async_client.post("/api/v1/projects", json={
            "title": "Project to Publish",
            "description": "Description for project to publish with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)

        project_uuid = create_response.json()["uuid"]

        response = await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "open"

    @pytest.mark.asyncio
    async def test_delete_project(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test deleting a project."""
        create_response = await async_client.post("/api/v1/projects", json={
            "title": "Project to Delete",
            "description": "Description for project to delete with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)

        project_uuid = create_response.json()["uuid"]

        response = await async_client.delete(f"/api/v1/projects/{project_uuid}", headers=client_auth_headers)

        assert response.status_code == 204

        # Verify it's deleted
        get_response = await async_client.get(f"/api/v1/projects/{project_uuid}", headers=client_auth_headers)
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_get_my_projects(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test getting current user's projects."""
        # Create a few projects
        for i in range(2):
            await async_client.post("/api/v1/projects", json={
                "title": f"My Project {i}",
                "description": f"Description for my project {i} with enough characters",
                "budget_min": 10000,
                "budget_max": 20000,
                "is_fixed_price": True,
                "deadline_days": 7,
            }, headers=client_auth_headers)

        response = await async_client.get("/api/v1/projects/my", headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["projects"]) == 2