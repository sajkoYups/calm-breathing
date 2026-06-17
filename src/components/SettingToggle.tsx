import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';

interface SettingToggleProps {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export const SettingToggle: React.FC<SettingToggleProps> = ({ label, value, onValueChange }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.toggleContainer}>
        <Text style={[styles.status, !value && styles.statusOff]}>{value ? 'ON' : 'OFF'}</Text>
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: '#B0BEC5', true: '#7986CB' }}
          thumbColor={value ? '#3F51B5' : '#ECEFF1'}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#283593',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3F51B5',
    minWidth: 32,
    textAlign: 'right',
  },
  statusOff: {
    color: '#90A4AE',
  },
});
