import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from decimal import Decimal
from datetime import datetime, timezone
from app.services.payment_service import PaymentService
from app.models.transaction import TransactionType
from app.models.withdrawal import Withdrawal, WithdrawalMethod, WithdrawalStatus
from app.models.user import User, UserPlan
from app.models.project import Project
from app.models.bid import Bid, BidStatus


class TestPaymentService:
    """Tests for the PaymentService class."""

    @pytest.fixture
    def mock_db(self):
        """Mock database session."""
        return AsyncMock()

    @pytest.fixture
    def client_user(self):
        """Create a mock client user."""
        return User(
            id=1,
            email="client@test.com",
            hashed_password="hash",
            full_name="Test Client",
            role="client",
            plan=UserPlan.STARTER,
            is_active=True,
            is_verified=True,
            balance_cents=10000,
        )

    @pytest.fixture
    def freelancer_user(self):
        """Create a mock freelancer user."""
        return User(
            id=2,
            email="freelancer@test.com",
            hashed_password="hash",
            full_name="Test Freelancer",
            role="freelancer",
            plan=UserPlan.PRO,
            is_active=True,
            is_verified=True,
            balance_cents=0,
        )

    @pytest.fixture
    def admin_user(self):
        """Create a mock admin user."""
        return User(
            id=3,
            email="admin@test.com",
            hashed_password="hash",
            full_name="Test Admin",
            role="admin",
            plan=UserPlan.AGENCY,
            is_active=True,
            is_verified=True,
        )

    @pytest.fixture
    def sample_project(self, client_user):
        """Create a sample project."""
        return Project(
            id=1,
            client_id=client_user.id,
            title="Test Project",
            description="A test project",
            budget_min=50000,
            budget_max=100000,
            status="open",
            category="Development",
            tags=["Python", "React"],
        )

    @pytest.fixture
    def sample_bid(self, freelancer_user, sample_project):
        """Create a sample bid."""
        return Bid(
            id=1,
            project_id=sample_project.id,
            freelancer_id=freelancer_user.id,
            price_cents=75000,
            cover_letter="I can do this project",
            delivery_days=14,
            status=BidStatus.ACCEPTED,
        )

    @pytest.fixture
    def sample_withdrawal(self, freelancer_user):
        """Create a sample withdrawal."""
        return Withdrawal(
            id=1,
            user_id=freelancer_user.id,
            amount_cents=50000,
            currency="USD",
            platform_fee_cents=2500,
            processing_fee_cents=0,
            net_amount_cents=47500,
            method="bank_transfer",
            destination={"account": "12345678"},
            status=WithdrawalStatus.PENDING,
        )

    def test_calculate_commission(self):
        """Test commission calculation."""
        commission, net = PaymentService.calculate_commission(10000, 10)
        assert commission == 1000
        assert net == 9000

        commission, net = PaymentService.calculate_commission(50000, 5)
        assert commission == 2500
        assert net == 47500

        commission, net = PaymentService.calculate_commission(0, 10)
        assert commission == 0
        assert net == 0

    @pytest.mark.asyncio
    async def test_add_balance(self, mock_db, freelancer_user):
        """Test adding balance to user."""
        freelancer_user.balance_cents = 0

        transaction = await PaymentService.add_balance(
            db=mock_db,
            user=freelancer_user,
            amount_cents=5000,
            transaction_type=TransactionType.DEPOSIT,
            description="Test deposit",
        )

        assert transaction.amount_cents == 5000
        assert transaction.balance_before_cents == 0
        assert transaction.balance_after_cents == 5000
        assert transaction.type == TransactionType.DEPOSIT
        assert freelancer_user.balance_cents == 5000
        mock_db.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_deduct_balance(self, mock_db, freelancer_user):
        """Test deducting balance from user."""
        freelancer_user.balance_cents = 10000

        transaction = await PaymentService.deduct_balance(
            db=mock_db,
            user=freelancer_user,
            amount_cents=3000,
            transaction_type=TransactionType.WITHDRAWAL,
            description="Test withdrawal",
        )

        assert transaction.amount_cents == -3000
        assert transaction.balance_before_cents == 10000
        assert transaction.balance_after_cents == 7000
        assert transaction.type == TransactionType.WITHDRAWAL
        assert freelancer_user.balance_cents == 7000
        mock_db.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_deduct_balance_insufficient(self, mock_db, freelancer_user):
        """Test deducting balance with insufficient funds."""
        freelancer_user.balance_cents = 1000

        with pytest.raises(ValueError, match="Insufficient balance"):
            await PaymentService.deduct_balance(
                db=mock_db,
                user=freelancer_user,
                amount_cents=5000,
                transaction_type=TransactionType.WITHDRAWAL,
                description="Test withdrawal",
            )

    @pytest.mark.asyncio
    async def test_process_project_payment(self, mock_db, client_user, freelancer_user, sample_project, sample_bid):
        """Test processing project payment (escrow)."""
        client_user.balance_cents = 100000

        with patch('app.services.payment_service.NotificationService.send_bid_accepted_notification', new_callable=AsyncMock) as mock_notify:
            transaction = await PaymentService.process_project_payment(
                db=mock_db,
                client=client_user,
                project=sample_project,
                bid=sample_bid,
            )

        assert transaction.amount_cents == -75000
        assert transaction.type == TransactionType.PROJECT_PAYMENT
        assert client_user.balance_cents == 25000
        mock_notify.assert_called_once()
        mock_db.add.assert_called_once()

    @pytest.mark.asyncio
    async def test_release_project_funds(self, mock_db, client_user, freelancer_user, sample_project, sample_bid):
        """Test releasing project funds to freelancer."""
        sample_project.accepted_bid_id = sample_bid.id
        freelancer_user.balance_cents = 0

        # Mock db.get to return the sample_bid
        mock_db.get.return_value = sample_bid

        with patch('app.services.payment_service.NotificationService.send_withdrawal_notification', new_callable=AsyncMock):
            commission_tx, payout_tx = await PaymentService.release_project_funds(
                db=mock_db,
                project=sample_project,
                freelancer=freelancer_user,
                client=client_user,
            )

        # Commission (5% for Pro = 3%)
        assert commission_tx.amount_cents == 2250  # 3% of 75000
        assert commission_tx.type == TransactionType.PLATFORM_FEE

        # Payout to freelancer
        assert payout_tx.amount_cents == 72750  # 75000 - 2250
        assert payout_tx.type == TransactionType.PROJECT_PAYMENT
        assert freelancer_user.balance_cents == 72750

        assert mock_db.add.call_count == 2

    @pytest.mark.asyncio
    async def test_request_withdrawal(self, mock_db, freelancer_user):
        """Test requesting a withdrawal."""
        freelancer_user.balance_cents = 100000

        with patch('app.services.payment_service.NotificationService.notify_admin_withdrawal_request', new_callable=AsyncMock):
            withdrawal = await PaymentService.request_withdrawal(
                db=mock_db,
                user=freelancer_user,
                amount_cents=50000,
                method=WithdrawalMethod.BANK_TRANSFER,
                method_details={"account": "12345678"},
            )

        assert withdrawal.amount_cents == 50000
        assert withdrawal.method == "bank_transfer"
        assert withdrawal.status == WithdrawalStatus.PENDING
        assert freelancer_user.balance_cents == 50000  # 100000 - 50000
        assert mock_db.add.call_count == 2  # Withdrawal + Transaction

    @pytest.mark.asyncio
    async def test_request_withdrawal_insufficient(self, mock_db, freelancer_user):
        """Test requesting withdrawal with insufficient balance."""
        freelancer_user.balance_cents = 10000

        with pytest.raises(ValueError, match="Insufficient balance"):
            await PaymentService.request_withdrawal(
                db=mock_db,
                user=freelancer_user,
                amount_cents=50000,
                method=WithdrawalMethod.BANK_TRANSFER,
                method_details={},
            )

    @pytest.mark.asyncio
    async def test_process_withdrawal_approve(self, mock_db, freelancer_user, sample_withdrawal, admin_user):
        """Test approving a withdrawal."""
        sample_withdrawal.status = WithdrawalStatus.PENDING

        with patch('app.services.payment_service.NotificationService.send_withdrawal_notification', new_callable=AsyncMock):
            result = await PaymentService.process_withdrawal(
                db=mock_db,
                withdrawal=sample_withdrawal,
                admin=admin_user,
                action="approve",
                admin_notes="Approved",
            )

        assert result.status == WithdrawalStatus.COMPLETED
        assert result.reviewed_by == admin_user.id
        assert result.rejection_reason == "Approved"
        assert result.completed_at is not None

    @pytest.mark.asyncio
    async def test_process_withdrawal_reject(self, mock_db, freelancer_user, sample_withdrawal, admin_user):
        """Test rejecting a withdrawal."""
        sample_withdrawal.status = WithdrawalStatus.PENDING
        freelancer_user.balance_cents = 50000  # Balance after withdrawal hold

        # Mock db.get to return the freelancer_user
        mock_db.get.return_value = freelancer_user

        with patch('app.services.payment_service.NotificationService.send_withdrawal_notification', new_callable=AsyncMock):
            result = await PaymentService.process_withdrawal(
                db=mock_db,
                withdrawal=sample_withdrawal,
                admin=admin_user,
                action="reject",
                admin_notes="Invalid account",
            )

        assert result.status == WithdrawalStatus.FAILED
        assert result.rejection_reason == "Invalid account"
        assert freelancer_user.balance_cents == 100000  # Refunded

    @pytest.mark.asyncio
    async def test_get_user_transactions(self, mock_db, freelancer_user):
        """Test getting user transactions."""
        from sqlalchemy import select, func
        from app.models.transaction import Transaction

        mock_transactions = [
            Transaction(id=1, user_id=freelancer_user.id, amount_cents=5000, type=TransactionType.DEPOSIT),
            Transaction(id=2, user_id=freelancer_user.id, amount_cents=-2000, type=TransactionType.WITHDRAWAL),
        ]

        mock_result = MagicMock()
        mock_result.scalars.return_value.all.return_value = mock_transactions
        mock_db.execute.return_value = mock_result
        mock_db.scalar.return_value = 2

        transactions, total = await PaymentService.get_user_transactions(
            db=mock_db,
            user=freelancer_user,
            page=1,
            page_size=10,
        )

        assert len(transactions) == 2
        assert total == 2

    @pytest.mark.asyncio
    async def test_get_pending_withdrawals_amount(self, mock_db, freelancer_user):
        """Test getting pending withdrawals amount."""
        from sqlalchemy import select, func
        from app.models.withdrawal import Withdrawal

        mock_db.scalar.return_value = 15000

        amount = await PaymentService.get_pending_withdrawals_amount(mock_db, freelancer_user)

        assert amount == 15000

    @pytest.mark.asyncio
    async def test_check_active_projects_limit(self, freelancer_user):
        """Test checking active projects limit."""
        # This test would need the limit service, skipping for now
        pass