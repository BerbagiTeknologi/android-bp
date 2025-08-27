// file: src/features/adminShelter/screens/SurveyFormScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

// Import components
import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import StepIndicator from '../components/survey/StepIndicator';
import BasicInfoStep from '../components/survey/BasicInfoStep';
import FinancialStep from '../components/survey/FinancialStep';
import AssetsStep from '../components/survey/AssetsStep';
import HealthStep from '../components/survey/HealthStep';
import ReligiousStep from '../components/survey/ReligiousStep';
import ResultStep from '../components/survey/ResultStep';

// Import utils and services
import { validateStep, validateSubmission } from '../utils/surveyValidation';
import { submitSurvey, formatApiError, extractFamilyId } from '../services/surveyService';

const SurveyFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Log the entire route params for debugging
  console.log('Route params:', JSON.stringify(route.params || {}));
  
  // Get data from route params and extract family ID
  const params = route.params || {};
  const surveyData = params.surveyData;
  const keluarga = params.keluarga;
  const familyId = extractFamilyId(params, keluarga);
  
  // Log extracted data
  console.log('Family ID:', familyId);
  console.log('Keluarga object:', keluarga ? 'Present' : 'Missing');
  
  const isEditMode = !!surveyData;
  
  // State for stepped form
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    // Basic Information
    pendidikan_kepala_keluarga: '',
    jumlah_tanggungan: '',
    pekerjaan_kepala_keluarga: '',
    penghasilan: '',
    status_anak: '',
    
    // Financial
    kepemilikan_tabungan: '',
    jumlah_makan: '',
    biaya_pendidikan_perbulan: '',
    bantuan_lembaga_formal_lain: '',
    bantuan_lembaga_formal_lain_sebesar: '',
    
    // Assets
    kepemilikan_tanah: '',
    kepemilikan_rumah: '',
    kondisi_rumah_dinding: '',
    kondisi_rumah_lantai: '',
    kepemilikan_kendaraan: '',
    kepemilikan_elektronik: '',
    
    // Health & Sanitation
    sumber_air_bersih: '',
    jamban_limbah: '',
    tempat_sampah: '',
    perokok: '',
    konsumen_miras: '',
    persediaan_p3k: '',
    makan_buah_sayur: '',
    
    // Religious & Social
    solat_lima_waktu: '',
    membaca_alquran: '',
    majelis_taklim: '',
    membaca_koran: '',
    pengurus_organisasi: '',
    pengurus_organisasi_sebagai: '',
    
    // Result & Notes
    kondisi_penerima_manfaat: '',
    petugas_survey: '',
    hasil_survey: '',
    keterangan_hasil: ''
  });
  
  const [loading, setLoading] = useState(isEditMode); // Load if in edit mode
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  // Form steps
  const steps = [
    { id: 'basic', title: 'Basic Information' },
    { id: 'financial', title: 'Financial' },
    { id: 'assets', title: 'Assets & Home' },
    { id: 'health', title: 'Health & Sanitation' },
    { id: 'religious', title: 'Religious & Social' },
    { id: 'result', title: 'Result & Notes' }
  ];
  
  // Load existing survey data
  useEffect(() => {
    if (isEditMode && surveyData) {
      setFormData({
        ...formData,
        ...surveyData
      });
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [surveyData]);
  
  // Set screen title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditMode ? 'Edit Survey' : 'Create Survey'
    });
  }, [navigation, isEditMode]);
  
  // Handle form data change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // If toggling organization membership, reset position if "No"
    if (field === 'pengurus_organisasi' && value === 'Tidak') {
      setFormData(prev => ({ ...prev, pengurus_organisasi_sebagai: '' }));
    }
    
    // If toggling other support, reset amount if "No"
    if (field === 'bantuan_lembaga_formal_lain' && value === 'Tidak') {
      setFormData(prev => ({ ...prev, bantuan_lembaga_formal_lain_sebesar: '' }));
    }
  };
  
  // Go to next step with validation
  const goToNextStep = () => {
    const currentStepId = steps[currentStep]?.id;
    const validation = validateStep(currentStepId, formData);
    
    if (!validation.isValid) {
      Alert.alert('Error Validasi', validation.errorMessage);
      return;
    }
    
    const nextStep = currentStep + 1;
    if (nextStep < steps.length) {
      setCurrentStep(nextStep);
    } else {
      // Last step, submit the form
      handleSubmit();
    }
  };
  
  // Go to previous step
  const goToPreviousStep = () => {
    const prevStep = currentStep - 1;
    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Validation check
      const validation = validateSubmission(formData);
      if (!validation.isValid) {
        Alert.alert('Error Validasi', validation.errorMessage);
        setSubmitting(false);
        return;
      }
      
      // Check for family ID
      if (!familyId) {
        console.error('Family ID is missing.', 'Route params:', JSON.stringify(route.params));
        Alert.alert('Error', 'ID keluarga tidak ditemukan. Silakan kembali dan pilih keluarga.');
        setSubmitting(false);
        return;
      }
      
      // Submit survey
      const response = await submitSurvey(familyId, formData);
      
      if (response.data.success) {
        Alert.alert(
          'Berhasil',
          isEditMode ? 'Survey has been updated' : 'Survey has been saved',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        setError(response.data.message || 'Gagal menyimpan survei');
      }
    } catch (err) {
      console.error('Error mengirim survei:', err);
      setError(formatApiError(err));
    } finally {
      setSubmitting(false);
    }
  };
  
  // Cancel and go back
  const handleCancel = () => {
    Alert.alert(
      'Confirm Cancel',
      'Are you sure you want to cancel? All unsaved changes will be lost.',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes', onPress: () => navigation.goBack() }
      ]
    );
  };
  
  // Render current step of the form
  const renderFormStep = () => {
    const currentStepId = steps[currentStep]?.id;
    
    switch (currentStepId) {
      case 'basic':
        return (
          <BasicInfoStep
            formData={formData}
            handleChange={handleChange}
            keluarga={keluarga}
          />
        );
      
      case 'financial':
        return (
          <FinancialStep
            formData={formData}
            handleChange={handleChange}
          />
        );
      
      case 'assets':
        return (
          <AssetsStep
            formData={formData}
            handleChange={handleChange}
          />
        );
      
      case 'health':
        return (
          <HealthStep
            formData={formData}
            handleChange={handleChange}
          />
        );
      
      case 'religious':
        return (
          <ReligiousStep
            formData={formData}
            handleChange={handleChange}
          />
        );
      
      case 'result':
        return (
          <ResultStep
            formData={formData}
            handleChange={handleChange}
          />
        );
      
      default:
        return null;
    }
  };
  
  // Loading state
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading form..." />;
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView 
        style={styles.container} 
        contentContainerStyle={styles.contentContainer}
      >
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError(null)}
          />
        )}
        
        {/* Step Indicator */}
        <StepIndicator
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
        />
        
        {/* Step Title */}
        <Text style={styles.stepTitle}>{steps[currentStep]?.title}</Text>
        
        {/* Current Step Form */}
        {renderFormStep()}
        
        {/* Form Actions */}
        <View style={styles.actionContainer}>
          <View style={styles.actionButtons}>
            {/* Back/Cancel Button */}
            <Button
              title={currentStep === 0 ? "Cancel" : "Back"}
              onPress={currentStep === 0 ? handleCancel : goToPreviousStep}
              type="outline"
              style={styles.actionButton}
              disabled={submitting}
            />
            
            {/* Next/Submit Button */}
            <Button
              title={currentStep === steps.length - 1 ? "Submit" : "Next"}
              onPress={goToNextStep}
              type="primary"
              style={styles.actionButton}
              loading={submitting}
              disabled={submitting}
            />
          </View>
          
          {/* Steps Progress */}
          <Text style={styles.stepsProgress}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    textAlign: 'center',
    marginBottom: 24,
  },
  actionContainer: {
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  stepsProgress: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
  },
});

export default SurveyFormScreen;