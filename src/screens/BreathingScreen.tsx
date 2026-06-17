import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { SessionConfig } from '../types';
import { saveSession } from '../utils/storage';
import {
  triggerPhaseChange,
  triggerCountdown,
  playInhale,
  playExhale,
  stopBreathSound,
  playPhaseBell,
  loadSounds,
  unloadSounds,
} from '../utils/feedback';

interface BreathingScreenProps {
  config: SessionConfig;
  onBack: () => void;
}

type BreathingPhase = 'inhale' | 'holdInhale' | 'exhale' | 'holdExhale';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({ config, onBack }) => {
  const { technique, limit, vibrationEnabled, soundEnabled } = config;
  const isMinutesMode = technique.sessionLimitMode === 'minutes';

  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(technique.inhaleSeconds);
  const [cycleCount, setCycleCount] = useState(0);
  const [bubbleScale, setBubbleScale] = useState(0.5);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [finalStats, setFinalStats] = useState({ duration: 0, cycles: 0 });

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
      setIsComplete(true);
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

    const calculateScale = (p: BreathingPhase, progress: number): number => {
      switch (p) {
        case 'inhale':
          return 0.5 + 0.5 * progress;
        case 'holdInhale':
          return 1.0;
        case 'exhale':
          return 1.0 - 0.5 * progress;
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

  const handleBack = async () => {
    if (isActive && sessionStartTimeRef.current && cycleCount > 0 && !hasSavedSessionRef.current) {
      const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      await saveSessionData(cycleCount, duration);
    }
    await stopBreathSound();
    onBack();
  };

  const handleCompleteDismiss = () => {
    setIsComplete(false);
    onBack();
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'holdInhale':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
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

  const baseSize = 200;
  const bubbleSize = Math.max(50, baseSize * bubbleScale);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.techniqueName}>
        {technique.emoji} {technique.name}
      </Text>

      <View style={styles.content}>
        <View style={[styles.bubble, { width: bubbleSize, height: bubbleSize }]} />

        <View style={styles.infoContainer}>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
          {isActive && <Text style={styles.timerText}>{timeRemaining}</Text>}
          <Text style={styles.cycleText}>Cycles: {cycleCount}</Text>
          {isMinutesMode && isActive && (
            <Text style={styles.elapsedText}>
              {formatTime(elapsedSeconds)} / {limit} min
            </Text>
          )}
          {!isMinutesMode && isActive && (
            <Text style={styles.elapsedText}>
              Round {Math.min(cycleCount + 1, limit)} of {limit}
            </Text>
          )}
        </View>

        {!isComplete && (
          <TouchableOpacity onPress={handleToggle} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>{isActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={isComplete} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.completeCard}>
            <Text style={styles.completeTitle}>Session Complete</Text>
            <Text style={styles.completeStat}>Duration: {formatTime(finalStats.duration)}</Text>
            <Text style={styles.completeStat}>Cycles: {finalStats.cycles}</Text>
            <TouchableOpacity onPress={handleCompleteDismiss} style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  techniqueName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#283593',
    textAlign: 'center',
    marginBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bubble: {
    backgroundColor: '#88D8C0',
    borderRadius: 100,
    opacity: 0.8,
    marginBottom: 40,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  phaseText: {
    fontSize: 32,
    fontWeight: '600',
    color: '#3949AB',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 8,
  },
  cycleText: {
    fontSize: 18,
    color: '#5C6BC0',
    marginTop: 8,
    fontWeight: '600',
  },
  elapsedText: {
    fontSize: 16,
    color: '#7986CB',
    marginTop: 4,
    fontWeight: '500',
  },
  controlButton: {
    backgroundColor: '#5C6BC0',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    width: '100%',
    maxWidth: 200,
  },
  controlButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  completeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 320,
  },
  completeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 16,
  },
  completeStat: {
    fontSize: 18,
    color: '#546E7A',
    marginBottom: 8,
  },
  completeButton: {
    backgroundColor: '#5C6BC0',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginTop: 16,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
