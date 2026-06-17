import React, { useState, useEffect } from 'react';
import { RefreshControl, View } from 'react-native';
import { UserProgress } from '../types';
import { getUserProgress } from '../utils/storage';
import { Button, Card, Header, Screen, TAB_BAR_HEIGHT, Text } from '../components/ui';
import { spacing } from '../theme/spacing';

interface ProgressScreenProps {
  onBack?: () => void;
  showBack?: boolean;
  onStartSession?: () => void;
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({
  onBack,
  showBack = false,
  onStartSession,
}) => {
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
    if (streak === 0) return 'Start your journey today';
    if (streak === 1) return 'Great start — keep it going';
    if (streak < 7) return "You're building a habit";
    if (streak < 30) return 'Amazing consistency';
    return "You're a breathing master";
  };

  const isEmpty = progress.totalSessions === 0;

  return (
    <Screen
      scroll
      padded={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Header
        onBack={showBack ? onBack : undefined}
        title="Your progress"
      />

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: TAB_BAR_HEIGHT + spacing.xl }}>
        <Card style={{ marginBottom: spacing.lg, alignItems: 'center' }}>
          <Text variant="stat" color="accent">
            {progress.currentStreak}
          </Text>
          <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
            day streak
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginTop: spacing.md }}>
            {getStreakMessage(progress.currentStreak)}
          </Text>
        </Card>

        <View style={{ flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg }}>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="stat" color="accent" style={{ fontSize: 32, lineHeight: 40 }}>
              {progress.totalSessions}
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
              sessions
            </Text>
          </Card>
          <Card style={{ flex: 1, alignItems: 'center' }}>
            <Text variant="stat" color="accent" style={{ fontSize: 32, lineHeight: 40 }}>
              {formatTime(progress.totalTime)}
            </Text>
            <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
              total time
            </Text>
          </Card>
        </View>

        <Card style={{ marginBottom: spacing.xl, alignItems: 'center' }}>
          <Text variant="stat" color="accent" style={{ fontSize: 32, lineHeight: 40 }}>
            {progress.longestStreak}
          </Text>
          <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
            longest streak
          </Text>
        </Card>

        {isEmpty ? (
          <View style={{ alignItems: 'center', paddingVertical: spacing.xl }}>
            <Text variant="title" align="center" style={{ marginBottom: spacing.md }}>
              No sessions yet
            </Text>
            <Text variant="body" color="secondary" align="center" style={{ marginBottom: spacing.xl }}>
              Complete your first breathing session to start tracking your progress.
            </Text>
            {onStartSession ? (
              <Button label="Start breathing" onPress={onStartSession} fullWidth />
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
};
