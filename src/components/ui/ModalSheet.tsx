import React from 'react';
import { Modal, ScrollView, View } from 'react-native';
import { useTheme } from '../../theme';
import { continuousCurve, radius, spacing } from '../../theme/spacing';
import { Button } from './Button';
import { Text } from './Text';

interface ModalSheetProps {
  visible: boolean;
  title: string;
  onDismiss?: () => void;
  primaryAction: { label: string; onPress: () => void };
  secondaryAction?: { label: string; onPress: () => void };
  children: React.ReactNode;
}

export const ModalSheet: React.FC<ModalSheetProps> = ({
  visible,
  title,
  primaryAction,
  secondaryAction,
  children,
}) => {
  const { colors, shadow } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          justifyContent: 'center',
          alignItems: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radius.lg,
            padding: spacing.xl,
            width: '100%',
            maxWidth: 400,
            maxHeight: '80%',
            ...shadow,
            ...continuousCurve,
          }}
        >
          <Text variant="title" align="center" style={{ marginBottom: spacing.lg }}>
            {title}
          </Text>
          <ScrollView
            style={{ maxHeight: 320, marginBottom: spacing.xl }}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
          <View style={{ gap: spacing.md }}>
            <Button label={primaryAction.label} onPress={primaryAction.onPress} fullWidth />
            {secondaryAction ? (
              <Button
                label={secondaryAction.label}
                onPress={secondaryAction.onPress}
                variant="secondary"
                fullWidth
              />
            ) : null}
          </View>
        </View>
      </View>
    </Modal>
  );
};
