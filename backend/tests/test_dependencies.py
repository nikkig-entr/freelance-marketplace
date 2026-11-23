import pytest
from unittest.mock import AsyncMock, patch
from datetime import datetime, timezone
from fastapi import HTTPException

from app.dependencies import check_bid_limit, check_ai_access, require_client, require_freelancer, require_admin
from app.models.user import User, UserRole, UserPlan


class TestCheckBidLimit:
    """Tests for bid limit checking dependency."""

    @pytest.mark.asyncio
    async def test_client_user_passes(self, test_client_user) -> None:
        """Client users should pass without limit check."""
        result = await check_bid_limit(test_client_user)
        assert result == test_client_user

    @pytest.mark.asyncio
    async def test_admin_user_passes(self, test_admin_user) -> None:
        """Admin users should pass without limit check."""
        result = await check_bid_limit(test_admin_user)
        assert result == test_admin_user

    @pytest.mark.asyncio
    async def test_agency_plan_unlimited(self) -> None:
        """Agency plan should have unlimited bids."""
        user = User(
            id=1,
            email="agency@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.AGENCY,
            is_active=True,
        )
        with patch("app.core.redis.get_counter", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = 1000
            result = await check_bid_limit(user)
            assert result == user

    @pytest.mark.asyncio
    async def test_starter_plan_within_limit(self) -> None:
        """Starter plan within limit should pass."""
        user = User(
            id=1,
            email="starter@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
        )
        with patch("app.core.redis.get_counter", new_callable=AsyncMock) as mock_get, \
             patch("app.core.redis.increment_counter", new_callable=AsyncMock) as mock_incr:
            mock_get.return_value = 1  # Within limit of 2
            mock_incr.return_value = 2
            result = await check_bid_limit(user)
            assert result == user

    @pytest.mark.asyncio
    async def test_starter_plan_exceeds_limit(self) -> None:
        """Starter plan exceeding limit should raise 429."""
        user = User(
            id=1,
            email="starter@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
        )
        with patch("app.core.redis.get_counter", new_callable=AsyncMock) as mock_get:
            mock_get.return_value = 5  # At limit of 5
            with pytest.raises(HTTPException) as exc_info:
                await check_bid_limit(user)
            assert exc_info.value.status_code == 429
            assert exc_info.value.detail["error"] == "bid_limit_exceeded"
            assert "Retry-After" in exc_info.value.headers


class TestCheckAIAccess:
    """Tests for AI access checking dependency."""

    @pytest.mark.asyncio
    async def test_pro_plan_has_access(self) -> None:
        """Pro plan should have AI access."""
        user = User(
            id=1,
            email="pro@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.PRO,
            is_active=True,
        )
        result = await check_ai_access(user)
        assert result == user

    @pytest.mark.asyncio
    async def test_agency_plan_has_access(self) -> None:
        """Agency plan should have AI access."""
        user = User(
            id=1,
            email="agency@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.AGENCY,
            is_active=True,
        )
        result = await check_ai_access(user)
        assert result == user

    @pytest.mark.asyncio
    async def test_starter_plan_denied(self) -> None:
        """Starter plan should be denied AI access."""
        user = User(
            id=1,
            email="starter@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
        )
        with pytest.raises(HTTPException) as exc_info:
            await check_ai_access(user)
        assert exc_info.value.status_code == 403
        assert exc_info.value.detail["error"] == "ai_access_denied"

    @pytest.mark.asyncio
    async def test_client_role_has_access_on_pro(self, test_client_user) -> None:
        """Client role should have AI access on Pro plan."""
        test_client_user.plan = UserPlan.PRO
        result = await check_ai_access(test_client_user)
        assert result == test_client_user

    @pytest.mark.asyncio
    async def test_client_role_denied_on_starter(self, test_client_user) -> None:
        """Client role should be denied AI access on Starter plan."""
        test_client_user.plan = UserPlan.STARTER
        with pytest.raises(HTTPException) as exc_info:
            await check_ai_access(test_client_user)
        assert exc_info.value.status_code == 403
        assert exc_info.value.detail["error"] == "ai_access_denied"


class TestRoleRequirements:
    """Tests for role-based dependencies."""

    @pytest.mark.asyncio
    async def test_require_client_success(self, test_client_user) -> None:
        """Client user should pass require_client."""
        result = await require_client(test_client_user)
        assert result == test_client_user

    @pytest.mark.asyncio
    async def test_require_client_admin_passes(self, test_admin_user) -> None:
        """Admin should pass require_client."""
        result = await require_client(test_admin_user)
        assert result == test_admin_user

    @pytest.mark.asyncio
    async def test_require_client_freelancer_fails(self) -> None:
        """Freelancer should fail require_client."""
        user = User(
            id=1,
            email="freelancer@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
        )
        with pytest.raises(HTTPException) as exc_info:
            await require_client(user)
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_require_freelancer_success(self) -> None:
        """Freelancer should pass require_freelancer."""
        user = User(
            id=1,
            email="freelancer@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
        )
        result = await require_freelancer(user)
        assert result == user

    @pytest.mark.asyncio
    async def test_require_freelancer_admin_passes(self, test_admin_user) -> None:
        """Admin should pass require_freelancer."""
        result = await require_freelancer(test_admin_user)
        assert result == test_admin_user

    @pytest.mark.asyncio
    async def test_require_freelancer_client_fails(self, test_client_user) -> None:
        """Client should fail require_freelancer."""
        with pytest.raises(HTTPException) as exc_info:
            await require_freelancer(test_client_user)
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_require_admin_success(self, test_admin_user) -> None:
        """Admin should pass require_admin."""
        result = await require_admin(test_admin_user)
        assert result == test_admin_user

    @pytest.mark.asyncio
    async def test_require_admin_freelancer_fails(self) -> None:
        """Freelancer should fail require_admin."""
        user = User(
            id=1,
            email="freelancer@example.com",
            role=UserRole.FREELANCER,
            plan=UserPlan.STARTER,
            is_active=True,
        )
        with pytest.raises(HTTPException) as exc_info:
            await require_admin(user)
        assert exc_info.value.status_code == 403