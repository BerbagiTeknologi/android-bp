import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import components
import TextInput from '../../../../common/components/TextInput';

const KeluargaFormStepGuardian = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  // State for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Validate on mount and when form data changes
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.nik_wali,
    formData.nama_wali
  ]);
  
  // Religion options
  const religionOptions = [
    { label: '-- Pilih Agama --', value: '' },
    { label: 'Islam', value: 'Islam' },
    { label: 'Kristen', value: 'Kristen' },
    { label: 'Katolik', value: 'Katolik' },
    { label: 'Hindu', value: 'Hindu' },
    { label: 'Buddha', value: 'Buddha' },
    { label: 'Konghucu', value: 'Konghucu' },
  ];
  
  // Income options
  const incomeOptions = [
    { label: '-- Pilih Penghasilan --', value: '' },
    { label: 'Kurang dari Rp 1.000.000', value: 'Kurang dari Rp 1.000.000' },
    { label: 'Rp 1.000.000 - Rp 3.000.000', value: 'Rp 1.000.000 - Rp 3.000.000' },
    { label: 'Rp 3.000.001 - Rp 5.000.000', value: 'Rp 3.000.001 - Rp 5.000.000' },
    { label: 'Rp 5.000.001 - Rp 10.000.000', value: 'Rp 5.000.001 - Rp 10.000.000' },
    { label: 'Lebih dari Rp 10.000.000', value: 'Lebih dari Rp 10.000.000' },
  ];
  
  // Relation options
  const relationOptions = [
    { label: '-- Pilih Hubungan --', value: '' },
    { label: 'Kakek/Nenek', value: 'Kakek/Nenek' },
    { label: 'Paman/Bibi', value: 'Paman/Bibi' },
    { label: 'Saudara Kandung', value: 'Saudara Kandung' },
    { label: 'Sepupu', value: 'Sepupu' },
    { label: 'Tetangga', value: 'Tetangga' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];
  
  // Toggle date picker
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    toggleDatePicker();
    
    if (selectedDate) {
      // Format date as DD-MM-YYYY
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      onChange('tanggal_lahir_wali', formattedDate);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Wali</Text>
      
      <View style={styles.helperTextContainer}>
        <Text style={styles.helperText}>
          Bagian ini opsional dan hanya diperlukan jika anak tinggal dengan wali selain orang tua.
          Jika anak tinggal dengan salah satu atau kedua orang tua, Anda dapat membiarkan bagian ini kosong.
        </Text>
      </View>
      
      {/* Guardian's NIK */}
      <TextInput
        label="NIK Wali"
        value={formData.nik_wali}
        onChangeText={(value) => onChange('nik_wali', value)}
        placeholder=""
        leftIcon={<Ionicons name="card-outline" size={20} color="#777" />}
        inputProps={{ maxLength: 16, keyboardType: 'numeric' }}
      />
      
      {/* Guardian's Name */}
      <TextInput
        label="Nama Lengkap"
        value={formData.nama_wali}
        onChangeText={(value) => onChange('nama_wali', value)}
        placeholder=""
        leftIcon={<Ionicons name="person-outline" size={20} color="#777" />}
      />
      
      {/* Relation to Child */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Hubungan Kerabat</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.hub_kerabat_wali}
            onValueChange={(value) => onChange('hub_kerabat_wali', value)}
            style={styles.picker}
          >
            {relationOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>
      
      {/* Religion */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Agama Wali</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.agama_wali}
            onValueChange={(value) => onChange('agama_wali', value)}
            style={styles.picker}
          >
            {religionOptions.map((option, index) => (
              <Picker.Item 
                key={index}
                label={option.label} 
                value={option.value} 
              />
            ))}
          </Picker>
        </View>
      </View>
      
      {/* Place of Birth */}
      <TextInput
        label="Tempat Lahir Wali"
        value={formData.tempat_lahir_wali}
        onChangeText={(value) => onChange('tempat_lahir_wali', value)}
        placeholder=""
        leftIcon={<Ionicons name="location-outline" size={20} color="#777" />}
      />
      
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tanggal Lahir Wali</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={toggleDatePicker}
        >
          <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {formData.tanggal_lahir_wali || 'Pilih Tanggal'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.tanggal_lahir_wali ? new Date(formData.tanggal_lahir_wali.split('-').reverse().join('-')) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      {/* Address */}
      <TextInput
        label="Alamat Wali"
        value={formData.alamat_wali}
        onChangeText={(value) => onChange('alamat_wali', value)}
        placeholder=""
        multiline
        inputProps={{ numberOfLines: 3 }}
      />
      
      {/* Income */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Penghasilan Bulanan</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.penghasilan_wali}
            onValueChange={(value) => onChange('penghasilan_wali', value)}
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
  dateInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  dateIcon: {
    marginRight: 8,
  },
  dateText: {
    fontSize: 16,
    color: '#333',
  },
  helperTextContainer: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  helperText: {
    fontSize: 14,
    color: '#666',
  },
});

export default KeluargaFormStepGuardian;