import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { calculateAge, getStatusLabel } from '../../../common/utils/ageCalculator';
import { formatEducationDisplay } from '../../../common/utils/educationFormatter';

const AnakListItem = ({ item, onPress, onToggleStatus, onDelete }) => {
  if (!item) return null;

  return (
    <TouchableOpacity 
      style={styles.anakCard}
      onPress={onPress}
    >
      <View style={styles.anakImageContainer}>
        {item.foto_url ? (
          <Image
            source={{ uri: item.foto_url }}
            style={styles.anakImage}
          />
        ) : (
          <View style={styles.anakImagePlaceholder}>
            <Ionicons name="person" size={36} color="#ffffff" />
          </View>
        )}
      </View>
      
      <View style={styles.anakInfo}>
        <Text style={styles.anakName}>{item.full_name || item.nick_name}</Text>
        {item.nick_name && item.full_name && (
          <Text style={styles.anakNickname}>{item.nick_name}</Text>
        )}
        <View style={styles.anakDetailsRow}>
          <View style={styles.anakDetail}>
            <Ionicons name="calendar-outline" size={16} color="#666" />
            <Text style={styles.anakDetailText}>
              {calculateAge(item.tanggal_lahir)}
            </Text>
          </View>
          <View style={styles.anakDetail}>
            <Ionicons name="bookmark-outline" size={16} color="#666" />
            <Text style={styles.anakDetailText}>
              {getStatusLabel(item.status_cpb)}
            </Text>
          </View>
        </View>
        <View style={styles.anakDetailsRow}>
          <View style={styles.anakDetail}>
            <Ionicons name="school-outline" size={16} color="#666" />
            <Text style={styles.anakDetailText}>
              {formatEducationDisplay(item.anakPendidikan)}
            </Text>
          </View>
        </View>
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: item.status_validasi === 'aktif' ? '#2ecc71' : '#e74c3c' }
          ]}>
            <Text style={styles.statusText}>{item.status_validasi === 'aktif' ? 'Aktif' : 'Non-Aktif'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionButtons}>
        {onToggleStatus && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.toggleButton]}
            onPress={() => onToggleStatus(item)}
          >
            <Ionicons 
              name={item.status_validasi === 'aktif' ? "close-circle-outline" : "checkmark-circle-outline"} 
              size={24} 
              color={item.status_validasi === 'aktif' ? "#e74c3c" : "#2ecc71"} 
            />
          </TouchableOpacity>
        )}
        {onDelete && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => onDelete(item)}
          >
            <Ionicons name="trash-outline" size={24} color="#e74c3c" />
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  anakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  anakImageContainer: {
    marginRight: 16,
  },
  anakImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  anakImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  anakInfo: {
    flex: 1,
  },
  anakName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 2,
  },
  anakNickname: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  anakDetailsRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  anakDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  anakDetailText: {
    fontSize: 14,
    color: '#666666',
    marginLeft: 4,
  },
  statusContainer: {
    marginTop: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  actionButtons: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 60,
  },
  actionButton: {
    padding: 6,
  },
  toggleButton: {},
  deleteButton: {},
});

export default AnakListItem;