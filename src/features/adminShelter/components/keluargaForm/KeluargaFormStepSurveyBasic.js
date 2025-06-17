import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepSurveyBasic = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.pekerjaan_kepala_keluarga,
    formData.pendidikan_kepala_keluarga,
    formData.jumlah_tanggungan,
    formData.status_anak
  ]);

  const jobOptions = [
    { label: '-- Pilih Pekerjaan --', value: '' },
    { label: 'Tidak Bekerja', value: 'Tidak Bekerja' },
    { label: 'Petani', value: 'Petani' },
    { label: 'Pedagang', value: 'Pedagang' },
    { label: 'Buruh', value: 'Buruh' },
    { label: 'Karyawan Swasta', value: 'Karyawan Swasta' },
    { label: 'PNS', value: 'PNS' },
    { label: 'Wiraswasta', value: 'Wiraswasta' },
    { label: 'Nelayan', value: 'Nelayan' },
    { label: 'Supir', value: 'Supir' },
    { label: 'Tukang', value: 'Tukang' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const educationOptions = [
    { label: '-- Pilih Pendidikan --', value: '' },
    { label: 'Tidak Sekolah', value: 'Tidak Sekolah' },
    { label: 'SD/Sederajat', value: 'SD/Sederajat' },
    { label: 'SMP/Sederajat', value: 'SMP/Sederajat' },
    { label: 'SMA/Sederajat', value: 'SMA/Sederajat' },
    { label: 'Diploma', value: 'Diploma' },
    { label: 'Sarjana', value: 'Sarjana' },
    { label: 'Pascasarjana', value: 'Pascasarjana' },
  ];

  const childStatusOptions = [
    { label: '-- Pilih Status Anak --', value: '' },
    { label: 'Baik', value: 'Baik' },
    { label: 'Kurang Baik', value: 'Kurang Baik' },
    { label: 'Bermasalah', value: 'Bermasalah' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Dasar Survei</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pekerjaan Kepala Keluarga*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.pekerjaan_kepala_keluarga}
            onValueChange={(value) => onChange('pekerjaan_kepala_keluarga', value)}
            style={styles.picker}
          >
            {jobOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pendidikan Kepala Keluarga*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.pendidikan_kepala_keluarga}
            onValueChange={(value) => onChange('pendidikan_kepala_keluarga', value)}
            style={styles.picker}
          >
            {educationOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <TextInput
        label="Jumlah Tanggungan*"
        value={formData.jumlah_tanggungan}
        onChangeText={(value) => onChange('jumlah_tanggungan', value)}
        placeholder="Contoh: 4"
        leftIcon={<Ionicons name="people-outline" size={20} color="#777" />}
        inputProps={{ keyboardType: 'numeric' }}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Status Anak*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.status_anak}
            onValueChange={(value) => onChange('status_anak', value)}
            style={styles.picker}
          >
            {childStatusOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>
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
});

export default KeluargaFormStepSurveyBasic;