import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepSurveyFinancial = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.penghasilan,
    formData.kepemilikan_tabungan,
    formData.biaya_pendidikan_perbulan,
    formData.bantuan_lembaga_formal_lain
  ]);

  const incomeOptions = [
    { label: '-- Pilih Penghasilan --', value: '' },
    { label: 'Kurang dari Rp 500.000', value: 'Kurang dari Rp 500.000' },
    { label: 'Rp 500.000 - Rp 1.000.000', value: 'Rp 500.000 - Rp 1.000.000' },
    { label: 'Rp 1.000.000 - Rp 2.000.000', value: 'Rp 1.000.000 - Rp 2.000.000' },
    { label: 'Rp 2.000.000 - Rp 3.000.000', value: 'Rp 2.000.000 - Rp 3.000.000' },
    { label: 'Rp 3.000.000 - Rp 5.000.000', value: 'Rp 3.000.000 - Rp 5.000.000' },
    { label: 'Lebih dari Rp 5.000.000', value: 'Lebih dari Rp 5.000.000' },
  ];

  const savingsOptions = [
    { label: '-- Pilih Kepemilikan Tabungan --', value: '' },
    { label: 'Ada', value: 'Ada' },
    { label: 'Tidak Ada', value: 'Tidak Ada' },
  ];

  const assistanceOptions = [
    { label: '-- Pilih Bantuan Lembaga --', value: '' },
    { label: 'Ya', value: 'Ya' },
    { label: 'Tidak', value: 'Tidak' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Keuangan</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Penghasilan Bulanan*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.penghasilan}
            onValueChange={(value) => onChange('penghasilan', value)}
            style={styles.picker}
          >
            {incomeOptions.map((option, index) => (
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
        <Text style={styles.label}>Kepemilikan Tabungan*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.kepemilikan_tabungan}
            onValueChange={(value) => onChange('kepemilikan_tabungan', value)}
            style={styles.picker}
          >
            {savingsOptions.map((option, index) => (
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
        label="Biaya Pendidikan per Bulan*"
        value={formData.biaya_pendidikan_perbulan}
        onChangeText={(value) => onChange('biaya_pendidikan_perbulan', value)}
        placeholder="Contoh: 500000"
        leftIcon={<Ionicons name="school-outline" size={20} color="#777" />}
        inputProps={{ keyboardType: 'numeric' }}
      />

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bantuan Lembaga Formal Lain*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.bantuan_lembaga_formal_lain}
            onValueChange={(value) => onChange('bantuan_lembaga_formal_lain', value)}
            style={styles.picker}
          >
            {assistanceOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>

      {formData.bantuan_lembaga_formal_lain === 'Ya' && (
        <TextInput
          label="Jumlah Bantuan per Bulan"
          value={formData.bantuan_lembaga_formal_lain_sebesar}
          onChangeText={(value) => onChange('bantuan_lembaga_formal_lain_sebesar', value)}
          placeholder="Contoh: 200000"
          leftIcon={<Ionicons name="cash-outline" size={20} color="#777" />}
          inputProps={{ keyboardType: 'numeric' }}
        />
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
});

export default KeluargaFormStepSurveyFinancial;