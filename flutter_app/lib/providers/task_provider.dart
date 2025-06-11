import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

import '../models/task.dart';
import '../services/task_service.dart';
import 'auth_provider.dart';

// Task service provider
final taskServiceProvider = Provider<TaskService>((ref) {
  return TaskService();
});

// All tasks stream provider
final tasksStreamProvider = StreamProvider<List<Task>>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  final isLoggedIn = ref.watch(isLoggedInProvider);
  
  if (!isLoggedIn) {
    return Stream.value([]);
  }
  
  return taskService.getTasksStream();
});

// Today's tasks stream provider
final todayTasksStreamProvider = StreamProvider<List<Task>>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  final isLoggedIn = ref.watch(isLoggedInProvider);
  
  if (!isLoggedIn) {
    return Stream.value([]);
  }
  
  return taskService.getTodayTasksStream();
});

// Completed tasks stream provider
final completedTasksStreamProvider = StreamProvider<List<Task>>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  final isLoggedIn = ref.watch(isLoggedInProvider);
  
  if (!isLoggedIn) {
    return Stream.value([]);
  }
  
  return taskService.getCompletedTasksStream();
});

// Pending tasks stream provider
final pendingTasksStreamProvider = StreamProvider<List<Task>>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  final isLoggedIn = ref.watch(isLoggedInProvider);
  
  if (!isLoggedIn) {
    return Stream.value([]);
  }
  
  return taskService.getPendingTasksStream();
});

// Task statistics provider
final taskStatisticsProvider = FutureProvider<Map<String, dynamic>>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  final isLoggedIn = ref.watch(isLoggedInProvider);
  
  if (!isLoggedIn) {
    return Future.value({
      'totalTasks': 0,
      'completedTasks': 0,
      'pendingTasks': 0,
      'completionRate': 0.0,
      'todayTasks': 0,
      'todayCompleted': 0,
    });
  }
  
  return taskService.getTaskStatistics();
});

// Task controller
class TaskController extends StateNotifier<AsyncValue<void>> {
  TaskController(this._taskService) : super(const AsyncValue.data(null));

  final TaskService _taskService;
  final Logger _logger = Logger();

  // Add a new task
  Future<void> addTask(Task task) async {
    state = const AsyncValue.loading();
    try {
      await _taskService.addTask(task);
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      _logger.e('Add task failed', error: error, stackTrace: stackTrace);
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Update a task
  Future<void> updateTask(Task task) async {
    state = const AsyncValue.loading();
    try {
      await _taskService.updateTask(task);
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      _logger.e('Update task failed', error: error, stackTrace: stackTrace);
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Complete a task
  Future<void> completeTask(String taskId) async {
    try {
      await _taskService.completeTask(taskId);
    } catch (error, stackTrace) {
      _logger.e('Complete task failed', error: error, stackTrace: stackTrace);
      rethrow;
    }
  }

  // Uncomplete a task
  Future<void> uncompleteTask(String taskId) async {
    try {
      await _taskService.uncompleteTask(taskId);
    } catch (error, stackTrace) {
      _logger.e('Uncomplete task failed', error: error, stackTrace: stackTrace);
      rethrow;
    }
  }

  // Delete a task
  Future<void> deleteTask(String taskId) async {
    try {
      await _taskService.deleteTask(taskId);
    } catch (error, stackTrace) {
      _logger.e('Delete task failed', error: error, stackTrace: stackTrace);
      rethrow;
    }
  }

  // Reorder tasks
  Future<void> reorderTasks(List<Task> tasks) async {
    try {
      await _taskService.reorderTasks(tasks);
    } catch (error, stackTrace) {
      _logger.e('Reorder tasks failed', error: error, stackTrace: stackTrace);
      rethrow;
    }
  }
}

// Task controller provider
final taskControllerProvider = StateNotifierProvider<TaskController, AsyncValue<void>>((ref) {
  final taskService = ref.watch(taskServiceProvider);
  return TaskController(taskService);
});

// Filtered tasks providers
final filteredTasksProvider = Provider.family<List<Task>, TaskFilter>((ref, filter) {
  final tasksAsync = ref.watch(tasksStreamProvider);
  
  return tasksAsync.when(
    data: (tasks) => _filterTasks(tasks, filter),
    loading: () => [],
    error: (_, __) => [],
  );
});

// Task filter class
class TaskFilter {
  final TaskCategory? category;
  final TaskPriority? priority;
  final bool? isCompleted;
  final String? searchQuery;

  const TaskFilter({
    this.category,
    this.priority,
    this.isCompleted,
    this.searchQuery,
  });

  TaskFilter copyWith({
    TaskCategory? category,
    TaskPriority? priority,
    bool? isCompleted,
    String? searchQuery,
  }) {
    return TaskFilter(
      category: category ?? this.category,
      priority: priority ?? this.priority,
      isCompleted: isCompleted ?? this.isCompleted,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

// Helper function to filter tasks
List<Task> _filterTasks(List<Task> tasks, TaskFilter filter) {
  return tasks.where((task) {
    // Category filter
    if (filter.category != null && task.category != filter.category) {
      return false;
    }

    // Priority filter
    if (filter.priority != null && task.priority != filter.priority) {
      return false;
    }

    // Completion filter
    if (filter.isCompleted != null && task.isCompleted != filter.isCompleted) {
      return false;
    }

    // Search query filter
    if (filter.searchQuery != null && filter.searchQuery!.isNotEmpty) {
      final query = filter.searchQuery!.toLowerCase();
      final nameMatch = task.name.toLowerCase().contains(query);
      final descriptionMatch = task.description?.toLowerCase().contains(query) ?? false;
      if (!nameMatch && !descriptionMatch) {
        return false;
      }
    }

    return true;
  }).toList();
}

// Task filter state provider
final taskFilterProvider = StateProvider<TaskFilter>((ref) {
  return const TaskFilter();
});

// Convenience providers for common task operations
final addTaskProvider = Provider.family<Future<void>, Task>((ref, task) {
  final controller = ref.read(taskControllerProvider.notifier);
  return controller.addTask(task);
});

final completeTaskProvider = Provider.family<Future<void>, String>((ref, taskId) {
  final controller = ref.read(taskControllerProvider.notifier);
  return controller.completeTask(taskId);
});

final deleteTaskProvider = Provider.family<Future<void>, String>((ref, taskId) {
  final controller = ref.read(taskControllerProvider.notifier);
  return controller.deleteTask(taskId);
});