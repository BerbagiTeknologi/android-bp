import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Redux imports
import {
  selectJenjangDropdownOptions,
  selectJenjangLoading,
  getJenjangForDropdown
} from '../../redux/masterData/jenjangSlice';
import {
  selectMataPelajaranDropdownOptions,
  selectMataPelajaranLoading,
  getMataPelajaranForDropdown
} from '../../redux/masterData/mataPelajaranSlice';
import {
  selectKelasDropdownOptions,
  selectKelasLoading,
  getKelasForDropdown
} from '../../redux/masterData/kelasSlice';

const CascadeSelector = ({
  // Values
  selectedJenjang,
  selectedMataPelajaran,
  selectedKelas,
  
  // Change handlers
  onJenjangChange,
  onMataPelajaranChange,
  onKelasChange,
  
  // Configuration
  showJenjang = true,
  showMataPelajaran = true,
  showKelas = true,
  
  // Labels
  jenjangLabel = "Jenjang",
  mataPelajaranLabel = "Mata Pelajaran",
  kelasLabel = "Kelas",
  
  // Required indicators
  jenjangRequired = false,
  mataPelajaranRequired = false,
  kelasRequired = false,
  
  // Disabled states
  disabled = false,
  
  // Error states
  errors = {},
  
  // Test IDs
  testID = "cascade-selector",
}) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const jenjangOptions = useSelector(selectJenjangDropdownOptions);
  const jenjangLoading = useSelector(selectJenjangLoading);
  
  const mataPelajaranOptions = useSelector(selectMataPelajaranDropdownOptions);
  const mataPelajaranLoading = useSelector(selectMataPelajaranLoading);
  
  const kelasOptions = useSelector(selectKelasDropdownOptions);
  const kelasLoading = useSelector(selectKelasLoading);

  // Local state for filtered options
  const [filteredMataPelajaran, setFilteredMataPelajaran] = useState([]);
  const [filteredKelas, setFilteredKelas] = useState([]);

  // Load initial data
  useEffect(() => {
    if (showJenjang) {
      dispatch(getJenjangForDropdown());
    }
    if (showMataPelajaran) {
      dispatch(getMataPelajaranForDropdown());
    }
    if (showKelas) {
      dispatch(getKelasForDropdown());
    }
  }, [dispatch, showJenjang, showMataPelajaran, showKelas]);

  // Filter mata pelajaran based on selected jenjang
  useEffect(() => {
    if (selectedJenjang && mataPelajaranOptions.length > 0) {
      const filtered = mataPelajaranOptions.filter(
        mp => mp.id_jenjang === parseInt(selectedJenjang)
      );
      setFilteredMataPelajaran(filtered);
    } else {
      setFilteredMataPelajaran(mataPelajaranOptions);
    }
  }, [selectedJenjang, mataPelajaranOptions]);

  // Filter kelas based on selected jenjang
  useEffect(() => {
    if (selectedJenjang && kelasOptions.length > 0) {
      const filtered = kelasOptions.filter(
        kelas => kelas.id_jenjang === parseInt(selectedJenjang)
      );
      setFilteredKelas(filtered);
    } else {
      setFilteredKelas(kelasOptions);
    }
  }, [selectedJenjang, kelasOptions]);

  // Handle jenjang change - reset dependent selections
  const handleJenjangChange = (value) => {
    onJenjangChange(value);
    
    // Reset dependent selections when jenjang changes
    if (onMataPelajaranChange) {
      onMataPelajaranChange('');
    }
    if (onKelasChange) {
      onKelasChange('');
    }
  };

  // Handle mata pelajaran change
  const handleMataPelajaranChange = (value) => {
    onMataPelajaranChange(value);
  };

  // Handle kelas change
  const handleKelasChange = (value) => {
    onKelasChange(value);
  };

  // Render individual selector
  const renderSelector = ({
    label,
    required,
    value,
    options,
    loading,
    onChange,
    placeholder,
    error,
    testID: selectorTestID,
  }) => (
    <View style={styles.selectorContainer}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      
      <View style={[
        styles.pickerContainer,
        error && styles.pickerError,
        disabled && styles.pickerDisabled,
      ]}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#3498db" />
            <Text style={styles.loadingText}>Memuat {label.toLowerCase()}...</Text>
          </View>
        ) : (
          <Picker
            selectedValue={value}
            onValueChange={onChange}
            style={styles.picker}
            enabled={!disabled && !loading}
            testID={selectorTestID}
          >
            <Picker.Item label={placeholder} value="" />
            {options.map((option) => (
              <Picker.Item
                key={option.id}
                label={option.name}
                value={option.id.toString()}
              />
            ))}
          </Picker>
        )}
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={16} color="#e74c3c" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      {showJenjang && renderSelector({
        label: jenjangLabel,
        required: jenjangRequired,
        value: selectedJenjang,
        options: jenjangOptions.map(j => ({
          id: j.id_jenjang,
          name: j.nama_jenjang,
        })),
        loading: jenjangLoading,
        onChange: handleJenjangChange,
        placeholder: "Pilih Jenjang",
        error: errors.jenjang,
        testID: `${testID}-jenjang`,
      })}

      {showMataPelajaran && renderSelector({
        label: mataPelajaranLabel,
        required: mataPelajaranRequired,
        value: selectedMataPelajaran,
        options: filteredMataPelajaran.map(mp => ({
          id: mp.id_mata_pelajaran,
          name: mp.nama_mata_pelajaran,
        })),
        loading: mataPelajaranLoading,
        onChange: handleMataPelajaranChange,
        placeholder: selectedJenjang ? "Pilih Mata Pelajaran" : "Pilih Jenjang terlebih dahulu",
        error: errors.mataPelajaran,
        testID: `${testID}-mata-pelajaran`,
      })}

      {showKelas && renderSelector({
        label: kelasLabel,
        required: kelasRequired,
        value: selectedKelas,
        options: filteredKelas.map(k => ({
          id: k.id_kelas,
          name: k.nama_kelas,
        })),
        loading: kelasLoading,
        onChange: handleKelasChange,
        placeholder: selectedJenjang ? "Pilih Kelas" : "Pilih Jenjang terlebih dahulu",
        error: errors.kelas,
        testID: `${testID}-kelas`,
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
  },
  selectorContainer: {
    marginBottom: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  required: {
    color: '#e74c3c',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    minHeight: 50,
    justifyContent: 'center',
  },
  pickerError: {
    borderColor: '#e74c3c',
  },
  pickerDisabled: {
    backgroundColor: '#f5f5f5',
    opacity: 0.7,
  },
  picker: {
    height: 50,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  loadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#e74c3c',
    marginLeft: 4,
  },
});

export default CascadeSelector;