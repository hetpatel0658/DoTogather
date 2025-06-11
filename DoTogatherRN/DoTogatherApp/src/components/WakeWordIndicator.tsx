import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';

interface WakeWordIndicatorProps {
  enabled: boolean;
  onToggle: () => void;
}

const WakeWordIndicator: React.FC<WakeWordIndicatorProps> = ({
  enabled,
  onToggle,
}) => {
  const pulseAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    if (enabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
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
  }, [enabled, pulseAnim]);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        enabled && styles.containerActive,
      ]}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Animated.View
        style={[
          styles.indicator,
          enabled && styles.indicatorActive,
          enabled && {
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <Text style={styles.icon}>👂</Text>
      </Animated.View>
      
      <View style={styles.textContainer}>
        <Text style={styles.title}>Wake Word</Text>
        <Text style={[styles.status, enabled && styles.statusActive]}>
          {enabled ? 'Listening' : 'Disabled'}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  containerActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderColor: 'rgba(76, 175, 80, 0.4)',
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  indicatorActive: {
    backgroundColor: 'rgba(76, 175, 80, 0.3)',
  },
  icon: {
    fontSize: 16,
  },
  textContainer: {
    alignItems: 'flex-start',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  status: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
  },
  statusActive: {
    color: '#4CAF50',
    fontWeight: '600',
  },
});

export default WakeWordIndicator;