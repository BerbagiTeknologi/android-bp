// src/features/adminCabang/components/base/BaseFilterModal.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, Modal, ScrollView, StyleSheet,
  Animated, Dimensions, Switch, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStoreSelectors } from '../../stores';
import CascadeDropdown from '../shared/CascadeDropdown';
import DropdownSelector from '../shared/DropdownSelector';
import SearchBar from '../shared/SearchBar';
import { ENTITIES } from '../../stores/masterDataStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * BaseFilterModal - Comprehensive filtering interface dengan cascade logic
 * Supports multiple filter types, presets, dan advanced filtering options
 */
const BaseFilterModal = ({
  // Core props
  visible = false,
  onClose,
  onApply,
  onReset,
  
  // Entity config
  entityType,
  enableCascadeFilters = true,
  enableSearch = true,
  enablePresets = true,
  enableAdvanced = false,
  
  // Filter config
  customFilters = [], // Array of custom filter configs
  filterPresets = [], // Array of preset filter combinations
  defaultFilters = {},
  
  // UI config
  title = 'Filter',
  showAppliedCount = true,
  showResetButton = true,
  allowQuickActions = true,
  
  // Events
  onFilterChange,
  onPresetSelect,
  onAdvancedToggle,
  
  // Styles
  modalStyle,
  contentStyle,
  headerStyle,
  footerStyle
}) => {
  // ==================== ZUSTAND STORES ====================
  const cascadeActions = useStoreSelectors.cascade.actions();
  const uiActions = useStoreSelectors.ui.actions();
  
  const cascadeFilters = useStoreSelectors.cascade.filters();
  const cascadeSelected = useStoreSelectors.cascade.selected();
  const validation = useStoreSelectors.cascade.validation();
  
  // ==================== LOCAL STATE ====================
  const [localFilters, setLocalFilters] = useState({});
  const [tempFilters, setTempFilters] = useState({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [animationValue] = useState(new Animated.Value(0));
  
  // ==================== COMPUTED VALUES ====================
  
  // Merge all filter sources
  const allFilters = useMemo(() => {
    return {
      ...defaultFilters,
      ...cascadeFilters,
      ...localFilters,
      ...tempFilters
    };
  }, [defaultFilters, cascadeFilters, localFilters, tempFilters]);
  
  // Count active filters
  const activeFiltersCount = useMemo(() => {
    return Object.values(allFilters).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
  }, [allFilters]);
  
  // Check if current filters match any preset
  const currentPreset = useMemo(() => {
    return filterPresets.find(preset => {
      return Object.entries(preset.filters).every(([key, value]) => 
        allFilters[key] === value
      );
    });
  }, [filterPresets, allFilters]);
  
  // Get status options based on entity type
  const getStatusOptions = useCallback(() => {
    const base = [
      { label: 'Semua Status', value: '' },
      { label: 'Aktif', value: 'aktif' },
      { label: 'Tidak Aktif', value: 'tidak_aktif' }
    ];
    
    if (entityType === ENTITIES.KURIKULUM) {
      return [
        { label: 'Semua Status', value: '' },
        { label: 'Draft', value: 'draft' },
        { label: 'Review', value: 'review' },
        { label: 'Approved', value: 'approved' },
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' }
      ];
    }
    
    return base;
  }, [entityType]);
  
  // Get kategori options for mata pelajaran
  const getKategoriOptions = useCallback(() => [
    { label: 'Semua Kategori', value: '' },
    { label: 'Mata Pelajaran Wajib', value: 'wajib' },
    { label: 'Muatan Lokal', value: 'muatan_lokal' },
    { label: 'Pengembangan Diri', value: 'pengembangan_diri' },
    { label: 'Mata Pelajaran Pilihan', value: 'pilihan' },
    { label: 'Ekstrakurikuler', value: 'ekstrakurikuler' }
  ], []);
  
  // ==================== EFFECTS ====================
  
  // Initialize filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters({ ...cascadeFilters });
      setTempFilters({});
      
      Animated.timing(animationValue, {
        toValue: 1, duration: 300, useNativeDriver: true
      }).start();
    } else {
      Animated.timing(animationValue, {
        toValue: 0, duration: 250, useNativeDriver: true
      }).start();
    }
  }, [visible, cascadeFilters, animationValue]);
  
  // ==================== HANDLERS ====================
  
  const handleFilterChange = useCallback((key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
    onFilterChange?.(key, value);
  }, [onFilterChange]);
  
  const handleCascadeChange = useCallback((type, value) => {
    // Update cascade store immediately for dependency handling
    cascadeActions.setFilter(type, value);
    
    // Also update temp filters for immediate UI feedback
    setTempFilters(prev => ({ ...prev, [type]: value }));
  }, [cascadeActions]);
  
  const handlePresetSelect = useCallback((preset) => {
    setSelectedPreset(preset.id);
    setTempFilters(preset.filters);
    
    // Apply preset to cascade if needed
    if (enableCascadeFilters) {
      Object.entries(preset.filters).forEach(([key, value]) => {
        if (['jenjang', 'mataPelajaran', 'kelas', 'search'].includes(key)) {
          cascadeActions.setFilter(key, value);
        }
      });
    }
    
    onPresetSelect?.(preset);
  }, [enableCascadeFilters, cascadeActions, onPresetSelect]);
  
  const handleApply = useCallback(() => {
    // Merge temp filters with current filters
    const finalFilters = { ...allFilters, ...tempFilters };
    
    // Apply to cascade store
    if (enableCascadeFilters) {
      Object.entries(finalFilters).forEach(([key, value]) => {
        cascadeActions.setFilter(key, value);
      });
    }
    
    // Update local filters
    setLocalFilters(finalFilters);
    
    // Call external handler
    onApply?.(finalFilters);
    
    // Close modal
    onClose?.();
  }, [allFilters, tempFilters, enableCascadeFilters, cascadeActions, onApply, onClose]);
  
  const handleReset = useCallback(() => {
    // Clear all filters
    setLocalFilters({});
    setTempFilters({});
    setSelectedPreset(null);
    
    // Reset cascade store
    if (enableCascadeFilters) {
      cascadeActions.clearFilters();
    }
    
    // Call external handler
    onReset?.();
  }, [enableCascadeFilters, cascadeActions, onReset]);
  
  const handleQuickFilter = useCallback((key, value) => {
    handleFilterChange(key, value);
    
    // Apply immediately for quick actions
    const quickFilters = { ...allFilters, [key]: value };
    onApply?.(quickFilters);
    onClose?.();
  }, [allFilters, handleFilterChange, onApply, onClose]);
  
  const handleAdvancedToggle = useCallback(() => {
    setShowAdvanced(!showAdvanced);
    onAdvancedToggle?.(!showAdvanced);
  }, [showAdvanced, onAdvancedToggle]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderHeader = () => (
    <View style={[styles.header, headerStyle]}>
      <TouchableOpacity style={styles.headerButton} onPress={onClose}>
        <Ionicons name="close" size={24} color="#666" />
      </TouchableOpacity>
      
      <Text style={styles.headerTitle}>
        {title}
        {showAppliedCount && activeFiltersCount > 0 && (
          <Text style={styles.filterCount}> ({activeFiltersCount})</Text>
        )}
      </Text>
      
      {showResetButton && activeFiltersCount > 0 && (
        <TouchableOpacity style={styles.headerButton} onPress={handleReset}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  const renderQuickActions = () => {
    if (!allowQuickActions) return null;
    
    const quickFilters = [
      { label: 'Aktif', key: 'status', value: 'aktif', icon: 'checkmark-circle' },
      { label: 'Tidak Aktif', key: 'status', value: 'tidak_aktif', icon: 'close-circle' },
    ];
    
    if (entityType === ENTITIES.MATA_PELAJARAN) {
      quickFilters.push(
        { label: 'Wajib', key: 'kategori', value: 'wajib', icon: 'star' },
        { label: 'Pilihan', key: 'kategori', value: 'pilihan', icon: 'options' }
      );
    }
    
    return (
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Filter Cepat</Text>
        <View style={styles.quickActionButtons}>
          {quickFilters.map((filter, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickActionButton,
                allFilters[filter.key] === filter.value && styles.quickActionButtonActive
              ]}
              onPress={() => handleQuickFilter(filter.key, filter.value)}
            >
              <Ionicons 
                name={filter.icon} 
                size={16} 
                color={allFilters[filter.key] === filter.value ? '#fff' : '#666'} 
              />
              <Text style={[
                styles.quickActionText,
                allFilters[filter.key] === filter.value && styles.quickActionTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };
  
  const renderPresets = () => {
    if (!enablePresets || filterPresets.length === 0) return null;
    
    return (
      <View style={styles.presets}>
        <Text style={styles.sectionTitle}>Preset Filter</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.presetButtons}>
            {filterPresets.map((preset) => (
              <TouchableOpacity
                key={preset.id}
                style={[
                  styles.presetButton,
                  (selectedPreset === preset.id || currentPreset?.id === preset.id) && 
                  styles.presetButtonActive
                ]}
                onPress={() => handlePresetSelect(preset)}
              >
                <Text style={[
                  styles.presetText,
                  (selectedPreset === preset.id || currentPreset?.id === preset.id) && 
                  styles.presetTextActive
                ]}>
                  {preset.label}
                </Text>
                {preset.description && (
                  <Text style={styles.presetDescription}>{preset.description}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  };
  
  const renderCascadeFilters = () => {
    if (!enableCascadeFilters) return null;
    
    return (
      <View style={styles.cascadeFilters}>
        <Text style={styles.sectionTitle}>Filter Hierarki</Text>
        
        <CascadeDropdown
          entityType={ENTITIES.JENJANG}
          value={allFilters.jenjang}
          onValueChange={(value) => handleCascadeChange('jenjang', value)}
          placeholder="Semua Jenjang"
          style={styles.filterDropdown}
          allowClear
        />
        
        <CascadeDropdown
          entityType={ENTITIES.MATA_PELAJARAN}
          value={allFilters.mataPelajaran}
          onValueChange={(value) => handleCascadeChange('mataPelajaran', value)}
          dependsOn={{ jenjang: allFilters.jenjang }}
          placeholder="Semua Mata Pelajaran"
          style={styles.filterDropdown}
          allowClear
        />
        
        <CascadeDropdown
          entityType={ENTITIES.KELAS}
          value={allFilters.kelas}
          onValueChange={(value) => handleCascadeChange('kelas', value)}
          dependsOn={{ jenjang: allFilters.jenjang }}
          placeholder="Semua Kelas"
          style={styles.filterDropdown}
          allowClear
        />
        
        {/* Validation errors */}
        {!validation.isValidMataPelajaran && (
          <Text style={styles.validationError}>{validation.errors.mataPelajaran}</Text>
        )}
        {!validation.isValidKelas && (
          <Text style={styles.validationError}>{validation.errors.kelas}</Text>
        )}
      </View>
    );
  };
  
  const renderBasicFilters = () => (
    <View style={styles.basicFilters}>
      <Text style={styles.sectionTitle}>Filter Dasar</Text>
      
      {/* Status Filter */}
      <DropdownSelector
        options={getStatusOptions()}
        value={allFilters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
        placeholder="Status"
        style={styles.filterDropdown}
      />
      
      {/* Kategori Filter (for Mata Pelajaran) */}
      {entityType === ENTITIES.MATA_PELAJARAN && (
        <DropdownSelector
          options={getKategoriOptions()}
          value={allFilters.kategori}
          onValueChange={(value) => handleFilterChange('kategori', value)}
          placeholder="Kategori"
          style={styles.filterDropdown}
        />
      )}
      
      {/* Search */}
      {enableSearch && (
        <SearchBar
          value={allFilters.search}
          onValueChange={(value) => handleFilterChange('search', value)}
          placeholder="Cari..."
          showHistory={false}
          style={styles.searchFilter}
        />
      )}
    </View>
  );
  
  const renderCustomFilters = () => {
    if (customFilters.length === 0) return null;
    
    return (
      <View style={styles.customFilters}>
        <Text style={styles.sectionTitle}>Filter Tambahan</Text>
        
        {customFilters.map((filter, index) => (
          <View key={index} style={styles.customFilterItem}>
            {filter.component ? (
              <filter.component
                value={allFilters[filter.key]}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
                {...filter.props}
              />
            ) : (
              <DropdownSelector
                options={filter.options || []}
                value={allFilters[filter.key]}
                onValueChange={(value) => handleFilterChange(filter.key, value)}
                placeholder={filter.placeholder || filter.label}
                style={styles.filterDropdown}
              />
            )}
          </View>
        ))}
      </View>
    );
  };
  
  const renderAdvancedFilters = () => {
    if (!enableAdvanced || !showAdvanced) return null;
    
    return (
      <View style={styles.advancedFilters}>
        <Text style={styles.sectionTitle}>Filter Lanjutan</Text>
        
        {/* Date range filters */}
        <View style={styles.dateRangeFilter}>
          <Text style={styles.filterLabel}>Rentang Tanggal</Text>
          <View style={styles.dateInputs}>
            <Text style={styles.dateInputPlaceholder}>Dari: [Date Picker]</Text>
            <Text style={styles.dateInputPlaceholder}>Sampai: [Date Picker]</Text>
          </View>
        </View>
        
        {/* Boolean filters */}
        <View style={styles.booleanFilters}>
          <View style={styles.booleanFilter}>
            <Text style={styles.filterLabel}>Hanya data terbaru</Text>
            <Switch
              value={allFilters.isLatest || false}
              onValueChange={(value) => handleFilterChange('isLatest', value)}
            />
          </View>
          
          <View style={styles.booleanFilter}>
            <Text style={styles.filterLabel}>Dengan relasi</Text>
            <Switch
              value={allFilters.withRelations || false}
              onValueChange={(value) => handleFilterChange('withRelations', value)}
            />
          </View>
        </View>
      </View>
    );
  };
  
  const renderFooter = () => (
    <View style={[styles.footer, footerStyle]}>
      {enableAdvanced && (
        <TouchableOpacity
          style={styles.advancedToggle}
          onPress={handleAdvancedToggle}
        >
          <Ionicons 
            name={showAdvanced ? 'chevron-up' : 'chevron-down'} 
            size={16} 
            color="#007bff" 
          />
          <Text style={styles.advancedToggleText}>
            {showAdvanced ? 'Sembunyikan' : 'Tampilkan'} Filter Lanjutan
          </Text>
        </TouchableOpacity>
      )}
      
      <View style={styles.footerActions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={onClose}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Batal
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleApply}
        >
          <Text style={styles.buttonText}>
            Terapkan {activeFiltersCount > 0 && `(${activeFiltersCount})`}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
  
  // ==================== RENDER ====================
  
  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.modal,
            modalStyle,
            {
              opacity: animationValue,
              transform: [{
                translateY: animationValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [SCREEN_HEIGHT, 0]
                })
              }]
            }
          ]}
        >
          <SafeAreaView style={styles.safeArea}>
            {renderHeader()}
            
            <ScrollView
              style={[styles.content, contentStyle]}
              showsVerticalScrollIndicator={false}
            >
              {renderQuickActions()}
              {renderPresets()}
              {renderCascadeFilters()}
              {renderBasicFilters()}
              {renderCustomFilters()}
              {renderAdvancedFilters()}
              
              <View style={styles.bottomSpacer} />
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
    maxHeight: SCREEN_HEIGHT * 0.9, width: SCREEN_WIDTH
  },
  safeArea: { flex: 1 },
  
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
  sectionTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 12 },
  
  // Quick actions
  quickActions: { marginBottom: 24 },
  quickActionButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickActionButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6'
  },
  quickActionButtonActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  quickActionText: { marginLeft: 6, fontSize: 12, color: '#666' },
  quickActionTextActive: { color: '#fff' },
  
  // Presets
  presets: { marginBottom: 24 },
  presetButtons: { flexDirection: 'row', gap: 12 },
  presetButton: {
    paddingHorizontal: 16, paddingVertical: 12, borderRadius: 8,
    backgroundColor: '#f8f9fa', borderWidth: 1, borderColor: '#dee2e6', minWidth: 120
  },
  presetButtonActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  presetText: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' },
  presetTextActive: { color: '#fff' },
  presetDescription: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 2 },
  
  // Filters
  cascadeFilters: { marginBottom: 24 },
  basicFilters: { marginBottom: 24 },
  customFilters: { marginBottom: 24 },
  advancedFilters: { marginBottom: 24 },
  filterDropdown: { marginBottom: 12 },
  searchFilter: { marginBottom: 12 },
  customFilterItem: { marginBottom: 12 },
  validationError: { fontSize: 12, color: '#dc3545', marginTop: 4 },
  
  // Advanced filters
  dateRangeFilter: { marginBottom: 16 },
  filterLabel: { fontSize: 14, fontWeight: '500', color: '#333', marginBottom: 8 },
  dateInputs: { gap: 8 },
  dateInputPlaceholder: { fontSize: 14, color: '#999', fontStyle: 'italic' },
  booleanFilters: { gap: 12 },
  booleanFilter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  
  // Footer
  footer: { padding: 20, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  advancedToggle: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, paddingVertical: 8
  },
  advancedToggleText: { marginLeft: 6, fontSize: 14, color: '#007bff' },
  footerActions: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
    justifyContent: 'center', minHeight: 44
  },
  primaryButton: { backgroundColor: '#007bff' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#dee2e6' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryButtonText: { color: '#666' },
  
  bottomSpacer: { height: 20 }
});

export default BaseFilterModal;