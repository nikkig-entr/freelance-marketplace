import pytest
from httpx import AsyncClient

from app.models.user import UserRole, UserPlan


class TestAuthRegister:
    """Tests for user registration endpoint."""

    @pytest.mark.asyncio
    async def test_register_freelancer_success(self, async_client: AsyncClient) -> None:
        """Test successful freelancer registration."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newfreelancer@example.com",
                "password": "securepassword123",
                "password_confirm": "securepassword123",
                "full_name": "New Freelancer",
                "role": "freelancer",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newfreelancer@example.com"
        assert data["full_name"] == "New Freelancer"
        assert data["role"] == "freelancer"
        assert data["plan"] == "starter"
        assert "id" in data
        assert "uuid" in data

    @pytest.mark.asyncio
    async def test_register_client_success(self, async_client: AsyncClient) -> None:
        """Test successful client registration."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "newclient@example.com",
                "password": "securepassword123",
                "password_confirm": "securepassword123",
                "full_name": "New Client",
                "role": "client",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["role"] == "client"

    @pytest.mark.asyncio
    async def test_register_duplicate_email(self, async_client: AsyncClient, test_user) -> None:
        """Test registration with duplicate email fails."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": test_user.email,
                "password": "securepassword123",
                "password_confirm": "securepassword123",
                "full_name": "Another User",
            },
        )
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_register_password_mismatch(self, async_client: AsyncClient) -> None:
        """Test registration with mismatched passwords fails."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "securepassword123",
                "password_confirm": "differentpassword",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 422

    @pytest.mark.asyncio
    async def test_register_short_password(self, async_client: AsyncClient) -> None:
        """Test registration with short password fails."""
        response = await async_client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",
                "password": "short",
                "password_confirm": "short",
                "full_name": "Test User",
            },
        )
        assert response.status_code == 422


class TestAuthLogin:
    """Tests for user login endpoint."""

    @pytest.mark.asyncio
    async def test_login_success(self, async_client: AsyncClient, test_user) -> None:
        """Test successful login."""
        response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "securepassword123",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data

    @pytest.mark.asyncio
    async def test_login_wrong_password(self, async_client: AsyncClient, test_user) -> None:
        """Test login with wrong password fails."""
        response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_login_nonexistent_user(self, async_client: AsyncClient) -> None:
        """Test login with nonexistent user fails."""
        response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": "nonexistent@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 401


class TestAuthMe:
    """Tests for getting current user info."""

    @pytest.mark.asyncio
    async def test_me_success(self, async_client: AsyncClient, auth_headers: dict) -> None:
        """Test getting current user info."""
        response = await async_client.get("/api/v1/auth/me", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["role"] == "freelancer"

    @pytest.mark.asyncio
    async def test_me_unauthorized(self, async_client: AsyncClient) -> None:
        """Test getting user info without auth fails."""
        response = await async_client.get("/api/v1/auth/me")
        assert response.status_code == 401


class TestAuthRefresh:
    """Tests for token refresh."""

    @pytest.mark.asyncio
    async def test_refresh_success(self, async_client: AsyncClient, test_user) -> None:
        """Test successful token refresh."""
        # First login to get refresh token
        login_response = await async_client.post(
            "/api/v1/auth/login",
            json={
                "email": test_user.email,
                "password": "securepassword123",
            },
        )
        refresh_token = login_response.cookies.get("refresh_token")
        assert refresh_token

        # Refresh using cookie
        response = await async_client.post(
            "/api/v1/auth/refresh",
            cookies={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data


class TestAuthLogout:
    """Tests for logout."""

    @pytest.mark.asyncio
    async def test_logout_success(self, async_client: AsyncClient, auth_headers: dict) -> None:
        """Test successful logout."""
        response = await async_client.post("/api/v1/auth/logout", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["message"] == "Logged out successfully"