import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const FilterChip = ({
  label,
  onRemove,
  color = '#007bff',
  backgroundColor,
  textColor,
  style,
  disabled = false
}) => {
  const chipBackgroundColor = backgroundColor || `${color}15`;
  const chipTextColor = textColor || color;

  return (
    <View style={[
      styles.container,
      { backgroundColor: chipBackgroundColor },
      disabled && styles.disabled,
      style
    ]}>
      <Text style={[
        styles.label,
        { color: chipTextColor },
        disabled && styles.disabledText
      ]} numberOfLines={1}>
        {label}
      </Text>
      
      {onRemove && !disabled && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons 
            name="close" 
            size={14} 
            color={chipTextColor} 
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingLeft: 12,
    paddingRight: 8,
    borderRadius: 16,
    maxWidth: 200
  },
  disabled: {
    opacity: 0.5
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1
  },
  disabledText: {
    color: '#999'
  },
  removeButton: {
    marginLeft: 6,
    padding: 2
  }
});

export default FilterChip;