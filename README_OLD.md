# DoTogather - Daily Micro-Task Planner

A modern, full-stack task management application built with React and Node.js, featuring AI-powered task suggestions, gamification, and real-time collaboration.

## 🚀 Features

### Core Features
- **Task Management**: Create, edit, delete, and organize tasks with priorities and categories
- **Gamification**: Points, levels, streaks, and badges to motivate productivity
- **AI Integration**: Smart task suggestions, analysis, and productivity tips
- **Real-time Updates**: Live task updates using Socket.IO
- **User Authentication**: Secure registration, login, and email verification
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### Advanced Features
- **Task Analytics**: Detailed statistics and productivity insights
- **Subtasks**: Break down complex tasks into manageable steps
- **Due Dates & Reminders**: Email notifications for upcoming tasks
- **Task Templates**: Pre-built task templates for common activities
- **Leaderboard**: Compare progress with other users

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React Context API with custom hooks
- **Routing**: React Router DOM for navigation
- **Animations**: Framer Motion for smooth interactions

### Backend (Node.js + Express)
- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Email Service**: Nodemailer with SendGrid integration
- **AI Integration**: OpenAI API for intelligent features
- **Real-time**: Socket.IO for live updates
- **Security**: Helmet, CORS, rate limiting

## 📁 Project Structure

```
DoTogather/
├── webapp/                 # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── services/      # API service layer
│   │   ├── context/       # React context providers
│   │   ├── types/         # TypeScript type definitions
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
│
├── server/                # Node.js backend application
│   ├── src/
│   │   ├── models/        # Database models
│   │   ├── routes/        # API route definitions
│   │   ├── middleware/    # Custom middleware
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── package.json       # Backend dependencies
│
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud instance)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/hetpatel0658/DoTogather.git
cd DoTogather
```

### 2. Backend Setup
```bash
cd server
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration

# Start the server
npm run dev
```

### 3. Frontend Setup
```bash
cd webapp
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your configuration

# Start the development server
npm run dev
```

### 4. Environment Configuration

#### Backend (.env)
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/dotogather

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=7d

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
FROM_EMAIL=noreply@dotogather.com

# OpenAI Configuration
OPENAI_API_KEY=your-openai-api-key

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

#### Frontend (.env)
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=DoTogather
VITE_APP_VERSION=1.0.0
```

## 🚀 Quick Start

1. **Start MongoDB** (if running locally)
2. **Start the backend server**:
   ```bash
   cd server && npm run dev
   ```
3. **Start the frontend**:
   ```bash
   cd webapp && npm run dev
   ```
4. **Open your browser** to `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email address
- `GET /api/auth/me` - Get current user info

### Task Endpoints
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `GET /api/tasks/stats` - Get task statistics

### AI Endpoints
- `POST /api/ai/suggest-tasks` - Get AI task suggestions
- `POST /api/ai/analyze-task` - Analyze task description
- `GET /api/ai/productivity-tips` - Get productivity tips

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

**Happy Task Managing! 🎯**

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/0057f68e-29a4-4e1e-8b19-25d70e48dc16) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/0057f68e-29a4-4e1e-8b19-25d70e48dc16) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
