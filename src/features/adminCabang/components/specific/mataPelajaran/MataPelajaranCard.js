// src/features/adminCabang/components/specific/mataPelajaran/MataPelajaranCard.js
import React, { useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStoreSelectors } from '../../../stores';
import { ENTITIES } from '../../../stores/masterDataStore';

/**
 * MataPelajaranCard - Card component untuk display mata pelajaran data
 * Dengan category badge, jenjang relation, dan statistics
 */
const MataPelajaranCard = ({
  // Data
  mataPelajaran,
  
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
  showJenjang = true,
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
  
  const deleting = useStoreSelectors.ui.loading(ENTITIES.MATA_PELAJARAN, 'deleting');
  const updating = useStoreSelectors.ui.loading(ENTITIES.MATA_PELAJARAN, 'updating');
  
  // ==================== COMPUTED VALUES ====================
  
  const isActive = useMemo(() => {
    return mataPelajaran.is_active !== false && mataPelajaran.status !== 'tidak_aktif';
  }, [mataPelajaran.is_active, mataPelajaran.status]);
  
  const displayData = useMemo(() => ({
    id: mataPelajaran.id_mata_pelajaran,
    nama: mataPelajaran.nama_mata_pelajaran || 'Unnamed Mata Pelajaran',
    kode: mataPelajaran.kode_mata_pelajaran || '-',
    kategori: mataPelajaran.kategori || 'unknown',
    deskripsi: mataPelajaran.deskripsi || null,
    createdAt: mataPelajaran.created_at,
    updatedAt: mataPelajaran.updated_at,
    
    // Relationships
    jenjang: mataPelajaran.jenjang || null,
    jenjangNama: mataPelajaran.jenjang?.nama_jenjang || 'Semua Jenjang',
    
    // Statistics
    totalMateri: mataPelajaran.materi_count || 0,
    totalKelas: mataPelajaran.kelas_count || 0
  }), [mataPelajaran]);
  
  const statusColor = useMemo(() => {
    return isActive ? '#28a745' : '#dc3545';
  }, [isActive]);
  
  const statusText = useMemo(() => {
    return isActive ? 'Aktif' : 'Tidak Aktif';
  }, [isActive]);
  
  // Get category display info
  const categoryInfo = useMemo(() => {
    const categoryMap = {
      'wajib': { label: 'Wajib', color: '#dc3545', icon: 'star' },
      'muatan_lokal': { label: 'Muatan Lokal', color: '#fd7e14', icon: 'location' },
      'pengembangan_diri': { label: 'Pengembangan Diri', color: '#20c997', icon: 'person' },
      'pilihan': { label: 'Pilihan', color: '#6f42c1', icon: 'options' },
      'ekstrakurikuler': { label: 'Ekstrakurikuler', color: '#0dcaf0', icon: 'fitness' }
    };
    
    return categoryMap[displayData.kategori] || {
      label: displayData.kategori,
      color: '#6c757d',
      icon: 'help'
    };
  }, [displayData.kategori]);
  
  // ==================== HANDLERS ====================
  
  const handlePress = useCallback(() => {
    if (disabled) return;
    
    if (selectable) {
      onSelect?.(mataPelajaran, !selected);
    } else if (onPress) {
      onPress(mataPelajaran);
    } else if (onView) {
      onView(mataPelajaran);
    }
  }, [disabled, selectable, onSelect, mataPelajaran, selected, onPress, onView]);
  
  const handleEdit = useCallback((e) => {
    e?.stopPropagation();
    
    if (onEdit) {
      onEdit(mataPelajaran);
    } else {
      navigation.navigate('MataPelajaranForm', { 
        mode: 'edit', 
        id: displayData.id, 
        item: mataPelajaran 
      });
    }
  }, [onEdit, mataPelajaran, navigation, displayData.id]);
  
  const handleDelete = useCallback((e) => {
    e?.stopPropagation();
    
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus mata pelajaran "${displayData.nama}"?\n\nPeringatan: Ini akan mempengaruhi semua materi yang terkait.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (onDelete) {
              onDelete(mataPelajaran);
            } else {
              await performDelete();
            }
          }
        }
      ]
    );
  }, [mataPelajaran, displayData.nama, onDelete]);
  
  const performDelete = useCallback(async () => {
    try {
      await masterDataActions.delete(ENTITIES.MATA_PELAJARAN, displayData.id);
      uiActions.setSuccess(`Mata pelajaran "${displayData.nama}" berhasil dihapus`, 'delete');
    } catch (error) {
      uiActions.setError(ENTITIES.MATA_PELAJARAN, error.message || 'Gagal menghapus mata pelajaran');
    }
  }, [masterDataActions, uiActions, displayData.id, displayData.nama]);
  
  const handleToggleStatus = useCallback(async (e) => {
    e?.stopPropagation();
    
    const newStatus = !isActive;
    const action = newStatus ? 'mengaktifkan' : 'menonaktifkan';
    
    Alert.alert(
      'Konfirmasi Status',
      `Apakah Anda yakin ingin ${action} mata pelajaran "${displayData.nama}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            if (onToggleStatus) {
              onToggleStatus(mataPelajaran, newStatus);
            } else {
              await performToggleStatus(newStatus);
            }
          }
        }
      ]
    );
  }, [isActive, displayData.nama, mataPelajaran, onToggleStatus]);
  
  const performToggleStatus = useCallback(async (newStatus) => {
    try {
      const updateData = {
        is_active: newStatus,
        status: newStatus ? 'aktif' : 'tidak_aktif'
      };
      
      await masterDataActions.update(ENTITIES.MATA_PELAJARAN, displayData.id, updateData);
      
      const statusText = newStatus ? 'diaktifkan' : 'dinonaktifkan';
      uiActions.setSuccess(`Mata pelajaran "${displayData.nama}" berhasil ${statusText}`, 'update');
    } catch (error) {
      uiActions.setError(ENTITIES.MATA_PELAJARAN, error.message || 'Gagal mengubah status mata pelajaran');
    }
  }, [masterDataActions, uiActions, displayData.id, displayData.nama]);
  
  const handleView = useCallback((e) => {
    e?.stopPropagation();
    
    if (onView) {
      onView(mataPelajaran);
    } else {
      navigation.navigate('MataPelajaranDetail', { 
        id: displayData.id, 
        item: mataPelajaran 
      });
    }
  }, [onView, mataPelajaran, navigation, displayData.id]);
  
  const handleJenjangPress = useCallback((e) => {
    e?.stopPropagation();
    
    if (displayData.jenjang) {
      navigation.navigate('JenjangDetail', {
        id: displayData.jenjang.id_jenjang,
        item: displayData.jenjang
      });
    }
  }, [displayData.jenjang, navigation]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.titleRow}>
        <View style={styles.titleContent}>
          <Text style={styles.title} numberOfLines={1}>
            {displayData.nama}
          </Text>
          <View style={styles.subtitleRow}>
            <Text style={styles.subtitle}>
              {displayData.kode}
            </Text>
            {showJenjang && displayData.jenjang && (
              <>
                <Text style={styles.subtitleSeparator}> • </Text>
                <TouchableOpacity onPress={handleJenjangPress}>
                  <Text style={styles.jenjangLink}>
                    {displayData.jenjangNama}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
        
        {/* Category Badge */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryInfo.color }]}>
          <Ionicons name={categoryInfo.icon} size={12} color="#fff" />
          <Text style={styles.categoryText}>{categoryInfo.label}</Text>
        </View>
        
        {selectable && (
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onSelect?.(mataPelajaran, !selected)}
          >
            <Ionicons
              name={selected ? "checkbox" : "square-outline"}
              size={20}
              color={selected ? "#007bff" : "#999"}
            />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Status Badge */}
      {showStatus && (
        <View style={styles.statusRow}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusText}</Text>
          </View>
        </View>
      )}
      
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
          <Ionicons name="library-outline" size={14} color="#666" />
          <Text style={styles.statText}>{displayData.totalMateri} Materi</Text>
        </View>
        
        {displayData.totalKelas > 0 && (
          <View style={styles.statItem}>
            <Ionicons name="school-outline" size={14} color="#666" />
            <Text style={styles.statText}>{displayData.totalKelas} Kelas</Text>
          </View>
        )}
        
        <View style={styles.statItem}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.statText}>
            {new Date(displayData.updatedAt).toLocaleDateString('id-ID')}
          </Text>
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
        <View style={styles.compactSubtitle}>
          <Text style={styles.compactCode}>{displayData.kode}</Text>
          <View style={[styles.compactCategory, { backgroundColor: categoryInfo.color }]}>
            <Text style={styles.compactCategoryText}>{categoryInfo.label}</Text>
          </View>
          {showJenjang && (
            <Text style={styles.compactJenjang}>{displayData.jenjangNama}</Text>
          )}
        </View>
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
  title: { fontSize: 18, fontWeight: '600', color: '#333', marginBottom: 4 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  subtitle: { fontSize: 12, color: '#666' },
  subtitleSeparator: { fontSize: 12, color: '#666' },
  jenjangLink: { fontSize: 12, color: '#007bff', fontWeight: '500' },
  description: { fontSize: 14, color: '#666', marginTop: 8, lineHeight: 18 },
  
  // Category badge
  categoryBadge: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 12, alignSelf: 'flex-start', marginLeft: 8
  },
  categoryText: { fontSize: 10, color: '#fff', fontWeight: '600', marginLeft: 4 },
  
  // Status
  statusRow: { marginTop: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  statusText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  
  // Select button
  selectButton: { marginLeft: 8 },
  
  // Statistics
  statistics: { flexDirection: 'row', marginBottom: 12, gap: 16, flexWrap: 'wrap' },
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
  compactTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  compactSubtitle: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  compactCode: { fontSize: 12, color: '#666' },
  compactCategory: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  compactCategoryText: { fontSize: 10, color: '#fff', fontWeight: '500' },
  compactJenjang: { fontSize: 11, color: '#007bff', fontWeight: '500' },
  compactStatus: { width: 8, height: 8, borderRadius: 4, marginHorizontal: 8 }
});

export default MataPelajaranCard;