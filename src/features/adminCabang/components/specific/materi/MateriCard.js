import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const MateriCard = ({ 
  item, 
  onPress, 
  onEdit, 
  onDelete,
  showActions = true
}) => {
  const getUsageColor = () => {
    const usage = item.kurikulum_materi_count || 0;
    if (usage === 0) return '#dc3545';
    if (usage < 3) return '#ffc107';
    return '#28a745';
  };

  const getUsageText = () => {
    const usage = item.kurikulum_materi_count || 0;
    if (usage === 0) return 'Belum digunakan';
    return `${usage} kurikulum`;
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={() => onPress?.(item)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.hierarchyPath}>
          <Text style={styles.pathText}>
            {item.kelas?.jenjang?.nama_jenjang || item.mata_pelajaran?.jenjang?.nama_jenjang || '-'}
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#999" />
          <Text style={styles.pathText}>
            {item.mata_pelajaran?.nama_mata_pelajaran || '-'}
          </Text>
          <Ionicons name="chevron-forward" size={12} color="#999" />
          <Text style={styles.pathText}>
            {item.kelas?.nama_kelas || '-'}
          </Text>
        </View>
        
        <View style={[
          styles.usageBadge,
          { backgroundColor: getUsageColor() + '20' }
        ]}>
          <Text style={[
            styles.usageText,
            { color: getUsageColor() }
          ]}>
            {getUsageText()}
          </Text>
        </View>
      </View>

      <Text style={styles.nama}>{item.nama_materi}</Text>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Ionicons name="book-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.mata_pelajaran?.kode_mata_pelajaran || 'N/A'}
          </Text>
        </View>
        
        <View style={styles.detailItem}>
          <Ionicons name="people-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.kelas?.jenis_kelas === 'standard' 
              ? `Kelas ${item.kelas?.tingkat}` 
              : item.kelas?.nama_kelas
            }
          </Text>
        </View>
        
        {item.mata_pelajaran?.kategori && (
          <View style={styles.detailItem}>
            <Ionicons name="pricetag-outline" size={14} color="#666" />
            <Text style={styles.detailText}>
              {item.mata_pelajaran.kategori}
            </Text>
          </View>
        )}
      </View>

      {showActions && (
        <View style={styles.actions}>
          {onEdit && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={() => onEdit(item)}
            >
              <Ionicons name="create-outline" size={18} color="#007bff" />
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => onDelete(item)}
            >
              <Ionicons name="trash-outline" size={18} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  hierarchyPath: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  pathText: {
    fontSize: 11,
    color: '#666',
    marginHorizontal: 2
  },
  usageBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  usageText: {
    fontSize: 10,
    fontWeight: '600'
  },
  nama: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
    gap: 8
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    gap: 8
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButton: {
    backgroundColor: '#cce5ff'
  },
  deleteButton: {
    backgroundColor: '#f5c6cb'
  }
});

export default MateriCard;