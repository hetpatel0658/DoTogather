
import 'package:speech_to_text/speech_to_text.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:logger/logger.dart';

class VoiceService {
  static final VoiceService _instance = VoiceService._internal();
  factory VoiceService() => _instance;
  VoiceService._internal();

  final SpeechToText _speechToText = SpeechToText();
  final FlutterTts _flutterTts = FlutterTts();
  final Logger _logger = Logger();

  bool _isListening = false;
  bool _isInitialized = false;

  bool get isListening => _isListening;
  bool get isInitialized => _isInitialized;

  Future<void> initialize() async {
    try {
      // Request microphone permission
      final micPermission = await Permission.microphone.request();
      if (!micPermission.isGranted) {
        throw Exception('Microphone permission denied');
      }

      // Initialize speech to text
      _isInitialized = await _speechToText.initialize(
        onError: (error) => _logger.e('Speech recognition error: \$error'),
        onStatus: (status) => _logger.d('Speech recognition status: \$status'),
      );

      // Initialize text to speech
      await _flutterTts.setLanguage('en-US');
      await _flutterTts.setSpeechRate(0.5);
      await _flutterTts.setVolume(1.0);
      await _flutterTts.setPitch(1.0);

      _logger.i('Voice service initialized successfully');
    } catch (e) {
      _logger.e('Failed to initialize voice service: \$e');
      _isInitialized = false;
    }
  }

  Future<void> startListening({
    required Function(String) onResult,
    required Function() onListeningStart,
    required Function() onListeningStop,
  }) async {
    if (!_isInitialized) {
      await initialize();
    }

    if (!_isInitialized) {
      throw Exception('Voice service not initialized');
    }

    try {
      _isListening = true;
      onListeningStart();

      await _speechToText.listen(
        onResult: (result) {
          if (result.finalResult) {
            onResult(result.recognizedWords);
            stopListening();
            onListeningStop();
          }
        },
        listenFor: const Duration(seconds: 5),
        pauseFor: const Duration(seconds: 3),
        partialResults: false,
        localeId: 'en_US',
        cancelOnError: true,
      );
    } catch (e) {
      _logger.e('Failed to start listening: \$e');
      _isListening = false;
      onListeningStop();
      rethrow;
    }
  }

  Future<void> stopListening() async {
    if (_isListening) {
      await _speechToText.stop();
      _isListening = false;
    }
  }

  Future<void> speak(String text) async {
    try {
      await _flutterTts.speak(text);
    } catch (e) {
      _logger.e('Failed to speak: \$e');
    }
  }

  Future<void> stop() async {
    await _flutterTts.stop();
  }

  // Voice command processing
  String? processVoiceCommand(String command) {
    final lowerCommand = command.toLowerCase().trim();
    
    // Add task commands
    if (lowerCommand.contains('add task') || lowerCommand.contains('create task')) {
      final taskName = _extractTaskName(lowerCommand);
      if (taskName != null) {
        return 'add_task:\$taskName';
      }
    }
    
    // Complete task commands
    if (lowerCommand.contains('complete') || lowerCommand.contains('finish')) {
      return 'complete_task';
    }
    
    // Navigation commands
    if (lowerCommand.contains('go to tasks') || lowerCommand.contains('show tasks')) {
      return 'navigate:tasks';
    }
    
    if (lowerCommand.contains('go to home') || lowerCommand.contains('show home')) {
      return 'navigate:home';
    }
    
    if (lowerCommand.contains('go to profile') || lowerCommand.contains('show profile')) {
      return 'navigate:profile';
    }
    
    if (lowerCommand.contains('go to explore') || lowerCommand.contains('show explore')) {
      return 'navigate:explore';
    }
    
    // Stats commands
    if (lowerCommand.contains('show stats') || lowerCommand.contains('my stats')) {
      return 'show_stats';
    }
    
    return null;
  }

  String? _extractTaskName(String command) {
    // Extract task name from commands like "add task buy groceries"
    final patterns = [
      RegExp(r'add task (.+)', caseSensitive: false),
      RegExp(r'create task (.+)', caseSensitive: false),
    ];
    
    for (final pattern in patterns) {
      final match = pattern.firstMatch(command);
      if (match != null && match.group(1) != null) {
        return match.group(1)!.trim();
      }
    }
    
    return null;
  }
}
