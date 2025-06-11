import 'package:firebase_auth/firebase_auth.dart' as firebase_auth;
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:google_sign_in/google_sign_in.dart';
import 'package:logger/logger.dart';

import '../models/user.dart' as app_user;

class AuthService {
  static final AuthService _instance = AuthService._internal();
  factory AuthService() => _instance;
  AuthService._internal();

  final firebase_auth.FirebaseAuth _auth = firebase_auth.FirebaseAuth.instance;
  final FirebaseFirestore _firestore = FirebaseFirestore.instance;
  final GoogleSignIn _googleSignIn = GoogleSignIn();
  final Logger _logger = Logger();

  // Stream of authentication state changes
  Stream<app_user.User?> get authStateChanges {
    return _auth.authStateChanges().asyncMap((firebaseUser) async {
      if (firebaseUser == null) return null;
      return await _getUserData(firebaseUser.uid);
    });
  }

  // Get current user
  app_user.User? get currentUser {
    final firebaseUser = _auth.currentUser;
    if (firebaseUser == null) return null;
    
    // This is a simplified version - in practice, you'd want to cache this
    return app_user.User(
      id: firebaseUser.uid,
      email: firebaseUser.email ?? '',
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      createdAt: DateTime.now(),
    );
  }

  // Sign in with email and password
  Future<app_user.User> signInWithEmailAndPassword({
    required String email,
    required String password,
  }) async {
    try {
      final credential = await _auth.signInWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user == null) {
        throw Exception('Failed to sign in');
      }

      return await _getUserData(credential.user!.uid);
    } on firebase_auth.FirebaseAuthException catch (e) {
      _logger.e('Sign in failed: ${e.message}');
      throw _handleAuthException(e);
    }
  }

  // Register with email and password
  Future<app_user.User> registerWithEmailAndPassword({
    required String email,
    required String password,
    String? username,
  }) async {
    try {
      final credential = await _auth.createUserWithEmailAndPassword(
        email: email,
        password: password,
      );

      if (credential.user == null) {
        throw Exception('Failed to create user');
      }

      // Create user document in Firestore
      final user = app_user.User(
        id: credential.user!.uid,
        email: email,
        username: username,
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      await _createUserDocument(user);
      await _createStreakDocument(user.id);

      return user;
    } on firebase_auth.FirebaseAuthException catch (e) {
      _logger.e('Registration failed: ${e.message}');
      throw _handleAuthException(e);
    }
  }

  // Sign in with Google
  Future<app_user.User> signInWithGoogle() async {
    try {
      final GoogleSignInAccount? googleUser = await _googleSignIn.signIn();
      if (googleUser == null) {
        throw Exception('Google sign in was cancelled');
      }

      final GoogleSignInAuthentication googleAuth = await googleUser.authentication;
      final credential = firebase_auth.GoogleAuthProvider.credential(
        accessToken: googleAuth.accessToken,
        idToken: googleAuth.idToken,
      );

      final userCredential = await _auth.signInWithCredential(credential);
      if (userCredential.user == null) {
        throw Exception('Failed to sign in with Google');
      }

      // Check if user document exists, create if not
      final userData = await _getUserData(userCredential.user!.uid);
      if (userData.username == null) {
        // First time Google sign in, create user document
        final user = app_user.User(
          id: userCredential.user!.uid,
          email: userCredential.user!.email ?? '',
          displayName: userCredential.user!.displayName,
          photoURL: userCredential.user!.photoURL,
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        );

        await _createUserDocument(user);
        await _createStreakDocument(user.id);
        return user;
      }

      return userData;
    } catch (e) {
      _logger.e('Google sign in failed: $e');
      throw Exception('Failed to sign in with Google: $e');
    }
  }

  // Sign out
  Future<void> signOut() async {
    try {
      await Future.wait([
        _auth.signOut(),
        _googleSignIn.signOut(),
      ]);
    } catch (e) {
      _logger.e('Sign out failed: $e');
      throw Exception('Failed to sign out');
    }
  }

  // Update username
  Future<void> updateUsername(String username) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('No user signed in');

    try {
      await _firestore.collection('users').doc(user.uid).update({
        'username': username,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      _logger.e('Update username failed: $e');
      throw Exception('Failed to update username');
    }
  }

  // Update profile visibility
  Future<void> updateProfileVisibility(bool isPublic) async {
    final user = _auth.currentUser;
    if (user == null) throw Exception('No user signed in');

    try {
      await _firestore.collection('users').doc(user.uid).update({
        'isPublicProfile': isPublic,
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      _logger.e('Update profile visibility failed: $e');
      throw Exception('Failed to update profile visibility');
    }
  }

  // Get user data from Firestore
  Future<app_user.User> _getUserData(String uid) async {
    try {
      final doc = await _firestore.collection('users').doc(uid).get();
      
      if (doc.exists) {
        final data = doc.data()!;
        return app_user.User(
          id: uid,
          email: data['email'] ?? '',
          username: data['username'],
          points: data['points'] ?? 0,
          currentStreak: data['currentStreak'] ?? 0,
          isPublicProfile: data['isPublicProfile'] ?? false,
          createdAt: (data['createdAt'] as Timestamp?)?.toDate(),
          updatedAt: (data['updatedAt'] as Timestamp?)?.toDate(),
        );
      } else {
        // Create new user document
        final firebaseUser = _auth.currentUser!;
        final user = app_user.User(
          id: uid,
          email: firebaseUser.email ?? '',
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          createdAt: DateTime.now(),
        );
        
        await _createUserDocument(user);
        return user;
      }
    } catch (e) {
      _logger.e('Get user data failed: $e');
      throw Exception('Failed to get user data');
    }
  }

  // Create user document in Firestore
  Future<void> _createUserDocument(app_user.User user) async {
    try {
      await _firestore.collection('users').doc(user.id).set({
        'email': user.email,
        'username': user.username,
        'points': user.points,
        'currentStreak': user.currentStreak,
        'isPublicProfile': user.isPublicProfile,
        'createdAt': FieldValue.serverTimestamp(),
        'updatedAt': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      _logger.e('Create user document failed: $e');
      throw Exception('Failed to create user document');
    }
  }

  // Create streak document
  Future<void> _createStreakDocument(String uid) async {
    try {
      await _firestore
          .collection('users')
          .doc(uid)
          .collection('streaks')
          .doc('current')
          .set({
        'currentStreak': 0,
        'lastCompletedDate': FieldValue.serverTimestamp(),
      });
    } catch (e) {
      _logger.e('Create streak document failed: $e');
      // Don't throw here as it's not critical
    }
  }

  // Handle Firebase Auth exceptions
  String _handleAuthException(firebase_auth.FirebaseAuthException e) {
    switch (e.code) {
      case 'user-not-found':
        return 'No user found with this email address.';
      case 'wrong-password':
        return 'Wrong password provided.';
      case 'email-already-in-use':
        return 'An account already exists with this email address.';
      case 'weak-password':
        return 'The password provided is too weak.';
      case 'invalid-email':
        return 'The email address is not valid.';
      case 'user-disabled':
        return 'This user account has been disabled.';
      case 'too-many-requests':
        return 'Too many requests. Try again later.';
      default:
        return e.message ?? 'An unknown error occurred.';
    }
  }
}