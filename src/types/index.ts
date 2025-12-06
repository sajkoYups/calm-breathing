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

export type RootStackParamList = {
  Welcome: undefined;
  TechniqueSelection: undefined;
  TechniqueDetail: { technique: BreathingTechnique };
  Breathing: { technique: BreathingTechnique };
};
