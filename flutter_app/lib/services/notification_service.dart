
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:awesome_notifications/awesome_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:logger/logger.dart';

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final Logger _logger = Logger();

  static Future<void> initialize() async {
    await NotificationService()._initialize();
  }

  Future<void> _initialize() async {
    // Request permissions
    await _requestPermissions();

    // Initialize local notifications
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );

    _logger.i('Notification service initialized');
  }

  Future<void> _requestPermissions() async {
    await Permission.notification.request();
    
    // Request awesome notifications permission
    await AwesomeNotifications().requestPermissionToSendNotifications();
  }

  void _onNotificationTapped(NotificationResponse response) {
    _logger.i('Notification tapped: \${response.payload}');
    // Handle notification tap
  }

  Future<void> scheduleTaskReminder({
    required String taskId,
    required String taskName,
    required DateTime scheduledTime,
  }) async {
    try {
      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: taskId.hashCode,
          channelKey: 'task_reminders',
          title: 'Task Reminder',
          body: 'Don\'t forget: \$taskName',
          payload: {'taskId': taskId},
        ),
        schedule: NotificationCalendar.fromDate(date: scheduledTime),
      );

      _logger.i('Task reminder scheduled for \$taskName at \$scheduledTime');
    } catch (e) {
      _logger.e('Failed to schedule task reminder: \$e');
    }
  }

  Future<void> cancelTaskReminder(String taskId) async {
    try {
      await AwesomeNotifications().cancel(taskId.hashCode);
      _logger.i('Task reminder cancelled for \$taskId');
    } catch (e) {
      _logger.e('Failed to cancel task reminder: \$e');
    }
  }

  Future<void> showTaskCompletedNotification(String taskName, int points) async {
    try {
      await AwesomeNotifications().createNotification(
        content: NotificationContent(
          id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
          channelKey: 'task_reminders',
          title: 'Task Completed! 🎉',
          body: 'You completed "\$taskName" and earned \$points points!',
        ),
      );
    } catch (e) {
      _logger.e('Failed to show task completed notification: \$e');
    }
  }
}
