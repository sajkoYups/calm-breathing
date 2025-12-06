import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { BreathingTechnique } from '../types';
import { saveCustomTechnique, updateCustomTechnique } from '../utils/storage';

interface CustomTechniqueScreenProps {
  technique?: BreathingTechnique; // If provided, we're editing
  onSave: () => void;
  onBack: () => void;
}

export const CustomTechniqueScreen: React.FC<CustomTechniqueScreenProps> = ({
  technique,
  onSave,
  onBack,
}) => {
  const isEditing = !!technique;
  const [name, setName] = useState('');
  const [inhaleSeconds, setInhaleSeconds] = useState('');
  const [exhaleSeconds, setExhaleSeconds] = useState('');
  const [holdInhale, setHoldInhale] = useState('');
  const [holdExhale, setHoldExhale] = useState('');

  useEffect(() => {
    if (technique) {
      setName(technique.name);
      setInhaleSeconds(technique.inhaleSeconds.toString());
      setExhaleSeconds(technique.exhaleSeconds.toString());
      setHoldInhale(technique.holdInhale?.toString() || '');
      setHoldExhale(technique.holdExhale?.toString() || '');
    }
  }, [technique]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a technique name');
      return;
    }

    const inhale = parseInt(inhaleSeconds, 10);
    const exhale = parseInt(exhaleSeconds, 10);
    const holdIn = holdInhale ? parseInt(holdInhale, 10) : undefined;
    const holdOut = holdExhale ? parseInt(holdExhale, 10) : undefined;

    if (isNaN(inhale) || inhale <= 0) {
      Alert.alert('Error', 'Please enter a valid inhale duration (seconds)');
      return;
    }

    if (isNaN(exhale) || exhale <= 0) {
      Alert.alert('Error', 'Please enter a valid exhale duration (seconds)');
      return;
    }

    if (holdIn !== undefined && (isNaN(holdIn) || holdIn < 0)) {
      Alert.alert('Error', 'Please enter a valid hold after inhale duration');
      return;
    }

    if (holdOut !== undefined && (isNaN(holdOut) || holdOut < 0)) {
      Alert.alert('Error', 'Please enter a valid hold after exhale duration');
      return;
    }

    const techniqueData: BreathingTechnique = {
      id: isEditing && technique ? technique.id : `custom-${Date.now()}`,
      name: name.trim(),
      inhaleSeconds: inhale,
      exhaleSeconds: exhale,
      holdInhale: holdIn,
      holdExhale: holdOut,
      description: 'Custom breathing technique',
      isCustom: true,
    };

    try {
      if (isEditing) {
        await updateCustomTechnique(techniqueData);
        Alert.alert('Success', 'Custom technique updated!', [
          {
            text: 'OK',
            onPress: () => {
              onSave();
            },
          },
        ]);
      } else {
        await saveCustomTechnique(techniqueData);
        Alert.alert('Success', 'Custom technique saved!', [
          {
            text: 'OK',
            onPress: () => {
              setName('');
              setInhaleSeconds('');
              setExhaleSeconds('');
              setHoldInhale('');
              setHoldExhale('');
              onSave();
            },
          },
        ]);
      }
    } catch (error) {
      Alert.alert('Error', isEditing ? 'Failed to update custom technique' : 'Failed to save custom technique');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{isEditing ? 'Edit Technique' : 'Create Custom Technique'}</Text>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Technique Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g., My Calm Breath"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Inhale (seconds) *</Text>
            <TextInput
              style={styles.input}
              value={inhaleSeconds}
              onChangeText={setInhaleSeconds}
              placeholder="e.g., 4"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exhale (seconds) *</Text>
            <TextInput
              style={styles.input}
              value={exhaleSeconds}
              onChangeText={setExhaleSeconds}
              placeholder="e.g., 6"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hold After Inhale (seconds, optional)</Text>
            <TextInput
              style={styles.input}
              value={holdInhale}
              onChangeText={setHoldInhale}
              placeholder="e.g., 4"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Hold After Exhale (seconds, optional)</Text>
            <TextInput
              style={styles.input}
              value={holdExhale}
              onChangeText={setHoldExhale}
              placeholder="e.g., 2"
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>{isEditing ? 'Update Technique' : 'Save Technique'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF3E0',
  },
  backButton: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  backButtonText: {
    fontSize: 18,
    color: '#E65100',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#E65100',
    marginBottom: 32,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#E65100',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  saveButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
  },
});

