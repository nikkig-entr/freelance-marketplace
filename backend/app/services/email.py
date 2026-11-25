import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from app.core.config import settings
from app.core.security import create_access_token


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
) -> bool:
    """Send email via SMTP."""
    if not settings.SMTP_HOST:
        return False

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
        msg["To"] = to_email

        if text_content:
            msg.attach(MIMEText(text_content, "plain"))
        msg.attach(MIMEText(html_content, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            if settings.SMTP_USE_TLS:
                server.starttls()
            if settings.SMTP_USER and settings.SMTP_PASSWORD:
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception:
        # Log error in production
        return False


async def send_verification_email(email: str, user_id: int, role: str = "freelancer", plan: str = "starter") -> bool:
    """Send email verification link."""
    token = create_access_token({"user_id": user_id, "role": role, "plan": plan})
    verification_url = f"{settings.FRONTEND_URL}/verify-email?token={token}"

    subject = "Verify your email address"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome to Freelance Marketplace!</h2>
            <p>Please click the button below to verify your email address:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{verification_url}"
                   style="background-color: #2563eb; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                    Verify Email
                </a>
            </p>
            <p>Or copy this link: <a href="{verification_url}">{verification_url}</a></p>
            <p>This link expires in 24 hours.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
                If you didn't create an account, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """
    text_content = f"""
    Welcome to Freelance Marketplace!

    Please verify your email by visiting: {verification_url}

    This link expires in 24 hours.

    If you didn't create an account, please ignore this email.
    """

    return await send_email(email, subject, html_content, text_content)


async def send_password_reset_email(email: str, user_id: int) -> bool:
    """Send password reset link."""
    # Use a special token type for password reset
    from app.core.security import create_access_token
    from jose import jwt
    from datetime import datetime, timedelta, timezone

    payload = {
        "sub": str(user_id),
        "type": "password_reset",
        "exp": datetime.now(timezone.utc) + timedelta(hours=1),
        "iat": datetime.now(timezone.utc),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"

    subject = "Reset your password"
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below:</p>
            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}"
                   style="background-color: #dc2626; color: white; padding: 12px 24px;
                          text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </p>
            <p>Or copy this link: <a href="{reset_url}">{reset_url}</a></p>
            <p>This link expires in 1 hour.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
                If you didn't request this, please ignore this email.
            </p>
        </div>
    </body>
    </html>
    """
    text_content = f"""
    Password Reset Request

    You requested to reset your password. Visit: {reset_url}

    This link expires in 1 hour.

    If you didn't request this, please ignore this email.
    """

    return await send_email(email, subject, html_content, text_content)


async def send_notification_email(
    email: str,
    subject: str,
    message: str,
    action_url: Optional[str] = None,
    action_text: Optional[str] = None,
) -> bool:
    """Send a generic notification email."""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb;">{subject}</h2>
            <p>{message}</p>
            {f'<p style="text-align: center; margin: 30px 0;"><a href="{action_url}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">{action_text}</a></p>' if action_url else ''}
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="font-size: 12px; color: #6b7280;">
                This is an automated message from Freelance Marketplace.
            </p>
        </div>
    </body>
    </html>
    """
    text_content = f"""
    {subject}

    {message}

    {f'Action: {action_text} - {action_url}' if action_url else ''}

    This is an automated message from Freelance Marketplace.
    """

    return await send_email(email, subject, html_content, text_content)