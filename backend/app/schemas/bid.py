from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.bid import BidStatus


class BidBase(BaseModel):
    price_cents: int = Field(gt=0)
    delivery_days: int = Field(ge=1, le=365)
    cover_letter: str = Field(min_length=20)
    portfolio_urls: List[str] = Field(default_factory=list)


class BidCreate(BidBase):
    pass


class BidUpdate(BaseModel):
    price_cents: Optional[int] = Field(default=None, gt=0)
    delivery_days: Optional[int] = Field(default=None, ge=1, le=365)
    cover_letter: Optional[str] = Field(default=None, min_length=20)
    portfolio_urls: Optional[List[str]] = None


class BidResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    project_id: int
    freelancer_id: int
    price_cents: int
    delivery_days: int
    cover_letter: str
    portfolio_urls: List[str]
    status: BidStatus
    created_at: datetime
    updated_at: datetime
    accepted_at: Optional[datetime]

    # Nested objects
    freelancer: Optional["UserResponse"] = None


class BidListResponse(BaseModel):
    bids: List[BidResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class BidAccept(BaseModel):
    """Schema for accepting a bid."""
    pass


class BidReject(BaseModel):
    """Schema for rejecting a bid."""
    reason: Optional[str] = None


class BidWithdraw(BaseModel):
    """Schema for withdrawing a bid."""
    reason: Optional[str] = None


class BidShortlist(BaseModel):
    """Schema for shortlisting a bid."""
    pass


# Forward reference
from app.schemas.auth import UserResponse
BidResponse.model_rebuild()