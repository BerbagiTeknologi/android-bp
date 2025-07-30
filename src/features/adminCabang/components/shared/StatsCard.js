import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const StatsCard = ({
  title,
  value,
  subtitle,
  icon,
  iconColor = '#007bff',
  backgroundColor = '#fff',
  onPress,
  loading = false,
  style
}) => {
  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[styles.container, { backgroundColor }, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.content}>
        {icon && (
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon} size={24} color={iconColor} />
          </View>
        )}
        
        <View style={styles.textContainer}>
          <Text style={styles.value}>
            {loading ? '...' : (typeof value === 'number' ? value.toLocaleString() : value)}
          </Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      </View>
      
      {onPress && (
        <Ionicons name="chevron-forward" size={20} color="#666" />
      )}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  textContainer: {
    flex: 1
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2
  },
  title: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500'
  },
  subtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2
  }
});

export default StatsCard;