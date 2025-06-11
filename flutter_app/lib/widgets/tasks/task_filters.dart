import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme_config.dart';
import '../../models/task.dart';
import '../../providers/task_provider.dart';

class TaskFilters extends ConsumerWidget {
  const TaskFilters({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final filter = ref.watch(taskFilterProvider);

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildCategoryFilter(ref, filter),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildPriorityFilter(ref, filter),
            ),
          ],
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _buildCompletionFilter(ref, filter),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildSearchField(ref, filter),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildCategoryFilter(WidgetRef ref, TaskFilter filter) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.textSecondary.withOpacity(0.3)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<TaskCategory?>(
          value: filter.category,
          hint: const Text(
            'All Categories',
            style: AppTextStyles.bodyMedium,
          ),
          isExpanded: true,
          dropdownColor: AppColors.backgroundLight,
          style: AppTextStyles.bodyMedium,
          items: [
            const DropdownMenuItem<TaskCategory?>(
              value: null,
              child: Text('All Categories'),
            ),
            ...TaskCategory.values.map((category) {
              return DropdownMenuItem<TaskCategory?>(
                value: category,
                child: Text(_getCategoryDisplayName(category)),
              );
            }),
          ],
          onChanged: (value) {
            ref.read(taskFilterProvider.notifier).state = 
                filter.copyWith(category: value);
          },
        ),
      ),
    );
  }

  Widget _buildPriorityFilter(WidgetRef ref, TaskFilter filter) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.textSecondary.withOpacity(0.3)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<TaskPriority?>(
          value: filter.priority,
          hint: const Text(
            'All Priorities',
            style: AppTextStyles.bodyMedium,
          ),
          isExpanded: true,
          dropdownColor: AppColors.backgroundLight,
          style: AppTextStyles.bodyMedium,
          items: [
            const DropdownMenuItem<TaskPriority?>(
              value: null,
              child: Text('All Priorities'),
            ),
            ...TaskPriority.values.map((priority) {
              return DropdownMenuItem<TaskPriority?>(
                value: priority,
                child: Text(_getPriorityDisplayName(priority)),
              );
            }),
          ],
          onChanged: (value) {
            ref.read(taskFilterProvider.notifier).state = 
                filter.copyWith(priority: value);
          },
        ),
      ),
    );
  }

  Widget _buildCompletionFilter(WidgetRef ref, TaskFilter filter) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.textSecondary.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          Switch(
            value: filter.isCompleted ?? false,
            onChanged: (value) {
              ref.read(taskFilterProvider.notifier).state = 
                  filter.copyWith(isCompleted: value ? true : null);
            },
            activeColor: AppColors.success,
          ),
          const SizedBox(width: 8),
          const Expanded(
            child: Text(
              'Show completed tasks',
              style: AppTextStyles.bodyMedium,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSearchField(WidgetRef ref, TaskFilter filter) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.textSecondary.withOpacity(0.3)),
      ),
      child: TextField(
        style: AppTextStyles.bodyMedium,
        decoration: const InputDecoration(
          hintText: 'Search tasks...',
          hintStyle: AppTextStyles.bodyMedium,
          prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        ),
        onChanged: (value) {
          ref.read(taskFilterProvider.notifier).state = 
              filter.copyWith(searchQuery: value.isEmpty ? null : value);
        },
      ),
    );
  }

  String _getCategoryDisplayName(TaskCategory category) {
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

  String _getPriorityDisplayName(TaskPriority priority) {
    switch (priority) {
      case TaskPriority.low:
        return 'Low';
      case TaskPriority.medium:
        return 'Medium';
      case TaskPriority.high:
        return 'High';
    }
  }
}