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
  selectMateriLoading,
  selectMateriError,
  clearError,
  createMateri,
  updateMateri
} from '../../../redux/masterData/materiSlice';
import {
  selectKelasDropdownOptions,
  getKelasForDropdown
} from '../../../redux/masterData/kelasSlice';
import {
  selectMataPelajaranDropdownOptions,
  getMataPelajaranForDropdown
} from '../../../redux/masterData/mataPelajaranSlice';

const MateriFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectMateriLoading);
  const error = useSelector(selectMateriError);
  const kelasOptions = useSelector(selectKelasDropdownOptions);
  const mataPelajaranOptions = useSelector(selectMataPelajaranDropdownOptions);

  const { materi, isEdit } = route.params || {};
  const [namaMateri, setNamaMateri] = useState(materi?.nama_materi || '');
  const [idKelas, setIdKelas] = useState(materi?.id_kelas?.toString() || '');
  const [idMataPelajaran, setIdMataPelajaran] = useState(materi?.id_mata_pelajaran?.toString() || '');

  useEffect(() => {
    dispatch(getKelasForDropdown());
    dispatch(getMataPelajaranForDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error, dispatch]);

  const handleSubmit = () => {
    // Validation
    if (!namaMateri.trim()) {
      Alert.alert('Error', 'Nama materi harus diisi');
      return;
    }
    if (!idKelas) {
      Alert.alert('Error', 'Kelas harus dipilih');
      return;
    }
    if (!idMataPelajaran) {
      Alert.alert('Error', 'Mata pelajaran harus dipilih');
      return;
    }

    const data = {
      nama_materi: namaMateri.trim(),
      id_kelas: parseInt(idKelas),
      id_mata_pelajaran: parseInt(idMataPelajaran)
    };

    if (isEdit) {
      dispatch(updateMateri({ id: materi.id_materi, data }))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Materi berhasil diperbarui');
          navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err.message || 'Gagal memperbarui materi');
        });
    } else {
      dispatch(createMateri(data))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Materi berhasil dibuat');
          navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err.message || 'Gagal membuat materi');
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Edit Materi' : 'Tambah Materi'}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Materi *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Pengenalan Angka"
          value={namaMateri}
          onChangeText={setNamaMateri}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mata Pelajaran *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idMataPelajaran}
            onValueChange={(val) => setIdMataPelajaran(val)}
            style={styles.picker}
          >
            <Picker.Item label="Pilih Mata Pelajaran" value="" />
            {mataPelajaranOptions.map((mataPelajaran) => (
              <Picker.Item 
                key={mataPelajaran.id_mata_pelajaran} 
                label={mataPelajaran.nama_mata_pelajaran} 
                value={mataPelajaran.id_mata_pelajaran.toString()} 
              />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kelas *</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={idKelas}
            onValueChange={(val) => setIdKelas(val)}
            style={styles.picker}
          >
            <Picker.Item label="Pilih Kelas" value="" />
            {kelasOptions.map((kelas) => (
              <Picker.Item 
                key={kelas.id_kelas} 
                label={kelas.nama_kelas} 
                value={kelas.id_kelas.toString()} 
              />
            ))}
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

export default MateriFormScreen;