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
  const scaleRef = useRef(0.5);
  const sessionStartTimeRef = useRef<number | null>(null);
  const hasSavedSessionRef = useRef(false);

  // Animation effect for smooth bubble scaling
  useEffect(() => {
    if (!isActive) {
      setBubbleScale(0.5);
      scaleRef.current = 0.5;
      return;
    }

    // Initialize bubble at starting size
    setBubbleScale(0.5);
    scaleRef.current = 0.5;

    let animationFrame: number;
    let currentPhase: BreathingPhase = 'inhale';
    let phaseStartTime: number = performance.now();
    let cycleStartTime: number = performance.now();

    const inhaleDuration = technique.inhaleSeconds * 1000;
    const exhaleDuration = technique.exhaleSeconds * 1000;
    const holdInhaleDuration = (technique.holdInhale || 0) * 1000;
    const holdExhaleDuration = (technique.holdExhale || 0) * 1000;
    const totalCycleDuration = inhaleDuration + exhaleDuration + holdInhaleDuration + holdExhaleDuration;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - phaseStartTime;
      let newScale = 0.5;
      let newPhase = currentPhase;
      let newPhaseStartTime = phaseStartTime;

      if (currentPhase === 'inhale') {
        const progress = Math.min(elapsed / inhaleDuration, 1);
        newScale = 0.5 + 0.5 * progress; // 0.5 to 1.0
        if (progress >= 1) {
          newPhase = technique.holdInhale && technique.holdInhale > 0 ? 'holdInhale' : 'exhale';
          newPhaseStartTime = timestamp;
        }
      } else if (currentPhase === 'holdInhale') {
        newScale = 1.0; // Stay at full size
        if (elapsed >= holdInhaleDuration) {
          newPhase = 'exhale';
          newPhaseStartTime = timestamp;
        }
      } else if (currentPhase === 'exhale') {
        const progress = Math.min(elapsed / exhaleDuration, 1);
        newScale = 1.0 - 0.5 * progress; // 1.0 to 0.5
        if (progress >= 1) {
          newPhase = technique.holdExhale && technique.holdExhale > 0 ? 'holdExhale' : 'inhale';
          newPhaseStartTime = timestamp;
          if (newPhase === 'inhale') {
            cycleStartTime = timestamp;
          }
        }
      } else if (currentPhase === 'holdExhale') {
        newScale = 0.5; // Stay at small size
        if (elapsed >= holdExhaleDuration) {
          newPhase = 'inhale';
          newPhaseStartTime = timestamp;
          cycleStartTime = timestamp;
        }
      }

      setBubbleScale(newScale);
      scaleRef.current = newScale;
      currentPhase = newPhase;
      phaseStartTime = newPhaseStartTime;

      animationFrame = requestAnimationFrame(animate);
    };

    // Start animation on next frame
    animationFrame = requestAnimationFrame((timestamp) => {
      phaseStartTime = timestamp;
      cycleStartTime = timestamp;
      animate(timestamp);
    });

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isActive, technique]);

  useEffect(() => {
    if (!isActive) return;

    let interval: NodeJS.Timeout;
    let currentPhase: BreathingPhase = 'inhale';
    let currentTime = technique.inhaleSeconds;
    let cycle = 0;

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
    };

    interval = setInterval(() => {
      if (currentTime > 0) {
        currentTime--;
        setTimeRemaining(currentTime);
      } else {
        updatePhase();
      }
    }, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, technique]);

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

