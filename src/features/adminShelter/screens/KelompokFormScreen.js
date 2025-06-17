import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminShelterKelompokApi } from '../api/adminShelterKelompokApi';
import { useAuth } from '../../../common/hooks/useAuth';

const KelompokFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  
  // Get kelompok from route params if editing
  const existingKelompok = route.params?.kelompok;
  const isEditMode = !!existingKelompok;
  
  // Form state
  const [formData, setFormData] = useState({
    nama_kelompok: existingKelompok?.nama_kelompok || '',
    id_level_anak_binaan: existingKelompok?.level_anak_binaan?.id_level_anak_binaan || '',
    jumlah_anggota: existingKelompok?.jumlah_anggota?.toString() || '0'
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [levels, setLevels] = useState([]);
  
  // Fetch levels for dropdown
  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await adminShelterKelompokApi.getLevels();
        if (response.data.success) {
          setLevels(response.data.data || []);
        }
      } catch (err) {
        console.error('Error fetching levels:', err);
        setError('Failed to load level options. Please try again.');
      }
    };
    
    fetchLevels();
  }, []);
  
  // Handle text input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Form validation
  const validateForm = () => {
    const errors = {};
    
    if (!formData.nama_kelompok.trim()) {
      errors.nama_kelompok = 'Nama kelompok wajib diisi';
    }
    
    if (!formData.id_level_anak_binaan) {
      errors.id_level_anak_binaan = 'Tingkat wajib diisi';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    // Validate form
    const { isValid, errors } = validateForm();
    
    if (!isValid) {
      // Show first error message
      Alert.alert('Validation Error', Object.values(errors)[0]);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Convert jumlah_anggota to number
      const submitData = {
        ...formData,
        jumlah_anggota: parseInt(formData.jumlah_anggota || '0', 10)
      };
      
      let response;
      
      if (isEditMode) {
        response = await adminShelterKelompokApi.updateKelompok(
          existingKelompok.id_kelompok,
          submitData
        );
      } else {
        response = await adminShelterKelompokApi.createKelompok(submitData);
      }
      
      if (response.data.success) {
        // Show success message
        Alert.alert(
          'Success',
          isEditMode ? 'Group updated successfully' : 'Group created successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        setError(response.data.message || 'Failed to save group');
      }
    } catch (err) {
      console.error('Error saving kelompok:', err);
      setError(err.response?.data?.message || 'Failed to save group. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={() => setError(null)}
          />
        )}
        
        {/* Group Name Input */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nama Kelompok *</Text>
          <TextInput
            style={styles.input}
            value={formData.nama_kelompok}
            onChangeText={(value) => handleInputChange('nama_kelompok', value)}
            placeholder="Masukan Nama Kelompok"
          />
        </View>
        
        {/* Level Selection */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Tingkat *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.id_level_anak_binaan}
              onValueChange={(itemValue) => 
                handleInputChange('id_level_anak_binaan', itemValue)
              }
              style={styles.picker}
            >
              <Picker.Item label="-- Pilih Tingkat --" value="" />
              {levels.map((level) => (
                <Picker.Item 
                  key={level.id_level_anak_binaan} 
                  label={level.nama_level_binaan} 
                  value={level.id_level_anak_binaan} 
                />
              ))}
            </Picker>
          </View>
        </View>
        
        {/* Member Count (Disabled in form, updated automatically) */}
        {isEditMode && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Jumlah Anggota</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.jumlah_anggota}
              editable={false}
            />
           
          </View>
        )}
        
        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Batal"
            onPress={() => navigation.goBack()}
            type="outline"
            style={styles.cancelButton}
            disabled={loading}
          />
          
          <Button
            title={isEditMode ? "Simpan" : "Buat Kelompok"}
            onPress={handleSubmit}
            type="primary"
            style={styles.submitButton}
            loading={loading}
            disabled={loading}
          />
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
  },

  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#666',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },

  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  submitButton: {
    flex: 2,
    marginLeft: 8,
    backgroundColor: '#9b59b6',
  },
});

export default KelompokFormScreen;