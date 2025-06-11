import 'package:logger/logger.dart';
import 'package:uuid/uuid.dart';

import '../models/task.dart';
import 'api_service.dart';

class TaskService {
  static final TaskService _instance = TaskService._internal();
  factory TaskService() => _instance;
  TaskService._internal();

  final Logger _logger = Logger();
  final ApiService _apiService = ApiService();
  final Uuid _uuid = const Uuid();

  // Get all tasks for the current user
  Future<List<Task>> getTasks({
    String? category,
    TaskPriority? priority,
    bool? completed,
    int? limit,
    int? offset,
  }) async {
    try {
      final tasks = await _apiService.getTasks(
        category: category?.toString().split('.').last,
        priority: priority?.toString().split('.').last,
        completed: completed,
        limit: limit,
        offset: offset,
      );
      
      _logger.i('Retrieved ${tasks.length} tasks from API');
      return tasks;
    } catch (e) {
      _logger.e('Failed to get tasks: $e');
      rethrow;
    }
  }

  // Get tasks for today
  Future<List<Task>> getTodayTasks() async {
    try {
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      
      final allTasks = await getTasks();
      
      // Filter tasks for today
      final todayTasks = allTasks.where((task) {
        if (task.dueDate == null) return false;
        final taskDate = DateTime(
          task.dueDate!.year,
          task.dueDate!.month,
          task.dueDate!.day,
        );
        return taskDate.isAtSameMomentAs(today) || taskDate.isBefore(today);
      }).toList();
      
      _logger.i('Found ${todayTasks.length} tasks for today');
      return todayTasks;
    } catch (e) {
      _logger.e('Failed to get today tasks: $e');
      rethrow;
    }
  }

  // Add a new task
  Future<Task> addTask(Task task) async {
    try {
      final taskWithId = task.copyWith(
        id: _uuid.v4(),
        createdAt: DateTime.now(),
      );
      
      final createdTask = await _apiService.createTask(taskWithId);
      _logger.i('Task created successfully: ${createdTask.name}');
      return createdTask;
    } catch (e) {
      _logger.e('Failed to add task: $e');
      rethrow;
    }
  }

  // Update an existing task
  Future<Task> updateTask(Task task) async {
    try {
      final updatedTask = await _apiService.updateTask(task.id, task);
      _logger.i('Task updated successfully: ${updatedTask.name}');
      return updatedTask;
    } catch (e) {
      _logger.e('Failed to update task: $e');
      rethrow;
    }
  }

  // Delete a task
  Future<void> deleteTask(String taskId) async {
    try {
      await _apiService.deleteTask(taskId);
      _logger.i('Task deleted successfully: $taskId');
    } catch (e) {
      _logger.e('Failed to delete task: $e');
      rethrow;
    }
  }

  // Mark task as completed
  Future<Task> completeTask(String taskId) async {
    try {
      final completedTask = await _apiService.completeTask(taskId);
      _logger.i('Task completed: ${completedTask.name}');
      return completedTask;
    } catch (e) {
      _logger.e('Failed to complete task: $e');
      rethrow;
    }
  }

  // Mark task as uncompleted
  Future<Task> uncompleteTask(String taskId) async {
    try {
      final uncompletedTask = await _apiService.uncompleteTask(taskId);
      _logger.i('Task uncompleted: ${uncompletedTask.name}');
      return uncompletedTask;
    } catch (e) {
      _logger.e('Failed to uncomplete task: $e');
      rethrow;
    }
  }

  // Get task statistics
  Future<Map<String, dynamic>> getTaskStatistics() async {
    try {
      final stats = await _apiService.getTaskAnalytics();
      _logger.i('Retrieved task statistics');
      return stats;
    } catch (e) {
      _logger.e('Failed to get task statistics: $e');
      
      // Fallback: calculate basic stats from tasks
      try {
        final tasks = await getTasks();
        final completedTasks = tasks.where((task) => task.isCompleted).length;
        final pendingTasks = tasks.length - completedTasks;
        final completionRate = tasks.isNotEmpty ? (completedTasks / tasks.length) * 100 : 0.0;
        
        final todayTasks = await getTodayTasks();
        final todayCompleted = todayTasks.where((task) => task.isCompleted).length;
        
        return {
          'totalTasks': tasks.length,
          'completedTasks': completedTasks,
          'pendingTasks': pendingTasks,
          'completionRate': completionRate,
          'todayTasks': todayTasks.length,
          'todayCompleted': todayCompleted,
        };
      } catch (fallbackError) {
        _logger.e('Fallback statistics calculation failed: $fallbackError');
        return {
          'totalTasks': 0,
          'completedTasks': 0,
          'pendingTasks': 0,
          'completionRate': 0.0,
          'todayTasks': 0,
          'todayCompleted': 0,
        };
      }
    }
  }

  // Get tasks by category
  Future<List<Task>> getTasksByCategory(TaskCategory category) async {
    try {
      final tasks = await getTasks(category: category.toString().split('.').last);
      _logger.i('Retrieved ${tasks.length} tasks for category: $category');
      return tasks;
    } catch (e) {
      _logger.e('Failed to get tasks by category: $e');
      rethrow;
    }
  }

  // Get tasks by priority
  Future<List<Task>> getTasksByPriority(TaskPriority priority) async {
    try {
      final tasks = await getTasks(priority: priority);
      _logger.i('Retrieved ${tasks.length} tasks for priority: $priority');
      return tasks;
    } catch (e) {
      _logger.e('Failed to get tasks by priority: $e');
      rethrow;
    }
  }

  // Get overdue tasks
  Future<List<Task>> getOverdueTasks() async {
    try {
      final tasks = await getTasks(completed: false);
      final now = DateTime.now();
      
      final overdueTasks = tasks.where((task) {
        if (task.dueDate == null) return false;
        return task.dueDate!.isBefore(now) && !task.isCompleted;
      }).toList();
      
      _logger.i('Found ${overdueTasks.length} overdue tasks');
      return overdueTasks;
    } catch (e) {
      _logger.e('Failed to get overdue tasks: $e');
      rethrow;
    }
  }

  // Search tasks
  Future<List<Task>> searchTasks(String query) async {
    try {
      final tasks = await getTasks();
      final searchResults = tasks.where((task) {
        final nameMatch = task.name.toLowerCase().contains(query.toLowerCase());
        final descriptionMatch = task.description?.toLowerCase().contains(query.toLowerCase()) ?? false;
        return nameMatch || descriptionMatch;
      }).toList();
      
      _logger.i('Found ${searchResults.length} tasks matching "$query"');
      return searchResults;
    } catch (e) {
      _logger.e('Failed to search tasks: $e');
      rethrow;
    }
  }

  // Bulk operations
  Future<void> bulkCompleteTask(List<String> taskIds) async {
    try {
      for (final taskId in taskIds) {
        await completeTask(taskId);
      }
      _logger.i('Bulk completed ${taskIds.length} tasks');
    } catch (e) {
      _logger.e('Failed to bulk complete tasks: $e');
      rethrow;
    }
  }

  Future<void> bulkDeleteTasks(List<String> taskIds) async {
    try {
      for (final taskId in taskIds) {
        await deleteTask(taskId);
      }
      _logger.i('Bulk deleted ${taskIds.length} tasks');
    } catch (e) {
      _logger.e('Failed to bulk delete tasks: $e');
      rethrow;
    }
  }

  // Get task suggestions from AI
  Future<List<String>> getTaskSuggestions({TaskCategory? category}) async {
    try {
      final suggestions = await _apiService.getTaskSuggestions(
        category: category?.toString().split('.').last,
      );
      _logger.i('Retrieved ${suggestions.length} task suggestions');
      return suggestions;
    } catch (e) {
      _logger.e('Failed to get task suggestions: $e');
      // Return default suggestions as fallback
      return _getDefaultSuggestions(category);
    }
  }

  List<String> _getDefaultSuggestions(TaskCategory? category) {
    switch (category) {
      case TaskCategory.health:
        return ['Drink 8 glasses of water', 'Exercise for 30 minutes', 'Take vitamins'];
      case TaskCategory.work:
        return ['Check emails', 'Review project status', 'Update task board'];
      case TaskCategory.personal:
        return ['Read for 20 minutes', 'Call family', 'Organize workspace'];
      case TaskCategory.learning:
        return ['Practice new skill', 'Watch educational video', 'Take online course'];
      case TaskCategory.social:
        return ['Message a friend', 'Plan weekend activity', 'Join community event'];
      default:
        return ['Complete daily review', 'Plan tomorrow', 'Reflect on progress'];
    }
  }
}