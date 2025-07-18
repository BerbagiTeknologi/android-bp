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
  selectMataPelajaranLoading,
  selectMataPelajaranError,
  clearError,
  createMataPelajaran,
  updateMataPelajaran
} from '../../../redux/masterData/mataPelajaranSlice';
import {
  selectJenjangDropdownOptions,
  getJenjangForDropdown
} from '../../../redux/masterData/jenjangSlice';

const MataPelajaranFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectMataPelajaranLoading);
  const error = useSelector(selectMataPelajaranError);
  const jenjangOptions = useSelector(selectJenjangDropdownOptions);

  const { mataPelajaran, isEdit } = route.params || {};
  const [namaMataPelajaran, setNamaMataPelajaran] = useState(mataPelajaran?.nama_mata_pelajaran || '');
  const [kodeMataPelajaran, setKodeMataPelajaran] = useState(mataPelajaran?.kode_mata_pelajaran || '');
  const [idJenjang, setIdJenjang] = useState(
    mataPelajaran?.id_jenjang ? mataPelajaran.id_jenjang.toString() : ''
  );
  const [deskripsi, setDeskripsi] = useState(mataPelajaran?.deskripsi || '');
  const [kategori, setKategori] = useState(mataPelajaran?.kategori || '');
  const [status, setStatus] = useState(mataPelajaran?.status || 'aktif');

  useEffect(() => {
    dispatch(getJenjangForDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error, dispatch]);

  const handleSubmit = () => {
    // Validation
    if (!namaMataPelajaran.trim()) {
      Alert.alert('Error', 'Nama mata pelajaran harus diisi');
      return;
    }
    if (!kodeMataPelajaran.trim()) {
      Alert.alert('Error', 'Kode mata pelajaran harus diisi');
      return;
    }
    if (!kategori) {
      Alert.alert('Error', 'Kategori harus dipilih');
      return;
    }

    const data = {
      nama_mata_pelajaran: namaMataPelajaran.trim(),
      kode_mata_pelajaran: kodeMataPelajaran.trim().toUpperCase(),
      id_jenjang: idJenjang && idJenjang !== '' ? parseInt(idJenjang) : null,
      kategori: kategori,
      deskripsi: deskripsi.trim(),
      status: status
    };

    if (isEdit) {
      dispatch(updateMataPelajaran({ id: mataPelajaran.id_mata_pelajaran, data }))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Mata pelajaran berhasil diperbarui');
          navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err.message || 'Gagal memperbarui mata pelajaran');
        });
    } else {
      dispatch(createMataPelajaran(data))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Mata pelajaran berhasil dibuat');
          navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err.message || 'Gagal membuat mata pelajaran');
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Mata Pelajaran *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Matematika"
          value={namaMataPelajaran}
          onChangeText={setNamaMataPelajaran}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kode Mata Pelajaran *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: MTK"
          value={kodeMataPelajaran}
          onChangeText={setKodeMataPelajaran}
          maxLength={10}
          autoCapitalize="characters"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Jenjang</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idJenjang}
            onValueChange={(val) => setIdJenjang(val)}
            style={styles.picker}
          >
            <Picker.Item label="Semua Jenjang" value="" />
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
        <Text style={styles.label}>Kategori *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={kategori}
            onValueChange={(val) => setKategori(val)}
            style={styles.picker}
          >
            <Picker.Item label="Pilih Kategori" value="" />
            <Picker.Item label="Mata Pelajaran Wajib" value="wajib" />
            <Picker.Item label="Muatan Lokal" value="muatan_lokal" />
            <Picker.Item label="Pengembangan Diri" value="pengembangan_diri" />
            <Picker.Item label="Mata Pelajaran Pilihan" value="pilihan" />
            <Picker.Item label="Ekstrakurikuler" value="ekstrakurikuler" />
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deskripsi mata pelajaran..."
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
            selectedValue={status}
            onValueChange={(val) => setStatus(val)}
            style={styles.picker}
          >
            <Picker.Item label="Aktif" value="aktif" />
            <Picker.Item label="Tidak Aktif" value="nonaktif" />
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

export default MataPelajaranFormScreen;