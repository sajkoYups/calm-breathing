import AsyncStorage from '@react-native-async-storage/async-storage';
import { BreathingTechnique } from '../types';

const CUSTOM_TECHNIQUES_KEY = '@calm_breathing:custom_techniques';

export const saveCustomTechnique = async (technique: BreathingTechnique): Promise<void> => {
  try {
    const existing = await getCustomTechniques();
    const updated = [...existing, technique];
    await AsyncStorage.setItem(CUSTOM_TECHNIQUES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving custom technique:', error);
    throw error;
  }
};

export const getCustomTechniques = async (): Promise<BreathingTechnique[]> => {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_TECHNIQUES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting custom techniques:', error);
    return [];
  }
};

export const deleteCustomTechnique = async (id: string): Promise<void> => {
  try {
    const existing = await getCustomTechniques();
    const updated = existing.filter((t) => t.id !== id);
    await AsyncStorage.setItem(CUSTOM_TECHNIQUES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error deleting custom technique:', error);
    throw error;
  }
};

