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

interface PowerBreathingScreenProps {
  config: SessionConfig;
  onBack: () => void;
}

type PowerPhase = 'deepBreaths' | 'exhaleHold' | 'recoveryInhale' | 'recoveryHold';

const BREATH_CYCLE_SECONDS = 2;
const RECOVERY_INHALE_SECONDS = 4;
const EXHALE_HOLD_MAX_SECONDS = 90;

export const PowerBreathingScreen: React.FC<PowerBreathingScreenProps> = ({ config, onBack }) => {
  const { technique, limit: totalRounds, vibrationEnabled, soundEnabled } = config;
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
      setIsComplete(true);
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

    const animate = (timestamp: number) => {
      if (phase === 'deepBreaths') {
        const halfDuration = (BREATH_CYCLE_SECONDS / 2) * 1000;
        const elapsed = timestamp - phaseStartTimeRef.current;
        const progress = Math.max(0, Math.min(1, elapsed / halfDuration));
        if (breathSubPhase === 'inhale') {
          setBubbleScale(0.5 + 0.5 * progress);
        } else {
          setBubbleScale(1.0 - 0.5 * progress);
        }
      } else if (phase === 'recoveryInhale') {
        const duration = RECOVERY_INHALE_SECONDS * 1000;
        const elapsed = timestamp - phaseStartTimeRef.current;
        const progress = Math.max(0, Math.min(1, elapsed / duration));
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

  const handleBack = async () => {
    await stopBreathSound();
    onBack();
  };

  const getPhaseText = (): string => {
    switch (phase) {
      case 'deepBreaths':
        return breathSubPhase === 'inhale' ? 'Deep Breath In' : 'Deep Breath Out';
      case 'exhaleHold':
        return 'Exhale Fully & Hold';
      case 'recoveryInhale':
        return 'Deep Inhale';
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
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <View style={styles.safetyBanner}>
        <Text style={styles.safetyBannerText}>Stay seated. Stop if dizzy.</Text>
      </View>

      <Text style={styles.techniqueName}>
        {technique.emoji} {technique.name}
      </Text>
      <Text style={styles.roundText}>
        Round {currentRound} of {totalRounds}
      </Text>

      <View style={styles.content}>
        <View style={[styles.bubble, { width: bubbleSize, height: bubbleSize }]} />

        <View style={styles.infoContainer}>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
          {phase === 'deepBreaths' && isActive && (
            <Text style={styles.breathCountText}>
              Breath {breathCount + 1} of {breathsPerRound}
            </Text>
          )}
          {phase !== 'exhaleHold' && isActive && (
            <Text style={styles.timerText}>{timeRemaining}</Text>
          )}
          {phase === 'exhaleHold' && isActive && (
            <>
              <Text style={styles.holdHint}>Tap when ready to breathe in</Text>
              <Text style={styles.holdTimer}>{exhaleHoldElapsed}s</Text>
            </>
          )}
        </View>

        {phase === 'exhaleHold' && isActive && (
          <TouchableOpacity onPress={handleExhaleHoldReady} style={styles.readyButton}>
            <Text style={styles.readyButtonText}>I'm Ready</Text>
          </TouchableOpacity>
        )}

        {!isComplete && phase !== 'exhaleHold' && (
          <TouchableOpacity onPress={handleToggle} style={styles.controlButton}>
            <Text style={styles.controlButtonText}>{isActive ? 'Pause' : 'Start'}</Text>
          </TouchableOpacity>
        )}

        {phase === 'exhaleHold' && isActive && (
          <TouchableOpacity onPress={handleToggle} style={styles.pauseButton}>
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal visible={isComplete} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.completeCard}>
            <Text style={styles.completeTitle}>Session Complete</Text>
            <Text style={styles.completeStat}>Duration: {formatTime(finalStats.duration)}</Text>
            <Text style={styles.completeStat}>Rounds: {finalStats.rounds}</Text>
            <TouchableOpacity
              onPress={() => {
                setIsComplete(false);
                onBack();
              }}
              style={styles.completeButton}
            >
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
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: '600',
  },
  safetyBanner: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  safetyBannerText: {
    fontSize: 14,
    color: '#E65100',
    fontWeight: '600',
    textAlign: 'center',
  },
  techniqueName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#283593',
    textAlign: 'center',
  },
  roundText: {
    fontSize: 16,
    color: '#5C6BC0',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  bubble: {
    backgroundColor: '#FF8A65',
    borderRadius: 100,
    opacity: 0.85,
    marginBottom: 32,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  phaseText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#3949AB',
    marginBottom: 12,
    textAlign: 'center',
  },
  breathCountText: {
    fontSize: 20,
    color: '#5C6BC0',
    fontWeight: '600',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: '700',
    color: '#283593',
  },
  holdHint: {
    fontSize: 16,
    color: '#7986CB',
    marginBottom: 8,
    textAlign: 'center',
  },
  holdTimer: {
    fontSize: 32,
    fontWeight: '600',
    color: '#546E7A',
  },
  readyButton: {
    backgroundColor: '#FF7043',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 16,
  },
  readyButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
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
  pauseButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  pauseButtonText: {
    color: '#7986CB',
    fontSize: 16,
    fontWeight: '600',
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
