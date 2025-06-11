from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..database import Base
import enum

class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

class TaskCategory(str, enum.Enum):
    WORK = "work"
    PERSONAL = "personal"
    HEALTH = "health"
    LEARNING = "learning"
    SOCIAL = "social"
    OTHER = "other"

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    category = Column(Enum(TaskCategory), default=TaskCategory.OTHER)
    
    # Time management
    estimated_duration = Column(Integer, nullable=True)  # in minutes
    actual_duration = Column(Integer, nullable=True)  # in minutes
    due_date = Column(DateTime(timezone=True), nullable=True)
    reminder_time = Column(DateTime(timezone=True), nullable=True)
    
    # Gamification
    points = Column(Integer, default=10)
    difficulty = Column(Integer, default=1)  # 1-5 scale
    
    # Order and organization
    order_index = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Foreign keys
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Relationships
    owner = relationship("User", back_populates="tasks")