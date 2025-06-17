import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Import components
import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepEducation = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  // Validate on mount and when form data changes
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.jenjang,
    
  ]);
  
  // Education level options
  const educationLevelOptions = [
    { label: '-- Pilih Tingkat Pendidikan --', value: '' },
    { label: 'Belum Sekolah', value: 'belum_sd' },
    { label: 'SD / Sederajat', value: 'sd' },
    { label: 'SMP / Sederajat', value: 'smp' },
    { label: 'SMA / Sederajat', value: 'sma' },
    { label: 'Perguruan Tinggi', value: 'perguruan_tinggi' },
  ];
  
  // Grade options for SD
  const sdGradeOptions = [
    { label: '-- Pilih Kelas --', value: '' },
    { label: 'Kelas 1', value: 'Kelas 1' },
    { label: 'Kelas 2', value: 'Kelas 2' },
    { label: 'Kelas 3', value: 'Kelas 3' },
    { label: 'Kelas 4', value: 'Kelas 4' },
    { label: 'Kelas 5', value: 'Kelas 5' },
    { label: 'Kelas 6', value: 'Kelas 6' },
  ];
  
  // Grade options for SMP
  const smpGradeOptions = [
    { label: '-- Pilih Kelas --', value: '' },
    { label: 'Kelas 7', value: 'Kelas 7' },
    { label: 'Kelas 8', value: 'Kelas 8' },
    { label: 'Kelas 9', value: 'Kelas 9' },
  ];
  
  // Grade options for SMA
  const smaGradeOptions = [
    { label: '-- Pilih Kelas --', value: '' },
    { label: 'Kelas 10', value: 'Kelas 10' },
    { label: 'Kelas 11', value: 'Kelas 11' },
    { label: 'Kelas 12', value: 'Kelas 12' },
  ];
  
  // Major options for SMA
  const smaMajorOptions = [
    { label: '-- Pilih Jurusan --', value: '' },
    { label: 'IPA', value: 'IPA' },
    { label: 'IPS', value: 'IPS' },
    { label: 'Bahasa', value: 'Bahasa' },
    { label: 'Agama', value: 'Agama' },
    { label: 'Kejuruan', value: 'Kejuruan' },
  ];
  
  // Semester options for college
  const semesterOptions = [
    { label: '-- Pilih Semester --', value: '' },
    { label: 'Semester 1', value: '1' },
    { label: 'Semester 2', value: '2' },
    { label: 'Semester 3', value: '3' },
    { label: 'Semester 4', value: '4' },
    { label: 'Semester 5', value: '5' },
    { label: 'Semester 6', value: '6' },
    { label: 'Semester 7', value: '7' },
    { label: 'Semester 8', value: '8' },
    { label: '> Semester 8', value: '9' },
  ];
  
  // Get grade options based on education level
  const getGradeOptions = () => {
    switch (formData.jenjang) {
      case 'sd':
        return sdGradeOptions;
      case 'smp':
        return smpGradeOptions;
      case 'sma':
        return smaGradeOptions;
      default:
        return [];
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Pendidikan</Text>
      
      {/* Education Level */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tingkat Pendidikan*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.jenjang}
            onValueChange={(value) => onChange('jenjang', value)}
            style={styles.picker}
          >
            {educationLevelOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>
      
      {/* School Level Fields - only show if level is selected and not "belum_sd" */}
      {formData.jenjang && formData.jenjang !== 'belum_sd' && formData.jenjang !== 'perguruan_tinggi' && (
        <>
          {/* Grade */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Kelas</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.kelas}
                onValueChange={(value) => onChange('kelas', value)}
                style={styles.picker}
              >
                {getGradeOptions().map((option, index) => (
                  <Picker.Item 
                    key={index}
                    label={option.label} 
                    value={option.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Major (only for SMA) */}
          {formData.jenjang === 'sma' && (
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Major</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.jurusan}
                  onValueChange={(value) => onChange('jurusan', value)}
                  style={styles.picker}
                >
                  {smaMajorOptions.map((option, index) => (
                    <Picker.Item 
                      key={index}
                      label={option.label} 
                      value={option.value} 
                    />
                  ))}
                </Picker>
              </View>
            </View>
          )}
          
          {/* School Name */}
          <TextInput
            label="Nama Sekolah"
            value={formData.nama_sekolah}
            onChangeText={(value) => onChange('nama_sekolah', value)}
            placeholder=""
            leftIcon={<Ionicons name="school-outline" size={20} color="#777" />}
          />
          
          {/* School Address */}
          <TextInput
            label="Alamat Sekolah"
            value={formData.alamat_sekolah}
            onChangeText={(value) => onChange('alamat_sekolah', value)}
            placeholder=""
            multiline
            inputProps={{ numberOfLines: 3 }}
          />
        </>
      )}
      
      {/* College Fields - only show if level is "perguruan_tinggi" */}
      {formData.jenjang === 'perguruan_tinggi' && (
        <>
          {/* Semester */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Semester</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.semester}
                onValueChange={(value) => onChange('semester', value)}
                style={styles.picker}
              >
                {semesterOptions.map((option, index) => (
                  <Picker.Item 
                    key={index}
                    label={option.label} 
                    value={option.value} 
                  />
                ))}
              </Picker>
            </View>
          </View>
          
          {/* Major */}
          <TextInput
            label="Jurusan"
            value={formData.jurusan}
            onChangeText={(value) => onChange('jurusan', value)}
            placeholder=""
            leftIcon={<Ionicons name="book-outline" size={20} color="#777" />}
          />
          
          {/* College Name */}
          <TextInput
            label="Nama Perguruan Tinggi"
            value={formData.nama_pt}
            onChangeText={(value) => onChange('nama_pt', value)}
            placeholder=""
            leftIcon={<Ionicons name="school-outline" size={20} color="#777" />}
          />
          
          {/* College Address */}
          <TextInput
            label="Alamat Perguruan Tinggi"
            value={formData.alamat_pt}
            onChangeText={(value) => onChange('alamat_pt', value)}
            placeholder=""
            leftIcon={<Ionicons name="location-outline" size={20} color="#777" />}
            multiline
            inputProps={{ numberOfLines: 3 }}
          />
        </>
      )}
      
      {/* If "belum_sd" is selected, show helper text */}
      {formData.jenjang === 'belum_sd' && (
        <View style={styles.helperTextContainer}>
          {/* <Text style={styles.helperText}>
            Child has not yet started formal education. No additional education information is required.
          </Text> */}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  helperTextContainer: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#2ecc71',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
  },
});

export default KeluargaFormStepEducation;