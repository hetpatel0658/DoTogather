import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme_config.dart';
import '../../widgets/common/custom_app_bar.dart';

class ExploreScreen extends ConsumerWidget {
  const ExploreScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      backgroundColor: AppColors.backgroundDark,
      body: SafeArea(
        child: Column(
          children: [
            const CustomAppBar(
              title: 'Explore',
              subtitle: 'Discover new habits and connect',
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionHeader('Popular Habits'),
                    const SizedBox(height: 12),
                    _buildHabitsGrid(),
                    const SizedBox(height: 24),
                    _buildSectionHeader('Community'),
                    const SizedBox(height: 12),
                    _buildCommunitySection(),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: AppTextStyles.heading3,
    );
  }

  Widget _buildHabitsGrid() {
    final habits = [
      {'name': 'Morning Meditation', 'icon': '🧘', 'users': '1.2k'},
      {'name': 'Daily Reading', 'icon': '📚', 'users': '890'},
      {'name': 'Exercise', 'icon': '💪', 'users': '2.1k'},
      {'name': 'Drink Water', 'icon': '💧', 'users': '3.5k'},
      {'name': 'Gratitude Journal', 'icon': '📝', 'users': '756'},
      {'name': 'Learn Language', 'icon': '🗣️', 'users': '432'},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
        childAspectRatio: 1.2,
      ),
      itemCount: habits.length,
      itemBuilder: (context, index) {
        final habit = habits[index];
        return Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppColors.backgroundLight,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                habit['icon']!,
                style: const TextStyle(fontSize: 32),
              ),
              const SizedBox(height: 8),
              Text(
                habit['name']!,
                style: AppTextStyles.bodyLarge.copyWith(
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 4),
              Text(
                '${habit['users']} users',
                style: AppTextStyles.bodySmall,
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildCommunitySection() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.backgroundLight,
        borderRadius: BorderRadius.circular(12),
      ),
      child: const Column(
        children: [
          Icon(
            Icons.people,
            size: 48,
            color: AppColors.secondary,
          ),
          SizedBox(height: 16),
          Text(
            'Connect with Others',
            style: AppTextStyles.heading3,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 8),
          Text(
            'Follow other users, share your progress, and get motivated by the community.',
            style: AppTextStyles.bodyMedium,
            textAlign: TextAlign.center,
          ),
          SizedBox(height: 16),
          Text(
            'Coming Soon!',
            style: TextStyle(
              color: AppColors.secondary,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }
}