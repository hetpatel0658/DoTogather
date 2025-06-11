import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:logger/logger.dart';

import '../models/user.dart';
import '../services/auth_service.dart';

// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

// Auth state provider
final authStateProvider = StreamProvider<User?>((ref) {
  final authService = ref.watch(authServiceProvider);
  return authService.authStateChanges;
});

// Current user provider
final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authStateProvider);
  return authState.when(
    data: (user) => user,
    loading: () => null,
    error: (_, __) => null,
  );
});

// Is logged in provider
final isLoggedInProvider = Provider<bool>((ref) {
  final user = ref.watch(currentUserProvider);
  return user != null;
});

// Auth controller
class AuthController extends StateNotifier<AsyncValue<User?>> {
  AuthController(this._authService) : super(const AsyncValue.loading()) {
    // Listen to auth state changes
    _authService.authStateChanges.listen(
      (user) => state = AsyncValue.data(user),
      onError: (error, stackTrace) => state = AsyncValue.error(error, stackTrace),
    );
  }

  final AuthService _authService;
  final Logger _logger = Logger();

  // Sign in with email and password
  Future<void> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.signInWithEmailAndPassword(
        email: email,
        password: password,
      );
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      _logger.e('Sign in failed', error: error, stackTrace: stackTrace);
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Register with email and password
  Future<void> registerWithEmailAndPassword({
    required String email,
    required String password,
    String? username,
  }) async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.registerWithEmailAndPassword(
        email: email,
        password: password,
        username: username,
      );
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      _logger.e('Registration failed', error: error, stackTrace: stackTrace);
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Sign in with Google
  Future<void> signInWithGoogle() async {
    state = const AsyncValue.loading();
    try {
      final user = await _authService.signInWithGoogle();
      state = AsyncValue.data(user);
    } catch (error, stackTrace) {
      _logger.e('Google sign in failed', error: error, stackTrace: stackTrace);
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await _authService.signOut();
      state = const AsyncValue.data(null);
    } catch (error, stackTrace) {
      _logger.e('Sign out failed', error: error, stackTrace: stackTrace);
      state = AsyncValue.error(error, stackTrace);
      rethrow;
    }
  }

  // Update username
  Future<void> updateUsername(String username) async {
    try {
      await _authService.updateUsername(username);
      // Refresh user data
      final currentUser = state.value;
      if (currentUser != null) {
        state = AsyncValue.data(currentUser.copyWith(username: username));
      }
    } catch (error, stackTrace) {
      _logger.e('Update username failed', error: error, stackTrace: stackTrace);
      rethrow;
    }
  }

  // Update profile visibility
  Future<void> updateProfileVisibility(bool isPublic) async {
    try {
      await _authService.updateProfileVisibility(isPublic);
      // Refresh user data
      final currentUser = state.value;
      if (currentUser != null) {
        state = AsyncValue.data(currentUser.copyWith(isPublicProfile: isPublic));
      }
    } catch (error, stackTrace) {
      _logger.e('Update profile visibility failed', error: error, stackTrace: stackTrace);
      rethrow;
    }
  }
}

// Auth controller provider
final authControllerProvider = StateNotifierProvider<AuthController, AsyncValue<User?>>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthController(authService);
});

// Convenience providers for common auth operations
final signInProvider = Provider.family<Future<void>, Map<String, String>>((ref, credentials) {
  final controller = ref.read(authControllerProvider.notifier);
  return controller.signInWithEmailAndPassword(
    email: credentials['email']!,
    password: credentials['password']!,
  );
});

final registerProvider = Provider.family<Future<void>, Map<String, String>>((ref, credentials) {
  final controller = ref.read(authControllerProvider.notifier);
  return controller.registerWithEmailAndPassword(
    email: credentials['email']!,
    password: credentials['password']!,
    username: credentials['username'],
  );
});

final googleSignInProvider = Provider<Future<void>>((ref) {
  final controller = ref.read(authControllerProvider.notifier);
  return controller.signInWithGoogle();
});

final signOutProvider = Provider<Future<void>>((ref) {
  final controller = ref.read(authControllerProvider.notifier);
  return controller.signOut();
});