import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import useFormValidation from '../../../common/hooks/useFormValidation';

// Import Form Step Components
import KeluargaFormStepFamily from '../components/keluargaForm/KeluargaFormStepFamily';
import KeluargaFormStepParents from '../components/keluargaForm/KeluargaFormStepParents';
import KeluargaFormStepGuardian from '../components/keluargaForm/KeluargaFormStepGuardian';
import KeluargaFormStepChild from '../components/keluargaForm/KeluargaFormStepChild';
import KeluargaFormStepEducation from '../components/keluargaForm/KeluargaFormStepEducation';
import KeluargaFormReview from '../components/keluargaForm/KeluargaFormReview';

// Import API
import { adminPusatKeluargaApi } from '../api/adminPusatKeluargaApi';

const KeluargaFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // Get existing keluarga data if editing
  const existingKeluarga = route.params?.keluarga;
  const isEditMode = !!existingKeluarga;
  
  // Form steps
  const STEPS = {
    FAMILY: 0,
    PARENTS: 1,
    GUARDIAN: 2,
    CHILD: 3,
    EDUCATION: 4,
    REVIEW: 5,
  };
  
  // State
  const [currentStep, setCurrentStep] = useState(STEPS.FAMILY);
  const [formData, setFormData] = useState({
    // Family basic info
    no_kk: '',
    kepala_keluarga: '',
    status_ortu: '',
    id_kacab: '',
    id_wilbin: '',
    id_bank: '',
    no_rek: '',
    an_rek: '',
    no_tlp: '',
    an_tlp: '',
    bank_choice: 'no',
    telp_choice: 'no',
    
    // Father info
    nik_ayah: '',
    nama_ayah: '',
    agama_ayah: '',
    tempat_lahir_ayah: '',
    tanggal_lahir_ayah: '',
    alamat_ayah: '',
    id_prov_ayah: '',
    id_kab_ayah: '',
    id_kec_ayah: '',
    id_kel_ayah: '',
    penghasilan_ayah: '',
    tanggal_kematian_ayah: '',
    penyebab_kematian_ayah: '',
    
    // Mother info
    nik_ibu: '',
    nama_ibu: '',
    agama_ibu: '',
    tempat_lahir_ibu: '',
    tanggal_lahir_ibu: '',
    alamat_ibu: '',
    id_prov_ibu: '',
    id_kab_ibu: '',
    id_kec_ibu: '',
    id_kel_ibu: '',
    penghasilan_ibu: '',
    tanggal_kematian_ibu: '',
    penyebab_kematian_ibu: '',
    
    // Guardian info
    nik_wali: '',
    nama_wali: '',
    agama_wali: '',
    tempat_lahir_wali: '',
    tanggal_lahir_wali: '',
    alamat_wali: '',
    id_prov_wali: '',
    id_kab_wali: '',
    id_kec_wali: '',
    id_kel_wali: '',
    penghasilan_wali: '',
    hub_kerabat_wali: '',
    
    // Child info
    nik_anak: '',
    anak_ke: '',
    dari_bersaudara: '',
    nick_name: '',
    full_name: '',
    agama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: '',
    tinggal_bersama: '',
    jenis_anak_binaan: '',
    hafalan: '',
    pelajaran_favorit: '',
    hobi: '',
    prestasi: '',
    jarak_rumah: '',
    transportasi: '',
    foto: null,
    
    // Education info
    jenjang: '',
    kelas: '',
    nama_sekolah: '',
    alamat_sekolah: '',
    jurusan: '',
    semester: '',
    nama_pt: '',
    alamat_pt: '',
  });
  
  const [dropdownData, setDropdownData] = useState({
    kacab: [],
    wilbin: [],
    bank: [],
  });
  
  const [stepsValid, setStepsValid] = useState({
    [STEPS.FAMILY]: false,
    [STEPS.PARENTS]: false,
    [STEPS.GUARDIAN]: true, // Guardian is optional, so default to true
    [STEPS.CHILD]: false,
    [STEPS.EDUCATION]: false,
    [STEPS.REVIEW]: true, // Review is always valid
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [error, setError] = useState(null);
  
  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const response = await adminPusatKeluargaApi.getDropdownData();
        
        if (response.data.success) {
          setDropdownData({
            kacab: response.data.data.kacab || [],
            bank: response.data.data.bank || [],
            wilbin: [],
          });
        }
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setError('Gagal memuat data formulir. Silakan coba lagi.');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    
    fetchDropdownData();
  }, []);
  
  // Fetch wilbin options when kacab is selected
  useEffect(() => {
    const fetchWilbin = async () => {
      if (!formData.id_kacab) {
        setDropdownData(prev => ({ ...prev, wilbin: [] }));
        return;
      }
      
      try {
        const response = await adminPusatKeluargaApi.getWilbinByKacab(formData.id_kacab);
        
        if (response.data.success) {
          setDropdownData(prev => ({ ...prev, wilbin: response.data.data || [] }));
        }
      } catch (err) {
        console.error('Error fetching wilbin data:', err);
      }
    };
    
    fetchWilbin();
  }, [formData.id_kacab]);
  
  // Initialize form data if editing
  useEffect(() => {
    if (isEditMode && existingKeluarga) {
      // Fetch complete family data to get child information
      const fetchFamilyDetails = async () => {
        try {
          setLoading(true);
          const response = await adminPusatKeluargaApi.getKeluargaDetail(existingKeluarga.id_keluarga);
          
          if (response.data.success) {
            const familyData = response.data.data.keluarga;
            const ayah = familyData.ayah || {};
            const ibu = familyData.ibu || {};
            const wali = familyData.wali || {};
            
            // Get the first child data if available
            const childData = response.data.data.anak && response.data.data.anak.length > 0 
              ? response.data.data.anak[0] 
              : {};
              
            // Get education data from child if available
            const educationData = childData.anakPendidikan || {};
            
            // Create initial form data
            let initialFormData = {
              // Family basic info
              no_kk: familyData.no_kk || '',
              kepala_keluarga: familyData.kepala_keluarga || '',
              status_ortu: familyData.status_ortu || '',
              id_kacab: familyData.id_kacab?.toString() || '',
              id_wilbin: familyData.id_wilbin?.toString() || '',
              id_bank: familyData.id_bank?.toString() || '',
              no_rek: familyData.no_rek || '',
              an_rek: familyData.an_rek || '',
              no_tlp: familyData.no_tlp || '',
              an_tlp: familyData.an_tlp || '',
              bank_choice: familyData.id_bank ? 'yes' : 'no',
              telp_choice: familyData.no_tlp ? 'yes' : 'no',
              
              // Father info
              nik_ayah: ayah.nik_ayah || '',
              nama_ayah: ayah.nama_ayah || '',
              agama_ayah: ayah.agama || '',
              tempat_lahir_ayah: ayah.tempat_lahir || '',
              tanggal_lahir_ayah: ayah.tanggal_lahir || '',
              alamat_ayah: ayah.alamat || '',
              id_prov_ayah: ayah.id_prov || '',
              id_kab_ayah: ayah.id_kab || '',
              id_kec_ayah: ayah.id_kec || '',
              id_kel_ayah: ayah.id_kel || '',
              penghasilan_ayah: ayah.penghasilan || '',
              tanggal_kematian_ayah: ayah.tanggal_kematian || '',
              penyebab_kematian_ayah: ayah.penyebab_kematian || '',
              
              // Mother info
              nik_ibu: ibu.nik_ibu || '',
              nama_ibu: ibu.nama_ibu || '',
              agama_ibu: ibu.agama || '',
              tempat_lahir_ibu: ibu.tempat_lahir || '',
              tanggal_lahir_ibu: ibu.tanggal_lahir || '',
              alamat_ibu: ibu.alamat || '',
              id_prov_ibu: ibu.id_prov || '',
              id_kab_ibu: ibu.id_kab || '',
              id_kec_ibu: ibu.id_kec || '',
              id_kel_ibu: ibu.id_kel || '',
              penghasilan_ibu: ibu.penghasilan || '',
              tanggal_kematian_ibu: ibu.tanggal_kematian || '',
              penyebab_kematian_ibu: ibu.penyebab_kematian || '',
              
              // Guardian info
              nik_wali: wali.nik_wali || '',
              nama_wali: wali.nama_wali || '',
              agama_wali: wali.agama || '',
              tempat_lahir_wali: wali.tempat_lahir || '',
              tanggal_lahir_wali: wali.tanggal_lahir || '',
              alamat_wali: wali.alamat || '',
              id_prov_wali: wali.id_prov || '',
              id_kab_wali: wali.id_kab || '',
              id_kec_wali: wali.id_kec || '',
              id_kel_wali: wali.id_kel || '',
              penghasilan_wali: wali.penghasilan || '',
              hub_kerabat_wali: wali.hub_kerabat || '',
              
              // Child info
              nik_anak: childData.nik_anak || '',
              anak_ke: childData.anak_ke?.toString() || '',
              dari_bersaudara: childData.dari_bersaudara?.toString() || '',
              nick_name: childData.nick_name || '',
              full_name: childData.full_name || '',
              agama: childData.agama || '',
              tempat_lahir: childData.tempat_lahir || '',
              tanggal_lahir: childData.tanggal_lahir || '',
              jenis_kelamin: childData.jenis_kelamin || '',
              tinggal_bersama: childData.tinggal_bersama || '',
              jenis_anak_binaan: childData.jenis_anak_binaan || '',
              hafalan: childData.hafalan || '',
              pelajaran_favorit: childData.pelajaran_favorit || '',
              hobi: childData.hobi || '',
              prestasi: childData.prestasi || '',
              jarak_rumah: childData.jarak_rumah?.toString() || '',
              transportasi: childData.transportasi || '',
              
              // Education info
              jenjang: educationData.jenjang || '',
              kelas: educationData.kelas || '',
              nama_sekolah: educationData.nama_sekolah || '',
              alamat_sekolah: educationData.alamat_sekolah || '',
              jurusan: educationData.jurusan || '',
              semester: educationData.semester?.toString() || '',
              nama_pt: educationData.nama_pt || '',
              alamat_pt: educationData.alamat_pt || '',
            };
            
            setFormData(initialFormData);
            
            // Mark first two steps as valid when editing
            setStepsValid(prev => ({
              ...prev,
              [STEPS.FAMILY]: true,
              [STEPS.PARENTS]: true,
              [STEPS.CHILD]: true,
              [STEPS.EDUCATION]: true
            }));
          }
        } catch (err) {
          console.error('Error fetching family details:', err);
          setError('Gagal memuat detail keluarga. Silakan coba lagi.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchFamilyDetails();
    }
  }, [isEditMode, existingKeluarga]);
  
  // Set screen title
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditMode ? 'Edit Keluarga' : 'Tambah Keluarga Baru'
    });
  }, [navigation, isEditMode]);
  
  // Handle form data change
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  // Validate current step
  const validateStep = (step = currentStep, data = formData) => {
    switch (step) {
      case STEPS.FAMILY:
        // Basic family validation
        return !!(
          data.no_kk &&
          data.kepala_keluarga &&
          data.status_ortu &&
          data.id_kacab &&
          data.id_wilbin
        );
      
      case STEPS.PARENTS:
        
        return (
          (data.nama_ayah && data.nik_ayah) ||
          (data.nama_ibu && data.nik_ibu)
        );
      
      case STEPS.GUARDIAN:
        
        return true;
      
      case STEPS.CHILD:
        
        return !!(
          data.nik_anak &&
          data.anak_ke &&
          data.dari_bersaudara &&
          data.nick_name &&
          data.full_name &&
          data.agama &&
          data.tempat_lahir &&
          data.tanggal_lahir &&
          data.jenis_kelamin &&
          data.tinggal_bersama &&
          data.jenis_anak_binaan
        );
      
      case STEPS.EDUCATION:
        // Basic education validation
        return !!(data.jenjang);
      
      case STEPS.REVIEW:
        // Review is always valid
        return true;
      
      default:
        return false;
    }
  };
  
  // Update step validity
  const updateStepValidity = (step, isValid) => {
    setStepsValid(prev => ({ ...prev, [step]: isValid }));
  };
  
  // Go to next step
  const goToNextStep = () => {
    // Validate current step
    const isCurrentStepValid = validateStep();
    updateStepValidity(currentStep, isCurrentStepValid);
    
    if (isCurrentStepValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      Alert.alert(
        'Validasi Error',
        'Silakan isi semua bidang yang diperlukan sebelum melanjutkan.'
      );
    }
  };
  
  // Go to previous step
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  // Go to specific step
  const goToStep = (step) => {
    // Can only go to steps that are less than or equal to the highest completed step + 1
    const highestCompletedStep = Object.entries(stepsValid)
      .filter(([_, isValid]) => isValid)
      .reduce((highest, [step, _]) => Math.max(highest, parseInt(step)), -1);
    
    if (step <= highestCompletedStep + 1) {
      setCurrentStep(step);
    }
  };
  
  // Submit form
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      // Create FormData object
      const formDataObj = new FormData();
      
      // Add form fields
      Object.entries(formData).forEach(([key, value]) => {
        // Skip certain fields
        if (
          key === 'bank_choice' ||
          key === 'telp_choice' ||
          (key === 'foto' && !value)
        ) {
          return;
        }
        
        // Handle file upload for child photo
        if (key === 'foto' && value) {
          const filename = value.uri.split('/').pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : 'image/jpeg';
          
          formDataObj.append('foto', {
            uri: value.uri,
            type,
            name: filename,
          });
        } else if (value !== null && value !== undefined) {
          formDataObj.append(key, value.toString());
        }
      });
      
      let response;
      
      if (isEditMode) {
        response = await adminPusatKeluargaApi.updateKeluarga(
          existingKeluarga.id_keluarga,
          formDataObj
        );
      } else {
        response = await adminPusatKeluargaApi.createKeluarga(formDataObj);
      }
      
      if (response.data.success) {
        Alert.alert(
          'Sukses',
          isEditMode
            ? 'Informasi keluarga berhasil diperbarui'
            : 'Keluarga berhasil ditambahkan',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setError(response.data.message || 'Gagal menyimpan informasi keluarga');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      
      // Log detailed validation errors
      if (err.response?.status === 422) {
        console.error('Validation errors:', err.response.data);
        
        // Extract validation error messages
        const validationErrors = err.response?.data?.errors || {};
        const errorMessages = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        
        setError(`Validasi error:\n${errorMessages || err.response?.data?.message}`);
      } else {
        setError(err.response?.data?.message || 'Gagal menyimpan informasi keluarga');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.FAMILY:
        return (
          <KeluargaFormStepFamily
            formData={formData}
            onChange={handleChange}
            dropdownData={dropdownData}
            setStepValid={(isValid) => updateStepValidity(STEPS.FAMILY, isValid)}
            validateStep={() => validateStep(STEPS.FAMILY, formData)}
            isLoadingDropdowns={loadingDropdowns}
          />
        );
      
      case STEPS.PARENTS:
        return (
          <KeluargaFormStepParents
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.PARENTS, isValid)}
            validateStep={() => validateStep(STEPS.PARENTS, formData)}
          />
        );
      
      case STEPS.GUARDIAN:
        return (
          <KeluargaFormStepGuardian
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.GUARDIAN, isValid)}
            validateStep={() => validateStep(STEPS.GUARDIAN, formData)}
          />
        );
      
      case STEPS.CHILD:
        return (
          <KeluargaFormStepChild
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.CHILD, isValid)}
            validateStep={() => validateStep(STEPS.CHILD, formData)}
          />
        );
      
      case STEPS.EDUCATION:
        return (
          <KeluargaFormStepEducation
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.EDUCATION, isValid)}
            validateStep={() => validateStep(STEPS.EDUCATION, formData)}
          />
        );
      
      case STEPS.REVIEW:
        return (
          <KeluargaFormReview
            formData={formData}
            dropdownData={dropdownData}
            isEditMode={isEditMode}
          />
        );
      
      default:
        return null;
    }
  };
  
  // Loading state
  if (loading) {
    return <LoadingSpinner fullScreen message="Memuat formulir..." />;
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Error Message */}
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
        
        {/* Steps Indicator */}
        <View style={styles.stepsContainer}>
          {Object.values(STEPS).map((step) => (
            <TouchableOpacity
              key={step}
              style={[
                styles.stepIndicator,
                currentStep === step && styles.currentStep,
                stepsValid[step] && styles.validStep,
              ]}
              onPress={() => goToStep(step)}
              disabled={submitting}
            >
              <Text style={[
                styles.stepNumber,
                (currentStep === step || stepsValid[step]) && styles.activeStepText
              ]}>
                {step + 1}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Step Title */}
        <Text style={styles.stepTitle}>
          {currentStep === STEPS.FAMILY && 'Data Keluarga'}
          {currentStep === STEPS.PARENTS && 'Data Orang Tua'}
          {currentStep === STEPS.GUARDIAN && 'Data Wali'}
          {currentStep === STEPS.CHILD && 'Data Anak'}
          {currentStep === STEPS.EDUCATION && 'Data Pendidikan'}
          {currentStep === STEPS.REVIEW && 'Tinjau Data'}
        </Text>
        
        {/* Current Step Form */}
        <View style={styles.formContainer}>
          {renderCurrentStep()}
        </View>
        
        {/* Navigation Buttons */}
        <View style={styles.buttonsContainer}>
          {currentStep > 0 && (
            <Button
              title="Sebelumnya"
              onPress={goToPreviousStep}
              type="outline"
              style={styles.navigationButton}
              disabled={submitting}
            />
          )}
          
          {currentStep < STEPS.REVIEW ? (
            <Button
              title="Selanjutnya"
              onPress={goToNextStep}
              type="primary"
              style={[styles.navigationButton, currentStep === 0 && styles.fullWidthButton]}
              disabled={submitting}
            />
          ) : (
            <Button
              title={isEditMode ? "Perbarui Keluarga" : "Simpan Keluarga"}
              onPress={handleSubmit}
              type="primary"
              style={styles.navigationButton}
              loading={submitting}
              disabled={submitting}
            />
          )}
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
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  stepIndicator: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currentStep: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  validStep: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  stepNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#777',
  },
  activeStepText: {
    color: '#fff',
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navigationButton: {
    flex: 1,
    margin: 5,
  },
  fullWidthButton: {
    flex: 1,
  },
});

export default KeluargaFormScreen;