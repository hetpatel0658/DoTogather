import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:awesome_notifications/awesome_notifications.dart';

import 'config/app_config.dart';
import 'config/supabase_config.dart';
import 'config/theme_config.dart';
import 'services/notification_service.dart';
import 'services/api_service.dart';
import 'services/storage_service.dart';
import 'app.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Supabase
  await SupabaseConfig.initialize();
  
  // Initialize API Service
  ApiService().initialize();
  
  // Initialize Storage Service
  StorageService().initialize();
  
  // Initialize Hive for local storage
  await Hive.initFlutter();
  
  // Initialize notifications
  await NotificationService.initialize();
  
  // Initialize awesome notifications
  await AwesomeNotifications().initialize(
    null,
    [
      NotificationChannel(
        channelKey: 'task_reminders',
        channelName: 'Task Reminders',
        channelDescription: 'Notifications for task reminders',
        defaultColor: AppColors.primary,
        ledColor: Colors.white,
        importance: NotificationImportance.High,
        channelShowBadge: true,
      ),
    ],
  );
  
  runApp(
    const ProviderScope(
      child: DoTogatherApp(),
    ),
  );
}