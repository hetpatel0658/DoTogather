# DoTogather Backend Server

A Python FastAPI backend server for the DoTogather task management application.

## Features

- **Authentication**: Email-based authentication with JWT tokens
- **Email Verification**: SendGrid integration for email verification
- **Task Management**: CRUD operations for tasks with categories, priorities, and gamification
- **AI Assistant**: OpenAI integration for voice commands and task suggestions
- **Leaderboard**: Public user profiles and ranking system
- **Voice Processing**: Speech-to-text and wake word detection
- **File Storage**: Supabase integration for file uploads and storage

## Setup Instructions

### 1. Install Dependencies

```bash
cd DoTogatherBackend
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dotogather

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# JWT
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@dotogather.com

# Redis
REDIS_URL=redis://localhost:6379

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App Settings
APP_NAME=DoTogather
APP_VERSION=1.0.0
DEBUG=True
```

### 3. Database Setup

Create a PostgreSQL database and run migrations:

```bash
# Install PostgreSQL (Ubuntu/Debian)
sudo apt-get install postgresql postgresql-contrib

# Create database
sudo -u postgres createdb dotogather

# Run the server (it will create tables automatically)
python main.py
```

### 4. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your URL and keys
3. Create the following storage buckets:
   - `avatars` (public)
   - `task-attachments` (private)
   - `voice-recordings` (private)
   - `user-backups` (private)

### 5. SendGrid Setup

1. Create an account at [sendgrid.com](https://sendgrid.com)
2. Create an API key with Mail Send permissions
3. Verify your sender email address

### 6. OpenAI Setup

1. Create an account at [openai.com](https://openai.com)
2. Generate an API key
3. Add credits to your account

### 7. Redis Setup (Optional)

For production, install Redis for caching:

```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# macOS
brew install redis

# Start Redis
redis-server
```

## Running the Server

### Development

```bash
python main.py
```

The server will start on `http://localhost:8000`

### Production

```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Explore
- `GET /api/explore/leaderboard` - Get leaderboard
- `GET /api/explore/user/{id}` - Get public user profile

### AI Assistant
- `POST /api/ai/voice-task` - Process voice command
- `POST /api/ai/suggest-tasks` - Get task suggestions
- `WebSocket /api/ai/voice-chat` - Real-time voice chat

### Email
- `POST /api/email/send-verification` - Send verification email
- `POST /api/email/resend-verification` - Resend verification email

## Project Structure

```
DoTogatherBackend/
├── app/
│   ├── core/           # Core configuration and security
│   ├── models/         # Database models
│   ├── routers/        # API route handlers
│   ├── services/       # Business logic services
│   └── utils/          # Utility functions
├── main.py             # FastAPI application entry point
├── requirements.txt    # Python dependencies
└── .env.example        # Environment variables template
```

## Features Implementation

### Email Verification
- Users must verify their email before logging in
- Verification emails are sent using SendGrid
- Tokens expire after 24 hours

### Voice Commands
- Speech-to-text using OpenAI Whisper API
- Wake word detection for "chota ustad"
- AI-powered task extraction from natural language

### Gamification
- Points system for task completion
- User levels based on points
- Streak tracking for daily task completion
- Public leaderboard with rankings

### File Storage
- User avatars stored in Supabase Storage
- Task attachments support
- Voice recording storage
- Automatic data backups

## Deployment

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
```

### Environment Variables for Production

Make sure to set these environment variables in your production environment:
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - Strong secret key for JWT tokens
- `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` - Supabase configuration
- `SENDGRID_API_KEY` - SendGrid API key
- `OPENAI_API_KEY` - OpenAI API key
- `DEBUG=False` - Disable debug mode

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.