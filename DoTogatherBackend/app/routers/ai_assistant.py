from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json
import asyncio

from ..database import get_db
from ..models.user import User
from ..models.task import Task
from ..core.security import verify_token
from ..services.ai_service import AIService
from ..services.voice_service import VoiceService

router = APIRouter()
security = HTTPBearer()

class VoiceTaskRequest(BaseModel):
    audio_data: str  # Base64 encoded audio
    wake_word: str = "chota ustad"

class TaskSuggestionRequest(BaseModel):
    context: str
    user_preferences: Optional[dict] = None

class TaskSuggestionResponse(BaseModel):
    suggested_tasks: List[str]
    reasoning: str

class VoiceResponse(BaseModel):
    transcribed_text: str
    extracted_task: Optional[str] = None
    response_message: str
    task_created: bool = False

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    user_id = verify_token(credentials.credentials)
    user = db.query(User).filter(User.id == int(user_id)).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return user

@router.post("/voice-task", response_model=VoiceResponse)
async def process_voice_task(
    request: VoiceTaskRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Process voice input to create tasks"""
    try:
        voice_service = VoiceService()
        ai_service = AIService()
        
        # Convert audio to text
        transcribed_text = await voice_service.speech_to_text(request.audio_data)
        
        if not transcribed_text:
            return VoiceResponse(
                transcribed_text="",
                response_message="Sorry, I couldn't understand what you said. Please try again.",
                task_created=False
            )
        
        # Extract task from transcribed text using AI
        task_info = await ai_service.extract_task_from_text(transcribed_text)
        
        if not task_info.get("task_name"):
            return VoiceResponse(
                transcribed_text=transcribed_text,
                response_message="I heard you, but I couldn't identify a specific task. Could you be more specific?",
                task_created=False
            )
        
        # Create the task
        new_task = Task(
            name=task_info["task_name"],
            description=task_info.get("description"),
            priority=task_info.get("priority", "medium"),
            category=task_info.get("category", "other"),
            points=task_info.get("points", 10),
            owner_id=current_user.id,
            order_index=db.query(Task).filter(Task.owner_id == current_user.id).count()
        )
        
        db.add(new_task)
        db.commit()
        db.refresh(new_task)
        
        response_message = f"Great! I've added '{task_info['task_name']}' to your task list."
        if task_info.get("description"):
            response_message += f" Description: {task_info['description']}"
        
        return VoiceResponse(
            transcribed_text=transcribed_text,
            extracted_task=task_info["task_name"],
            response_message=response_message,
            task_created=True
        )
        
    except Exception as e:
        return VoiceResponse(
            transcribed_text=request.audio_data[:50] + "...",
            response_message=f"Sorry, there was an error processing your request: {str(e)}",
            task_created=False
        )

@router.post("/suggest-tasks", response_model=TaskSuggestionResponse)
async def suggest_tasks(
    request: TaskSuggestionRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered task suggestions based on context"""
    try:
        ai_service = AIService()
        
        # Get user's recent tasks for context
        recent_tasks = db.query(Task).filter(
            Task.owner_id == current_user.id
        ).order_by(Task.created_at.desc()).limit(10).all()
        
        user_context = {
            "recent_tasks": [task.name for task in recent_tasks],
            "user_level": current_user.level,
            "current_streak": current_user.current_streak,
            "preferences": request.user_preferences or {}
        }
        
        suggestions = await ai_service.suggest_tasks(request.context, user_context)
        
        return TaskSuggestionResponse(
            suggested_tasks=suggestions["tasks"],
            reasoning=suggestions["reasoning"]
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating task suggestions: {str(e)}"
        )

@router.websocket("/voice-chat")
async def voice_chat_websocket(websocket: WebSocket, token: str, db: Session = Depends(get_db)):
    """WebSocket endpoint for real-time voice chat with AI assistant"""
    try:
        # Verify token
        user_id = verify_token(token)
        user = db.query(User).filter(User.id == int(user_id)).first()
        
        if not user:
            await websocket.close(code=4001, reason="Invalid token")
            return
        
        await websocket.accept()
        
        voice_service = VoiceService()
        ai_service = AIService()
        
        while True:
            try:
                # Receive audio data
                data = await websocket.receive_text()
                message = json.loads(data)
                
                if message["type"] == "audio":
                    # Process audio
                    transcribed_text = await voice_service.speech_to_text(message["audio_data"])
                    
                    # Get AI response
                    ai_response = await ai_service.chat_response(transcribed_text, user.id)
                    
                    # Send response back
                    await websocket.send_text(json.dumps({
                        "type": "response",
                        "transcribed_text": transcribed_text,
                        "ai_response": ai_response,
                        "timestamp": str(asyncio.get_event_loop().time())
                    }))
                
                elif message["type"] == "wake_word_detected":
                    # Send acknowledgment
                    await websocket.send_text(json.dumps({
                        "type": "wake_word_ack",
                        "message": "I'm listening! How can I help you with your tasks?"
                    }))
                
            except WebSocketDisconnect:
                break
            except Exception as e:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": f"Error: {str(e)}"
                }))
                
    except Exception as e:
        await websocket.close(code=4000, reason=str(e))