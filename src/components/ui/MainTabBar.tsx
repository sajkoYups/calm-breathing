import React from 'react';
import { Platform, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { continuousCurve, spacing } from '../../theme/spacing';
import { triggerButtonPress } from '../../utils/feedback';
import { Text } from './Text';

export type MainTab = 'breathe' | 'progress' | 'settings';

interface TabConfig {
  id: MainTab;
  label: string;
  icon: string;
  fallback: string;
}

const TABS: TabConfig[] = [
  { id: 'breathe', label: 'Breathe', icon: 'wind', fallback: '~' },
  { id: 'progress', label: 'Progress', icon: 'chart.bar', fallback: '▦' },
  { id: 'settings', label: 'Settings', icon: 'gearshape', fallback: '⚙' },
];

interface MainTabBarProps {
  activeTab: MainTab;
  onTabPress: (tab: MainTab) => void;
}

const TabIcon: React.FC<{ name: string; color: string; fallback: string }> = ({
  name,
  color,
  fallback,
}) => {
  if (Platform.OS === 'ios') {
    return (
      <Image
        source={`sf:${name}`}
        style={{ width: 22, height: 22, tintColor: color }}
        contentFit="contain"
      />
    );
  }
  return (
    <Text variant="body" color="accent" style={{ fontSize: 20, lineHeight: 22, color }}>
      {fallback}
    </Text>
  );
};

export const MainTabBar: React.FC<MainTabBarProps> = ({ activeTab, onTabPress }) => {
  const { colors, shadow } = useTheme();
  const insets = useSafeAreaInsets();

  const handlePress = (tab: MainTab) => {
    if (tab === activeTab) return;
    triggerButtonPress();
    onTabPress(tab);
  };

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: `${colors.textTertiary}30`,
        paddingBottom: Math.max(insets.bottom, spacing.sm),
        paddingTop: spacing.sm,
        ...shadow,
        ...continuousCurve,
      }}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const tint = isActive ? colors.accent : colors.textTertiary;

        return (
          <Pressable
            key={tab.id}
            onPress={() => handlePress(tab.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={tab.label}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 48,
              gap: spacing.xs,
            }}
          >
            <TabIcon name={tab.icon} color={tint} fallback={tab.fallback} />
            <Text
              variant="caption"
              style={{
                color: tint,
                fontFamily: isActive ? 'PlusJakartaSans_600SemiBold' : 'PlusJakartaSans_400Regular',
              }}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export const TAB_BAR_HEIGHT = 64;
