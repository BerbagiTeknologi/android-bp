// src/features/adminShelter/screens/SurveyManagementScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminShelterSurveyApi } from '../api/adminShelterSurveyApi';

const SurveyManagementScreen = () => {
  const navigation = useNavigation();
  
  // State
  const [familyList, setFamilyList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch family data
  const fetchFamilyData = async (page = 1, refresh = false) => {
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
      
      // Fetch data
      const response = await adminShelterSurveyApi.getSurveys(params);
      
      if (response.data.success) {
        const newData = response.data.data || [];
        
        // Verify each family has an ID
        const validData = newData.filter(family => {
          if (!family.id_keluarga) {
            console.warn('Family missing ID:', family);
            return false;
          }
          return true;
        });
        
        // If refreshing or first page, replace data
        // Otherwise, append data
        if (refresh || page === 1) {
          setFamilyList(validData);
        } else {
          setFamilyList(prev => [...prev, ...validData]);
        }
        
        // Set pagination info
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.current_page || page);
          setTotalPages(response.data.pagination.last_page || 1);
        }
      } else {
        setError(response.data.message || 'Failed to load data');
      }
    } catch (err) {
      console.error('Error fetching family data:', err);
      setError('Failed to load family data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchFamilyData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchFamilyData(1, true);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (loadingMore || currentPage >= totalPages) return;
    
    setLoadingMore(true);
    fetchFamilyData(currentPage + 1);
  };

  // Handle search
  const handleSearch = () => {
    // Reset to first page and fetch with search query
    setCurrentPage(1);
    fetchFamilyData(1, true);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setCurrentPage(1);
    fetchFamilyData(1, true);
  };

  // Navigate to survey form screen - FIXED VERSION
  const handleFillSurvey = (family) => {
    // Add logging to see the family object structure
    console.log('Family object being passed:', JSON.stringify(family));
    
    // Validate that we have a family ID
    if (!family || !family.id_keluarga) {
      console.error('Missing family ID', family);
      Alert.alert(
        'Error',
        'This family has an invalid ID. Please try selecting a different family or refresh the list.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Make sure id_keluarga is explicitly included and logged
    const familyId = family.id_keluarga;
    console.log('Family ID being passed:', familyId);
    
    // Check data type - ensure it's a string or number
    const idType = typeof familyId;
    if (idType !== 'string' && idType !== 'number') {
      console.error('Invalid family ID type:', idType);
      Alert.alert(
        'Error',
        'The family ID is in an invalid format. Please contact support.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Navigate with both the ID and full family object
    navigation.navigate('SurveyForm', { 
      id_keluarga: familyId, // Explicitly pass the ID
      keluarga: family       // Also pass the full object as backup
    });
  };
  
  // Navigate to view family detail
  const handleViewFamily = (familyId) => {
    navigation.navigate('KeluargaDetail', { id: familyId });
  };

  // Navigate to validation management
  const navigateToValidation = () => {
    navigation.navigate('SurveyValidationManagement');
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#e74c3c" />
        <Text style={styles.footerText}>Memuat Lebih Banyak...</Text>
      </View>
    );
  };

  // Render family item
  const renderFamilyItem = ({ item }) => {
    const family = item;
    
    return (
      <View style={styles.familyItem}>
        <TouchableOpacity 
          style={styles.familyContent}
          onPress={() => handleViewFamily(family.id_keluarga)}
        >
          <View style={styles.familyHeader}>
            <Text style={styles.familyName}>{family.kepala_keluarga}</Text>
            <Text style={styles.familyId}>ID: {family.id_keluarga}</Text>
          </View>
          
          <View style={styles.familyDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>No. KK:</Text>
              <Text style={styles.detailValue}>{family.no_kk || '-'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={styles.detailValue}>{family.status_ortu || '-'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shelter:</Text>
              <Text style={styles.detailValue}>{family.shelter?.nama_shelter || '-'}</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        <Button
          title="Isi Survei"
          onPress={() => handleFillSurvey(family)}
          type="primary"
          size="small"
          style={styles.surveyButton}
          leftIcon={<Ionicons name="clipboard-outline" size={16} color="#fff" />}
        />
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing && !loadingMore) {
    return <LoadingSpinner fullScreen={false} message="Memuat Data..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header with validation button */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Survei</Text>
        <Button
          title="Validasi Survei"
          onPress={navigateToValidation}
          type="outline"
          leftIcon={<Ionicons name="checkmark-circle-outline" size={16} color="#e74c3c" />}
          style={styles.validationButton}
        />
      </View>
      
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
            placeholder="Cari Keluarga atau KK"
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
      </View>
      
      {/* Family List */}
      {familyList.length > 0 ? (
        <FlatList
          data={familyList}
          renderItem={renderFamilyItem}
          keyExtractor={(item) => item.id_keluarga?.toString() || Math.random().toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={10}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {searchQuery.trim() !== '' ? (
            <>
              <Ionicons name="search" size={60} color="#cccccc" />
              <Text style={styles.emptyText}>No results found for "{searchQuery}"</Text>
              <Button 
                title="Clear Search" 
                onPress={clearSearch} 
                type="outline"
                style={styles.emptyButton}
              />
            </>
          ) : (
            <>
              <Ionicons name="home-outline" size={60} color="#cccccc" />
              <Text style={styles.emptyText}>No families found in your shelter</Text>
            </>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  validationButton: {
    borderColor: '#e74c3c',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
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
  listContainer: {
    padding: 16,
  },
  familyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 16,
  },
  familyContent: {
    marginBottom: 12,
  },
  familyHeader: {
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  familyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  familyId: {
    fontSize: 12,
    color: '#777',
    fontStyle: 'italic',
  },
  familyDetails: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    width: 90,
    fontSize: 14,
    color: '#777',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  surveyButton: {
    alignSelf: 'flex-end',
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
});

export default SurveyManagementScreen;