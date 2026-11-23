from datetime import datetime, timezone
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    get_current_user,
    pwd_context,
)
from app.dependencies import DatabaseSession, CurrentUser
from app.models.user import User, UserRole
from app.schemas.auth import (
    TokenResponse,
    UserLogin,
    UserRegister,
    UserResponse,
    RefreshTokenRequest,
    PasswordResetRequest,
    PasswordResetConfirm,
    OAuthLoginRequest,
)
from app.services.email import send_verification_email, send_password_reset_email

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserRegister,
    db: DatabaseSession,
) -> User:
    """Register a new user with email and password."""
    # Check if email already exists
    existing = await db.execute(select(User).where(User.email == user_data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Create user
    hashed_password = pwd_context.hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role or UserRole.FREELANCER,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Send verification email
    if settings.SMTP_HOST:
        await send_verification_email(user.email, user.id)

    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    response: Response,
    db: DatabaseSession,
) -> TokenResponse:
    """Login with email and password, returns access and refresh tokens."""
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not user.hashed_password or not pwd_context.verify(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    # Update last login
    user.last_login_at = datetime.now(timezone.utc)
    await db.commit()

    # Create tokens
    access_token = create_access_token({
        "sub": str(user.id),
        "user_id": user.id,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "plan": user.plan.value if hasattr(user.plan, 'value') else user.plan,
        "email": user.email,
    })
    refresh_token = create_refresh_token({
        "sub": str(user.id),
        "user_id": user.id,
    })

    # Set refresh token in HttpOnly cookie
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: Request,
    response: Response,
    db: DatabaseSession,
    token_data: RefreshTokenRequest | None = None,
) -> TokenResponse:
    """Refresh access token using refresh token from cookie or body."""
    # Get refresh token from cookie or body
    refresh_token = request.cookies.get("refresh_token")
    if token_data and token_data.refresh_token:
        refresh_token = token_data.refresh_token

    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token not provided",
        )

    # Decode and validate refresh token
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )

    # Get user
    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    # Create new tokens
    access_token = create_access_token({
        "sub": str(user.id),
        "user_id": user.id,
        "role": user.role.value if hasattr(user.role, 'value') else user.role,
        "plan": user.plan.value if hasattr(user.plan, 'value') else user.plan,
        "email": user.email,
    })
    new_refresh_token = create_refresh_token({
        "sub": str(user.id),
        "user_id": user.id,
    })

    # Update cookie
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
async def logout(response: Response) -> dict:
    """Logout - clear refresh token cookie."""
    response.delete_cookie(key="refresh_token", httponly=True, secure=not settings.DEBUG, samesite="lax")
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: CurrentUser,
) -> User:
    """Get current authenticated user info."""
    return current_user


@router.post("/forgot-password")
async def forgot_password(
    request: PasswordResetRequest,
    db: DatabaseSession,
) -> dict:
    """Request password reset email."""
    result = await db.execute(select(User).where(User.email == request.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if user and settings.SMTP_HOST:
        await send_password_reset_email(user.email, user.id)

    return {"message": "If the email exists, a password reset link has been sent"}


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetConfirm,
    db: DatabaseSession,
) -> dict:
    """Confirm password reset with token."""
    payload = decode_token(request.token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token payload",
        )

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    user.hashed_password = pwd_context.hash(request.new_password)
    await db.commit()

    return {"message": "Password has been reset successfully"}


@router.post("/verify-email")
async def verify_email(
    token: str,
    db: DatabaseSession,
) -> dict:
    """Verify email with token."""
    payload = decode_token(token)
    if not payload or payload.get("type") != "email_verification":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token payload",
        )

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User not found",
        )

    if user.is_verified:
        return {"message": "Email already verified"}

    user.is_verified = True
    user.email_verified_at = datetime.now(timezone.utc)
    await db.commit()

    return {"message": "Email verified successfully"}


@router.post("/oauth/{provider}", response_model=TokenResponse)
async def oauth_login(
    provider: str,
    oauth_data: OAuthLoginRequest,
    response: Response,
    db: DatabaseSession,
) -> TokenResponse:
    """Login/register with OAuth provider (google, github, telegram)."""
    if provider not in ("google", "github", "telegram"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported OAuth provider",
        )

    # In a real implementation, you would:
    # 1. Exchange code for access token with provider
    # 2. Get user info from provider
    # 3. Find or create user
    # For now, return a placeholder
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail=f"OAuth login with {provider} not yet implemented",
    )