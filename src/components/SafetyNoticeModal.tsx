import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { FULL_SAFETY_NOTICE, SHORT_SAFETY_REMINDER } from '../data/safetyContent';

interface SafetyNoticeModalProps {
  visible: boolean;
  mode: 'full' | 'short';
  onContinue: () => void;
}

export const SafetyNoticeModal: React.FC<SafetyNoticeModalProps> = ({
  visible,
  mode,
  onContinue,
}) => {
  const isFull = mode === 'full';
  const message = isFull ? FULL_SAFETY_NOTICE : SHORT_SAFETY_REMINDER;
  const buttonLabel = isFull ? 'I Understand' : 'Continue';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>
            {isFull ? 'Safety Notice' : 'Before You Begin'}
          </Text>
          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            <Text style={styles.message}>{message}</Text>
          </ScrollView>
          <TouchableOpacity onPress={onContinue} style={styles.button}>
            <Text style={styles.buttonText}>{buttonLabel}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#283593',
    marginBottom: 16,
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: 300,
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 24,
  },
  button: {
    backgroundColor: '#5C6BC0',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
