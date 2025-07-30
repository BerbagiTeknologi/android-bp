import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropdownSelector from './DropdownSelector';

const TingkatSelector = ({
  value,
  onValueChange,
  error,
  disabled = false,
  required = false,
  style
}) => {
  const tingkatOptions = Array.from({ length: 12 }, (_, i) => {
    const num = i + 1;
    const romans = {
      1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI',
      7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X', 11: 'XI', 12: 'XII'
    };
    
    return {
      label: `Tingkat ${num} (${romans[num]})`,
      value: num
    };
  });

  return (
    <View style={[styles.container, style]}>
      <DropdownSelector
        label="Tingkat"
        value={value}
        onSelect={onValueChange}
        options={tingkatOptions}
        placeholder="Pilih tingkat (1-12)"
        error={error}
        disabled={disabled}
        required={required}
      />
      
      {!error && (
        <Text style={styles.helperText}>
          Pilih tingkat kelas untuk sistem standard
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontStyle: 'italic'
  }
});

export default TingkatSelector;