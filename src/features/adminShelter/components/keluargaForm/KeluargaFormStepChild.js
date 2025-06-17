import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';

import TextInput from '../../../../common/components/TextInput';
import Button from '../../../../common/components/Button';
import { formatDateForApi } from '../../../../common/utils/dateFormatter';

const KeluargaFormStepChild = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.nik_anak,
    formData.nick_name,
    formData.full_name,
    formData.tanggal_lahir,
    formData.jenis_kelamin,
    formData.agama,
    formData.tinggal_bersama
  ]);
  
  const religionOptions = [
    { label: '-- Pilih Agama --', value: '' },
    { label: 'Islam', value: 'Islam' },
    { label: 'Kristen', value: 'Kristen' },
    { label: 'Katolik', value: 'Katolik' },
    { label: 'Hindu', value: 'Hindu' },
    { label: 'Buddha', value: 'Buddha' },
    { label: 'Konghucu', value: 'Konghucu' },
  ];
  
  const genderOptions = [
    { label: '-- Pilih Jenis Kelamin --', value: '' },
     { label: 'Laki-laki', value: 'Laki-laki' },
  { label: 'Perempuan', value: 'Perempuan' },
  ];
  
  const livingWithOptions = [
    { label: '-- Pilih Tinggal Bersama --', value: '' },
    { label: 'Ayah', value: 'Ayah' },
    { label: 'Ibu', value: 'Ibu' },
    { label: 'Wali', value: 'Wali' },
  ];
  
  const hafalanOptions = [
    { label: '-- Pilih Hafalan --', value: '' },
    { label: 'Tahfidz', value: 'Tahfidz' },
    { label: 'Non-Tahfidz', value: 'Non-Tahfidz' },
  ];
  
  const transportationOptions = [
    { label: '-- Pilih transportasi --', value: '' },
    { label: 'Jalan Kaki', value: 'Jalan Kaki' },
    { label: 'Sepeda', value: 'Sepeda' },
    { label: 'Sepeda Motor', value: 'Sepeda Motor' },
    { label: 'Angkutan Umum', value: 'Angkutan Umum' },
    { label: 'Mobil', value: 'Mobil' },
    { label: 'Lainnya', value: 'Lainnya' },
  ];
  
  const toggleDatePicker = () => {
    setShowDatePicker(!showDatePicker);
  };
  
  const handleDateChange = (event, selectedDate) => {
  toggleDatePicker();
  
  if (selectedDate) {
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const year = selectedDate.getFullYear();
    const formattedDate = `${day}-${month}-${year}`;
    
    onChange('tanggal_lahir', formattedDate);
  }
};
  
  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        alert('Permission to access camera roll is required!');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        onChange('foto', result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Failed to select image');
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Data Anak</Text>
      
      <View style={styles.photoContainer}>
        <Text style={styles.label}>Foto Anak</Text>
        <View style={styles.photoContent}>
          {formData.foto ? (
            <Image 
              source={{ uri: formData.foto.uri }} 
              style={styles.photoPreview} 
            />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Ionicons name="person" size={40} color="#ddd" />
            </View>
          )}
          
          <Button
            title={formData.foto ? "Ganti Foto" : "Pilih Foto"}
            onPress={handleSelectImage}
            type="outline"
            size="small"
            style={styles.photoButton}
            leftIcon={<Ionicons name="camera-outline" size={18} color="#3498db" />}
          />
        </View>
      </View>
      
      <TextInput
        label="NIK Anak*"
        value={formData.nik_anak}
        onChangeText={(value) => onChange('nik_anak', value)}
        placeholder=""
        leftIcon={<Ionicons name="card-outline" size={20} color="#777" />}
        inputProps={{ maxLength: 16, keyboardType: 'numeric' }}
      />
      
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, styles.inputHalf]}>
          <Text style={styles.label}>Anak ke*</Text>
          <TextInput
            value={formData.anak_ke}
            onChangeText={(value) => onChange('anak_ke', value)}
            placeholder="contoh: 2"
            inputProps={{ keyboardType: 'numeric' }}
          />
        </View>
        
        <View style={[styles.inputContainer, styles.inputHalf]}>
          <Text style={styles.label}>Dari Berapa Bersaudara*</Text>
          <TextInput
            value={formData.dari_bersaudara}
            onChangeText={(value) => onChange('dari_bersaudara', value)}
            placeholder="Contoh: 2"
            inputProps={{ keyboardType: 'numeric' }}
          />
        </View>
      </View>
      
      <TextInput
        label="Nama Panggilan Anak*"
        value={formData.nick_name}
        onChangeText={(value) => onChange('nick_name', value)}
        placeholder=""
        leftIcon={<Ionicons name="person-outline" size={20} color="#777" />}
      />
      
      <TextInput
        label="Nama Lengkap Anak*"
        value={formData.full_name}
        onChangeText={(value) => onChange('full_name', value)}
        placeholder=""
        leftIcon={<Ionicons name="person-outline" size={20} color="#777" />}
      />
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Jenis Kelamin*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.jenis_kelamin}
            onValueChange={(value) => onChange('jenis_kelamin', value)}
            style={styles.picker}
          >
            {genderOptions.map((option, index) => (
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
        <Text style={styles.label}>Agama Anak*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.agama}
            onValueChange={(value) => onChange('agama', value)}
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
      
      <TextInput
        label="Tempat Lahir*"
        value={formData.tempat_lahir}
        onChangeText={(value) => onChange('tempat_lahir', value)}
        placeholder=""
        leftIcon={<Ionicons name="location-outline" size={20} color="#777" />}
      />
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tanggal Lahir*</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={toggleDatePicker}
        >
          <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {formData.tanggal_lahir || 'Pilih Tanggal'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.tanggal_lahir ? new Date(formData.tanggal_lahir.split('-').reverse().join('-')) : new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tinggal Bersama*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.tinggal_bersama}
            onValueChange={(value) => onChange('tinggal_bersama', value)}
            style={styles.picker}
          >
            {livingWithOptions.map((option, index) => (
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
        <Text style={styles.label}>Jenis Hafalan*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.hafalan}
            onValueChange={(value) => onChange('hafalan', value)}
            style={styles.picker}
          >
            {hafalanOptions.map((option, index) => (
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
        label="Pelajaran Favorit"
        value={formData.pelajaran_favorit}
        onChangeText={(value) => onChange('pelajaran_favorit', value)}
        placeholder=""
        leftIcon={<Ionicons name="book-outline" size={20} color="#777" />}
      />
      
      <TextInput
        label="Hobi"
        value={formData.hobi}
        onChangeText={(value) => onChange('hobi', value)}
        placeholder=""
        leftIcon={<Ionicons name="happy-outline" size={20} color="#777" />}
      />
      
      <TextInput
        label="Prestasi"
        value={formData.prestasi}
        onChangeText={(value) => onChange('prestasi', value)}
        placeholder=""
        multiline
        inputProps={{ numberOfLines: 3 }}
      />
      
      <TextInput
        label="Jarak dari rumah"
        value={formData.jarak_rumah}
        onChangeText={(value) => onChange('jarak_rumah', value)}
        placeholder=""
        leftIcon={<Ionicons name="navigate-outline" size={20} color="#777" />}
        inputProps={{ keyboardType: 'numeric' }}
      />
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Transportasi*</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.transportasi}
            onValueChange={(value) => onChange('transportasi', value)}
            style={styles.picker}
          >
            {transportationOptions.map((option, index) => (
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
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
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
  photoContainer: {
    marginBottom: 16,
  },
  photoContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 16,
  },
  photoButton: {
    flex: 1,
  },
});

export default KeluargaFormStepChild;