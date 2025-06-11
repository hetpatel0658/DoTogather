import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useAppContext } from '../context/AppContext';
import TaskList from '../components/TaskList';
import StatsCard from '../components/StatsCard';
import VoiceButton from '../components/VoiceButton';
import WakeWordIndicator from '../components/WakeWordIndicator';

const HomeScreen = () => {
  const {
    user,
    tasks,
    currentStreak,
    completedTasksPercentage,
    isVoiceListening,
    wakeWordEnabled,
    refreshData,
    enableWakeWord,
    disableWakeWord,
  } = useAppContext();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const toggleWakeWord = async () => {
    try {
      if (wakeWordEnabled) {
        await disableWakeWord();
      } else {
        await enableWakeWord();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle wake word detection');
    }
  };

  const todayTasks = tasks.filter(task => {
    const today = new Date().toDateString();
    const taskDate = new Date(task.createdAt).toDateString();
    return taskDate === today;
  });

  const completedToday = todayTasks.filter(task => task.isCompleted).length;
  const pendingTasks = tasks.filter(task => !task.isCompleted);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username || user?.email || 'User'}!</Text>
          </View>
          
          <WakeWordIndicator 
            enabled={wakeWordEnabled}
            onToggle={toggleWakeWord}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Today's Tasks"
            value={`${completedToday}/${todayTasks.length}`}
            subtitle="Completed"
            color="#4FC3F7"
          />
          <StatsCard
            title="Current Streak"
            value={currentStreak.toString()}
            subtitle="Days"
            color="#66BB6A"
          />
          <StatsCard
            title="Total Points"
            value={user?.points?.toString() || '0'}
            subtitle="Earned"
            color="#FFA726"
          />
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Tasks</Text>
            <Text style={styles.taskCount}>
              {pendingTasks.length} pending
            </Text>
          </View>
          
          <TaskList
            tasks={todayTasks}
            showCompleted={true}
            maxItems={5}
          />
          
          {todayTasks.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No tasks for today. Add some tasks to get started!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>📝 Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>📊 View Reports</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>🏆 View Badges</Text>
            </TouchableOpacity>
          </View>
        </View>

        {pendingTasks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Pending Tasks</Text>
            <TaskList
              tasks={pendingTasks}
              showCompleted={false}
              maxItems={10}
            />
          </View>
        )}
      </ScrollView>

      <VoiceButton
        isListening={isVoiceListening}
        style={styles.voiceButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeSection: {
    flex: 1,
  },
  welcomeText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
  },
  userName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  taskCount: {
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  emptyStateText: {
    color: '#666',
    fontSize: 16,
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  voiceButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
});

export default HomeScreen;