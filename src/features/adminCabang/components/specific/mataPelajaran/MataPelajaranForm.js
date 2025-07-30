// src/features/adminCabang/components/specific/mataPelajaran/MataPelajaranForm.js
import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Switch, StyleSheet
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import BaseFormScreen from '../../base/BaseFormScreen';
import CascadeDropdown from '../../shared/CascadeDropdown';
import DropdownSelector from '../../shared/DropdownSelector';
import { useStoreSelectors } from '../../../stores';
import { useFormValidation } from '../../../hooks';
import { ENTITIES } from '../../../stores/masterDataStore';

/**
 * MataPelajaranForm - Form untuk create/edit mata pelajaran dengan cascade dependencies
 * Supports jenjang dependency dan kategori selection
 */
const MataPelajaranForm = ({
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
  const cascadeActions = useStoreSelectors.cascade.actions();
  
  const mataPelajaranData = useStoreSelectors.masterData.entitiesArray(ENTITIES.MATA_PELAJARAN);
  const jenjangOptions = useStoreSelectors.cascade.jenjangOptions();
  
  // ==================== KATEGORI OPTIONS ====================
  const kategoriOptions = useMemo(() => [
    { 
      label: 'Mata Pelajaran Wajib', 
      value: 'wajib',
      description: 'Mata pelajaran yang wajib diajarkan'
    },
    { 
      label: 'Muatan Lokal', 
      value: 'muatan_lokal',
      description: 'Mata pelajaran sesuai karakteristik daerah'
    },
    { 
      label: 'Pengembangan Diri', 
      value: 'pengembangan_diri',
      description: 'Mata pelajaran untuk pengembangan karakter'
    },
    { 
      label: 'Mata Pelajaran Pilihan', 
      value: 'pilihan',
      description: 'Mata pelajaran yang dapat dipilih siswa'
    },
    { 
      label: 'Ekstrakurikuler', 
      value: 'ekstrakurikuler',
      description: 'Kegiatan di luar jam pelajaran'
    }
  ], []);
  
  // ==================== VALIDATION FUNCTIONS ====================
  
  async function checkNamaUnique(value) {
    if (!value) return true;
    
    const existing = mataPelajaranData.find(item => 
      item.nama_mata_pelajaran?.toLowerCase() === value.toLowerCase() &&
      item.id_mata_pelajaran !== initialData.id_mata_pelajaran
    );
    
    return !existing;
  }
  
  async function checkKodeUnique(value) {
    if (!value) return true;
    
    const existing = mataPelajaranData.find(item => 
      item.kode_mata_pelajaran?.toLowerCase() === value.toLowerCase() &&
      item.id_mata_pelajaran !== initialData.id_mata_pelajaran
    );
    
    return !existing;
  }
  
  // ==================== VALIDATION RULES ====================
  const validationRules = {
    nama_mata_pelajaran: [
      'required',
      { type: 'maxLength', params: [255] },
      { type: 'unique', params: [checkNamaUnique] }
    ],
    kode_mata_pelajaran: [
      'required',
      { type: 'maxLength', params: [50] },
      { type: 'unique', params: [checkKodeUnique] }
    ],
    kategori: [
      'required'
    ],
    deskripsi: [
      { type: 'maxLength', params: [1000] }
    ]
  };
  
  // ==================== FORM FIELDS CONFIG ====================
  
  const getInitialFormData = useCallback(() => {
    if (mode === 'edit') {
      return {
        nama_mata_pelajaran: initialData.nama_mata_pelajaran || '',
        kode_mata_pelajaran: initialData.kode_mata_pelajaran || '',
        kategori: initialData.kategori || '',
        id_jenjang: initialData.id_jenjang || null,
        deskripsi: initialData.deskripsi || '',
        is_active: initialData.is_active !== false
      };
    }
    
    return {
      nama_mata_pelajaran: '',
      kode_mata_pelajaran: '',
      kategori: '',
      id_jenjang: null,
      deskripsi: '',
      is_active: true
    };
  }, [mode, initialData]);
  
  const fields = [
    {
      name: 'nama_mata_pelajaran',
      type: 'text',
      label: 'Nama Mata Pelajaran',
      placeholder: 'Contoh: Matematika',
      required: true,
      component: TextInputField
    },
    {
      name: 'kode_mata_pelajaran',
      type: 'text',
      label: 'Kode Mata Pelajaran',
      placeholder: 'Contoh: MTK',
      required: true,
      component: TextInputField,
      props: {
        maxLength: 50,
        autoCapitalize: 'characters'
      }
    },
    {
      name: 'kategori',
      type: 'select',
      label: 'Kategori',
      placeholder: 'Pilih kategori mata pelajaran',
      required: true,
      component: KategoriField,
      props: {
        options: kategoriOptions
      }
    },
    {
      name: 'id_jenjang',
      type: 'cascade',
      label: 'Jenjang (Opsional)',
      placeholder: 'Pilih jenjang atau kosongkan untuk semua jenjang',
      required: false,
      component: JenjangField,
      props: {
        allowClear: true
      }
    },
    {
      name: 'deskripsi',
      type: 'textarea',
      label: 'Deskripsi',
      placeholder: 'Deskripsi singkat tentang mata pelajaran (opsional)',
      required: false,
      component: TextAreaField,
      props: {
        maxLength: 1000,
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
      ? `Mata pelajaran "${data.nama_mata_pelajaran}" berhasil diperbarui`
      : `Mata pelajaran "${data.nama_mata_pelajaran}" berhasil ditambahkan`;
    
    if (propOnSuccess) {
      propOnSuccess(data);
    }
  }, [mode, propOnSuccess]);
  
  const handleSubmit = useCallback(async (formData) => {
    try {
      // Transform data before submit
      const submitData = {
        ...formData,
        is_active: Boolean(formData.is_active),
        // Remove id_jenjang if null to make it optional
        ...(formData.id_jenjang ? { id_jenjang: formData.id_jenjang } : {})
      };
      
      let result;
      if (mode === 'edit') {
        result = await masterDataActions.update(
          ENTITIES.MATA_PELAJARAN, 
          initialData.id_mata_pelajaran, 
          submitData
        );
      } else {
        result = await masterDataActions.create(ENTITIES.MATA_PELAJARAN, submitData);
      }
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [mode, initialData.id_mata_pelajaran, masterDataActions]);
  
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
  
  const KategoriField = ({ value, onValueChange, error, options, placeholder }) => (
    <View style={styles.fieldContainer}>
      <DropdownSelector
        options={options}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        style={[styles.dropdown, error && styles.inputError]}
        renderOption={(option, index, onSelect) => (
          <TouchableOpacity
            key={index}
            style={styles.kategoriOption}
            onPress={() => onSelect(option)}
          >
            <View style={styles.kategoriHeader}>
              <Text style={styles.kategoriLabel}>{option.label}</Text>
              {value === option.value && (
                <Ionicons name="checkmark" size={16} color="#007bff" />
              )}
            </View>
            <Text style={styles.kategoriDescription}>{option.description}</Text>
          </TouchableOpacity>
        )}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
  
  const JenjangField = ({ value, onValueChange, error, allowClear, placeholder }) => (
    <View style={styles.fieldContainer}>
      <CascadeDropdown
        entityType={ENTITIES.JENJANG}
        value={value}
        onValueChange={onValueChange}
        placeholder={placeholder}
        allowClear={allowClear}
        style={[styles.dropdown, error && styles.inputError]}
      />
      <Text style={styles.helperText}>
        Kosongkan jika mata pelajaran berlaku untuk semua jenjang
      </Text>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
  
  const SwitchField = ({ value, onValueChange, label }) => (
    <View style={styles.switchContainer}>
      <View style={styles.switchContent}>
        <View>
          <Text style={styles.switchLabel}>{label}</Text>
          <Text style={styles.switchDescription}>
            {value ? 'Mata pelajaran akan aktif dan dapat digunakan' : 'Mata pelajaran tidak akan muncul dalam pilihan'}
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
        {mode === 'edit' ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran Baru'}
      </Text>
    </View>
  ), [mode]);
  
  const renderFooter = useCallback(() => (
    <View style={styles.footerContent}>
      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={20} color="#17a2b8" />
        <View style={styles.infoText}>
          <Text style={styles.infoTitle}>Tips Pengisian:</Text>
          <Text style={styles.infoDescription}>
            • Jenjang bersifat opsional, kosongkan jika berlaku untuk semua jenjang{'\n'}
            • Kode mata pelajaran sebaiknya singkat dan mudah diingat{'\n'}
            • Pilih kategori yang sesuai dengan kurikulum yang berlaku
          </Text>
        </View>
      </View>
    </View>
  ), []);
  
  // ==================== RENDER ====================
  
  return (
    <BaseFormScreen
      entityType={ENTITIES.MATA_PELAJARAN}
      mode={mode}
      initialData={getInitialFormData()}
      fields={fields}
      validationRules={validationRules}
      requiredFields={['nama_mata_pelajaran', 'kode_mata_pelajaran', 'kategori']}
      
      title={mode === 'edit' ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
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
  dropdown: { borderRadius: 8 },
  inputError: { borderColor: '#dc3545' },
  
  // Helper text
  helperText: { fontSize: 12, color: '#666', marginTop: 4 },
  characterCount: { fontSize: 12, color: '#666', textAlign: 'right', marginTop: 4 },
  errorText: { fontSize: 12, color: '#dc3545', marginTop: 4 },
  
  // Kategori dropdown
  kategoriOption: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  kategoriHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 4
  },
  kategoriLabel: { fontSize: 16, fontWeight: '500', color: '#333' },
  kategoriDescription: { fontSize: 12, color: '#666' },
  
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
  footerContent: { marginTop: 20 },
  infoCard: {
    flexDirection: 'row', padding: 16, backgroundColor: '#d1ecf1',
    borderRadius: 8, borderWidth: 1, borderColor: '#bee5eb'
  },
  infoText: { flex: 1, marginLeft: 12 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#0c5460', marginBottom: 4 },
  infoDescription: { fontSize: 12, color: '#0c5460', lineHeight: 16 }
});

export default MataPelajaranForm;