import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { continuousCurve, radius, spacing } from '../../theme/spacing';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padded?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, padded = true }) => {
  const { colors, shadow } = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radius.md,
          padding: padded ? spacing.xl : 0,
          ...shadow,
          ...continuousCurve,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};
