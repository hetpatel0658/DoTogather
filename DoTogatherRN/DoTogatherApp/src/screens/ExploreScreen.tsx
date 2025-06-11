import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { PublicUserProfile } from '../types';
import ApiService from '../services/api';

const ExploreScreen = () => {
  const [leaderboard, setLeaderboard] = useState<PublicUserProfile[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const response = await ApiService.getLeaderboard(50, 0);
      setLeaderboard(response.users);
      setCurrentUserRank(response.current_user_rank || null);
    } catch (error) {
      Alert.alert('Error', 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#667eea';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Explore</Text>
        <Text style={styles.headerSubtitle}>See how you rank against others</Text>
        
        {currentUserRank && (
          <View style={styles.userRankCard}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <Text style={styles.userRankValue}>#{currentUserRank}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏆 Leaderboard</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading leaderboard...</Text>
            </View>
          ) : leaderboard.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No public profiles found. Be the first to make your profile public!
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardContainer}>
              {leaderboard.map((user, index) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.leaderboardItem,
                    index < 3 && styles.topThreeItem,
                  ]}
                >
                  <View style={styles.rankContainer}>
                    <Text
                      style={[
                        styles.rankText,
                        { color: getRankColor(user.rank) },
                      ]}
                    >
                      {getRankIcon(user.rank)}
                    </Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.username}>{user.username}</Text>
                    {user.fullName && (
                      <Text style={styles.fullName}>{user.fullName}</Text>
                    )}
                    <View style={styles.userStats}>
                      <Text style={styles.statText}>
                        {user.points} pts • {user.currentStreak} day streak
                      </Text>
                      <Text style={styles.statText}>
                        {user.totalTasksCompleted} tasks completed
                      </Text>
                    </View>
                  </View>

                  <View style={styles.levelBadge}>
                    <Text style={styles.levelText}>L{user.level}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Community Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>{leaderboard.length}</Text>
              <Text style={styles.statCardLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>
                {leaderboard.reduce((sum, user) => sum + user.totalTasksCompleted, 0)}
              </Text>
              <Text style={styles.statCardLabel}>Total Tasks</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statCardValue}>
                {Math.max(...leaderboard.map(user => user.currentStreak), 0)}
              </Text>
              <Text style={styles.statCardLabel}>Best Streak</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 Tips to Climb the Leaderboard</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>⚡</Text>
              <Text style={styles.tipText}>
                Complete tasks daily to maintain your streak
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🎯</Text>
              <Text style={styles.tipText}>
                Focus on high-priority tasks for more points
              </Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipIcon}>🏆</Text>
              <Text style={styles.tipText}>
                Make your profile public to appear on the leaderboard
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 20,
  },
  userRankCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  userRankLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 5,
  },
  userRankValue: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
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
  leaderboardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  topThreeItem: {
    backgroundColor: '#FFF9E6',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 15,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  fullName: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  userStats: {
    marginTop: 5,
  },
  statText: {
    fontSize: 12,
    color: '#999',
  },
  levelBadge: {
    backgroundColor: '#667eea',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statCardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tipsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default ExploreScreen;