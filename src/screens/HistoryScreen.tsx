import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, RefreshControl, View } from 'react-native';
import { BreathingSession } from '../types';
import { getSessions } from '../utils/storage';
import { Button, Card, Header, Screen, Text } from '../components/ui';
import { triggerButtonPress } from '../utils/feedback';
import { spacing } from '../theme/spacing';

interface HistoryScreenProps {
  onBack: () => void;
  onStartSession?: () => void;
}

interface GroupedSession {
  date: string;
  displayDate: string;
  sessions: BreathingSession[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack, onStartSession }) => {
  const [sessions, setSessions] = useState<BreathingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await getSessions();
    const sorted = allSessions.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    setSessions(sorted);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) return 'Today';
    if (isSameDay(date, yesterday)) return 'Yesterday';

    const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isSameDay = (date1: Date, date2: Date): boolean =>
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate();

  const groupSessionsByDate = (): GroupedSession[] => {
    const grouped: Record<string, BreathingSession[]> = {};

    sessions.forEach((session) => {
      const date = new Date(session.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(session);
    });

    return Object.keys(grouped)
      .map((dateKey) => ({
        date: dateKey,
        displayDate: formatDate(grouped[dateKey][0].date),
        sessions: grouped[dateKey],
      }))
      .sort((a, b) => new Date(b.sessions[0].date).getTime() - new Date(a.sessions[0].date).getTime());
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const groupedSessions = groupSessionsByDate();

  if (sessions.length === 0) {
    return (
      <Screen padded={false}>
        <Header onBack={onBack} title="Session history" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl }}>
          <Text variant="title" align="center" style={{ marginBottom: spacing.md }}>
            No sessions yet
          </Text>
          <Text variant="body" color="secondary" align="center" style={{ marginBottom: spacing.xl }}>
            Start a breathing exercise to see your history here.
          </Text>
          {onStartSession ? (
            <Button label="Choose a technique" onPress={onStartSession} fullWidth />
          ) : null}
        </View>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <Header onBack={onBack} title="Session history" />
      <FlatList
        data={groupedSessions}
        keyExtractor={(item) => item.date}
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item: group }) => (
          <View style={{ marginBottom: spacing.xl }}>
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing.md, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {group.displayDate}
            </Text>
            {group.sessions.map((session) => (
              <Card key={session.id} style={{ marginBottom: spacing.sm, paddingVertical: spacing.lg }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm }}>
                  <Text variant="body" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', flex: 1 }}>
                    {session.techniqueName}
                  </Text>
                  <Text variant="caption" color="secondary">
                    {formatTime(session.date)}
                  </Text>
                </View>
                <Text variant="caption" color="secondary">
                  {session.cycles} {session.cycles === 1 ? 'cycle' : 'cycles'} · {formatDuration(session.duration)}
                </Text>
              </Card>
            ))}
          </View>
        )}
      />
    </Screen>
  );
};
