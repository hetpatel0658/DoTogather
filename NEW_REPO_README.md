# 🎯 DoTogather - Complete Task Management App

> **A comprehensive task management application with React Native frontend, Python FastAPI backend, and cutting-edge NVIDIA NIM AI integration**

[![React Native](https://img.shields.io/badge/React%20Native-0.74-blue.svg)](https://reactnative.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA%20NIM-Llama%203.1-orange.svg)](https://build.nvidia.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-yellow.svg)](https://python.org/)

## 🌟 **Features Overview**

### 📱 **Mobile App (React Native)**
- **Task Management**: Create, edit, delete tasks with categories and priorities
- **Gamification**: Points system, levels, streaks, and leaderboards
- **Voice Commands**: "Chota Ustad" AI assistant for hands-free task creation
- **User Profiles**: Authentication, avatars, and public profile sharing
- **Real-time Chat**: AI-powered productivity guidance and suggestions
- **Offline Support**: Works without internet connection
- **Cross-platform**: iOS and Android support

### 🤖 **AI Integration (NVIDIA NIM)**
- **Advanced LLM**: Llama 3.1 70B for complex reasoning and analysis
- **Fast LLM**: Llama 3.1 8B for real-time responses and chat
- **Speech Recognition**: NVIDIA Canary ASR for multilingual voice input
- **Text-to-Speech**: NVIDIA FastPitch TTS for natural voice responses
- **Task Extraction**: AI-powered natural language task creation
- **Productivity Analysis**: Smart insights and pattern recognition

### 🔧 **Backend (Python FastAPI)**
- **RESTful API**: Complete CRUD operations with automatic documentation
- **Authentication**: JWT-based auth with email verification
- **Database**: PostgreSQL with SQLAlchemy ORM
- **File Storage**: Supabase integration for avatars and attachments
- **Email Service**: SendGrid for verification and notifications
- **Real-time Features**: WebSocket support for live updates

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm/yarn
- Python 3.11+
- PostgreSQL database
- Supabase account
- NVIDIA NIM API access

### **1. Clone Repository**
```bash
git clone https://github.com/YOUR_USERNAME/DoTogather-Complete.git
cd DoTogather-Complete
```

### **2. Backend Setup**
```bash
cd DoTogatherBackend
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your configuration
python main.py
```

### **3. Mobile App Setup**
```bash
cd DoTogatherRN
npm install
# For iOS
npx react-native run-ios
# For Android
npx react-native run-android
```

## 📁 **Project Structure**

```
DoTogather-Complete/
├── 📱 DoTogatherRN/              # React Native Mobile App
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   ├── screens/              # App screens
│   │   ├── services/             # API and AI services
│   │   ├── navigation/           # Navigation setup
│   │   ├── store/                # State management
│   │   └── utils/                # Helper functions
│   ├── android/                  # Android-specific code
│   ├── ios/                      # iOS-specific code
│   └── package.json
│
├── 🔧 DoTogatherBackend/         # Python FastAPI Backend
│   ├── app/
│   │   ├── routers/              # API endpoints
│   │   ├── services/             # Business logic
│   │   ├── models/               # Database models
│   │   ├── core/                 # Configuration
│   │   └── utils/                # Helper functions
│   ├── main.py                   # Server entry point
│   └── requirements.txt
│
└── 📚 Documentation/             # Comprehensive guides
    ├── SETUP_GUIDE.md
    ├── NVIDIA_NIM_INTEGRATION.md
    └── API_DOCUMENTATION.md
```

## 🤖 **NVIDIA NIM AI Models**

| Model | Purpose | Use Case |
|-------|---------|----------|
| **Llama 3.1 70B** | Advanced reasoning | Productivity analysis, complex task suggestions |
| **Llama 3.1 8B** | Fast responses | Real-time chat, quick task extraction |
| **Canary 1B** | Speech recognition | Voice commands, "Chota Ustad" wake word |
| **FastPitch TTS** | Text-to-speech | AI voice responses, audio feedback |

## 🎯 **Key Features Demo**

### **Voice Command Example**
```
User: "Chota Ustad, I need to buy groceries tomorrow evening"
↓
AI Processing: NVIDIA Canary ASR → Llama 3.1 8B → Task Creation
↓
Result: Task "Buy groceries" created with category "shopping", due tomorrow
```

### **AI Chat Example**
```
User: "How can I be more productive?"
↓
AI Response: "Try breaking large tasks into smaller steps and setting daily goals!"
```

### **Productivity Analysis**
```
AI analyzes your task patterns and provides:
- Productivity score (0-100)
- Strengths identification
- Personalized recommendations
- Optimal work time suggestions
```

## 🔧 **Configuration**

### **Backend Environment (.env)**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/dotogather

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# NVIDIA NIM (Pre-configured)
NVIDIA_API_KEY=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

# Email
SENDGRID_API_KEY=your_sendgrid_key

# Security
SECRET_KEY=your_jwt_secret
```

### **Mobile App Environment**
```env
API_BASE_URL=http://localhost:8000
NVIDIA_API_KEY=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
```

## 📊 **API Endpoints**

### **Authentication**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification

### **Tasks**
- `GET /api/tasks` - Get user tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

### **AI Assistant**
- `POST /api/ai/voice-task` - Process voice command
- `POST /api/ai/chat` - AI chat conversation
- `POST /api/ai/suggest-tasks` - Get AI task suggestions
- `POST /api/ai/analyze-productivity` - Productivity analysis

### **Users & Social**
- `GET /api/users/profile` - Get user profile
- `GET /api/explore/leaderboard` - Public leaderboard
- `GET /api/explore/user/{id}` - Public user profile

## 🚀 **Deployment**

### **Backend Deployment (Railway/Heroku)**
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="your_postgresql_url"
export NVIDIA_API_KEY="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"

# Run server
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

### **Mobile App Deployment**
```bash
# Build for production
npx react-native build-android
npx react-native build-ios

# Or use Expo for easier deployment
npx expo build:android
npx expo build:ios
```

## 🔐 **Security Features**

- **JWT Authentication**: Secure token-based authentication
- **Email Verification**: Required email verification for new users
- **Password Hashing**: Bcrypt password hashing
- **CORS Protection**: Configurable CORS middleware
- **Rate Limiting**: API rate limiting for abuse prevention
- **Input Validation**: Pydantic models for request validation

## 📈 **Performance Optimizations**

- **Database Indexing**: Optimized database queries
- **Caching**: Redis caching for frequently accessed data
- **Async Processing**: Asynchronous API calls and database operations
- **Image Optimization**: Compressed images and lazy loading
- **Bundle Splitting**: Optimized React Native bundle size

## 🧪 **Testing**

### **Backend Tests**
```bash
cd DoTogatherBackend
pytest tests/
```

### **Mobile App Tests**
```bash
cd DoTogatherRN
npm test
```

## 📚 **Documentation**

- **[Setup Guide](SETUP_GUIDE.md)** - Complete installation instructions
- **[NVIDIA NIM Integration](DoTogatherBackend/NVIDIA_NIM_INTEGRATION.md)** - AI integration details
- **[API Documentation](http://localhost:8000/docs)** - Interactive API docs
- **[Architecture Guide](DoTogatherBackend/ARCHITECTURE_INTERCONNECTIONS.md)** - System architecture

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **NVIDIA NIM** for providing cutting-edge AI models
- **React Native** community for excellent mobile development tools
- **FastAPI** for the amazing Python web framework
- **Supabase** for backend-as-a-service platform

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/DoTogather-Complete/issues)
- **Discussions**: [GitHub Discussions](https://github.com/YOUR_USERNAME/DoTogather-Complete/discussions)
- **Email**: support@dotogather.com

---

**🎉 Built with ❤️ using React Native, FastAPI, and NVIDIA NIM AI**