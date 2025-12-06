import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { BreathingTechnique } from '../types';
import { deleteCustomTechnique } from '../utils/storage';

interface TechniqueDetailScreenProps {
  technique: BreathingTechnique;
  onBack: () => void;
  onStart: () => void;
  onEdit?: (technique: BreathingTechnique) => void;
  onDelete?: () => void;
}

export const TechniqueDetailScreen: React.FC<TechniqueDetailScreenProps> = ({
  technique,
  onBack,
  onStart,
  onEdit,
  onDelete,
}) => {
  const handleDelete = () => {
    Alert.alert(
      'Delete Technique',
      `Are you sure you want to delete "${technique.name}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomTechnique(technique.id);
              if (onDelete) {
                onDelete();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete technique');
            }
          },
        },
      ]
    );
  };
  const pattern = technique.holdInhale || technique.holdExhale
    ? `${technique.inhaleSeconds}-${technique.holdInhale || 0}-${technique.exhaleSeconds}-${technique.holdExhale || 0}`
    : `${technique.inhaleSeconds}-${technique.exhaleSeconds}`;

  const getDetailedDescription = () => {
    switch (technique.id) {
      case 'wim-hof':
        return 'The Wim Hof Method combines breathing exercises with cold exposure and meditation. This powerful technique helps reduce stress, improve immune function, and increase energy levels. Regular practice can enhance your body\'s ability to handle stress and boost overall wellbeing.';
      case 'box-breathing':
        return 'Box Breathing, also known as square breathing, is a simple yet effective technique used by athletes, military personnel, and meditation practitioners. It helps calm the nervous system, improve focus, and reduce anxiety. The equal timing creates a sense of balance and control.';
      case '4-7-8':
        return 'The 4-7-8 breathing technique is designed to activate the body\'s natural relaxation response. This method helps reduce anxiety, improve sleep quality, and manage stress. The extended exhale triggers the parasympathetic nervous system, promoting deep relaxation.';
      case 'deep-breathing':
        return 'Deep breathing is one of the simplest and most accessible relaxation techniques. It helps reduce stress, lower blood pressure, and improve oxygen flow throughout the body. Perfect for daily use, especially during moments of tension or before sleep.';
      case 'pranayama':
        return 'Pranayama is an ancient yogic breathing practice that balances the body and mind. It helps improve lung capacity, reduce stress, and enhance mental clarity. Regular practice promotes overall harmony and wellbeing.';
      case 'coherent-breathing':
        return 'Coherent breathing optimizes heart rate variability, which is linked to better stress resilience and emotional regulation. This technique helps balance the autonomic nervous system and promotes a state of calm alertness.';
      case 'triangle-breathing':
        return 'Triangle breathing creates a three-part rhythm that helps focus the mind and calm the body. This technique is excellent for mental clarity, reducing racing thoughts, and creating a sense of stability during stressful situations.';
      case 'square-breathing':
        return 'Square breathing provides a structured, balanced approach to relaxation. The four equal parts create a sense of stability and control, making it ideal for managing anxiety, improving concentration, and finding mental equilibrium.';
      case '2-1-breathing':
        return 'The 2:1 breathing pattern emphasizes a longer exhale, which activates the body\'s relaxation response. This technique is particularly effective for reducing stress, calming the mind, and preparing for sleep.';
      case 'alternate-nostril':
        return 'Alternate nostril breathing balances the left and right hemispheres of the brain, promoting mental equilibrium and reducing stress. This technique helps improve focus, reduce anxiety, and create a sense of inner balance.';
      case 'belly-breathing':
        return 'Belly breathing, or diaphragmatic breathing, engages the diaphragm fully and promotes optimal oxygen exchange. This technique helps reduce stress, lower blood pressure, and improve overall respiratory function.';
      default:
        return technique.description || 'A breathing technique to help you find calm and improve your wellbeing.';
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{technique.name}</Text>
          <Text style={styles.pattern}>{pattern} seconds</Text>
        </View>

        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>About This Technique</Text>
          <Text style={styles.description}>{getDetailedDescription()}</Text>
        </View>

        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Reduces stress and anxiety</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Improves focus and mental clarity</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Promotes relaxation and calm</Text>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitBullet}>•</Text>
            <Text style={styles.benefitText}>Enhances overall wellbeing</Text>
          </View>
        </View>

        <TouchableOpacity onPress={onStart} style={styles.startButton}>
          <Text style={styles.startButtonText}>Start Breathing</Text>
        </TouchableOpacity>

        {technique.isCustom && (
          <View style={styles.customActions}>
            {onEdit && (
              <TouchableOpacity
                onPress={() => onEdit(technique)}
                style={styles.editButton}
              >
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={handleDelete}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 12,
  },
  pattern: {
    fontSize: 20,
    color: '#5C6BC0',
    fontWeight: '600',
  },
  descriptionContainer: {
    marginBottom: 32,
  },
  descriptionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3949AB',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 26,
  },
  benefitsContainer: {
    marginBottom: 40,
  },
  benefitsTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#3949AB',
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  benefitBullet: {
    fontSize: 20,
    color: '#5C6BC0',
    marginRight: 12,
    marginTop: 2,
  },
  benefitText: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 24,
    flex: 1,
  },
  startButton: {
    backgroundColor: '#5C6BC0',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
  customActions: {
    flexDirection: 'row',
    marginTop: 24,
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginRight: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#F44336',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    alignItems: 'center',
    marginLeft: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

