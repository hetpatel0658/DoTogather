# DoTogather Backend

Node.js/Express backend for DoTogather task management application with Supabase Storage.

## Features

- User authentication and authorization
- Task management with real-time updates
- Supabase Storage integration
- RESTful API endpoints
- Socket.IO for real-time features
- Email notifications
- Gamification system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase Storage
- **Authentication**: JWT
- **Real-time**: Socket.IO
- **Email**: Nodemailer
- **File Storage**: Supabase Storage

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase credentials
```

3. Start the server:
```bash
npm start
```

The server will run on http://localhost:5000

## API Endpoints

- `GET /health` - Health check
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Environment Variables

- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `JWT_SECRET` - JWT signing secret
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key