import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import TextInput from '../../../../../common/components/TextInput';
import DropdownSelector from '../../shared/DropdownSelector';
import ActionButton from '../../shared/ActionButton';
import { useKelas } from '../../../hooks/useKelas';

const KelasForm = ({ 
  initialData = null, 
  mode = 'create',
  onSubmit,
  onCancel,
  submitting = false
}) => {
  const { 
    cascadeData, 
    checkUrutanAvailability, 
    generateStandardKelasName,
    fetchCascadeData 
  } = useKelas();
  
  const [formData, setFormData] = useState({
    id_jenjang: '',
    nama_kelas: '',
    jenis_kelas: 'standard',
    tingkat: '',
    urutan: '',
    deskripsi: '',
    is_active: true
  });
  
  const [errors, setErrors] = useState({});
  const [urutanChecking, setUrutanChecking] = useState(false);

  // Initialize form with data if edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        id_jenjang: initialData.id_jenjang?.toString() || '',
        nama_kelas: initialData.nama_kelas || '',
        jenis_kelas: initialData.jenis_kelas || 'standard',
        tingkat: initialData.tingkat?.toString() || '',
        urutan: initialData.urutan?.toString() || '',
        deskripsi: initialData.deskripsi || '',
        is_active: initialData.is_active ?? true
      });
    }
  }, [mode, initialData]);

  // Load cascade data
  useEffect(() => {
    if (!cascadeData) {
      fetchCascadeData();
    }
  }, [cascadeData, fetchCascadeData]);

  // Auto-generate nama_kelas for standard kelas
  useEffect(() => {
    if (formData.jenis_kelas === 'standard' && formData.tingkat) {
      const generatedName = generateStandardKelasName(parseInt(formData.tingkat));
      setFormData(prev => ({ ...prev, nama_kelas: generatedName }));
    }
  }, [formData.jenis_kelas, formData.tingkat, generateStandardKelasName]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_jenjang) {
      newErrors.id_jenjang = 'Jenjang harus dipilih';
    }

    if (!formData.jenis_kelas) {
      newErrors.jenis_kelas = 'Jenis kelas harus dipilih';
    }

    if (formData.jenis_kelas === 'standard') {
      if (!formData.tingkat) {
        newErrors.tingkat = 'Tingkat harus dipilih untuk kelas standard';
      }
    } else if (formData.jenis_kelas === 'custom') {
      if (!formData.nama_kelas.trim()) {
        newErrors.nama_kelas = 'Nama kelas harus diisi untuk kelas custom';
      }
    }

    if (!formData.urutan.trim()) {
      newErrors.urutan = 'Urutan harus diisi';
    } else if (isNaN(formData.urutan) || parseInt(formData.urutan) < 1) {
      newErrors.urutan = 'Urutan harus berupa angka positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkUrutan = async (urutan) => {
    if (!urutan || isNaN(urutan) || !formData.id_jenjang || !formData.jenis_kelas) return;
    
    setUrutanChecking(true);
    try {
      const excludeId = mode === 'edit' ? initialData?.id_kelas : null;
      const result = await checkUrutanAvailability(
        parseInt(urutan), 
        parseInt(formData.id_jenjang),
        formData.jenis_kelas,
        excludeId
      );
      
      if (!result.available) {
        setErrors(prev => ({
          ...prev,
          urutan: `Urutan sudah digunakan untuk kelas ${formData.jenis_kelas} di jenjang ini`
        }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.urutan;
          return newErrors;
        });
      }
    } catch (err) {
      console.error('Error checking urutan:', err);
    } finally {
      setUrutanChecking(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Reset nama_kelas when jenis_kelas changes
    if (field === 'jenis_kelas') {
      if (value === 'custom') {
        setFormData(prev => ({ ...prev, nama_kelas: '' }));
      }
    }

    // Check urutan when dependencies change
    if ((field === 'urutan' && value) || 
        (field === 'id_jenjang' && formData.urutan) ||
        (field === 'jenis_kelas' && formData.urutan)) {
      const timeoutId = setTimeout(() => {
        const targetUrutan = field === 'urutan' ? value : formData.urutan;
        const targetJenjang = field === 'id_jenjang' ? value : formData.id_jenjang;
        const targetJenis = field === 'jenis_kelas' ? value : formData.jenis_kelas;
        
        if (targetUrutan && targetJenjang && targetJenis) {
          checkUrutan(targetUrutan);
        }
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      id_jenjang: parseInt(formData.id_jenjang),
      tingkat: formData.jenis_kelas === 'standard' && formData.tingkat ? parseInt(formData.tingkat) : null,
      urutan: parseInt(formData.urutan)
    };
    
    onSubmit(submitData);
  };

  const jenjangOptions = cascadeData?.jenjang?.map(item => ({
    label: `${item.kode_jenjang} - ${item.nama_jenjang}`,
    value: item.id_jenjang.toString()
  })) || [];

  const jenisKelasOptions = cascadeData?.jenis_kelas_list?.map(item => ({
    label: item.label,
    value: item.value,
    description: item.description
  })) || [
    { label: 'Standard', value: 'standard', description: 'Kelas dengan tingkat I-XII' },
    { label: 'Custom', value: 'custom', description: 'Kelas dengan nama bebas' }
  ];

  const tingkatOptions = cascadeData?.tingkat_options?.map(item => ({
    label: item.label,
    value: item.value.toString()
  })) || [];

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <DropdownSelector
          label="Jenjang *"
          value={formData.id_jenjang}
          onValueChange={(value) => handleInputChange('id_jenjang', value)}
          options={jenjangOptions}
          placeholder="Pilih jenjang"
          error={errors.id_jenjang}
          disabled={submitting}
        />

        <DropdownSelector
          label="Jenis Kelas *"
          value={formData.jenis_kelas}
          onValueChange={(value) => handleInputChange('jenis_kelas', value)}
          options={jenisKelasOptions}
          placeholder="Pilih jenis kelas"
          error={errors.jenis_kelas}
          disabled={submitting}
        />

        {formData.jenis_kelas === 'standard' ? (
          <>
            <DropdownSelector
              label="Tingkat *"
              value={formData.tingkat}
              onValueChange={(value) => handleInputChange('tingkat', value)}
              options={tingkatOptions}
              placeholder="Pilih tingkat"
              error={errors.tingkat}
              disabled={submitting}
            />

            <TextInput
              label="Nama Kelas"
              value={formData.nama_kelas}
              placeholder="Auto-generated dari tingkat"
              disabled={true}
              inputProps={{ style: { backgroundColor: '#f8f9fa', color: '#666' } }}
            />
          </>
        ) : (
          <>
            <TextInput
              label="Nama Kelas *"
              value={formData.nama_kelas}
              onChangeText={(value) => handleInputChange('nama_kelas', value)}
              placeholder="Contoh: Kelas Tahfidz"
              error={errors.nama_kelas}
              disabled={submitting}
            />

            <DropdownSelector
              label="Tingkat (Opsional)"
              value={formData.tingkat}
              onValueChange={(value) => handleInputChange('tingkat', value)}
              options={tingkatOptions}
              placeholder="Pilih tingkat (opsional)"
              disabled={submitting}
            />
          </>
        )}

        <TextInput
          label="Urutan *"
          value={formData.urutan}
          onChangeText={(value) => handleInputChange('urutan', value)}
          placeholder="Urutan tampil (angka)"
          error={errors.urutan}
          disabled={submitting}
          inputProps={{ keyboardType: 'numeric' }}
          rightIcon={urutanChecking ? 'hourglass-outline' : null}
        />

        <TextInput
          label="Deskripsi"
          value={formData.deskripsi}
          onChangeText={(value) => handleInputChange('deskripsi', value)}
          placeholder="Deskripsi kelas (opsional)"
          error={errors.deskripsi}
          disabled={submitting}
          multiline
          inputProps={{ numberOfLines: 3 }}
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Status Aktif</Text>
          <Switch
            value={formData.is_active}
            onValueChange={(value) => handleInputChange('is_active', value)}
            disabled={submitting}
            trackColor={{ false: '#ccc', true: '#007bff' }}
            thumbColor={formData.is_active ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      <View style={styles.actions}>
        <ActionButton
          title="Batal"
          variant="outline"
          onPress={onCancel}
          disabled={submitting}
          style={styles.cancelButton}
        />
        
        <ActionButton
          title={mode === 'create' ? 'Simpan' : 'Update'}
          onPress={handleSubmit}
          loading={submitting}
          disabled={Object.keys(errors).length > 0}
          style={styles.submitButton}
        />
      </View>

      {/* Info Box */}
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>
          {formData.jenis_kelas === 'standard' ? 'Kelas Standard' : 'Kelas Custom'}
        </Text>
        <Text style={styles.infoText}>
          {formData.jenis_kelas === 'standard' 
            ? 'Kelas standard menggunakan tingkat I-XII dan nama otomatis. Urutan tidak boleh sama dengan kelas standard lain dalam jenjang yang sama.'
            : 'Kelas custom menggunakan nama bebas dan tingkat opsional. Urutan tidak boleh sama dengan kelas custom lain dalam jenjang yang sama.'
          }
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  form: {
    flex: 1
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  actions: {
    flexDirection: 'row',
    paddingTop: 16,
    gap: 12
  },
  cancelButton: {
    flex: 1
  },
  submitButton: {
    flex: 1
  },
  infoBox: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 16
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16
  }
});

export default KelasForm;