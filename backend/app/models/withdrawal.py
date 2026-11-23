import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User


class WithdrawalStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class WithdrawalMethod(str, enum.Enum):
    STRIPE = "stripe"
    BANK_TRANSFER = "bank_transfer"
    CRYPTO = "crypto"


class Withdrawal(Base):
    __tablename__ = "withdrawals"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Relations
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Withdrawal details
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)
    method: Mapped[str] = mapped_column(String(50), nullable=False)  # stripe, bank_transfer, crypto
    destination: Mapped[dict] = mapped_column(JSONB, nullable=False)  # encrypted bank details, stripe account, etc.

    # Fees
    platform_fee_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    processing_fee_cents: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    net_amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)

    # Status
    status: Mapped[WithdrawalStatus] = mapped_column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING, nullable=False, index=True)

    # External references
    stripe_transfer_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    stripe_payout_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Admin
    reviewed_by: Mapped[int | None] = mapped_column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    rejection_reason: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Relationships
    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="withdrawals", lazy="selectin")
    reviewer: Mapped["User | None"] = relationship("User", foreign_keys=[reviewed_by], lazy="selectin")

    __table_args__ = (
        Index("ix_withdrawals_user_status", "user_id", "status"),
        Index("ix_withdrawals_status_created", "status", "created_at"),
    )

    def __repr__(self) -> str:
        return f"<Withdrawal(id={self.id}, user_id={self.user_id}, amount={self.amount_cents}, status={self.status})>"
