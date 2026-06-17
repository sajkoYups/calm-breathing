import React, { useState } from 'react';
import { View } from 'react-native';
import { BreathingTechnique, SessionConfig } from '../types';
import { SessionLimitPicker } from '../components/SessionLimitPicker';
import { Button, Card, Header, Screen, Text } from '../components/ui';
import { POWER_BREATHING_WARNING } from '../data/safetyContent';
import { getUserSettings } from '../utils/storage';
import { getTechniqueAccent } from '../theme/colors';
import { useTheme } from '../theme';
import { continuousCurve, radius, spacing } from '../theme/spacing';

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
      <View key={index} style={{ flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-start' }}>
        <Text color="accent" style={{ marginRight: spacing.md, marginTop: 2 }}>
          •
        </Text>
        <Text variant="body" color="secondary" style={{ flex: 1 }}>
          {item}
        </Text>
      </View>
    ))}
  </>
);

export const TechniqueDetailScreen: React.FC<TechniqueDetailScreenProps> = ({
  technique,
  onBack,
  onStart,
}) => {
  const { colors } = useTheme();
  const isPower = technique.kind === 'power';
  const accent = getTechniqueAccent(technique.id);
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

  const defaultLimit = isPower ? technique.powerConfig!.defaultBreaths : technique.defaultLimit;
  const minLimit = isPower ? technique.powerConfig!.minBreaths : technique.minLimit;
  const maxLimit = isPower ? technique.powerConfig!.maxBreaths : technique.maxLimit;

  const [limit, setLimit] = useState(defaultLimit);
  const [roundLimit, setRoundLimit] = useState(technique.defaultLimit);

  const handleStart = async () => {
    const settings = await getUserSettings();
    onStart({
      technique,
      limit: isPower ? roundLimit : limit,
      vibrationEnabled: settings.vibrationEnabled,
      soundEnabled: settings.soundEnabled,
      breathsPerRound: isPower ? limit : undefined,
    });
  };

  const helperText =
    !isPower && technique.sessionLimitMode === 'minutes'
      ? 'Most people start with 5 minutes'
      : undefined;

  return (
    <Screen scroll padded={false} ambientTint={accent.ambient}>
      <Header onBack={onBack} title={technique.name} />

      <View style={{ paddingHorizontal: spacing.lg, paddingBottom: 100 }}>
        <Card
          style={{
            marginBottom: spacing.xl,
            backgroundColor: accent.gradient[0] + '18',
            borderWidth: 1,
            borderColor: accent.gradient[0] + '30',
          }}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 48, marginBottom: spacing.sm }}>{technique.emoji}</Text>
            <Text variant="title" align="center">
              {technique.name}
            </Text>
            <Text variant="body" color="secondary" align="center" style={{ marginTop: spacing.xs }}>
              {technique.subtitle}
            </Text>
            <View
              style={{
                marginTop: spacing.md,
                paddingHorizontal: spacing.md,
                paddingVertical: spacing.xs,
                borderRadius: radius.pill,
                backgroundColor: accent.gradient[0] + '25',
                ...continuousCurve,
              }}
            >
              <Text variant="caption" color="accent">
                {getPatternLabel(technique)}
              </Text>
            </View>
          </View>
        </Card>

        {isPower ? (
          <Card
            style={{
              marginBottom: spacing.xl,
              backgroundColor: colors.warningBg,
              borderLeftWidth: 4,
              borderLeftColor: colors.warningBorder,
            }}
          >
            <Text variant="body" color="warning">
              {POWER_BREATHING_WARNING}
            </Text>
          </Card>
        ) : null}

        <View style={{ marginBottom: spacing.xl }}>
          <Text variant="title" style={{ marginBottom: spacing.md }}>
            Why use it?
          </Text>
          <Text variant="body" color="secondary">
            {technique.whyUseIt}
          </Text>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text variant="title" style={{ marginBottom: spacing.md }}>
            Benefits
          </Text>
          <BulletList items={technique.benefits} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text variant="title" style={{ marginBottom: spacing.md }}>
            Risks & Precautions
          </Text>
          <BulletList items={technique.risks} />
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text variant="title" style={{ marginBottom: spacing.md }}>
            Best for
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {technique.bestFor.map((tag) => (
              <View
                key={tag}
                style={{
                  paddingHorizontal: spacing.md,
                  paddingVertical: spacing.xs,
                  borderRadius: radius.pill,
                  backgroundColor: accent.gradient[0] + '20',
                  ...continuousCurve,
                }}
              >
                <Text variant="caption" color="accent">
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{ marginBottom: spacing.xl }}>
          <Text variant="title" style={{ marginBottom: spacing.md }}>
            Session options
          </Text>
          <SessionLimitPicker
            label={limitLabel}
            value={limit}
            min={minLimit}
            max={maxLimit}
            unit={limitUnit}
            onChange={setLimit}
            helperText={helperText}
          />
          {isPower ? (
            <SessionLimitPicker
              label="Rounds"
              value={roundLimit}
              min={technique.minLimit}
              max={technique.maxLimit}
              unit="rounds"
              onChange={setRoundLimit}
            />
          ) : null}
        </View>
      </View>

      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: spacing.lg,
          paddingBottom: spacing.xl,
          paddingTop: spacing.md,
        }}
      >
        <Button label="Begin Session" onPress={handleStart} fullWidth accessibilityLabel="Begin breathing session" />
      </View>
    </Screen>
  );
};
