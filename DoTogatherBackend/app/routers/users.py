from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from ..database import get_db
from ..models.user import User
from ..core.security import verify_token

router = APIRouter()
security = HTTPBearer()

class UserUpdate(BaseModel):
    username: Optional[str] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    is_public: Optional[bool] = None

class UserProfile(BaseModel):
    id: int
    username: str
    full_name: str = None
    bio: str = None
    avatar_url: str = None
    points: int
    level: int
    current_streak: int
    longest_streak: int
    is_public: bool

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user_id = verify_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/profile", response_model=UserProfile)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    return UserProfile(
        id=current_user.id,
        username=current_user.username or "",
        full_name=current_user.full_name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        points=current_user.points,
        level=current_user.level,
        current_streak=current_user.current_streak,
        longest_streak=current_user.longest_streak,
        is_public=current_user.is_public
    )

@router.put("/profile", response_model=UserProfile)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if username is already taken
    if user_update.username and user_update.username != current_user.username:
        existing_user = db.query(User).filter(User.username == user_update.username).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user fields
    if user_update.username is not None:
        current_user.username = user_update.username
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    if user_update.bio is not None:
        current_user.bio = user_update.bio
    if user_update.is_public is not None:
        current_user.is_public = user_update.is_public
    
    db.commit()
    db.refresh(current_user)
    
    return UserProfile(
        id=current_user.id,
        username=current_user.username or "",
        full_name=current_user.full_name,
        bio=current_user.bio,
        avatar_url=current_user.avatar_url,
        points=current_user.points,
        level=current_user.level,
        current_streak=current_user.current_streak,
        longest_streak=current_user.longest_streak,
        is_public=current_user.is_public
    )