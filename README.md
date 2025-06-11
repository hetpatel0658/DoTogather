# DoTogather - Flutter & Python Backend

A comprehensive daily micro-task planner with Flutter mobile app and Python FastAPI backend, integrated with Supabase for authentication and storage.

## 🏗️ Architecture

This repository contains two main components:

### 📱 Flutter Mobile App (`flutter_app/`)
- **Framework**: Flutter with Dart
- **State Management**: Riverpod
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage (S3-compatible)
- **Features**: Task management, voice commands, real-time updates, notifications

### 🐍 Python Backend (`DoTogatherBackend/`)
- **Framework**: FastAPI
- **Database**: PostgreSQL via Supabase
- **Authentication**: JWT tokens
- **Features**: REST API, WebSocket support, AI integration, email services

## ✨ Features

- **Task Management**: Create, organize, and track daily micro-tasks
- **Voice Commands**: Speech-to-text task creation and management
- **Real-time Updates**: Live synchronization across devices
- **Progress Tracking**: Visual progress indicators and streak counters
- **Badge System**: Achievement system for motivation
- **Social Features**: Explore public profiles and tasks
- **Smart Notifications**: Task reminders and achievement alerts
- **Cross-Platform**: Flutter app for iOS and Android

## 🚀 Quick Start

### Prerequisites

- Flutter SDK (>=3.0.0)
- Python 3.8+
- Supabase account
- PostgreSQL (via Supabase)

### 1. Backend Setup

```bash
cd DoTogatherBackend
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Flutter App Setup

```bash
cd flutter_app
flutter pub get
flutter run
```

## 🔧 Configuration

### Supabase Integration

The app is configured with Supabase:
- **URL**: `https://yqociffktetsduzlojqw.supabase.co`
- **Storage Endpoint**: `https://yqociffktetsduzlojqw.supabase.co/storage/v1/s3`
- **Region**: `ap-south-1`

Update the `anonKey` in `flutter_app/lib/config/supabase_config.dart` with your actual Supabase anon key.

## 📁 Project Structure

```
DoTogather/
├── DoTogatherBackend/          # Python FastAPI backend
├── flutter_app/               # Flutter mobile application
└── README.md                  # This file
```

## 🔌 API Integration

The Flutter app connects to the Python backend via:
- **REST API**: `http://localhost:8000/api`
- **WebSocket**: `ws://localhost:8000/ws`

All API endpoints are automatically authenticated using Supabase tokens.

## 🎯 Key Features Implemented

### Authentication
- ✅ Email/password registration and login
- ✅ Google Sign-In integration
- ✅ Supabase Auth integration
- ✅ Automatic token management

### Task Management
- ✅ CRUD operations for tasks
- ✅ Categories, priorities, and due dates
- ✅ Task completion tracking
- ✅ Drag-and-drop reordering

### Voice Features
- ✅ Speech-to-text task creation
- ✅ Voice command processing
- ✅ Text-to-speech feedback

### Real-time Features
- ✅ Live task updates via WebSocket
- ✅ Cross-device synchronization
- ✅ Real-time statistics

### Notifications
- ✅ Task reminder notifications
- ✅ Achievement notifications
- ✅ Streak milestone alerts

## 📱 Platform Support

- ✅ Android
- ✅ iOS
- ✅ Web (with limitations on voice features)

## 🔗 Links

- [Flutter App Documentation](flutter_app/README.md)
- [Backend API Documentation](DoTogatherBackend/README.md)
- [Conversion Analysis](CONVERSION_ANALYSIS.md)
