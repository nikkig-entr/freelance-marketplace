import pytest
from httpx import AsyncClient
from app.main import app


class TestAuthEndpoints:
    """Integration tests for authentication endpoints."""

    @pytest.mark.asyncio
    async def test_register_freelancer(self, async_client, db_session):
        """Test registering a new freelancer."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "newfreelancer@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "full_name": "New Freelancer",
            "role": "freelancer",
        })

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newfreelancer@example.com"
        assert data["full_name"] == "New Freelancer"
        assert data["role"] == "freelancer"
        assert data["plan"] == "starter"
        # Register returns user object, not tokens (login returns tokens)
        assert "id" in data
        assert "uuid" in data

    @pytest.mark.asyncio
    async def test_register_client(self, async_client, db_session):
        """Test registering a new client."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "newclient@example.com",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "full_name": "New Client",
            "role": "client",
        })

        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "client"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, async_client, db_session, test_user):
        """Test registering with duplicate email fails."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": test_user.email,
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "full_name": "Another User",
            "role": "freelancer",
        })

        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_invalid_email(self, async_client, db_session):
        """Test registering with invalid email."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "invalid-email",
            "password": "SecurePass123!",
            "password_confirm": "SecurePass123!",
            "full_name": "Test User",
            "role": "freelancer",
        })

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_weak_password(self, async_client, db_session):
        """Test registering with weak password."""
        response = await async_client.post("/api/v1/auth/register", json={
            "email": "test@example.com",
            "password": "weak",
            "password_confirm": "weak",
            "full_name": "Test User",
            "role": "freelancer",
        })

        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_login_success(self, async_client, db_session, test_user):
        """Test successful login."""
        response = await async_client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": "securepassword123",
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client, db_session, test_user):
        """Test login with wrong password."""
        response = await async_client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": "WrongPassword123!",
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client, db_session):
        """Test login with nonexistent user."""
        response = await async_client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "SecurePass123!",
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_token(self, async_client, db_session, test_user):
        """Test refreshing access token."""
        # First get a refresh token by logging in
        login_response = await async_client.post("/api/v1/auth/login", json={
            "email": test_user.email,
            "password": "securepassword123",
        })
        refresh_token = login_response.json()["refresh_token"]

        response = await async_client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token,
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    @pytest.mark.asyncio
    async def test_refresh_token_invalid(self, async_client, db_session):
        """Test refreshing with invalid token."""
        response = await async_client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid.token.string",
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_get_current_user(self, async_client, db_session, test_user, auth_headers):
        """Test getting current user profile."""
        response = await async_client.get("/api/v1/auth/me", headers=auth_headers)

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == test_user.id
        assert data["email"] == test_user.email

    @pytest.mark.asyncio
    async def test_get_current_user_unauthorized(self, async_client, db_session):
        """Test getting current user without auth."""
        response = await async_client.get("/api/v1/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_forgot_password(self, async_client, db_session, test_user):
        """Test forgot password request."""
        response = await async_client.post("/api/v1/auth/forgot-password", json={
            "email": test_user.email,
        })

        assert response.status_code == 200
        assert "reset" in response.json()["message"].lower()

    @pytest.mark.asyncio
    async def test_forgot_password_nonexistent(self, async_client, db_session):
        """Test forgot password for nonexistent email (should not reveal)."""
        response = await async_client.post("/api/v1/auth/forgot-password", json={
            "email": "nonexistent@example.com",
        })

        # Should return success to not reveal user existence
        assert response.status_code == 200

    @pytest.mark.asyncio
    async def test_reset_password(self, async_client, db_session, test_user):
        """Test resetting password with valid token."""
        # This would require a valid reset token from forgot_password
        # For testing, we'd need to mock the token generation/verification
        pass

    @pytest.mark.asyncio
    async def test_logout(self, async_client, db_session, auth_headers):
        """Test logout (token blacklisting)."""
        response = await async_client.post("/api/v1/auth/logout", headers=auth_headers)

        assert response.status_code == 200
        assert "logged out" in response.json()["message"].lower()