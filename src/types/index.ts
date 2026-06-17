export type SessionLimitMode = 'minutes' | 'rounds';
export type TechniqueKind = 'standard' | 'power';

export interface BreathingTechnique {
  id: string;
  name: string;
  subtitle: string;
  emoji: string;
  inhaleSeconds: number;
  exhaleSeconds: number;
  holdInhale?: number;
  holdExhale?: number;
  whyUseIt: string;
  benefits: string[];
  risks: string[];
  bestFor: string[];
  sessionLimitMode: SessionLimitMode;
  defaultLimit: number;
  minLimit: number;
  maxLimit: number;
  kind: TechniqueKind;
  powerConfig?: {
    defaultBreaths: number;
    minBreaths: number;
    maxBreaths: number;
    recoveryHoldSeconds: number;
  };
}

export interface BreathingSession {
  id: string;
  date: string;
  techniqueId: string;
  techniqueName: string;
  duration: number;
  cycles: number;
}

export interface UserProgress {
  totalSessions: number;
  totalTime: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
}

export interface UserSettings {
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  safetyAcknowledged: boolean;
  hasSeenWelcome: boolean;
}

export interface SessionConfig {
  technique: BreathingTechnique;
  limit: number;
  vibrationEnabled: boolean;
  soundEnabled: boolean;
  breathsPerRound?: number;
}

export type RootStackParamList = {
  Welcome: undefined;
  TechniqueSelection: undefined;
  TechniqueDetail: { technique: BreathingTechnique };
  Breathing: { config: SessionConfig };
};
