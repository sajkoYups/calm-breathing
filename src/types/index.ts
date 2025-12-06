export interface BreathingTechnique {
  id: string;
  name: string;
  inhaleSeconds: number;
  exhaleSeconds: number;
  holdInhale?: number;
  holdExhale?: number;
  description?: string;
  isCustom?: boolean;
}

export interface BreathingSession {
  id: string;
  date: string; // ISO date string
  techniqueId: string;
  techniqueName: string;
  duration: number; // in seconds
  cycles: number;
}

export interface UserProgress {
  totalSessions: number;
  totalTime: number; // in seconds
  currentStreak: number; // consecutive days
  longestStreak: number;
  lastSessionDate: string | null; // ISO date string
}

export type RootStackParamList = {
  Welcome: undefined;
  TechniqueSelection: undefined;
  TechniqueDetail: { technique: BreathingTechnique };
  Breathing: { technique: BreathingTechnique };
};
