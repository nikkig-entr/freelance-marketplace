import pytest
from httpx import AsyncClient
from app.main import app
from app.models.bid import BidStatus
from app.models.user import User, UserRole, UserPlan
from app.core.security import get_password_hash, create_access_token

TEST_PASSWORD_HASH = "$2b$12$5/Tg2chAhbooYvmjYLGQjuVGsqmcH3dq6HA4.emYYsEszz/tBnZYi"  # "securepassword123"


class TestBidEndpoints:
    """Integration tests for bid endpoints."""

    @pytest.mark.asyncio
    async def test_place_bid_as_freelancer(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test placing a bid as a freelancer."""
        # First create a project as client
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project for Bidding",
            "description": "Need a developer with React experience for a modern web app",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
            "skills": ["React"],
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        # Publish the project
        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        # Place bid as freelancer
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "I can build this for you with high quality.",
        }, headers=auth_headers)

        assert response.status_code == 201
        data = response.json()
        assert data["price_cents"] == 75000
        assert data["delivery_days"] == 10
        assert data["status"] == "pending"
        assert data["freelancer_id"] == test_user.id

    @pytest.mark.asyncio
    async def test_place_bid_as_client_fails(self, async_client, db_session, test_client_user, client_auth_headers):
        """Test client cannot place bids."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 50000,
            "delivery_days": 7,
            "cover_letter": "I will do it with high quality",
        }, headers=client_auth_headers)

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_place_bid_on_draft_project_fails(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test cannot bid on draft project."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Draft Project",
            "description": "Description for draft project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        # Don't publish - keep as draft
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "Bid on draft with enough characters",
        }, headers=auth_headers)

        assert response.status_code in [400, 422], f"Expected 400 or 422, got {response.status_code}: {response.text}"
        # If 422, it's a validation error - check if it's the "not open" error
        if response.status_code == 400:
            assert "not open" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_place_duplicate_bid_fails(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test cannot place duplicate bid on same project."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        # First bid
        await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "First bid with enough characters",
        }, headers=auth_headers)

        # Second bid
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 65000,
            "delivery_days": 8,
            "cover_letter": "Second bid with enough characters",
        }, headers=auth_headers)

        assert response.status_code in [400, 422], f"Expected 400 or 422, got {response.status_code}: {response.text}"
        if response.status_code == 400:
            assert "already" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_get_project_bids_as_client(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test client can see bids on their project."""
        # Create additional freelancers
        freelancer2 = User(
            email="freelancer2@example.com",
            hashed_password=TEST_PASSWORD_HASH,
            full_name="Freelancer Two",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
            is_verified=True,
        )
        db_session.add(freelancer2)
        await db_session.commit()
        await db_session.refresh(freelancer2)

        freelancer3 = User(
            email="freelancer3@example.com",
            hashed_password=TEST_PASSWORD_HASH,
            full_name="Freelancer Three",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
            is_verified=True,
        )
        db_session.add(freelancer3)
        await db_session.commit()
        await db_session.refresh(freelancer3)

        freelancer2_token = create_access_token({
            "sub": str(freelancer2.id), "user_id": freelancer2.id,
            "role": "freelancer", "plan": "starter", "email": freelancer2.email
        })
        freelancer3_token = create_access_token({
            "sub": str(freelancer3.id), "user_id": freelancer3.id,
            "role": "freelancer", "plan": "starter", "email": freelancer3.email
        })
        freelancer2_headers = {"Authorization": f"Bearer {freelancer2_token}"}
        freelancer3_headers = {"Authorization": f"Bearer {freelancer3_token}"}

        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project with Bids",
            "description": "Description for project with bids with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        # Place multiple bids from different freelancers
        for i, (amount, headers) in enumerate([
            (75000, auth_headers),
            (80000, freelancer2_headers),
            (70000, freelancer3_headers),
        ]):
            await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
                "price_cents": amount,
                "delivery_days": 10,
                "cover_letter": f"This is my bid for {amount} cents with enough characters",
            }, headers=headers)

        # Get bids as client
        response = await async_client.get(f"/api/v1/projects/{project_uuid}/bids", headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["bids"]) == 3

    @pytest.mark.asyncio
    async def test_get_project_bids_as_freelancer_sees_own(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test freelancer sees only their own bid on project."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "This is my bid with enough characters",
        }, headers=auth_headers)

        response = await async_client.get(f"/api/v1/projects/{project_uuid}/bids", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["bids"]) == 1
        assert data["bids"][0]["freelancer_id"] == test_user.id

    @pytest.mark.asyncio
    async def test_accept_bid(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test client accepts a bid."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        bid_response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "This is my bid with enough characters",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        # Accept bid
        response = await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "accepted"

        # Project status should be in_progress
        project_response = await async_client.get(f"/api/v1/projects/{project_uuid}", headers=client_auth_headers)
        assert project_response.json()["status"] == "in_progress"

    @pytest.mark.asyncio
    async def test_reject_bid(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test client rejects a bid."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        bid_response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "This is my bid with enough characters",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        response = await async_client.post(f"/api/v1/bids/{bid_id}/reject", headers=client_auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "rejected"

    @pytest.mark.asyncio
    async def test_withdraw_bid(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test freelancer withdraws their bid."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        bid_response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 10,
            "cover_letter": "This is my bid with enough characters",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        response = await async_client.post(f"/api/v1/bids/{bid_id}/withdraw", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "withdrawn"

    @pytest.mark.asyncio
    async def test_get_my_bids(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test freelancer gets their bids."""
        # Create multiple projects and bid on them
        for i in range(2):
            project_response = await async_client.post("/api/v1/projects", json={
                "title": f"Project {i}",
                "description": f"Description for project {i} with enough characters",
                "budget_min": 50000,
                "budget_max": 100000,
                "is_fixed_price": True,
                "deadline_days": 14,
            }, headers=client_auth_headers)
            project_uuid = project_response.json()["uuid"]

            await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

            await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
                "price_cents": 75000,
                "delivery_days": 10,
                "cover_letter": f"Bid on project {i} with enough characters",
            }, headers=auth_headers)

        response = await async_client.get("/api/v1/bids/my", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert len(data["bids"]) == 2

    @pytest.mark.asyncio
    async def test_bid_amount_validation(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test bid amount validation."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        # Bid below budget_min
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 10000,  # Below 50000
            "delivery_days": 10,
            "cover_letter": "Low bid with enough characters for validation",
        }, headers=auth_headers)

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_bid_delivery_days_validation(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test bid delivery days validation."""
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Project",
            "description": "Description for project with enough characters",
            "budget_min": 50000,
            "budget_max": 100000,
            "is_fixed_price": True,
            "deadline_days": 14,
        }, headers=client_auth_headers)
        project_uuid = project_response.json()["uuid"]

        await async_client.post(f"/api/v1/projects/{project_uuid}/publish", headers=client_auth_headers)

        # Delivery days exceeding project timeline
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/bids", json={
            "price_cents": 75000,
            "delivery_days": 30,  # Exceeds 14 days
            "cover_letter": "Slow delivery with enough characters for validation",
        }, headers=auth_headers)

        assert response.status_code == 422