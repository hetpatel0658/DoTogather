import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  Animated,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppContext } from '../context/AppContext';

interface VoiceButtonProps {
  isListening?: boolean;
  style?: ViewStyle;
  size?: number;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({
  isListening = false,
  style,
  size = 60,
}) => {
  const { startVoiceListening, stopVoiceListening } = useAppContext();
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (isListening) {
      // Start pulsing animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => {
        pulse.stop();
        pulseAnim.setValue(1);
      };
    }
  }, [isListening, pulseAnim]);

  const handlePress = async () => {
    try {
      if (isListening) {
        await stopVoiceListening();
      } else {
        await startVoiceListening();
      }
    } catch (error) {
      console.error('Voice button error:', error);
    }
  };

  return (
    <View style={[styles.container, style]}>
      {isListening && (
        <View style={[styles.ripple, { width: size * 2, height: size * 2 }]}>
          <Animated.View
            style={[
              styles.rippleInner,
              {
                transform: [{ scale: pulseAnim }],
              },
            ]}
          />
        </View>
      )}
      
      <TouchableOpacity
        style={[styles.button, { width: size, height: size }]}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={isListening ? ['#FF5722', '#FF8A65'] : ['#667eea', '#764ba2']}
          style={[styles.gradient, { borderRadius: size / 2 }]}
        >
          <View style={styles.micIcon}>
            <View style={[styles.micBody, isListening && styles.micBodyActive]} />
            <View style={[styles.micBase, isListening && styles.micBaseActive]} />
            <View style={[styles.micStand, isListening && styles.micStandActive]} />
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ripple: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(102, 126, 234, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rippleInner: {
    width: '100%',
    height: '100%',
    borderRadius: 1000,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(102, 126, 234, 0.3)',
  },
  button: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBody: {
    width: 16,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 4,
  },
  micBodyActive: {
    backgroundColor: '#FFEBEE',
  },
  micBase: {
    width: 20,
    height: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    marginBottom: 2,
  },
  micBaseActive: {
    backgroundColor: '#FFEBEE',
  },
  micStand: {
    width: 2,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  micStandActive: {
    backgroundColor: '#FFEBEE',
  },
});

export default VoiceButton;