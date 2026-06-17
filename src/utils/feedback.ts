import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let inhaleSound: Audio.Sound | null = null;
let exhaleSound: Audio.Sound | null = null;
let bellSound: Audio.Sound | null = null;
let soundsLoaded = false;
let currentBreathSound: Audio.Sound | null = null;

export const loadSounds = async (): Promise<void> => {
  if (soundsLoaded) return;

  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });

    const [{ sound: inhale }, { sound: exhale }, { sound: bell }] = await Promise.all([
      Audio.Sound.createAsync(require('../../assets/sounds/inhale.wav'), { volume: 0.4 }),
      Audio.Sound.createAsync(require('../../assets/sounds/exhale.wav'), { volume: 0.4 }),
      Audio.Sound.createAsync(require('../../assets/sounds/bell.wav'), { volume: 0.5 }),
    ]);

    inhaleSound = inhale;
    exhaleSound = exhale;
    bellSound = bell;
    soundsLoaded = true;
  } catch (error) {
    console.error('Error loading sounds:', error);
  }
};

export const unloadSounds = async (): Promise<void> => {
  await stopBreathSound();
  await Promise.all([
    inhaleSound?.unloadAsync(),
    exhaleSound?.unloadAsync(),
    bellSound?.unloadAsync(),
  ]);
  inhaleSound = null;
  exhaleSound = null;
  bellSound = null;
  soundsLoaded = false;
};

export const triggerPhaseChange = async (enabled: boolean): Promise<void> => {
  if (!enabled || Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // Haptics unavailable on this device
  }
};

export const triggerCountdown = async (secondsLeft: number, enabled: boolean): Promise<void> => {
  if (!enabled || secondsLeft > 3 || secondsLeft < 1 || Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // Haptics unavailable on this device
  }
};

const playLoopingSound = async (sound: Audio.Sound | null): Promise<void> => {
  if (!sound) return;
  await stopBreathSound();
  currentBreathSound = sound;
  await sound.setPositionAsync(0);
  await sound.setIsLoopingAsync(true);
  await sound.playAsync();
};

export const playInhale = async (enabled: boolean): Promise<void> => {
  if (!enabled) return;
  await loadSounds();
  await playLoopingSound(inhaleSound);
};

export const playExhale = async (enabled: boolean): Promise<void> => {
  if (!enabled) return;
  await loadSounds();
  await playLoopingSound(exhaleSound);
};

export const stopBreathSound = async (): Promise<void> => {
  if (currentBreathSound) {
    try {
      await currentBreathSound.stopAsync();
      await currentBreathSound.setIsLoopingAsync(false);
    } catch {
      // Sound may already be stopped
    }
    currentBreathSound = null;
  }
};

export const playPhaseBell = async (enabled: boolean): Promise<void> => {
  if (!enabled || !bellSound) {
    if (enabled) await loadSounds();
    if (!enabled || !bellSound) return;
  }
  try {
    await bellSound.setPositionAsync(0);
    await bellSound.playAsync();
  } catch {
    // Bell playback failed
  }
};
