export interface BreathingTechnique {
  id: string;
  name: string;
  inhaleSeconds: number;
  exhaleSeconds: number;
  holdInhale?: number;
  holdExhale?: number;
  description?: string;
}
