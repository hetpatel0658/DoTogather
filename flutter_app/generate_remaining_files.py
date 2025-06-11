#!/usr/bin/env python3
"""
Script to generate the remaining Flutter files for DoTogather app conversion
"""

import os
import json

def create_file(path, content):
    """Create a file with the given content"""
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Created: {path}")

def main():
    base_dir = "/workspace/DoTogather/flutter_app"
    
    # Create remaining model files
    create_file(f"{base_dir}/lib/models/user.g.dart", """
// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user.dart';

// **************************************************************************
// TypeAdapterGenerator
// **************************************************************************

class UserAdapter extends TypeAdapter<User> {
  @override
  final int typeId = 0;

  @override
  User read(BinaryReader reader) {
    final numOfFields = reader.readByte();
    final fields = <int, dynamic>{
      for (int i = 0; i < numOfFields; i++) reader.readByte(): reader.read(),
    };
    return User(
      id: fields[0] as String,
      email: fields[1] as String,
      username: fields[2] as String?,
      displayName: fields[3] as String?,
      photoURL: fields[4] as String?,
      points: fields[5] as int,
      currentStreak: fields[6] as int,
      isPublicProfile: fields[7] as bool,
      createdAt: fields[8] as DateTime?,
      updatedAt: fields[9] as DateTime?,
    );
  }

  @override
  void write(BinaryWriter writer, User obj) {
    writer
      ..writeByte(10)
      ..writeByte(0)
      ..write(obj.id)
      ..writeByte(1)
      ..write(obj.email)
      ..writeByte(2)
      ..write(obj.username)
      ..writeByte(3)
      ..write(obj.displayName)
      ..writeByte(4)
      ..write(obj.photoURL)
      ..writeByte(5)
      ..write(obj.points)
      ..writeByte(6)
      ..write(obj.currentStreak)
      ..writeByte(7)
      ..write(obj.isPublicProfile)
      ..writeByte(8)
      ..write(obj.createdAt)
      ..writeByte(9)
      ..write(obj.updatedAt);
  }

  @override
  int get hashCode => typeId.hashCode;

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserAdapter &&
          runtimeType == other.runtimeType &&
          typeId == other.typeId;
}
""")

    # Create notification service
    create_file(f"{base_dir}/lib/services/notification_service.dart", """
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
          body: 'Don\\'t forget: \$taskName',
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
""")

    # Create voice service
    create_file(f"{base_dir}/lib/services/voice_service.dart", """
import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:logger/logger.dart';

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  factory VoiceService() => _instance;
  VoiceService._internal();

  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  final Logger _logger = Logger();

  bool _isListening = false;
  bool _isInitialized = false;

  bool get isListening => _isListening;
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    try {
      // Request microphone permission
      final micPermission = await Permission.microphone.request();
      if (!micPermission.isGranted) {
        throw Exception('Microphone permission denied');
      }

      // Initialize speech to text
      _isInitialized = await _speechToText.initialize(
        onError: (error) => _logger.e('Speech recognition error: \$error'),
        onStatus: (status) => _logger.d('Speech recognition status: \$status'),
      );

      // Initialize text to speech
      await _flutterTts.setLanguage('en-US');
      await _flutterTts.setSpeechRate(0.5);
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);

      _logger.i('Voice service initialized successfully');
    } catch (e) {
      _logger.e('Failed to initialize voice service: \$e');
      _isInitialized = false;
    }
  }

  Future<void> startListening({
    required Function(String) onResult,
    required Function() onListeningStart,
    required Function() onListeningStop,
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    if (!_isInitialized) {
      throw Exception('Voice service not initialized');
    }

    try {
      _isListening = true;
      onListeningStart();

      await _speechToText.listen(
        onResult: (result) {
          if (result.finalResult) {
            onResult(result.recognizedWords);
            stopListening();
            onListeningStop();
          }
        },
        listenFor: const Duration(seconds: 5),
        pauseFor: const Duration(seconds: 3),
        partialResults: false,
        localeId: 'en_US',
        cancelOnError: true,
      );
    } catch (e) {
      _logger.e('Failed to start listening: \$e');
      _isListening = false;
      onListeningStop();
      rethrow;
    }
  }

  Future<void> stopListening() async {
    if (_isListening) {
      await _speechToText.stop();
      _isListening = false;
    }
  }

  Future<void> speak(String text) async {
    try {
      await _flutterTts.speak(text);
    } catch (e) {
      _logger.e('Failed to speak: \$e');
    }
  }

  Future<void> stop() async {
    await _flutterTts.stop();
  }

  // Voice command processing
  String? processVoiceCommand(String command) {
    final lowerCommand = command.toLowerCase().trim();
    
    // Add task commands
    if (lowerCommand.contains('add task') || lowerCommand.contains('create task')) {
      final taskName = _extractTaskName(lowerCommand);
      if (taskName != null) {
        return 'add_task:\$taskName';
      }
    }
    
    // Complete task commands
    if (lowerCommand.contains('complete') || lowerCommand.contains('finish')) {
      return 'complete_task';
    }
    
    // Navigation commands
    if (lowerCommand.contains('go to tasks') || lowerCommand.contains('show tasks')) {
      return 'navigate:tasks';
    }
    
    if (lowerCommand.contains('go to home') || lowerCommand.contains('show home')) {
      return 'navigate:home';
    }
    
    if (lowerCommand.contains('go to profile') || lowerCommand.contains('show profile')) {
      return 'navigate:profile';
    }
    
    if (lowerCommand.contains('go to explore') || lowerCommand.contains('show explore')) {
      return 'navigate:explore';
    }
    
    // Stats commands
    if (lowerCommand.contains('show stats') || lowerCommand.contains('my stats')) {
      return 'show_stats';
    }
    
    return null;
  }

  String? _extractTaskName(String command) {
    // Extract task name from commands like "add task buy groceries"
    final patterns = [
      RegExp(r'add task (.+)', caseSensitive: false),
      RegExp(r'create task (.+)', caseSensitive: false),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(command);
      if (match != null && match.group(1) != null) {
        return match.group(1)!.trim();
      }
    }
    
    return null;
  }
}
""")

    # Create voice button widget
    create_file(f"{base_dir}/lib/widgets/common/voice_button.dart", """
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../config/theme_config.dart';
import '../../providers/voice_provider.dart';

class VoiceButton extends ConsumerWidget {
  const VoiceButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voiceState = ref.watch(voiceProvider);
    final isListening = voiceState.isListening;

    return FloatingActionButton(
      onPressed: () {
        if (isListening) {
          ref.read(voiceProvider.notifier).stopListening();
        } else {
          ref.read(voiceProvider.notifier).startListening();
        }
      },
      backgroundColor: isListening ? AppColors.error : AppColors.secondary,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: isListening
            ? const Icon(
                Icons.mic,
                key: ValueKey('listening'),
                color: Colors.white,
              ).animate(onPlay: (controller) => controller.repeat())
                .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.2, 1.2))
                .then()
                .scale(begin: const Offset(1.2, 1.2), end: const Offset(1.0, 1.0))
            : const Icon(
                Icons.mic_none,
                key: ValueKey('not_listening'),
                color: Colors.white,
              ),
      ),
    );
  }
}
""")

    # Create voice provider
    create_file(f"{base_dir}/lib/providers/voice_provider.dart", """
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

import '../services/voice_service.dart';
import '../models/task.dart';
import 'task_provider.dart';
import 'app_state_provider.dart';

class VoiceState {
  final bool isListening;
  final String? lastCommand;
  final String? lastResult;
  final String? error;

  const VoiceState({
    this.isListening = false,
    this.lastCommand,
    this.lastResult,
    this.error,
  });

  VoiceState copyWith({
    bool? isListening,
    String? lastCommand,
    String? lastResult,
    String? error,
  }) {
    return VoiceState(
      isListening: isListening ?? this.isListening,
      lastCommand: lastCommand ?? this.lastCommand,
      lastResult: lastResult ?? this.lastResult,
      error: error ?? this.error,
    );
  }
}

class VoiceNotifier extends StateNotifier<VoiceState> {
  VoiceNotifier(this._voiceService, this._ref) : super(const VoiceState());

  final VoiceService _voiceService;
  final Ref _ref;
  final Logger _logger = Logger();

  Future<void> initialize() async {
    try {
      await _voiceService.initialize();
    } catch (e) {
      _logger.e('Failed to initialize voice service: \$e');
      state = state.copyWith(error: e.toString());
    }
  }

  Future<void> startListening() async {
    try {
      await _voiceService.startListening(
        onResult: _handleVoiceResult,
        onListeningStart: () {
          state = state.copyWith(isListening: true, error: null);
        },
        onListeningStop: () {
          state = state.copyWith(isListening: false);
        },
      );
    } catch (e) {
      _logger.e('Failed to start listening: \$e');
      state = state.copyWith(
        isListening: false,
        error: e.toString(),
      );
    }
  }

  Future<void> stopListening() async {
    await _voiceService.stopListening();
    state = state.copyWith(isListening: false);
  }

  void _handleVoiceResult(String result) {
    _logger.i('Voice result: \$result');
    state = state.copyWith(lastResult: result);

    final command = _voiceService.processVoiceCommand(result);
    if (command != null) {
      _executeCommand(command);
      state = state.copyWith(lastCommand: command);
    } else {
      _voiceService.speak('Sorry, I didn\\'t understand that command.');
    }
  }

  Future<void> _executeCommand(String command) async {
    try {
      if (command.startsWith('add_task:')) {
        final taskName = command.substring(9);
        await _addTask(taskName);
      } else if (command == 'complete_task') {
        await _completeLastTask();
      } else if (command.startsWith('navigate:')) {
        final destination = command.substring(9);
        _navigate(destination);
      } else if (command == 'show_stats') {
        await _showStats();
      }
    } catch (e) {
      _logger.e('Failed to execute command: \$e');
      await _voiceService.speak('Sorry, I couldn\\'t complete that action.');
    }
  }

  Future<void> _addTask(String taskName) async {
    final task = Task(
      id: '',
      name: taskName,
      createdAt: DateTime.now(),
      userId: '',
    );

    await _ref.read(taskControllerProvider.notifier).addTask(task);
    await _voiceService.speak('Task "\$taskName" added successfully.');
  }

  Future<void> _completeLastTask() async {
    final tasksAsync = _ref.read(pendingTasksStreamProvider);
    final tasks = tasksAsync.value;
    
    if (tasks != null && tasks.isNotEmpty) {
      final lastTask = tasks.first;
      await _ref.read(taskControllerProvider.notifier).completeTask(lastTask.id);
      await _voiceService.speak('Task "\${lastTask.name}" completed.');
    } else {
      await _voiceService.speak('No pending tasks to complete.');
    }
  }

  void _navigate(String destination) {
    final appStateNotifier = _ref.read(appStateProvider.notifier);
    
    switch (destination) {
      case 'home':
        appStateNotifier.goToHome();
        _voiceService.speak('Navigating to home.');
        break;
      case 'tasks':
        appStateNotifier.goToTasks();
        _voiceService.speak('Navigating to tasks.');
        break;
      case 'explore':
        appStateNotifier.goToExplore();
        _voiceService.speak('Navigating to explore.');
        break;
      case 'profile':
        appStateNotifier.goToProfile();
        _voiceService.speak('Navigating to profile.');
        break;
    }
  }

  Future<void> _showStats() async {
    final statsAsync = _ref.read(taskStatisticsProvider);
    final stats = await statsAsync.future;
    
    final totalTasks = stats['totalTasks'] ?? 0;
    final completedTasks = stats['completedTasks'] ?? 0;
    final completionRate = stats['completionRate'] ?? 0.0;
    
    await _voiceService.speak(
      'You have \$totalTasks total tasks, with \$completedTasks completed. '
      'Your completion rate is \${completionRate.toStringAsFixed(1)} percent.'
    );
  }
}

final voiceServiceProvider = Provider<VoiceService>((ref) {
  return VoiceService();
});

final voiceProvider = StateNotifierProvider<VoiceNotifier, VoiceState>((ref) {
  final voiceService = ref.watch(voiceServiceProvider);
  return VoiceNotifier(voiceService, ref);
});
""")

    print("Generated remaining Flutter files successfully!")

if __name__ == "__main__":
    main()