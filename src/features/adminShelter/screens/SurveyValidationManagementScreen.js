import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminShelterSurveyValidationApi } from '../api/adminShelterSurveyValidationApi';

const SurveyValidationManagementScreen = () => {
  const navigation = useNavigation();
  
  // State
  const [validationList, setValidationList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [validationSummary, setValidationSummary] = useState({
    total: 0,
    pending: 0,
    layak: 0,
    tidak_layak: 0,
    tambah_kelayakan: 0
  });
  
  // Fetch validation data
  const fetchValidationData = async (refresh = false) => {
    try {
      setError(null);
      if (refresh) setRefreshing(true);
      
      const response = await adminShelterSurveyValidationApi.getValidationSurveys();
      
      if (response.data.success) {
        setValidationList(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to load surveys');
      }
      
      // Fetch validation summary
      try {
        const summaryResponse = await adminShelterSurveyValidationApi.getValidationSummary();
        if (summaryResponse.data.success) {
          setValidationSummary(summaryResponse.data.data || {});
        }
      } catch (summaryError) {
        console.error('Error fetching validation summary:', summaryError);
      }
    } catch (err) {
      console.error('Error fetching validation data:', err);
      setError('Failed to load surveys. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchValidationData();
    
    // Set screen title
    navigation.setOptions({
      headerTitle: 'Survey Validation'
    });
  }, [navigation]);
  
  // Handle refresh
  const handleRefresh = () => {
    fetchValidationData(true);
  };
  
  // Navigate to survey detail for validation
  const handleValidateSurvey = (survey) => {
    navigation.navigate('SurveyValidationDetail', { survey });
  };
  
  // Render survey item
  const renderSurveyItem = ({ item }) => {
    const survey = item;
    const keluarga = survey.keluarga || {};
    
    return (
      <TouchableOpacity 
        style={styles.surveyItem}
        onPress={() => handleValidateSurvey(survey)}
      >
        <View style={styles.surveyHeader}>
          <Text style={styles.surveyTitle}>{keluarga.kepala_keluarga || 'Unknown Family'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {survey.hasil_survey || 'Pending'}
            </Text>
          </View>
        </View>
        
        <View style={styles.surveyDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>KK Number:</Text>
            <Text style={styles.detailValue}>{keluarga.no_kk || '-'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={styles.detailValue}>{keluarga.status_ortu || '-'}</Text>
          </View>
          
          {/* <View style={styles.detailRow}>
            <Ionicons name="time-outline" size={16} color="#666" style={styles.timeIcon} />
            <Text style={styles.timeText}>Pending validation</Text>
          </View> */}
        </View>
      </TouchableOpacity>
    );
  };
  
  // Render summary cards
  const renderSummary = () => {
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryTitle}>
          <Ionicons name="stats-chart" size={20} color="#e74c3c" />
          <Text style={styles.summaryTitleText}>Ringkasan Validasi</Text>
        </View>
        
        <View style={styles.summaryCards}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{validationSummary.total || 0}</Text>
            <Text style={styles.summaryLabel}>Jumlah</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: '#f39c12' }]}>
            <Text style={[styles.summaryNumber, { color: '#fff' }]}>{validationSummary.pending || 0}</Text>
            <Text style={[styles.summaryLabel, { color: '#fff' }]}>Pending</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: '#2ecc71' }]}>
            <Text style={[styles.summaryNumber, { color: '#fff' }]}>{validationSummary.layak || 0}</Text>
            <Text style={[styles.summaryLabel, { color: '#fff' }]}>Layak</Text>
          </View>
          
          <View style={[styles.summaryCard, { backgroundColor: '#e74c3c' }]}>
            <Text style={[styles.summaryNumber, { color: '#fff' }]}>{validationSummary.tidak_layak || 0}</Text>
            <Text style={[styles.summaryLabel, { color: '#fff' }]}>Belum Layak</Text>
          </View>
        </View>
      </View>
    );
  };
  
  // Loading state
  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen={false} message="Memuat survei..." />;
  }
  
  return (
    <View style={styles.container}>
      {/* Summary Section */}
      {renderSummary()}
      
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
          retryText="Try Again"
        />
      )}
      
      {/* Survey List or Empty State */}
      {validationList.length > 0 ? (
        <FlatList
          data={validationList}
          renderItem={renderSurveyItem}
          keyExtractor={(item) => item.id_survey?.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListHeaderComponent={
            <Text style={styles.listHeader}>
              Daftar Validasi Survei ({validationList.length})
            </Text>
          }
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={60} color="#cccccc" />
          <Text style={styles.emptyText}>No surveys pending validation</Text>
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
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  summaryTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryTitleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  summaryCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  summaryNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  listHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    marginTop: 8,
  },
  listContainer: {
    padding: 16,
  },
  surveyItem: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  surveyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  surveyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#f39c12',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  surveyDetails: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
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
  timeIcon: {
    marginRight: 5,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default SurveyValidationManagementScreen;