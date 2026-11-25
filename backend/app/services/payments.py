from typing import Optional
from decimal import Decimal
from datetime import datetime, timedelta
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.project import Project, ProjectStatus
from app.models.bid import Bid, BidStatus
from app.models.transaction import Transaction, TransactionType
from app.models.withdrawal import Withdrawal, WithdrawalStatus
from app.models.subscription import Subscription, SubscriptionStatus
from app.services.stripe_service import StripeService
from app.services.notifications import (
    notify_payment_received,
    notify_project_completed,
)
from app.core.config import settings


PLATFORM_FEES = {
    "starter": 0.02,   # 2%
    "pro": 0.015,      # 1.5%
    "agency": 0.01,    # 1%
}

MIN_WITHDRAWAL_CENTS = 1000  # $10
WITHDRAWAL_FEE_PERCENT = 0.029  # 2.9%
WITHDRAWAL_FEE_FIXED_CENTS = 30  # $0.30


async def calculate_platform_fee(amount_cents: int, user_plan: str) -> int:
    """Calculate platform fee for a transaction."""
    fee_rate = PLATFORM_FEES.get(user_plan, PLATFORM_FEES["starter"])
    return int(amount_cents * fee_rate)


async def calculate_withdrawal_fees(amount_cents: int) -> tuple[int, int, int]:
    """Calculate withdrawal fees.
    Returns: (platform_fee_cents, processing_fee_cents, net_amount_cents)
    """
    platform_fee = int(amount_cents * WITHDRAWAL_FEE_PERCENT) + WITHDRAWAL_FEE_FIXED_CENTS
    processing_fee = 0  # Could add bank-specific fees
    net_amount = amount_cents - platform_fee - processing_fee
    return platform_fee, processing_fee, net_amount


async def process_project_payment(
    db: AsyncSession,
    project: Project,
    amount_cents: int,
    description: str = "Project payment",
) -> Transaction:
    """Process payment for a completed project."""
    if not project.freelancer_id:
        raise ValueError("Project has no assigned freelancer")

    # Get freelancer
    freelancer_query = select(User).where(User.id == project.freelancer_id)
    freelancer_result = await db.execute(freelancer_query)
    freelancer = freelancer_result.scalar_one_or_none()

    if not freelancer:
        raise ValueError("Freelancer not found")

    # Calculate platform fee
    platform_fee_cents = await calculate_platform_fee(amount_cents, freelancer.plan)
    freelancer_amount_cents = amount_cents - platform_fee_cents

    # Add to freelancer's pending balance (14-day hold)
    freelancer.pending_balance_cents += freelancer_amount_cents
    freelancer.total_earned_cents += freelancer_amount_cents

    # Create transaction for freelancer
    transaction = Transaction(
        user_id=freelancer.id,
        type=TransactionType.PROJECT_PAYMENT,
        amount_cents=freelancer_amount_cents,
        balance_after_cents=freelancer.balance_cents + freelancer.pending_balance_cents,
        description=description,
        project_id=project.id,
        metadata={
            "project_title": project.title,
            "gross_amount_cents": amount_cents,
            "platform_fee_cents": platform_fee_cents,
        },
    )
    db.add(transaction)

    # Create platform fee transaction
    fee_transaction = Transaction(
        user_id=freelancer.id,
        type=TransactionType.PLATFORM_FEE,
        amount_cents=-platform_fee_cents,
        balance_after_cents=freelancer.balance_cents + freelancer.pending_balance_cents,
        description=f"Platform fee for '{project.title}'",
        project_id=project.id,
        metadata={
            "project_title": project.title,
            "fee_rate": PLATFORM_FEES.get(freelancer.plan, 0.02),
        },
    )
    db.add(fee_transaction)

    # Create transaction for client (if needed)
    client_query = select(User).where(User.id == project.client_id)
    client_result = await db.execute(client_query)
    client = client_result.scalar_one_or_none()

    if client:
        client_transaction = Transaction(
            user_id=client.id,
            type=TransactionType.PROJECT_PAYMENT,
            amount_cents=-amount_cents,
            balance_after_cents=client.balance_cents,
            description=f"Payment for '{project.title}'",
            project_id=project.id,
            metadata={
                "project_title": project.title,
                "freelancer_id": freelancer.id,
            },
        )
        db.add(client_transaction)

    await db.commit()
    await db.refresh(transaction)

    # Notify freelancer
    await notify_payment_received(db, freelancer.id, freelancer_amount_cents, project.title, project.uuid)

    return transaction


async def release_pending_balance(
    db: AsyncSession,
    user: User,
) -> int:
    """Release pending balance to available balance (after 14-day hold)."""
    released = user.pending_balance_cents
    if released > 0:
        user.balance_cents += released
        user.pending_balance_cents = 0
        await db.commit()
    return released


async def process_withdrawal(
    db: AsyncSession,
    withdrawal: Withdrawal,
) -> bool:
    """Process an approved withdrawal."""
    try:
        # In production, this would integrate with Stripe Connect or bank transfer
        # For now, mark as completed
        withdrawal.status = WithdrawalStatus.COMPLETED
        withdrawal.processed_at = datetime.utcnow()

        # Update user stats
        user = withdrawal.user
        user.total_withdrawn_cents += withdrawal.amount_cents

        await db.commit()
        return True
    except Exception as e:
        withdrawal.status = WithdrawalStatus.FAILED
        withdrawal.failure_reason = str(e)
        await db.commit()
        return False


async def refund_project_payment(
    db: AsyncSession,
    project: Project,
    reason: str = "Project cancelled",
) -> Optional[Transaction]:
    """Refund a project payment (if project cancelled before completion)."""
    # Find the project payment transaction
    query = select(Transaction).where(
        Transaction.project_id == project.id,
        Transaction.type == TransactionType.PROJECT_PAYMENT,
        Transaction.amount_cents > 0,
    )
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()

    if not transaction:
        return None

    # Create refund transaction
    freelancer_query = select(User).where(User.id == transaction.user_id)
    freelancer_result = await db.execute(freelancer_query)
    freelancer = freelancer_result.scalar_one_or_none()

    if not freelancer:
        return None

    # Deduct from pending balance if still pending, otherwise from available
    refund_amount = transaction.amount_cents

    if freelancer.pending_balance_cents >= refund_amount:
        freelancer.pending_balance_cents -= refund_amount
    else:
        # Deduct from available balance
        remaining = refund_amount - freelancer.pending_balance_cents
        freelancer.pending_balance_cents = 0
        freelancer.balance_cents = max(0, freelancer.balance_cents - remaining)

    # Create refund transaction
    refund_transaction = Transaction(
        user_id=freelancer.id,
        type=TransactionType.REFUND,
        amount_cents=-refund_amount,
        balance_after_cents=freelancer.balance_cents + freelancer.pending_balance_cents,
        description=f"Refund: {reason} for '{project.title}'",
        project_id=project.id,
        related_transaction_id=transaction.id,
        metadata={
            "original_transaction_id": transaction.id,
            "reason": reason,
        },
    )
    db.add(refund_transaction)

    # Refund platform fee if applicable
    fee_query = select(Transaction).where(
        Transaction.project_id == project.id,
        Transaction.type == TransactionType.PLATFORM_FEE,
    )
    fee_result = await db.execute(fee_query)
    fee_transaction = fee_result.scalar_one_or_none()

    if fee_transaction:
        fee_refund = Transaction(
            user_id=freelancer.id,
            type=TransactionType.REFUND,
            amount_cents=abs(fee_transaction.amount_cents),
            balance_after_cents=freelancer.balance_cents + freelancer.pending_balance_cents,
            description=f"Platform fee refund for '{project.title}'",
            project_id=project.id,
            related_transaction_id=fee_transaction.id,
        )
        db.add(fee_refund)

    await db.commit()
    await db.refresh(refund_transaction)

    return refund_transaction


async def create_subscription_payment(
    db: AsyncSession,
    user: User,
    plan: str,
    billing_interval: str,
    amount_cents: int,
    stripe_subscription_id: str,
) -> Transaction:
    """Record subscription payment."""
    transaction = Transaction(
        user_id=user.id,
        type=TransactionType.SUBSCRIPTION,
        amount_cents=-amount_cents,
        balance_after_cents=user.balance_cents,
        description=f"{plan.title()} plan subscription ({billing_interval})",
        metadata={
            "plan": plan,
            "billing_interval": billing_interval,
            "stripe_subscription_id": stripe_subscription_id,
        },
    )
    db.add(transaction)
    await db.commit()
    await db.refresh(transaction)
    return transaction


async def get_user_financial_summary(db: AsyncSession, user_id: int) -> dict:
    """Get user's financial summary."""
    user_query = select(User).where(User.id == user_id)
    user_result = await db.execute(user_query)
    user = user_result.scalar_one_or_none()

    if not user:
        return {}

    # Get transaction totals by type
    from sqlalchemy import case

    tx_query = select(
        Transaction.type,
        func.count(Transaction.id).label("count"),
        func.sum(Transaction.amount_cents).label("total"),
    ).where(Transaction.user_id == user_id).group_by(Transaction.type)

    tx_result = await db.execute(tx_query)
    transactions_by_type = {
        row.type: {"count": row.count, "total_cents": row.total or 0}
        for row in tx_result
    }

    # Get withdrawal totals
    wd_query = select(
        Withdrawal.status,
        func.count(Withdrawal.id).label("count"),
        func.sum(Withdrawal.amount_cents).label("total"),
    ).where(Withdrawal.user_id == user_id).group_by(WithdrawalStatus)

    wd_result = await db.execute(wd_query)
    withdrawals_by_status = {
        row.status.value: {"count": row.count, "total_cents": row.total or 0}
        for row in wd_result
    }

    return {
        "balance_cents": user.balance_cents,
        "pending_balance_cents": user.pending_balance_cents,
        "total_earned_cents": user.total_earned_cents,
        "total_withdrawn_cents": user.total_withdrawn_cents,
        "transactions_by_type": transactions_by_type,
        "withdrawals_by_status": withdrawals_by_status,
    }


async def schedule_pending_releases(db: AsyncSession):
    """Scheduled task to release pending balances after 14 days."""
    # Find projects completed 14+ days ago
    cutoff_date = datetime.utcnow() - timedelta(days=14)

    query = select(Project).where(
        Project.status == ProjectStatus.COMPLETED,
        Project.completed_at <= cutoff_date,
        Project.freelancer_id.isnot(None),
    )
    result = await db.execute(query)
    projects = result.scalars().all()

    released_count = 0
    for project in projects:
        freelancer_query = select(User).where(User.id == project.freelancer_id)
        freelancer_result = await db.execute(freelancer_query)
        freelancer = freelancer_result.scalar_one_or_none()

        if freelancer and freelancer.pending_balance_cents > 0:
            await release_pending_balance(db, freelancer)
            released_count += 1

    return released_count