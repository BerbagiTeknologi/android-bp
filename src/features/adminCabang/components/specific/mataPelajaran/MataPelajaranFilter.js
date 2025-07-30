// src/features/adminCabang/components/specific/mataPelajaran/MataPelajaranFilter.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
  TextInput, SafeAreaView, Animated, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStoreSelectors } from '../../../stores';
import CascadeDropdown from '../../shared/CascadeDropdown';
import DropdownSelector from '../../shared/DropdownSelector';
import { ENTITIES } from '../../../stores/masterDataStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * MataPelajaranFilter - Specialized filter untuk mata pelajaran data
 * Dengan kategori filtering dan jenjang dependency
 */
const MataPelajaranFilter = ({
  visible = false,
  onClose,
  onApply,
  onReset,
  initialFilters = {}
}) => {
  // ==================== ZUSTAND STORES ====================
  const cascadeActions = useStoreSelectors.cascade.actions();
  const mataPelajaranData = useStoreSelectors.masterData.entitiesArray(ENTITIES.MATA_PELAJARAN);
  const jenjangOptions = useStoreSelectors.cascade.jenjangOptions();
  
  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const kodeOptions = [...new Set(mataPelajaranData.map(mp => mp.kode_mata_pelajaran).filter(Boolean))]
      .map(kode => ({ label: kode, value: kode }));
    
    const kategoriCounts = mataPelajaranData.reduce((acc, mp) => {
      acc[mp.kategori] = (acc[mp.kategori] || 0) + 1;
      return acc;
    }, {});
    
    return { kodeOptions, kategoriCounts };
  }, [mataPelajaranData]);
  
  // ==================== LOCAL STATE ====================
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    kategori: '',
    id_jenjang: '',
    kode_mata_pelajaran: '',
    has_materi: null,
    created_after: '',
    created_before: '',
    ...initialFilters
  });
  
  const [animationValue] = useState(new Animated.Value(0));
  
  // ==================== COMPUTED VALUES ====================
  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  }, [filters]);
  
  const kategoriOptions = useMemo(() => [
    { 
      label: 'Mata Pelajaran Wajib', 
      value: 'wajib', 
      icon: 'star',
      color: '#dc3545',
      count: filterOptions.kategoriCounts.wajib || 0
    },
    { 
      label: 'Muatan Lokal', 
      value: 'muatan_lokal', 
      icon: 'location',
      color: '#fd7e14',
      count: filterOptions.kategoriCounts.muatan_lokal || 0
    },
    { 
      label: 'Pengembangan Diri', 
      value: 'pengembangan_diri', 
      icon: 'person',
      color: '#20c997',
      count: filterOptions.kategoriCounts.pengembangan_diri || 0
    },
    { 
      label: 'Mata Pelajaran Pilihan', 
      value: 'pilihan', 
      icon: 'options',
      color: '#6f42c1',
      count: filterOptions.kategoriCounts.pilihan || 0
    },
    { 
      label: 'Ekstrakurikuler', 
      value: 'ekstrakurikuler', 
      icon: 'fitness',
      color: '#0dcaf0',
      count: filterOptions.kategoriCounts.ekstrakurikuler || 0
    }
  ], [filterOptions.kategoriCounts]);
  
  const presetFilters = useMemo(() => ([
    {
      id: 'wajib_aktif',
      label: 'Wajib & Aktif',
      description: 'Mata pelajaran wajib yang aktif',
      filters: { kategori: 'wajib', status: 'aktif' }
    },
    {
      id: 'muatan_lokal',
      label: 'Muatan Lokal',
      description: 'Semua mata pelajaran muatan lokal',
      filters: { kategori: 'muatan_lokal' }
    },
    {
      id: 'ada_materi',
      label: 'Ada Materi',
      description: 'Mata pelajaran yang memiliki materi',
      filters: { has_materi: true }
    },
    {
      id: 'tanpa_jenjang',
      label: 'Semua Jenjang',
      description: 'Mata pelajaran untuk semua jenjang',
      filters: { id_jenjang: 'null' }
    },
    {
      id: 'pilihan_ekstrakurikuler',
      label: 'Pilihan & Ekskul',
      description: 'Mata pelajaran pilihan dan ekstrakurikuler',
      filters: { kategori: ['pilihan', 'ekstrakurikuler'] }
    }
  ]), []);
  
  // ==================== EFFECTS ====================
  React.useEffect(() => {
    if (visible) {
      Animated.timing(animationValue, {
        toValue: 1, duration: 300, useNativeDriver: true
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0, duration: 250, useNativeDriver: true
      }).start();
    }
  }, [visible, animationValue]);
  
  // ==================== HANDLERS ====================
  const handleFilterChange = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const handlePresetSelect = useCallback((preset) => {
    setFilters(prev => ({ ...prev, ...preset.filters }));
  }, []);
  
  const handleApply = useCallback(() => {
    // Clean up empty filters
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});
    
    onApply?.(cleanFilters);
    onClose?.();
  }, [filters, onApply, onClose]);
  
  const handleReset = useCallback(() => {
    const resetFilters = {
      search: '', status: '', kategori: '', id_jenjang: '',
      kode_mata_pelajaran: '', has_materi: null, created_after: '', created_before: ''
    };
    setFilters(resetFilters);
    onReset?.(resetFilters);
  }, [onReset]);
  
  const handleQuickFilter = useCallback((key, value) => {
    const quickFilters = { ...filters, [key]: value };
    onApply?.(quickFilters);
    onClose?.();
  }, [filters, onApply, onClose]);
  
  // ==================== RENDER FUNCTIONS ====================
  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.headerButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        Filter Mata Pelajaran
        {activeFiltersCount > 0 && (
          <Text style={styles.filterCount}> ({activeFiltersCount})</Text>
        )}
      </Text>
      
      {activeFiltersCount > 0 && (
        <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderKategoriQuickFilters = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filter Kategori</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.kategoriFilters}>
          {kategoriOptions.map((kategori) => (
            <TouchableOpacity
              key={kategori.value}
              style={[
                styles.kategoriFilter,
                filters.kategori === kategori.value && styles.kategoriFilterActive,
                { borderColor: kategori.color }
              ]}
              onPress={() => handleQuickFilter('kategori', kategori.value)}
            >
              <Ionicons 
                name={kategori.icon} 
                size={16} 
                color={filters.kategori === kategori.value ? '#fff' : kategori.color} 
              />
              <Text style={[
                styles.kategoriFilterText,
                filters.kategori === kategori.value && { color: '#fff' }
              ]}>
                {kategori.label}
              </Text>
              <View style={[styles.kategoriBadge, { backgroundColor: kategori.color }]}>
                <Text style={styles.kategoriBadgeText}>{kategori.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
  
  const renderQuickFilters = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filter Cepat</Text>
      <View style={styles.quickFilters}>
        <TouchableOpacity
          style={[styles.quickFilter, filters.status === 'aktif' && styles.quickFilterActive]}
          onPress={() => handleQuickFilter('status', 'aktif')}
        >
          <Ionicons name="checkmark-circle" size={16} color={filters.status === 'aktif' ? '#fff' : '#28a745'} />
          <Text style={[styles.quickFilterText, filters.status === 'aktif' && styles.quickFilterTextActive]}>
            Aktif
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickFilter, filters.status === 'tidak_aktif' && styles.quickFilterActive]}
          onPress={() => handleQuickFilter('status', 'tidak_aktif')}
        >
          <Ionicons name="close-circle" size={16} color={filters.status === 'tidak_aktif' ? '#fff' : '#dc3545'} />
          <Text style={[styles.quickFilterText, filters.status === 'tidak_aktif' && styles.quickFilterTextActive]}>
            Tidak Aktif
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickFilter, filters.has_materi === true && styles.quickFilterActive]}
          onPress={() => handleQuickFilter('has_materi', true)}
        >
          <Ionicons name="library" size={16} color={filters.has_materi === true ? '#fff' : '#007bff'} />
          <Text style={[styles.quickFilterText, filters.has_materi === true && styles.quickFilterTextActive]}>
            Ada Materi
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.quickFilter, filters.id_jenjang === 'null' && styles.quickFilterActive]}
          onPress={() => handleQuickFilter('id_jenjang', 'null')}
        >
          <Ionicons name="infinite" size={16} color={filters.id_jenjang === 'null' ? '#fff' : '#6f42c1'} />
          <Text style={[styles.quickFilterText, filters.id_jenjang === 'null' && styles.quickFilterTextActive]}>
            Semua Jenjang
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  const renderPresets = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Preset Filter</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.presets}>
          {presetFilters.map((preset) => (
            <TouchableOpacity
              key={preset.id}
              style={styles.preset}
              onPress={() => handlePresetSelect(preset)}
            >
              <Text style={styles.presetLabel}>{preset.label}</Text>
              <Text style={styles.presetDescription}>{preset.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
  
  const renderBasicFilters = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filter Dasar</Text>
      
      {/* Search */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Pencarian</Text>
        <TextInput
          style={styles.textInput}
          value={filters.search}
          onChangeText={(value) => handleFilterChange('search', value)}
          placeholder="Cari nama atau kode mata pelajaran..."
          placeholderTextColor="#999"
        />
      </View>
      
      {/* Jenjang */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Jenjang</Text>
        <CascadeDropdown
          entityType={ENTITIES.JENJANG}
          value={filters.id_jenjang}
          onValueChange={(value) => handleFilterChange('id_jenjang', value)}
          placeholder="Semua Jenjang"
          style={styles.dropdown}
          allowClear
        />
      </View>
      
      {/* Status */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Status</Text>
        <DropdownSelector
          options={[
            { label: 'Semua Status', value: '' },
            { label: 'Aktif', value: 'aktif' },
            { label: 'Tidak Aktif', value: 'tidak_aktif' }
          ]}
          value={filters.status}
          onValueChange={(value) => handleFilterChange('status', value)}
          placeholder="Status"
          style={styles.dropdown}
        />
      </View>
      
      {/* Kategori */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Kategori</Text>
        <DropdownSelector
          options={[
            { label: 'Semua Kategori', value: '' },
            ...kategoriOptions.map(k => ({ label: k.label, value: k.value }))
          ]}
          value={filters.kategori}
          onValueChange={(value) => handleFilterChange('kategori', value)}
          placeholder="Kategori"
          style={styles.dropdown}
        />
      </View>
      
      {/* Kode Mata Pelajaran */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Kode Mata Pelajaran</Text>
        <DropdownSelector
          options={[
            { label: 'Semua Kode', value: '' },
            ...filterOptions.kodeOptions
          ]}
          value={filters.kode_mata_pelajaran}
          onValueChange={(value) => handleFilterChange('kode_mata_pelajaran', value)}
          placeholder="Pilih Kode"
          style={styles.dropdown}
        />
      </View>
    </View>
  );
  
  const renderAdvancedFilters = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filter Lanjutan</Text>
      
      {/* Boolean Filters */}
      <View style={styles.booleanFilters}>
        <View style={styles.booleanFilter}>
          <View>
            <Text style={styles.booleanLabel}>Memiliki Materi</Text>
            <Text style={styles.booleanDescription}>Filter mata pelajaran yang memiliki materi</Text>
          </View>
          <View style={styles.booleanControls}>
            <TouchableOpacity
              style={[styles.booleanButton, filters.has_materi === true && styles.booleanButtonActive]}
              onPress={() => handleFilterChange('has_materi', filters.has_materi === true ? null : true)}
            >
              <Text style={[styles.booleanButtonText, filters.has_materi === true && styles.booleanButtonTextActive]}>
                Ya
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.booleanButton, filters.has_materi === false && styles.booleanButtonActive]}
              onPress={() => handleFilterChange('has_materi', filters.has_materi === false ? null : false)}
            >
              <Text style={[styles.booleanButtonText, filters.has_materi === false && styles.booleanButtonTextActive]}>
                Tidak
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Statistics Info */}
      <View style={styles.statisticsInfo}>
        <Text style={styles.statisticsTitle}>Statistik Mata Pelajaran</Text>
        <View style={styles.statisticsGrid}>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsValue}>{mataPelajaranData.length}</Text>
            <Text style={styles.statisticsLabel}>Total</Text>
          </View>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsValue}>
              {mataPelajaranData.filter(mp => mp.is_active !== false).length}
            </Text>
            <Text style={styles.statisticsLabel}>Aktif</Text>
          </View>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsValue}>
              {mataPelajaranData.filter(mp => mp.kategori === 'wajib').length}
            </Text>
            <Text style={styles.statisticsLabel}>Wajib</Text>
          </View>
          <View style={styles.statisticsItem}>
            <Text style={styles.statisticsValue}>
              {mataPelajaranData.filter(mp => !mp.id_jenjang).length}
            </Text>
            <Text style={styles.statisticsLabel}>Semua Jenjang</Text>
          </View>
        </View>
      </View>
    </View>
  );
  
  const renderFooter = () => (
    <View style={styles.footer}>
      <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={onClose}>
        <Text style={[styles.buttonText, styles.secondaryButtonText]}>Batal</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleApply}>
        <Text style={styles.buttonText}>
          Terapkan {activeFiltersCount > 0 && `(${activeFiltersCount})`}
        </Text>
      </TouchableOpacity>
    </View>
  );
  
  // ==================== RENDER ====================
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            {
              opacity: animationValue,
              transform: [{
                translateY: animationValue.interpolate({
                  inputRange: [0, 1], outputRange: [600, 0]
                })
              }]
            }
          ]}
        >
          <SafeAreaView style={styles.container}>
            {renderHeader()}
            
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              {renderKategoriQuickFilters()}
              {renderQuickFilters()}
              {renderPresets()}
              {renderBasicFilters()}
              {renderAdvancedFilters()}
            </ScrollView>
            
            {renderFooter()}
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '90%', width: SCREEN_WIDTH
  },
  container: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  headerButton: { padding: 4, minWidth: 60, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' },
  filterCount: { fontSize: 14, color: '#007bff' },
  resetText: { fontSize: 16, color: '#dc3545', fontWeight: '600' },
  
  // Content
  content: { flex: 1, padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  
  // Kategori filters
  kategoriFilters: { flexDirection: 'row', gap: 12 },
  kategoriFilter: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f8f9fa', borderWidth: 2, minWidth: 140
  },
  kategoriFilterActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  kategoriFilterText: { marginLeft: 6, fontSize: 12, color: '#666', flex: 1 },
  kategoriBadge: { marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10 },
  kategoriBadgeText: { fontSize: 10, color: '#fff', fontWeight: '600' },
  
  // Quick filters
  quickFilters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickFilter: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6'
  },
  quickFilterActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  quickFilterText: { marginLeft: 6, fontSize: 12, color: '#666' },
  quickFilterTextActive: { color: '#fff' },
  
  // Presets
  presets: { flexDirection: 'row', gap: 12 },
  preset: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', minWidth: 120
  },
  presetLabel: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  presetDescription: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 2 },
  
  // Filter items
  filterItem: { marginBottom: 16 },
  filterLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  textInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 10, fontSize: 14, backgroundColor: '#fff'
  },
  dropdown: { borderRadius: 8 },
  
  // Boolean filters
  booleanFilters: { gap: 16 },
  booleanFilter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  booleanLabel: { fontSize: 14, fontWeight: '500', color: '#333' },
  booleanDescription: { fontSize: 12, color: '#666', marginTop: 2 },
  booleanControls: { flexDirection: 'row', gap: 8 },
  booleanButton: {
    paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16,
    backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6'
  },
  booleanButtonActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  booleanButtonText: { fontSize: 12, color: '#666' },
  booleanButtonTextActive: { color: '#fff' },
  
  // Statistics
  statisticsInfo: {
    backgroundColor: '#f8f9fa', padding: 16, borderRadius: 8,
    borderWidth: 1, borderColor: '#dee2e6', marginTop: 16
  },
  statisticsTitle: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 12, textAlign: 'center' },
  statisticsGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  statisticsItem: { alignItems: 'center' },
  statisticsValue: { fontSize: 20, fontWeight: '700', color: '#007bff' },
  statisticsLabel: { fontSize: 12, color: '#666', marginTop: 4 },
  
  // Footer
  footer: { flexDirection: 'row', gap: 12, padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  button: {
    flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
    justifyContent: 'center', minHeight: 44
  },
  primaryButton: { backgroundColor: '#007bff' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#dee2e6' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryButtonText: { color: '#666' }
});

export default MataPelajaranFilter;