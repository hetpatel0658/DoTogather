# DoTogather Flutter App Setup Guide

## Prerequisites

1. **Flutter SDK** (3.0 or higher)
2. **Dart SDK** (3.0 or higher)
3. **Python Server** (FastAPI backend)
4. **Supabase Account** (for storage)

## 1. Supabase Storage Configuration

Your Supabase storage is already configured in the app with these credentials:

```dart
// lib/config/supabase_config.dart
static const String storageEndpoint = 'https://yqociffktetsduzlojqw.supabase.co/storage/v1/s3';
static const String accessKeyId = 'e4311b251a1f0ab8784ef1470cc04515';
static const String secretAccessKey = '0dc20179a517d1dabc5f84c10e7d458f3a80cd82c8a8fb1a9af91ec1fe1f3c76';
static const String region = 'ap-south-1';
```

### Required: Add your Supabase Anon Key

You need to add your Supabase anonymous key to complete the setup:

1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the "anon public" key
4. Update `lib/config/supabase_config.dart`:

```dart
static const String supabaseAnonKey = 'your-supabase-anon-key-here';
```

## 2. Python Server Integration

The Flutter app is configured to connect to your Python server at:
- **Development**: `http://localhost:8000/api`
- **WebSocket**: `ws://localhost:8000/ws`

### API Endpoints Expected

The Flutter app expects these endpoints from your Python server:

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

#### User Management
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user profile
- `GET /api/users/stats` - Get user statistics

#### Task Management
- `GET /api/tasks` - Get user tasks (with query params: limit, offset, category, priority, completed)
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/complete` - Mark task as complete
- `POST /api/tasks/{id}/uncomplete` - Mark task as incomplete

#### Analytics
- `GET /api/analytics/tasks` - Get task analytics (with optional start_date, end_date)

#### Explore
- `GET /api/explore/habits` - Get popular habits
- `GET /api/explore/users` - Get public users

#### AI Assistant
- `POST /api/ai/voice-command` - Process voice commands
- `GET /api/ai/suggestions` - Get task suggestions

#### Health Check
- `GET /api/health` - Server health check

### Sample Python Server Response Formats

#### Task Object
```json
{
  "id": "uuid-string",
  "name": "Task name",
  "description": "Task description",
  "category": "personal|work|health|learning|social|other",
  "priority": "low|medium|high",
  "frequency": "once|daily|weekly|monthly",
  "is_completed": false,
  "due_date": "2024-01-01T00:00:00Z",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "user_id": "user-uuid"
}
```

#### User Object
```json
{
  "id": "uuid-string",
  "email": "user@example.com",
  "username": "username",
  "display_name": "Display Name",
  "photo_url": "https://example.com/photo.jpg",
  "points": 100,
  "current_streak": 5,
  "created_at": "2024-01-01T00:00:00Z"
}
```

## 3. Flutter App Setup

### Install Dependencies
```bash
cd /workspace/DoTogather/flutter_app
flutter pub get
```

### Generate Code (for Hive models)
```bash
flutter packages pub run build_runner build --delete-conflicting-outputs
```

### Update Configuration

1. **API Base URL** (if different):
   ```dart
   // lib/config/app_config.dart
   static const String baseUrl = 'http://your-server:8000/api';
   ```

2. **Production URLs**:
   ```dart
   static const String prodBaseUrl = 'https://your-production-server.com/api';
   static const String prodWsUrl = 'wss://your-production-server.com/ws';
   ```

## 4. Running the App

### Development Mode
```bash
flutter run
```

### Web (for testing)
```bash
flutter run -d chrome
```

### Android
```bash
flutter run -d android
```

## 5. Python Server CORS Configuration

Make sure your Python server allows CORS for the Flutter app:

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 6. Authentication Flow

The Flutter app uses this authentication flow:

1. **Login/Register** → Python API
2. **Receive JWT Token** → Store in secure storage
3. **API Calls** → Include `Authorization: Bearer <token>` header
4. **Token Refresh** → Handle token expiration

### Expected Login Response
```json
{
  "access_token": "jwt-token-string",
  "token_type": "bearer",
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "username": "username"
  }
}
```

## 7. File Storage Integration

The app uses Supabase for file storage:

- **Profile Images**: `profiles/profile_{user_id}.jpg`
- **Task Attachments**: `task_attachments/task_{task_id}_{timestamp}.{ext}`

### Storage Service Usage
```dart
// Upload profile image
final filePath = await StorageService().uploadProfileImage(
  userId: userId,
  imageFile: imageFile,
);

// Get public URL
final imageUrl = StorageService().getProfileImageUrl(userId);
```

## 8. Voice Commands Integration

The app processes voice commands through your Python API:

```dart
// Voice command processing
final response = await ApiService().processVoiceCommand("add task buy groceries");
```

Expected response:
```json
{
  "action": "add_task",
  "task": {
    "name": "buy groceries",
    "category": "personal"
  },
  "message": "Task added successfully"
}
```

## 9. Real-time Updates (WebSocket)

For real-time task updates, the app can connect to WebSocket:

```dart
// WebSocket connection for real-time updates
final wsUrl = AppConfig.currentWsUrl;
// Implementation in providers for real-time task sync
```

## 10. Testing the Integration

### 1. Start Python Server
```bash
cd /path/to/your/python/server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Test API Endpoints
```bash
# Health check
curl http://localhost:8000/api/health

# Test login (adjust payload as needed)
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password"}'
```

### 3. Run Flutter App
```bash
flutter run
```

## 11. Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Python server has CORS middleware configured
2. **Connection Refused**: Check if Python server is running on correct port
3. **Authentication Errors**: Verify JWT token handling in Python server
4. **Supabase Errors**: Check if anon key is correctly set

### Debug Mode

Enable debug logging in the Flutter app:
```dart
// lib/config/app_config.dart
static const bool debugMode = true;
```

### Network Debugging

For Android, add network security config to allow HTTP in debug:
```xml
<!-- android/app/src/main/res/xml/network_security_config.xml -->
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

## 12. Production Deployment

### Flutter App
1. Update `isProduction = true` in `app_config.dart`
2. Set production URLs
3. Build release version:
   ```bash
   flutter build apk --release
   flutter build ios --release
   flutter build web --release
   ```

### Python Server
1. Deploy to your preferred platform (AWS, GCP, Heroku, etc.)
2. Update production URLs in Flutter config
3. Ensure HTTPS for production

## Support

If you encounter any issues:
1. Check the logs in both Flutter app and Python server
2. Verify API endpoint responses match expected format
3. Test individual API endpoints with curl/Postman
4. Check network connectivity and CORS configuration

The Flutter app is now fully configured to work with your Python server and Supabase storage!