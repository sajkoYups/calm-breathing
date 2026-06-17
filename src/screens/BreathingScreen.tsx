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
import { spacing } from '../theme/spacing';

interface BreathingScreenProps {
  config: SessionConfig;
  onBack: () => void;
  onBreatheAgain?: () => void;
}

type BreathingPhase = 'inhale' | 'holdInhale' | 'exhale' | 'holdExhale';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({
  config,
  onBack,
  onBreatheAgain,
}) => {
  const { technique, limit, vibrationEnabled, soundEnabled } = config;
  const { isDark } = useTheme();
  const accent = getTechniqueAccent(technique.id);
  const isSleepTechnique = technique.id === 'sleep-wind-down';
  const isMinutesMode = technique.sessionLimitMode === 'minutes';

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(technique.inhaleSeconds);
  const [cycleCount, setCycleCount] = useState(0);
  const [bubbleScale, setBubbleScale] = useState(0.5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalStats, setFinalStats] = useState({ duration: 0, cycles: 0 });
  const [streak, setStreak] = useState(0);

  const sessionStartTimeRef = useRef<number | null>(null);
  const hasSavedSessionRef = useRef(false);
  const phaseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const prevPhaseRef = useRef<BreathingPhase>('inhale');
  const prevTimeRemainingRef = useRef(technique.inhaleSeconds);

  useEffect(() => {
    loadSounds();
    return () => {
      unloadSounds();
    };
  }, []);

  const getPhaseDuration = useCallback(
    (p: BreathingPhase): number => {
      switch (p) {
        case 'inhale':
          return technique.inhaleSeconds;
        case 'holdInhale':
          return technique.holdInhale || 0;
        case 'exhale':
          return technique.exhaleSeconds;
        case 'holdExhale':
          return technique.holdExhale || 0;
      }
    },
    [technique]
  );

  const handleSessionComplete = useCallback(
    async (cycles: number) => {
      if (hasSavedSessionRef.current) return;
      const duration = sessionStartTimeRef.current
        ? Math.floor((Date.now() - sessionStartTimeRef.current) / 1000)
        : 0;
      hasSavedSessionRef.current = true;
      setIsActive(false);
      await stopBreathSound();
      setFinalStats({ duration, cycles });
      const progress = await getUserProgress();
      setStreak(progress.currentStreak);
      setIsComplete(true);
      triggerSessionComplete();
      if (cycles > 0) {
        await saveSession({
          id: `session-${Date.now()}`,
          date: new Date().toISOString(),
          techniqueId: technique.id,
          techniqueName: technique.name,
          duration,
          cycles,
        });
      }
    },
    [technique]
  );

  useEffect(() => {
    if (!isActive) {
      setPhase('inhale');
      setTimeRemaining(technique.inhaleSeconds);
      setBubbleScale(0.5);
      return;
    }

    let currentPhase: BreathingPhase = 'inhale';
    let currentTime = technique.inhaleSeconds;
    let cycle = 0;
    let elapsed = 0;

    const updatePhase = () => {
      if (currentPhase === 'inhale') {
        if (technique.holdInhale && technique.holdInhale > 0) {
          currentPhase = 'holdInhale';
          currentTime = technique.holdInhale;
        } else {
          currentPhase = 'exhale';
          currentTime = technique.exhaleSeconds;
        }
      } else if (currentPhase === 'holdInhale') {
        currentPhase = 'exhale';
        currentTime = technique.exhaleSeconds;
      } else if (currentPhase === 'exhale') {
        if (technique.holdExhale && technique.holdExhale > 0) {
          currentPhase = 'holdExhale';
          currentTime = technique.holdExhale;
        } else {
          currentPhase = 'inhale';
          currentTime = technique.inhaleSeconds;
          cycle++;
          setCycleCount(cycle);
          if (!isMinutesMode && cycle >= limit) {
            handleSessionComplete(cycle);
            return;
          }
        }
      } else if (currentPhase === 'holdExhale') {
        currentPhase = 'inhale';
        currentTime = technique.inhaleSeconds;
        cycle++;
        setCycleCount(cycle);
        if (!isMinutesMode && cycle >= limit) {
          handleSessionComplete(cycle);
          return;
        }
      }

      setPhase(currentPhase);
      setTimeRemaining(currentTime);
      phaseStartTimeRef.current = performance.now();
    };

    phaseStartTimeRef.current = performance.now();
    setPhase(currentPhase);
    setTimeRemaining(currentTime);

    const timerInterval = setInterval(() => {
      elapsed++;
      setElapsedSeconds(elapsed);

      if (isMinutesMode && elapsed >= limit * 60) {
        handleSessionComplete(cycle);
        return;
      }

      if (currentTime > 0) {
        currentTime--;
        setTimeRemaining(currentTime);
      } else {
        updatePhase();
      }
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [isActive, technique, limit, isMinutesMode, handleSessionComplete]);

  useEffect(() => {
    if (!isActive) return;

    if (phase !== prevPhaseRef.current) {
      triggerPhaseChange(vibrationEnabled);
      playPhaseBell(soundEnabled);
      if (phase === 'inhale') {
        playInhale(soundEnabled);
      } else if (phase === 'exhale') {
        playExhale(soundEnabled);
      } else {
        stopBreathSound();
      }
      prevPhaseRef.current = phase;
    }

    if (timeRemaining !== prevTimeRemainingRef.current) {
      triggerCountdown(timeRemaining, vibrationEnabled);
      prevTimeRemainingRef.current = timeRemaining;
    }
  }, [phase, timeRemaining, isActive, vibrationEnabled, soundEnabled]);

  useEffect(() => {
    if (!isActive) {
      setBubbleScale(0.5);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

    const calculateScale = (p: BreathingPhase, progress: number): number => {
      const eased = easeInOut(progress);
      switch (p) {
        case 'inhale':
          return 0.5 + 0.5 * eased;
        case 'holdInhale':
          return 1.0;
        case 'exhale':
          return 1.0 - 0.5 * eased;
        case 'holdExhale':
          return 0.5;
      }
    };

    const animate = (timestamp: number) => {
      const phaseDuration = getPhaseDuration(phase) * 1000;
      if (phaseDuration === 0) {
        setBubbleScale(calculateScale(phase, 1));
      } else {
        const elapsed = timestamp - phaseStartTimeRef.current;
        const progress = Math.max(0, Math.min(1, elapsed / phaseDuration));
        setBubbleScale(calculateScale(phase, progress));
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    phaseStartTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, phase, getPhaseDuration]);

  const saveSessionData = async (cycles: number, duration: number) => {
    if (hasSavedSessionRef.current || cycles === 0) return;
    hasSavedSessionRef.current = true;
    await saveSession({
      id: `session-${Date.now()}`,
      date: new Date().toISOString(),
      techniqueId: technique.id,
      techniqueName: technique.name,
      duration,
      cycles,
    });
  };

  const handleToggle = () => {
    const wasActive = isActive;
    if (!wasActive) {
      sessionStartTimeRef.current = Date.now();
      hasSavedSessionRef.current = false;
      setPhase('inhale');
      setTimeRemaining(technique.inhaleSeconds);
      setCycleCount(0);
      setElapsedSeconds(0);
      prevPhaseRef.current = 'inhale';
      setIsActive(true);
      triggerPhaseChange(vibrationEnabled);
      playInhale(soundEnabled);
    } else {
      setIsActive(false);
      stopBreathSound();
      if (sessionStartTimeRef.current) {
        const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        saveSessionData(cycleCount, duration);
      }
    }
  };

  const exitSession = async () => {
    if (isActive && sessionStartTimeRef.current && cycleCount > 0 && !hasSavedSessionRef.current) {
      const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      await saveSessionData(cycleCount, duration);
    }
    await stopBreathSound();
    onBack();
  };

  const handleBack = () => {
    if (isActive) {
      Alert.alert('Leave session?', 'Your progress will be saved.', [
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
  }, [isActive, cycleCount]);

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe in';
      case 'holdInhale':
        return 'Hold';
      case 'exhale':
        return 'Breathe out';
      case 'holdExhale':
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
  const dimSession = isDark || isSleepTechnique;

  return (
    <Screen padded={false} ambientTint={accent.ambient}>
      <Header onBack={handleBack} title={technique.name} />

      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: spacing.xxl }}>
        <BreathingOrb size={bubbleSize} techniqueId={technique.id} />

        <View style={{ alignItems: 'center', marginBottom: spacing.xxxl }}>
          <Text variant="display" align="center" style={{ marginBottom: spacing.md, opacity: dimSession ? 0.85 : 1 }}>
            {getPhaseText()}
          </Text>
          {isActive ? (
            <Text variant="stat" color="accent" style={{ marginBottom: spacing.sm }}>
              {timeRemaining}
            </Text>
          ) : null}
          {isMinutesMode && isActive ? (
            <Text variant="caption" color="secondary">
              {formatTime(elapsedSeconds)} / {limit} min
            </Text>
          ) : null}
          {!isMinutesMode && isActive ? (
            <Text variant="caption" color="secondary">
              Round {Math.min(cycleCount + 1, limit)} of {limit}
            </Text>
          ) : null}
        </View>

        {!isComplete ? (
          <Button
            label={isActive ? 'Pause' : 'Start'}
            onPress={handleToggle}
            style={{ minWidth: 200 }}
            accessibilityLabel={isActive ? 'Pause session' : 'Start session'}
          />
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
          You breathed for {formatTime(finalStats.duration)}
        </Text>
        <Text variant="stat" color="accent" align="center">
          {finalStats.cycles}
        </Text>
        <Text variant="caption" color="secondary" align="center" style={{ marginBottom: spacing.lg }}>
          cycles completed
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
