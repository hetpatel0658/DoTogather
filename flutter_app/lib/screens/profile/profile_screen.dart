import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme_config.dart';
import '../../providers/auth_provider.dart';
import '../../providers/task_provider.dart';
import '../../widgets/common/custom_app_bar.dart';
import '../../widgets/common/custom_button.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final statsAsync = ref.watch(taskStatisticsProvider);

    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: Column(
          children: [
            const CustomAppBar(
              title: 'Profile',
              subtitle: 'Your progress and settings',
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Profile Header
                    _buildProfileHeader(user),
                    const SizedBox(height: 24),

                    // Stats Section
                    statsAsync.when(
                      data: (stats) => _buildStatsSection(stats),
                      loading: () => const CircularProgressIndicator(),
                      error: (_, __) => const SizedBox.shrink(),
                    ),
                    const SizedBox(height: 24),

                    // Badges Section
                    _buildBadgesSection(),
                    const SizedBox(height: 24),

                    // Settings Section
                    _buildSettingsSection(context, ref),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(user) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          CircleAvatar(
            radius: 40,
            backgroundColor: AppColors.secondary,
            backgroundImage: user?.photoURL != null
                ? NetworkImage(user!.photoURL!)
                : null,
            child: user?.photoURL == null
                ? Text(
                    (user?.displayName?.isNotEmpty == true
                        ? user!.displayName![0]
                        : user?.username?.isNotEmpty == true
                        ? user!.username![0]
                        : user?.email[0] ?? 'U').toUpperCase(),
                    style: const TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  )
                : null,
          ),
          const SizedBox(height: 16),
          Text(
            user?.displayName ?? user?.username ?? 'User',
            style: AppTextStyles.heading2,
          ),
          if (user?.email != null) ...[
            const SizedBox(height: 4),
            Text(
              user!.email,
              style: AppTextStyles.bodyMedium,
            ),
          ],
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildProfileStat('Points', '${user?.points ?? 0}', Icons.star),
              _buildProfileStat('Streak', '${user?.currentStreak ?? 0}', Icons.local_fire_department),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildProfileStat(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: AppColors.secondary, size: 24),
        const SizedBox(height: 4),
        Text(value, style: AppTextStyles.heading3),
        Text(label, style: AppTextStyles.bodySmall),
      ],
    );
  }

  Widget _buildStatsSection(Map<String, dynamic> stats) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Statistics', style: AppTextStyles.heading3),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Total Tasks',
                  '${stats['totalTasks'] ?? 0}',
                  Icons.assignment,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Completed',
                  '${stats['completedTasks'] ?? 0}',
                  Icons.check_circle,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Completion Rate',
                  '${(stats['completionRate'] ?? 0.0).toStringAsFixed(1)}%',
                  Icons.trending_up,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Today Completed',
                  '${stats['todayCompleted'] ?? 0}',
                  Icons.today,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon) {
    return Column(
      children: [
        Icon(icon, color: AppColors.secondary, size: 20),
        const SizedBox(height: 4),
        Text(value, style: AppTextStyles.bodyLarge.copyWith(fontWeight: FontWeight.w600)),
        Text(label, style: AppTextStyles.bodySmall, textAlign: TextAlign.center),
      ],
    );
  }

  Widget _buildBadgesSection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Badges', style: AppTextStyles.heading3),
          const SizedBox(height: 16),
          const Text(
            'Earn badges by completing tasks and maintaining streaks!',
            style: AppTextStyles.bodyMedium,
          ),
          const SizedBox(height: 16),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              _buildBadgeItem('🌅', 'Early Bird', false),
              _buildBadgeItem('🔥', 'Streak Master', false),
              _buildBadgeItem('💪', 'Task Crusher', false),
              _buildBadgeItem('⭐', 'Perfectionist', false),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBadgeItem(String emoji, String name, bool earned) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: earned ? AppColors.secondary.withOpacity(0.2) : AppColors.textSecondary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(
          color: earned ? AppColors.secondary : AppColors.textSecondary.withOpacity(0.3),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(emoji, style: const TextStyle(fontSize: 16)),
          const SizedBox(width: 6),
          Text(
            name,
            style: TextStyle(
              fontSize: 12,
              color: earned ? AppColors.secondary : AppColors.textSecondary,
              fontWeight: earned ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsSection(BuildContext context, WidgetRef ref) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Settings', style: AppTextStyles.heading3),
          const SizedBox(height: 16),
          _buildSettingsItem(
            'Edit Profile',
            Icons.edit,
            () {
              // TODO: Navigate to edit profile
            },
          ),
          _buildSettingsItem(
            'Notifications',
            Icons.notifications,
            () {
              // TODO: Navigate to notification settings
            },
          ),
          _buildSettingsItem(
            'Privacy',
            Icons.privacy_tip,
            () {
              // TODO: Navigate to privacy settings
            },
          ),
          _buildSettingsItem(
            'Help & Support',
            Icons.help,
            () {
              // TODO: Navigate to help
            },
          ),
          const Divider(color: AppColors.textSecondary),
          CustomButton(
            text: 'Sign Out',
            onPressed: () async {
              await ref.read(authControllerProvider.notifier).signOut();
            },
            backgroundColor: AppColors.error,
            width: double.infinity,
          ),
        ],
      ),
    );
  }

  Widget _buildSettingsItem(String title, IconData icon, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon, color: AppColors.secondary),
      title: Text(title, style: AppTextStyles.bodyLarge),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textSecondary),
      onTap: onTap,
      contentPadding: EdgeInsets.zero,
    );
  }
}