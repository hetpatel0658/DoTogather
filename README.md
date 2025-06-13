# DoTogather

A collaborative task management application built with React and Node.js, featuring real-time collaboration and Supabase Storage integration.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT
- **Task Management**: Create, edit, delete, and organize tasks
- **Real-time Collaboration**: Live updates using Socket.IO
- **Gamification**: Points, levels, streaks, and badges
- **File Storage**: Supabase Storage for attachments and media
- **Responsive Design**: Works on desktop and mobile
- **Dark/Light Theme**: User preference support

## 🏗️ Tech Stack

### Frontend (`/frontend`)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **Vite** for build tooling
- **Socket.IO Client** for real-time features

### Backend (`/backend`)
- **Node.js** with Express.js
- **Supabase Storage** for data persistence
- **JWT** for authentication
- **Socket.IO** for real-time communication
- **Nodemailer** for email notifications

## 📁 Project Structure

```
DoTogather/
├── backend/           # Node.js/Express API server
│   ├── src/
│   │   ├── config/    # Database and app configuration
│   │   ├── models/    # Supabase Storage models
│   │   ├── routes/    # API route handlers
│   │   ├── middleware/# Authentication and validation
│   │   └── services/  # Email and external services
│   └── package.json
├── frontend/          # React/TypeScript web app
│   ├── src/
│   │   ├── components/# Reusable UI components
│   │   ├── pages/     # Page components
│   │   ├── hooks/     # Custom React hooks
│   │   └── context/   # State management
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- Supabase account and project
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/hetpatel0658/DoTogather.git
cd DoTogather
```

2. **Set up the backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your Supabase credentials
npm start
```

3. **Set up the frontend:**
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Edit .env.local with your backend URL
npm run dev
```

### Environment Variables

**Backend (.env):**
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Frontend (.env.local):**
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/verify` - Verify email
- `POST /api/auth/forgot-password` - Request password reset

### Tasks
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark task complete

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/stats` - Get user statistics

## 🔧 Development

### Running Tests
```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test
```

### Building for Production
```bash
# Build frontend
cd frontend && npm run build

# Start production server
cd backend && npm run start:prod
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com/) for the backend infrastructure
- [shadcn/ui](https://ui.shadcn.com/) for the UI components
- [Tailwind CSS](https://tailwindcss.com/) for styling

---

## Programming Language

This application is built using **JavaScript/TypeScript**:

- **Backend**: Node.js (JavaScript) with Express.js framework
- **Frontend**: React with TypeScript for type safety
- **Database**: Supabase Storage with JavaScript SDK
- **Build Tools**: Vite (JavaScript/TypeScript)
- **Package Management**: npm (Node Package Manager)

The project follows modern JavaScript/TypeScript development practices with:
- ES6+ features and modules
- TypeScript for static type checking
- Async/await for asynchronous operations
- Modern React hooks and functional components