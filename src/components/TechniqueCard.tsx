import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Dimensions } from 'react-native';
import { BreathingTechnique } from '../types';

interface TechniqueCardProps {
  technique: BreathingTechnique;
  onPress: () => void;
}

const { width } = Dimensions.get('window');
const horizontalPadding = 16; // Padding on each side
const gap = 12; // Gap between cards
const cardWidth = (width - horizontalPadding * 2 - gap) / 2; // 2 columns with padding and gap

// Color gradients for each technique (Spotify-style)
const getCardColors = (id: string, isCustom?: boolean) => {
  if (isCustom) {
    return ['#FFA726', '#FFB74D', '#FFCC80']; // Orange gradient for custom techniques
  }
  const colors: { [key: string]: string[] } = {
    'wim-hof': ['#FF6B6B', '#FF8E8E', '#FFB3B3'],
    'box-breathing': ['#4ECDC4', '#6EDDD6', '#8EEDE8'],
    '4-7-8': ['#95E1D3', '#AAE8DB', '#BFEFE3'],
    'deep-breathing': ['#F38181', '#F8A1A1', '#FDC1C1'],
    'pranayama': ['#AA96DA', '#BBA6E0', '#CCB6E6'],
    'coherent-breathing': ['#FCBAD3', '#FDC9DB', '#FED8E3'],
    'triangle-breathing': ['#A8D8EA', '#B8E0ED', '#C8E8F0'],
    'square-breathing': ['#FFD3A5', '#FFDDB5', '#FFE7C5'],
    '2-1-breathing': ['#C7CEEA', '#D1D6ED', '#DBDEF0'],
    'alternate-nostril': ['#B4E7CE', '#C0ECD6', '#CCF1DE'],
    'belly-breathing': ['#FFB6C1', '#FFC4CD', '#FFD2D9'],
  };
  return colors[id] || ['#E1BEE7', '#E8C5ED', '#EFCCF3'];
};

export const TechniqueCard: React.FC<TechniqueCardProps> = ({ technique, onPress }) => {
  const colors = getCardColors(technique.id, technique.isCustom);
  const pattern = technique.holdInhale || technique.holdExhale
    ? `${technique.inhaleSeconds}-${technique.holdInhale || 0}-${technique.exhaleSeconds}-${technique.holdExhale || 0}`
    : `${technique.inhaleSeconds}-${technique.exhaleSeconds}`;

  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.8}>
      <View style={[styles.cardContent, { backgroundColor: colors[0] }]}>
        {technique.isCustom && (
          <View style={styles.customBadge}>
            <Text style={styles.customBadgeText}>Custom</Text>
          </View>
        )}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={2}>
            {technique.name}
          </Text>
          <Text style={styles.pattern}>{pattern}s</Text>
          {technique.description && (
            <Text style={styles.description} numberOfLines={2}>
              {technique.description}
            </Text>
          )}
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
  textContainer: {
    marginTop: 'auto',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  pattern: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    lineHeight: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  customBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  customBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
