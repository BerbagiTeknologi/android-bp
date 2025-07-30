import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import TextInput from '../../../../../common/components/TextInput';
import ActionButton from '../../shared/ActionButton';
import CascadeDropdown from '../../shared/CascadeDropdown';
import { useCascadeData } from '../../../hooks/useCascadeData';
import { useMateri } from '../../../hooks/useMateri';

const MateriForm = ({ 
  initialData = null, 
  mode = 'create',
  onSubmit,
  onCancel,
  submitting = false
}) => {
  const { data, loading, loadMataPelajaran, loadKelas } = useCascadeData({ includeMateri: false });
  const { getUsageAnalytics } = useMateri();
  
  const [formData, setFormData] = useState({
    id_mata_pelajaran: '',
    id_kelas: '',
    nama_materi: ''
  });
  
  const [selectedJenjang, setSelectedJenjang] = useState('');
  const [errors, setErrors] = useState({});
  const [usageInfo, setUsageInfo] = useState(null);

  // Initialize form
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        id_mata_pelajaran: initialData.id_mata_pelajaran?.toString() || '',
        id_kelas: initialData.id_kelas?.toString() || '',
        nama_materi: initialData.nama_materi || ''
      });
      
      // Set initial jenjang selection
      if (initialData.kelas?.id_jenjang) {
        setSelectedJenjang(initialData.kelas.id_jenjang.toString());
      }
      
      // Load usage info for edit mode
      if (initialData.id_materi) {
        loadUsageInfo(initialData.id_materi);
      }
    }
  }, [mode, initialData]);

  const loadUsageInfo = async (materiId) => {
    try {
      const usage = await getUsageAnalytics(materiId);
      setUsageInfo(usage);
    } catch (err) {
      console.error('Error loading usage info:', err);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.id_mata_pelajaran) {
      newErrors.id_mata_pelajaran = 'Mata pelajaran harus dipilih';
    }

    if (!formData.id_kelas) {
      newErrors.id_kelas = 'Kelas harus dipilih';
    }

    if (!formData.nama_materi.trim()) {
      newErrors.nama_materi = 'Nama materi harus diisi';
    }

    // Validate jenjang consistency
    if (formData.id_mata_pelajaran && formData.id_kelas) {
      const mataPelajaran = data.mata_pelajaran.find(
        mp => mp.id_mata_pelajaran == formData.id_mata_pelajaran
      );
      const kelas = data.kelas.find(
        k => k.id_kelas == formData.id_kelas
      );
      
      if (mataPelajaran && kelas) {
        if (mataPelajaran.id_jenjang && mataPelajaran.id_jenjang !== kelas.id_jenjang) {
          newErrors.consistency = 'Mata pelajaran dan kelas harus berada dalam jenjang yang sama';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear errors
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    if ((field === 'id_mata_pelajaran' || field === 'id_kelas') && errors.consistency) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.consistency;
        return newErrors;
      });
    }
  };

  const handleJenjangChange = async (jenjangId) => {
    setSelectedJenjang(jenjangId);
    
    // Reset mata pelajaran and kelas
    setFormData(prev => ({
      ...prev,
      id_mata_pelajaran: '',
      id_kelas: ''
    }));
    
    // Clear related errors
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.id_mata_pelajaran;
      delete newErrors.id_kelas;
      delete newErrors.consistency;
      return newErrors;
    });

    // Load filtered data
    if (jenjangId) {
      await loadMataPelajaran(jenjangId);
      await loadKelas(jenjangId);
    }
  };

  const handleMataPelajaranChange = (mataPelajaranId) => {
    handleInputChange('id_mata_pelajaran', mataPelajaranId);
    
    // Reset kelas
    setFormData(prev => ({ ...prev, id_kelas: '' }));
    
    if (errors.id_kelas) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.id_kelas;
        return newErrors;
      });
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const submitData = {
      ...formData,
      id_mata_pelajaran: parseInt(formData.id_mata_pelajaran),
      id_kelas: parseInt(formData.id_kelas)
    };
    
    onSubmit(submitData);
  };

  const handleCancel = () => {
    if (submitting) return;
    
    Alert.alert(
      'Batal',
      'Yakin ingin membatalkan? Data yang belum disimpan akan hilang.',
      [
        { text: 'Tidak', style: 'cancel' },
        { text: 'Ya, Batal', style: 'destructive', onPress: onCancel }
      ]
    );
  };

  // Filter data based on selections
  const filteredMataPelajaran = data.mata_pelajaran.filter(mp => 
    !selectedJenjang || !mp.id_jenjang || mp.id_jenjang == selectedJenjang
  );

  const filteredKelas = data.kelas.filter(k => 
    !selectedJenjang || k.id_jenjang == selectedJenjang
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        {/* Usage Warning for Edit Mode */}
        {mode === 'edit' && usageInfo && usageInfo.kurikulum_count > 0 && (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>⚠️ Peringatan</Text>
            <Text style={styles.warningText}>
              Materi ini digunakan dalam {usageInfo.kurikulum_count} kurikulum. 
              Perubahan akan mempengaruhi kurikulum tersebut.
            </Text>
          </View>
        )}

        {/* Jenjang Filter */}
        <CascadeDropdown
          label="Jenjang (Filter)"
          placeholder="Pilih jenjang untuk filter"
          options={data.jenjang}
          value={selectedJenjang}
          onValueChange={handleJenjangChange}
          keyExtractor="id_jenjang"
          labelExtractor="nama_jenjang"
          loading={loading.jenjang}
        />

        {/* Mata Pelajaran */}
        <CascadeDropdown
          label="Mata Pelajaran *"
          placeholder="Pilih mata pelajaran"
          options={filteredMataPelajaran}
          value={formData.id_mata_pelajaran}
          onValueChange={handleMataPelajaranChange}
          keyExtractor="id_mata_pelajaran"
          labelExtractor="nama_mata_pelajaran"
          error={errors.id_mata_pelajaran}
          disabled={submitting}
          loading={loading.mata_pelajaran}
          emptyText={selectedJenjang ? "Tidak ada mata pelajaran untuk jenjang ini" : "Pilih jenjang terlebih dahulu"}
        />

        {/* Kelas */}
        <CascadeDropdown
          label="Kelas *"
          placeholder="Pilih kelas"
          options={filteredKelas}
          value={formData.id_kelas}
          onValueChange={(value) => handleInputChange('id_kelas', value)}
          keyExtractor="id_kelas"
          labelExtractor={(item) => `${item.nama_kelas} (${item.jenis_kelas})`}
          error={errors.id_kelas}
          disabled={submitting}
          loading={loading.kelas}
          emptyText={selectedJenjang ? "Tidak ada kelas untuk jenjang ini" : "Pilih jenjang terlebih dahulu"}
        />

        {/* Consistency Error */}
        {errors.consistency && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errors.consistency}</Text>
          </View>
        )}

        {/* Nama Materi */}
        <TextInput
          label="Nama Materi *"
          value={formData.nama_materi}
          onChangeText={(value) => handleInputChange('nama_materi', value)}
          placeholder="Nama materi pembelajaran"
          error={errors.nama_materi}
          disabled={submitting}
        />

        {/* Selected Info */}
        {formData.id_mata_pelajaran && formData.id_kelas && (
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Informasi Materi</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Jenjang:</Text>
              <Text style={styles.infoValue}>
                {data.jenjang.find(j => j.id_jenjang == selectedJenjang)?.nama_jenjang || '-'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Mata Pelajaran:</Text>
              <Text style={styles.infoValue}>
                {data.mata_pelajaran.find(mp => mp.id_mata_pelajaran == formData.id_mata_pelajaran)?.nama_mata_pelajaran || '-'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Kelas:</Text>
              <Text style={styles.infoValue}>
                {data.kelas.find(k => k.id_kelas == formData.id_kelas)?.nama_kelas || '-'}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <ActionButton
          title="Batal"
          variant="outline"
          onPress={handleCancel}
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
  warningCard: {
    backgroundColor: '#fff3cd',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107'
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4
  },
  warningText: {
    fontSize: 12,
    color: '#856404'
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    textAlign: 'center'
  },
  infoCard: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 16
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  infoLabel: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500'
  },
  infoValue: {
    fontSize: 14,
    color: '#007bff'
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
  }
});

export default MateriForm;