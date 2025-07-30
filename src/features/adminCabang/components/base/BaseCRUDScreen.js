// src/features/adminCabang/components/base/BaseCRUDScreen.js
import React, { useEffect, useCallback, useMemo } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Alert, RefreshControl,
  StyleSheet, SafeAreaView, Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useStoreSelectors } from '../../stores';
import { ENTITIES } from '../../stores/masterDataStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * BaseCRUDScreen - Template untuk semua CRUD operations dengan Zustand
 * Generic component yang bisa di-extend untuk entities spesifik
 */
const BaseCRUDScreen = ({
  // Required props
  entityType, // ENTITIES.JENJANG, MATA_PELAJARAN, etc
  
  // Screen config
  title = 'Data',
  headerStyle,
  
  // CRUD config
  enableCreate = true,
  enableEdit = true,
  enableDelete = true,
  enableView = true,
  enableRefresh = true,
  
  // Navigation
  createScreen,
  editScreen,
  detailScreen,
  
  // Data rendering
  renderItem,
  renderEmptyState,
  renderHeader,
  renderFooter,
  
  // List config
  numColumns = 1,
  keyExtractor,
  getItemLayout,
  
  // Pagination
  enablePagination = true,
  onLoadMore,
  
  // Filtering
  enableFilters = false,
  onFilter,
  
  // Search
  enableSearch = false,
  onSearch,
  
  // Custom actions
  customActions = [],
  onCustomAction,
  
  // Events
  onItemPress,
  onItemLongPress,
  onCreatePress,
  onEditPress,
  onDeletePress,
  onViewPress,
  
  // Styles
  containerStyle,
  listStyle,
  itemStyle,
  
  // Performance
  initialNumToRender = 10,
  maxToRenderPerBatch = 5,
  windowSize = 10,
  
  // Error handling
  onError
}) => {
  const navigation = useNavigation();
  
  // ==================== ZUSTAND STORES ====================
  const masterDataActions = useStoreSelectors.masterData.actions();
  const uiActions = useStoreSelectors.ui.actions();
  
  const entities = useStoreSelectors.masterData.entitiesWithRelations(entityType);
  const loading = useStoreSelectors.ui.loading(entityType);
  const refreshing = useStoreSelectors.ui.loading(entityType, 'refreshing');
  const error = useStoreSelectors.ui.error(entityType);
  const pagination = useStoreSelectors.ui.pagination(entityType);
  
  // ==================== COMPUTED VALUES ====================
  const canLoadMore = useMemo(() => {
    return enablePagination && pagination && 
           pagination.current_page < pagination.last_page;
  }, [enablePagination, pagination]);
  
  const totalCount = useMemo(() => {
    return pagination?.total || entities.length;
  }, [pagination, entities.length]);
  
  const hasData = entities.length > 0;
  
  // ==================== EFFECTS ====================
  
  // Load initial data
  useEffect(() => {
    loadData();
  }, [entityType]);
  
  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);
  
  // ==================== HANDLERS ====================
  
  const loadData = useCallback(async (params = {}) => {
    try {
      await masterDataActions.load(entityType, params);
    } catch (err) {
      handleError('Failed to load data', err);
    }
  }, [entityType, masterDataActions]);
  
  const handleRefresh = useCallback(async () => {
    try {
      uiActions.setLoading(entityType, 'refreshing', true);
      await masterDataActions.refresh(entityType);
    } catch (err) {
      handleError('Failed to refresh data', err);
    } finally {
      uiActions.setLoading(entityType, 'refreshing', false);
    }
  }, [entityType, masterDataActions, uiActions]);
  
  const handleLoadMore = useCallback(async () => {
    if (!canLoadMore || loading) return;
    
    try {
      await masterDataActions.loadMore(entityType);
      onLoadMore?.();
    } catch (err) {
      handleError('Failed to load more data', err);
    }
  }, [canLoadMore, loading, entityType, masterDataActions, onLoadMore]);
  
  const handleCreate = useCallback(() => {
    if (onCreatePress) {
      onCreatePress();
    } else if (createScreen) {
      navigation.navigate(createScreen);
    } else {
      uiActions.setModal(entityType, 'create', true);
    }
  }, [onCreatePress, createScreen, navigation, uiActions, entityType]);
  
  const handleEdit = useCallback((item) => {
    if (onEditPress) {
      onEditPress(item);
    } else if (editScreen) {
      navigation.navigate(editScreen, { id: getItemId(item), item });
    } else {
      uiActions.setModal(entityType, 'edit', true, item);
    }
  }, [onEditPress, editScreen, navigation, uiActions, entityType]);
  
  const handleDelete = useCallback((item) => {
    const itemName = getItemName(item);
    
    Alert.alert(
      'Konfirmasi Hapus',
      `Apakah Anda yakin ingin menghapus "${itemName}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            if (onDeletePress) {
              onDeletePress(item);
            } else {
              await performDelete(item);
            }
          }
        }
      ]
    );
  }, [onDeletePress]);
  
  const performDelete = useCallback(async (item) => {
    const itemId = getItemId(item);
    
    try {
      uiActions.setLoading(entityType, 'deleting', true);
      await masterDataActions.delete(entityType, itemId);
      uiActions.setSuccess(`${getItemName(item)} berhasil dihapus`, 'delete');
    } catch (err) {
      handleError(`Failed to delete ${getItemName(item)}`, err);
    } finally {
      uiActions.setLoading(entityType, 'deleting', false);
    }
  }, [entityType, masterDataActions, uiActions]);
  
  const handleView = useCallback((item) => {
    if (onViewPress) {
      onViewPress(item);
    } else if (detailScreen) {
      navigation.navigate(detailScreen, { id: getItemId(item), item });
    }
  }, [onViewPress, detailScreen, navigation]);
  
  const handleItemPress = useCallback((item) => {
    if (onItemPress) {
      onItemPress(item);
    } else if (enableView) {
      handleView(item);
    } else if (enableEdit) {
      handleEdit(item);
    }
  }, [onItemPress, enableView, enableEdit, handleView, handleEdit]);
  
  const handleItemLongPress = useCallback((item) => {
    if (onItemLongPress) {
      onItemLongPress(item);
    } else {
      showItemActions(item);
    }
  }, [onItemLongPress]);
  
  const showItemActions = useCallback((item) => {
    const actions = [];
    
    if (enableView) {
      actions.push({ text: 'Lihat Detail', onPress: () => handleView(item) });
    }
    if (enableEdit) {
      actions.push({ text: 'Edit', onPress: () => handleEdit(item) });
    }
    if (enableDelete) {
      actions.push({ 
        text: 'Hapus', 
        style: 'destructive',
        onPress: () => handleDelete(item) 
      });
    }
    
    customActions.forEach(action => {
      actions.push({
        text: action.title,
        onPress: () => onCustomAction?.(action.key, item)
      });
    });
    
    actions.push({ text: 'Batal', style: 'cancel' });
    
    Alert.alert('Pilih Aksi', null, actions);
  }, [enableView, enableEdit, enableDelete, customActions, 
      handleView, handleEdit, handleDelete, onCustomAction]);
  
  const handleError = useCallback((message, error) => {
    console.error(`${entityType} Error:`, error);
    uiActions.setError(entityType, error?.message || message);
  }, [entityType, uiActions]);
  
  // ==================== HELPER FUNCTIONS ====================
  
  const getItemId = (item) => {
    const idMap = {
      [ENTITIES.JENJANG]: 'id_jenjang',
      [ENTITIES.MATA_PELAJARAN]: 'id_mata_pelajaran',
      [ENTITIES.KELAS]: 'id_kelas',
      [ENTITIES.MATERI]: 'id_materi',
      [ENTITIES.KURIKULUM]: 'id_kurikulum'
    };
    return item[idMap[entityType]] || item.id;
  };
  
  const getItemName = (item) => {
    const nameMap = {
      [ENTITIES.JENJANG]: 'nama_jenjang',
      [ENTITIES.MATA_PELAJARAN]: 'nama_mata_pelajaran',
      [ENTITIES.KELAS]: 'nama_kelas',
      [ENTITIES.MATERI]: 'nama_materi',
      [ENTITIES.KURIKULUM]: 'nama_kurikulum'
    };
    return item[nameMap[entityType]] || 'Item';
  };
  
  const defaultKeyExtractor = useCallback((item, index) => {
    return keyExtractor ? keyExtractor(item, index) : 
           `${getItemId(item)}_${index}`;
  }, [keyExtractor]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderDefaultItem = useCallback(({ item, index }) => {
    if (renderItem) {
      return renderItem({ item, index }, {
        onPress: () => handleItemPress(item),
        onLongPress: () => handleItemLongPress(item),
        onEdit: () => handleEdit(item),
        onDelete: () => handleDelete(item),
        onView: () => handleView(item)
      });
    }
    
    return (
      <TouchableOpacity
        style={[styles.defaultItem, itemStyle]}
        onPress={() => handleItemPress(item)}
        onLongPress={() => handleItemLongPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.itemContent}>
          <Text style={styles.itemTitle} numberOfLines={1}>
            {getItemName(item)}
          </Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            ID: {getItemId(item)}
          </Text>
        </View>
        
        <View style={styles.itemActions}>
          {enableEdit && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleEdit(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="pencil" size={16} color="#007bff" />
            </TouchableOpacity>
          )}
          
          {enableDelete && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => handleDelete(item)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="trash" size={16} color="#dc3545" />
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    );
  }, [renderItem, itemStyle, handleItemPress, handleItemLongPress,
      handleEdit, handleDelete, enableEdit, enableDelete]);
  
  const renderDefaultEmptyState = () => {
    if (renderEmptyState) {
      return renderEmptyState();
    }
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="folder-open-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Tidak Ada Data</Text>
        <Text style={styles.emptySubtitle}>
          {enableCreate ? 'Tap tombol + untuk menambah data baru' : 'Data belum tersedia'}
        </Text>
        {enableCreate && (
          <TouchableOpacity style={styles.emptyButton} onPress={handleCreate}>
            <Text style={styles.emptyButtonText}>Tambah Data</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  
  const renderListFooter = () => {
    if (renderFooter) {
      return renderFooter();
    }
    
    if (loading && entities.length > 0) {
      return (
        <View style={styles.loadingFooter}>
          <Text style={styles.loadingText}>Memuat lebih banyak...</Text>
        </View>
      );
    }
    
    if (pagination && hasData) {
      return (
        <View style={styles.paginationFooter}>
          <Text style={styles.paginationText}>
            {entities.length} dari {totalCount} data
          </Text>
        </View>
      );
    }
    
    return null;
  };
  
  // ==================== RENDER ====================
  
  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      {/* Header */}
      {renderHeader && renderHeader()}
      
      {/* Error State */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Main List */}
      <FlatList
        data={entities}
        renderItem={renderDefaultItem}
        keyExtractor={defaultKeyExtractor}
        style={[styles.list, listStyle]}
        numColumns={numColumns}
        getItemLayout={getItemLayout}
        
        // Performance props
        initialNumToRender={initialNumToRender}
        maxToRenderPerBatch={maxToRenderPerBatch}
        windowSize={windowSize}
        removeClippedSubviews={true}
        
        // Refresh control
        refreshControl={enableRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#007bff']}
          />
        ) : undefined}
        
        // Pagination
        onEndReached={enablePagination ? handleLoadMore : undefined}
        onEndReachedThreshold={0.1}
        
        // States
        ListEmptyComponent={!loading ? renderDefaultEmptyState : null}
        ListFooterComponent={renderListFooter}
        
        // Accessibility
        accessible={true}
        accessibilityLabel={`${title} list`}
      />
      
      {/* Floating Action Button */}
      {enableCreate && (
        <TouchableOpacity
          style={styles.fab}
          onPress={handleCreate}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  list: { flex: 1 },
  
  // Default item styles
  defaultItem: {
    backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 4,
    padding: 16, borderRadius: 8, flexDirection: 'row', alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 4 },
  itemSubtitle: { fontSize: 12, color: '#666' },
  itemActions: { flexDirection: 'row', alignItems: 'center' },
  actionButton: { marginLeft: 12, padding: 8 },
  
  // Empty state
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#666', marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: '#999', textAlign: 'center', marginTop: 8 },
  emptyButton: {
    backgroundColor: '#007bff', paddingHorizontal: 24, paddingVertical: 12,
    borderRadius: 8, marginTop: 16
  },
  emptyButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  
  // Error state
  errorContainer: {
    backgroundColor: '#f8d7da', margin: 16, padding: 12, borderRadius: 8,
    borderWidth: 1, borderColor: '#f5c6cb'
  },
  errorText: { fontSize: 14, color: '#721c24', marginBottom: 8 },
  retryButton: { alignSelf: 'flex-start' },
  retryText: { fontSize: 14, color: '#007bff', fontWeight: '600' },
  
  // Footer states
  loadingFooter: { padding: 16, alignItems: 'center' },
  loadingText: { fontSize: 14, color: '#666' },
  paginationFooter: { padding: 16, alignItems: 'center' },
  paginationText: { fontSize: 12, color: '#999' },
  
  // FAB
  fab: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
    backgroundColor: '#007bff', borderRadius: 28, justifyContent: 'center',
    alignItems: 'center', elevation: 8, shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8
  }
});

export default BaseCRUDScreen;