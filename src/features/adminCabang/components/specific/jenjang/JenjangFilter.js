// src/features/adminCabang/components/specific/jenjang/JenjangFilter.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView,
  TextInput, Switch, SafeAreaView, Animated, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStoreSelectors } from '../../../stores';
import DropdownSelector from '../../shared/DropdownSelector';
import { ENTITIES } from '../../../stores/masterDataStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * JenjangFilter - Specialized filter untuk jenjang data
 * Dengan filter criteria spesifik untuk jenjang
 */
const JenjangFilter = ({
  visible = false,
  onClose,
  onApply,
  onReset,
  initialFilters = {}
}) => {
  // ==================== ZUSTAND STORES ====================
  const cascadeActions = useStoreSelectors.cascade.actions();
  const jenjangData = useStoreSelectors.masterData.entitiesArray(ENTITIES.JENJANG);
  
  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    const kodeOptions = [...new Set(jenjangData.map(j => j.kode_jenjang).filter(Boolean))]
      .map(kode => ({ label: kode, value: kode }));
    
    const urutanOptions = [...new Set(jenjangData.map(j => j.urutan).filter(Boolean))]
      .sort((a, b) => a - b)
      .map(urutan => ({ label: `Urutan ${urutan}`, value: urutan }));
    
    return { kodeOptions, urutanOptions };
  }, [jenjangData]);
  
  // ==================== LOCAL STATE ====================
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    kode_jenjang: '',
    urutan_min: '',
    urutan_max: '',
    has_mata_pelajaran: null,
    has_kelas: null,
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
  
  const presetFilters = useMemo(() => ([
    {
      id: 'aktif',
      label: 'Aktif',
      description: 'Jenjang yang sedang aktif',
      filters: { status: 'aktif' }
    },
    {
      id: 'tidak_aktif',
      label: 'Tidak Aktif',
      description: 'Jenjang yang dinonaktifkan',
      filters: { status: 'tidak_aktif' }
    },
    {
      id: 'ada_mapel',
      label: 'Ada Mata Pelajaran',
      description: 'Jenjang yang memiliki mata pelajaran',
      filters: { has_mata_pelajaran: true }
    },
    {
      id: 'ada_kelas',
      label: 'Ada Kelas',
      description: 'Jenjang yang memiliki kelas',
      filters: { has_kelas: true }
    },
    {
      id: 'urutan_rendah',
      label: 'Urutan 1-5',
      description: 'Jenjang dengan urutan rendah',
      filters: { urutan_min: '1', urutan_max: '5' }
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
      search: '', status: '', kode_jenjang: '', urutan_min: '', urutan_max: '',
      has_mata_pelajaran: null, has_kelas: null, created_after: '', created_before: ''
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
        Filter Jenjang
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
          style={[styles.quickFilter, filters.has_mata_pelajaran === true && styles.quickFilterActive]}
          onPress={() => handleQuickFilter('has_mata_pelajaran', true)}
        >
          <Ionicons name="book" size={16} color={filters.has_mata_pelajaran === true ? '#fff' : '#007bff'} />
          <Text style={[styles.quickFilterText, filters.has_mata_pelajaran === true && styles.quickFilterTextActive]}>
            Ada Mapel
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
          placeholder="Cari nama atau kode jenjang..."
          placeholderTextColor="#999"
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
          placeholder="Pilih Status"
          style={styles.dropdown}
        />
      </View>
      
      {/* Kode Jenjang */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Kode Jenjang</Text>
        <DropdownSelector
          options={[
            { label: 'Semua Kode', value: '' },
            ...filterOptions.kodeOptions
          ]}
          value={filters.kode_jenjang}
          onValueChange={(value) => handleFilterChange('kode_jenjang', value)}
          placeholder="Pilih Kode"
          style={styles.dropdown}
        />
      </View>
    </View>
  );
  
  const renderAdvancedFilters = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Filter Lanjutan</Text>
      
      {/* Urutan Range */}
      <View style={styles.filterItem}>
        <Text style={styles.filterLabel}>Rentang Urutan</Text>
        <View style={styles.rangeInputs}>
          <TextInput
            style={[styles.textInput, styles.rangeInput]}
            value={filters.urutan_min}
            onChangeText={(value) => handleFilterChange('urutan_min', value.replace(/[^0-9]/g, ''))}
            placeholder="Min"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
          <Text style={styles.rangeSeparator}>-</Text>
          <TextInput
            style={[styles.textInput, styles.rangeInput]}
            value={filters.urutan_max}
            onChangeText={(value) => handleFilterChange('urutan_max', value.replace(/[^0-9]/g, ''))}
            placeholder="Max"
            keyboardType="numeric"
            placeholderTextColor="#999"
          />
        </View>
      </View>
      
      {/* Boolean Filters */}
      <View style={styles.booleanFilters}>
        <View style={styles.booleanFilter}>
          <View>
            <Text style={styles.booleanLabel}>Memiliki Mata Pelajaran</Text>
            <Text style={styles.booleanDescription}>Filter jenjang yang memiliki mata pelajaran</Text>
          </View>
          <View style={styles.booleanControls}>
            <TouchableOpacity
              style={[styles.booleanButton, filters.has_mata_pelajaran === true && styles.booleanButtonActive]}
              onPress={() => handleFilterChange('has_mata_pelajaran', filters.has_mata_pelajaran === true ? null : true)}
            >
              <Text style={[styles.booleanButtonText, filters.has_mata_pelajaran === true && styles.booleanButtonTextActive]}>
                Ya
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.booleanButton, filters.has_mata_pelajaran === false && styles.booleanButtonActive]}
              onPress={() => handleFilterChange('has_mata_pelajaran', filters.has_mata_pelajaran === false ? null : false)}
            >
              <Text style={[styles.booleanButtonText, filters.has_mata_pelajaran === false && styles.booleanButtonTextActive]}>
                Tidak
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.booleanFilter}>
          <View>
            <Text style={styles.booleanLabel}>Memiliki Kelas</Text>
            <Text style={styles.booleanDescription}>Filter jenjang yang memiliki kelas</Text>
          </View>
          <View style={styles.booleanControls}>
            <TouchableOpacity
              style={[styles.booleanButton, filters.has_kelas === true && styles.booleanButtonActive]}
              onPress={() => handleFilterChange('has_kelas', filters.has_kelas === true ? null : true)}
            >
              <Text style={[styles.booleanButtonText, filters.has_kelas === true && styles.booleanButtonTextActive]}>
                Ya
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.booleanButton, filters.has_kelas === false && styles.booleanButtonActive]}
              onPress={() => handleFilterChange('has_kelas', filters.has_kelas === false ? null : false)}
            >
              <Text style={[styles.booleanButtonText, filters.has_kelas === false && styles.booleanButtonTextActive]}>
                Tidak
              </Text>
            </TouchableOpacity>
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
  
  // Range inputs
  rangeInputs: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rangeInput: { flex: 1 },
  rangeSeparator: { fontSize: 16, color: '#666', fontWeight: '600' },
  
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

export default JenjangFilter;