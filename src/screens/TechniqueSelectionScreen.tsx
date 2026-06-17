import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { BreathingTechnique } from '../types';
import { TechniqueCard } from '../components/TechniqueCard';
import { defaultTechniques } from '../data/breathingTechniques';

interface TechniqueSelectionScreenProps {
  onViewDetail?: (technique: BreathingTechnique) => void;
  onTrackProgress?: () => void;
  onSettings?: () => void;
  onBack?: () => void;
}

const horizontalPadding = 16;

export const TechniqueSelectionScreen: React.FC<TechniqueSelectionScreenProps> = ({
  onViewDetail,
  onTrackProgress,
  onSettings,
  onBack,
}) => {
  const handleCardPress = (technique: BreathingTechnique) => {
    if (onViewDetail) {
      onViewDetail(technique);
    }
  };

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
        {onTrackProgress && (
          <TouchableOpacity onPress={onTrackProgress} style={styles.progressButton}>
            <Text style={styles.progressButtonText}>Track Progress</Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        data={defaultTechniques}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
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
    paddingBottom: 10,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#3F51B5',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#283593',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 24,
  },
  progressButton: {
    backgroundColor: '#7986CB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  progressButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: horizontalPadding - 6,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'center',
  },
});
