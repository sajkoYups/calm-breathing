import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../theme';
import { getTechniqueAccent } from '../../theme/colors';
import { continuousCurve } from '../../theme/spacing';

interface BreathingOrbProps {
  size: number;
  techniqueId?: string;
  bubbleColor?: string;
}

export const BreathingOrb: React.FC<BreathingOrbProps> = ({ size, techniqueId, bubbleColor }) => {
  const { colors } = useTheme();
  const accent = techniqueId ? getTechniqueAccent(techniqueId) : null;
  const fill = bubbleColor ?? accent?.bubble ?? colors.cta;
  const glowSize = size * 1.6;

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginBottom: 40 }}>
      <View
        style={{
          position: 'absolute',
          width: glowSize,
          height: glowSize,
          borderRadius: glowSize / 2,
          backgroundColor: colors.bubbleGlow,
          opacity: 0.6,
          ...continuousCurve,
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: fill,
          opacity: 0.9,
          ...continuousCurve,
        }}
      />
    </View>
  );
};
