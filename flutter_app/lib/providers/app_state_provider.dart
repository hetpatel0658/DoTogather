import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../config/app_config.dart';

class AppState {
  final int activeTabIndex;
  final bool showOnboarding;
  final bool showUsernamePrompt;
  final bool isVoiceListening;
  final String? lastVoiceCommand;

  const AppState({
    this.activeTabIndex = 0,
    this.showOnboarding = false,
    this.showUsernamePrompt = false,
    this.isVoiceListening = false,
    this.lastVoiceCommand,
  });

  AppState copyWith({
    int? activeTabIndex,
    bool? showOnboarding,
    bool? showUsernamePrompt,
    bool? isVoiceListening,
    String? lastVoiceCommand,
  }) {
    return AppState(
      activeTabIndex: activeTabIndex ?? this.activeTabIndex,
      showOnboarding: showOnboarding ?? this.showOnboarding,
      showUsernamePrompt: showUsernamePrompt ?? this.showUsernamePrompt,
      isVoiceListening: isVoiceListening ?? this.isVoiceListening,
      lastVoiceCommand: lastVoiceCommand ?? this.lastVoiceCommand,
    );
  }
}

class AppStateNotifier extends StateNotifier<AppState> {
  AppStateNotifier() : super(const AppState()) {
    _loadInitialState();
  }

  Future<void> _loadInitialState() async {
    final prefs = await SharedPreferences.getInstance();
    final onboardingComplete = prefs.getBool(AppConfig.onboardingKey) ?? false;
    
    state = state.copyWith(
      showOnboarding: !onboardingComplete,
    );
  }

  void setActiveTab(int index) {
    state = state.copyWith(activeTabIndex: index);
  }

  Future<void> setOnboardingComplete(bool complete) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(AppConfig.onboardingKey, complete);
    state = state.copyWith(showOnboarding: !complete);
  }

  void setUsernamePromptComplete(bool complete) {
    state = state.copyWith(showUsernamePrompt: !complete);
  }

  void setVoiceListening(bool listening) {
    state = state.copyWith(isVoiceListening: listening);
  }

  void setLastVoiceCommand(String? command) {
    state = state.copyWith(lastVoiceCommand: command);
  }

  // Navigation helpers
  void goToHome() => setActiveTab(0);
  void goToTasks() => setActiveTab(1);
  void goToExplore() => setActiveTab(2);
  void goToProfile() => setActiveTab(3);
}

final appStateProvider = StateNotifierProvider<AppStateNotifier, AppState>((ref) {
  return AppStateNotifier();
});