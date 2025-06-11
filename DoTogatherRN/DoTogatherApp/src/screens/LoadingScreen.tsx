import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const LoadingScreen = () => {
  return (
    <LinearGradient
      colors={['#667eea', '#764ba2']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.logo}>
          <View style={styles.logoLine} />
          <View style={styles.logoLine} />
          <View style={[styles.logoLine, styles.logoLineShort]} />
        </View>
        
        <Text style={styles.title}>DoTogather</Text>
        <Text style={styles.subtitle}>Daily Micro-Task Planner</Text>
        
        <ActivityIndicator
          size="large"
          color="#FFFFFF"
          style={styles.loader}
        />
        
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logoLine: {
    height: 6,
    width: 50,
    backgroundColor: '#4FC3F7',
    borderRadius: 3,
    marginBottom: 6,
  },
  logoLineShort: {
    width: 35,
    backgroundColor: '#E91E63',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 50,
  },
  loader: {
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default LoadingScreen;