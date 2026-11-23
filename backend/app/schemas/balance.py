from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.transaction import TransactionType
from app.models.withdrawal import WithdrawalStatus, WithdrawalMethod


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount_cents: int
    balance_before_cents: int
    balance_after_cents: int
    transaction_type: TransactionType
    project_id: Optional[int]
    bid_id: Optional[int]
    withdrawal_id: Optional[int]
    description: str
    created_at: datetime


class BalanceResponse(BaseModel):
    balance_cents: int
    currency: str = "USD"
    pending_cents: int = 0
    available_cents: int = 0
    transactions: List[TransactionResponse]
    total_pages: int
    current_page: int


class WithdrawalCreate(BaseModel):
    amount_cents: int = Field(gt=0)
    method: WithdrawalMethod
    method_details: dict = Field(default_factory=dict)


class WithdrawalResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    amount_cents: int
    commission_cents: int
    net_amount_cents: int
    method: WithdrawalMethod
    method_details: dict
    status: WithdrawalStatus
    admin_notes: Optional[str]
    processed_at: Optional[datetime]
    completed_at: Optional[datetime]
    failure_reason: Optional[str]
    created_at: datetime
    updated_at: datetime


class WithdrawalListResponse(BaseModel):
    withdrawals: List[WithdrawalResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CommissionInfo(BaseModel):
    plan: str
    commission_pct: int
    example: dict  # e.g., {"gross": 10000, "commission": 500, "net": 9500}


class TransactionListResponse(BaseModel):
    transactions: List[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class DepositCreate(BaseModel):
    amount_cents: int = Field(gt=0)
    currency: str = "USD"
    success_url: str
    cancel_url: str


class DepositResponse(BaseModel):
    checkout_url: str
    session_id: str