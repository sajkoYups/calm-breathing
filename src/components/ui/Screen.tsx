import React from 'react';
import { RefreshControl, RefreshControlProps, ScrollView, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { screenPadding } from '../../theme/spacing';

interface ScreenProps {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
  ambientTint?: string;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const Screen: React.FC<ScreenProps> = ({
  children,
  scroll = false,
  padded = true,
  style,
  ambientTint,
  refreshControl,
}) => {
  const { colors } = useTheme();

  const contentStyle: ViewStyle = {
    flexGrow: 1,
    paddingHorizontal: padded ? screenPadding : 0,
    ...(style ?? {}),
  };

  const background = (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.background,
      }}
    />
  );

  const ambient = ambientTint ? (
    <View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: ambientTint,
      }}
    />
  ) : null;

  if (scroll) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
        {background}
        {ambient}
        <ScrollView
          contentContainerStyle={contentStyle}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top', 'bottom']}>
      {background}
      {ambient}
      <View style={[{ flex: 1 }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
};
