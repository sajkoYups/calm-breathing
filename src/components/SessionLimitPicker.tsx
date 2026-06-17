import React from 'react';
import { Pressable, View } from 'react-native';
import { useTheme } from '../theme';
import { continuousCurve, radius, spacing } from '../theme/spacing';
import { triggerButtonPress } from '../utils/feedback';
import { Card } from './ui/Card';
import { Text } from './ui/Text';

interface SessionLimitPickerProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
  helperText?: string;
}

export const SessionLimitPicker: React.FC<SessionLimitPickerProps> = ({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  helperText,
}) => {
  const { colors } = useTheme();

  const decrement = () => {
    if (value > min) {
      triggerButtonPress();
      onChange(value - 1);
    }
  };

  const increment = () => {
    if (value < max) {
      triggerButtonPress();
      onChange(value + 1);
    }
  };

  const stepButton = (symbol: string, onPress: () => void, disabled: boolean) => (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={symbol === '−' ? 'Decrease' : 'Increase'}
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: disabled ? colors.tagBg : colors.cta,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: disabled ? 0.5 : 1,
        ...continuousCurve,
      }}
    >
      <Text
        color={disabled ? 'tertiary' : 'onAccent'}
        style={{ fontSize: 24, lineHeight: 28, fontFamily: 'PlusJakartaSans_600SemiBold' }}
      >
        {symbol}
      </Text>
    </Pressable>
  );

  return (
    <Card style={{ marginBottom: spacing.md }}>
      <Text variant="body" color="primary" style={{ fontFamily: 'PlusJakartaSans_600SemiBold', marginBottom: spacing.sm }}>
        {label}
      </Text>
      {helperText ? (
        <Text variant="caption" color="secondary" style={{ marginBottom: spacing.md }}>
          {helperText}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.lg }}>
        {stepButton('−', decrement, value <= min)}
        <View style={{ alignItems: 'center', minWidth: 80 }}>
          <Text variant="stat" color="accent">
            {value}
          </Text>
          <Text variant="caption" color="secondary">
            {unit}
          </Text>
        </View>
        {stepButton('+', increment, value >= max)}
      </View>
      <Text variant="caption" color="tertiary" align="center" style={{ marginTop: spacing.sm }}>
        {min}–{max} {unit}
      </Text>
    </Card>
  );
};
