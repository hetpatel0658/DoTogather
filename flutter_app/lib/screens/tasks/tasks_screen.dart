import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme_config.dart';
import '../../providers/task_provider.dart';
import '../../models/task.dart';
import '../../widgets/tasks/task_list.dart';
import '../../widgets/tasks/task_filters.dart';
import '../../widgets/tasks/add_task_fab.dart';
import '../../widgets/common/custom_app_bar.dart';

class TasksScreen extends ConsumerStatefulWidget {
  const TasksScreen({super.key});

  @override
  ConsumerState<TasksScreen> createState() => _TasksScreenState();
}

class _TasksScreenState extends ConsumerState<TasksScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: Column(
          children: [
            // Custom App Bar
            const CustomAppBar(
              title: 'Tasks',
              subtitle: 'Manage your daily tasks',
            ),

            // Tab Bar
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: AppColors.backgroundLight,
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: AppColors.secondary,
                  borderRadius: BorderRadius.circular(8),
                ),
                indicatorSize: TabBarIndicatorSize.tab,
                dividerColor: Colors.transparent,
                labelColor: Colors.white,
                unselectedLabelColor: AppColors.textSecondary,
                labelStyle: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                tabs: const [
                  Tab(
                    icon: Icon(Icons.list, size: 20),
                    text: 'All Tasks',
                  ),
                  Tab(
                    icon: Icon(Icons.analytics, size: 20),
                    text: 'Analytics',
                  ),
                  Tab(
                    icon: Icon(Icons.assessment, size: 20),
                    text: 'Reports',
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),

            // Tab Bar View
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildTasksTab(),
                  _buildAnalyticsTab(),
                  _buildReportsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
      floatingActionButton: const AddTaskFab(),
    );
  }

  Widget _buildTasksTab() {
    return Column(
      children: [
        // Filters
        const Padding(
          padding: EdgeInsets.symmetric(horizontal: 16),
          child: TaskFilters(),
        ),
        const SizedBox(height: 16),

        // Task List
        Expanded(
          child: Consumer(
            builder: (context, ref, child) {
              final filter = ref.watch(taskFilterProvider);
              final tasksAsync = ref.watch(tasksStreamProvider);

              return tasksAsync.when(
                data: (tasks) {
                  final filteredTasks = _filterTasks(tasks, filter);
                  return TaskList(tasks: filteredTasks);
                },
                loading: () => const Center(
                  child: CircularProgressIndicator(
                    valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
                  ),
                ),
                error: (error, _) => Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.error_outline,
                        size: 64,
                        color: AppColors.error,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Failed to load tasks',
                        style: AppTextStyles.heading3.copyWith(
                          color: AppColors.error,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        error.toString(),
                        style: AppTextStyles.bodyMedium,
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: () {
                          ref.invalidate(tasksStreamProvider);
                        },
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildAnalyticsTab() {
    return Consumer(
      builder: (context, ref, child) {
        final statsAsync = ref.watch(taskStatisticsProvider);

        return statsAsync.when(
          data: (stats) => _buildAnalyticsContent(stats),
          loading: () => const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
            ),
          ),
          error: (error, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: AppColors.error,
                ),
                const SizedBox(height: 16),
                Text(
                  'Failed to load analytics',
                  style: AppTextStyles.heading3.copyWith(
                    color: AppColors.error,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  error.toString(),
                  style: AppTextStyles.bodyMedium,
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildReportsTab() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.assessment,
            size: 64,
            color: AppColors.textSecondary,
          ),
          SizedBox(height: 16),
          Text(
            'Reports',
            style: AppTextStyles.heading3,
          ),
          SizedBox(height: 8),
          Text(
            'Detailed reports coming soon!',
            style: AppTextStyles.bodyMedium,
          ),
        ],
      ),
    );
  }

  Widget _buildAnalyticsContent(Map<String, dynamic> stats) {
    final totalTasks = stats['totalTasks'] ?? 0;
    final completedTasks = stats['completedTasks'] ?? 0;
    final pendingTasks = stats['pendingTasks'] ?? 0;
    final completionRate = stats['completionRate'] ?? 0.0;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Overview Cards
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Total Tasks',
                  totalTasks.toString(),
                  Icons.assignment,
                  AppColors.primary,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Completed',
                  completedTasks.toString(),
                  Icons.check_circle,
                  AppColors.success,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'Pending',
                  pendingTasks.toString(),
                  Icons.pending,
                  AppColors.warning,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Completion Rate',
                  '${completionRate.toStringAsFixed(1)}%',
                  Icons.trending_up,
                  AppColors.info,
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),

          // Progress Chart
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: AppColors.backgroundLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Progress Overview',
                  style: AppTextStyles.heading3,
                ),
                const SizedBox(height: 16),
                LinearProgressIndicator(
                  value: totalTasks > 0 ? completedTasks / totalTasks : 0,
                  backgroundColor: AppColors.textSecondary.withOpacity(0.3),
                  valueColor: const AlwaysStoppedAnimation<Color>(AppColors.success),
                  minHeight: 8,
                ),
                const SizedBox(height: 8),
                Text(
                  '$completedTasks of $totalTasks tasks completed',
                  style: AppTextStyles.bodyMedium,
                ),
              ],
            ),
          ),
        ],
      ),
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
          Row(
            children: [
              Icon(icon, color: color, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: AppTextStyles.bodyMedium,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: AppTextStyles.heading2.copyWith(color: color),
          ),
        ],
      ),
    );
  }

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
}