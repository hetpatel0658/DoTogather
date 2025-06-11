from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from ..database import get_db
from ..models.user import User
from ..models.task import Task, TaskPriority, TaskCategory
from ..core.security import verify_token

router = APIRouter()
security = HTTPBearer()

class TaskCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: TaskPriority = TaskPriority.MEDIUM
    category: TaskCategory = TaskCategory.OTHER
    estimated_duration: Optional[int] = None
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    points: int = 10
    difficulty: int = 1

class TaskUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[TaskPriority] = None
    category: Optional[TaskCategory] = None
    estimated_duration: Optional[int] = None
    due_date: Optional[datetime] = None
    reminder_time: Optional[datetime] = None
    points: Optional[int] = None
    difficulty: Optional[int] = None
    is_completed: Optional[bool] = None

class TaskResponse(BaseModel):
    id: int
    name: str
    description: str = None
    is_completed: bool
    priority: TaskPriority
    category: TaskCategory
    estimated_duration: int = None
    actual_duration: int = None
    due_date: datetime = None
    reminder_time: datetime = None
    points: int
    difficulty: int
    order_index: int
    created_at: datetime
    completed_at: datetime = None

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user_id = verify_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.post("/", response_model=TaskResponse)
async def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get the highest order index for this user
    max_order = db.query(Task).filter(Task.owner_id == current_user.id).count()
    
    new_task = Task(
        name=task_data.name,
        description=task_data.description,
        priority=task_data.priority,
        category=task_data.category,
        estimated_duration=task_data.estimated_duration,
        due_date=task_data.due_date,
        reminder_time=task_data.reminder_time,
        points=task_data.points,
        difficulty=task_data.difficulty,
        order_index=max_order,
        owner_id=current_user.id
    )
    
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    
    return TaskResponse(
        id=new_task.id,
        name=new_task.name,
        description=new_task.description,
        is_completed=new_task.is_completed,
        priority=new_task.priority,
        category=new_task.category,
        estimated_duration=new_task.estimated_duration,
        actual_duration=new_task.actual_duration,
        due_date=new_task.due_date,
        reminder_time=new_task.reminder_time,
        points=new_task.points,
        difficulty=new_task.difficulty,
        order_index=new_task.order_index,
        created_at=new_task.created_at,
        completed_at=new_task.completed_at
    )

@router.get("/", response_model=List[TaskResponse])
async def get_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tasks = db.query(Task).filter(Task.owner_id == current_user.id).order_by(Task.order_index).all()
    
    return [TaskResponse(
        id=task.id,
        name=task.name,
        description=task.description,
        is_completed=task.is_completed,
        priority=task.priority,
        category=task.category,
        estimated_duration=task.estimated_duration,
        actual_duration=task.actual_duration,
        due_date=task.due_date,
        reminder_time=task.reminder_time,
        points=task.points,
        difficulty=task.difficulty,
        order_index=task.order_index,
        created_at=task.created_at,
        completed_at=task.completed_at
    ) for task in tasks]

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update task fields
    update_data = task_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # If task is being completed, update user points and completed_at
    if task_update.is_completed and not task.is_completed:
        task.completed_at = datetime.utcnow()
        current_user.points += task.points
        
        # Update streak logic here if needed
        
    elif not task_update.is_completed and task.is_completed:
        # Task is being uncompleted
        task.completed_at = None
        current_user.points = max(0, current_user.points - task.points)
    
    db.commit()
    db.refresh(task)
    
    return TaskResponse(
        id=task.id,
        name=task.name,
        description=task.description,
        is_completed=task.is_completed,
        priority=task.priority,
        category=task.category,
        estimated_duration=task.estimated_duration,
        actual_duration=task.actual_duration,
        due_date=task.due_date,
        reminder_time=task.reminder_time,
        points=task.points,
        difficulty=task.difficulty,
        order_index=task.order_index,
        created_at=task.created_at,
        completed_at=task.completed_at
    )

@router.delete("/{task_id}")
async def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id, Task.owner_id == current_user.id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}