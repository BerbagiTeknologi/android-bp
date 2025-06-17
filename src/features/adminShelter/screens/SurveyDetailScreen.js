import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminShelterSurveyApi } from '../api/adminShelterSurveyApi';
import { formatDateToIndonesian } from '../../../common/utils/dateFormatter';

const SurveyDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get family ID from route params
  const { id_keluarga } = route.params || {};
  
  // State
  const [surveyData, setSurveyData] = useState(null);
  const [keluargaData, setKeluargaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch survey details
  const fetchSurveyDetails = async () => {
    try {
      setError(null);
      const response = await adminShelterSurveyApi.getSurveyDetail(id_keluarga);
      
      if (response.data.success) {
        setSurveyData(response.data.data.survey || null);
        setKeluargaData(response.data.data.keluarga || null);
        
        // Set screen title based on family head name
        navigation.setOptions({ 
          headerTitle: `Survey: ${response.data.data.keluarga?.kepala_keluarga || 'Family'}` 
        });
      } else {
        setError(response.data.message || 'Failed to load survey details');
      }
    } catch (err) {
      console.error('Error fetching survey details:', err);
      setError('Failed to load survey details. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    if (id_keluarga) {
      fetchSurveyDetails();
    }
  }, [id_keluarga]);
  
  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchSurveyDetails();
  };
  
  // Navigate to edit survey
  const handleEditSurvey = () => {
    navigation.navigate('SurveyForm', { 
      id_keluarga: id_keluarga,
      surveyData: surveyData,
      keluarga: keluargaData
    });
  };
  
  // Handle delete survey
  const handleDeleteSurvey = () => {
    Alert.alert(
      'Delete Survey',
      'Are you sure you want to delete this survey? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await adminShelterSurveyApi.deleteSurvey(id_keluarga);
              
              if (response.data.success) {
                Alert.alert(
                  'Success',
                  'Survey has been deleted',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                setError(response.data.message || 'Failed to delete survey');
                setLoading(false);
              }
            } catch (err) {
              console.error('Error deleting survey:', err);
              setError('Failed to delete survey. Please try again.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  // Map survey value to more readable format
  const formatSurveyValue = (key, value) => {
    if (value === null || value === undefined || value === '') return '-';
    
    // Format special cases based on field
    switch (key) {
      case 'penghasilan':
        const incomeMap = {
          'dibawah_500k': 'Below Rp 500,000',
          '500k_1500k': 'Rp 500,000 - Rp 1,500,000',
          '1500k_2500k': 'Rp 1,500,000 - Rp 2,500,000',
          '2500k_3500k': 'Rp 2,500,000 - Rp 3,500,000',
          '3500k_5000k': 'Rp 3,500,000 - Rp 5,000,000',
          '5000k_7000k': 'Rp 5,000,000 - Rp 7,000,000',
          '7000k_10000k': 'Rp 7,000,000 - Rp 10,000,000',
          'diatas_10000k': 'Above Rp 10,000,000',
        };
        return incomeMap[value] || value;
      case 'tanggal_survey':
        return formatDateToIndonesian(value);
      default:
        return value;
    }
  };
  
  // Loading state
  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading survey details..." />;
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
        />
      )}
      
      {keluargaData && (
        <>
          {/* Family Information Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Family Information</Text>
            </View>
            
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Head Name:</Text>
                <Text style={styles.infoValue}>{keluargaData.kepala_keluarga || '-'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>KK Number:</Text>
                <Text style={styles.infoValue}>{keluargaData.no_kk || '-'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Status:</Text>
                <Text style={styles.infoValue}>{keluargaData.status_ortu || '-'}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Shelter:</Text>
                <Text style={styles.infoValue}>{keluargaData.shelter?.nama_shelter || '-'}</Text>
              </View>
            </View>
          </View>
          
          {surveyData ? (
            <>
              {/* Survey Result Card */}
              <View style={styles.card}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>Survey Result</Text>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleEditSurvey}
                    >
                      <Ionicons name="create-outline" size={22} color="#3498db" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={handleDeleteSurvey}
                    >
                      <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View style={styles.resultSection}>
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Survey Date:</Text>
                    <Text style={styles.resultValue}>
                      {formatSurveyValue('tanggal_survey', surveyData.tanggal_survey)}
                    </Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Survey Officer:</Text>
                    <Text style={styles.resultValue}>{surveyData.petugas_survey || '-'}</Text>
                  </View>
                  
                  <View style={styles.resultRow}>
                    <Text style={styles.resultLabel}>Result:</Text>
                    <View style={[
                      styles.resultBadge,
                      surveyData.hasil_survey === 'Layak' && styles.resultLayak,
                      surveyData.hasil_survey === 'Tidak Layak' && styles.resultTidakLayak
                    ]}>
                      <Text style={styles.resultText}>{surveyData.hasil_survey || 'Pending'}</Text>
                    </View>
                  </View>
                  
                  {surveyData.keterangan_hasil && (
                    <View style={styles.notesContainer}>
                      <Text style={styles.notesLabel}>Notes:</Text>
                      <Text style={styles.notesValue}>{surveyData.keterangan_hasil}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Basic Survey Data */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Basic Information</Text>
                
                <View style={styles.surveySection}>
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Family Status:</Text>
                    <Text style={styles.surveyValue}>{surveyData.status_anak || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Dependents:</Text>
                    <Text style={styles.surveyValue}>{surveyData.jumlah_tanggungan || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Head's Education:</Text>
                    <Text style={styles.surveyValue}>{surveyData.pendidikan_kepala_keluarga || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Head's Occupation:</Text>
                    <Text style={styles.surveyValue}>{surveyData.pekerjaan_kepala_keluarga || '-'}</Text>
                  </View>
                </View>
              </View>
              
              {/* Financial Information */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Financial Information</Text>
                
                <View style={styles.surveySection}>
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Monthly Income:</Text>
                    <Text style={styles.surveyValue}>
                      {formatSurveyValue('penghasilan', surveyData.penghasilan)}
                    </Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Has Savings:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kepemilikan_tabungan || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>3 Meals/Day:</Text>
                    <Text style={styles.surveyValue}>{surveyData.jumlah_makan || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Education Cost:</Text>
                    <Text style={styles.surveyValue}>{surveyData.biaya_pendidikan_perbulan || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Other Support:</Text>
                    <Text style={styles.surveyValue}>{surveyData.bantuan_lembaga_formal_lain || '-'}</Text>
                  </View>
                  
                  {surveyData.bantuan_lembaga_formal_lain === 'Ya' && (
                    <View style={styles.surveyRow}>
                      <Text style={styles.surveyLabel}>Support Amount:</Text>
                      <Text style={styles.surveyValue}>{surveyData.bantuan_lembaga_formal_lain_sebesar || '-'}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Assets & Property */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Assets & Property</Text>
                
                <View style={styles.surveySection}>
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Land Ownership:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kepemilikan_tanah || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Home Ownership:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kepemilikan_rumah || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Wall Material:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kondisi_rumah_dinding || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Floor Material:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kondisi_rumah_lantai || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Vehicle:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kepemilikan_kendaraan || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Electronics:</Text>
                    <Text style={styles.surveyValue}>{surveyData.kepemilikan_elektronik || '-'}</Text>
                  </View>
                </View>
              </View>
              
              {/* Health & Sanitation */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Health & Sanitation</Text>
                
                <View style={styles.surveySection}>
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Water Source:</Text>
                    <Text style={styles.surveyValue}>{surveyData.sumber_air_bersih || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Toilet System:</Text>
                    <Text style={styles.surveyValue}>{surveyData.jamban_limbah || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Waste Disposal:</Text>
                    <Text style={styles.surveyValue}>{surveyData.tempat_sampah || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Smoker:</Text>
                    <Text style={styles.surveyValue}>{surveyData.perokok || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Alcohol Consumer:</Text>
                    <Text style={styles.surveyValue}>{surveyData.konsumen_miras || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>First Aid Kit:</Text>
                    <Text style={styles.surveyValue}>{surveyData.persediaan_p3k || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Eat Fruits/Veggies:</Text>
                    <Text style={styles.surveyValue}>{surveyData.makan_buah_sayur || '-'}</Text>
                  </View>
                </View>
              </View>
              
              {/* Religious & Social Practices */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Religious & Social Practices</Text>
                
                <View style={styles.surveySection}>
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Daily Prayers:</Text>
                    <Text style={styles.surveyValue}>{surveyData.solat_lima_waktu || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Quran Reading:</Text>
                    <Text style={styles.surveyValue}>{surveyData.membaca_alquran || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Religious Study:</Text>
                    <Text style={styles.surveyValue}>{surveyData.majelis_taklim || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>News Reading:</Text>
                    <Text style={styles.surveyValue}>{surveyData.membaca_koran || '-'}</Text>
                  </View>
                  
                  <View style={styles.surveyRow}>
                    <Text style={styles.surveyLabel}>Organization Member:</Text>
                    <Text style={styles.surveyValue}>{surveyData.pengurus_organisasi || '-'}</Text>
                  </View>
                  
                  {surveyData.pengurus_organisasi === 'Ya' && (
                    <View style={styles.surveyRow}>
                      <Text style={styles.surveyLabel}>Position:</Text>
                      <Text style={styles.surveyValue}>{surveyData.pengurus_organisasi_sebagai || '-'}</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {/* Additional Notes */}
              {surveyData.kondisi_penerima_manfaat && (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Beneficiary Condition</Text>
                  <Text style={styles.conditionText}>{surveyData.kondisi_penerima_manfaat}</Text>
                </View>
              )}
            </>
          ) : (
            <View style={styles.noSurveyContainer}>
              <Ionicons name="clipboard-outline" size={60} color="#cccccc" />
              <Text style={styles.noSurveyText}>No survey data found for this family</Text>
              <Button
                title="Create Survey"
                onPress={() => navigation.navigate('SurveyForm', { keluarga: keluargaData })}
                type="primary"
                style={styles.createButton}
              />
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 90,
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  resultSection: {
    marginBottom: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultLabel: {
    width: 120,
    fontSize: 14,
    color: '#777',
    fontWeight: '500',
  },
  resultValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#9e9e9e',
  },
  resultLayak: {
    backgroundColor: '#2ecc71',
  },
  resultTidakLayak: {
    backgroundColor: '#e74c3c',
  },
  resultText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
  },
  notesContainer: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  notesValue: {
    fontSize: 14,
    color: '#333',
  },
  surveySection: {
    marginTop: 12,
  },
  surveyRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  surveyLabel: {
    width: 140,
    fontSize: 14,
    color: '#777',
  },
  surveyValue: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  conditionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginTop: 8,
  },
  noSurveyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noSurveyText: {
    fontSize: 16,
    color: '#777',
    marginVertical: 16,
  },
  createButton: {
    minWidth: 200,
  },
});

export default SurveyDetailScreen;