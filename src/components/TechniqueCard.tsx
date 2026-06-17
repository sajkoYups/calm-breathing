import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { BreathingTechnique } from '../types';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const horizontalPadding = 16;
const gap = 12;
const cardWidth = (width - horizontalPadding * 2 - gap) / 2;

const getCardColors = (id: string): string[] => {
  const colors: Record<string, string[]> = {
    'calm-box': ['#4ECDC4', '#6EDDD6', '#8EEDE8'],
    'deep-relaxation': ['#95E1D3', '#AAE8DB', '#BFEFE3'],
    'balanced-breath': ['#FCBAD3', '#FDC9DB', '#FED8E3'],
    'sleep-wind-down': ['#A8D8EA', '#B8E0ED', '#C8E8F0'],
    'focus-boost': ['#FFD3A5', '#FFDDB5', '#FFE7C5'],
    'power-breathing': ['#FF6B6B', '#FF8E8E', '#FFB3B3'],
    'gentle-calm': ['#B4E7CE', '#C0ECD6', '#CCF1DE'],
    'morning-reset': ['#FFE082', '#FFE699', '#FFECB3'],
  };
  return colors[id] || ['#E1BEE7', '#E8C5ED', '#EFCCF3'];
};

const getPatternLabel = (technique: BreathingTechnique): string => {
  if (technique.kind === 'power') return 'Multi-phase';
  if (technique.holdInhale || technique.holdExhale) {
    return `${technique.inhaleSeconds}-${technique.holdInhale || 0}-${technique.exhaleSeconds}-${technique.holdExhale || 0}s`;
  }
  return `${technique.inhaleSeconds}-${technique.exhaleSeconds}s`;
};

export const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, onPress }) => {
  const colors = getCardColors(technique.id);

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={[styles.cardContent, { backgroundColor: colors[0] }]}>
        <Text style={styles.emoji}>{technique.emoji}</Text>
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {technique.name}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {technique.subtitle}
          </Text>
          <Text style={styles.pattern}>{getPatternLabel(technique)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    height: cardWidth * 1.2,
    marginBottom: 16,
    marginRight: gap / 2,
    marginLeft: gap / 2,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'flex-end',
    borderRadius: 12,
  },
  emoji: {
    fontSize: 32,
    position: 'absolute',
    top: 12,
    left: 12,
  },
  textContainer: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: 6,
    fontWeight: '500',
  },
  pattern: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
