import enum
from datetime import datetime
from sqlalchemy import String, Text, ForeignKey, Index, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID

from app.core.database import Base


class NotificationType(str, enum.Enum):
    NEW_BID = "new_bid"
    BID_ACCEPTED = "bid_accepted"
    BID_REJECTED = "bid_rejected"
    BID_SHORTLISTED = "bid_shortlisted"
    NEW_MESSAGE = "new_message"
    PROJECT_COMPLETED = "project_completed"
    PAYMENT_RECEIVED = "payment_received"
    WITHDRAWAL_REQUESTED = "withdrawal_requested"
    WITHDRAWAL_COMPLETED = "withdrawal_completed"
    SUBSCRIPTION_RENEWAL = "subscription_renewal"
    SUBSCRIPTION_CANCELLED = "subscription_cancelled"
    REVIEW_RECEIVED = "review_received"
    SYSTEM = "system"


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type: Mapped[NotificationType] = mapped_column(String(50), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    related_id: Mapped[int | None] = mapped_column(nullable=True, index=True)
    related_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    action_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    user: Mapped["User"] = relationship("User", back_populates="notifications")

    __table_args__ = (
        Index("ix_notifications_user_created", "user_id", "created_at"),
        Index("ix_notifications_user_unread", "user_id", "is_read"),
    )

    def __repr__(self):
        return f"<Notification(id={self.id}, user_id={self.user_id}, type={self.type}, read={self.is_read})>"