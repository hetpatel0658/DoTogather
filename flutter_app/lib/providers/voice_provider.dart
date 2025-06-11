
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
      _voiceService.speak('Sorry, I didn\'t understand that command.');
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
      await _voiceService.speak('Sorry, I couldn\'t complete that action.');
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
