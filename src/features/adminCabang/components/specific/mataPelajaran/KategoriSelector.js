import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DropdownSelector from '../../shared/DropdownSelector';

const KategoriSelector = ({
  label = 'Kategori',
  value,
  onSelect,
  error,
  disabled = false,
  required = true,
  style
}) => {
  const kategoriOptions = [
    {
      label: 'Mata Pelajaran Wajib',
      value: 'wajib',
      subtitle: 'Mata pelajaran yang wajib diajarkan'
    },
    {
      label: 'Muatan Lokal',
      value: 'muatan_lokal',
      subtitle: 'Mata pelajaran khas daerah'
    },
    {
      label: 'Pengembangan Diri',
      value: 'pengembangan_diri',
      subtitle: 'Mata pelajaran pengembangan karakter'
    },
    {
      label: 'Mata Pelajaran Pilihan',
      value: 'pilihan',
      subtitle: 'Mata pelajaran yang dapat dipilih'
    },
    {
      label: 'Ekstrakurikuler',
      value: 'ekstrakurikuler',
      subtitle: 'Kegiatan di luar jam pelajaran'
    }
  ];

  const getKategoriColor = (kategori) => {
    const colors = {
      'wajib': '#007bff',
      'muatan_lokal': '#28a745',
      'pengembangan_diri': '#17a2b8',
      'pilihan': '#ffc107',
      'ekstrakurikuler': '#6f42c1'
    };
    return colors[kategori] || '#6c757d';
  };

  const renderKategoriOption = (option, onPress) => (
    <TouchableOpacity
      style={[
        styles.kategoriOption,
        option.value === value && styles.selectedKategori
      ]}
      onPress={onPress}
      key={option.value}
    >
      <View style={styles.kategoriContent}>
        <View style={styles.kategoriHeader}>
          <View style={[
            styles.kategoriIndicator,
            { backgroundColor: getKategoriColor(option.value) }
          ]} />
          <Text style={[
            styles.kategoriLabel,
            option.value === value && styles.selectedKategoriText
          ]}>
            {option.label}
          </Text>
        </View>
        <Text style={styles.kategoriSubtitle}>{option.subtitle}</Text>
      </View>
      {option.value === value && (
        <Ionicons name="checkmark" size={20} color="#007bff" />
      )}
    </TouchableOpacity>
  );

  return (
    <DropdownSelector
      label={label}
      value={value}
      onSelect={onSelect}
      options={kategoriOptions}
      placeholder="Pilih kategori mata pelajaran"
      error={error}
      disabled={disabled}
      required={required}
      style={style}
      renderOption={renderKategoriOption}
    />
  );
};

const styles = StyleSheet.create({
  kategoriOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  selectedKategori: {
    backgroundColor: '#e7f3ff'
  },
  kategoriContent: {
    flex: 1
  },
  kategoriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  kategoriIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  kategoriLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  selectedKategoriText: {
    color: '#007bff',
    fontWeight: '600'
  },
  kategoriSubtitle: {
    fontSize: 13,
    color: '#666',
    marginLeft: 20
  }
});

export default KategoriSelector;