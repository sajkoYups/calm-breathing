import React from 'react';
import { FULL_SAFETY_NOTICE, SHORT_SAFETY_REMINDER } from '../data/safetyContent';
import { ModalSheet } from './ui/ModalSheet';
import { Text } from './ui/Text';

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
    <ModalSheet
      visible={visible}
      title={isFull ? 'Safety Notice' : 'Before You Begin'}
      primaryAction={{ label: buttonLabel, onPress: onContinue }}
    >
      <Text variant="body" color="secondary">
        {message}
      </Text>
    </ModalSheet>
  );
};
