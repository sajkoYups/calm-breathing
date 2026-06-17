import React from 'react';
import { Switch, View } from 'react-native';
import { useTheme } from '../theme';
import { spacing } from '../theme/spacing';
import { Text } from './ui/Text';

interface SettingToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  description?: string;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({
  label,
  value,
  onValueChange,
  description,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: spacing.md,
        minHeight: 44,
      }}
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
    >
      <View style={{ flex: 1, paddingRight: spacing.md }}>
        <Text variant="body" style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
          {label}
        </Text>
        {description ? (
          <Text variant="caption" color="secondary" style={{ marginTop: spacing.xs }}>
            {description}
          </Text>
        ) : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.switchTrackOff, true: colors.accent }}
        thumbColor={value ? colors.cta : colors.switchThumbOff}
      />
    </View>
  );
};
