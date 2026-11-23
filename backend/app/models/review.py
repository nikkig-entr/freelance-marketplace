from datetime import datetime, timezone
from typing import TYPE_CHECKING
from uuid import uuid4

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.project import Project


class Review(Base):
    __tablename__ = "reviews"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    uuid: Mapped[str] = mapped_column(String(36), unique=True, default=lambda: str(uuid4()), index=True)

    # Relations
    project_id: Mapped[int] = mapped_column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewer_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    reviewee_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Review content
    rating: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Detailed ratings
    communication_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    quality_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    deadline_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)
    professionalism_rating: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Visibility
    is_public: Mapped[bool] = mapped_column(default=True, nullable=False)
    is_anonymous: Mapped[bool] = mapped_column(default=False, nullable=False)

    # Response from reviewee
    response: Mapped[str | None] = mapped_column(Text, nullable=True)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

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
    project: Mapped["Project"] = relationship("Project", back_populates="reviews", lazy="selectin")
    reviewer: Mapped["User"] = relationship("User", foreign_keys=[reviewer_id], back_populates="given_reviews", lazy="selectin")
    reviewee: Mapped["User"] = relationship("User", foreign_keys=[reviewee_id], back_populates="received_reviews", lazy="selectin")

    __table_args__ = (
        UniqueConstraint("project_id", "reviewer_id", name="uq_review_project_reviewer"),
        Index("ix_reviews_reviewee_rating", "reviewee_id", "rating"),
        Index("ix_reviews_project_public", "project_id", "is_public"),
    )

    def __repr__(self) -> str:
        return f"<Review(id={self.id}, project_id={self.project_id}, reviewer={self.reviewer_id}, reviewee={self.reviewee_id}, rating={self.rating})>"
