import React from 'react';
import { Pressable, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BreathingTechnique } from '../types';
import { getTechniqueAccent } from '../theme/colors';
import { useTheme } from '../theme';
import { continuousCurve, radius, spacing } from '../theme/spacing';
import { useReduceMotion } from '../hooks/use-reduce-motion';
import { triggerButtonPress } from '../utils/feedback';
import { Text } from './ui/Text';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onPress: () => void;
}

const getPatternLabel = (technique: BreathingTechnique): string => {
  if (technique.kind === 'power') return 'Multi-phase';
  if (technique.holdInhale || technique.holdExhale) {
    return `${technique.inhaleSeconds}-${technique.holdInhale || 0}-${technique.exhaleSeconds}-${technique.holdExhale || 0}s`;
  }
  return `${technique.inhaleSeconds}-${technique.exhaleSeconds}s`;
};

export const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, onPress }) => {
  const { width } = useWindowDimensions();
  const { shadow } = useTheme();
  const reduceMotion = useReduceMotion();
  const horizontalPadding = 16;
  const gap = 12;
  const cardWidth = (width - horizontalPadding * 2 - gap) / 2;
  const accent = getTechniqueAccent(technique.id);

  const handlePress = () => {
    triggerButtonPress();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="button"
      accessibilityLabel={`${technique.name}, ${technique.subtitle}`}
      style={({ pressed }) => [
        {
          width: cardWidth,
          height: cardWidth * 1.15,
          marginBottom: spacing.lg,
          marginHorizontal: gap / 2,
          borderRadius: radius.md,
          overflow: 'hidden',
          opacity: pressed ? 0.9 : 1,
          transform: reduceMotion ? undefined : [{ scale: pressed ? 0.98 : 1 }],
          ...shadow,
          ...continuousCurve,
        },
      ]}
    >
      <LinearGradient
        colors={accent.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          flex: 1,
          padding: spacing.lg,
          justifyContent: 'flex-end',
        }}
      >
        <Text style={{ fontSize: 28, marginBottom: spacing.sm }}>{technique.emoji}</Text>
        <Text
          color="onAccent"
          style={{
            fontFamily: 'PlusJakartaSans_600SemiBold',
            fontSize: 16,
            marginBottom: spacing.xs,
          }}
          numberOfLines={2}
        >
          {technique.name}
        </Text>
        <Text
          color="onAccent"
          variant="caption"
          style={{ opacity: 0.9, marginBottom: spacing.xs }}
          numberOfLines={1}
        >
          {technique.subtitle}
        </Text>
        <Text
          color="onAccent"
          variant="caption"
          style={{ opacity: 0.85, fontFamily: 'PlusJakartaSans_600SemiBold' }}
        >
          {getPatternLabel(technique)}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};
