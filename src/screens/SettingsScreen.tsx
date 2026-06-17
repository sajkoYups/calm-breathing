import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { clearAllData, getUserSettings, saveUserSettings } from '../utils/storage';
import { SettingToggle } from '../components/SettingToggle';
import { HEADPHONE_WARNING } from '../data/safetyContent';

interface SettingsScreenProps {
  onBack: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToProgress?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onNavigateToHistory,
  onNavigateToProgress,
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
      'Clear All Data',
      'This will delete your session history, progress, and settings. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllData();
              setVibrationEnabled(true);
              setSoundEnabled(true);
              Alert.alert('Success', 'All data has been cleared.');
            } catch {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Options</Text>
        <SettingToggle
          label="Vibration"
          value={vibrationEnabled}
          onValueChange={handleVibrationChange}
        />
        <SettingToggle
          label="Breathing Sound"
          value={soundEnabled}
          onValueChange={handleSoundChange}
        />
        <Text style={styles.headphoneWarning}>{HEADPHONE_WARNING}</Text>
      </View>

      {onNavigateToHistory && (
        <TouchableOpacity onPress={onNavigateToHistory} style={styles.settingItem}>
          <Text style={styles.settingLabel}>Session History</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      )}

      {onNavigateToProgress && (
        <TouchableOpacity onPress={onNavigateToProgress} style={styles.settingItem}>
          <Text style={styles.settingLabel}>Progress</Text>
          <Text style={styles.settingArrow}>→</Text>
        </TouchableOpacity>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.appName}>Calm Breathing</Text>
          <Text style={styles.version}>Version 1.0.0</Text>
          <Text style={styles.description}>
            A minimal breathing app to help you find peace, reduce stress, and improve your
            wellbeing through guided breathing exercises.
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <TouchableOpacity onPress={handleClearAllData} style={styles.dangerButton}>
          <Text style={styles.dangerButtonText}>Clear All Data</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
  },
  content: {
    paddingBottom: 40,
  },
  backButton: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3949AB',
    marginBottom: 12,
  },
  headphoneWarning: {
    fontSize: 13,
    color: '#90A4AE',
    fontStyle: 'italic',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 4,
  },
  settingItem: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#283593',
  },
  settingArrow: {
    fontSize: 20,
    color: '#5C6BC0',
  },
  aboutCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 8,
  },
  version: {
    fontSize: 14,
    color: '#5C6BC0',
    marginBottom: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 24,
  },
  dangerButton: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
