from datetime import datetime
from typing import Annotated, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator
from pydantic.types import StringConstraints

from app.models.user import UserRole, UserPlan


class TokenBase(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenResponse(TokenBase):
    pass


class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(None, max_length=255)
    role: UserRole = UserRole.FREELANCER


class UserRegister(UserBase):
    password: Annotated[str, StringConstraints(min_length=8, max_length=128)]
    password_confirm: Annotated[str, StringConstraints(min_length=8, max_length=128)]

    @field_validator("password_confirm")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if v != info.data.get("password"):
            raise ValueError("Passwords do not match")
        return v


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    avatar_url: Optional[str] = Field(None, max_length=500)
    bio: Optional[str] = None
    location: Optional[str] = Field(None, max_length=255)
    website: Optional[str] = Field(None, max_length=500)
    skills: list[str] = []
    hourly_rate: Optional[int] = Field(None, ge=0)
    availability: str = "available"


class UserResponse(UserBase):
    id: int
    uuid: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    skills: list[str] = []
    hourly_rate: Optional[int] = None
    availability: str
    plan: UserPlan
    rating: float
    reviews_count: int
    completed_projects: int
    created_at: datetime
    updated_at: datetime
    last_login_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfileResponse(UserResponse):
    balance_cents: int
    pending_balance_cents: int


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = None


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    new_password: Annotated[str, StringConstraints(min_length=8, max_length=128)]
    new_password_confirm: Annotated[str, StringConstraints(min_length=8, max_length=128)]

    @field_validator("new_password_confirm")
    @classmethod
    def passwords_match(cls, v: str, info) -> str:
        if v != info.data.get("new_password"):
            raise ValueError("Passwords do not match")
        return v


class OAuthLoginRequest(BaseModel):
    code: str
    redirect_uri: str


class EmailVerificationRequest(BaseModel):
    email: EmailStr