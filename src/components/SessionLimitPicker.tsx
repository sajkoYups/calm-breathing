import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface SessionLimitPickerProps {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (value: number) => void;
}

export const SessionLimitPicker: React.FC<SessionLimitPickerProps> = ({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}) => {
  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={decrement}
          style={[styles.button, value <= min && styles.buttonDisabled]}
          disabled={value <= min}
        >
          <Text style={styles.buttonText}>−</Text>
        </TouchableOpacity>
        <View style={styles.valueContainer}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.unit}>{unit}</Text>
        </View>
        <TouchableOpacity
          onPress={increment}
          style={[styles.button, value >= max && styles.buttonDisabled]}
          disabled={value >= max}
        >
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.range}>
        {min}–{max} {unit}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283593',
    marginBottom: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#5C6BC0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#C5CAE9',
  },
  buttonText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 32,
  },
  valueContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  value: {
    fontSize: 36,
    fontWeight: '700',
    color: '#283593',
  },
  unit: {
    fontSize: 14,
    color: '#5C6BC0',
    fontWeight: '500',
  },
  range: {
    fontSize: 12,
    color: '#90A4AE',
    textAlign: 'center',
    marginTop: 8,
  },
});
