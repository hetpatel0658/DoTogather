import 'package:hive/hive.dart';

part 'task.g.dart';

@HiveType(typeId: 2)
enum TaskPriority {
  @HiveField(0)
  low,
  @HiveField(1)
  medium,
  @HiveField(2)
  high,
}

@HiveType(typeId: 3)
enum TaskCategory {
  @HiveField(0)
  personal,
  @HiveField(1)
  work,
  @HiveField(2)
  health,
  @HiveField(3)
  learning,
  @HiveField(4)
  social,
  @HiveField(5)
  other,
}

@HiveType(typeId: 4)
enum TaskFrequency {
  @HiveField(0)
  once,
  @HiveField(1)
  daily,
  @HiveField(2)
  weekly,
  @HiveField(3)
  monthly,
}

@HiveType(typeId: 5)
class Task extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String? description;

  @HiveField(3)
  bool isCompleted;

  @HiveField(4)
  TaskPriority priority;

  @HiveField(5)
  TaskCategory category;

  @HiveField(6)
  TaskFrequency frequency;

  @HiveField(7)
  DateTime? dueDate;

  @HiveField(8)
  DateTime? reminderTime;

  @HiveField(9)
  DateTime createdAt;

  @HiveField(10)
  DateTime? completedAt;

  @HiveField(11)
  String userId;

  @HiveField(12)
  int points;

  @HiveField(13)
  List<String> tags;

  @HiveField(14)
  int estimatedMinutes;

  @HiveField(15)
  String? notes;

  Task({
    required this.id,
    required this.name,
    this.description,
    this.isCompleted = false,
    this.priority = TaskPriority.medium,
    this.category = TaskCategory.personal,
    this.frequency = TaskFrequency.once,
    this.dueDate,
    this.reminderTime,
    required this.createdAt,
    this.completedAt,
    required this.userId,
    this.points = 10,
    this.tags = const [],
    this.estimatedMinutes = 15,
    this.notes,
  });

  factory Task.fromJson(Map<String, dynamic> json) {
    return Task(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      isCompleted: json['isCompleted'] as bool? ?? false,
      priority: TaskPriority.values.firstWhere(
        (e) => e.name == json['priority'],
        orElse: () => TaskPriority.medium,
      ),
      category: TaskCategory.values.firstWhere(
        (e) => e.name == json['category'],
        orElse: () => TaskCategory.personal,
      ),
      frequency: TaskFrequency.values.firstWhere(
        (e) => e.name == json['frequency'],
        orElse: () => TaskFrequency.once,
      ),
      dueDate: json['dueDate'] != null 
          ? DateTime.parse(json['dueDate'] as String)
          : null,
      reminderTime: json['reminderTime'] != null 
          ? DateTime.parse(json['reminderTime'] as String)
          : null,
      createdAt: DateTime.parse(json['createdAt'] as String),
      completedAt: json['completedAt'] != null 
          ? DateTime.parse(json['completedAt'] as String)
          : null,
      userId: json['userId'] as String,
      points: json['points'] as int? ?? 10,
      tags: List<String>.from(json['tags'] ?? []),
      estimatedMinutes: json['estimatedMinutes'] as int? ?? 15,
      notes: json['notes'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'isCompleted': isCompleted,
      'priority': priority.name,
      'category': category.name,
      'frequency': frequency.name,
      'dueDate': dueDate?.toIso8601String(),
      'reminderTime': reminderTime?.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'completedAt': completedAt?.toIso8601String(),
      'userId': userId,
      'points': points,
      'tags': tags,
      'estimatedMinutes': estimatedMinutes,
      'notes': notes,
    };
  }

  Task copyWith({
    String? id,
    String? name,
    String? description,
    bool? isCompleted,
    TaskPriority? priority,
    TaskCategory? category,
    TaskFrequency? frequency,
    DateTime? dueDate,
    DateTime? reminderTime,
    DateTime? createdAt,
    DateTime? completedAt,
    String? userId,
    int? points,
    List<String>? tags,
    int? estimatedMinutes,
    String? notes,
  }) {
    return Task(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      isCompleted: isCompleted ?? this.isCompleted,
      priority: priority ?? this.priority,
      category: category ?? this.category,
      frequency: frequency ?? this.frequency,
      dueDate: dueDate ?? this.dueDate,
      reminderTime: reminderTime ?? this.reminderTime,
      createdAt: createdAt ?? this.createdAt,
      completedAt: completedAt ?? this.completedAt,
      userId: userId ?? this.userId,
      points: points ?? this.points,
      tags: tags ?? this.tags,
      estimatedMinutes: estimatedMinutes ?? this.estimatedMinutes,
      notes: notes ?? this.notes,
    );
  }

  bool get isOverdue {
    if (dueDate == null || isCompleted) return false;
    return DateTime.now().isAfter(dueDate!);
  }

  bool get isDueToday {
    if (dueDate == null) return false;
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final taskDate = DateTime(dueDate!.year, dueDate!.month, dueDate!.day);
    return today == taskDate;
  }

  String get priorityDisplayName {
    switch (priority) {
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.high:
        return 'High';
    }
  }

  String get categoryDisplayName {
    switch (category) {
      case TaskCategory.personal:
        return 'Personal';
      case TaskCategory.work:
        return 'Work';
      case TaskCategory.health:
        return 'Health';
      case TaskCategory.learning:
        return 'Learning';
      case TaskCategory.social:
        return 'Social';
      case TaskCategory.other:
        return 'Other';
    }
  }

  String get frequencyDisplayName {
    switch (frequency) {
      case TaskFrequency.once:
        return 'Once';
      case TaskFrequency.daily:
        return 'Daily';
      case TaskFrequency.weekly:
        return 'Weekly';
      case TaskFrequency.monthly:
        return 'Monthly';
    }
  }
}