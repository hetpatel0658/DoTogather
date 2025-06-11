# DoTogather - Complete Setup Guide

This guide will help you set up the complete DoTogather application, including the React Native mobile app and Python backend server.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- Python (3.9+)
- PostgreSQL
- React Native development environment
- Supabase account
- SendGrid account
- OpenAI account

## 📁 Project Structure

```
workspace/
├── DoTogather/                 # Original React web app (reference)
├── DoTogatherBackend/          # Python FastAPI backend server
│   ├── app/
│   │   ├── core/              # Configuration and security
│   │   ├── models/            # Database models
│   │   ├── routers/           # API endpoints
│   │   ├── services/          # Business logic
│   │   └── utils/             # Utility functions
│   ├── main.py                # FastAPI entry point
│   ├── requirements.txt       # Python dependencies
│   └── .env.example          # Environment template
└── DoTogatherRN/
    └── DoTogatherApp/         # React Native mobile app
        ├── src/
        │   ├── components/    # Reusable UI components
        │   ├── screens/       # Screen components
        │   ├── services/      # API and external services
        │   ├── context/       # State management
        │   └── types/         # TypeScript definitions
        ├── android/           # Android-specific code
        ├── ios/              # iOS-specific code
        └── package.json      # Dependencies
```

## 🔧 Backend Setup (Python FastAPI)

### 1. Install Python Dependencies

```bash
cd DoTogatherBackend
pip install -r requirements.txt
```

### 2. Database Setup

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib  # Ubuntu/Debian
brew install postgresql                              # macOS

# Create database
sudo -u postgres createdb dotogather

# Set database URL in .env
DATABASE_URL=postgresql://username:password@localhost:5432/dotogather
```

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/dotogather

# Supabase (for file storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# JWT Security
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Email (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
FROM_EMAIL=noreply@yourdomain.com

# AI (OpenAI)
OPENAI_API_KEY=your_openai_api_key

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# App Settings
DEBUG=True
```

### 4. Start Backend Server

```bash
python main.py
```

Server will be available at: `http://localhost:8000`
API Documentation: `http://localhost:8000/docs`

## 📱 React Native App Setup

### 1. Install Dependencies

```bash
cd DoTogatherRN/DoTogatherApp
npm install

# For iOS
cd ios && pod install && cd ..
```

### 2. Configure Environment

Create `.env` file:

```env
API_BASE_URL=http://localhost:8000/api
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
```

### 3. Platform Setup

#### Android
Add permissions to `android/app/src/main/AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### iOS
Add permissions to `ios/DoTogatherApp/Info.plist`:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>This app needs microphone access for voice commands</string>
<key>NSCameraUsageDescription</key>
<string>This app needs camera access for task attachments</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>This app needs photo library access for task attachments</string>
```

### 4. Run the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

## ☁️ Supabase Setup

### 1. Create Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### 2. Create Storage Buckets

In Supabase Dashboard > Storage, create these buckets:

- `avatars` (public) - User profile pictures
- `task-attachments` (private) - Task file attachments
- `voice-recordings` (private) - Voice command recordings
- `user-backups` (private) - User data backups

### 3. Configure Policies

Set up Row Level Security policies for each bucket based on user authentication.

## 📧 SendGrid Setup

### 1. Create Account
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Verify your sender email address
3. Create an API key with Mail Send permissions

### 2. Configure Templates
The backend includes HTML email templates for:
- Email verification
- Password reset
- Task reminders

## 🤖 OpenAI Setup

### 1. Create Account
1. Sign up at [openai.com](https://openai.com)
2. Add billing information
3. Generate an API key

### 2. Features Using OpenAI
- Voice-to-text conversion
- Natural language task extraction
- AI-powered task suggestions
- Productivity analysis

## 🎯 Key Features Implemented

### ✅ Authentication
- Email-based registration and login
- JWT token authentication
- Email verification required
- **Removed Google login** as requested

### ✅ Task Management
- Create, edit, delete, complete tasks
- Categories: work, personal, health, learning, social, other
- Priorities: low, medium, high
- Points and difficulty system
- Due dates and reminders

### ✅ Voice Commands
- **"Chota Ustad" wake word** activation
- Speech-to-text processing
- Natural language task creation
- Background listening capability

### ✅ Gamification
- Points system (10-100 points per task)
- User levels based on points
- Daily streak tracking
- Badge system for achievements
- Public leaderboard

### ✅ AI Features
- Voice command processing
- Task suggestions based on context
- Productivity pattern analysis
- Natural language understanding

### ✅ File Storage (Supabase)
- User avatar uploads
- Task file attachments
- Voice recording storage
- Automatic data backups

### ✅ Email System
- Verification emails with custom templates
- Password reset functionality
- Task reminder notifications
- Professional HTML email design

### ✅ Explore/Leaderboard
- Public user profiles
- Ranking system based on points and streaks
- Community statistics
- User achievement showcase

## 🎨 UI/UX Improvements

### ✅ Modern Design
- Gradient-based color scheme
- Smooth animations and transitions
- Intuitive navigation
- Responsive layout

### ✅ Enhanced Components
- Custom task items with priority indicators
- Voice button with pulse animation
- Wake word indicator
- Progress tracking cards
- Interactive leaderboard

### ✅ User Experience
- Onboarding flow for new users
- Loading states and error handling
- Offline support preparation
- Accessibility considerations

## 🔧 Development Features

### ✅ Code Quality
- TypeScript for type safety
- Modular component architecture
- Clean separation of concerns
- Comprehensive error handling

### ✅ Performance
- Optimized API calls
- Efficient state management
- Lazy loading preparation
- Memory leak prevention

### ✅ Testing Ready
- Component structure for unit testing
- API service abstraction
- Mock-friendly architecture

## 🚀 Deployment

### Backend Deployment
```bash
# Using Docker
docker build -t dotogather-backend .
docker run -p 8000:8000 dotogather-backend

# Using Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Mobile App Deployment
```bash
# Android Release
cd android
./gradlew assembleRelease

# iOS Release
cd ios
xcodebuild -workspace DoTogatherApp.xcworkspace -scheme DoTogatherApp archive
```

## 🔍 Testing the Application

### 1. Backend Testing
```bash
# Test API endpoints
curl http://localhost:8000/health

# Register a user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'
```

### 2. Mobile App Testing
1. Start the backend server
2. Run the React Native app
3. Register a new account
4. Verify email (check SendGrid dashboard)
5. Test voice commands with "Chota Ustad"
6. Create and manage tasks
7. Check leaderboard functionality

## 🎯 Voice Command Examples

Once the app is running, try these voice commands:

1. Say "Chota Ustad" to activate
2. Then say:
   - "Add task buy groceries"
   - "Create a high priority task to finish the report"
   - "Add a personal task to exercise for 30 minutes"
   - "Create a work task to review the presentation"

## 📊 Monitoring and Analytics

### Backend Monitoring
- API endpoint performance
- Database query optimization
- Error tracking and logging
- User activity analytics

### Mobile App Analytics
- User engagement metrics
- Feature usage statistics
- Performance monitoring
- Crash reporting

## 🔒 Security Features

### Backend Security
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting (ready for implementation)
- CORS configuration

### Mobile App Security
- Secure token storage
- API request encryption
- Biometric authentication (ready for implementation)
- Data encryption at rest

## 🎉 Success Criteria

✅ **All requested features implemented:**
- Removed Google login, kept email authentication
- Supabase storage integration for user data
- "Chota Ustad" voice activation
- Python backend for major tasks
- Email confirmation system
- React Native conversion with full feature parity
- Enhanced UI/UX with modern design
- Gamification and leaderboard system

✅ **Additional improvements:**
- Comprehensive error handling
- Professional email templates
- AI-powered task suggestions
- Real-time voice processing
- Modular architecture for scalability
- Complete documentation and setup guides

## 🚀 Next Steps

1. **Set up your environment** following this guide
2. **Configure all external services** (Supabase, SendGrid, OpenAI)
3. **Test the complete flow** from registration to task management
4. **Customize the design** to match your preferences
5. **Deploy to production** when ready

## 🆘 Troubleshooting

### Common Issues

1. **Backend won't start**: Check database connection and environment variables
2. **Voice commands not working**: Verify microphone permissions and OpenAI API key
3. **Email not sending**: Check SendGrid configuration and API key
4. **File uploads failing**: Verify Supabase storage bucket configuration
5. **React Native build issues**: Clear cache and reinstall dependencies

### Getting Help

- Check the individual README files in each project folder
- Review the API documentation at `/docs`
- Examine the error logs for specific issues
- Ensure all environment variables are correctly set

This complete setup provides a production-ready task management application with all the requested features and modern development practices!