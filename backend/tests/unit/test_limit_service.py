import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from app.services.limit_service import LimitService
from app.models.user import User, UserPlan


class TestLimitService:
    """Tests for the LimitService class."""

    @pytest.fixture
    def mock_redis(self):
        """Create a mock Redis client."""
        mock = MagicMock()
        mock.get = AsyncMock(return_value=None)
        mock.set = AsyncMock(return_value=True)
        mock.incr = AsyncMock(return_value=1)
        mock.expire = AsyncMock(return_value=True)
        mock.ttl = AsyncMock(return_value=604800)
        mock.delete = AsyncMock(return_value=True)
        return mock

    @pytest.fixture
    def limit_service(self, mock_redis):
        """Create a LimitService instance with mocked Redis."""
        with patch('app.services.limit_service.get_redis', return_value=mock_redis):
            with patch('app.services.limit_service.get_counter') as mock_get_counter:
                with patch('app.services.limit_service.incr_counter') as mock_incr_counter:
                    mock_get_counter.side_effect = lambda key: 0
                    mock_incr_counter.side_effect = lambda key, expire_seconds: 1
                    service = LimitService()
                    service.redis = mock_redis
                    return service

    @pytest.fixture
    def starter_user(self):
        """Create a mock Starter user."""
        return User(
            id=1,
            email="starter@test.com",
            hashed_password="hash",
            full_name="Starter User",
            role="freelancer",
            plan=UserPlan.STARTER,
            is_active=True,
            is_verified=True,
        )

    @pytest.fixture
    def pro_user(self):
        """Create a mock Pro user."""
        return User(
            id=2,
            email="pro@test.com",
            hashed_password="hash",
            full_name="Pro User",
            role="freelancer",
            plan=UserPlan.PRO,
            is_active=True,
            is_verified=True,
        )

    @pytest.fixture
    def agency_user(self):
        """Create a mock Agency user."""
        return User(
            id=3,
            email="agency@test.com",
            hashed_password="hash",
            full_name="Agency User",
            role="freelancer",
            plan=UserPlan.AGENCY,
            is_active=True,
            is_verified=True,
        )

    @pytest.mark.asyncio
    async def test_get_bid_usage_new_user(self, limit_service, starter_user):
        """Test getting bid usage for a new user (no existing count)."""
        with patch('app.services.limit_service.get_counter', return_value=0):
            used, limit, remaining = await limit_service.get_bid_usage(starter_user)
            assert used == 0
            assert limit == 2
            assert remaining == 2

    @pytest.mark.asyncio
    async def test_get_bid_usage_existing(self, limit_service, starter_user):
        """Test getting bid usage for user with existing bids."""
        with patch('app.services.limit_service.get_counter', return_value=3):
            used, limit, remaining = await limit_service.get_bid_usage(starter_user)
            assert used == 3
            assert limit == 2
            assert remaining == 0

    @pytest.mark.asyncio
    async def test_increment_bid_count(self, limit_service, starter_user):
        """Test incrementing bid count."""
        with patch('app.services.limit_service.incr_counter', return_value=1):
            count = await limit_service.increment_bid_count(starter_user)
            assert count == 1

    @pytest.mark.asyncio
    async def test_check_bid_limit_starter_within_limit(self, limit_service, starter_user):
        """Test Starter user can place bid within limit."""
        with patch('app.services.limit_service.get_counter', return_value=1):
            allowed, limit, remaining = await limit_service.check_bid_limit(starter_user)
            assert allowed is True
            assert limit == 2
            assert remaining == 1

    @pytest.mark.asyncio
    async def test_check_bid_limit_starter_at_limit(self, limit_service, starter_user):
        """Test Starter user cannot place bid at limit."""
        with patch('app.services.limit_service.get_counter', return_value=2):
            allowed, limit, remaining = await limit_service.check_bid_limit(starter_user)
            assert allowed is False
            assert limit == 2
            assert remaining == 0

    @pytest.mark.asyncio
    async def test_check_bid_limit_pro_unlimited(self, limit_service, pro_user):
        """Test Pro user has unlimited bids."""
        allowed, limit, remaining = await limit_service.check_bid_limit(pro_user)
        assert allowed is True
        assert limit == -1
        assert remaining == -1

    @pytest.mark.asyncio
    async def test_check_bid_limit_agency_unlimited(self, limit_service, agency_user):
        """Test Agency user has unlimited bids."""
        allowed, limit, remaining = await limit_service.check_bid_limit(agency_user)
        assert allowed is True
        assert limit == -1
        assert remaining == -1

    @pytest.mark.asyncio
    async def test_reset_bid_limit(self, limit_service, starter_user):
        """Test resetting bid limit for user."""
        with patch('app.services.limit_service.get_redis') as mock_get_redis:
            mock_redis = AsyncMock()
            mock_redis.delete = AsyncMock(return_value=1)
            mock_get_redis.return_value = mock_redis
            result = await limit_service.reset_bid_limit(starter_user)
            assert result is True

    @pytest.mark.asyncio
    async def test_check_ai_access_starter(self, limit_service, starter_user):
        """Test Starter user cannot use AI features."""
        can_use = await limit_service.check_ai_access(starter_user)
        assert can_use is False

    @pytest.mark.asyncio
    async def test_check_ai_access_pro(self, limit_service, pro_user):
        """Test Pro user can use AI features."""
        can_use = await limit_service.check_ai_access(pro_user)
        assert can_use is True

    @pytest.mark.asyncio
    async def test_check_ai_access_agency(self, limit_service, agency_user):
        """Test Agency user can use AI features."""
        can_use = await limit_service.check_ai_access(agency_user)
        assert can_use is True

    @pytest.mark.asyncio
    async def test_check_ai_wizard_access_starter(self, limit_service, starter_user):
        """Test Starter user cannot use AI wizard."""
        can_use = await limit_service.check_ai_wizard_access(starter_user)
        assert can_use is False

    @pytest.mark.asyncio
    async def test_check_ai_wizard_access_pro(self, limit_service, pro_user):
        """Test Pro user can use AI wizard."""
        can_use = await limit_service.check_ai_wizard_access(pro_user)
        assert can_use is True

    @pytest.mark.asyncio
    async def test_get_redis_key_format(self, limit_service):
        """Test Redis key format."""
        key = limit_service._get_bid_limit_key(123)
        # Should be in format: bid_limit:user_id:year:week
        assert key.startswith("bid_limit:123:")
        parts = key.split(":")
        assert len(parts) == 4
        assert parts[1] == "123"