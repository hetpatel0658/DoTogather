import 'package:hive/hive.dart';

part 'badge.g.dart';

@HiveType(typeId: 6)
class Badge extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String name;

  @HiveField(2)
  String description;

  @HiveField(3)
  String icon;

  @HiveField(4)
  bool earned;

  @HiveField(5)
  DateTime? earnedAt;

  @HiveField(6)
  String? condition;

  @HiveField(7)
  int? requiredValue;

  @HiveField(8)
  String category;

  Badge({
    required this.id,
    required this.name,
    required this.description,
    required this.icon,
    this.earned = false,
    this.earnedAt,
    this.condition,
    this.requiredValue,
    this.category = 'general',
  });

  factory Badge.fromJson(Map<String, dynamic> json) {
    return Badge(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String,
      icon: json['icon'] as String,
      earned: json['earned'] as bool? ?? false,
      earnedAt: json['earnedAt'] != null 
          ? DateTime.parse(json['earnedAt'] as String)
          : null,
      condition: json['condition'] as String?,
      requiredValue: json['requiredValue'] as int?,
      category: json['category'] as String? ?? 'general',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'icon': icon,
      'earned': earned,
      'earnedAt': earnedAt?.toIso8601String(),
      'condition': condition,
      'requiredValue': requiredValue,
      'category': category,
    };
  }

  Badge copyWith({
    String? id,
    String? name,
    String? description,
    String? icon,
    bool? earned,
    DateTime? earnedAt,
    String? condition,
    int? requiredValue,
    String? category,
  }) {
    return Badge(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      icon: icon ?? this.icon,
      earned: earned ?? this.earned,
      earnedAt: earnedAt ?? this.earnedAt,
      condition: condition ?? this.condition,
      requiredValue: requiredValue ?? this.requiredValue,
      category: category ?? this.category,
    );
  }

  // Predefined badges that match the React app
  static List<Badge> get defaultBadges => [
    Badge(
      id: 'early_bird',
      name: 'Early Bird',
      description: 'Complete a task before 8 AM',
      icon: '🌅',
      condition: 'complete_before_8am',
      category: 'time',
    ),
    Badge(
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: '🔥',
      condition: 'streak_days',
      requiredValue: 7,
      category: 'streak',
    ),
    Badge(
      id: 'task_crusher',
      name: 'Task Crusher',
      description: 'Complete 50 tasks',
      icon: '💪',
      condition: 'total_completed',
      requiredValue: 50,
      category: 'completion',
    ),
    Badge(
      id: 'perfectionist',
      name: 'Perfectionist',
      description: 'Complete all tasks for 3 consecutive days',
      icon: '⭐',
      condition: 'perfect_days',
      requiredValue: 3,
      category: 'completion',
    ),
    Badge(
      id: 'night_owl',
      name: 'Night Owl',
      description: 'Complete a task after 10 PM',
      icon: '🦉',
      condition: 'complete_after_10pm',
      category: 'time',
    ),
    Badge(
      id: 'speed_demon',
      name: 'Speed Demon',
      description: 'Complete 10 tasks in one day',
      icon: '⚡',
      condition: 'daily_completed',
      requiredValue: 10,
      category: 'speed',
    ),
    Badge(
      id: 'consistent',
      name: 'Consistent',
      description: 'Use the app for 30 consecutive days',
      icon: '📅',
      condition: 'usage_days',
      requiredValue: 30,
      category: 'consistency',
    ),
    Badge(
      id: 'social_butterfly',
      name: 'Social Butterfly',
      description: 'Follow 5 other users',
      icon: '🦋',
      condition: 'following_count',
      requiredValue: 5,
      category: 'social',
    ),
  ];
}