import AsyncStorage from '@react-native-async-storage/async-storage';
import { BreathingTechnique, BreathingSession, UserProgress } from '../types';

const CUSTOM_TECHNIQUES_KEY = '@calm_breathing:custom_techniques';
const SESSIONS_KEY = '@calm_breathing:sessions';

export const saveCustomTechnique = async (technique: BreathingTechnique): Promise<void> => {
  try {
    const existing = await getCustomTechniques();
    const updated = [...existing, technique];
    await AsyncStorage.setItem(CUSTOM_TECHNIQUES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving custom technique:', error);
    throw error;
  }
};

export const updateCustomTechnique = async (technique: BreathingTechnique): Promise<void> => {
  try {
    const existing = await getCustomTechniques();
    const updated = existing.map((t) => (t.id === technique.id ? technique : t));
    await AsyncStorage.setItem(CUSTOM_TECHNIQUES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error updating custom technique:', error);
    throw error;
  }
};

export const getCustomTechniques = async (): Promise<BreathingTechnique[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_TECHNIQUES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom techniques:', error);
    return [];
  }
};

export const deleteCustomTechnique = async (id: string): Promise<void> => {
  try {
    const existing = await getCustomTechniques();
    const updated = existing.filter((t) => t.id !== id);
    await AsyncStorage.setItem(CUSTOM_TECHNIQUES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting custom technique:', error);
    throw error;
  }
};

// Session storage functions
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

// Helper function to check if two dates are on the same day
const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

// Helper function to get start of day
const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Calculate streak from sessions
export const calculateStreak = (sessions: BreathingSession[]): { current: number; longest: number } => {
  if (sessions.length === 0) {
    return { current: 0, longest: 0 };
  }

  // Sort sessions by date (newest first)
  const sortedSessions = [...sessions].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Get unique days with sessions
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

  // Calculate current streak
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
      // Check if it's yesterday (allows for same-day streak)
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

  // Calculate longest streak
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

// Get user progress
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

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([CUSTOM_TECHNIQUES_KEY, SESSIONS_KEY]);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

