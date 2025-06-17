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

import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

import KeluargaFormStepFamily from '../components/keluargaForm/KeluargaFormStepFamily';
import KeluargaFormStepParents from '../components/keluargaForm/KeluargaFormStepParents';
import KeluargaFormStepGuardian from '../components/keluargaForm/KeluargaFormStepGuardian';
import KeluargaFormStepChild from '../components/keluargaForm/KeluargaFormStepChild';
import KeluargaFormStepEducation from '../components/keluargaForm/KeluargaFormStepEducation';
import KeluargaFormStepSurveyBasic from '../components/keluargaForm/KeluargaFormStepSurveyBasic';
import KeluargaFormStepSurveyFinancial from '../components/keluargaForm/KeluargaFormStepSurveyFinancial';
import KeluargaFormStepSurveyAssets from '../components/keluargaForm/KeluargaFormStepSurveyAssets';
import KeluargaFormStepSurveyHealth from '../components/keluargaForm/KeluargaFormStepSurveyHealth';
import KeluargaFormStepSurveyReligious from '../components/keluargaForm/KeluargaFormStepSurveyReligious';
import KeluargaFormReview from '../components/keluargaForm/KeluargaFormReview';

import { adminShelterKeluargaApi } from '../api/adminShelterKeluargaApi';

const KeluargaFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  
  const existingKeluarga = route.params?.keluarga;
  const isEditMode = !!existingKeluarga;
  
  const STEPS = {
    FAMILY: 0,
    PARENTS: 1,
    GUARDIAN: 2,
    CHILD: 3,
    EDUCATION: 4,
    SURVEY_BASIC: 5,
    SURVEY_FINANCIAL: 6,
    SURVEY_ASSETS: 7,
    SURVEY_HEALTH: 8,
    SURVEY_RELIGIOUS: 9,
    REVIEW: 10,
  };
  
  const [currentStep, setCurrentStep] = useState(STEPS.FAMILY);
  const [formData, setFormData] = useState({
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
    hafalan: '',
    pelajaran_favorit: '',
    hobi: '',
    prestasi: '',
    jarak_rumah: '',
    transportasi: '',
    foto: null,
    
    jenjang: '',
    kelas: '',
    nama_sekolah: '',
    alamat_sekolah: '',
    jurusan: '',
    semester: '',
    nama_pt: '',
    alamat_pt: '',

    pekerjaan_kepala_keluarga: '',
    penghasilan: '',
    pendidikan_kepala_keluarga: '',
    jumlah_tanggungan: '',
    kepemilikan_tabungan: '',
    jumlah_makan: '',
    kepemilikan_tanah: '',
    kepemilikan_rumah: '',
    kondisi_rumah_dinding: '',
    kondisi_rumah_lantai: '',
    kepemilikan_kendaraan: '',
    kepemilikan_elektronik: '',
    sumber_air_bersih: '',
    jamban_limbah: '',
    tempat_sampah: '',
    perokok: '',
    konsumen_miras: '',
    persediaan_p3k: '',
    makan_buah_sayur: '',
    solat_lima_waktu: '',
    membaca_alquran: '',
    majelis_taklim: '',
    membaca_koran: '',
    pengurus_organisasi: '',
    pengurus_organisasi_sebagai: '',
    status_anak: '',
    biaya_pendidikan_perbulan: '',
    bantuan_lembaga_formal_lain: '',
    bantuan_lembaga_formal_lain_sebesar: '',
    kondisi_penerima_manfaat: '',
  });
  
  const [dropdownData, setDropdownData] = useState({
    kacab: [],
    wilbin: [],
    bank: [],
  });
  
  const [stepsValid, setStepsValid] = useState({
    [STEPS.FAMILY]: false,
    [STEPS.PARENTS]: false,
    [STEPS.GUARDIAN]: true,
    [STEPS.CHILD]: false,
    [STEPS.EDUCATION]: false,
    [STEPS.SURVEY_BASIC]: false,
    [STEPS.SURVEY_FINANCIAL]: false,
    [STEPS.SURVEY_ASSETS]: false,
    [STEPS.SURVEY_HEALTH]: false,
    [STEPS.SURVEY_RELIGIOUS]: false,
    [STEPS.REVIEW]: true,
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        setLoadingDropdowns(true);
        const response = await adminShelterKeluargaApi.getDropdownData();
        
        if (response.data.success) {
          setDropdownData({
            kacab: response.data.data.kacab || [],
            bank: response.data.data.bank || [],
            wilbin: [],
          });
        }
      } catch (err) {
        console.error('Error fetching dropdown data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoadingDropdowns(false);
      }
    };
    
    fetchDropdownData();
  }, []);
  
  useEffect(() => {
    const fetchWilbin = async () => {
      if (!formData.id_kacab) {
        setDropdownData(prev => ({ ...prev, wilbin: [] }));
        return;
      }
      
      try {
        const response = await adminShelterKeluargaApi.getWilbinByKacab(formData.id_kacab);
        
        if (response.data.success) {
          setDropdownData(prev => ({ ...prev, wilbin: response.data.data || [] }));
        }
      } catch (err) {
        console.error('Error fetching wilbin data:', err);
      }
    };
    
    fetchWilbin();
  }, [formData.id_kacab]);
  
  useEffect(() => {
    if (isEditMode && existingKeluarga) {
      const fetchFamilyDetails = async () => {
        try {
          setLoading(true);
          const response = await adminShelterKeluargaApi.getKeluargaDetail(existingKeluarga.id_keluarga);
          
          if (response.data.success) {
            const familyData = response.data.data.keluarga;
            const ayah = familyData.ayah || {};
            const ibu = familyData.ibu || {};
            const wali = familyData.wali || {};
            
            const childData = response.data.data.anak && response.data.data.anak.length > 0 
              ? response.data.data.anak[0] 
              : {};
              
            const educationData = childData.anakPendidikan || {};
            
            let initialFormData = {
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
              hafalan: childData.hafalan || '',
              pelajaran_favorit: childData.pelajaran_favorit || '',
              hobi: childData.hobi || '',
              prestasi: childData.prestasi || '',
              jarak_rumah: childData.jarak_rumah?.toString() || '',
              transportasi: childData.transportasi || '',
              
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
          setError('Failed to load family details. Please try again.');
        } finally {
          setLoading(false);
        }
      };
      
      fetchFamilyDetails();
    }
  }, [isEditMode, existingKeluarga]);
  
  useEffect(() => {
    navigation.setOptions({
      headerTitle: isEditMode ? 'Edit Keluarga' : 'Tambahkan Keluarga Baru'
    });
  }, [navigation, isEditMode]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const validateStep = (step, data) => {
    switch (step) {
      case STEPS.FAMILY:
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
          data.tinggal_bersama
        );
      
      case STEPS.EDUCATION:
        return !!(data.jenjang);

      case STEPS.SURVEY_BASIC:
        return !!(
          data.pekerjaan_kepala_keluarga &&
          data.pendidikan_kepala_keluarga &&
          data.jumlah_tanggungan &&
          data.status_anak
        );

      case STEPS.SURVEY_FINANCIAL:
        return !!(
          data.penghasilan &&
          data.kepemilikan_tabungan &&
          data.biaya_pendidikan_perbulan &&
          data.bantuan_lembaga_formal_lain
        );

      case STEPS.SURVEY_ASSETS:
        return !!(
          data.kepemilikan_tanah &&
          data.kepemilikan_rumah &&
          data.kondisi_rumah_dinding &&
          data.kondisi_rumah_lantai &&
          data.kepemilikan_kendaraan &&
          data.kepemilikan_elektronik
        );

      case STEPS.SURVEY_HEALTH:
        return !!(
          data.jumlah_makan &&
          data.sumber_air_bersih &&
          data.jamban_limbah &&
          data.tempat_sampah &&
          data.perokok &&
          data.konsumen_miras &&
          data.persediaan_p3k &&
          data.makan_buah_sayur
        );

      case STEPS.SURVEY_RELIGIOUS:
        return !!(
          data.solat_lima_waktu &&
          data.membaca_alquran &&
          data.majelis_taklim &&
          data.membaca_koran &&
          data.pengurus_organisasi &&
          data.kondisi_penerima_manfaat
        );
      
      case STEPS.REVIEW:
        return true;
      
      default:
        return false;
    }
  };
  
  const updateStepValidity = (step, isValid) => {
    setStepsValid(prev => ({ ...prev, [step]: isValid }));
  };
  
  const goToNextStep = () => {
    const isCurrentStepValid = validateStep(currentStep, formData);
    updateStepValidity(currentStep, isCurrentStepValid);
    
    if (isCurrentStepValid) {
      setCurrentStep(prev => prev + 1);
    } else {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields before proceeding.'
      );
    }
  };
  
  const goToPreviousStep = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };
  
  const goToStep = (step) => {
    const highestCompletedStep = Object.entries(stepsValid)
      .filter(([_, isValid]) => isValid)
      .reduce((highest, [step, _]) => Math.max(highest, parseInt(step)), -1);
    
    if (step <= highestCompletedStep + 1) {
      setCurrentStep(step);
    }
  };
  
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      const formDataObj = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (
          key === 'bank_choice' ||
          key === 'telp_choice' ||
          (key === 'foto' && !value)
        ) {
          return;
        }
        
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
      
      console.log('Form data keys being submitted:', Object.keys(formDataObj._parts.reduce((acc, [key]) => {
        acc[key] = true;
        return acc;
      }, {})));
      
      let response;
      
      if (isEditMode) {
        response = await adminShelterKeluargaApi.updateKeluarga(
          existingKeluarga.id_keluarga,
          formDataObj
        );
      } else {
        response = await adminShelterKeluargaApi.createKeluarga(formDataObj);
      }
      
      if (response.data.success) {
        Alert.alert(
          'Success',
          isEditMode
            ? 'Informasi Keluarga Berhasil Diupdate'
            : 'Keluarga Berhasil Ditambahkan',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setError(response.data.message || 'Gagal Menyimpan Informasi Keluarga');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      
      if (err.response?.status === 422) {
        console.error('Validation errors:', err.response.data);
        
        const validationErrors = err.response?.data?.errors || {};
        const errorMessages = Object.entries(validationErrors)
          .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
          .join('\n');
        
        setError(`Validation error:\n${errorMessages || err.response?.data?.message}`);
      } else {
        setError(err.response?.data?.message || 'Gagal Menyimpan Informasi Keluarga');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
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

      case STEPS.SURVEY_BASIC:
        return (
          <KeluargaFormStepSurveyBasic
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.SURVEY_BASIC, isValid)}
            validateStep={() => validateStep(STEPS.SURVEY_BASIC, formData)}
          />
        );

      case STEPS.SURVEY_FINANCIAL:
        return (
          <KeluargaFormStepSurveyFinancial
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.SURVEY_FINANCIAL, isValid)}
            validateStep={() => validateStep(STEPS.SURVEY_FINANCIAL, formData)}
          />
        );

      case STEPS.SURVEY_ASSETS:
        return (
          <KeluargaFormStepSurveyAssets
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.SURVEY_ASSETS, isValid)}
            validateStep={() => validateStep(STEPS.SURVEY_ASSETS, formData)}
          />
        );

      case STEPS.SURVEY_HEALTH:
        return (
          <KeluargaFormStepSurveyHealth
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.SURVEY_HEALTH, isValid)}
            validateStep={() => validateStep(STEPS.SURVEY_HEALTH, formData)}
          />
        );

      case STEPS.SURVEY_RELIGIOUS:
        return (
          <KeluargaFormStepSurveyReligious
            formData={formData}
            onChange={handleChange}
            setStepValid={(isValid) => updateStepValidity(STEPS.SURVEY_RELIGIOUS, isValid)}
            validateStep={() => validateStep(STEPS.SURVEY_RELIGIOUS, formData)}
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
  
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading form..." />;
  }
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
      keyboardVerticalOffset={100}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
        
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
        
        <Text style={styles.stepTitle}>
          {currentStep === STEPS.FAMILY && 'Data Keluarga'}
          {currentStep === STEPS.PARENTS && 'Data Orang tua'}
          {currentStep === STEPS.GUARDIAN && 'Data Wali'}
          {currentStep === STEPS.CHILD && 'Data Anak'}
          {currentStep === STEPS.EDUCATION && 'Data Pendidikan'}
          {currentStep === STEPS.SURVEY_BASIC && 'Data Dasar Survei'}
          {currentStep === STEPS.SURVEY_FINANCIAL && 'Data Keuangan'}
          {currentStep === STEPS.SURVEY_ASSETS && 'Data Aset'}
          {currentStep === STEPS.SURVEY_HEALTH && 'Data Kesehatan'}
          {currentStep === STEPS.SURVEY_RELIGIOUS && 'Data Keagamaan'}
          {currentStep === STEPS.REVIEW && 'Review'}
        </Text>
        
        <View style={styles.formContainer}>
          {renderCurrentStep()}
        </View>
        
        <View style={styles.buttonsContainer}>
          {currentStep > 0 && (
            <Button
              title="Kembali"
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
              title={isEditMode ? "Edit" : "Simpan"}
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  currentStep: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  validStep: {
    backgroundColor: '#2ecc71',
    borderColor: '#2ecc71',
  },
  stepNumber: {
    fontSize: 12,
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