# DoTogather Flutter App

A Flutter version of the DoTogather Daily Micro-Task Planner, converted from the original React/TypeScript application while maintaining all features and UI design.

## Features

### ✅ Core Features (Converted from React App)
- **Authentication System**
  - Email/Password login and registration
  - Google Sign-In integration
  - Firebase Authentication
  - User profile management

- **Task Management**
  - Create, edit, delete tasks
  - Task categories (Personal, Work, Health, Learning, Social, Other)
  - Priority levels (Low, Medium, High)
  - Task frequencies (Once, Daily, Weekly, Monthly)
  - Due dates and reminders
  - Task completion tracking

- **Voice Commands**
  - Voice-to-text task creation
  - Voice navigation between screens
  - Voice task completion
  - Text-to-speech feedback

- **Progress Tracking**
  - Daily task statistics
  - Streak tracking
  - Points system
  - Completion rates
  - Analytics dashboard

- **User Interface**
  - Dark theme matching original design
  - Bottom navigation (Home, Tasks, Explore, Profile)
  - Responsive design
  - Smooth animations
  - Loading states and error handling

- **Notifications**
  - Task reminders
  - Completion notifications
  - Local notifications

### 🚀 Additional Flutter Features
- **Offline Support** - Local data caching with Hive
- **State Management** - Riverpod for reactive state management
- **Performance** - Optimized Flutter widgets and animations
- **Platform Integration** - Native Android/iOS features

## Tech Stack

### Frontend (Flutter)
- **Framework**: Flutter 3.x
- **Language**: Dart
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Local Storage**: Hive
- **Animations**: Flutter Animate
- **UI Components**: Material Design 3

### Backend & Services
- **Authentication**: Firebase Auth
- **Database**: Cloud Firestore
- **Voice**: Speech-to-Text, Text-to-Speech
- **Notifications**: Awesome Notifications
- **HTTP Client**: Dio

### Development Tools
- **Build System**: Flutter Build System
- **Code Generation**: build_runner
- **Logging**: Logger
- **Testing**: Flutter Test

## Project Structure

```
lib/
├── config/           # App configuration
│   ├── app_config.dart
│   ├── theme_config.dart
│   ├── firebase_config.dart
│   └── router_config.dart
├── models/           # Data models
│   ├── user.dart
│   ├── task.dart
│   └── badge.dart
├── services/         # Business logic services
│   ├── auth_service.dart
│   ├── task_service.dart
│   ├── voice_service.dart
│   └── notification_service.dart
├── providers/        # State management
│   ├── auth_provider.dart
│   ├── task_provider.dart
│   ├── voice_provider.dart
│   └── app_state_provider.dart
├── screens/          # UI screens
│   ├── auth/
│   ├── home/
│   ├── tasks/
│   ├── explore/
│   └── profile/
├── widgets/          # Reusable widgets
│   ├── common/
│   ├── auth/
│   ├── tasks/
│   └── home/
├── utils/            # Utility functions
├── app.dart          # Main app widget
└── main.dart         # App entry point
```

## Setup Instructions

### Prerequisites
- Flutter SDK (3.0 or higher)
- Dart SDK (3.0 or higher)
- Android Studio / VS Code
- Firebase project setup

### 1. Clone and Install Dependencies

```bash
cd /workspace/DoTogather/flutter_app
flutter pub get
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication with Email/Password and Google Sign-In
3. Create a Cloud Firestore database
4. Download configuration files:
   - `google-services.json` for Android (place in `android/app/`)
   - `GoogleService-Info.plist` for iOS (place in `ios/Runner/`)

### 3. Update Firebase Configuration

Update `lib/config/firebase_config.dart` with your Firebase project details:

```dart
static const FirebaseOptions web = FirebaseOptions(
  apiKey: 'your-web-api-key',
  appId: 'your-app-id',
  messagingSenderId: 'your-sender-id',
  projectId: 'your-project-id',
  authDomain: 'your-project.firebaseapp.com',
  storageBucket: 'your-project.appspot.com',
);
```

### 4. Generate Code

```bash
flutter packages pub run build_runner build
```

### 5. Run the App

```bash
# Debug mode
flutter run

# Release mode
flutter run --release

# Specific platform
flutter run -d android
flutter run -d ios
```

## Backend Integration

The Flutter app is designed to work with the existing FastAPI backend. Update the base URL in `lib/config/app_config.dart`:

```dart
static const String baseUrl = 'http://your-backend-url/api';
static const String wsUrl = 'ws://your-backend-url/ws';
```

### API Endpoints Used
- `POST /auth/login` - User authentication
- `POST /auth/register` - User registration
- `GET /tasks` - Fetch user tasks
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task
- `DELETE /tasks/{id}` - Delete task
- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile

## Voice Commands

The app supports the following voice commands:

### Task Management
- "Add task [task name]" - Create a new task
- "Complete task" - Mark the last task as complete
- "Create task [task name]" - Alternative task creation

### Navigation
- "Go to home" - Navigate to home screen
- "Go to tasks" - Navigate to tasks screen
- "Go to explore" - Navigate to explore screen
- "Go to profile" - Navigate to profile screen

### Information
- "Show stats" - Read current statistics
- "My stats" - Alternative stats command

## Features Comparison with React App

| Feature | React App | Flutter App | Status |
|---------|-----------|-------------|---------|
| Authentication | ✅ | ✅ | ✅ Complete |
| Task CRUD | ✅ | ✅ | ✅ Complete |
| Voice Commands | ✅ | ✅ | ✅ Complete |
| Bottom Navigation | ✅ | ✅ | ✅ Complete |
| Dark Theme | ✅ | ✅ | ✅ Complete |
| Statistics | ✅ | ✅ | ✅ Complete |
| Notifications | ✅ | ✅ | ✅ Complete |
| Offline Support | ❌ | ✅ | ✅ Enhanced |
| Badge System | ✅ | ✅ | ✅ Complete |
| User Profiles | ✅ | ✅ | ✅ Complete |

## Building for Production

### Android
```bash
flutter build apk --release
# or
flutter build appbundle --release
```

### iOS
```bash
flutter build ios --release
```

### Web
```bash
flutter build web --release
```

## Testing

```bash
# Run all tests
flutter test

# Run with coverage
flutter test --coverage

# Run integration tests
flutter drive --target=test_driver/app.dart
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the original React app for reference

## Acknowledgments

- Original React/TypeScript app developers
- Flutter and Dart teams
- Firebase team
- Open source community