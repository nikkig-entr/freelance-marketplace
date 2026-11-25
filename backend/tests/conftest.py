import asyncio
from collections.abc import AsyncGenerator
from typing import Generator
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.core.config import settings
from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.main import app
from app.models.user import User, UserRole, UserPlan

# Test database URL (in-memory SQLite for tests)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

# Create test engine
test_engine = create_async_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestAsyncSessionLocal = async_sessionmaker(
    test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Create a fresh database session for each test."""
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestAsyncSessionLocal() as session:
        yield session

    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest.fixture(scope="function")
def client(db_session: AsyncSession) -> TestClient:
    """Create a test client with overridden database dependency."""
    app.dependency_overrides[get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def async_client(db_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create an async test client with overridden database dependency."""
    async def override_get_db():
        yield db_session
    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


TEST_PASSWORD_HASH = "$2b$12$5/Tg2chAhbooYvmjYLGQjuVGsqmcH3dq6HA4.emYYsEszz/tBnZYi"  # "securepassword123"


@pytest_asyncio.fixture
async def test_user(db_session: AsyncSession) -> User:
    """Create a test user instance and save to database."""
    user = User(
        email="test@example.com",
        hashed_password=TEST_PASSWORD_HASH,
        full_name="Test User",
        role=UserRole.FREELANCER,
        plan=UserPlan.STARTER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_client_user(db_session: AsyncSession) -> User:
    """Create a test client user instance and save to database."""
    user = User(
        email="client@example.com",
        hashed_password=TEST_PASSWORD_HASH,
        full_name="Test Client",
        role=UserRole.CLIENT,
        plan=UserPlan.STARTER,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_admin_user(db_session: AsyncSession) -> User:
    """Create a test admin user instance and save to database."""
    user = User(
        email="admin@example.com",
        hashed_password=TEST_PASSWORD_HASH,
        full_name="Test Admin",
        role=UserRole.ADMIN,
        plan=UserPlan.AGENCY,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_pro_client_user(db_session: AsyncSession) -> User:
    """Create a test pro plan client user instance for AI testing."""
    user = User(
        email="proclient@example.com",
        hashed_password=TEST_PASSWORD_HASH,
        full_name="Pro Client",
        role=UserRole.CLIENT,
        plan=UserPlan.PRO,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def test_pro_freelancer_user(db_session: AsyncSession) -> User:
    """Create a test pro plan freelancer user instance for AI testing."""
    user = User(
        email="profreelancer@example.com",
        hashed_password=TEST_PASSWORD_HASH,
        full_name="Pro Freelancer",
        role=UserRole.FREELANCER,
        plan=UserPlan.PRO,
        is_active=True,
        is_verified=True,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest.fixture
def auth_headers(test_user: User) -> dict[str, str]:
    """Create authorization headers with access token."""
    token = create_access_token({
        "sub": str(test_user.id),
        "user_id": test_user.id,
        "role": test_user.role.value if hasattr(test_user.role, 'value') else test_user.role,
        "plan": test_user.plan.value if hasattr(test_user.plan, 'value') else test_user.plan,
        "email": test_user.email,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def client_auth_headers(test_client_user: User) -> dict[str, str]:
    """Create authorization headers for client user."""
    token = create_access_token({
        "sub": str(test_client_user.id),
        "user_id": test_client_user.id,
        "role": test_client_user.role.value if hasattr(test_client_user.role, 'value') else test_client_user.role,
        "plan": test_client_user.plan.value if hasattr(test_client_user.plan, 'value') else test_client_user.plan,
        "email": test_client_user.email,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_auth_headers(test_admin_user: User) -> dict[str, str]:
    """Create authorization headers for admin user."""
    token = create_access_token({
        "sub": str(test_admin_user.id),
        "user_id": test_admin_user.id,
        "role": test_admin_user.role.value if hasattr(test_admin_user.role, 'value') else test_admin_user.role,
        "plan": test_admin_user.plan.value if hasattr(test_admin_user.plan, 'value') else test_admin_user.plan,
        "email": test_admin_user.email,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def pro_client_auth_headers(test_pro_client_user: User) -> dict[str, str]:
    """Create authorization headers for pro client user."""
    token = create_access_token({
        "sub": str(test_pro_client_user.id),
        "user_id": test_pro_client_user.id,
        "role": test_pro_client_user.role.value if hasattr(test_pro_client_user.role, 'value') else test_pro_client_user.role,
        "plan": test_pro_client_user.plan.value if hasattr(test_pro_client_user.plan, 'value') else test_pro_client_user.plan,
        "email": test_pro_client_user.email,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def pro_freelancer_auth_headers(test_pro_freelancer_user: User) -> dict[str, str]:
    """Create authorization headers for pro freelancer user."""
    token = create_access_token({
        "sub": str(test_pro_freelancer_user.id),
        "user_id": test_pro_freelancer_user.id,
        "role": test_pro_freelancer_user.role.value if hasattr(test_pro_freelancer_user.role, 'value') else test_pro_freelancer_user.role,
        "plan": test_pro_freelancer_user.plan.value if hasattr(test_pro_freelancer_user.plan, 'value') else test_pro_freelancer_user.plan,
        "email": test_pro_freelancer_user.email,
    })
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def mock_redis() -> AsyncMock:
    """Mock Redis client."""
    mock = AsyncMock()
    mock.get = AsyncMock(return_value=None)
    mock.set = AsyncMock(return_value=True)
    mock.incr = AsyncMock(return_value=1)
    mock.expire = AsyncMock(return_value=True)
    mock.delete = AsyncMock(return_value=1)
    mock.publish = AsyncMock(return_value=1)
    mock.pubsub = MagicMock()
    return mock


@pytest.fixture(autouse=True)
def mock_redis_dependency(mock_redis):
    """Mock Redis dependency for all tests."""
    from app.core import redis as redis_module
    original_get_redis = redis_module.get_redis
    original_increment_counter = redis_module.increment_counter
    original_get_counter = redis_module.get_counter

    async def mock_get_redis():
        return mock_redis

    async def mock_increment_counter(key: str, expire_seconds: int) -> int:
        return 1

    async def mock_get_counter(key: str) -> int:
        return 0

    redis_module.get_redis = mock_get_redis
    redis_module.increment_counter = mock_increment_counter
    redis_module.get_counter = mock_get_counter
    yield
    redis_module.get_redis = original_get_redis
    redis_module.increment_counter = original_increment_counter
    redis_module.get_counter = original_get_counter


# Mock Celery for tests
@pytest.fixture(autouse=True)
def mock_celery():
    """Mock Celery tasks for tests."""
    with patch("app.tasks.notifications.send_bid_notification.delay") as mock_delay:
        with patch("app.tasks.notifications.send_message_notification.delay") as mock_delay2:
            with patch("app.tasks.notifications.send_daily_notifications.delay") as mock_delay3:
                with patch("app.tasks.weekly_reset.reset_weekly_bid_limits.delay") as mock_delay4:
                    with patch("app.tasks.weekly_reset.cleanup_expired_tokens.delay") as mock_delay5:
                        with patch("app.tasks.meilisearch_sync.sync_projects_to_meilisearch.delay") as mock_delay6:
                            yield


# Mock Stripe for tests
@pytest.fixture(autouse=True)
def mock_stripe():
    """Mock Stripe API calls for tests."""
    with patch("app.services.stripe_service.stripe") as mock_stripe:
        # Mock checkout session create
        mock_session = MagicMock()
        mock_session.id = "cs_test_mock123"
        mock_session.url = "https://checkout.stripe.com/pay/cs_test_mock123"
        mock_stripe.checkout.Session.create.return_value = mock_session

        # Mock customer create/retrieve
        mock_customer = MagicMock()
        mock_customer.id = "cus_test_mock123"
        mock_stripe.Customer.create.return_value = mock_customer
        mock_stripe.Customer.retrieve.return_value = mock_customer

        # Mock transfer create for withdrawals
        mock_transfer = MagicMock()
        mock_transfer.id = "tr_test_mock123"
        mock_stripe.Transfer.create.return_value = mock_transfer

        # Mock webhook construct_event
        mock_stripe.Webhook.construct_event.return_value = {"type": "test", "data": {}}

        yield mock_stripe


# Pytest configuration
def pytest_configure(config: pytest.Config) -> None:
    config.addinivalue_line("markers", "unit: mark test as unit test")
    config.addinivalue_line("markers", "integration: mark test as integration test")
    config.addinivalue_line("markers", "slow: mark test as slow")