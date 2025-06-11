import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme_config.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';
import '../../widgets/home/stats_cards.dart';
import '../../widgets/home/today_tasks_section.dart';
import '../../widgets/home/quick_actions.dart';
import '../../widgets/home/pending_tasks_section.dart';
import '../../widgets/common/custom_app_bar.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final todayTasksAsync = ref.watch(todayTasksStreamProvider);
    final taskStatsAsync = ref.watch(taskStatisticsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () async {
            ref.invalidate(todayTasksStreamProvider);
            ref.invalidate(taskStatisticsProvider);
          },
          child: CustomScrollView(
            slivers: [
              // Custom App Bar
              SliverToBoxAdapter(
                child: CustomAppBar(
                  title: 'Welcome back,',
                  subtitle: user?.displayName ?? user?.username ?? 'HabitMaster!',
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined),
                      onPressed: () {
                        // TODO: Show notifications
                      },
                    ),
                  ],
                ),
              ),

              // Stats Cards
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: taskStatsAsync.when(
                    data: (stats) => StatsCards(stats: stats),
                    loading: () => const StatsCardsLoading(),
                    error: (error, _) => StatsCardsError(error: error.toString()),
                  ),
                ),
              ),

              // Today's Tasks Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: todayTasksAsync.when(
                    data: (tasks) => TodayTasksSection(tasks: tasks),
                    loading: () => const TodayTasksSectionLoading(),
                    error: (error, _) => TodayTasksSectionError(error: error.toString()),
                  ),
                ),
              ),

              // Quick Actions
              const SliverToBoxAdapter(
                child: Padding(
                  padding: EdgeInsets.all(16.0),
                  child: QuickActions(),
                ),
              ),

              // Pending Tasks Section
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Consumer(
                    builder: (context, ref, child) {
                      final pendingTasksAsync = ref.watch(pendingTasksStreamProvider);
                      return pendingTasksAsync.when(
                        data: (tasks) => PendingTasksSection(tasks: tasks),
                        loading: () => const PendingTasksSectionLoading(),
                        error: (error, _) => PendingTasksSectionError(error: error.toString()),
                      );
                    },
                  ),
                ),
              ),

              // Bottom padding
              const SliverToBoxAdapter(
                child: SizedBox(height: 100),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Loading states
class StatsCardsLoading extends StatelessWidget {
  const StatsCardsLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(
        3,
        (index) => Expanded(
          child: Container(
            margin: EdgeInsets.only(
              left: index == 0 ? 0 : 8,
              right: index == 2 ? 0 : 8,
            ),
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.backgroundLight,
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class StatsCardsError extends StatelessWidget {
  final String error;

  const StatsCardsError({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline, color: AppColors.error),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              'Failed to load stats: $error',
              style: const TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
  }
}

class TodayTasksSectionLoading extends StatelessWidget {
  const TodayTasksSectionLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        children: [
          Row(
            children: [
              Text(
                "Today's Tasks",
                style: AppTextStyles.heading3,
              ),
              Spacer(),
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
              ),
            ],
          ),
          SizedBox(height: 16),
          Text(
            'Loading tasks...',
            style: AppTextStyles.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class TodayTasksSectionError extends StatelessWidget {
  final String error;

  const TodayTasksSectionError({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Row(
            children: [
              Icon(Icons.error_outline, color: AppColors.error),
              SizedBox(width: 12),
              Text(
                "Today's Tasks",
                style: AppTextStyles.heading3,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Failed to load tasks: $error',
            style: const TextStyle(color: AppColors.error),
          ),
        ],
      ),
    );
  }
}

class PendingTasksSectionLoading extends StatelessWidget {
  const PendingTasksSectionLoading({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        children: [
          Row(
            children: [
              Text(
                'All Pending Tasks',
                style: AppTextStyles.heading3,
              ),
              Spacer(),
              CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation<Color>(AppColors.secondary),
              ),
            ],
          ),
          SizedBox(height: 16),
          Text(
            'Loading pending tasks...',
            style: AppTextStyles.bodyMedium,
          ),
        ],
      ),
    );
  }
}

class PendingTasksSectionError extends StatelessWidget {
  final String error;

  const PendingTasksSectionError({super.key, required this.error});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.error.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.error.withOpacity(0.3)),
      ),
      child: Column(
        children: [
          const Row(
            children: [
              Icon(Icons.error_outline, color: AppColors.error),
              SizedBox(width: 12),
              Text(
                'All Pending Tasks',
                style: AppTextStyles.heading3,
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            'Failed to load pending tasks: $error',
            style: const TextStyle(color: AppColors.error),
          ),
        ],
      ),
    );
  }
}