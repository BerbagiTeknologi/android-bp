import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import TextInput from '../../../common/components/TextInput';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API and constants
import { adminShelterSurveyValidationApi } from '../api/adminShelterSurveyValidationApi';
import { ADMIN_SHELTER_ENDPOINTS } from '../../../constants/endpoints';
import { formatDateToIndonesian } from '../../../common/utils/dateFormatter';

const SurveyValidationDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get survey from route params
  const { survey: initialSurvey } = route.params || {};
  
  // State
  const [survey, setSurvey] = useState(initialSurvey);
  const [validationResult, setValidationResult] = useState('');
  const [validationNotes, setValidationNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  // Set screen title
  useEffect(() => {
    const keluarga = survey?.keluarga || {};
    navigation.setOptions({ 
      headerTitle: `Validate: ${keluarga.kepala_keluarga || 'Survey'}` 
    });
  }, [survey, navigation]);
  
  // Handle refresh
  const handleRefresh = async () => {
    if (!survey?.id_survey) return;
    
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch updated survey data
      const response = await adminShelterSurveyValidationApi.getValidationSurveys({
        id_survey: survey.id_survey
      });
      
      if (response.data.success && response.data.data.length > 0) {
        setSurvey(response.data.data[0]);
      }
    } catch (err) {
      console.error('Error refreshing survey:', err);
      setError('Failed to refresh survey data');
    } finally {
      setRefreshing(false);
    }
  };
  
  // Handle validation submission with improved error handling
  const handleSubmitValidation = async () => {
    if (!validationResult) {
      Alert.alert('Validation Required', 'Please select whether the survey is Eligible or Not Eligible');
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const validationData = {
        hasil_survey: validationResult,
        keterangan_hasil: validationNotes
      };
      
      // Log the request for debugging
      console.log(`Submitting to: ${ADMIN_SHELTER_ENDPOINTS.SURVEY_VALIDATION.VALIDATE(survey.id_survey)}`);
      console.log('Validation data:', JSON.stringify(validationData));
      
      const response = await adminShelterSurveyValidationApi.validateSurvey(
        survey.id_survey,
        validationData
      );
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          'Survey has been validated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        setError(response.data.message || 'Failed to validate survey');
      }
    } catch (err) {
      console.error('Error validating survey:', err);
      
      // Enhanced error handling
      if (err.response) {
        // Server responded with error status
        const statusCode = err.response.status;
        const errorData = err.response.data || {};
        const serverMessage = errorData.message || 'Unknown server error';
        
        let errorMessage = '';
        
        switch (statusCode) {
          case 400:
            errorMessage = `Invalid request (400): ${serverMessage}`;
            break;
          case 401:
            errorMessage = 'Authentication error (401): Your session may have expired, please login again';
            break;
          case 403:
            errorMessage = 'Permission denied (403): You do not have permission to validate surveys';
            break;
          case 404:
            errorMessage = 'API endpoint not found (404): The validation API appears to be misconfigured';
            break;
          case 422:
            // Validation errors
            const validationErrors = errorData.errors || {};
            const errorMessages = Object.values(validationErrors).flat().join('\n');
            errorMessage = `Validation failed (422):\n${errorMessages}`;
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = `Server error (${statusCode}): The server encountered an error. Please try again later.`;
            break;
          default:
            errorMessage = `Request failed (${statusCode}): ${serverMessage}`;
        }
        
        setError(errorMessage);
      } else if (err.request) {
        // Request made but no response received
        setError('Network error: Could not connect to the server. Please check your internet connection.');
      } else {
        // Something happened in setting up the request
        setError(`Request setup error: ${err.message}`);
      }
    } finally {
      setSubmitting(false);
    }
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
  
  // If no survey data
  if (!survey) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message="Survey data not found"
          onRetry={() => navigation.goBack()}
          retryText="Go Back"
        />
      </View>
    );
  }
  
  // Get keluarga data
  const keluarga = survey.keluarga || {};
  
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
          onRetry={() => setError(null)}
          retryText="Clear"
        />
      )}
      
      {/* Family Information Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Data Keluarga</Text>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Nama Kepala Keluarga:</Text>
            <Text style={styles.infoValue}>{keluarga.kepala_keluarga || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>No. KK:</Text>
            <Text style={styles.infoValue}>{keluarga.no_kk || '-'}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{keluarga.status_ortu || '-'}</Text>
          </View>
        </View>
      </View>
      
      {/* Survey Result Summary */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Ringkasan Survei</Text>
        
        <View style={styles.surveySection}>
          <View style={styles.surveyRow}>
            <Text style={styles.surveyLabel}>Status Keluarga:</Text>
            <Text style={styles.surveyValue}>{survey.status_anak || '-'}</Text>
          </View>
          
          <View style={styles.surveyRow}>
            <Text style={styles.surveyLabel}>Tanggungan:</Text>
            <Text style={styles.surveyValue}>{survey.jumlah_tanggungan || '-'}</Text>
          </View>
          
          <View style={styles.surveyRow}>
            <Text style={styles.surveyLabel}>Pendidikan Kepala Keluarga:</Text>
            <Text style={styles.surveyValue}>{survey.pendidikan_kepala_keluarga || '-'}</Text>
          </View>
          
          <View style={styles.surveyRow}>
            <Text style={styles.surveyLabel}>Pekerjaan kepala Keluarga:</Text>
            <Text style={styles.surveyValue}>{survey.pekerjaan_kepala_keluarga || '-'}</Text>
          </View>
          
          <View style={styles.surveyRow}>
            <Text style={styles.surveyLabel}>Penghasilan Bulanan:</Text>
            <Text style={styles.surveyValue}>
              {formatSurveyValue('penghasilan', survey.penghasilan)}
            </Text>
          </View>
        </View>
      </View>
      
      {/* Validation Form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Validasi Survei</Text>
        
        <View style={styles.validationForm}>
          <Text style={styles.validationLabel}>Hasil Validasi *</Text>
          <View style={styles.radioButtonGroup}>
            <TouchableOpacity
              style={[
                styles.resultButton,
                validationResult === 'Layak' && styles.resultButtonLayak
              ]}
              onPress={() => setValidationResult('Layak')}
            >
              <Ionicons 
                name={validationResult === 'Layak' ? 'checkmark-circle' : 'checkmark-circle-outline'} 
                size={20} 
                color={validationResult === 'Layak' ? '#fff' : '#2ecc71'} 
                style={styles.resultIcon}
              />
              <Text style={[
                styles.resultButtonText,
                validationResult === 'Layak' && styles.resultButtonTextActive
              ]}>Layak</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.resultButton,
                validationResult === 'Tidak Layak' && styles.resultButtonTidakLayak
              ]}
              onPress={() => setValidationResult('Tidak Layak')}
            >
              <Ionicons 
                name={validationResult === 'Tidak Layak' ? 'close-circle' : 'close-circle-outline'} 
                size={20} 
                color={validationResult === 'Tidak Layak' ? '#fff' : '#e74c3c'} 
                style={styles.resultIcon}
              />
              <Text style={[
                styles.resultButtonText,
                validationResult === 'Tidak Layak' && styles.resultButtonTextActive
              ]}>Belum Layak</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.validationLabel}>Catatan</Text>
          <TextInput
            value={validationNotes}
            onChangeText={setValidationNotes}
            placeholder="Masukan Catatan"
            multiline
            inputProps={{ numberOfLines: 4 }}
            style={styles.notesInput}
          />
          
          <View style={styles.noteContainer}>
            <Ionicons name="information-circle" size={20} color="#3498db" style={styles.noteIcon} />
            <Text style={styles.noteText}>
              Note: status layak akan mengubah status anak ke CPB (Calon Penerima Beasiswa).
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <Button
              title="Cancel"
              onPress={() => navigation.goBack()}
              type="outline"
              style={styles.cancelButton}
              disabled={submitting}
            />
            
            <Button
              title="Submit Validation"
              onPress={handleSubmitValidation}
              type="primary"
              style={styles.submitButton}
              loading={submitting}
              disabled={submitting || !validationResult}
            />
          </View>
        </View>
      </View>
      
      {/* Technical Debug Info in Development */}
      {__DEV__ && (
        <View style={styles.debugCard}>
          <Text style={styles.debugTitle}>Debug Information</Text>
          <Text style={styles.debugText}>API Endpoint: {ADMIN_SHELTER_ENDPOINTS.SURVEY_VALIDATION.VALIDATE(survey.id_survey)}</Text>
          <Text style={styles.debugText}>Survey ID: {survey.id_survey}</Text>
          <Text style={styles.debugText}>Family ID: {keluarga.id_keluarga}</Text>
        </View>
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
  validationForm: {
    marginTop: 12,
  },
  validationLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  radioButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  resultButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 4,
    marginHorizontal: 4,
    borderColor: '#dddddd',
    backgroundColor: '#ffffff',
  },
  resultButtonLayak: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  resultButtonTidakLayak: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  resultButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  resultButtonTextActive: {
    color: '#ffffff',
  },
  resultIcon: {
    marginRight: 8,
  },
  notesInput: {
    minHeight: 100,
    marginBottom: 16,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  noteIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  noteText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
  },
  debugCard: {
    backgroundColor: '#ffe8d6',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#d35400',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#333',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginBottom: 4,
  },
});

export default SurveyValidationDetailScreen;