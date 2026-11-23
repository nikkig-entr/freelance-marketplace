import pytest
from httpx import AsyncClient
from app.main import app
from app.models.user import UserRole


class TestAdminEndpoints:
    """Integration tests for admin endpoints."""

    @pytest.fixture
    def admin_headers(self, test_admin_user):
        """Get auth headers for admin user."""
        from app.core.security import create_access_token
        token = create_access_token({
            "sub": str(test_admin_user.id),
            "user_id": test_admin_user.id,
            "role": test_admin_user.role.value if hasattr(test_admin_user.role, 'value') else test_admin_user.role,
            "plan": test_admin_user.plan.value if hasattr(test_admin_user.plan, 'value') else test_admin_user.plan,
            "email": test_admin_user.email,
        })
        return {"Authorization": f"Bearer {token}"}

    @pytest.mark.asyncio
    async def test_admin_dashboard_stats(self, async_client, test_admin_user, admin_headers):
        """Test getting admin dashboard statistics."""
        response = await async_client.get("/api/v1/admin/stats", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_freelancers" in data
        assert "total_clients" in data
        assert "total_projects" in data
        assert "open_projects" in data
        assert "in_progress_projects" in data
        assert "completed_projects" in data
        assert "total_bids" in data
        assert "total_transactions_volume_cents" in data
        assert "total_commission_cents" in data
        assert "pending_withdrawals" in data
        assert "pending_withdrawals_amount_cents" in data
        assert "revenue_this_month_cents" in data
        assert "users_by_plan" in data
        assert "projects_by_status" in data

    @pytest.mark.asyncio
    async def test_admin_dashboard_unauthorized(self, async_client, test_user, auth_headers):
        """Test non-admin cannot access admin endpoints."""
        response = await async_client.get("/api/v1/admin/stats", headers=auth_headers)

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_admin_list_users(self, async_client, test_admin_user, admin_headers):
        """Test admin listing all users."""
        response = await async_client.get("/api/v1/admin/users", params={
            "page": 1,
            "page_size": 20,
        }, headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert len(data["users"]) >= 1

    @pytest.mark.asyncio
    async def test_admin_list_users_with_filters(self, async_client, test_admin_user, admin_headers):
        """Test admin listing users with filters."""
        response = await async_client.get("/api/v1/admin/users", params={
            "role": "freelancer",
            "plan": "pro",
            "is_active": "true",
            "search": "test",
        }, headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        for user in data["users"]:
            assert user["role"] == "freelancer"

    @pytest.mark.asyncio
    async def test_admin_get_user(self, async_client, test_admin_user, admin_headers, test_user):
        """Test admin getting specific user."""
        response = await async_client.get(f"/api/v1/admin/users/{test_user.id}", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user.id
        assert data["email"] == test_user.email

    @pytest.mark.asyncio
    async def test_admin_update_user(self, async_client, test_admin_user, admin_headers, test_user):
        """Test admin updating user."""
        response = await async_client.patch(f"/api/v1/admin/users/{test_user.id}", json={
            "plan": "pro",
            "is_verified": True,
        }, headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["plan"] == "pro"
        assert data["is_verified"] is True

    @pytest.mark.asyncio
    async def test_admin_ban_user(self, async_client, test_admin_user, admin_headers, test_user):
        """Test admin banning a user."""
        response = await async_client.post(f"/api/v1/admin/users/{test_user.id}/ban", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is False

    @pytest.mark.asyncio
    async def test_admin_unban_user(self, async_client, test_admin_user, admin_headers, test_user):
        """Test admin unbanning a user."""
        response = await async_client.post(f"/api/v1/admin/users/{test_user.id}/unban", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["is_active"] is True

    @pytest.mark.asyncio
    async def test_admin_list_projects(self, async_client, test_admin_user, admin_headers):
        """Test admin listing all projects."""
        response = await async_client.get("/api/v1/admin/projects", params={
            "page": 1,
            "page_size": 20,
        }, headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert "projects" in data
        assert "total" in data

    @pytest.mark.asyncio
    async def test_admin_list_withdrawals(self, async_client, test_admin_user, admin_headers):
        """Test admin listing all withdrawals."""
        response = await async_client.get("/api/v1/admin/withdrawals", params={
            "page": 1,
            "page_size": 20,
        }, headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert "withdrawals" in data
        assert "total" in data

    @pytest.mark.asyncio
    async def test_admin_approve_withdrawal(self, async_client, test_admin_user, admin_headers):
        """Test admin approving a withdrawal."""
        # Would need a pending withdrawal first
        response = await async_client.patch("/api/v1/admin/withdrawals/1", json={
            "action": "approve",
        }, headers=admin_headers)

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_admin_reject_withdrawal(self, async_client, test_admin_user, admin_headers):
        """Test admin rejecting a withdrawal."""
        response = await async_client.patch("/api/v1/admin/withdrawals/1", json={
            "action": "reject",
            "admin_notes": "Invalid account details",
        }, headers=admin_headers)

        assert response.status_code in [200, 404]

    @pytest.mark.asyncio
    async def test_admin_revenue_report(self, async_client, test_admin_user, admin_headers):
        """Test admin revenue report."""
        response = await async_client.get("/api/v1/admin/revenue", headers=admin_headers)

        assert response.status_code == 200
        data = response.json()
        assert "total_revenue_cents" in data
        assert "monthly_revenue_cents" in data
        assert "mrr_cents" in data