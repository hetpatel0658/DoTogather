# DoTogather React Native App

A comprehensive task management mobile application built with React Native, featuring voice commands, gamification, and AI-powered assistance.

## Features

### 🎯 Core Features
- **Task Management**: Create, edit, complete, and organize tasks
- **Voice Commands**: "Chota Ustad" wake word activation for hands-free task creation
- **Gamification**: Points, levels, streaks, and badges system
- **Leaderboard**: Compete with other users and track rankings
- **AI Assistant**: Smart task suggestions and natural language processing

### 🎨 UI/UX Features
- **Modern Design**: Beautiful gradient-based UI with smooth animations
- **Dark/Light Theme**: Adaptive design for different preferences
- **Responsive Layout**: Optimized for various screen sizes
- **Intuitive Navigation**: Bottom tab navigation with visual feedback

### 📱 Advanced Features
- **Offline Support**: Works without internet connection
- **Push Notifications**: Task reminders and achievement notifications
- **File Attachments**: Add images and documents to tasks
- **Data Sync**: Real-time synchronization across devices
- **Analytics**: Productivity insights and progress tracking

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- CocoaPods (for iOS dependencies)

### 1. Install Dependencies

```bash
cd DoTogatherApp
npm install

# For iOS
cd ios && pod install && cd ..
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Backend API
API_BASE_URL=http://localhost:8000/api

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
APP_NAME=DoTogather
APP_VERSION=1.0.0
```

### 3. Platform-Specific Setup

#### Android Setup

1. **Install Android Studio** and set up Android SDK
2. **Configure environment variables**:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. **Add permissions** to `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.RECORD_AUDIO" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.WAKE_LOCK" />
   <uses-permission android:name="android.permission.VIBRATE" />
   ```

#### iOS Setup

1. **Install Xcode** from the App Store
2. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   ```

3. **Add permissions** to `ios/DoTogatherApp/Info.plist`:
   ```xml
   <key>NSMicrophoneUsageDescription</key>
   <string>This app needs access to microphone for voice commands</string>
   <key>NSCameraUsageDescription</key>
   <string>This app needs access to camera to take photos for tasks</string>
   <key>NSPhotoLibraryUsageDescription</key>
   <string>This app needs access to photo library to attach images to tasks</string>
   ```

### 4. Running the App

#### Development

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

#### Production Build

```bash
# Android
cd android
./gradlew assembleRelease

# iOS
cd ios
xcodebuild -workspace DoTogatherApp.xcworkspace -scheme DoTogatherApp -configuration Release archive
```

## Project Structure

```
DoTogatherApp/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── TaskItem.tsx
│   │   ├── TaskList.tsx
│   │   ├── VoiceButton.tsx
│   │   └── ...
│   ├── screens/           # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── TasksScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   └── ...
│   ├── navigation/        # Navigation configuration
│   │   └── AppNavigator.tsx
│   ├── context/          # React Context providers
│   │   └── AppContext.tsx
│   ├── services/         # API and external services
│   │   ├── api.ts
│   │   ├── voiceService.ts
│   │   └── supabaseService.ts
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── utils/            # Utility functions
├── android/              # Android-specific code
├── ios/                  # iOS-specific code
├── App.tsx              # Root component
├── index.js             # Entry point
└── package.json         # Dependencies and scripts
```

## Key Components

### AppContext
Central state management for:
- User authentication
- Task management
- Voice command handling
- UI state

### VoiceService
Handles:
- Speech recognition
- Wake word detection
- Audio processing
- Permissions management

### SupabaseService
Manages:
- File uploads (avatars, attachments)
- Data storage and retrieval
- Real-time synchronization

### API Service
Provides:
- Authentication endpoints
- Task CRUD operations
- User profile management
- AI assistant integration

## Voice Commands

### Wake Word Activation
Say "Chota Ustad" to activate voice commands. The app will:
1. Detect the wake word
2. Start listening for commands
3. Process natural language input
4. Create tasks automatically

### Supported Commands
- "Add task: Buy groceries"
- "Create a high priority task to finish the report"
- "Remind me to call mom tomorrow"
- "Add a personal task to exercise"

## Gamification System

### Points System
- **Task Completion**: 10-100 points based on difficulty
- **Daily Streaks**: Bonus points for consecutive days
- **Special Achievements**: Extra points for milestones

### Levels
- Level 1: 0-99 points
- Level 2: 100-199 points
- Level 3: 200-299 points
- And so on...

### Badges
- **Streak Master**: 7-day streak
- **Task Warrior**: 100 completed tasks
- **Early Bird**: Complete tasks before 9 AM
- **Night Owl**: Complete tasks after 9 PM

## Customization

### Themes
Modify colors in the component styles:
```typescript
const colors = {
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#4FC3F7',
  // ...
};
```

### Wake Word
Change the wake word in `VoiceService`:
```typescript
setWakeWord('your custom phrase');
```

### Notifications
Configure push notifications in:
- `android/app/src/main/AndroidManifest.xml`
- `ios/DoTogatherApp/Info.plist`

## Performance Optimization

### Bundle Size
- Use Hermes engine for Android
- Enable ProGuard for release builds
- Optimize images and assets

### Memory Management
- Implement proper cleanup in useEffect hooks
- Use FlatList for large lists
- Optimize re-renders with React.memo

### Network Optimization
- Implement request caching
- Use optimistic updates
- Handle offline scenarios

## Testing

### Unit Tests
```bash
npm test
```

### E2E Tests
```bash
# Install Detox
npm install -g detox-cli

# Run E2E tests
detox test
```

## Deployment

### Android Play Store
1. Generate signed APK
2. Create Play Console account
3. Upload APK and configure store listing
4. Submit for review

### iOS App Store
1. Archive app in Xcode
2. Upload to App Store Connect
3. Configure app metadata
4. Submit for review

## Troubleshooting

### Common Issues

#### Metro bundler issues
```bash
npx react-native start --reset-cache
```

#### Android build issues
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

#### iOS build issues
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

#### Voice recognition not working
- Check microphone permissions
- Ensure device has internet connection
- Verify API keys are configured

### Debug Mode
Enable debug mode for detailed logging:
```typescript
const DEBUG = __DEV__;
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the coding standards
4. Add tests for new features
5. Submit a pull request

### Coding Standards
- Use TypeScript for type safety
- Follow React Native best practices
- Use meaningful component and variable names
- Add comments for complex logic
- Maintain consistent code formatting

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Contact the development team

## Roadmap

### Upcoming Features
- [ ] Collaborative tasks
- [ ] Calendar integration
- [ ] Advanced analytics
- [ ] Widget support
- [ ] Apple Watch app
- [ ] Wear OS app
- [ ] Desktop companion app

### Performance Improvements
- [ ] Implement lazy loading
- [ ] Add image caching
- [ ] Optimize bundle size
- [ ] Improve startup time