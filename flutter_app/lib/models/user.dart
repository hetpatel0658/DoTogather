import 'package:hive/hive.dart';

part 'user.g.dart';

@HiveType(typeId: 0)
class User extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String email;

  @HiveField(2)
  String? username;

  @HiveField(3)
  String? displayName;

  @HiveField(4)
  String? photoURL;

  @HiveField(5)
  int points;

  @HiveField(6)
  int currentStreak;

  @HiveField(7)
  bool isPublicProfile;

  @HiveField(8)
  DateTime? createdAt;

  @HiveField(9)
  DateTime? updatedAt;

  User({
    required this.id,
    required this.email,
    this.username,
    this.displayName,
    this.photoURL,
    this.points = 0,
    this.currentStreak = 0,
    this.isPublicProfile = false,
    this.createdAt,
    this.updatedAt,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as String,
      email: json['email'] as String,
      username: json['username'] as String?,
      displayName: json['displayName'] as String?,
      photoURL: json['photoURL'] as String?,
      points: json['points'] as int? ?? 0,
      currentStreak: json['currentStreak'] as int? ?? 0,
      isPublicProfile: json['isPublicProfile'] as bool? ?? false,
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt'] as String)
          : null,
      updatedAt: json['updatedAt'] != null 
          ? DateTime.parse(json['updatedAt'] as String)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'username': username,
      'displayName': displayName,
      'photoURL': photoURL,
      'points': points,
      'currentStreak': currentStreak,
      'isPublicProfile': isPublicProfile,
      'createdAt': createdAt?.toIso8601String(),
      'updatedAt': updatedAt?.toIso8601String(),
    };
  }

  User copyWith({
    String? id,
    String? email,
    String? username,
    String? displayName,
    String? photoURL,
    int? points,
    int? currentStreak,
    bool? isPublicProfile,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return User(
      id: id ?? this.id,
      email: email ?? this.email,
      username: username ?? this.username,
      displayName: displayName ?? this.displayName,
      photoURL: photoURL ?? this.photoURL,
      points: points ?? this.points,
      currentStreak: currentStreak ?? this.currentStreak,
      isPublicProfile: isPublicProfile ?? this.isPublicProfile,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}

@HiveType(typeId: 1)
class UserProfile extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String username;

  @HiveField(2)
  int points;

  @HiveField(3)
  int currentStreak;

  @HiveField(4)
  List<String> badges;

  @HiveField(5)
  int totalTasks;

  @HiveField(6)
  int completedTasks;

  UserProfile({
    required this.id,
    required this.username,
    required this.points,
    required this.currentStreak,
    this.badges = const [],
    this.totalTasks = 0,
    this.completedTasks = 0,
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'] as String,
      username: json['username'] as String,
      points: json['points'] as int,
      currentStreak: json['currentStreak'] as int,
      badges: List<String>.from(json['badges'] ?? []),
      totalTasks: json['totalTasks'] as int? ?? 0,
      completedTasks: json['completedTasks'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'points': points,
      'currentStreak': currentStreak,
      'badges': badges,
      'totalTasks': totalTasks,
      'completedTasks': completedTasks,
    };
  }
}