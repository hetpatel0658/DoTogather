import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../config/theme_config.dart';
import '../../providers/auth_provider.dart';
import '../../providers/app_state_provider.dart';
import '../home/home_screen.dart';
import '../tasks/tasks_screen.dart';
import '../explore/explore_screen.dart';
import '../profile/profile_screen.dart';
import 'onboarding_screen.dart';
import 'username_prompt_screen.dart';
import '../../widgets/common/voice_button.dart';

class MainScreen extends ConsumerStatefulWidget {
  const MainScreen({super.key});

  @override
  ConsumerState<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends ConsumerState<MainScreen> {
  @override
  Widget build(BuildContext context) {
    final user = ref.watch(currentUserProvider);
    final appState = ref.watch(appStateProvider);
    
    // Show onboarding if needed
    if (appState.showOnboarding) {
      return OnboardingScreen(
        onComplete: () {
          ref.read(appStateProvider.notifier).setOnboardingComplete(true);
        },
      );
    }
    
    // Show username prompt if needed
    if (appState.showUsernamePrompt || (user != null && (user.username == null || user.username!.isEmpty))) {
      return UsernamePromptScreen(
        onComplete: () {
          ref.read(appStateProvider.notifier).setUsernamePromptComplete(true);
        },
      );
    }

    return Scaffold(
      body: IndexedStack(
        index: appState.activeTabIndex,
        children: const [
          HomeScreen(),
          TasksScreen(),
          ExploreScreen(),
          ProfileScreen(),
        ],
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: AppColors.backgroundLight,
          border: Border(
            top: BorderSide(
              color: Colors.grey.withOpacity(0.2),
              width: 0.5,
            ),
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(
                  icon: Icons.home_outlined,
                  activeIcon: Icons.home,
                  label: 'Home',
                  index: 0,
                ),
                _buildNavItem(
                  icon: Icons.check_box_outlined,
                  activeIcon: Icons.check_box,
                  label: 'Tasks',
                  index: 1,
                ),
                _buildNavItem(
                  icon: Icons.explore_outlined,
                  activeIcon: Icons.explore,
                  label: 'Explore',
                  index: 2,
                ),
                _buildNavItem(
                  icon: Icons.person_outline,
                  activeIcon: Icons.person,
                  label: 'Profile',
                  index: 3,
                ),
              ],
            ),
          ),
        ),
      ),
      floatingActionButton: const VoiceButton(),
      floatingActionButtonLocation: FloatingActionButtonLocation.endFloat,
    );
  }

  Widget _buildNavItem({
    required IconData icon,
    required IconData activeIcon,
    required String label,
    required int index,
  }) {
    final appState = ref.watch(appStateProvider);
    final isActive = appState.activeTabIndex == index;

    return GestureDetector(
      onTap: () {
        ref.read(appStateProvider.notifier).setActiveTab(index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: isActive ? AppColors.secondary.withOpacity(0.1) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 200),
              child: Icon(
                isActive ? activeIcon : icon,
                key: ValueKey(isActive),
                color: isActive ? AppColors.secondary : AppColors.textSecondary,
                size: 24,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
                color: isActive ? AppColors.secondary : AppColors.textSecondary,
              ),
            ),
            if (isActive)
              Container(
                margin: const EdgeInsets.only(top: 2),
                width: 4,
                height: 4,
                decoration: const BoxDecoration(
                  color: AppColors.secondary,
                  shape: BoxShape.circle,
                ),
              ),
          ],
        ),
      ),
    );
  }
}