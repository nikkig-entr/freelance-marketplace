from typing import Optional, Tuple
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.models.withdrawal import Withdrawal, WithdrawalStatus, WithdrawalMethod
from app.models.project import Project
from app.models.bid import Bid, BidStatus
from app.services.notification import NotificationService
from app.core.config import get_settings

settings = get_settings()


class PaymentService:
    """Service for payment processing, commissions, withdrawals."""

    @staticmethod
    def calculate_commission(amount_cents: int, commission_pct: int) -> Tuple[int, int]:
        """
        Calculate commission and net amount.
        Returns (commission_cents, net_cents).
        """
        commission_cents = (amount_cents * commission_pct) // 100
        net_cents = amount_cents - commission_cents
        return commission_cents, net_cents

    @staticmethod
    async def add_balance(
        db: AsyncSession,
        user: User,
        amount_cents: int,
        transaction_type: TransactionType,
        description: str,
        project_id: Optional[int] = None,
        bid_id: Optional[int] = None,
        metadata: Optional[dict] = None,
    ) -> Transaction:
        """Add funds to user balance and create transaction record."""
        balance_before = user.balance_cents
        user.balance_cents += amount_cents
        balance_after = user.balance_cents

        tx_metadata = metadata or {}
        if bid_id:
            tx_metadata["bid_id"] = bid_id

        transaction = Transaction(
            user_id=user.id,
            amount_cents=amount_cents,
            balance_before_cents=balance_before,
            balance_after_cents=balance_after,
            type=transaction_type,
            project_id=project_id,
            description=description,
            metadata=tx_metadata,
        )
        db.add(transaction)
        await db.flush()
        return transaction

    @staticmethod
    async def deduct_balance(
        db: AsyncSession,
        user: User,
        amount_cents: int,
        transaction_type: TransactionType,
        description: str,
        project_id: Optional[int] = None,
        bid_id: Optional[int] = None,
        metadata: Optional[dict] = None,
    ) -> Transaction:
        """Deduct funds from user balance and create transaction record."""
        if user.balance_cents < amount_cents:
            raise ValueError("Insufficient balance")

        balance_before = user.balance_cents
        user.balance_cents -= amount_cents
        balance_after = user.balance_cents

        tx_metadata = metadata or {}
        if bid_id:
            tx_metadata["bid_id"] = bid_id

        transaction = Transaction(
            user_id=user.id,
            amount_cents=-amount_cents,
            balance_before_cents=balance_before,
            balance_after_cents=balance_after,
            type=transaction_type,
            project_id=project_id,
            description=description,
            metadata=tx_metadata,
        )
        db.add(transaction)
        await db.flush()
        return transaction

    @staticmethod
    async def process_project_payment(
        db: AsyncSession,
        client: User,
        project: Project,
        bid: Bid,
    ) -> Transaction:
        """Process payment from client for project (escrow)."""
        # For fixed price, charge full amount; for hourly, charge first milestone
        amount = bid.price_cents

        transaction = await PaymentService.deduct_balance(
            db=db,
            user=client,
            amount_cents=amount,
            transaction_type=TransactionType.PROJECT_PAYMENT,
            description=f"Payment for project: {project.title}",
            project_id=project.id,
            bid_id=bid.id,
            metadata={"bid_price": bid.price_cents, "freelancer_id": bid.freelancer_id},
        )

        # Notify freelancer
        freelancer = await db.get(User, bid.freelancer_id)
        if freelancer:
            await NotificationService.send_bid_accepted_notification(freelancer, project.title, client.full_name or "Client")

        return transaction

    @staticmethod
    async def release_project_funds(
        db: AsyncSession,
        project: Project,
        freelancer: User,
        client: User,
    ) -> Tuple[Transaction, Transaction]:
        """Release funds to freelancer after project completion."""
        bid = await db.get(Bid, project.accepted_bid_id)
        if not bid:
            raise ValueError("No accepted bid found")

        amount = bid.price_cents
        commission_pct = freelancer.get_commission_pct()
        commission_cents, net_cents = PaymentService.calculate_commission(amount, commission_pct)

        # Platform commission
        commission_tx = await PaymentService.add_balance(
            db=db,
            user=client,  # Commission tracked on client's transactions for accounting
            amount_cents=commission_cents,
            transaction_type=TransactionType.PLATFORM_FEE,
            description=f"Platform commission for project: {project.title}",
            project_id=project.id,
            bid_id=bid.id,
            metadata={"commission_pct": commission_pct, "freelancer_id": freelancer.id},
        )

        # Pay freelancer
        payout_tx = await PaymentService.add_balance(
            db=db,
            user=freelancer,
            amount_cents=net_cents,
            transaction_type=TransactionType.PROJECT_PAYMENT,
            description=f"Payment released for project: {project.title}",
            project_id=project.id,
            bid_id=bid.id,
            metadata={"gross_amount": amount, "commission_cents": commission_cents, "client_id": client.id},
        )

        return commission_tx, payout_tx

    @staticmethod
    async def request_withdrawal(
        db: AsyncSession,
        user: User,
        amount_cents: int,
        method: WithdrawalMethod,
        method_details: dict,
    ) -> Withdrawal:
        """Create withdrawal request."""
        if user.balance_cents < amount_cents:
            raise ValueError("Insufficient balance")

        commission_pct = user.get_commission_pct()
        platform_fee_cents, net_cents = PaymentService.calculate_commission(amount_cents, commission_pct)
        processing_fee_cents = 0  # Could add processing fees based on method

        withdrawal = Withdrawal(
            user_id=user.id,
            amount_cents=amount_cents,
            platform_fee_cents=platform_fee_cents,
            processing_fee_cents=processing_fee_cents,
            net_amount_cents=net_cents,
            method=method.value,
            destination=method_details,
            status=WithdrawalStatus.PENDING,
        )
        db.add(withdrawal)
        await db.flush()

        # Deduct from balance (held)
        await PaymentService.deduct_balance(
            db=db,
            user=user,
            amount_cents=amount_cents,
            transaction_type=TransactionType.WITHDRAWAL,
            description=f"Withdrawal request via {method.value}",
            metadata={"method": method.value, "net_amount": net_cents, "withdrawal_id": withdrawal.id},
        )

        # Notify admin
        await NotificationService.notify_admin_withdrawal_request(user, amount_cents)

        return withdrawal

    @staticmethod
    async def process_withdrawal(
        db: AsyncSession,
        withdrawal: Withdrawal,
        admin: User,
        action: str,  # "approve" or "reject"
        admin_notes: Optional[str] = None,
    ) -> Withdrawal:
        """Process withdrawal request (approve/reject)."""
        user = await db.get(User, withdrawal.user_id)

        if action == "approve":
            withdrawal.status = WithdrawalStatus.PROCESSING
            withdrawal.reviewed_by = admin.id
            withdrawal.reviewed_at = datetime.now(timezone.utc)
            withdrawal.rejection_reason = admin_notes

            # Here you would integrate with actual payout provider (Stripe, bank, etc.)
            # For now, mark as completed
            withdrawal.status = WithdrawalStatus.COMPLETED
            withdrawal.completed_at = datetime.now(timezone.utc)

            await NotificationService.send_withdrawal_notification(user, withdrawal.amount_cents, "completed")

        elif action == "reject":
            withdrawal.status = WithdrawalStatus.FAILED
            withdrawal.reviewed_by = admin.id
            withdrawal.reviewed_at = datetime.now(timezone.utc)
            withdrawal.rejection_reason = admin_notes or "Rejected by admin"

            # Refund to user balance
            await PaymentService.add_balance(
                db=db,
                user=user,
                amount_cents=withdrawal.amount_cents,
                transaction_type=TransactionType.PROJECT_REFUND,
                description=f"Withdrawal rejected, funds returned",
                metadata={"withdrawal_id": withdrawal.id},
            )

            await NotificationService.send_withdrawal_notification(user, withdrawal.amount_cents, "rejected")

        else:
            raise ValueError("Invalid action")

        await db.flush()
        return withdrawal

    @staticmethod
    async def get_user_transactions(
        db: AsyncSession,
        user: User,
        page: int = 1,
        page_size: int = 20,
    ) -> Tuple[list, int]:
        """Get user's transaction history."""
        query = select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.created_at.desc())
        total = await db.scalar(select(func.count()).select_from(query.subquery()))

        offset = (page - 1) * page_size
        result = await db.execute(query.offset(offset).limit(page_size))
        transactions = result.scalars().all()

        return transactions, total

    @staticmethod
    async def get_pending_withdrawals_amount(db: AsyncSession, user: User) -> int:
        """Get total pending withdrawal amount for user."""
        query = select(func.sum(Withdrawal.amount_cents)).where(
            Withdrawal.user_id == user.id,
            Withdrawal.status.in_([WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING]),
        )
        result = await db.scalar(query)
        return result or 0