import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepSurveyReligious = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.solat_lima_waktu,
    formData.membaca_alquran,
    formData.majelis_taklim,
    formData.membaca_koran,
    formData.pengurus_organisasi,
    formData.kondisi_penerima_manfaat
  ]);

  const frequencyOptions = [
    { label: '-- Pilih Frekuensi --', value: '' },
    { label: 'Selalu', value: 'Selalu' },
    { label: 'Kadang-kadang', value: 'Kadang-kadang' },
    { label: 'Tidak Pernah', value: 'Tidak Pernah' },
  ];

  const activityOptions = [
    { label: '-- Pilih Status --', value: '' },
    { label: 'Aktif', value: 'Aktif' },
    { label: 'Tidak Aktif', value: 'Tidak Aktif' },
  ];

  const yesNoOptions = [
    { label: '-- Pilih --', value: '' },
    { label: 'Ya', value: 'Ya' },
    { label: 'Tidak', value: 'Tidak' },
  ];

  const beneficiaryConditionOptions = [
    { label: '-- Pilih Kondisi --', value: '' },
    { label: 'Sangat Membutuhkan', value: 'Sangat Membutuhkan' },
    { label: 'Membutuhkan', value: 'Membutuhkan' },
    { label: 'Cukup', value: 'Cukup' },
    { label: 'Baik', value: 'Baik' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Keagamaan & Sosial</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Sholat Lima Waktu*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.solat_lima_waktu}
            onValueChange={(value) => onChange('solat_lima_waktu', value)}
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Membaca Al-Quran*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.membaca_alquran}
            onValueChange={(value) => onChange('membaca_alquran', value)}
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Majelis Taklim*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.majelis_taklim}
            onValueChange={(value) => onChange('majelis_taklim', value)}
            style={styles.picker}
          >
            {activityOptions.map((option, index) => (
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
        <Text style={styles.label}>Membaca Koran/Berita*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.membaca_koran}
            onValueChange={(value) => onChange('membaca_koran', value)}
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Pengurus Organisasi*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.pengurus_organisasi}
            onValueChange={(value) => onChange('pengurus_organisasi', value)}
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

      {formData.pengurus_organisasi === 'Ya' && (
        <TextInput
          label="Pengurus Organisasi Sebagai"
          value={formData.pengurus_organisasi_sebagai}
          onChangeText={(value) => onChange('pengurus_organisasi_sebagai', value)}
          placeholder="Contoh: Ketua RT, Sekretaris Masjid"
          leftIcon={<Ionicons name="people-outline" size={20} color="#777" />}
        />
      )}

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kondisi Penerima Manfaat*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kondisi_penerima_manfaat}
            onValueChange={(value) => onChange('kondisi_penerima_manfaat', value)}
            style={styles.picker}
          >
            {beneficiaryConditionOptions.map((option, index) => (
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

export default KeluargaFormStepSurveyReligious;