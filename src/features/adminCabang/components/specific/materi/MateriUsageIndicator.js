import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MateriUsageIndicator = ({ 
  usage = {}, 
  onViewUsage,
  style 
}) => {
  const totalUsage = usage.kurikulum_count || 0;
  const isUsed = totalUsage > 0;
  
  const getUsageColor = () => {
    if (totalUsage === 0) return '#dc3545';
    if (totalUsage < 3) return '#ffc107';
    return '#28a745';
  };

  const getUsageText = () => {
    if (totalUsage === 0) return 'Belum digunakan';
    if (totalUsage === 1) return '1 kurikulum';
    return `${totalUsage} kurikulum`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={onViewUsage}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={[
          styles.indicator,
          { backgroundColor: getUsageColor() + '20' }
        ]}>
          <Ionicons 
            name={isUsed ? "checkmark-circle" : "alert-circle"}
            size={16} 
            color={getUsageColor()} 
          />
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Penggunaan</Text>
          <Text style={[styles.usage, { color: getUsageColor() }]}>
            {getUsageText()}
          </Text>
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color="#666" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  indicator: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  title: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  usage: {
    fontSize: 14,
    fontWeight: '600'
  }
});

export default MateriUsageIndicator;