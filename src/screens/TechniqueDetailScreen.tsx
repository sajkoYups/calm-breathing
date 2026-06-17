import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { BreathingTechnique, SessionConfig } from '../types';
import { SessionLimitPicker } from '../components/SessionLimitPicker';
import { SettingToggle } from '../components/SettingToggle';
import { getUserSettings, saveUserSettings } from '../utils/storage';
import { HEADPHONE_WARNING, POWER_BREATHING_WARNING } from '../data/safetyContent';

interface TechniqueDetailScreenProps {
  technique: BreathingTechnique;
  onBack: () => void;
  onStart: (config: SessionConfig) => void;
}

const getPatternLabel = (technique: BreathingTechnique): string => {
  if (technique.kind === 'power') {
    const cfg = technique.powerConfig!;
    return `${cfg.minBreaths}–${cfg.maxBreaths} breaths → hold → recover`;
  }
  if (technique.holdInhale || technique.holdExhale) {
    return `${technique.inhaleSeconds}-${technique.holdInhale || 0}-${technique.exhaleSeconds}-${technique.holdExhale || 0} sec`;
  }
  return `${technique.inhaleSeconds}-${technique.exhaleSeconds} sec`;
};

const BulletList: React.FC<{ items: string[] }> = ({ items }) => (
  <>
    {items.map((item, index) => (
      <View key={index} style={styles.listItem}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.listText}>{item}</Text>
      </View>
    ))}
  </>
);

export const TechniqueDetailScreen: React.FC<TechniqueDetailScreenProps> = ({
  technique,
  onBack,
  onStart,
}) => {
  const isPower = technique.kind === 'power';
  const limitLabel = isPower
    ? 'Breaths per Round'
    : technique.sessionLimitMode === 'minutes'
      ? 'Duration'
      : 'Rounds';
  const limitUnit = isPower
    ? 'breaths'
    : technique.sessionLimitMode === 'minutes'
      ? 'min'
      : 'rounds';

  const defaultLimit = isPower
    ? technique.powerConfig!.defaultBreaths
    : technique.defaultLimit;
  const minLimit = isPower ? technique.powerConfig!.minBreaths : technique.minLimit;
  const maxLimit = isPower ? technique.powerConfig!.maxBreaths : technique.maxLimit;

  const [limit, setLimit] = useState(defaultLimit);
  const [roundLimit, setRoundLimit] = useState(technique.defaultLimit);
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

  const handleStart = () => {
    onStart({
      technique,
      limit: isPower ? roundLimit : limit,
      vibrationEnabled,
      soundEnabled,
      breathsPerRound: isPower ? limit : undefined,
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.emoji}>{technique.emoji}</Text>
          <Text style={styles.title}>{technique.name}</Text>
          <Text style={styles.subtitle}>{technique.subtitle}</Text>
          <Text style={styles.pattern}>{getPatternLabel(technique)}</Text>
        </View>

        {isPower && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>{POWER_BREATHING_WARNING}</Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why use it?</Text>
          <Text style={styles.bodyText}>{technique.whyUseIt}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Benefits</Text>
          <BulletList items={technique.benefits} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Risks & Precautions</Text>
          <BulletList items={technique.risks} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Best For</Text>
          <View style={styles.tags}>
            {technique.bestFor.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Options</Text>
          <SessionLimitPicker
            label={limitLabel}
            value={limit}
            min={minLimit}
            max={maxLimit}
            unit={limitUnit}
            onChange={setLimit}
          />
          {isPower && (
            <SessionLimitPicker
              label="Rounds"
              value={roundLimit}
              min={technique.minLimit}
              max={technique.maxLimit}
              unit="rounds"
              onChange={setRoundLimit}
            />
          )}
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

        <TouchableOpacity onPress={handleStart} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Breathing</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8EAF6',
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#5C6BC0',
    fontWeight: '500',
    marginBottom: 8,
  },
  pattern: {
    fontSize: 16,
    color: '#7986CB',
    fontWeight: '600',
  },
  warningBox: {
    backgroundColor: '#FFF3E0',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  warningText: {
    fontSize: 14,
    color: '#E65100',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#3949AB',
    marginBottom: 12,
  },
  bodyText: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 26,
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  bullet: {
    fontSize: 18,
    color: '#5C6BC0',
    marginRight: 10,
    marginTop: 2,
  },
  listText: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 24,
    flex: 1,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#C5CAE9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    fontSize: 14,
    color: '#283593',
    fontWeight: '600',
  },
  headphoneWarning: {
    fontSize: 13,
    color: '#90A4AE',
    fontStyle: 'italic',
    marginTop: 8,
    lineHeight: 18,
  },
  startButton: {
    backgroundColor: '#5C6BC0',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 8,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});
