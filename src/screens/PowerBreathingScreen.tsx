import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Alert, BackHandler, View } from 'react-native';
import { SessionConfig } from '../types';
import { saveSession, getUserProgress } from '../utils/storage';
import {
  triggerPhaseChange,
  triggerCountdown,
  playInhale,
  playExhale,
  stopBreathSound,
  playPhaseBell,
  loadSounds,
  unloadSounds,
  triggerSessionComplete,
} from '../utils/feedback';
import { Button, BreathingOrb, Header, ModalSheet, Screen, Text } from '../components/ui';
import { getTechniqueAccent } from '../theme/colors';
import { useTheme } from '../theme';
import { continuousCurve, radius, spacing } from '../theme/spacing';

interface PowerBreathingScreenProps {
  config: SessionConfig;
  onBack: () => void;
  onBreatheAgain?: () => void;
}

type PowerPhase = 'deepBreaths' | 'exhaleHold' | 'recoveryInhale' | 'recoveryHold';

const BREATH_CYCLE_SECONDS = 2;
const RECOVERY_INHALE_SECONDS = 4;
const EXHALE_HOLD_MAX_SECONDS = 90;

export const PowerBreathingScreen: React.FC<PowerBreathingScreenProps> = ({
  config,
  onBack,
  onBreatheAgain,
}) => {
  const { technique, limit: totalRounds, vibrationEnabled, soundEnabled } = config;
  const { colors } = useTheme();
  const accent = getTechniqueAccent(technique.id);
  const breathsPerRound = config.breathsPerRound ?? technique.powerConfig!.defaultBreaths;
  const recoveryHoldSeconds = technique.powerConfig!.recoveryHoldSeconds;

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<PowerPhase>('deepBreaths');
  const [currentRound, setCurrentRound] = useState(1);
  const [breathCount, setBreathCount] = useState(0);
  const [breathSubPhase, setBreathSubPhase] = useState<'inhale' | 'exhale'>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(BREATH_CYCLE_SECONDS / 2);
  const [bubbleScale, setBubbleScale] = useState(0.5);
  const [exhaleHoldElapsed, setExhaleHoldElapsed] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalStats, setFinalStats] = useState({ duration: 0, rounds: 0 });
  const [streak, setStreak] = useState(0);

  const sessionStartTimeRef = useRef<number | null>(null);
  const hasSavedSessionRef = useRef(false);
  const phaseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<PowerPhase>('deepBreaths');
  const prevTimeRemainingRef = useRef(BREATH_CYCLE_SECONDS / 2);

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const handleSessionComplete = useCallback(
    async (rounds: number) => {
      if (hasSavedSessionRef.current) return;
      const duration = sessionStartTimeRef.current
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : 0;
      hasSavedSessionRef.current = true;
      setIsActive(false);
      await stopBreathSound();
      setFinalStats({ duration, rounds });
      const progress = await getUserProgress();
      setStreak(progress.currentStreak);
      setIsComplete(true);
      triggerSessionComplete();
      if (rounds > 0) {
        await saveSession({
          id: `session-${Date.now()}`,
          date: new Date().toISOString(),
          techniqueId: technique.id,
          techniqueName: technique.name,
          duration,
          cycles: rounds,
        });
      }
    },
    [technique]
  );

  const advanceRound = useCallback(
    (round: number) => {
      if (round >= totalRounds) {
        handleSessionComplete(round);
      } else {
        setCurrentRound(round + 1);
        setBreathCount(0);
        setBreathSubPhase('inhale');
        setPhase('deepBreaths');
        setTimeRemaining(BREATH_CYCLE_SECONDS / 2);
        phaseStartTimeRef.current = performance.now();
      }
    },
    [totalRounds, handleSessionComplete]
  );

  useEffect(() => {
    if (!isActive) return;

    if (phase === 'exhaleHold') {
      const interval = setInterval(() => {
        setExhaleHoldElapsed((prev) => {
          const next = prev + 1;
          if (next >= EXHALE_HOLD_MAX_SECONDS) {
            setPhase('recoveryInhale');
            setTimeRemaining(RECOVERY_INHALE_SECONDS);
            phaseStartTimeRef.current = performance.now();
          }
          return next;
        });
      }, 1000);
      return () => clearInterval(interval);
    }

    if (phase === 'deepBreaths' || phase === 'recoveryInhale' || phase === 'recoveryHold') {
      const interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev > 1) return prev - 1;
          return 0;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive, phase]);

  useEffect(() => {
    if (!isActive || timeRemaining > 0) return;

    if (phase === 'deepBreaths') {
      if (breathSubPhase === 'inhale') {
        setBreathSubPhase('exhale');
        setTimeRemaining(BREATH_CYCLE_SECONDS / 2);
        phaseStartTimeRef.current = performance.now();
      } else {
        const nextCount = breathCount + 1;
        setBreathCount(nextCount);
        if (nextCount >= breathsPerRound) {
          setPhase('exhaleHold');
          setExhaleHoldElapsed(0);
          stopBreathSound();
        } else {
          setBreathSubPhase('inhale');
          setTimeRemaining(BREATH_CYCLE_SECONDS / 2);
          phaseStartTimeRef.current = performance.now();
        }
      }
    } else if (phase === 'recoveryInhale') {
      setPhase('recoveryHold');
      setTimeRemaining(recoveryHoldSeconds);
      phaseStartTimeRef.current = performance.now();
    } else if (phase === 'recoveryHold') {
      advanceRound(currentRound);
    }
  }, [
    isActive,
    timeRemaining,
    phase,
    breathSubPhase,
    breathCount,
    breathsPerRound,
    recoveryHoldSeconds,
    currentRound,
    advanceRound,
  ]);

  useEffect(() => {
    if (!isActive) return;

    if (phase !== prevPhaseRef.current) {
      triggerPhaseChange(vibrationEnabled);
      if (phase !== 'deepBreaths') {
        playPhaseBell(soundEnabled);
      }
      if (phase === 'deepBreaths' || phase === 'recoveryInhale') {
        playInhale(soundEnabled);
      } else if (phase === 'exhaleHold') {
        stopBreathSound();
      }
      prevPhaseRef.current = phase;
    }

    if (phase !== 'exhaleHold' && timeRemaining !== prevTimeRemainingRef.current) {
      triggerCountdown(timeRemaining, vibrationEnabled);
      prevTimeRemainingRef.current = timeRemaining;
    }
  }, [phase, timeRemaining, isActive, vibrationEnabled, soundEnabled]);

  useEffect(() => {
    if (!isActive || phase !== 'deepBreaths') return;

    if (breathSubPhase === 'inhale') {
      playInhale(soundEnabled);
    } else {
      playExhale(soundEnabled);
    }
  }, [breathSubPhase, isActive, phase, soundEnabled]);

  useEffect(() => {
    if (!isActive) {
      setBubbleScale(0.5);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const animate = (timestamp: number) => {
      if (phase === 'deepBreaths') {
        const halfDuration = (BREATH_CYCLE_SECONDS / 2) * 1000;
        const elapsed = timestamp - phaseStartTimeRef.current;
        const progress = easeInOut(Math.max(0, Math.min(1, elapsed / halfDuration)));
        if (breathSubPhase === 'inhale') {
          setBubbleScale(0.5 + 0.5 * progress);
        } else {
          setBubbleScale(1.0 - 0.5 * progress);
        }
      } else if (phase === 'recoveryInhale') {
        const duration = RECOVERY_INHALE_SECONDS * 1000;
        const elapsed = timestamp - phaseStartTimeRef.current;
        const progress = easeInOut(Math.max(0, Math.min(1, elapsed / duration)));
        setBubbleScale(0.5 + 0.5 * progress);
      } else if (phase === 'recoveryHold') {
        setBubbleScale(1.0);
      } else {
        setBubbleScale(0.5);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive, phase, breathSubPhase]);

  const handleExhaleHoldReady = () => {
    triggerPhaseChange(vibrationEnabled);
    setPhase('recoveryInhale');
    setTimeRemaining(RECOVERY_INHALE_SECONDS);
    phaseStartTimeRef.current = performance.now();
    playInhale(soundEnabled);
  };

  const handleToggle = () => {
    if (!isActive) {
      sessionStartTimeRef.current = Date.now();
      hasSavedSessionRef.current = false;
      setCurrentRound(1);
      setBreathCount(0);
      setBreathSubPhase('inhale');
      setPhase('deepBreaths');
      setTimeRemaining(BREATH_CYCLE_SECONDS / 2);
      setExhaleHoldElapsed(0);
      prevPhaseRef.current = 'deepBreaths';
      phaseStartTimeRef.current = performance.now();
      setIsActive(true);
      triggerPhaseChange(vibrationEnabled);
      playInhale(soundEnabled);
    } else {
      setIsActive(false);
      stopBreathSound();
      if (sessionStartTimeRef.current && currentRound > 0 && !hasSavedSessionRef.current) {
        const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        const completedRounds = currentRound - 1 + (phase === 'recoveryHold' ? 1 : 0);
        if (completedRounds > 0) {
          hasSavedSessionRef.current = true;
          saveSession({
            id: `session-${Date.now()}`,
            date: new Date().toISOString(),
            techniqueId: technique.id,
            techniqueName: technique.name,
            duration,
            cycles: completedRounds,
          });
        }
      }
    }
  };

  const exitSession = async () => {
    await stopBreathSound();
    onBack();
  };

  const handleBack = () => {
    if (isActive) {
      Alert.alert('Leave session?', 'Your progress may not be saved.', [
        { text: 'Stay', style: 'cancel' },
        { text: 'Leave', style: 'destructive', onPress: exitSession },
      ]);
    } else {
      exitSession();
    }
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      handleBack();
      return true;
    });
    return () => subscription.remove();
  }, [isActive]);

  const getPhaseText = (): string => {
    switch (phase) {
      case 'deepBreaths':
        return breathSubPhase === 'inhale' ? 'Deep breath in' : 'Deep breath out';
      case 'exhaleHold':
        return 'Exhale fully & hold';
      case 'recoveryInhale':
        return 'Deep inhale';
      case 'recoveryHold':
        return 'Hold';
      default:
        return 'Ready';
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const bubbleSize = Math.max(50, 200 * bubbleScale);

  return (
    <Screen padded={false} ambientTint={accent.ambient}>
      <Header onBack={handleBack} title={technique.name} subtitle={`Round ${currentRound} of ${totalRounds}`} />

      <View
        style={{
          backgroundColor: colors.warningBg,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.lg,
          marginHorizontal: spacing.lg,
          borderRadius: radius.sm,
          marginBottom: spacing.md,
          ...continuousCurve,
        }}
      >
        <Text variant="caption" color="warning" align="center">
          Stay seated. Stop if dizzy.
        </Text>
      </View>

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl }}>
        <BreathingOrb size={bubbleSize} techniqueId={technique.id} />

        <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
          <Text variant="title" align="center" style={{ marginBottom: spacing.md }}>
            {getPhaseText()}
          </Text>
          {phase === 'deepBreaths' && isActive ? (
            <Text variant="body" color="secondary" style={{ marginBottom: spacing.sm }}>
              Breath {breathCount + 1} of {breathsPerRound}
            </Text>
          ) : null}
          {phase !== 'exhaleHold' && isActive ? (
            <Text variant="stat" color="accent">
              {timeRemaining}
            </Text>
          ) : null}
          {phase === 'exhaleHold' && isActive ? (
            <>
              <Text variant="caption" color="secondary" align="center" style={{ marginBottom: spacing.sm }}>
                Tap when ready to breathe in
              </Text>
              <Text variant="stat" color="secondary">
                {exhaleHoldElapsed}s
              </Text>
            </>
          ) : null}
        </View>

        {phase === 'exhaleHold' && isActive ? (
          <Button label="I'm ready" onPress={handleExhaleHoldReady} style={{ marginBottom: spacing.md }} />
        ) : null}

        {!isComplete && phase !== 'exhaleHold' ? (
          <Button
            label={isActive ? 'Pause' : 'Start'}
            onPress={handleToggle}
            style={{ minWidth: 200 }}
          />
        ) : null}

        {phase === 'exhaleHold' && isActive ? (
          <Button label="Pause" onPress={handleToggle} variant="ghost" style={{ marginTop: spacing.md }} />
        ) : null}
      </View>

      <ModalSheet
        visible={isComplete}
        title="Well done"
        primaryAction={{
          label: 'Done',
          onPress: () => {
            setIsComplete(false);
            onBack();
          },
        }}
        secondaryAction={
          onBreatheAgain
            ? {
                label: 'Breathe again',
                onPress: () => {
                  setIsComplete(false);
                  onBreatheAgain();
                },
              }
            : undefined
        }
      >
        <Text variant="body" color="secondary" align="center" style={{ marginBottom: spacing.lg }}>
          You completed {finalStats.rounds} rounds in {formatTime(finalStats.duration)}
        </Text>
        {streak > 0 ? (
          <Text variant="body" color="accent" align="center">
            {streak} day streak — keep it going!
          </Text>
        ) : null}
      </ModalSheet>
    </Screen>
  );
};
