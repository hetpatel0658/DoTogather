from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv
import os

from app.routers import auth, users, tasks, explore, ai_assistant, email_service
from app.database import engine, Base
from app.core.config import settings

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up DoTogather Backend...")
    # Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown
    print("Shutting down DoTogather Backend...")

app = FastAPI(
    title="DoTogather API",
    description="Backend API for DoTogather Task Management App",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["authentication"])
app.include_router(users.router, prefix="/api/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(explore.router, prefix="/api/explore", tags=["explore"])
app.include_router(ai_assistant.router, prefix="/api/ai", tags=["ai-assistant"])
app.include_router(email_service.router, prefix="/api/email", tags=["email"])

@app.get("/")
async def root():
    return {"message": "DoTogather Backend API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "DoTogather Backend is running"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True if os.getenv("DEBUG", "False").lower() == "true" else False
    )