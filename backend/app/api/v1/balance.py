from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.transaction import Transaction, TransactionType
from app.models.withdrawal import Withdrawal, WithdrawalStatus, WithdrawalMethod
from app.schemas.balance import (
    BalanceResponse, TransactionListResponse, TransactionResponse,
    WithdrawalListResponse, WithdrawalResponse, WithdrawalCreate,
    DepositCreate, DepositResponse
)
from app.services.stripe import create_checkout_session, create_withdrawal_transfer
from app.services.notifications import create_notification

router = APIRouter(prefix="/balance", tags=["balance"])


@router.get("", response_model=BalanceResponse)
async def get_balance(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's balance."""
    # Refresh user to get latest balance
    await db.refresh(current_user)
    # Calculate available balance (balance - pending)
    available_cents = max(0, current_user.balance_cents - current_user.pending_balance_cents)
    return BalanceResponse(
        balance_cents=current_user.balance_cents,
        pending_cents=current_user.pending_balance_cents,
        available_cents=available_cents,
        currency="USD",
        transactions=[],
        total_pages=0,
        current_page=1,
    )


@router.get("/transactions", response_model=TransactionListResponse)
async def list_transactions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    type: Optional[TransactionType] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's transactions."""
    query = select(Transaction).where(Transaction.user_id == current_user.id).order_by(Transaction.created_at.desc())

    if type:
        query = query.where(Transaction.type == type)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    transactions = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return TransactionListResponse(
        transactions=transactions,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.get("/transactions/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific transaction."""
    query = select(Transaction).where(
        Transaction.id == transaction_id,
        Transaction.user_id == current_user.id
    )
    result = await db.execute(query)
    transaction = result.scalar_one_or_none()

    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    return transaction


@router.get("/withdrawals", response_model=WithdrawalListResponse)
async def list_withdrawals(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[WithdrawalStatus] = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """List user's withdrawals."""
    query = select(Withdrawal).where(Withdrawal.user_id == current_user.id).order_by(Withdrawal.created_at.desc())

    if status:
        query = query.where(Withdrawal.status == status)

    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    result = await db.execute(query)
    withdrawals = result.scalars().all()

    total_pages = (total + page_size - 1) // page_size

    return WithdrawalListResponse(
        withdrawals=withdrawals,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages,
    )


@router.post("/withdrawals", response_model=WithdrawalResponse, status_code=status.HTTP_201_CREATED)
async def request_withdrawal(
    withdrawal_data: WithdrawalCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Request a withdrawal."""
    # Check minimum withdrawal amount
    MIN_WITHDRAWAL_CENTS = 1000  # $10

    if withdrawal_data.amount_cents < MIN_WITHDRAWAL_CENTS:
        raise HTTPException(status_code=400, detail="Minimum withdrawal amount is $10")

    # Check available balance
    if withdrawal_data.amount_cents > current_user.balance_cents:
        raise HTTPException(status_code=400, detail="Insufficient balance")

    # Calculate fees (2.9% + $0.30 for Stripe)
    platform_fee_cents = int(withdrawal_data.amount_cents * 0.029) + 30
    processing_fee_cents = 0  # Could add bank transfer fees
    net_amount_cents = withdrawal_data.amount_cents - platform_fee_cents - processing_fee_cents

    # Create withdrawal
    withdrawal = Withdrawal(
        user_id=current_user.id,
        amount_cents=withdrawal_data.amount_cents,
        platform_fee_cents=platform_fee_cents,
        processing_fee_cents=processing_fee_cents,
        net_amount_cents=net_amount_cents,
        method=withdrawal_data.method,
        destination=withdrawal_data.destination,
        status=WithdrawalStatus.PENDING,
    )
    db.add(withdrawal)

    # Deduct from balance
    current_user.balance_cents -= withdrawal_data.amount_cents

    await db.commit()
    await db.refresh(withdrawal)

    # Notify user
    await create_notification(
        db=db,
        user_id=current_user.id,
        type="withdrawal_requested",
        title="Withdrawal requested",
        message=f"Your withdrawal of ${withdrawal_data.amount_cents / 100:.2f} is being processed",
        related_id=withdrawal.id,
        related_type="withdrawal",
    )

    return withdrawal


@router.get("/withdrawals/{withdrawal_id}", response_model=WithdrawalResponse)
async def get_withdrawal(
    withdrawal_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get a specific withdrawal."""
    query = select(Withdrawal).where(
        Withdrawal.id == withdrawal_id,
        Withdrawal.user_id == current_user.id
    )
    result = await db.execute(query)
    withdrawal = result.scalar_one_or_none()

    if not withdrawal:
        raise HTTPException(status_code=404, detail="Withdrawal not found")

    return withdrawal


@router.post("/deposit", response_model=DepositResponse, status_code=status.HTTP_201_CREATED)
async def create_deposit(
    deposit_data: DepositCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a deposit (Stripe Checkout)."""
    MIN_DEPOSIT_CENTS = 1000  # $10
    MAX_DEPOSIT_CENTS = 1000000  # $10,000

    if deposit_data.amount_cents < MIN_DEPOSIT_CENTS:
        raise HTTPException(status_code=400, detail="Minimum deposit amount is $10")

    if deposit_data.amount_cents > MAX_DEPOSIT_CENTS:
        raise HTTPException(status_code=400, detail="Maximum deposit amount is $10,000")

    # Create Stripe Checkout session
    checkout_session = await create_checkout_session(
        user=current_user,
        amount_cents=deposit_data.amount_cents,
        success_url=deposit_data.success_url,
        cancel_url=deposit_data.cancel_url,
    )

    return DepositResponse(
        checkout_url=checkout_session.url,
        session_id=checkout_session.id,
    )


