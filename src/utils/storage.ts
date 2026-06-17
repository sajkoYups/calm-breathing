import AsyncStorage from '@react-native-async-storage/async-storage';
import { BreathingSession, UserProgress, UserSettings } from '../types';

const SESSIONS_KEY = '@calm_breathing:sessions';
const SETTINGS_KEY = '@calm_breathing:settings';

const DEFAULT_SETTINGS: UserSettings = {
  vibrationEnabled: true,
  soundEnabled: true,
  safetyAcknowledged: false,
  hasSeenWelcome: false,
};

export const getUserSettings = async (): Promise<UserSettings> => {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error getting user settings:', error);
    return DEFAULT_SETTINGS;
  }
};

export const saveUserSettings = async (settings: Partial<UserSettings>): Promise<UserSettings> => {
  try {
    const current = await getUserSettings();
    const updated = { ...current, ...settings };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    return updated;
  } catch (error) {
    console.error('Error saving user settings:', error);
    throw error;
  }
};

export const saveSession = async (session: BreathingSession): Promise<void> => {
  try {
    const existing = await getSessions();
    const updated = [...existing, session];
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving session:', error);
    throw error;
  }
};

export const getSessions = async (): Promise<BreathingSession[]> => {
  try {
    const data = await AsyncStorage.getItem(SESSIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting sessions:', error);
    return [];
  }
};

export const getSessionsByDateRange = async (
  startDate: Date,
  endDate: Date
): Promise<BreathingSession[]> => {
  try {
    const allSessions = await getSessions();
    return allSessions.filter((session) => {
      const sessionDate = new Date(session.date);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  } catch (error) {
    console.error('Error getting sessions by date range:', error);
    return [];
  }
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const calculateStreak = (sessions: BreathingSession[]): { current: number; longest: number } => {
  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }

  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const uniqueDays = new Set<string>();
  sortedSessions.forEach((session) => {
    const date = new Date(session.date);
    const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    uniqueDays.add(dayKey);
  });

  const daysArray = Array.from(uniqueDays)
    .map((dayKey) => {
      const [year, month, date] = dayKey.split('-').map(Number);
      return new Date(year, month, date);
    })
    .sort((a, b) => b.getTime() - a.getTime());

  let currentStreak = 0;
  const today = getStartOfDay(new Date());
  let expectedDate = today;

  for (const day of daysArray) {
    const dayStart = getStartOfDay(day);
    if (isSameDay(dayStart, expectedDate)) {
      currentStreak++;
      expectedDate = new Date(expectedDate);
      expectedDate.setDate(expectedDate.getDate() - 1);
    } else {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      if (isSameDay(dayStart, yesterday) && currentStreak === 0) {
        currentStreak = 1;
        expectedDate = new Date(yesterday);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let tempStreak = 0;
  let lastDate: Date | null = null;

  for (const day of daysArray) {
    const dayStart = getStartOfDay(day);
    if (lastDate === null) {
      tempStreak = 1;
      lastDate = dayStart;
    } else {
      const daysDiff = Math.floor(
        (lastDate.getTime() - dayStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
      lastDate = dayStart;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  return { current: currentStreak, longest: longestStreak };
};

export const getUserProgress = async (): Promise<UserProgress> => {
  try {
    const sessions = await getSessions();

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        totalTime: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: null,
      };
    }

    const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
    const { current, longest } = calculateStreak(sessions);

    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastSessionDate = sortedSessions[0]?.date || null;

    return {
      totalSessions: sessions.length,
      totalTime,
      currentStreak: current,
      longestStreak: longest,
      lastSessionDate,
    };
  } catch (error) {
    console.error('Error getting user progress:', error);
    return {
      totalSessions: 0,
      totalTime: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastSessionDate: null,
    };
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([SESSIONS_KEY, SETTINGS_KEY]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
