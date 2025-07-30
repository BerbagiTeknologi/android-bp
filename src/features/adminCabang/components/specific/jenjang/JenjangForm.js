// src/features/adminCabang/components/specific/jenjang/JenjangForm.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, Alert, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import BaseFormScreen from '../../base/BaseFormScreen';
import { useStoreSelectors } from '../../../stores';
import { useFormValidation } from '../../../hooks';
import { ENTITIES } from '../../../stores/masterDataStore';

/**
 * JenjangForm - Form untuk create/edit jenjang dengan validation
 * Menggunakan BaseFormScreen sebagai foundation
 */
const JenjangForm = ({
  // Props dari navigation atau parent
  mode: propMode,
  initialData: propInitialData,
  onSuccess: propOnSuccess,
  onCancel: propOnCancel
}) => {
  const route = useRoute();
  
  // Get params from route or props
  const mode = propMode || route.params?.mode || 'create';
  const routeInitialData = route.params?.item || {};
  const initialData = propInitialData || routeInitialData;
  
  // ==================== ZUSTAND STORES ====================
  const masterDataActions = useStoreSelectors.masterData.actions();
  const jenjangData = useStoreSelectors.masterData.entitiesArray(ENTITIES.JENJANG);
  
  // ==================== VALIDATION RULES ====================
  const validationRules = {
    nama_jenjang: [
      'required',
      { type: 'maxLength', params: [100] },
      { type: 'unique', params: [checkNamaUnique] }
    ],
    kode_jenjang: [
      'required',
      { type: 'maxLength', params: [10] },
      { type: 'unique', params: [checkKodeUnique] }
    ],
    urutan: [
      'required',
      'positiveNumber',
      { type: 'unique', params: [checkUrutanUnique] }
    ],
    deskripsi: [
      { type: 'maxLength', params: [500] }
    ]
  };
  
  // ==================== VALIDATION FUNCTIONS ====================
  
  async function checkNamaUnique(value) {
    if (!value) return true;
    
    const existing = jenjangData.find(item => 
      item.nama_jenjang?.toLowerCase() === value.toLowerCase() &&
      item.id_jenjang !== initialData.id_jenjang
    );
    
    return !existing;
  }
  
  async function checkKodeUnique(value) {
    if (!value) return true;
    
    const existing = jenjangData.find(item => 
      item.kode_jenjang?.toLowerCase() === value.toLowerCase() &&
      item.id_jenjang !== initialData.id_jenjang
    );
    
    return !existing;
  }
  
  async function checkUrutanUnique(value) {
    if (!value) return true;
    
    const existing = jenjangData.find(item => 
      item.urutan === parseInt(value) &&
      item.id_jenjang !== initialData.id_jenjang
    );
    
    return !existing;
  }
  
  // ==================== FORM FIELDS CONFIG ====================
  
  const getNextUrutan = useCallback(() => {
    if (mode === 'edit') return initialData.urutan || 1;
    
    const maxUrutan = Math.max(0, ...jenjangData.map(item => item.urutan || 0));
    return maxUrutan + 1;
  }, [mode, initialData.urutan, jenjangData]);
  
  const getInitialFormData = useCallback(() => {
    if (mode === 'edit') {
      return {
        nama_jenjang: initialData.nama_jenjang || '',
        kode_jenjang: initialData.kode_jenjang || '',
        urutan: initialData.urutan?.toString() || '1',
        deskripsi: initialData.deskripsi || '',
        is_active: initialData.is_active !== false
      };
    }
    
    return {
      nama_jenjang: '',
      kode_jenjang: '',
      urutan: getNextUrutan().toString(),
      deskripsi: '',
      is_active: true
    };
  }, [mode, initialData, getNextUrutan]);
  
  const fields = [
    {
      name: 'nama_jenjang',
      type: 'text',
      label: 'Nama Jenjang',
      placeholder: 'Contoh: Sekolah Dasar',
      required: true,
      component: TextInputField
    },
    {
      name: 'kode_jenjang',
      type: 'text',
      label: 'Kode Jenjang',
      placeholder: 'Contoh: SD',
      required: true,
      component: TextInputField,
      props: {
        maxLength: 10,
        autoCapitalize: 'characters'
      }
    },
    {
      name: 'urutan',
      type: 'number',
      label: 'Urutan',
      placeholder: 'Nomor urutan jenjang',
      required: true,
      component: NumberInputField,
      props: {
        min: 1,
        max: 999
      }
    },
    {
      name: 'deskripsi',
      type: 'textarea',
      label: 'Deskripsi',
      placeholder: 'Deskripsi singkat tentang jenjang (opsional)',
      required: false,
      component: TextAreaField,
      props: {
        maxLength: 500,
        numberOfLines: 4
      }
    },
    {
      name: 'is_active',
      type: 'boolean',
      label: 'Status Aktif',
      required: false,
      component: SwitchField
    }
  ];
  
  // ==================== HANDLERS ====================
  
  const handleSuccess = useCallback((data) => {
    const message = mode === 'edit' 
      ? `Jenjang "${data.nama_jenjang}" berhasil diperbarui`
      : `Jenjang "${data.nama_jenjang}" berhasil ditambahkan`;
    
    if (propOnSuccess) {
      propOnSuccess(data);
    }
  }, [mode, propOnSuccess]);
  
  const handleSubmit = useCallback(async (formData) => {
    try {
      // Transform data before submit
      const submitData = {
        ...formData,
        urutan: parseInt(formData.urutan),
        is_active: Boolean(formData.is_active)
      };
      
      let result;
      if (mode === 'edit') {
        result = await masterDataActions.update(
          ENTITIES.JENJANG, 
          initialData.id_jenjang, 
          submitData
        );
      } else {
        result = await masterDataActions.create(ENTITIES.JENJANG, submitData);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [mode, initialData.id_jenjang, masterDataActions]);
  
  // ==================== FIELD COMPONENTS ====================
  
  const TextInputField = ({ value, onValueChange, error, required, placeholder, ...props }) => (
    <View style={styles.fieldContainer}>
      <TextInput
        style={[styles.textInput, error && styles.inputError]}
        value={value || ''}
        onChangeText={onValueChange}
        placeholder={placeholder}
        placeholderTextColor="#999"
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
  
  const NumberInputField = ({ value, onValueChange, error, min, max, ...props }) => (
    <View style={styles.fieldContainer}>
      <TextInput
        style={[styles.textInput, error && styles.inputError]}
        value={value || ''}
        onChangeText={(text) => {
          // Only allow numbers
          const numericValue = text.replace(/[^0-9]/g, '');
          
          // Apply min/max constraints
          let finalValue = numericValue;
          if (min !== undefined && parseInt(numericValue) < min) {
            finalValue = min.toString();
          }
          if (max !== undefined && parseInt(numericValue) > max) {
            finalValue = max.toString();
          }
          
          onValueChange(finalValue);
        }}
        placeholder="Masukkan angka"
        placeholderTextColor="#999"
        keyboardType="numeric"
        {...props}
      />
      {(min !== undefined || max !== undefined) && (
        <Text style={styles.helperText}>
          {min !== undefined && max !== undefined 
            ? `Rentang: ${min} - ${max}`
            : min !== undefined 
            ? `Minimum: ${min}`
            : `Maksimum: ${max}`
          }
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
  
  const TextAreaField = ({ value, onValueChange, error, maxLength, numberOfLines = 4, ...props }) => (
    <View style={styles.fieldContainer}>
      <TextInput
        style={[styles.textArea, error && styles.inputError]}
        value={value || ''}
        onChangeText={onValueChange}
        placeholder="Masukkan deskripsi..."
        placeholderTextColor="#999"
        multiline
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        maxLength={maxLength}
        {...props}
      />
      {maxLength && (
        <Text style={styles.characterCount}>
          {(value || '').length} / {maxLength}
        </Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
  
  const SwitchField = ({ value, onValueChange, label }) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchContent}>
        <View>
          <Text style={styles.switchLabel}>{label}</Text>
          <Text style={styles.switchDescription}>
            {value ? 'Jenjang akan aktif dan dapat digunakan' : 'Jenjang tidak akan muncul dalam pilihan'}
          </Text>
        </View>
        <Switch
          value={Boolean(value)}
          onValueChange={onValueChange}
          trackColor={{ false: '#e0e0e0', true: '#007bff' }}
          thumbColor={value ? '#fff' : '#fff'}
        />
      </View>
    </View>
  );
  
  // ==================== CUSTOM RENDER FUNCTIONS ====================
  
  const renderField = useCallback((field, value, onChange) => {
    const FieldComponent = field.component;
    
    return (
      <View key={field.name} style={styles.field}>
        <Text style={styles.fieldLabel}>
          {field.label}
          {field.required && <Text style={styles.required}> *</Text>}
        </Text>
        
        <FieldComponent
          value={value}
          onValueChange={onChange}
          placeholder={field.placeholder}
          required={field.required}
          {...field.props}
        />
      </View>
    );
  }, []);
  
  const renderHeader = useCallback(() => (
    <View style={styles.headerContent}>
      <Ionicons 
        name={mode === 'edit' ? "pencil" : "add"} 
        size={24} 
        color="#007bff" 
      />
      <Text style={styles.headerText}>
        {mode === 'edit' ? 'Edit Jenjang' : 'Tambah Jenjang Baru'}
      </Text>
    </View>
  ), [mode]);
  
  const renderFooter = useCallback(() => (
    <View style={styles.footerContent}>
      <Text style={styles.footerNote}>
        <Ionicons name="information-circle" size={14} color="#666" />
        {' '}Pastikan data yang diinput sudah benar sebelum menyimpan
      </Text>
    </View>
  ), []);
  
  // ==================== RENDER ====================
  
  return (
    <BaseFormScreen
      entityType={ENTITIES.JENJANG}
      mode={mode}
      initialData={getInitialFormData()}
      fields={fields}
      validationRules={validationRules}
      requiredFields={['nama_jenjang', 'kode_jenjang', 'urutan']}
      
      title={mode === 'edit' ? 'Edit Jenjang' : 'Tambah Jenjang'}
      successMessage={handleSuccess}
      
      renderField={renderField}
      renderHeader={renderHeader}
      renderFooter={renderFooter}
      
      onSuccess={handleSuccess}
      onSubmit={handleSubmit}
      onCancel={propOnCancel}
      
      enableAutoSave={mode === 'edit'}
      autoSaveInterval={30000}
      
      containerStyle={styles.container}
      formStyle={styles.form}
    />
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { backgroundColor: '#f8f9fa' },
  form: { padding: 20 },
  
  // Header
  headerContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 16, backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerText: { fontSize: 18, fontWeight: '600', color: '#333', marginLeft: 8 },
  
  // Fields
  field: { marginBottom: 20 },
  fieldLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#dc3545' },
  fieldContainer: { position: 'relative' },
  
  // Text inputs
  textInput: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 12, fontSize: 16, backgroundColor: '#fff', color: '#333'
  },
  textArea: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12,
    paddingVertical: 12, fontSize: 16, backgroundColor: '#fff', color: '#333',
    minHeight: 100
  },
  inputError: { borderColor: '#dc3545' },
  
  // Helper text
  helperText: { fontSize: 12, color: '#666', marginTop: 4 },
  characterCount: { fontSize: 12, color: '#666', textAlign: 'right', marginTop: 4 },
  errorText: { fontSize: 12, color: '#dc3545', marginTop: 4 },
  
  // Switch field
  switchContainer: { marginBottom: 4 },
  switchContent: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', padding: 16, borderRadius: 8, borderWidth: 1,
    borderColor: '#ddd'
  },
  switchLabel: { fontSize: 16, fontWeight: '500', color: '#333', marginBottom: 4 },
  switchDescription: { fontSize: 12, color: '#666', maxWidth: '80%' },
  
  // Footer
  footerContent: { marginTop: 20, padding: 16, backgroundColor: '#fff', borderRadius: 8 },
  footerNote: { fontSize: 12, color: '#666', textAlign: 'center' }
});

export default JenjangForm;