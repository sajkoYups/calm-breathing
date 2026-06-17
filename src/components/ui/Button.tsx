import React from 'react';
import { Pressable, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { continuousCurve, radius, spacing } from '../../theme/spacing';
import { triggerButtonPress } from '../../utils/feedback';
import { Text } from './Text';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
  accessibilityLabel,
  fullWidth = false,
}) => {
  const { colors } = useTheme();

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: colors.cta,
      borderWidth: 0,
    },
    secondary: {
      backgroundColor: colors.tagBg,
      borderWidth: 1,
      borderColor: `${colors.accent}20`,
    },
    ghost: {
      backgroundColor: 'transparent',
      borderWidth: 0,
    },
    danger: {
      backgroundColor: colors.danger,
      borderWidth: 0,
    },
  };

  const textColor: Record<ButtonVariant, 'onAccent' | 'accent' | 'cta' | 'danger'> = {
    primary: 'onAccent',
    secondary: 'accent',
    ghost: 'accent',
    danger: 'onAccent',
  };

  const handlePress = () => {
    triggerButtonPress();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [
        {
          minHeight: 48,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.xl,
          borderRadius: radius.pill,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
          width: fullWidth ? '100%' : undefined,
          ...continuousCurve,
        },
        variantStyles[variant],
        style,
      ]}
    >
      <Text variant="body" color={textColor[variant]} style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
        {label}
      </Text>
    </Pressable>
  );
};
