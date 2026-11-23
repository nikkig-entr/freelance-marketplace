import enum
from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import (
    Boolean,
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


class BidStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"
    SHORTLISTED = "shortlisted"


class Bid(Base):
    __tablename__ = "bids"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Relations
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    freelancer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Bid details
    price_cents: Mapped[int] = mapped_column(Integer, nullable=False)  # in cents
    cover_letter: Mapped[str] = mapped_column(Text, nullable=False)
    delivery_days: Mapped[int] = mapped_column(Integer, nullable=False)
    attachments: Mapped[list[dict]] = mapped_column(JSONB, default=list, nullable=False)
    portfolio_urls: Mapped[list[str]] = mapped_column(JSONB, default=list, nullable=False)

    # Status
    status: Mapped[BidStatus] = mapped_column(Enum(BidStatus), default=BidStatus.PENDING, nullable=False, index=True)

    # Client feedback
    client_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    viewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    accepted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

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

    # Relationships
    project: Mapped["Project"] = relationship("Project", back_populates="bids", lazy="selectin")
    freelancer: Mapped["User"] = relationship("User", back_populates="bids", lazy="selectin")

    __table_args__ = (
        Index("ix_bids_project_freelancer", "project_id", "freelancer_id", unique=True),
        Index("ix_bids_freelancer_status", "freelancer_id", "status"),
        Index("ix_bids_project_status", "project_id", "status"),
    )

    def __repr__(self) -> str:
        return f"<Bid(id={self.id}, project_id={self.project_id}, freelancer_id={self.freelancer_id}, status={self.status})>"
