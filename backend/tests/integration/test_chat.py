import pytest
from httpx import AsyncClient
from app.main import app
from app.models.message import MessageType


class TestChatEndpoints:
    """Integration tests for chat endpoints."""

    @pytest.mark.asyncio
    async def test_get_messages(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test getting project messages."""
        # Create project and bid
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Chat Project",
            "description": "Description with enough characters for validation",
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
            "cover_letter": "My bid with enough characters for validation",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        # Accept bid to enable chat
        await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        # Get messages
        response = await async_client.get(f"/api/v1/projects/{project_uuid}/messages", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data

    @pytest.mark.asyncio
    async def test_send_message(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test sending a message."""
        # Setup project with accepted bid
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Chat Project",
            "description": "Description with enough characters for validation",
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
            "cover_letter": "My bid with enough characters for validation",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        # Send message as freelancer
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/messages", json={
            "content": "Hello! I'm ready to start working on this project.",
            "message_type": "text",
        }, headers=auth_headers)

        assert response.status_code == 201
        data = response.json()
        assert data["content"] == "Hello! I'm ready to start working on this project."
        assert data["message_type"] == "text"
        assert data["sender_id"] == test_user.id

    @pytest.mark.asyncio
    async def test_send_message_unauthorized_user(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test user not part of project cannot send messages."""
        # Create another user
        from tests.conftest import TEST_PASSWORD_HASH
        from app.models.user import User, UserRole, UserPlan
        from app.core.security import create_access_token

        other_user = User(
            email="other@example.com",
            hashed_password=TEST_PASSWORD_HASH,
            full_name="Other User",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
            is_verified=True,
        )
        db_session.add(other_user)
        await db_session.commit()
        await db_session.refresh(other_user)

        other_token = create_access_token({
            "sub": str(other_user.id), "user_id": other_user.id,
            "role": "freelancer", "plan": "starter", "email": other_user.email
        })
        other_headers = {"Authorization": f"Bearer {other_token}"}

        # Setup project
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Chat Project",
            "description": "Description with enough characters for validation",
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
            "cover_letter": "My bid with enough characters for validation",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        # Try to send message as non-participant
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/messages", json={
            "content": "I'm not part of this project",
            "message_type": "text",
        }, headers=other_headers)

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_mark_messages_read(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test marking messages as read."""
        # Setup
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Chat Project",
            "description": "Description with enough characters for validation",
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
            "cover_letter": "My bid with enough characters for validation",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        # Client sends message
        await async_client.post(f"/api/v1/projects/{project_uuid}/messages", json={
            "content": "Client message",
            "message_type": "text",
        }, headers=client_auth_headers)

        # Freelancer marks all as read
        response = await async_client.post(f"/api/v1/projects/{project_uuid}/messages/read-all", headers=auth_headers)

        assert response.status_code == 204

    @pytest.mark.asyncio
    async def test_get_conversations(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test getting user conversations."""
        # Setup project with accepted bid and messages
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Chat Project",
            "description": "Description with enough characters for validation",
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
            "cover_letter": "My bid with enough characters for validation",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        # Send a message
        await async_client.post(f"/api/v1/projects/{project_uuid}/messages", json={
            "content": "Hello from freelancer",
            "message_type": "text",
        }, headers=auth_headers)

        # Get conversations
        response = await async_client.get("/api/v1/conversations", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1
        assert "unread_count" in data[0]
        assert "project_title" in data[0]

    @pytest.mark.asyncio
    async def test_get_unread_count_via_conversations(self, async_client, db_session, test_user, test_client_user, auth_headers, client_auth_headers):
        """Test getting unread message count via conversations endpoint."""
        # Setup
        project_response = await async_client.post("/api/v1/projects", json={
            "title": "Chat Project",
            "description": "Description with enough characters for validation",
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
            "cover_letter": "My bid with enough characters for validation",
        }, headers=auth_headers)
        bid_id = bid_response.json()["id"]

        await async_client.post(f"/api/v1/bids/{bid_id}/accept", headers=client_auth_headers)

        # Client sends message
        await async_client.post(f"/api/v1/projects/{project_uuid}/messages", json={
            "content": "Unread message",
            "message_type": "text",
        }, headers=client_auth_headers)

        # Get unread count via conversations
        response = await async_client.get("/api/v1/conversations", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Sum unread counts from all conversations
        total_unread = sum(conv["unread_count"] for conv in data)
        assert total_unread >= 1