// src/features/adminCabang/components/base/BaseListScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, FlatList, TouchableOpacity, StyleSheet, SafeAreaView,
  RefreshControl, ActivityIndicator, Text
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStoreSelectors } from '../../stores';
import SearchBar from '../shared/SearchBar';
import CascadeDropdown from '../shared/CascadeDropdown';
import DropdownSelector from '../shared/DropdownSelector';
import { ENTITIES } from '../../stores/masterDataStore';

/**
 * BaseListScreen - Specialized untuk list rendering dengan filter integration
 * Focus pada filtering, searching, sorting dengan Zustand
 */
const BaseListScreen = ({
  // Core props
  entityType,
  title = 'List Data',
  
  // Data & rendering
  renderItem,
  renderEmptyState,
  renderLoadingState,
  
  // Filtering
  enableFilters = true,
  enableSearch = true,
  enableSort = true,
  cascadeFilters = false, // Use cascade filters for dependent data
  
  // Filter config
  filterConfig = {},
  sortOptions = [],
  
  // List config
  numColumns = 1,
  horizontal = false,
  
  // Performance
  virtualizeList = true,
  initialNumToRender = 15,
  windowSize = 10,
  
  // Events
  onItemPress,
  onFilterChange,
  onSortChange,
  onRefresh,
  
  // Custom components
  HeaderComponent,
  FooterComponent,
  
  // Styles
  containerStyle,
  listStyle,
  headerStyle,
  filterStyle
}) => {
  // ==================== ZUSTAND STORES ====================
  const cascadeActions = useStoreSelectors.cascade.actions();
  const uiActions = useStoreSelectors.ui.actions();
  const masterDataActions = useStoreSelectors.masterData.actions();
  
  const entities = useStoreSelectors.masterData.entitiesWithRelations(entityType);
  const loading = useStoreSelectors.ui.loading(entityType);
  const refreshing = useStoreSelectors.ui.loading(entityType, 'refreshing');
  const error = useStoreSelectors.ui.error(entityType);
  const cascadeFilters_state = useStoreSelectors.cascade.filters();
  const pagination = useStoreSelectors.ui.pagination(entityType);
  
  // ==================== LOCAL STATE ====================
  const [localFilters, setLocalFilters] = useState({});
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  
  // ==================== COMPUTED VALUES ====================
  
  // Get effective filters (cascade + local)
  const effectiveFilters = useMemo(() => {
    const base = cascadeFilters ? cascadeFilters_state : {};
    return { ...base, ...localFilters, search: searchValue };
  }, [cascadeFilters, cascadeFilters_state, localFilters, searchValue]);
  
  // Apply filters and sorting to entities
  const filteredAndSortedEntities = useMemo(() => {
    let filtered = [...entities];
    
    // Apply filters
    Object.entries(effectiveFilters).forEach(([key, value]) => {
      if (!value) return;
      
      switch (key) {
        case 'search':
          const searchTerm = value.toLowerCase();
          filtered = filtered.filter(item => {
            const searchFields = getSearchFields(item);
            return searchFields.some(field => 
              field?.toLowerCase().includes(searchTerm)
            );
          });
          break;
          
        case 'jenjang':
          filtered = filtered.filter(item => 
            item.id_jenjang?.toString() === value.toString() ||
            item.jenjang?.id_jenjang?.toString() === value.toString() ||
            item.kelas?.id_jenjang?.toString() === value.toString()
          );
          break;
          
        case 'mataPelajaran':
          filtered = filtered.filter(item =>
            item.id_mata_pelajaran?.toString() === value.toString()
          );
          break;
          
        case 'kelas':
          filtered = filtered.filter(item =>
            item.id_kelas?.toString() === value.toString()
          );
          break;
          
        case 'kategori':
          filtered = filtered.filter(item => item.kategori === value);
          break;
          
        case 'status':
          filtered = filtered.filter(item => {
            const itemStatus = item.status || (item.is_active === false ? 'tidak_aktif' : 'aktif');
            return itemStatus === value;
          });
          break;
          
        default:
          // Custom filter
          if (filterConfig[key]?.filterFn) {
            filtered = filtered.filter(item => filterConfig[key].filterFn(item, value));
          }
      }
    });
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = getSortValue(a, sortBy);
      const bValue = getSortValue(b, sortBy);
      
      let result = 0;
      if (aValue < bValue) result = -1;
      else if (aValue > bValue) result = 1;
      
      return sortOrder === 'desc' ? -result : result;
    });
    
    return filtered;
  }, [entities, effectiveFilters, sortBy, sortOrder, filterConfig]);
  
  const hasActiveFilters = useMemo(() => {
    return Object.values(effectiveFilters).some(value => 
      value !== '' && value !== null && value !== undefined
    );
  }, [effectiveFilters]);
  
  // ==================== EFFECTS ====================
  
  useEffect(() => {
    loadData();
  }, [entityType]);
  
  useEffect(() => {
    onFilterChange?.(effectiveFilters);
  }, [effectiveFilters, onFilterChange]);
  
  useEffect(() => {
    onSortChange?.(sortBy, sortOrder);
  }, [sortBy, sortOrder, onSortChange]);
  
  // ==================== HANDLERS ====================
  
  const loadData = useCallback(async () => {
    try {
      await masterDataActions.load(entityType);
    } catch (err) {
      uiActions.setError(entityType, err.message);
    }
  }, [entityType, masterDataActions, uiActions]);
  
  const handleRefresh = useCallback(async () => {
    try {
      uiActions.setLoading(entityType, 'refreshing', true);
      await masterDataActions.refresh(entityType);
      onRefresh?.();
    } catch (err) {
      uiActions.setError(entityType, err.message);
    } finally {
      uiActions.setLoading(entityType, 'refreshing', false);
    }
  }, [entityType, masterDataActions, uiActions, onRefresh]);
  
  const handleFilterChange = useCallback((key, value) => {
    if (cascadeFilters) {
      cascadeActions.setFilter(key, value);
    } else {
      setLocalFilters(prev => ({ ...prev, [key]: value }));
    }
  }, [cascadeFilters, cascadeActions]);
  
  const handleSortChange = useCallback((newSortBy, newSortOrder = 'asc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);
  
  const toggleSortOrder = useCallback(() => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);
  
  const clearAllFilters = useCallback(() => {
    setSearchValue('');
    setLocalFilters({});
    if (cascadeFilters) {
      cascadeActions.clearFilters();
    }
  }, [cascadeFilters, cascadeActions]);
  
  const handleItemPress = useCallback((item, index) => {
    onItemPress?.(item, index);
  }, [onItemPress]);
  
  // ==================== HELPER FUNCTIONS ====================
  
  const getSearchFields = (item) => {
    const fields = [];
    
    switch (entityType) {
      case ENTITIES.JENJANG:
        fields.push(item.nama_jenjang, item.kode_jenjang);
        break;
      case ENTITIES.MATA_PELAJARAN:
        fields.push(item.nama_mata_pelajaran, item.kode_mata_pelajaran, item.kategori);
        break;
      case ENTITIES.KELAS:
        fields.push(item.nama_kelas, item.jenis_kelas);
        break;
      case ENTITIES.MATERI:
        fields.push(item.nama_materi, item.deskripsi);
        break;
      default:
        fields.push(JSON.stringify(item));
    }
    
    return fields.filter(Boolean);
  };
  
  const getSortValue = (item, field) => {
    const value = item[field];
    if (value instanceof Date) return value.getTime();
    if (typeof value === 'string') return value.toLowerCase();
    if (typeof value === 'number') return value;
    return String(value || '').toLowerCase();
  };
  
  const getDefaultSortOptions = () => {
    const base = [
      { label: 'Terbaru', value: 'created_at', order: 'desc' },
      { label: 'Terlama', value: 'created_at', order: 'asc' },
      { label: 'A-Z', value: getNameField(), order: 'asc' },
      { label: 'Z-A', value: getNameField(), order: 'desc' }
    ];
    
    if (entityType === ENTITIES.JENJANG || entityType === ENTITIES.KELAS) {
      base.unshift(
        { label: 'Urutan', value: 'urutan', order: 'asc' },
        { label: 'Urutan Terbalik', value: 'urutan', order: 'desc' }
      );
    }
    
    return base;
  };
  
  const getNameField = () => {
    const nameMap = {
      [ENTITIES.JENJANG]: 'nama_jenjang',
      [ENTITIES.MATA_PELAJARAN]: 'nama_mata_pelajaran',
      [ENTITIES.KELAS]: 'nama_kelas',
      [ENTITIES.MATERI]: 'nama_materi'
    };
    return nameMap[entityType] || 'name';
  };
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderHeader = () => (
    <View style={[styles.header, headerStyle]}>
      {HeaderComponent && <HeaderComponent />}
      
      {/* Search Bar */}
      {enableSearch && (
        <SearchBar
          value={searchValue}
          onValueChange={setSearchValue}
          placeholder={`Cari ${title.toLowerCase()}...`}
          entityType={entityType}
          applyToStore={cascadeFilters}
          style={styles.searchBar}
        />
      )}
      
      {/* Filter Controls */}
      {enableFilters && (
        <View style={[styles.filterControls, filterStyle]}>
          <TouchableOpacity
            style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Ionicons 
              name="filter" 
              size={16} 
              color={hasActiveFilters ? '#fff' : '#666'} 
            />
            <Text style={[
              styles.filterButtonText,
              hasActiveFilters && styles.filterButtonTextActive
            ]}>
              Filter {hasActiveFilters && `(${Object.values(effectiveFilters).filter(Boolean).length})`}
            </Text>
          </TouchableOpacity>
          
          {/* Sort Button */}
          {enableSort && (
            <TouchableOpacity style={styles.sortButton} onPress={toggleSortOrder}>
              <Ionicons 
                name={sortOrder === 'asc' ? 'arrow-up' : 'arrow-down'} 
                size={16} 
                color="#666" 
              />
              <Text style={styles.sortButtonText}>Sort</Text>
            </TouchableOpacity>
          )}
          
          {/* Clear Filters */}
          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearAllFilters}>
              <Ionicons name="close" size={16} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      )}
      
      {/* Expanded Filters */}
      {showFilters && renderFilters()}
      
      {/* Results Count */}
      <View style={styles.resultInfo}>
        <Text style={styles.resultText}>
          {filteredAndSortedEntities.length} dari {entities.length} data
        </Text>
      </View>
    </View>
  );
  
  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Cascade Filters */}
      {cascadeFilters && (
        <>
          <CascadeDropdown
            entityType={ENTITIES.JENJANG}
            value={effectiveFilters.jenjang}
            onValueChange={(value) => handleFilterChange('jenjang', value)}
            placeholder="Semua Jenjang"
            style={styles.filterDropdown}
            allowClear
          />
          
          <CascadeDropdown
            entityType={ENTITIES.MATA_PELAJARAN}
            value={effectiveFilters.mataPelajaran}
            onValueChange={(value) => handleFilterChange('mataPelajaran', value)}
            dependsOn={{ jenjang: effectiveFilters.jenjang }}
            placeholder="Semua Mata Pelajaran"
            style={styles.filterDropdown}
            allowClear
          />
          
          <CascadeDropdown
            entityType={ENTITIES.KELAS}
            value={effectiveFilters.kelas}
            onValueChange={(value) => handleFilterChange('kelas', value)}
            dependsOn={{ jenjang: effectiveFilters.jenjang }}
            placeholder="Semua Kelas"
            style={styles.filterDropdown}
            allowClear
          />
        </>
      )}
      
      {/* Status Filter */}
      <DropdownSelector
        options={[
          { label: 'Semua Status', value: '' },
          { label: 'Aktif', value: 'aktif' },
          { label: 'Tidak Aktif', value: 'tidak_aktif' }
        ]}
        value={effectiveFilters.status}
        onValueChange={(value) => handleFilterChange('status', value)}
        placeholder="Status"
        style={styles.filterDropdown}
      />
      
      {/* Kategori Filter (for Mata Pelajaran) */}
      {entityType === ENTITIES.MATA_PELAJARAN && (
        <DropdownSelector
          options={[
            { label: 'Semua Kategori', value: '' },
            { label: 'Wajib', value: 'wajib' },
            { label: 'Muatan Lokal', value: 'muatan_lokal' },
            { label: 'Pengembangan Diri', value: 'pengembangan_diri' },
            { label: 'Pilihan', value: 'pilihan' },
            { label: 'Ekstrakurikuler', value: 'ekstrakurikuler' }
          ]}
          value={effectiveFilters.kategori}
          onValueChange={(value) => handleFilterChange('kategori', value)}
          placeholder="Kategori"
          style={styles.filterDropdown}
        />
      )}
      
      {/* Sort Options */}
      {enableSort && (
        <DropdownSelector
          options={sortOptions.length > 0 ? sortOptions : getDefaultSortOptions()}
          value={`${sortBy}_${sortOrder}`}
          onValueChange={(value) => {
            const [field, order] = value.split('_');
            handleSortChange(field, order);
          }}
          placeholder="Urutkan"
          style={styles.filterDropdown}
        />
      )}
      
      {/* Custom Filters */}
      {Object.entries(filterConfig).map(([key, config]) => (
        <View key={key} style={styles.filterDropdown}>
          {config.component || (
            <DropdownSelector
              options={config.options || []}
              value={effectiveFilters[key]}
              onValueChange={(value) => handleFilterChange(key, value)}
              placeholder={config.placeholder || key}
            />
          )}
        </View>
      ))}
    </View>
  );
  
  const renderDefaultEmptyState = () => {
    if (renderEmptyState) return renderEmptyState();
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="search" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>
          {hasActiveFilters ? 'Tidak ada hasil' : 'Tidak ada data'}
        </Text>
        <Text style={styles.emptySubtitle}>
          {hasActiveFilters ? 'Coba ubah filter pencarian' : 'Data belum tersedia'}
        </Text>
        {hasActiveFilters && (
          <TouchableOpacity style={styles.clearFiltersButton} onPress={clearAllFilters}>
            <Text style={styles.clearFiltersText}>Hapus Filter</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderDefaultItem = ({ item, index }) => {
    if (renderItem) {
      return renderItem({ item, index }, { onPress: () => handleItemPress(item, index) });
    }
    
    return (
      <TouchableOpacity
        style={styles.defaultItem}
        onPress={() => handleItemPress(item, index)}
        activeOpacity={0.7}
      >
        <Text style={styles.itemText}>
          {item[getNameField()] || 'Unnamed Item'}
        </Text>
      </TouchableOpacity>
    );
  };
  
  // ==================== RENDER ====================
  
  if (loading && entities.length === 0) {
    return renderLoadingState ? renderLoadingState() : (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat data...</Text>
      </View>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <FlatList
        data={filteredAndSortedEntities}
        renderItem={renderDefaultItem}
        keyExtractor={(item, index) => `${item.id || index}_${index}`}
        style={[styles.list, listStyle]}
        
        // Header
        ListHeaderComponent={renderHeader}
        stickyHeaderIndices={[0]}
        
        // Footer
        ListFooterComponent={FooterComponent}
        
        // Performance
        removeClippedSubviews={virtualizeList}
        initialNumToRender={initialNumToRender}
        windowSize={windowSize}
        maxToRenderPerBatch={5}
        
        // Layout
        numColumns={numColumns}
        horizontal={horizontal}
        
        // Refresh
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        
        // Empty state
        ListEmptyComponent={renderDefaultEmptyState}
        
        // Accessibility
        accessible
        accessibilityLabel={`${title} list`}
      />
    </SafeAreaView>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  list: { flex: 1 },
  
  // Header
  header: { backgroundColor: '#fff', paddingBottom: 8 },
  searchBar: { marginHorizontal: 16, marginVertical: 8 },
  
  // Filter controls
  filterControls: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 8, gap: 8
  },
  filterButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12,
    paddingVertical: 6, borderRadius: 16, backgroundColor: '#f8f9fa',
    borderWidth: 1, borderColor: '#dee2e6'
  },
  filterButtonActive: { backgroundColor: '#007bff', borderColor: '#007bff' },
  filterButtonText: { marginLeft: 4, fontSize: 12, color: '#666' },
  filterButtonTextActive: { color: '#fff' },
  sortButton: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8,
    paddingVertical: 6
  },
  sortButtonText: { marginLeft: 4, fontSize: 12, color: '#666' },
  clearButton: { padding: 6 },
  
  // Filters container
  filtersContainer: {
    paddingHorizontal: 16, paddingVertical: 8, gap: 8,
    backgroundColor: '#f8f9fa', borderTopWidth: 1, borderTopColor: '#dee2e6'
  },
  filterDropdown: { marginBottom: 8 },
  
  // Result info
  resultInfo: { paddingHorizontal: 16, paddingVertical: 4 },
  resultText: { fontSize: 12, color: '#6c757d' },
  
  // Loading state
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#666' },
  
  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#666', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  clearFiltersButton: {
    backgroundColor: '#007bff', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 16, marginTop: 16
  },
  clearFiltersText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  
  // Default item
  defaultItem: {
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4,
    padding: 16, borderRadius: 8
  },
  itemText: { fontSize: 16, color: '#333' }
});

export default BaseListScreen;