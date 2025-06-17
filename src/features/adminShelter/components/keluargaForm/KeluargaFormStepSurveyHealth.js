import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepSurveyHealth = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.jumlah_makan,
    formData.sumber_air_bersih,
    formData.jamban_limbah,
    formData.tempat_sampah,
    formData.perokok,
    formData.konsumen_miras,
    formData.persediaan_p3k,
    formData.makan_buah_sayur
  ]);

  const mealOptions = [
    { label: '-- Pilih Jumlah Makan --', value: '' },
    { label: '1 Kali', value: '1' },
    { label: '2 Kali', value: '2' },
    { label: '3 Kali', value: '3' },
    { label: 'Lebih dari 3 Kali', value: '4' },
  ];

  const waterSourceOptions = [
    { label: '-- Pilih Sumber Air --', value: '' },
    { label: 'PDAM', value: 'PDAM' },
    { label: 'Sumur', value: 'Sumur' },
    { label: 'Sungai', value: 'Sungai' },
    { label: 'Air Hujan', value: 'Air Hujan' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const toiletOptions = [
    { label: '-- Pilih Jenis Jamban --', value: '' },
    { label: 'Sendiri', value: 'Sendiri' },
    { label: 'Umum', value: 'Umum' },
    { label: 'Tidak Ada', value: 'Tidak Ada' },
  ];

  const trashOptions = [
    { label: '-- Pilih Tempat Sampah --', value: '' },
    { label: 'Ada', value: 'Ada' },
    { label: 'Tidak Ada', value: 'Tidak Ada' },
  ];

  const yesNoOptions = [
    { label: '-- Pilih --', value: '' },
    { label: 'Ya', value: 'Ya' },
    { label: 'Tidak', value: 'Tidak' },
  ];

  const availabilityOptions = [
    { label: '-- Pilih --', value: '' },
    { label: 'Ada', value: 'Ada' },
    { label: 'Tidak Ada', value: 'Tidak Ada' },
  ];

  const frequencyOptions = [
    { label: '-- Pilih Frekuensi --', value: '' },
    { label: 'Selalu', value: 'Selalu' },
    { label: 'Kadang-kadang', value: 'Kadang-kadang' },
    { label: 'Tidak Pernah', value: 'Tidak Pernah' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Kesehatan</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Jumlah Makan per Hari*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.jumlah_makan}
            onValueChange={(value) => onChange('jumlah_makan', value)}
            style={styles.picker}
          >
            {mealOptions.map((option, index) => (
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
        <Text style={styles.label}>Sumber Air Bersih*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.sumber_air_bersih}
            onValueChange={(value) => onChange('sumber_air_bersih', value)}
            style={styles.picker}
          >
            {waterSourceOptions.map((option, index) => (
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
        <Text style={styles.label}>Jamban/Limbah*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.jamban_limbah}
            onValueChange={(value) => onChange('jamban_limbah', value)}
            style={styles.picker}
          >
            {toiletOptions.map((option, index) => (
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
        <Text style={styles.label}>Tempat Sampah*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.tempat_sampah}
            onValueChange={(value) => onChange('tempat_sampah', value)}
            style={styles.picker}
          >
            {trashOptions.map((option, index) => (
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
        <Text style={styles.label}>Ada yang Merokok*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.perokok}
            onValueChange={(value) => onChange('perokok', value)}
            style={styles.picker}
          >
            {yesNoOptions.map((option, index) => (
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
        <Text style={styles.label}>Konsumen Minuman Keras*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.konsumen_miras}
            onValueChange={(value) => onChange('konsumen_miras', value)}
            style={styles.picker}
          >
            {yesNoOptions.map((option, index) => (
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
        <Text style={styles.label}>Persediaan P3K*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.persediaan_p3k}
            onValueChange={(value) => onChange('persediaan_p3k', value)}
            style={styles.picker}
          >
            {availabilityOptions.map((option, index) => (
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
        <Text style={styles.label}>Makan Buah dan Sayur*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.makan_buah_sayur}
            onValueChange={(value) => onChange('makan_buah_sayur', value)}
            style={styles.picker}
          >
            {frequencyOptions.map((option, index) => (
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

export default KeluargaFormStepSurveyHealth;