from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict
from app.models.project import ProjectStatus


class ProjectBase(BaseModel):
    title: str = Field(min_length=5, max_length=255)
    description: str = Field(min_length=20)
    requirements: Optional[str] = None
    budget_min: int = Field(gt=0)
    budget_max: Optional[int] = Field(default=None, gt=0)
    is_fixed_price: bool = True
    deadline_days: Optional[int] = Field(default=None, ge=1, le=365)
    skills: List[str] = Field(default_factory=list)
    category_id: Optional[int] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    title: Optional[str] = Field(default=None, min_length=5, max_length=255)
    description: Optional[str] = Field(default=None, min_length=20)
    requirements: Optional[str] = None
    budget_min: Optional[int] = Field(default=None, gt=0)
    budget_max: Optional[int] = Field(default=None, gt=0)
    is_fixed_price: Optional[bool] = None
    deadline_days: Optional[int] = Field(default=None, ge=1, le=365)
    skills: Optional[List[str]] = None
    category_id: Optional[int] = None
    status: Optional[ProjectStatus] = None


class ProjectResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    uuid: str
    client_id: int
    title: str
    description: str
    requirements: Optional[str] = None
    budget_min: int
    budget_max: Optional[int]
    is_fixed_price: bool
    deadline_days: Optional[int] = None
    status: ProjectStatus
    skills: List[str] = []
    category_id: Optional[int] = None
    freelancer_id: Optional[int] = None
    accepted_bid_id: Optional[int] = None
    view_count: int = 0
    bid_count: int = 0
    created_at: datetime
    updated_at: datetime


class ProjectDetailResponse(ProjectResponse):
    client: "UserResponse"
    freelancer: Optional["UserResponse"] = None
    bids: List["BidResponse"] = []


class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    slug: str
    icon: Optional[str]
    sort_order: int


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category_id: int


class ProjectPublish(BaseModel):
    """Schema for publishing a project."""
    pass


class ProjectClose(BaseModel):
    """Schema for closing a project."""
    reason: Optional[str] = None


# Forward reference resolution
from app.schemas.auth import UserResponse
from app.schemas.bid import BidResponse
ProjectDetailResponse.model_rebuild()