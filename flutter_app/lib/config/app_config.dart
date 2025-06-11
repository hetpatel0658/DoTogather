class AppConfig {
  static const String appName = 'DoTogather';
  static const String appVersion = '1.0.0';
  
  // API Configuration - Python Server
  static const String baseUrl = 'http://localhost:8000/api';
  static const String wsUrl = 'ws://localhost:8000/ws';
  
  // Production URLs (update these when deploying)
  static const String prodBaseUrl = 'https://your-production-server.com/api';
  static const String prodWsUrl = 'wss://your-production-server.com/ws';
  
  // Environment
  static const bool isProduction = false; // Set to true for production builds
  
  // Get current base URL based on environment
  static String get currentBaseUrl => isProduction ? prodBaseUrl : baseUrl;
  static String get currentWsUrl => isProduction ? prodWsUrl : wsUrl;
  
  // Firebase Configuration
  static const String firebaseProjectId = 'dotogather-app';
  
  // Voice Commands
  static const String wakeWord = 'Hey DoTogather';
  static const Duration voiceTimeout = Duration(seconds: 5);
  
  // Notifications
  static const String notificationChannelId = 'task_reminders';
  static const String notificationChannelName = 'Task Reminders';
  
  // Local Storage Keys
  static const String onboardingKey = 'onboarding_complete';
  static const String userPrefsKey = 'user_preferences';
  static const String tasksKey = 'cached_tasks';
  
  // Animation Durations
  static const Duration shortAnimation = Duration(milliseconds: 200);
  static const Duration mediumAnimation = Duration(milliseconds: 300);
  static const Duration longAnimation = Duration(milliseconds: 500);
  
  // UI Constants
  static const double borderRadius = 12.0;
  static const double cardElevation = 2.0;
  static const double iconSize = 24.0;
  static const double smallIconSize = 16.0;
  static const double largeIconSize = 32.0;
  
  // Spacing
  static const double paddingSmall = 8.0;
  static const double paddingMedium = 16.0;
  static const double paddingLarge = 24.0;
  static const double paddingXLarge = 32.0;
}