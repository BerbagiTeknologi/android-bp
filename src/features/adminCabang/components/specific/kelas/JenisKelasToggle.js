import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const JenisKelasToggle = ({
  value = 'standard',
  onValueChange,
  disabled = false,
  style
}) => {
  const options = [
    {
      key: 'standard',
      label: 'Standard',
      description: 'Kelas berdasarkan tingkat',
      icon: 'library-outline',
      color: '#007bff'
    },
    {
      key: 'custom',
      label: 'Custom',
      description: 'Kelas dengan nama khusus',
      icon: 'create-outline',
      color: '#28a745'
    }
  ];

  const handleSelect = (key) => {
    if (!disabled && key !== value) {
      onValueChange?.(key);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>Jenis Kelas *</Text>
      
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option.key;
          
          return (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.option,
                isSelected && styles.selectedOption,
                disabled && styles.disabledOption
              ]}
              onPress={() => handleSelect(option.key)}
              activeOpacity={disabled ? 1 : 0.7}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.iconContainer,
                  { backgroundColor: isSelected ? option.color : '#f8f9fa' }
                ]}>
                  <Ionicons 
                    name={option.icon} 
                    size={20} 
                    color={isSelected ? '#fff' : '#666'} 
                  />
                </View>
                
                <View style={styles.textContainer}>
                  <Text style={[
                    styles.optionLabel,
                    isSelected && styles.selectedLabel,
                    disabled && styles.disabledText
                  ]}>
                    {option.label}
                  </Text>
                  <Text style={[
                    styles.optionDescription,
                    disabled && styles.disabledText
                  ]}>
                    {option.description}
                  </Text>
                </View>
              </View>
              
              {isSelected && (
                <View style={[styles.checkIcon, { backgroundColor: option.color }]}>
                  <Ionicons name="checkmark" size={14} color="#fff" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8
  },
  optionsContainer: {
    gap: 8
  },
  option: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#e9ecef',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectedOption: {
    borderColor: '#007bff',
    backgroundColor: '#f8f9ff'
  },
  disabledOption: {
    opacity: 0.6
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  selectedLabel: {
    color: '#007bff'
  },
  optionDescription: {
    fontSize: 14,
    color: '#666'
  },
  disabledText: {
    color: '#ccc'
  },
  checkIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default JenisKelasToggle;