import { BreathingTechnique } from '../types';

export const defaultTechniques: BreathingTechnique[] = [
  {
    id: 'wim-hof',
    name: 'Wim Hof Method',
    inhaleSeconds: 4,
    exhaleSeconds: 6,
    holdInhale: 4,
    description: 'Powerful breathing technique for stress reduction',
  },
  {
    id: 'box-breathing',
    name: 'Box Breathing',
    inhaleSeconds: 4,
    exhaleSeconds: 4,
    holdInhale: 4,
    holdExhale: 4,
    description: 'Equal 4-4-4-4 pattern for calm and focus',
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    inhaleSeconds: 4,
    exhaleSeconds: 8,
    holdInhale: 7,
    description: 'Relaxing technique that promotes sleep',
  },
  {
    id: 'deep-breathing',
    name: 'Deep Breathing',
    inhaleSeconds: 5,
    exhaleSeconds: 5,
    description: 'Simple and effective for daily relaxation',
  },
  {
    id: 'pranayama',
    name: 'Pranayama',
    inhaleSeconds: 6,
    exhaleSeconds: 6,
    description: 'Traditional yogic breathing for balance',
  },
];

