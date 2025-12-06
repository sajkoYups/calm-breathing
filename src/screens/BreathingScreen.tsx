import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BreathingTechnique } from '../types';
import { saveSession } from '../utils/storage';

interface BreathingScreenProps {
  technique: BreathingTechnique;
  onBack: () => void;
}

const saveSessionOnUnmount = async (
  isActive: boolean,
  cycleCount: number,
  sessionStartTime: number | null,
  technique: BreathingTechnique,
  hasSaved: React.MutableRefObject<boolean>
) => {
  if (isActive && sessionStartTime && cycleCount > 0 && !hasSaved.current) {
    const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
    try {
      const session = {
        id: `session-${Date.now()}`,
        date: new Date().toISOString(),
        techniqueId: technique.id,
        techniqueName: technique.name,
        duration,
        cycles: cycleCount,
      };
      await saveSession(session);
      hasSaved.current = true;
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }
};

type BreathingPhase = 'inhale' | 'holdInhale' | 'exhale' | 'holdExhale';

export const BreathingScreen: React.FC<BreathingScreenProps> = ({ technique, onBack }) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<BreathingPhase>('inhale');
  const [timeRemaining, setTimeRemaining] = useState(technique.inhaleSeconds);
  const [cycleCount, setCycleCount] = useState(0);
  const [bubbleScale, setBubbleScale] = useState(0.5); // 0.5 to 1.0 scale
  const sessionStartTimeRef = useRef<number | null>(null);
  const hasSavedSessionRef = useRef(false);
  const phaseStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  // Timer system that updates phase and timeRemaining
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

    // Get phase duration in seconds
    const getPhaseDuration = (phase: BreathingPhase): number => {
      switch (phase) {
        case 'inhale':
          return technique.inhaleSeconds;
        case 'holdInhale':
          return technique.holdInhale || 0;
        case 'exhale':
          return technique.exhaleSeconds;
        case 'holdExhale':
          return technique.holdExhale || 0;
      }
    };

    // Update phase logic
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
        }
      } else if (currentPhase === 'holdExhale') {
        currentPhase = 'inhale';
        currentTime = technique.inhaleSeconds;
        cycle++;
        setCycleCount(cycle);
      }

      setPhase(currentPhase);
      setTimeRemaining(currentTime);
      phaseStartTimeRef.current = performance.now();
    };

    // Initialize phase start time
    phaseStartTimeRef.current = performance.now();
    setPhase(currentPhase);
    setTimeRemaining(currentTime);

    // Timer interval for phase updates
    const timerInterval = setInterval(() => {
      if (currentTime > 0) {
        currentTime--;
        setTimeRemaining(currentTime);
      } else {
        updatePhase();
      }
    }, 1000);

    return () => {
      clearInterval(timerInterval);
    };
  }, [isActive, technique]);

  // Animation system that smoothly interpolates based on elapsed time
  useEffect(() => {
    if (!isActive) {
      setBubbleScale(0.5);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    // Get phase duration in milliseconds
    const getPhaseDuration = (phase: BreathingPhase): number => {
      switch (phase) {
        case 'inhale':
          return technique.inhaleSeconds * 1000;
        case 'holdInhale':
          return (technique.holdInhale || 0) * 1000;
        case 'exhale':
          return technique.exhaleSeconds * 1000;
        case 'holdExhale':
          return (technique.holdExhale || 0) * 1000;
      }
    };

    // Calculate bubble scale based on phase and progress
    const calculateScale = (phase: BreathingPhase, progress: number): number => {
      switch (phase) {
        case 'inhale':
          // Expand from 0.5 to 1.0 during inhale
          return 0.5 + 0.5 * progress;
        case 'holdInhale':
          // Stay at full size (1.0)
          return 1.0;
        case 'exhale':
          // Shrink from 1.0 to 0.5 during exhale
          return 1.0 - 0.5 * progress;
        case 'holdExhale':
          // Stay at small size (0.5)
          return 0.5;
      }
    };

    // Animation frame for smooth bubble scaling
    const animate = (timestamp: number) => {
      const phaseDuration = getPhaseDuration(phase);
      
      if (phaseDuration === 0) {
        // If phase has no duration, set scale immediately
        const scale = calculateScale(phase, 1);
        setBubbleScale(scale);
      } else {
        // Calculate elapsed time since phase started
        const elapsed = timestamp - phaseStartTimeRef.current;
        // Calculate progress: elapsed / total duration
        const progress = Math.max(0, Math.min(1, elapsed / phaseDuration));
        const scale = calculateScale(phase, progress);
        setBubbleScale(scale);
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    // Start animation with current timestamp
    const startTimestamp = performance.now();
    phaseStartTimeRef.current = startTimestamp;
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isActive, phase, technique]);

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

  // Save session when user stops or navigates away
  const saveSessionData = async (cycles: number, duration: number) => {
    if (hasSavedSessionRef.current || cycles === 0) {
      return; // Don't save if already saved or no cycles completed
    }

    try {
      const session = {
        id: `session-${Date.now()}`,
        date: new Date().toISOString(),
        techniqueId: technique.id,
        techniqueName: technique.name,
        duration,
        cycles,
      };
      await saveSession(session);
      hasSavedSessionRef.current = true;
    } catch (error) {
      console.error('Error saving session:', error);
    }
  };

  const handleToggle = () => {
    const wasActive = isActive;
    setIsActive(!isActive);
    
    if (!wasActive && !isActive) {
      // Starting session
      sessionStartTimeRef.current = Date.now();
      hasSavedSessionRef.current = false;
      setPhase('inhale');
      setTimeRemaining(technique.inhaleSeconds);
      setCycleCount(0);
    } else if (wasActive && !isActive) {
      // Stopping session - save if cycles completed
      if (sessionStartTimeRef.current) {
        const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        saveSessionData(cycleCount, duration);
      }
    }
  };

  // Save session when navigating away
  useEffect(() => {
    return () => {
      // Component unmounting - save session if active
      saveSessionOnUnmount(
        isActive,
        cycleCount,
        sessionStartTimeRef.current,
        technique,
        hasSavedSessionRef
      );
    };
  }, [isActive, cycleCount, technique]);

  const handleBack = async () => {
    // Save session before navigating away if there's an active session
    if (isActive && sessionStartTimeRef.current && cycleCount > 0 && !hasSavedSessionRef.current) {
      const duration = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
      await saveSessionData(cycleCount, duration);
    }
    onBack();
  };

  // Animated bubble size based on scale (0.5 to 1.0)
  const baseSize = 200;
  const bubbleSize = Math.max(50, baseSize * bubbleScale); // Minimum 50px to ensure visibility

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>
      
      <Text style={styles.techniqueName}>{technique.name}</Text>

      <View style={styles.content}>
        <View style={[styles.bubble, { width: bubbleSize, height: bubbleSize }]} />

        <View style={styles.infoContainer}>
          <Text style={styles.phaseText}>{getPhaseText()}</Text>
          {isActive && <Text style={styles.timerText}>{timeRemaining}</Text>}
          <Text style={styles.cycleText}>Cycles: {cycleCount}</Text>
        </View>

        <TouchableOpacity
          onPress={handleToggle}
          style={styles.controlButton}
        >
          <Text style={styles.controlButtonText}>
            {isActive ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
      </View>
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
});

