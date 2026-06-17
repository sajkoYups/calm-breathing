export interface ThemeColors {
  background: string;
  surface: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  accent: string;
  cta: string;
  ctaText: string;
  danger: string;
  dangerText: string;
  warningBg: string;
  warningText: string;
  warningBorder: string;
  tagBg: string;
  tagText: string;
  overlay: string;
  switchTrackOff: string;
  switchThumbOff: string;
  shadow: string;
  bubbleGlow: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F9F7',
  surface: '#FFFFFF',
  textPrimary: '#1A2E28',
  textSecondary: '#5C7A72',
  textTertiary: '#8FA89F',
  accent: '#2A7C6F',
  cta: '#3D9B8F',
  ctaText: '#FFFFFF',
  danger: '#C62828',
  dangerText: '#FFFFFF',
  warningBg: '#FFF3E8',
  warningText: '#E65100',
  warningBorder: '#FFB74D',
  tagBg: 'rgba(42, 124, 111, 0.1)',
  tagText: '#2A7C6F',
  overlay: 'rgba(15, 26, 23, 0.5)',
  switchTrackOff: '#C5D5D0',
  switchThumbOff: '#E8F2EE',
  shadow: 'rgba(42, 124, 111, 0.08)',
  bubbleGlow: 'rgba(61, 155, 143, 0.35)',
};

export const darkColors: ThemeColors = {
  background: '#0F1A17',
  surface: '#1A2B26',
  textPrimary: '#E8F2EE',
  textSecondary: '#8FA89F',
  textTertiary: '#5C7A72',
  accent: '#4DB6A8',
  cta: '#5ECFBF',
  ctaText: '#0F1A17',
  danger: '#EF5350',
  dangerText: '#FFFFFF',
  warningBg: '#2A1F14',
  warningText: '#FFB74D',
  warningBorder: '#FF9800',
  tagBg: 'rgba(94, 207, 191, 0.12)',
  tagText: '#5ECFBF',
  overlay: 'rgba(0, 0, 0, 0.65)',
  switchTrackOff: '#3A4F49',
  switchThumbOff: '#5C7A72',
  shadow: 'rgba(0, 0, 0, 0.25)',
  bubbleGlow: 'rgba(94, 207, 191, 0.25)',
};

export interface TechniqueAccent {
  gradient: [string, string, string];
  ambient: string;
  bubble: string;
}

export const techniqueAccents: Record<string, TechniqueAccent> = {
  'calm-box': {
    gradient: ['#3DADA3', '#5EC4BA', '#7ED9D0'],
    ambient: 'rgba(61, 173, 163, 0.08)',
    bubble: '#5EC4BA',
  },
  'deep-relaxation': {
    gradient: ['#6BBFA8', '#85CCB8', '#9FD9C8'],
    ambient: 'rgba(107, 191, 168, 0.08)',
    bubble: '#85CCB8',
  },
  'balanced-breath': {
    gradient: ['#D48BA8', '#E0A0B8', '#ECB5C8'],
    ambient: 'rgba(212, 139, 168, 0.08)',
    bubble: '#E0A0B8',
  },
  'sleep-wind-down': {
    gradient: ['#6A9FB8', '#82B2C8', '#9AC5D8'],
    ambient: 'rgba(106, 159, 184, 0.08)',
    bubble: '#82B2C8',
  },
  'focus-boost': {
    gradient: ['#D4A870', '#E0BC88', '#ECD0A0'],
    ambient: 'rgba(212, 168, 112, 0.08)',
    bubble: '#E0BC88',
  },
  'power-breathing': {
    gradient: ['#D47060', '#E08878', '#ECA090'],
    ambient: 'rgba(212, 112, 96, 0.08)',
    bubble: '#E08878',
  },
  'gentle-calm': {
    gradient: ['#7AB898', '#92C8AA', '#AAD8BC'],
    ambient: 'rgba(122, 184, 152, 0.08)',
    bubble: '#92C8AA',
  },
  'morning-reset': {
    gradient: ['#D4B860', '#E0C878', '#ECD890'],
    ambient: 'rgba(212, 184, 96, 0.08)',
    bubble: '#E0C878',
  },
};

export const defaultTechniqueAccent: TechniqueAccent = {
  gradient: ['#7A9E96', '#92B2AA', '#AAC6BE'],
  ambient: 'rgba(122, 158, 150, 0.08)',
  bubble: '#92B2AA',
};

export const getTechniqueAccent = (id: string): TechniqueAccent =>
  techniqueAccents[id] ?? defaultTechniqueAccent;

export type TechniqueCategory = 'calm' | 'sleep' | 'focus' | 'energy';

export const techniqueCategories: Record<TechniqueCategory, { label: string; ids: string[] }> = {
  calm: { label: 'Calm', ids: ['calm-box', 'deep-relaxation', 'gentle-calm', 'balanced-breath'] },
  sleep: { label: 'Sleep', ids: ['sleep-wind-down'] },
  focus: { label: 'Focus', ids: ['focus-boost', 'morning-reset'] },
  energy: { label: 'Energy', ids: ['power-breathing'] },
};
