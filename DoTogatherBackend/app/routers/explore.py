from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from pydantic import BaseModel
from typing import List, Optional

from ..database import get_db
from ..models.user import User
from ..models.task import Task
from ..core.security import verify_token

router = APIRouter()
security = HTTPBearer()

class PublicUserProfile(BaseModel):
    id: int
    username: str
    full_name: str = None
    bio: str = None
    avatar_url: str = None
    points: int
    level: int
    current_streak: int
    longest_streak: int
    total_tasks_completed: int
    rank: int

class LeaderboardResponse(BaseModel):
    users: List[PublicUserProfile]
    total_users: int
    current_user_rank: Optional[int] = None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user_id = verify_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.get("/leaderboard", response_model=LeaderboardResponse)
async def get_leaderboard(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get public users with their task completion counts
    users_query = db.query(
        User,
        func.count(Task.id).label('total_tasks_completed')
    ).outerjoin(
        Task, (Task.owner_id == User.id) & (Task.is_completed == True)
    ).filter(
        User.is_public == True,
        User.is_verified == True
    ).group_by(User.id).order_by(
        desc(User.points),
        desc(User.current_streak),
        desc('total_tasks_completed')
    )
    
    # Get total count
    total_users = users_query.count()
    
    # Get paginated results
    users_data = users_query.offset(offset).limit(limit).all()
    
    # Calculate ranks
    public_users = []
    for idx, (user, task_count) in enumerate(users_data):
        public_users.append(PublicUserProfile(
            id=user.id,
            username=user.username or f"User{user.id}",
            full_name=user.full_name,
            bio=user.bio,
            avatar_url=user.avatar_url,
            points=user.points,
            level=user.level,
            current_streak=user.current_streak,
            longest_streak=user.longest_streak,
            total_tasks_completed=task_count,
            rank=offset + idx + 1
        ))
    
    # Find current user's rank if they are public
    current_user_rank = None
    if current_user.is_public:
        # Get all users ranked by points
        all_users = db.query(User).filter(
            User.is_public == True,
            User.is_verified == True
        ).order_by(
            desc(User.points),
            desc(User.current_streak)
        ).all()
        
        for idx, user in enumerate(all_users):
            if user.id == current_user.id:
                current_user_rank = idx + 1
                break
    
    return LeaderboardResponse(
        users=public_users,
        total_users=total_users,
        current_user_rank=current_user_rank
    )

@router.get("/user/{user_id}", response_model=PublicUserProfile)
async def get_public_user_profile(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user with task completion count
    user_data = db.query(
        User,
        func.count(Task.id).label('total_tasks_completed')
    ).outerjoin(
        Task, (Task.owner_id == User.id) & (Task.is_completed == True)
    ).filter(
        User.id == user_id,
        User.is_public == True,
        User.is_verified == True
    ).group_by(User.id).first()
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found or profile is private"
        )
    
    user, task_count = user_data
    
    # Calculate rank
    users_above = db.query(User).filter(
        User.is_public == True,
        User.is_verified == True,
        User.points > user.points
    ).count()
    
    rank = users_above + 1
    
    return PublicUserProfile(
        id=user.id,
        username=user.username or f"User{user.id}",
        full_name=user.full_name,
        bio=user.bio,
        avatar_url=user.avatar_url,
        points=user.points,
        level=user.level,
        current_streak=user.current_streak,
        longest_streak=user.longest_streak,
        total_tasks_completed=task_count,
        rank=rank
    )