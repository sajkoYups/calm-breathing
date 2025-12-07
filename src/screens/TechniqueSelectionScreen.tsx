import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { BreathingTechnique } from '../types';
import { TechniqueCard } from '../components/TechniqueCard';
import { defaultTechniques } from '../data/breathingTechniques';
import { getCustomTechniques } from '../utils/storage';

interface TechniqueSelectionScreenProps {
  onSelectTechnique?: (technique: BreathingTechnique) => void;
  onViewDetail?: (technique: BreathingTechnique) => void;
  onAddCustom?: () => void;
  onTrackProgress?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
}

export const TechniqueSelectionScreen: React.FC<TechniqueSelectionScreenProps> = ({
  onSelectTechnique,
  onViewDetail,
  onAddCustom,
  onTrackProgress,
  onSettings,
  onBack,
}) => {
  const [customTechniques, setCustomTechniques] = useState<BreathingTechnique[]>([]);

  useEffect(() => {
    loadCustomTechniques();
  }, []);

  const loadCustomTechniques = async () => {
    const custom = await getCustomTechniques();
    setCustomTechniques(custom);
  };

  const handleCardPress = (technique: BreathingTechnique) => {
    if (onViewDetail) {
      onViewDetail(technique);
    } else if (onSelectTechnique) {
      onSelectTechnique(technique);
    }
  };

  const allTechniques = [...defaultTechniques, ...customTechniques];

  const renderItem = ({ item }: { item: BreathingTechnique }) => (
    <TechniqueCard technique={item} onPress={() => handleCardPress(item)} />
  );

  return (
    <View style={styles.container}>
      {onBack && (
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      )}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Choose a Technique</Text>
          {onSettings && (
            <TouchableOpacity onPress={onSettings} style={styles.settingsButton}>
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.buttonRow}>
          {onAddCustom && (
            <TouchableOpacity onPress={onAddCustom} style={styles.addButton}>
              <Text style={styles.addButtonText}>+ Custom</Text>
            </TouchableOpacity>
          )}
          {onTrackProgress && (
            <TouchableOpacity onPress={onTrackProgress} style={styles.progressButton}>
              <Text style={styles.progressButtonText}>Track Progress</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <FlatList
        data={allTechniques}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.row}
        onRefresh={loadCustomTechniques}
        refreshing={false}
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
  header: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#7B1FA2',
    flex: 1,
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addButton: {
    backgroundColor: '#BA68C8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 12,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  progressButton: {
    backgroundColor: '#9C27B0',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  progressButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'center',
  },
});
