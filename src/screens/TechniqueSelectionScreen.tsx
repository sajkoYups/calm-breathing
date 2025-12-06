import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { BreathingTechnique } from '../types';
import { TechniqueCard } from '../components/TechniqueCard';
import { defaultTechniques } from '../data/breathingTechniques';

interface TechniqueSelectionScreenProps {
  onSelectTechnique?: (technique: BreathingTechnique) => void;
  onBack?: () => void;
}

export const TechniqueSelectionScreen: React.FC<TechniqueSelectionScreenProps> = ({
  onSelectTechnique,
  onBack,
}) => {
  const handleSelectTechnique = (technique: BreathingTechnique) => {
    if (onSelectTechnique) {
      onSelectTechnique(technique);
    }
  };

  const renderItem = ({ item }: { item: BreathingTechnique }) => (
    <TechniqueCard technique={item} onPress={() => handleSelectTechnique(item)} />
  );

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>Choose a Technique</Text>
      <FlatList
        data={defaultTechniques}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3E5F5',
  },
  backButton: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#9C27B0',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7B1FA2',
    marginBottom: 16,
    textAlign: 'center',
  },
  list: {
    paddingBottom: 20,
  },
});
