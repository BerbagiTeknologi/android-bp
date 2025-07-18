import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Picker } from '@react-native-picker/picker';
import {
  selectKelasLoading,
  selectKelasError,
  selectKelasCascadeData,
  clearError,
  createKelas,
  updateKelas,
  getKelasCascadeData
} from '../../../redux/masterData/kelasSlice';
import {
  selectJenjangDropdownOptions,
  getJenjangForDropdown
} from '../../../redux/masterData/jenjangSlice';

const KelasFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectKelasLoading);
  const error = useSelector(selectKelasError);
  const jenjangOptions = useSelector(selectJenjangDropdownOptions);
  const cascadeData = useSelector(selectKelasCascadeData);

  const { kelas, isEdit } = route.params || {};
  const [namaKelas, setNamaKelas] = useState(kelas?.nama_kelas || '');
  const [idJenjang, setIdJenjang] = useState(kelas?.id_jenjang?.toString() || '');
  const [jenisKelas, setJenisKelas] = useState(kelas?.jenis_kelas || 'standard');
  const [tingkat, setTingkat] = useState(kelas?.tingkat?.toString() || '');
  const [urutan, setUrutan] = useState(kelas?.urutan?.toString() || '');
  const [deskripsi, setDeskripsi] = useState(kelas?.deskripsi || '');
  const [isActive, setIsActive] = useState(kelas?.is_active !== undefined ? kelas.is_active : true);

  // Generate nama kelas otomatis untuk standard
  const generateNamaKelas = (tingkatValue) => {
    if (!tingkatValue || jenisKelas !== 'standard') return '';
    const tingkatOption = cascadeData?.tingkat_options?.find(opt => opt.value === parseInt(tingkatValue));
    return tingkatOption ? `Kelas ${tingkatOption.label.split(' ')[1].replace(/[()]/g, '')}` : '';
  };

  // Auto-generate nama kelas untuk standard classes
  useEffect(() => {
    if (jenisKelas === 'standard' && tingkat && !isEdit) {
      const generatedName = generateNamaKelas(tingkat);
      if (generatedName) {
        setNamaKelas(generatedName);
      }
    }
  }, [tingkat, jenisKelas, isEdit, cascadeData]);

  // Reset fields when switching jenis kelas
  useEffect(() => {
    if (!isEdit) {
      if (jenisKelas === 'custom') {
        setTingkat('');
        setNamaKelas('');
      } else if (jenisKelas === 'standard') {
        setNamaKelas('');
      }
    }
  }, [jenisKelas, isEdit]);

  // Get available tingkat options based on existing classes in selected jenjang
  const getAvailableTingkatOptions = () => {
    if (!cascadeData?.tingkat_options || !idJenjang) {
      return [];
    }

    const existingClasses = cascadeData?.kelas_by_jenjang?.[idJenjang] || [];
    const usedTingkat = existingClasses
      .filter(kelas => kelas.jenis_kelas === 'standard')
      .map(kelas => kelas.tingkat);

    return cascadeData.tingkat_options.filter(option => {
      // For edit mode, allow current tingkat
      if (isEdit && kelas?.tingkat === option.value) {
        return true;
      }
      // Otherwise, only show unused tingkat
      return !usedTingkat.includes(option.value);
    });
  };

  useEffect(() => {
    dispatch(getJenjangForDropdown());
    dispatch(getKelasCascadeData());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error, dispatch]);

  const handleSubmit = () => {
    // Basic validation
    if (!namaKelas.trim()) {
      Alert.alert('Error', 'Nama kelas harus diisi');
      return;
    }
    if (!idJenjang) {
      Alert.alert('Error', 'Jenjang harus dipilih');
      return;
    }
    if (!urutan.trim()) {
      Alert.alert('Error', 'Urutan harus diisi');
      return;
    }
    
    // Validation untuk tingkat dengan context
    if (jenisKelas === 'standard') {
      if (!tingkat.trim()) {
        Alert.alert(
          'Tingkat Diperlukan', 
          'Kelas standard memerlukan tingkat.\n\nSilakan pilih tingkat yang tersedia.'
        );
        return;
      }
    }

    // Validation untuk nama kelas custom
    if (jenisKelas === 'custom' && !namaKelas.trim()) {
      Alert.alert('Error', 'Nama kelas harus diisi untuk kelas custom');
      return;
    }

    // Validation untuk urutan
    const urutanNum = parseInt(urutan);
    if (urutanNum < 1) {
      Alert.alert('Error', 'Urutan harus minimal 1');
      return;
    }

    const data = {
      nama_kelas: namaKelas.trim(),
      id_jenjang: parseInt(idJenjang),
      jenis_kelas: jenisKelas,
      tingkat: jenisKelas === 'standard' && tingkat ? parseInt(tingkat) : null,
      urutan: parseInt(urutan),
      deskripsi: deskripsi.trim(),
      is_active: isActive
    };

    if (isEdit) {
      dispatch(updateKelas({ id: kelas.id_kelas, data }))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Kelas berhasil diperbarui');
          navigation.goBack();
        })
        .catch(err => {
          const errorMsg = err.message || 'Gagal memperbarui kelas';
          Alert.alert('Error', errorMsg.includes('Validasi gagal') ? 'Periksa kembali data yang diisi' : errorMsg);
        });
    } else {
      dispatch(createKelas(data))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Kelas berhasil dibuat');
          navigation.goBack();
        })
        .catch(err => {
          const errorMsg = err.message || 'Gagal membuat kelas';
          Alert.alert('Error', errorMsg.includes('Validasi gagal') ? 'Periksa kembali data yang diisi' : errorMsg);
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Edit Kelas' : 'Tambah Kelas'}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Kelas *</Text>
        {jenisKelas === 'standard' && (
          <Text style={styles.helperText}>
            Nama kelas akan otomatis dibuat berdasarkan tingkat yang dipilih.
          </Text>
        )}
        <TextInput
          style={[
            styles.input,
            jenisKelas === 'standard' && styles.inputReadonly
          ]}
          placeholder={
            jenisKelas === 'standard' 
              ? 'Akan otomatis dibuat dari tingkat'
              : 'Contoh: Musik, Ekstrakurikuler, Tahfidz'
          }
          value={namaKelas}
          onChangeText={setNamaKelas}
          editable={jenisKelas === 'custom'}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Jenjang *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idJenjang}
            onValueChange={(val) => setIdJenjang(val)}
            style={styles.picker}
          >
            <Picker.Item label="Pilih Jenjang" value="" />
            {jenjangOptions.map((jenjang) => (
              <Picker.Item 
                key={jenjang.id_jenjang} 
                label={jenjang.nama_jenjang} 
                value={jenjang.id_jenjang.toString()} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Jenis Kelas *</Text>
        <Text style={styles.helperText}>
          Standard: Kelas reguler dengan tingkat (1-12). Custom: Kelas khusus seperti ekstrakurikuler.
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={jenisKelas}
            onValueChange={(val) => setJenisKelas(val)}
            style={styles.picker}
          >
            <Picker.Item label="Standard" value="standard" />
            <Picker.Item label="Custom" value="custom" />
          </Picker>
        </View>
      </View>

      {jenisKelas === 'standard' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tingkat *</Text>
          <Text style={styles.helperText}>
            Pilih tingkat kelas yang tersedia untuk jenjang ini.
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tingkat}
              onValueChange={(val) => setTingkat(val)}
              style={styles.picker}
            >
              <Picker.Item label="Pilih Tingkat" value="" />
              {getAvailableTingkatOptions().map((option) => (
                <Picker.Item 
                  key={option.value} 
                  label={option.label} 
                  value={option.value.toString()} 
                />
              ))}
            </Picker>
          </View>
        </View>
      )}

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Urutan *</Text>
        <Text style={styles.helperText}>
          Urutan tampilan kelas dalam jenjang (harus unik).
        </Text>
        <TextInput
          style={styles.input}
          placeholder="1, 2, 3, dst."
          value={urutan}
          onChangeText={setUrutan}
          keyboardType="numeric"
        />
      </View>


      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deskripsi kelas..."
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={isActive}
            onValueChange={(val) => setIsActive(val)}
            style={styles.picker}
          >
            <Picker.Item label="Aktif" value={true} />
            <Picker.Item label="Tidak Aktif" value={false} />
          </Picker>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        {loading
          ? <ActivityIndicator />
          : <Text style={styles.submitButtonText}>{isEdit ? 'Update' : 'Submit'}</Text>
        }
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333'
  },
  inputGroup: {
    marginBottom: 16
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  helperText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff'
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top'
  },
  inputOptional: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6'
  },
  inputReadonly: {
    backgroundColor: '#f8f9fa',
    borderColor: '#dee2e6',
    color: '#6c757d'
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff'
  },
  picker: {
    height: 50
  },
  submitButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  submitButtonDisabled: {
    backgroundColor: '#6c757d'
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  }
});

export default KelasFormScreen;