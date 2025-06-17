import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepSurveyAssets = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.kepemilikan_tanah,
    formData.kepemilikan_rumah,
    formData.kondisi_rumah_dinding,
    formData.kondisi_rumah_lantai,
    formData.kepemilikan_kendaraan,
    formData.kepemilikan_elektronik
  ]);

  const landOwnershipOptions = [
    { label: '-- Pilih Kepemilikan Tanah --', value: '' },
    { label: 'Milik Sendiri', value: 'Milik Sendiri' },
    { label: 'Kontrak', value: 'Kontrak' },
    { label: 'Menumpang', value: 'Menumpang' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const houseOwnershipOptions = [
    { label: '-- Pilih Kepemilikan Rumah --', value: '' },
    { label: 'Milik Sendiri', value: 'Milik Sendiri' },
    { label: 'Kontrak', value: 'Kontrak' },
    { label: 'Menumpang', value: 'Menumpang' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const wallConditionOptions = [
    { label: '-- Pilih Kondisi Dinding --', value: '' },
    { label: 'Tembok', value: 'Tembok' },
    { label: 'Semi Tembok', value: 'Semi Tembok' },
    { label: 'Kayu', value: 'Kayu' },
    { label: 'Bambu', value: 'Bambu' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const floorConditionOptions = [
    { label: '-- Pilih Kondisi Lantai --', value: '' },
    { label: 'Keramik', value: 'Keramik' },
    { label: 'Semen', value: 'Semen' },
    { label: 'Tanah', value: 'Tanah' },
    { label: 'Kayu', value: 'Kayu' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];

  const vehicleOptions = [
    { label: '-- Pilih Kepemilikan Kendaraan --', value: '' },
    { label: 'Tidak Ada', value: 'Tidak Ada' },
    { label: 'Sepeda', value: 'Sepeda' },
    { label: 'Sepeda Motor', value: 'Sepeda Motor' },
    { label: 'Mobil', value: 'Mobil' },
    { label: 'Sepeda Motor dan Mobil', value: 'Sepeda Motor dan Mobil' },
  ];

  const electronicOptions = [
    { label: '-- Pilih Kepemilikan Elektronik --', value: '' },
    { label: 'Tidak Ada', value: 'Tidak Ada' },
    { label: 'TV', value: 'TV' },
    { label: 'Kulkas', value: 'Kulkas' },
    { label: 'Mesin Cuci', value: 'Mesin Cuci' },
    { label: 'TV dan Kulkas', value: 'TV dan Kulkas' },
    { label: 'Lengkap', value: 'Lengkap' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Aset</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Kepemilikan Tanah*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kepemilikan_tanah}
            onValueChange={(value) => onChange('kepemilikan_tanah', value)}
            style={styles.picker}
          >
            {landOwnershipOptions.map((option, index) => (
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
        <Text style={styles.label}>Kepemilikan Rumah*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kepemilikan_rumah}
            onValueChange={(value) => onChange('kepemilikan_rumah', value)}
            style={styles.picker}
          >
            {houseOwnershipOptions.map((option, index) => (
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
        <Text style={styles.label}>Kondisi Dinding Rumah*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kondisi_rumah_dinding}
            onValueChange={(value) => onChange('kondisi_rumah_dinding', value)}
            style={styles.picker}
          >
            {wallConditionOptions.map((option, index) => (
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
        <Text style={styles.label}>Kondisi Lantai Rumah*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kondisi_rumah_lantai}
            onValueChange={(value) => onChange('kondisi_rumah_lantai', value)}
            style={styles.picker}
          >
            {floorConditionOptions.map((option, index) => (
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
        <Text style={styles.label}>Kepemilikan Kendaraan*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kepemilikan_kendaraan}
            onValueChange={(value) => onChange('kepemilikan_kendaraan', value)}
            style={styles.picker}
          >
            {vehicleOptions.map((option, index) => (
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
        <Text style={styles.label}>Kepemilikan Elektronik*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kepemilikan_elektronik}
            onValueChange={(value) => onChange('kepemilikan_elektronik', value)}
            style={styles.picker}
          >
            {electronicOptions.map((option, index) => (
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

export default KeluargaFormStepSurveyAssets;