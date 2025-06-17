import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import Button from '../../../common/components/Button';

// Import API
import { adminShelterKelompokApi } from '../api/adminShelterKelompokApi';

const KelompokManagementScreen = () => {
  const navigation = useNavigation();
  const [kelompokList, setKelompokList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [levels, setLevels] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('');

  // Fetch kelompok data
  const fetchKelompokData = async (page = 1, refresh = false) => {
    try {
      if (refresh) {
        setCurrentPage(1);
        page = 1;
      }
      
      setError(null);
      
      // Prepare params
      const params = {
        page,
        per_page: 10
      };
      
      // Add search query if provided
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      // Add level filter if selected
      if (selectedLevel) {
        params.id_level_anak_binaan = selectedLevel;
      }
      
      const response = await adminShelterKelompokApi.getAllKelompok(params);
      
      if (response.data.success) {
        const newData = response.data.data || [];
        
        // If refreshing or first page, replace data
        // Otherwise, append data
        if (refresh || page === 1) {
          setKelompokList(newData);
        } else {
          setKelompokList(prev => [...prev, ...newData]);
        }
        
        // Set pagination info
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.current_page);
          setTotalPages(response.data.pagination.last_page);
        }
      } else {
        setError(response.data.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching kelompok:', err);
      setError('Failed to load kelompok. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Fetch levels data
  const fetchLevels = async () => {
    try {
      const response = await adminShelterKelompokApi.getLevels();
      if (response.data.success) {
        setLevels(response.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  // Initial data fetch
  useEffect(() => {
    Promise.all([
      fetchKelompokData(),
      fetchLevels()
    ]);
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetchKelompokData(1, true),
      fetchLevels()
    ]);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (loadingMore || currentPage >= totalPages) return;
    
    setLoadingMore(true);
    fetchKelompokData(currentPage + 1);
  };

  // Handle search
  const handleSearch = () => {
    // Reset to first page and fetch with search query
    setCurrentPage(1);
    fetchKelompokData(1, true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchKelompokData(1, true);
  };

  // Handle level filter
  const handleLevelFilter = (levelId) => {
    setSelectedLevel(levelId === selectedLevel ? '' : levelId);
    setCurrentPage(1);
    // The filter will be applied on the next fetchKelompokData call
    fetchKelompokData(1, true);
  };

  // Navigate to kelompok detail screen
  const handleViewKelompok = (kelompokId) => {
    navigation.navigate('KelompokDetail', { id: kelompokId });
  };

  // Navigate to add new kelompok screen
  const handleAddKelompok = () => {
    navigation.navigate('KelompokForm');
  };

  // Handle delete kelompok
  const handleDeleteKelompok = (kelompok) => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete ${kelompok.nama_kelompok}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await adminShelterKelompokApi.deleteKelompok(kelompok.id_kelompok);
              
              // Refresh data after deleting
              handleRefresh();
              
              Alert.alert('Success', 'Group has been deleted');
            } catch (err) {
              console.error('Error deleting kelompok:', err);
              Alert.alert('Error', 'Failed to delete group');
            } finally {
              setLoading(false);
            }
          }
        },
      ]
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#9b59b6" />
        <Text style={styles.footerText}>Memuat data...</Text>
      </View>
    );
  };

  // Render kelompok item
  const renderKelompokItem = ({ item }) => {
    const kelompok = item;
    const levelName = kelompok.level_anak_binaan?.nama_level_binaan || 'No Level';
    
    return (
      <TouchableOpacity 
        style={styles.kelompokItem}
        onPress={() => handleViewKelompok(kelompok.id_kelompok)}
      >
        <View style={styles.kelompokContent}>
          <View style={styles.kelompokHeader}>
            <Text style={styles.kelompokName}>{kelompok.nama_kelompok}</Text>
            <View style={styles.kelompokActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('KelompokForm', { kelompok })}
              >
                <Ionicons name="create-outline" size={18} color="#3498db" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteKelompok(kelompok)}
              >
                <Ionicons name="trash-outline" size={18} color="#e74c3c" />
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.kelompokMeta}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{levelName}</Text>
            </View>
          
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Loading state
  if (loading && !refreshing && !loadingMore) {
    return <LoadingSpinner fullScreen message="Loading groups..." />;
  }

  return (
    <View style={styles.container}>
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
          retryText="Try Again"
        />
      )}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#999999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari Kelompok..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#999999" />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          leftIcon={<Ionicons name="add" size={20} color="#ffffff" />}
          type="primary"
          onPress={handleAddKelompok}
          style={styles.addButton}
        />
      </View>
      
      {/* Level Filters */}
      {levels.length > 0 && (
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                selectedLevel === '' && styles.filterButtonActive
              ]}
              onPress={() => handleLevelFilter('')}
            >
              <Text style={[
                styles.filterButtonText,
                selectedLevel === '' && styles.filterButtonTextActive
              ]}>
                All
              </Text>
            </TouchableOpacity>
            
            {levels.map((level) => (
              <TouchableOpacity
                key={level.id_level_anak_binaan}
                style={[
                  styles.filterButton,
                  selectedLevel === level.id_level_anak_binaan && styles.filterButtonActive
                ]}
                onPress={() => handleLevelFilter(level.id_level_anak_binaan)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedLevel === level.id_level_anak_binaan && styles.filterButtonTextActive
                ]}>
                  {level.nama_level_binaan}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
      
      {/* Kelompok List */}
      {kelompokList.length > 0 ? (
        <FlatList
          data={kelompokList}
          renderItem={renderKelompokItem}
          keyExtractor={(item) => item.id_kelompok?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={renderFooter}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {searchQuery.trim() !== '' ? (
            <>
              <Ionicons name="search" size={60} color="#cccccc" />
              <Text style={styles.emptyText}>No groups found with "{searchQuery}"</Text>
              <Button 
                title="Clear Search" 
                onPress={clearSearch} 
                type="outline"
                style={styles.emptyButton}
              />
            </>
          ) : (
            <>
              <Ionicons name="people-circle" size={60} color="#cccccc" />
              <Text style={styles.emptyText}>No groups created yet</Text>
              <Button 
                title="Create First Group" 
                onPress={handleAddKelompok} 
                type="primary"
                style={styles.emptyButton}
              />
            </>
          )}
        </View>
      )}
      
      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.floatingButton}
        onPress={handleAddKelompok}
      >
        <Ionicons name="add" size={30} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333333',
  },
  clearButton: {
    padding: 4,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9b59b6',
  },
  filterContainer: {
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#9b59b6',
  },
  filterButtonActive: {
    backgroundColor: '#9b59b6',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#9b59b6',
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for floating button
  },
  kelompokItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  kelompokContent: {
    padding: 16,
  },
  kelompokHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kelompokName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  kelompokActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  kelompokMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelBadge: {
    backgroundColor: '#f2e5ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginRight: 8,
  },
  levelText: {
    fontSize: 12,
    color: '#9b59b6',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  emptyButton: {
    minWidth: 180,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  footerText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666666',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default KelompokManagementScreen;