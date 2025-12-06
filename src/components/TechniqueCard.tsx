import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { BreathingTechnique } from '../types';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onPress: () => void;
}

export const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, onPress }) => {
  const pattern = technique.holdInhale || technique.holdExhale
    ? `${technique.inhaleSeconds}-${technique.holdInhale || 0}-${technique.exhaleSeconds}-${technique.holdExhale || 0}`
    : `${technique.inhaleSeconds}-${technique.exhaleSeconds}`;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card}>
      <Text style={styles.name}>{technique.name}</Text>
      <Text style={styles.pattern}>{pattern} seconds</Text>
      {technique.description && (
        <Text style={styles.description}>{technique.description}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#E1BEE7',
    padding: 20,
    borderRadius: 16,
    marginVertical: 8,
    marginHorizontal: 16,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: '#7B1FA2',
    marginBottom: 8,
  },
  pattern: {
    fontSize: 16,
    color: '#9C27B0',
    marginBottom: 8,
    fontWeight: '500',
  },
  description: {
    fontSize: 14,
    color: '#BA68C8',
    lineHeight: 20,
  },
});

