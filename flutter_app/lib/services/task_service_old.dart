import 'package:logger/logger.dart';
import 'package:uuid/uuid.dart';

import '../models/task.dart';
import 'api_service.dart';

class TaskService {
  static final TaskService _instance = TaskService._internal();
  factory TaskService() => _instance;
  TaskService._internal();

  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final firebase_auth.FirebaseAuth _auth = firebase_auth.FirebaseAuth.instance;
  final Logger _logger = Logger();
  final Uuid _uuid = const Uuid();

  String? get _currentUserId => _auth.currentUser?.uid;

  // Get tasks stream for current user
  Stream<List<Task>> getTasksStream() {
    final userId = _currentUserId;
    if (userId == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();
    });
  }

  // Get tasks for today
  Stream<List<Task>> getTodayTasksStream() {
    final userId = _currentUserId;
    if (userId == null) {
      return Stream.value([]);
    }

    final now = DateTime.now();
    final startOfDay = DateTime(now.year, now.month, now.day);
    final endOfDay = startOfDay.add(const Duration(days: 1));

    return _firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .where('createdAt', isGreaterThanOrEqualTo: Timestamp.fromDate(startOfDay))
        .where('createdAt', isLessThan: Timestamp.fromDate(endOfDay))
        .orderBy('createdAt', descending: false)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();
    });
  }

  // Add a new task
  Future<Task> addTask(Task task) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final taskWithId = task.copyWith(
        id: _uuid.v4(),
        userId: userId,
        createdAt: DateTime.now(),
      );

      await _firestore
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(taskWithId.id)
          .set(taskWithId.toJson());

      _logger.i('Task added successfully: ${taskWithId.name}');
      return taskWithId;
    } catch (e) {
      _logger.e('Failed to add task: $e');
      throw Exception('Failed to add task: $e');
    }
  }

  // Update a task
  Future<void> updateTask(Task task) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final updatedTask = task.copyWith(
        updatedAt: DateTime.now(),
      );

      await _firestore
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(task.id)
          .update(updatedTask.toJson());

      _logger.i('Task updated successfully: ${task.name}');
    } catch (e) {
      _logger.e('Failed to update task: $e');
      throw Exception('Failed to update task: $e');
    }
  }

  // Complete a task
  Future<void> completeTask(String taskId) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      await _firestore
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(taskId)
          .update({
        'isCompleted': true,
        'completedAt': FieldValue.serverTimestamp(),
      });

      // Update user points
      await _updateUserPoints(10); // Default points for completing a task

      _logger.i('Task completed successfully: $taskId');
    } catch (e) {
      _logger.e('Failed to complete task: $e');
      throw Exception('Failed to complete task: $e');
    }
  }

  // Uncomplete a task
  Future<void> uncompleteTask(String taskId) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      await _firestore
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(taskId)
          .update({
        'isCompleted': false,
        'completedAt': null,
      });

      // Subtract user points
      await _updateUserPoints(-10); // Remove points for uncompleting a task

      _logger.i('Task uncompleted successfully: $taskId');
    } catch (e) {
      _logger.e('Failed to uncomplete task: $e');
      throw Exception('Failed to uncomplete task: $e');
    }
  }

  // Delete a task
  Future<void> deleteTask(String taskId) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      await _firestore
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .doc(taskId)
          .delete();

      _logger.i('Task deleted successfully: $taskId');
    } catch (e) {
      _logger.e('Failed to delete task: $e');
      throw Exception('Failed to delete task: $e');
    }
  }

  // Get tasks by category
  Stream<List<Task>> getTasksByCategory(TaskCategory category) {
    final userId = _currentUserId;
    if (userId == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .where('category', isEqualTo: category.name)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();
    });
  }

  // Get tasks by priority
  Stream<List<Task>> getTasksByPriority(TaskPriority priority) {
    final userId = _currentUserId;
    if (userId == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .where('priority', isEqualTo: priority.name)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();
    });
  }

  // Get completed tasks
  Stream<List<Task>> getCompletedTasksStream() {
    final userId = _currentUserId;
    if (userId == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .where('isCompleted', isEqualTo: true)
        .orderBy('completedAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();
    });
  }

  // Get pending tasks
  Stream<List<Task>> getPendingTasksStream() {
    final userId = _currentUserId;
    if (userId == null) {
      return Stream.value([]);
    }

    return _firestore
        .collection('users')
        .doc(userId)
        .collection('tasks')
        .where('isCompleted', isEqualTo: false)
        .orderBy('createdAt', descending: true)
        .snapshots()
        .map((snapshot) {
      return snapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();
    });
  }

  // Get task statistics
  Future<Map<String, dynamic>> getTaskStatistics() async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final tasksSnapshot = await _firestore
          .collection('users')
          .doc(userId)
          .collection('tasks')
          .get();

      final tasks = tasksSnapshot.docs.map((doc) {
        final data = doc.data();
        data['id'] = doc.id;
        return Task.fromJson(data);
      }).toList();

      final totalTasks = tasks.length;
      final completedTasks = tasks.where((task) => task.isCompleted).length;
      final pendingTasks = totalTasks - completedTasks;
      final completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0.0;

      // Today's tasks
      final now = DateTime.now();
      final today = DateTime(now.year, now.month, now.day);
      final todayTasks = tasks.where((task) {
        final taskDate = DateTime(
          task.createdAt.year,
          task.createdAt.month,
          task.createdAt.day,
        );
        return taskDate == today;
      }).toList();

      final todayCompleted = todayTasks.where((task) => task.isCompleted).length;

      return {
        'totalTasks': totalTasks,
        'completedTasks': completedTasks,
        'pendingTasks': pendingTasks,
        'completionRate': completionRate,
        'todayTasks': todayTasks.length,
        'todayCompleted': todayCompleted,
      };
    } catch (e) {
      _logger.e('Failed to get task statistics: $e');
      throw Exception('Failed to get task statistics: $e');
    }
  }

  // Update user points
  Future<void> _updateUserPoints(int pointsToAdd) async {
    final userId = _currentUserId;
    if (userId == null) return;

    try {
      await _firestore.collection('users').doc(userId).update({
        'points': FieldValue.increment(pointsToAdd),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      _logger.e('Failed to update user points: $e');
      // Don't throw here as it's not critical
    }
  }

  // Reorder tasks (for drag and drop functionality)
  Future<void> reorderTasks(List<Task> tasks) async {
    final userId = _currentUserId;
    if (userId == null) {
      throw Exception('User not authenticated');
    }

    try {
      final batch = _firestore.batch();
      
      for (int i = 0; i < tasks.length; i++) {
        final taskRef = _firestore
            .collection('users')
            .doc(userId)
            .collection('tasks')
            .doc(tasks[i].id);
        
        batch.update(taskRef, {'order': i});
      }

      await batch.commit();
      _logger.i('Tasks reordered successfully');
    } catch (e) {
      _logger.e('Failed to reorder tasks: $e');
      throw Exception('Failed to reorder tasks: $e');
    }
  }
}