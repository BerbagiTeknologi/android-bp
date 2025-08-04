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

const KeluargaFormStepParents = ({
  formData,
  onChange,
  setStepValid,
  validateStep
}) => {
  // Always show both parent forms, but determine which fields to show based on status
  const shouldShowFatherForm = true; // Always show father form
  const shouldShowMotherForm = true; // Always show mother form
  
  // For deceased parents, only show limited fields (name, death date, cause of death)
  const isFatherDeceased = formData.status_ortu === 'yatim' || formData.status_ortu === 'yatim piatu';
  const isMotherDeceased = formData.status_ortu === 'piatu' || formData.status_ortu === 'yatim piatu';
  
  // State for date pickers
  const [showDatePicker, setShowDatePicker] = useState({
    fatherBirth: false,
    fatherDeath: false,
    motherBirth: false,
    motherDeath: false,
  });
  
  // Validate on mount and when form data changes
  useEffect(() => {
    const isValid = validateStep();
    setStepValid(isValid);
  }, [
    formData.nik_ayah,
    formData.nama_ayah,
    formData.nik_ibu,
    formData.nama_ibu
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
  
  // Toggle date picker
  const toggleDatePicker = (field) => {
    setShowDatePicker(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate, field) => {
    toggleDatePicker(field);
    
    if (selectedDate) {
      // Format date as DD-MM-YYYY
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      const formattedDate = `${day}-${month}-${year}`;
      
      switch (field) {
        case 'fatherBirth':
          onChange('tanggal_lahir_ayah', formattedDate);
          break;
        case 'fatherDeath':
          onChange('tanggal_kematian_ayah', formattedDate);
          break;
        case 'motherBirth':
          onChange('tanggal_lahir_ibu', formattedDate);
          break;
        case 'motherDeath':
          onChange('tanggal_kematian_ibu', formattedDate);
          break;
      }
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Father Information */}
      {shouldShowFatherForm && (
        <>
          <Text style={styles.sectionTitle}>Data Ayah</Text>
      
      {/* Father's Name - Always shown */}
      <TextInput
        label="Nama Lengkap Ayah*"
        value={formData.nama_ayah}
        onChangeText={(value) => onChange('nama_ayah', value)}
        placeholder=""
        leftIcon={<Ionicons name="person-outline" size={20} color="#777" />}
      />
      
      {/* For deceased father, only show death-related fields */}
      {isFatherDeceased ? (
        <>
          {/* Date of Death */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tanggal Kematian Ayah*</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => toggleDatePicker('fatherDeath')}
            >
              <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
              <Text style={styles.dateText}>
                {formData.tanggal_kematian_ayah || 'Pilih Tanggal Kematian'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker.fatherDeath && (
              <DateTimePicker
                value={formData.tanggal_kematian_ayah ? new Date(formData.tanggal_kematian_ayah.split('-').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'fatherDeath')}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* Cause of Death */}
          <TextInput
            label="Penyebab Kematian Ayah*"
            value={formData.penyebab_kematian_ayah}
            onChangeText={(value) => onChange('penyebab_kematian_ayah', value)}
            placeholder=""
            leftIcon={<Ionicons name="information-circle-outline" size={20} color="#777" />}
          />
        </>
      ) : (
        <>
          {/* For living father, show all fields */}
          
          {/* Father's NIK */}
          <TextInput
            label="NIK Ayah*"
            value={formData.nik_ayah}
            onChangeText={(value) => onChange('nik_ayah', value)}
            placeholder=""
            leftIcon={<Ionicons name="card-outline" size={20} color="#777" />}
            inputProps={{ maxLength: 16, keyboardType: 'numeric' }}
          />
        <>
          {/* For living father, show all fields */}
      
      {/* Religion */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Agama Ayah</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.agama_ayah}
            onValueChange={(value) => onChange('agama_ayah', value)}
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
        label="Tempat Lahir"
        value={formData.tempat_lahir_ayah}
        onChangeText={(value) => onChange('tempat_lahir_ayah', value)}
        placeholder=""
        leftIcon={<Ionicons name="location-outline" size={20} color="#777" />}
      />
      
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tanggal Lahir Ayah</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => toggleDatePicker('fatherBirth')}
        >
          <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {formData.tanggal_lahir_ayah || 'Pilih Tanggal Lahir'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker.fatherBirth && (
          <DateTimePicker
            value={formData.tanggal_lahir_ayah ? new Date(formData.tanggal_lahir_ayah.split('-').reverse().join('-')) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'fatherBirth')}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      {/* Address */}
      <TextInput
        label="Alamat Ayah"
        value={formData.alamat_ayah}
        onChangeText={(value) => onChange('alamat_ayah', value)}
        placeholder=""
        multiline
        inputProps={{ numberOfLines: 3 }}
        
      />
      
      {/* Income */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Penghasilan Bulanan Ayah</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.penghasilan_ayah}
            onValueChange={(value) => onChange('penghasilan_ayah', value)}
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
      
          {/* Date of Death - Optional for living parents */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Isi jika sudah meninggal</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => toggleDatePicker('fatherDeath')}
            >
              <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
              <Text style={styles.dateText}>
                {formData.tanggal_kematian_ayah || 'Tanggal Kematian'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker.fatherDeath && (
              <DateTimePicker
                value={formData.tanggal_kematian_ayah ? new Date(formData.tanggal_kematian_ayah.split('-').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'fatherDeath')}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* Cause of Death */}
          {formData.tanggal_kematian_ayah && (
            <TextInput
              label="Penyebab Kematian"
              value={formData.penyebab_kematian_ayah}
              onChangeText={(value) => onChange('penyebab_kematian_ayah', value)}
              placeholder=""
              leftIcon={<Ionicons name="information-circle-outline" size={20} color="#777" />}
            />
          )}
        </>
      )}
        </>
      )}
      
      
      {shouldShowFatherForm && shouldShowMotherForm && (
        <View style={styles.separator} />
      )}
      
      {/* Mother Information */}
      {shouldShowMotherForm && (
        <>
          <Text style={styles.sectionTitle}>Data Ibu</Text>
      
      {/* Mother's Name - Always shown */}
      <TextInput
        label="Nama Lengkap Ibu*"
        value={formData.nama_ibu}
        onChangeText={(value) => onChange('nama_ibu', value)}
        placeholder=""
        leftIcon={<Ionicons name="person-outline" size={20} color="#777" />}
      />
      
      {/* For deceased mother, only show death-related fields */}
      {isMotherDeceased ? (
        <>
          {/* Date of Death */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Tanggal Kematian Ibu*</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => toggleDatePicker('motherDeath')}
            >
              <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
              <Text style={styles.dateText}>
                {formData.tanggal_kematian_ibu || 'Pilih Tanggal Kematian'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker.motherDeath && (
              <DateTimePicker
                value={formData.tanggal_kematian_ibu ? new Date(formData.tanggal_kematian_ibu.split('-').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'motherDeath')}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* Cause of Death */}
          <TextInput
            label="Penyebab Kematian Ibu*"
            value={formData.penyebab_kematian_ibu}
            onChangeText={(value) => onChange('penyebab_kematian_ibu', value)}
            placeholder=""
            leftIcon={<Ionicons name="information-circle-outline" size={20} color="#777" />}
          />
        </>
      ) : (
        <>
          {/* For living mother, show all fields */}
          
          {/* Mother's NIK */}
          <TextInput
            label="NIK Ibu*"
            value={formData.nik_ibu}
            onChangeText={(value) => onChange('nik_ibu', value)}
            placeholder=""
            leftIcon={<Ionicons name="card-outline" size={20} color="#777" />}
            inputProps={{ maxLength: 16, keyboardType: 'numeric' }}
          />
        <>
          {/* For living mother, show all fields */}
      
      {/* Religion */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Agama Ibu</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.agama_ibu}
            onValueChange={(value) => onChange('agama_ibu', value)}
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
        label="Tempat Lahir"
        value={formData.tempat_lahir_ibu}
        onChangeText={(value) => onChange('tempat_lahir_ibu', value)}
        placeholder=""
        leftIcon={<Ionicons name="location-outline" size={20} color="#777" />}
      />
      
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tanggal Lahir</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => toggleDatePicker('motherBirth')}
        >
          <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            {formData.tanggal_lahir_ibu || 'Pilih Tanggal Lahir'}
          </Text>
        </TouchableOpacity>
        
        {showDatePicker.motherBirth && (
          <DateTimePicker
            value={formData.tanggal_lahir_ibu ? new Date(formData.tanggal_lahir_ibu.split('-').reverse().join('-')) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'motherBirth')}
            maximumDate={new Date()}
          />
        )}
      </View>
      
      {/* Address */}
      <TextInput
        label="Alamat Ibu"
        value={formData.alamat_ibu}
        onChangeText={(value) => onChange('alamat_ibu', value)}
        placeholder=""
        multiline
        inputProps={{ numberOfLines: 3 }}
      />
      
      {/* Income */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Penghasilan Bulanan Ibu</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.penghasilan_ibu}
            onValueChange={(value) => onChange('penghasilan_ibu', value)}
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
      
          {/* Date of Death - Optional for living parents */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Isi Jika Sudah Meninggal</Text>
            <TouchableOpacity
              style={styles.dateInput}
              onPress={() => toggleDatePicker('motherDeath')}
            >
              <Ionicons name="calendar-outline" size={20} color="#777" style={styles.dateIcon} />
              <Text style={styles.dateText}>
                {formData.tanggal_kematian_ibu || 'Pilih Tanggal Kematian'}
              </Text>
            </TouchableOpacity>
            
            {showDatePicker.motherDeath && (
              <DateTimePicker
                value={formData.tanggal_kematian_ibu ? new Date(formData.tanggal_kematian_ibu.split('-').reverse().join('-')) : new Date()}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => handleDateChange(event, selectedDate, 'motherDeath')}
                maximumDate={new Date()}
              />
            )}
          </View>
          
          {/* Cause of Death */}
          {formData.tanggal_kematian_ibu && (
            <TextInput
              label="Penyebab Kematian Ibu"
              value={formData.penyebab_kematian_ibu}
              onChangeText={(value) => onChange('penyebab_kematian_ibu', value)}
              placeholder=""
              leftIcon={<Ionicons name="information-circle-outline" size={20} color="#777" />}
            />
          )}
        </>
      )}
        </>
      )}
      
      <View style={styles.helperTextContainer}>
        <Text style={styles.helperText}>
          * Field yang ditampilkan disesuaikan dengan status orang tua.
        </Text>
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
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 20,
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
    fontStyle: 'italic',
  },
  noDataContainer: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default KeluargaFormStepParents;