import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ActionButton from '../../shared/ActionButton';
import DropdownSelector from '../../shared/DropdownSelector';
import FilterChip from '../../shared/FilterChip';
import SortButton from '../../shared/SortButton';
import TextInput from '../../../../../common/components/TextInput';

const KelasFilter = ({
  visible,
  onClose,
  onApply,
  filters = {},
  cascadeData,
  loading = false
}) => {
  const [localFilters, setLocalFilters] = useState({
    search: '',
    id_jenjang: '',
    jenis_kelas: '',
    is_active: '',
    sort_field: 'urutan',
    sort_direction: 'asc',
    ...filters
  });

  const jenisKelasOptions = [
    { label: 'Semua Jenis', value: '' },
    { label: 'Standard', value: 'standard' },
    { label: 'Custom', value: 'custom' }
  ];

  const statusOptions = [
    { label: 'Semua Status', value: '' },
    { label: 'Aktif', value: 'true' },
    { label: 'Nonaktif', value: 'false' }
  ];

  const sortOptions = [
    { field: 'urutan', title: 'Urutan' },
    { field: 'nama_kelas', title: 'Nama' },
    { field: 'created_at', title: 'Tanggal' }
  ];

  const jenjangOptions = [
    { label: 'Semua Jenjang', value: '' },
    ...(cascadeData?.jenjang || []).map(item => ({
      label: item.nama_jenjang,
      value: item.id_jenjang
    }))
  ];

  const handleFilterChange = (key, value) => {
    setLocalFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSortChange = (field) => {
    setLocalFilters(prev => {
      if (prev.sort_field === field) {
        return {
          ...prev,
          sort_direction: prev.sort_direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return {
        ...prev,
        sort_field: field,
        sort_direction: 'asc'
      };
    });
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      id_jenjang: '',
      jenis_kelas: '',
      is_active: '',
      sort_field: 'urutan',
      sort_direction: 'asc'
    };
    setLocalFilters(resetFilters);
  };

  const getActiveFilterCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === 'sort_field' || key === 'sort_direction') return false;
      return value !== '' && value !== null && value !== undefined;
    }).length;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Filter Kelas</Text>
          <ActionButton
            icon="close"
            variant="outline"
            size="small"
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Search */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pencarian</Text>
            <TextInput
              placeholder="Cari nama kelas..."
              value={localFilters.search}
              onChangeText={(value) => handleFilterChange('search', value)}
              leftIcon="search-outline"
            />
          </View>

          {/* Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter</Text>
            
            <DropdownSelector
              label="Jenjang"
              value={localFilters.id_jenjang}
              onValueChange={(value) => handleFilterChange('id_jenjang', value)}
              options={jenjangOptions}
              placeholder="Pilih jenjang"
            />

            <DropdownSelector
              label="Jenis Kelas"
              value={localFilters.jenis_kelas}
              onValueChange={(value) => handleFilterChange('jenis_kelas', value)}
              options={jenisKelasOptions}
              placeholder="Pilih jenis"
              style={styles.filterInput}
            />

            <DropdownSelector
              label="Status"
              value={localFilters.is_active}
              onValueChange={(value) => handleFilterChange('is_active', value)}
              options={statusOptions}
              placeholder="Pilih status"
              style={styles.filterInput}
            />
          </View>

          {/* Quick Filters */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Filter Cepat</Text>
            <View style={styles.chipContainer}>
              <FilterChip
                label="Standard"
                active={localFilters.jenis_kelas === 'standard'}
                onPress={() => handleFilterChange('jenis_kelas', 
                  localFilters.jenis_kelas === 'standard' ? '' : 'standard'
                )}
                color="#007bff"
              />
              <FilterChip
                label="Custom"
                active={localFilters.jenis_kelas === 'custom'}
                onPress={() => handleFilterChange('jenis_kelas', 
                  localFilters.jenis_kelas === 'custom' ? '' : 'custom'
                )}
                color="#28a745"
              />
              <FilterChip
                label="Aktif"
                active={localFilters.is_active === 'true'}
                onPress={() => handleFilterChange('is_active', 
                  localFilters.is_active === 'true' ? '' : 'true'
                )}
                color="#28a745"
              />
              <FilterChip
                label="Nonaktif"
                active={localFilters.is_active === 'false'}
                onPress={() => handleFilterChange('is_active', 
                  localFilters.is_active === 'false' ? '' : 'false'
                )}
                color="#dc3545"
              />
            </View>
          </View>

          {/* Sort */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Urutkan</Text>
            <View style={styles.sortContainer}>
              {sortOptions.map(option => (
                <SortButton
                  key={option.field}
                  field={option.field}
                  title={option.title}
                  direction={localFilters.sort_field === option.field ? localFilters.sort_direction : null}
                  onPress={handleSortChange}
                  style={styles.sortButton}
                />
              ))}
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.filterInfo}>
            <Text style={styles.filterCount}>
              {getActiveFilterCount()} filter aktif
            </Text>
          </View>
          
          <View style={styles.actionButtons}>
            <ActionButton
              title="Reset"
              variant="outline"
              onPress={handleReset}
              style={styles.resetButton}
            />
            
            <ActionButton
              title="Terapkan"
              onPress={handleApply}
              loading={loading}
              style={styles.applyButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  closeButton: {
    width: 36,
    height: 36
  },
  content: {
    flex: 1,
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  filterInput: {
    marginTop: 12
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sortContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  sortButton: {
    marginBottom: 8
  },
  actions: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0'
  },
  filterInfo: {
    marginBottom: 12
  },
  filterCount: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center'
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12
  },
  resetButton: {
    flex: 1
  },
  applyButton: {
    flex: 1
  }
});

export default KelasFilter;