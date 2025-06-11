import 'package:flutter/material.dart';
import '../../config/theme_config.dart';
import '../../models/task.dart';

class PendingTasksSection extends StatelessWidget {
  final List<Task> tasks;

  const PendingTasksSection({
    super.key,
    required this.tasks,
  });

  @override
  Widget build(BuildContext context) {
    final pendingTasks = tasks.where((task) => !task.isCompleted).toList();

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Text(
                'All Pending Tasks',
                style: AppTextStyles.heading3,
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: AppColors.warning.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  '(${pendingTasks.length})',
                  style: TextStyle(
                    fontSize: 12,
                    color: AppColors.warning,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.add, color: AppColors.secondary),
                onPressed: () {
                  // TODO: Add new task
                },
              ),
            ],
          ),
          const SizedBox(height: 12),
          
          // Streak info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.secondary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                const Text('🔥', style: TextStyle(fontSize: 20)),
                const SizedBox(width: 8),
                const Text(
                  'Today',
                  style: AppTextStyles.bodyLarge,
                ),
                const Spacer(),
                const Text(
                  'Streak:',
                  style: AppTextStyles.bodyMedium,
                ),
                const SizedBox(width: 4),
                const Text(
                  '0',
                  style: AppTextStyles.bodyLarge,
                ),
                const SizedBox(width: 4),
                const Text(
                  'Days',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (pendingTasks.isEmpty)
            const Center(
              child: Padding(
                padding: EdgeInsets.all(20),
                child: Column(
                  children: [
                    Icon(
                      Icons.check_circle_outline,
                      size: 48,
                      color: AppColors.success,
                    ),
                    SizedBox(height: 8),
                    Text(
                      'All tasks completed! 🎉',
                      style: AppTextStyles.bodyLarge,
                      textAlign: TextAlign.center,
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Great job staying productive!',
                      style: AppTextStyles.bodyMedium,
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
            )
          else
            Column(
              children: pendingTasks.take(5).map((task) => _buildTaskItem(task)).toList(),
            ),

          if (pendingTasks.length > 5) ...[
            const SizedBox(height: 12),
            Center(
              child: TextButton(
                onPressed: () {
                  // TODO: Navigate to all tasks
                },
                child: Text(
                  'View ${pendingTasks.length - 5} more tasks',
                  style: const TextStyle(color: AppColors.secondary),
                ),
              ),
            ),
          ],

          // Points and streak footer
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.backgroundDark.withOpacity(0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('🏆', style: TextStyle(fontSize: 16)),
                SizedBox(width: 4),
                Text(
                  '10',
                  style: AppTextStyles.bodyLarge,
                ),
                SizedBox(width: 2),
                Text(
                  'Points',
                  style: AppTextStyles.bodyMedium,
                ),
                SizedBox(width: 16),
                Text('|', style: AppTextStyles.bodyMedium),
                SizedBox(width: 16),
                Text('🔥', style: TextStyle(fontSize: 16)),
                SizedBox(width: 4),
                Text(
                  '0',
                  style: AppTextStyles.bodyLarge,
                ),
                SizedBox(width: 2),
                Text(
                  '-Day Streak',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTaskItem(Task task) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.backgroundDark.withOpacity(0.3),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(
            Icons.radio_button_unchecked,
            color: AppColors.textSecondary,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.name,
                  style: AppTextStyles.bodyLarge,
                ),
                if (task.description != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    task.description!,
                    style: AppTextStyles.bodySmall,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
                const SizedBox(height: 4),
                Text(
                  'Frequency: ${task.frequencyDisplayName}',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.secondary,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: const Icon(Icons.delete_outline, color: AppColors.error),
            onPressed: () {
              // TODO: Delete task
            },
          ),
        ],
      ),
    );
  }
}