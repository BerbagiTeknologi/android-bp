// src/features/adminCabang/components/specific/jenjang/JenjangCard.js
import React, { useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStoreSelectors } from '../../../stores';
import { ENTITIES } from '../../../stores/masterDataStore';

/**
 * JenjangCard - Card component untuk display jenjang data
 * Dengan actions untuk edit, delete, view dan status indicator
 */
const JenjangCard = ({
  // Data
  jenjang,
  
  // Actions
  onPress,
  onEdit,
  onDelete,
  onView,
  onToggleStatus,
  
  // UI config
  showActions = true,
  showStatus = true,
  showStatistics = false,
  compact = false,
  
  // Styles
  style,
  cardStyle,
  contentStyle,
  
  // Interaction
  disabled = false,
  selectable = false,
  selected = false,
  onSelect
}) => {
  const navigation = useNavigation();
  
  // ==================== ZUSTAND STORES ====================
  const masterDataActions = useStoreSelectors.masterData.actions();
  const uiActions = useStoreSelectors.ui.actions();
  
  const deleting = useStoreSelectors.ui.loading(ENTITIES.JENJANG, 'deleting');
  const updating = useStoreSelectors.ui.loading(ENTITIES.JENJANG, 'updating');
  
  // ==================== COMPUTED VALUES ====================
  
  const isActive = useMemo(() => {
    return jenjang.is_active !== false && jenjang.status !== 'tidak_aktif';
  }, [jenjang.is_active, jenjang.status]);
  
  const displayData = useMemo(() => ({
    id: jenjang.id_jenjang,
    nama: jenjang.nama_jenjang || 'Unnamed Jenjang',
    kode: jenjang.kode_jenjang || '-',
    urutan: jenjang.urutan || 0,
    deskripsi: jenjang.deskripsi || null,
    createdAt: jenjang.created_at,
    updatedAt: jenjang.updated_at,
    
    // Statistics
    totalMataPelajaran: jenjang.mata_pelajaran_count || 0,
    totalKelas: jenjang.kelas_count || 0,
    totalMateri: jenjang.materi_count || 0
  }), [jenjang]);
  
  const statusColor = useMemo(() => {
    return isActive ? '#28a745' : '#dc3545';
  }, [isActive]);
  
  const statusText = useMemo(() => {
    return isActive ? 'Aktif' : 'Tidak Aktif';
  }, [isActive]);
  
  // ==================== HANDLERS ====================
  
  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (selectable) {
      onSelect?.(jenjang, !selected);
    } else if (onPress) {
      onPress(jenjang);
    } else if (onView) {
      onView(jenjang);
    }
  }, [disabled, selectable, onSelect, jenjang, selected, onPress, onView]);
  
  const handleEdit = useCallback((e) => {
    e?.stopPropagation();
    
    if (onEdit) {
      onEdit(jenjang);
    } else {
      navigation.navigate('JenjangForm', { 
        mode: 'edit', 
        id: displayData.id, 
        item: jenjang 
      });
    }
  }, [onEdit, jenjang, navigation, displayData.id]);
  
  const handleDelete = useCallback((e) => {
    e?.stopPropagation();
    
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus jenjang "${displayData.nama}"?\n\nPeringatan: Ini akan mempengaruhi semua mata pelajaran dan kelas yang terkait.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (onDelete) {
              onDelete(jenjang);
            } else {
              await performDelete();
            }
          }
        }
      ]
    );
  }, [jenjang, displayData.nama, onDelete]);
  
  const performDelete = useCallback(async () => {
    try {
      await masterDataActions.delete(ENTITIES.JENJANG, displayData.id);
      uiActions.setSuccess(`Jenjang "${displayData.nama}" berhasil dihapus`, 'delete');
    } catch (error) {
      uiActions.setError(ENTITIES.JENJANG, error.message || 'Gagal menghapus jenjang');
    }
  }, [masterDataActions, uiActions, displayData.id, displayData.nama]);
  
  const handleToggleStatus = useCallback(async (e) => {
    e?.stopPropagation();
    
    const newStatus = !isActive;
    const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
    
    Alert.alert(
      'Konfirmasi Status',
      `Apakah Anda yakin ingin ${action} jenjang "${displayData.nama}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            if (onToggleStatus) {
              onToggleStatus(jenjang, newStatus);
            } else {
              await performToggleStatus(newStatus);
            }
          }
        }
      ]
    );
  }, [isActive, displayData.nama, jenjang, onToggleStatus]);
  
  const performToggleStatus = useCallback(async (newStatus) => {
    try {
      const updateData = {
        is_active: newStatus,
        status: newStatus ? 'aktif' : 'tidak_aktif'
      };
      
      await masterDataActions.update(ENTITIES.JENJANG, displayData.id, updateData);
      
      const statusText = newStatus ? 'diaktifkan' : 'dinonaktifkan';
      uiActions.setSuccess(`Jenjang "${displayData.nama}" berhasil ${statusText}`, 'update');
    } catch (error) {
      uiActions.setError(ENTITIES.JENJANG, error.message || 'Gagal mengubah status jenjang');
    }
  }, [masterDataActions, uiActions, displayData.id, displayData.nama]);
  
  const handleView = useCallback((e) => {
    e?.stopPropagation();
    
    if (onView) {
      onView(jenjang);
    } else {
      navigation.navigate('JenjangDetail', { 
        id: displayData.id, 
        item: jenjang 
      });
    }
  }, [onView, jenjang, navigation, displayData.id]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleContent}>
          <Text style={styles.title} numberOfLines={1}>
            {displayData.nama}
          </Text>
          <Text style={styles.subtitle}>
            {displayData.kode} • Urutan {displayData.urutan}
          </Text>
        </View>
        
        {showStatus && (
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        )}
        
        {selectable && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onSelect?.(jenjang, !selected)}
          >
            <Ionicons
              name={selected ? "checkbox" : "square-outline"}
              size={20}
              color={selected ? "#007bff" : "#999"}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {displayData.deskripsi && !compact && (
        <Text style={styles.description} numberOfLines={2}>
          {displayData.deskripsi}
        </Text>
      )}
    </View>
  );
  
  const renderStatistics = () => {
    if (!showStatistics || compact) return null;
    
    return (
      <View style={styles.statistics}>
        <View style={styles.statItem}>
          <Ionicons name="book-outline" size={14} color="#666" />
          <Text style={styles.statText}>{displayData.totalMataPelajaran} Mapel</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="school-outline" size={14} color="#666" />
          <Text style={styles.statText}>{displayData.totalKelas} Kelas</Text>
        </View>
        
        <View style={styles.statItem}>
          <Ionicons name="library-outline" size={14} color="#666" />
          <Text style={styles.statText}>{displayData.totalMateri} Materi</Text>
        </View>
      </View>
    );
  };
  
  const renderActions = () => {
    if (!showActions || compact) return null;
    
    return (
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleView}
          disabled={disabled}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="eye-outline" size={16} color="#007bff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEdit}
          disabled={disabled || updating}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons 
            name={updating ? "sync" : "pencil-outline"} 
            size={16} 
            color="#28a745" 
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleToggleStatus}
          disabled={disabled || updating}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name={isActive ? "pause-circle-outline" : "play-circle-outline"}
            size={16}
            color="#ffc107"
          />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleDelete}
          disabled={disabled || deleting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons 
            name={deleting ? "sync" : "trash-outline"} 
            size={16} 
            color="#dc3545" 
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderCompactView = () => (
    <View style={[styles.compactContent, contentStyle]}>
      <View style={styles.compactInfo}>
        <Text style={styles.compactTitle} numberOfLines={1}>
          {displayData.nama}
        </Text>
        <Text style={styles.compactSubtitle}>
          {displayData.kode} • #{displayData.urutan}
        </Text>
      </View>
      
      {showStatus && (
        <View style={[styles.compactStatus, { backgroundColor: statusColor }]} />
      )}
      
      {selectable && (
        <Ionicons
          name={selected ? "checkbox" : "square-outline"}
          size={18}
          color={selected ? "#007bff" : "#999"}
        />
      )}
    </View>
  );
  
  // ==================== RENDER ====================
  
  if (compact) {
    return (
      <TouchableOpacity
        style={[
          styles.card,
          styles.compactCard,
          cardStyle,
          selected && styles.selectedCard,
          disabled && styles.disabledCard,
          style
        ]}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        {renderCompactView()}
      </TouchableOpacity>
    );
  }
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        cardStyle,
        selected && styles.selectedCard,
        disabled && styles.disabledCard,
        style
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.content, contentStyle]}>
        {renderHeader()}
        {renderStatistics()}
        {renderActions()}
      </View>
    </TouchableOpacity>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 6,
    borderRadius: 12, elevation: 2, shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3
  },
  compactCard: { paddingHorizontal: 12, paddingVertical: 8, marginVertical: 2 },
  selectedCard: { borderWidth: 2, borderColor: '#007bff' },
  disabledCard: { opacity: 0.6 },
  
  content: { padding: 16 },
  compactContent: { flexDirection: 'row', alignItems: 'center' },
  
  // Header
  header: { marginBottom: 12 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  titleContent: { flex: 1, marginRight: 12 },
  title: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 2 },
  subtitle: { fontSize: 12, color: '#666' },
  description: { fontSize: 14, color: '#666', marginTop: 8, lineHeight: 18 },
  
  // Status
  statusBadge: {
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12,
    alignSelf: 'flex-start'
  },
  statusText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  
  // Select
  selectButton: { marginLeft: 8 },
  
  // Statistics
  statistics: { flexDirection: 'row', marginBottom: 12, gap: 16 },
  statItem: { flexDirection: 'row', alignItems: 'center' },
  statText: { fontSize: 12, color: '#666', marginLeft: 4 },
  
  // Actions
  actions: {
    flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center',
    paddingTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0', gap: 12
  },
  actionButton: { padding: 8 },
  
  // Compact view
  compactInfo: { flex: 1 },
  compactTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 2 },
  compactSubtitle: { fontSize: 12, color: '#666' },
  compactStatus: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 8 }
});

export default JenjangCard;