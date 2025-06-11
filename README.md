# DoTogather - Flutter App & Server

A complete Flutter mobile application with Python server backend for daily micro-task planning and productivity tracking.

## 📱 Flutter App

A native mobile app built with Flutter/Dart that provides:

- **Cross-platform**: Runs on Android, iOS, and Web
- **Native Performance**: Smooth animations and fast response times
- **Offline Support**: Local data storage with Hive
- **Voice Commands**: Speech-to-text and text-to-speech integration
- **Real-time Sync**: Live updates with Python server backend
- **File Storage**: Supabase storage integration for profile images and attachments

### Features
- ✅ User authentication (Email/Password + Google Sign-In)
- ✅ Task management with categories, priorities, and due dates
- ✅ Voice command processing for hands-free operation
- ✅ Statistics and progress tracking with streaks
- ✅ Badge system and gamification
- ✅ Dark theme UI matching original design
- ✅ Push notifications and reminders
- ✅ Profile management and social features

## 🐍 Python Server Backend

FastAPI-based server providing:

- **REST API**: Complete CRUD operations for tasks and users
- **Authentication**: JWT token-based security
- **Real-time Updates**: WebSocket support for live data sync
- **Analytics**: Task statistics and progress tracking
- **AI Integration**: Voice command processing
- **Database**: PostgreSQL with SQLAlchemy ORM

## 🗄️ Supabase Storage

Integrated S3-compatible storage for:
- User profile images
- Task attachments
- File uploads/downloads
- Secure access with provided credentials

## 🚀 Quick Start

### Flutter App Setup
```bash
cd flutter_app
flutter pub get
flutter packages pub run build_runner build
flutter run
```

### Python Server Setup
```bash
cd DoTogatherBackend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Test Integration
```bash
cd flutter_app
python test_server_integration.py
```

## 📁 Project Structure

```
├── flutter_app/           # Complete Flutter application
│   ├── lib/
│   │   ├── config/        # App configuration (Supabase, API, theme)
│   │   ├── models/        # Data models (User, Task, Badge)
│   │   ├── services/      # Business logic (API, Auth, Storage, Voice)
│   │   ├── providers/     # Riverpod state management
│   │   ├── screens/       # UI screens (Auth, Home, Tasks, Profile)
│   │   └── widgets/       # Reusable UI components
│   ├── SETUP_GUIDE.md     # Detailed setup instructions
│   └── test_server_integration.py  # Server compatibility test
├── DoTogatherBackend/     # Python FastAPI server
└── DoTogatherRN/          # React Native version (legacy)
```

## 🔧 Configuration

### Required Setup
1. **Supabase**: Add your anon key to `flutter_app/lib/config/supabase_config.dart`
2. **Python Server**: Ensure server runs on `http://localhost:8000`
3. **CORS**: Configure CORS in Python server for Flutter app

### Pre-configured
- ✅ Supabase storage credentials
- ✅ API endpoints mapping
- ✅ Authentication flow
- ✅ File upload/download services

## 📚 Documentation

- **Setup Guide**: `flutter_app/SETUP_GUIDE.md` - Complete setup instructions
- **Conversion Analysis**: `CONVERSION_ANALYSIS.md` - Feature comparison with React app
- **API Documentation**: Server endpoints and request/response formats

## 🧪 Testing

- **Integration Test**: `flutter_app/test_server_integration.py`
- **Flutter Tests**: `flutter test` in flutter_app directory
- **Server Tests**: API endpoint testing with curl/Postman

## 🔄 Migration from React

This Flutter app provides 100% feature parity with the original React application while adding:
- Native mobile performance
- Offline capability
- File storage integration
- Better cross-platform support

## 📱 Supported Platforms

- ✅ Android (API 21+)
- ✅ iOS (iOS 11+)
- ✅ Web (Chrome, Firefox, Safari)
- 🔄 Desktop (Windows, macOS, Linux) - Coming soon

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Test with both Flutter app and Python server
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready for production deployment!** 🚀