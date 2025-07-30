import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../../shared/ActionButton';
import DropdownSelector from '../../shared/DropdownSelector';
import { useCascadeData } from '../../../hooks/useCascadeData';

const MateriCascadeFilter = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
  title = 'Filter Materi'
}) => {
  const cascadeData = useCascadeData({ autoLoad: true, includeMateri: true });
  
  const [filters, setFilters] = useState({
    id_jenjang: '',
    id_mata_pelajaran: '',
    id_kelas: '',
    kategori: '',
    ...initialFilters
  });

  const [availableMataPelajaran, setAvailableMataPelajaran] = useState([]);
  const [availableKelas, setAvailableKelas] = useState([]);

  // Reset filters when modal opens
  useEffect(() => {
    if (visible) {
      setFilters({ 
        id_jenjang: '',
        id_mata_pelajaran: '',
        id_kelas: '',
        kategori: '',
        ...initialFilters 
      });
    }
  }, [visible, initialFilters]);

  // Update cascade options when jenjang changes
  useEffect(() => {
    if (filters.id_jenjang && cascadeData.data.jenjang.length > 0) {
      const jenjangId = parseInt(filters.id_jenjang);
      
      // Filter mata pelajaran berdasarkan jenjang
      const filteredMataPelajaran = cascadeData.getFilteredOptions('mata_pelajaran', { jenjangId });
      setAvailableMataPelajaran(filteredMataPelajaran);

      // Filter kelas berdasarkan jenjang
      const filteredKelas = cascadeData.getFilteredOptions('kelas', { jenjangId });
      setAvailableKelas(filteredKelas);

      // Reset child selections jika tidak valid
      if (filters.id_mata_pelajaran) {
        const currentMataPelajaran = cascadeData.data.mata_pelajaran.find(
          mp => mp.id_mata_pelajaran.toString() === filters.id_mata_pelajaran
        );
        if (currentMataPelajaran?.id_jenjang && currentMataPelajaran.id_jenjang !== jenjangId) {
          setFilters(prev => ({ ...prev, id_mata_pelajaran: '' }));
        }
      }

      if (filters.id_kelas) {
        const currentKelas = cascadeData.data.kelas.find(
          k => k.id_kelas.toString() === filters.id_kelas
        );
        if (currentKelas?.id_jenjang !== jenjangId) {
          setFilters(prev => ({ ...prev, id_kelas: '' }));
        }
      }
    } else {
      // Reset ke semua data jika tidak ada jenjang dipilih
      setAvailableMataPelajaran(cascadeData.data.mata_pelajaran);
      setAvailableKelas(cascadeData.data.kelas);
    }
  }, [filters.id_jenjang, cascadeData.data]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      id_jenjang: '',
      id_mata_pelajaran: '',
      id_kelas: '',
      kategori: ''
    });
  };

  const handleApply = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value) acc[key] = value;
      return acc;
    }, {});
    
    onApply(activeFilters);
    onClose();
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  // Options dengan fallback
  const jenjangOptions = [
    { label: 'Semua Jenjang', value: '' },
    ...cascadeData.getJenjangOptions()
  ];

  const mataPelajaranOptions = [
    { label: 'Semua Mata Pelajaran', value: '' },
    ...availableMataPelajaran.map(item => ({
      label: item.nama_mata_pelajaran,
      value: item.id_mata_pelajaran.toString(),
      subtitle: `${item.kode_mata_pelajaran} - ${item.kategori}`,
      badge: item.jenjang ? item.jenjang.kode_jenjang : 'Umum'
    }))
  ];

  const kelasOptions = [
    { label: 'Semua Kelas', value: '' },
    ...availableKelas.map(item => ({
      label: item.nama_kelas,
      value: item.id_kelas.toString(),
      subtitle: `${item.jenis_kelas} - Urutan ${item.urutan}`,
      badge: item.jenjang?.kode_jenjang
    }))
  ];

  const kategoriOptions = [
    { label: 'Semua Kategori', value: '' },
    ...cascadeData.getKategoriOptions()
  ];

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {getActiveFiltersCount() > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getActiveFiltersCount()}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          {/* Filter Content */}
          <View style={styles.content}>
            {cascadeData.isLoading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Memuat data...</Text>
              </View>
            ) : (
              <>
                {/* Jenjang Filter */}
                <DropdownSelector
                  label="Jenjang"
                  value={filters.id_jenjang}
                  options={jenjangOptions}
                  onSelect={(value) => handleFilterChange('id_jenjang', value)}
                  placeholder="Pilih Jenjang"
                  style={styles.dropdown}
                  loading={cascadeData.loading.jenjang}
                />

                {/* Mata Pelajaran Filter */}
                <DropdownSelector
                  label="Mata Pelajaran"
                  value={filters.id_mata_pelajaran}
                  options={mataPelajaranOptions}
                  onSelect={(value) => handleFilterChange('id_mata_pelajaran', value)}
                  placeholder="Pilih Mata Pelajaran"
                  style={styles.dropdown}
                  loading={cascadeData.loading.mata_pelajaran}
                  disabled={!filters.id_jenjang && availableMataPelajaran.length === 0}
                />

                {/* Kelas Filter */}
                <DropdownSelector
                  label="Kelas"
                  value={filters.id_kelas}
                  options={kelasOptions}
                  onSelect={(value) => handleFilterChange('id_kelas', value)}
                  placeholder="Pilih Kelas"
                  style={styles.dropdown}
                  loading={cascadeData.loading.kelas}
                  disabled={!filters.id_jenjang && availableKelas.length === 0}
                />

                {/* Kategori Filter */}
                <DropdownSelector
                  label="Kategori"
                  value={filters.kategori}
                  options={kategoriOptions}
                  onSelect={(value) => handleFilterChange('kategori', value)}
                  placeholder="Pilih Kategori"
                  style={styles.dropdown}
                />

                {/* Validation Warning */}
                {filters.id_mata_pelajaran && filters.id_kelas && (
                  <View style={styles.validationContainer}>
                    {(() => {
                      const validation = cascadeData.validateJenjangConsistency(
                        parseInt(filters.id_mata_pelajaran),
                        parseInt(filters.id_kelas)
                      );
                      return !validation.valid ? (
                        <View style={styles.warning}>
                          <Ionicons name="warning" size={16} color="#F59E0B" />
                          <Text style={styles.warningText}>{validation.message}</Text>
                        </View>
                      ) : null;
                    })()}
                  </View>
                )}

                {/* Error Display */}
                {cascadeData.error && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{cascadeData.error}</Text>
                  </View>
                )}
              </>
            )}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <ActionButton
              title="Reset"
              onPress={handleReset}
              variant="outline"
              style={styles.resetButton}
              disabled={getActiveFiltersCount() === 0}
            />
            <ActionButton
              title={`Terapkan${getActiveFiltersCount() > 0 ? ` (${getActiveFiltersCount()})` : ''}`}
              onPress={handleApply}
              style={styles.applyButton}
              disabled={cascadeData.isLoading}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB'
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#111827'
  },
  badge: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 12,
    minWidth: 24,
    alignItems: 'center'
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600'
  },
  closeButton: {
    padding: 4
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    maxHeight: 400
  },
  dropdown: {
    marginBottom: 16
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32
  },
  loadingText: {
    color: '#6B7280',
    fontSize: 14
  },
  validationContainer: {
    marginTop: 8,
    marginBottom: 16
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    padding: 12,
    gap: 8
  },
  warningText: {
    flex: 1,
    color: '#92400E',
    fontSize: 14
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14
  },
  actions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB'
  },
  resetButton: {
    flex: 1
  },
  applyButton: {
    flex: 2
  }
});

export default MateriCascadeFilter;