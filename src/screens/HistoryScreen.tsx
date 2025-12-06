import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { BreathingSession } from '../types';
import { getSessions } from '../utils/storage';

interface HistoryScreenProps {
  onBack: () => void;
}

interface GroupedSession {
  date: string;
  displayDate: string;
  sessions: BreathingSession[];
}

export const HistoryScreen: React.FC<HistoryScreenProps> = ({ onBack }) => {
  const [sessions, setSessions] = useState<BreathingSession[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    const allSessions = await getSessions();
    // Sort by date (newest first)
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

    if (isSameDay(date, today)) {
      return 'Today';
    } else if (isSameDay(date, yesterday)) {
      return 'Yesterday';
    } else {
      const daysDiff = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        return date.toLocaleDateString('en-US', { weekday: 'long' });
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    }
  };

  const isSameDay = (date1: Date, date2: Date): boolean => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const groupSessionsByDate = (): GroupedSession[] => {
    const grouped: { [key: string]: BreathingSession[] } = {};

    sessions.forEach((session) => {
      const date = new Date(session.date);
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return Object.keys(grouped)
      .map((dateKey) => {
        const date = new Date(grouped[dateKey][0].date);
        return {
          date: dateKey,
          displayDate: formatDate(grouped[dateKey][0].date),
          sessions: grouped[dateKey],
        };
      })
      .sort((a, b) => {
        return new Date(b.sessions[0].date).getTime() - new Date(a.sessions[0].date).getTime();
      });
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const groupedSessions = groupSessionsByDate();

  const renderSessionItem = ({ item }: { item: BreathingSession }) => (
    <View style={styles.sessionItem}>
      <View style={styles.sessionHeader}>
        <Text style={styles.techniqueName}>{item.techniqueName}</Text>
        <Text style={styles.time}>{formatTime(item.date)}</Text>
      </View>
      <View style={styles.sessionDetails}>
        <Text style={styles.detailText}>{item.cycles} cycles</Text>
        <Text style={styles.detailText}>•</Text>
        <Text style={styles.detailText}>{formatDuration(item.duration)}</Text>
      </View>
    </View>
  );

  const renderGroup = ({ item }: { item: GroupedSession }) => (
    <View style={styles.group}>
      <Text style={styles.groupDate}>{item.displayDate}</Text>
      {item.sessions.map((session) => (
        <View key={session.id} style={styles.sessionItem}>
          <View style={styles.sessionHeader}>
            <Text style={styles.techniqueName}>{session.techniqueName}</Text>
            <Text style={styles.time}>{formatTime(session.date)}</Text>
          </View>
          <View style={styles.sessionDetails}>
            <Text style={styles.detailText}>{session.cycles} cycles</Text>
            <Text style={styles.detailText}>•</Text>
            <Text style={styles.detailText}>{formatDuration(session.duration)}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  if (sessions.length === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Sessions Yet</Text>
          <Text style={styles.emptyText}>
            Start a breathing exercise to see your history here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>Session History</Text>
      <FlatList
        data={groupedSessions}
        renderItem={renderGroup}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
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
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  group: {
    marginBottom: 24,
  },
  groupDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3949AB',
    marginBottom: 12,
  },
  sessionItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  techniqueName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283593',
    flex: 1,
  },
  time: {
    fontSize: 14,
    color: '#5C6BC0',
    fontWeight: '500',
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#546E7A',
    marginRight: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3949AB',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#5C6BC0',
    textAlign: 'center',
    lineHeight: 24,
  },
});

