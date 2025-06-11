from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr
from ..services.email_service import EmailService

router = APIRouter()

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class EmailVerificationResponse(BaseModel):
    message: str
    success: bool

@router.post("/send-verification", response_model=EmailVerificationResponse)
async def send_verification_email(request: EmailVerificationRequest):
    """Send verification email to user"""
    try:
        email_service = EmailService()
        # Generate a verification token (in real app, this should be stored in DB)
        import secrets
        verification_token = secrets.token_urlsafe(32)
        
        await email_service.send_verification_email(request.email, verification_token)
        
        return EmailVerificationResponse(
            message="Verification email sent successfully",
            success=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to send verification email: {str(e)}"
        )

@router.post("/resend-verification", response_model=EmailVerificationResponse)
async def resend_verification_email(request: EmailVerificationRequest):
    """Resend verification email to user"""
    try:
        email_service = EmailService()
        # Generate a new verification token
        import secrets
        verification_token = secrets.token_urlsafe(32)
        
        await email_service.send_verification_email(request.email, verification_token)
        
        return EmailVerificationResponse(
            message="Verification email resent successfully",
            success=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to resend verification email: {str(e)}"
        )