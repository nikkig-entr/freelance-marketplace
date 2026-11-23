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
    from app.models.project import Project


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    PROJECT_PAYMENT = "project_payment"
    PROJECT_REFUND = "project_refund"
    PLATFORM_FEE = "platform_fee"
    SUBSCRIPTION_PAYMENT = "subscription_payment"
    BID_BONUS = "bid_bonus"
    REFERRAL_BONUS = "referral_bonus"


class Transaction(Base):
    __tablename__ = "transactions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Relations
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    project_id: Mapped[int | None] = mapped_column(Integer, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True)

    # Transaction details
    type: Mapped[TransactionType] = mapped_column(Enum(TransactionType), nullable=False, index=True)
    amount_cents: Mapped[int] = mapped_column(Integer, nullable=False)  # positive for credit, negative for debit
    balance_before_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    balance_after_cents: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="USD", nullable=False)

    # External references
    stripe_payment_intent_id: Mapped[str | None] = mapped_column(String(255), unique=True, nullable=True, index=True)
    stripe_charge_id: Mapped[str | None] = mapped_column(String(255), nullable=True)
    stripe_transfer_id: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Metadata
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    metadata: Mapped[dict] = mapped_column(JSONB, default=dict, nullable=False)

    # Status
    is_completed: Mapped[bool] = mapped_column(default=False, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    # Timestamps
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False, index=True
    )

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="transactions", lazy="selectin")
    project: Mapped["Project | None"] = relationship("Project", lazy="selectin")

    __table_args__ = (
        Index("ix_transactions_user_created", "user_id", "created_at"),
        Index("ix_transactions_type_created", "type", "created_at"),
        Index("ix_transactions_stripe_intent", "stripe_payment_intent_id"),
    )

    def __repr__(self) -> str:
        return f"<Transaction(id={self.id}, user_id={self.user_id}, type={self.type}, amount={self.amount_cents})>"
