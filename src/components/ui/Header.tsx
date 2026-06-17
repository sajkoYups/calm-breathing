import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '../../theme';
import { spacing } from '../../theme/spacing';
import { triggerButtonPress } from '../../utils/feedback';
import { Text } from './Text';

export interface HeaderAction {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  fallback?: string;
}

interface HeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  rightActions?: HeaderAction[];
  /** @deprecated Use rightActions */
  rightAction?: HeaderAction;
  showBack?: boolean;
}

const NavIcon: React.FC<{ name: string; color: string; size?: number; fallback?: string }> = ({
  name,
  color,
  size = 20,
  fallback = '‹',
}) => {
  if (Platform.OS === 'ios') {
    return (
      <Image
        source={`sf:${name}`}
        style={{ width: size, height: size, tintColor: color }}
        contentFit="contain"
      />
    );
  }
  return (
    <Text variant="body" color="accent" style={{ fontSize: size + 2, lineHeight: size + 6 }}>
      {fallback}
    </Text>
  );
};

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  onBack,
  backLabel = 'Back',
  rightActions,
  rightAction,
  showBack = true,
}) => {
  const { colors } = useTheme();
  const actions = rightActions ?? (rightAction ? [rightAction] : []);

  const handleBack = () => {
    triggerButtonPress();
    onBack?.();
  };

  const handleAction = (action: HeaderAction) => {
    triggerButtonPress();
    action.onPress();
  };

  const showBackButton = showBack && Boolean(onBack);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        minHeight: 44,
        gap: spacing.sm,
      }}
    >
      <View style={{ minWidth: 72, alignItems: 'flex-start' }}>
        {showBackButton ? (
          <Pressable
            onPress={handleBack}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={8}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing.xs,
              paddingVertical: spacing.xs,
              paddingRight: spacing.sm,
              minHeight: 44,
              justifyContent: 'center',
            }}
          >
            <NavIcon name="chevron.left" color={colors.accent} fallback="‹" />
            <Text variant="body" color="accent" style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              {backLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flex: 1, alignItems: 'center' }}>
        {title ? (
          <Text variant="title" align="center" numberOfLines={1}>
            {title}
          </Text>
        ) : null}
        {subtitle ? (
          <Text variant="caption" color="secondary" align="center" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View
        style={{
          minWidth: 72,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: spacing.sm,
        }}
      >
        {actions.map((action) => (
          <Pressable
            key={action.accessibilityLabel}
            onPress={() => handleAction(action)}
            accessibilityRole="button"
            accessibilityLabel={action.accessibilityLabel}
            hitSlop={8}
            style={{
              padding: spacing.xs,
              minWidth: 44,
              minHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <NavIcon
              name={action.icon}
              color={colors.accent}
              fallback={action.fallback ?? '•'}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
};

export const getTimeGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
};
