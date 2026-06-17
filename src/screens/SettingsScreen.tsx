import React, { useState, useEffect } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { clearAllData, getUserSettings, saveUserSettings } from '../utils/storage';
import { SettingToggle } from '../components/SettingToggle';
import { HEADPHONE_WARNING } from '../data/safetyContent';
import { Button, Card, Header, Screen, TAB_BAR_HEIGHT, Text } from '../components/ui';
import { triggerButtonPress } from '../utils/feedback';
import { spacing } from '../theme/spacing';

interface SettingsScreenProps {
  onBack?: () => void;
  showBack?: boolean;
  onNavigateToHistory?: () => void;
  onNavigateToAbout?: () => void;
}

const SettingRow: React.FC<{ label: string; onPress: () => void }> = ({ label, onPress }) => (
  <Pressable
    onPress={() => {
      triggerButtonPress();
      onPress();
    }}
    accessibilityRole="button"
    accessibilityLabel={label}
    style={{ paddingVertical: spacing.md, minHeight: 44, justifyContent: 'center' }}
  >
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text variant="body" style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
        {label}
      </Text>
      <Text color="accent">›</Text>
    </View>
  </Pressable>
);

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  showBack = false,
  onNavigateToHistory,
  onNavigateToAbout,
}) => {
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    getUserSettings().then((settings) => {
      setVibrationEnabled(settings.vibrationEnabled);
      setSoundEnabled(settings.soundEnabled);
    });
  }, []);

  const handleVibrationChange = async (value: boolean) => {
    setVibrationEnabled(value);
    await saveUserSettings({ vibrationEnabled: value });
  };

  const handleSoundChange = async (value: boolean) => {
    setSoundEnabled(value);
    await saveUserSettings({ soundEnabled: value });
  };

  const handleClearAllData = () => {
    Alert.alert(
      'Clear all data',
      'This will delete your session history, progress, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear all',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              setVibrationEnabled(true);
              setSoundEnabled(true);
              Alert.alert('Done', 'All data has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <Screen scroll padded={false}>
      <Header onBack={showBack ? onBack : undefined} title="Settings" />

      <View
        style={{
          paddingHorizontal: spacing.lg,
          paddingBottom: TAB_BAR_HEIGHT + spacing.xxxl,
          gap: spacing.xl,
        }}
      >
        <View>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            Preferences
          </Text>
          <Card>
            <SettingToggle
              label="Vibration"
              value={vibrationEnabled}
              onValueChange={handleVibrationChange}
              description="Haptic feedback during sessions"
            />
            <View style={{ height: 1, backgroundColor: 'rgba(128,128,128,0.15)' }} />
            <SettingToggle
              label="Breathing sound"
              value={soundEnabled}
              onValueChange={handleSoundChange}
              description="Audio cues for inhale and exhale"
            />
            <Text variant="caption" color="tertiary" style={{ marginTop: spacing.sm }}>
              {HEADPHONE_WARNING}
            </Text>
          </Card>
        </View>

        <View>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            Data
          </Text>
          <Card padded={false} style={{ paddingHorizontal: spacing.lg }}>
            {onNavigateToHistory ? (
              <SettingRow label="Session history" onPress={onNavigateToHistory} />
            ) : null}
          </Card>
        </View>

        <View>
          <Text
            variant="caption"
            color="secondary"
            style={{ marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.8 }}
          >
            About
          </Text>
          <Card>
            {onNavigateToAbout ? (
              <>
                <SettingRow label="About Calm Breathing" onPress={onNavigateToAbout} />
                <View style={{ height: 1, backgroundColor: 'rgba(128,128,128,0.15)', marginVertical: spacing.sm }} />
              </>
            ) : null}
            <Text variant="title" style={{ marginBottom: spacing.xs }}>
              Calm Breathing
            </Text>
            <Text variant="caption" color="secondary" style={{ marginBottom: spacing.lg }}>
              Version 1.0.0
            </Text>
            <Text variant="body" color="secondary">
              A minimal breathing app to help you find peace, reduce stress, and improve your wellbeing
              through guided breathing exercises.
            </Text>
          </Card>
        </View>

        <Button label="Clear all data" onPress={handleClearAllData} variant="danger" fullWidth />
      </View>
    </Screen>
  );
};
