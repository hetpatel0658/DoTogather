import 'package:flutter/material.dart';
import '../../config/theme_config.dart';

class StatsCards extends StatelessWidget {
  final Map<String, dynamic> stats;

  const StatsCards({
    super.key,
    required this.stats,
  });

  @override
  Widget build(BuildContext context) {
    final todayTasks = stats['todayTasks'] ?? 0;
    final todayCompleted = stats['todayCompleted'] ?? 0;
    final currentStreak = 0; // This would come from user data
    final totalPoints = 10; // This would come from user data

    return Row(
      children: [
        Expanded(
          child: _buildStatCard(
            "Today's Tasks",
            '$todayCompleted/$todayTasks',
            Icons.assignment,
            AppColors.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Current Streak',
            '$currentStreak',
            Icons.local_fire_department,
            AppColors.warning,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: _buildStatCard(
            'Total Points',
            '$totalPoints',
            Icons.star,
            AppColors.secondary,
          ),
        ),
      ],
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 8),
          Text(
            title,
            style: AppTextStyles.bodySmall,
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: AppTextStyles.heading3.copyWith(color: color),
          ),
        ],
      ),
    );
  }
}