import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Button, Header, Screen, Text } from '../components/ui';
import { useReduceMotion } from '../hooks/use-reduce-motion';
import { useTheme } from '../theme';
import { spacing } from '../theme/spacing';
import { BreathingOrb } from '../components/ui/BreathingOrb';

interface WelcomeScreenProps {
  mode?: 'onboarding' | 'about';
  onNavigate?: () => void;
  onBack?: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  mode = 'onboarding',
  onNavigate,
  onBack,
}) => {
  const { colors } = useTheme();
  const reduceMotion = useReduceMotion();
  const scaleRef = useRef(0.6);
  const [, setTick] = React.useState(0);
  const frameRef = useRef<number | null>(null);
  const isAbout = mode === 'about';

  useEffect(() => {
    if (reduceMotion) return;

    const start = performance.now();
    const animate = (now: number) => {
      const t = (now - start) / 1000;
      const breath = (Math.sin(t * Math.PI) + 1) / 2;
      scaleRef.current = 0.55 + breath * 0.35;
      setTick((n) => n + 1);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [reduceMotion]);

  const orbSize = reduceMotion ? 100 : 80 + scaleRef.current * 60;

  return (
    <Screen padded={false}>
      {isAbout ? <Header onBack={onBack} title="About" /> : null}

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: spacing.xxl,
        }}
      >
        <BreathingOrb size={orbSize} bubbleColor={colors.cta} />

        <Text variant="display" align="center" style={{ marginBottom: spacing.md }}>
          Calm Breathing
        </Text>
        <Text variant="body" color="secondary" align="center" style={{ marginBottom: spacing.xxxl }}>
          Find your peace through guided breathing exercises. Discover techniques to calm your mind,
          reduce stress, and improve your wellbeing.
        </Text>
      </View>

      <View style={{ paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl }}>
        {isAbout ? (
          <Button label="Done" onPress={onBack!} fullWidth accessibilityLabel="Close about screen" />
        ) : (
          <Button
            label="Get Started"
            onPress={onNavigate!}
            fullWidth
            accessibilityLabel="Get started with Calm Breathing"
          />
        )}
      </View>
    </Screen>
  );
};
