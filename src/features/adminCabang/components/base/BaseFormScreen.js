// src/features/adminCabang/components/base/BaseFormScreen.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View, ScrollView, Text, TouchableOpacity, Alert, KeyboardAvoidingView,
  Platform, StyleSheet, SafeAreaView, ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useStoreSelectors } from '../../stores';
import { useFormValidation } from '../../hooks';
import { ENTITIES } from '../../stores/masterDataStore';

/**
 * BaseFormScreen - Generic form handler dengan Zustand integration
 * Supports create/edit modes, validation, auto-save, dan field dependencies
 */
const BaseFormScreen = ({
  // Core props
  entityType,
  mode = 'create', // 'create' | 'edit'
  initialData = {},
  
  // Form config
  fields = [], // Array of field configs
  validationRules = {},
  requiredFields = [],
  
  // UI config
  title,
  showHeader = true,
  enableAutoSave = false,
  autoSaveInterval = 30000, // 30s
  
  // Navigation
  onSuccess,
  onCancel,
  successMessage,
  
  // Custom rendering
  renderField,
  renderHeader,
  renderFooter,
  renderActions,
  
  // Events
  onFieldChange,
  onValidationChange,
  onSubmit,
  onReset,
  
  // Styles
  containerStyle,
  formStyle,
  fieldStyle,
  headerStyle,
  footerStyle
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  
  // ==================== ZUSTAND STORES ====================
  const masterDataActions = useStoreSelectors.masterData.actions();
  const uiActions = useStoreSelectors.ui.actions();
  const cascadeActions = useStoreSelectors.cascade.actions();
  
  const submitting = useStoreSelectors.ui.loading(entityType, 'creating') || 
                    useStoreSelectors.ui.loading(entityType, 'updating');
  const formState = useStoreSelectors.ui.getFormState(entityType);
  const error = useStoreSelectors.ui.error(entityType);
  
  // ==================== FORM VALIDATION ====================
  const {
    errors, validateField, validateForm, clearFieldError,
    clearAllErrors, hasFieldError, isFormValid
  } = useFormValidation(validationRules);
  
  // ==================== LOCAL STATE ====================
  const [formData, setFormData] = useState({});
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [autoSaveTimer, setAutoSaveTimer] = useState(null);
  
  // ==================== COMPUTED VALUES ====================
  const isEditMode = mode === 'edit';
  const editId = route.params?.id || route.params?.item?.id;
  const editData = route.params?.item || initialData;
  
  const formTitle = title || (isEditMode ? `Edit ${entityType}` : `Tambah ${entityType}`);
  
  const canSubmit = useMemo(() => {
    return !submitting && isDirty && isFormValid() && 
           requiredFields.every(field => formData[field]);
  }, [submitting, isDirty, isFormValid, requiredFields, formData]);
  
  const hasChanges = useMemo(() => {
    if (!isEditMode) return isDirty;
    
    return Object.keys(formData).some(key => {
      const currentValue = formData[key];
      const originalValue = editData[key];
      return currentValue !== originalValue;
    });
  }, [formData, editData, isDirty, isEditMode]);
  
  // ==================== EFFECTS ====================
  
  // Initialize form data
  useEffect(() => {
    const initialFormData = isEditMode ? { ...editData } : { ...initialData };
    setFormData(initialFormData);
    
    // Set cascade dependencies if editing
    if (isEditMode && initialFormData) {
      if (initialFormData.id_jenjang) {
        cascadeActions.setSelected('jenjang', initialFormData.id_jenjang);
      }
      if (initialFormData.id_mata_pelajaran) {
        cascadeActions.setSelected('mataPelajaran', initialFormData.id_mata_pelajaran);
      }
      if (initialFormData.id_kelas) {
        cascadeActions.setSelected('kelas', initialFormData.id_kelas);
      }
    }
  }, [isEditMode, editData, initialData, cascadeActions]);
  
  // Auto-save setup
  useEffect(() => {
    if (!enableAutoSave || !isDirty) return;
    
    const timer = setTimeout(() => {
      handleAutoSave();
    }, autoSaveInterval);
    
    setAutoSaveTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [enableAutoSave, isDirty, formData, autoSaveInterval]);
  
  // Update UI form state
  useEffect(() => {
    uiActions.setFormState(entityType, {
      dirty: hasChanges,
      activeForm: entityType
    });
  }, [hasChanges, entityType, uiActions]);
  
  // Handle validation changes
  useEffect(() => {
    onValidationChange?.(errors, isFormValid());
  }, [errors, isFormValid, onValidationChange]);
  
  // ==================== HANDLERS ====================
  
  const handleFieldChange = useCallback(async (fieldName, value, shouldValidate = true) => {
    // Update form data
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    setIsDirty(true);
    
    // Clear previous errors for this field
    clearFieldError(fieldName);
    
    // Validate field if needed
    if (shouldValidate && validationRules[fieldName]) {
      await validateField(fieldName, value);
    }
    
    // Handle cascade dependencies
    handleCascadeDependencies(fieldName, value);
    
    // Call external handler
    onFieldChange?.(fieldName, value, formData);
  }, [formData, clearFieldError, validateField, validationRules, onFieldChange]);
  
  const handleCascadeDependencies = useCallback((fieldName, value) => {
    // Clear dependent fields when parent changes
    const dependencies = {
      id_jenjang: ['id_mata_pelajaran', 'id_kelas', 'id_materi'],
      id_mata_pelajaran: ['id_materi'],
      id_kelas: ['id_materi']
    };
    
    if (dependencies[fieldName]) {
      const updatedData = { ...formData };
      dependencies[fieldName].forEach(depField => {
        if (updatedData[depField]) {
          updatedData[depField] = null;
        }
      });
      setFormData(updatedData);
    }
    
    // Update cascade store
    if (fieldName === 'id_jenjang') {
      cascadeActions.setSelected('jenjang', value);
    } else if (fieldName === 'id_mata_pelajaran') {
      cascadeActions.setSelected('mataPelajaran', value);
    } else if (fieldName === 'id_kelas') {
      cascadeActions.setSelected('kelas', value);
    }
  }, [formData, cascadeActions]);
  
  const handleSubmit = useCallback(async () => {
    try {
      // Validate entire form
      const isValid = await validateForm(formData);
      if (!isValid) {
        Alert.alert('Validasi Gagal', 'Mohon periksa kembali data yang diinput');
        return;
      }
      
      // Set submitting state
      uiActions.setLoading(entityType, isEditMode ? 'updating' : 'creating', true);
      
      let result;
      if (isEditMode) {
        result = await masterDataActions.update(entityType, editId, formData);
      } else {
        result = await masterDataActions.create(entityType, formData);
      }
      
      if (result.success) {
        const message = successMessage || 
          `${formTitle} berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}`;
        
        uiActions.setSuccess(message, isEditMode ? 'update' : 'create');
        setIsDirty(false);
        setLastSaved(new Date());
        
        // Call success handler
        onSuccess?.(result.data);
        
        // Navigate back or stay
        if (onSubmit) {
          onSubmit(result.data);
        } else {
          navigation.goBack();
        }
      }
    } catch (err) {
      uiActions.setError(entityType, err.message || 'Gagal menyimpan data');
    } finally {
      uiActions.setLoading(entityType, isEditMode ? 'updating' : 'creating', false);
    }
  }, [validateForm, formData, uiActions, entityType, isEditMode, editId,
      masterDataActions, successMessage, formTitle, onSuccess, onSubmit, navigation]);
  
  const handleAutoSave = useCallback(async () => {
    if (!isEditMode || !canSubmit) return;
    
    try {
      await masterDataActions.update(entityType, editId, formData);
      setLastSaved(new Date());
      uiActions.setSuccess('Data tersimpan otomatis', 'autosave');
    } catch (err) {
      console.warn('Auto-save failed:', err);
    }
  }, [isEditMode, canSubmit, masterDataActions, entityType, editId, formData, uiActions]);
  
  const handleReset = useCallback(() => {
    Alert.alert(
      'Reset Form',
      'Apakah Anda yakin ingin mereset semua perubahan?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const resetData = isEditMode ? { ...editData } : { ...initialData };
            setFormData(resetData);
            setIsDirty(false);
            clearAllErrors();
            onReset?.(resetData);
          }
        }
      ]
    );
  }, [isEditMode, editData, initialData, clearAllErrors, onReset]);
  
  const handleCancel = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Batalkan Perubahan',
        'Ada perubahan yang belum disimpan. Yakin ingin keluar?',
        [
          { text: 'Lanjut Edit', style: 'cancel' },
          {
            text: 'Keluar',
            style: 'destructive',
            onPress: () => {
              onCancel ? onCancel() : navigation.goBack();
            }
          }
        ]
      );
    } else {
      onCancel ? onCancel() : navigation.goBack();
    }
  }, [hasChanges, onCancel, navigation]);
  
  // ==================== RENDER FUNCTIONS ====================
  
  const renderDefaultField = (field) => {
    const {
      name, type = 'text', label, placeholder, required = false,
      options = [], component: FieldComponent, props: fieldProps = {},
      validation, dependsOn
    } = field;
    
    if (renderField) {
      return renderField(field, formData[name], (value) => handleFieldChange(name, value));
    }
    
    if (FieldComponent) {
      return (
        <FieldComponent
          key={name}
          value={formData[name]}
          onValueChange={(value) => handleFieldChange(name, value)}
          error={hasFieldError(name) ? errors[name] : null}
          required={required}
          placeholder={placeholder}
          dependsOn={dependsOn}
          {...fieldProps}
        />
      );
    }
    
    // Default field rendering based on type
    return (
      <View key={name} style={[styles.fieldContainer, fieldStyle]}>
        <Text style={styles.fieldLabel}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
        
        {/* Render based on field type */}
        <Text style={styles.fieldPlaceholder}>
          {type} field for {name} (implement specific field components)
        </Text>
        
        {hasFieldError(name) && (
          <Text style={styles.fieldError}>{errors[name]}</Text>
        )}
      </View>
    );
  };
  
  const renderDefaultHeader = () => {
    if (!showHeader) return null;
    
    if (renderHeader) return renderHeader();
    
    return (
      <View style={[styles.header, headerStyle]}>
        <TouchableOpacity style={styles.headerButton} onPress={handleCancel}>
          <Ionicons name="close" size={24} color="#666" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>{formTitle}</Text>
        
        <TouchableOpacity 
          style={[styles.headerButton, !canSubmit && styles.disabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#007bff" />
          ) : (
            <Text style={[styles.saveButtonText, !canSubmit && styles.disabledText]}>
              Simpan
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderDefaultActions = () => {
    if (renderActions) return renderActions();
    
    return (
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleReset}
          disabled={!isDirty}
        >
          <Text style={[styles.buttonText, styles.secondaryButtonText]}>
            Reset
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.primaryButton, !canSubmit && styles.disabled]}
          onPress={handleSubmit}
          disabled={!canSubmit}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isEditMode ? 'Perbarui' : 'Simpan'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };
  
  const renderDefaultFooter = () => {
    if (renderFooter) return renderFooter();
    
    return (
      <View style={[styles.footer, footerStyle]}>
        {enableAutoSave && lastSaved && (
          <Text style={styles.autoSaveText}>
            Terakhir disimpan: {lastSaved.toLocaleTimeString()}
          </Text>
        )}
        
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        
        {renderDefaultActions()}
      </View>
    );
  };
  
  // ==================== RENDER ====================
  
  return (
    <SafeAreaView style={[styles.container, containerStyle]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {renderDefaultHeader()}
        
        <ScrollView
          style={[styles.form, formStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Form Fields */}
          {fields.map(renderDefaultField)}
          
          {/* Custom form content can be added here */}
          <View style={styles.spacer} />
        </ScrollView>
        
        {renderDefaultFooter()}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  keyboardContainer: { flex: 1 },
  
  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#dee2e6'
  },
  headerButton: { padding: 8, minWidth: 60, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#333', flex: 1, textAlign: 'center' },
  saveButtonText: { fontSize: 16, fontWeight: '600', color: '#007bff' },
  
  // Form
  form: { flex: 1, padding: 16 },
  fieldContainer: { marginBottom: 16 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  required: { color: '#dc3545' },
  fieldPlaceholder: { fontSize: 14, color: '#666', fontStyle: 'italic' },
  fieldError: { fontSize: 12, color: '#dc3545', marginTop: 4 },
  spacer: { height: 100 },
  
  // Footer
  footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderTopColor: '#dee2e6' },
  autoSaveText: { fontSize: 12, color: '#666', textAlign: 'center', marginBottom: 8 },
  errorText: { fontSize: 14, color: '#dc3545', textAlign: 'center', marginBottom: 12 },
  
  // Actions
  actions: { flexDirection: 'row', gap: 12 },
  button: {
    flex: 1, paddingVertical: 12, borderRadius: 8, alignItems: 'center',
    justifyContent: 'center', minHeight: 44
  },
  primaryButton: { backgroundColor: '#007bff' },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#dee2e6' },
  buttonText: { fontSize: 16, fontWeight: '600', color: '#fff' },
  secondaryButtonText: { color: '#666' },
  
  // States
  disabled: { opacity: 0.5 },
  disabledText: { color: '#999' }
});

export default BaseFormScreen;