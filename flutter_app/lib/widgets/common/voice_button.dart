
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../config/theme_config.dart';
import '../../providers/voice_provider.dart';

class VoiceButton extends ConsumerWidget {
  const VoiceButton({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final voiceState = ref.watch(voiceProvider);
    final isListening = voiceState.isListening;

    return FloatingActionButton(
      onPressed: () {
        if (isListening) {
          ref.read(voiceProvider.notifier).stopListening();
        } else {
          ref.read(voiceProvider.notifier).startListening();
        }
      },
      backgroundColor: isListening ? AppColors.error : AppColors.secondary,
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: isListening
            ? const Icon(
                Icons.mic,
                key: ValueKey('listening'),
                color: Colors.white,
              ).animate(onPlay: (controller) => controller.repeat())
                .scale(begin: const Offset(1.0, 1.0), end: const Offset(1.2, 1.2))
                .then()
                .scale(begin: const Offset(1.2, 1.2), end: const Offset(1.0, 1.0))
            : const Icon(
                Icons.mic_none,
                key: ValueKey('not_listening'),
                color: Colors.white,
              ),
      ),
    );
  }
}
