import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SortButton = ({
  field,
  direction = 'asc', // 'asc' | 'desc' | null
  onPress,
  title,
  disabled = false,
  style
}) => {
  const getIcon = () => {
    if (!direction) return 'swap-vertical-outline';
    return direction === 'asc' ? 'arrow-up' : 'arrow-down';
  };

  const getColor = () => {
    if (disabled) return '#ccc';
    return direction ? '#007bff' : '#666';
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress?.(field)}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.title, { color: getColor() }]}>
        {title}
      </Text>
      <Ionicons 
        name={getIcon()} 
        size={16} 
        color={getColor()} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa'
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4
  }
});

export default SortButton;