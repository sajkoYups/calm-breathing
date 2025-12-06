import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { UserProgress } from '../types';
import { getUserProgress } from '../utils/storage';

interface ProgressScreenProps {
  onBack: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ onBack }) => {
  const [progress, setProgress] = useState<UserProgress>({
    totalSessions: 0,
    totalTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
  });
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    const userProgress = await getUserProgress();
    setProgress(userProgress);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProgress();
    setRefreshing(false);
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const getStreakMessage = (streak: number): string => {
    if (streak === 0) {
      return 'Start your journey today!';
    } else if (streak === 1) {
      return 'Great start! Keep it going!';
    } else if (streak < 7) {
      return 'You\'re building a great habit!';
    } else if (streak < 30) {
      return 'Amazing consistency!';
    } else {
      return 'You\'re a breathing master!';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Your Progress</Text>

      <View style={styles.statsContainer}>
        {/* Current Streak */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progress.currentStreak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
          <Text style={styles.statMessage}>{getStreakMessage(progress.currentStreak)}</Text>
        </View>

        {/* Total Sessions */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progress.totalSessions}</Text>
          <Text style={styles.statLabel}>Total Sessions</Text>
        </View>

        {/* Total Time */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatTime(progress.totalTime)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>

        {/* Longest Streak */}
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{progress.longestStreak}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>

      {progress.totalSessions === 0 && (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            Complete your first breathing session to start tracking your progress!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  content: {
    paddingBottom: 40,
  },
  backButton: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  statsContainer: {
    paddingHorizontal: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#5C6BC0',
    marginBottom: 4,
  },
  statMessage: {
    fontSize: 14,
    color: '#546E7A',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    paddingHorizontal: 32,
    paddingTop: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#5C6BC0',
    textAlign: 'center',
    lineHeight: 24,
  },
});

