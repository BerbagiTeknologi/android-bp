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
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import {
  selectKurikulumLoading,
  selectKurikulumError,
  clearError,
  createKurikulum,
  updateKurikulum
} from '../../../redux/akademik/kurikulumSlice';
import {
  selectJenjangDropdownOptions,
  getJenjangForDropdown
} from '../../../redux/masterData/jenjangSlice';
import {
  selectMataPelajaranDropdownOptions,
  getMataPelajaranForDropdown
} from '../../../redux/masterData/mataPelajaranSlice';

const KurikulumFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectKurikulumLoading);
  const error = useSelector(selectKurikulumError);
  const jenjangOptions = useSelector(selectJenjangDropdownOptions);
  const mataPelajaranOptions = useSelector(selectMataPelajaranDropdownOptions);

  const { kurikulum, isEdit } = route.params || {};
  const [namaKurikulum, setNamaKurikulum] = useState(kurikulum?.nama_kurikulum || '');
  const [kodeKurikulum, setKodeKurikulum] = useState(kurikulum?.kode_kurikulum || '');
  const [idJenjang, setIdJenjang] = useState(kurikulum?.id_jenjang?.toString() || '');
  const [idMataPelajaran, setIdMataPelajaran] = useState(kurikulum?.id_mata_pelajaran?.toString() || '');
  const [deskripsi, setDeskripsi] = useState(kurikulum?.deskripsi || '');
  const [tujuan, setTujuan] = useState(kurikulum?.tujuan || '');
  const [tanggalMulai, setTanggalMulai] = useState(kurikulum?.tanggal_mulai ? new Date(kurikulum.tanggal_mulai) : new Date());
  const [tanggalSelesai, setTanggalSelesai] = useState(kurikulum?.tanggal_selesai ? new Date(kurikulum.tanggal_selesai) : new Date());
  const [isActive, setIsActive] = useState(kurikulum?.is_active !== undefined ? kurikulum.is_active : true);
  
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    dispatch(getJenjangForDropdown());
    dispatch(getMataPelajaranForDropdown());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error, [{ text: 'OK', onPress: () => dispatch(clearError()) }]);
    }
  }, [error, dispatch]);

  const handleStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      setTanggalMulai(selectedDate);
    }
  };

  const handleEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setTanggalSelesai(selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID');
  };

  const handleSubmit = () => {
    // Validation
    if (!namaKurikulum.trim()) {
      Alert.alert('Error', 'Nama kurikulum harus diisi');
      return;
    }
    if (!kodeKurikulum.trim()) {
      Alert.alert('Error', 'Kode kurikulum harus diisi');
      return;
    }
    if (!idJenjang) {
      Alert.alert('Error', 'Jenjang harus dipilih');
      return;
    }
    if (!idMataPelajaran) {
      Alert.alert('Error', 'Mata pelajaran harus dipilih');
      return;
    }
    if (tanggalSelesai <= tanggalMulai) {
      Alert.alert('Error', 'Tanggal selesai harus setelah tanggal mulai');
      return;
    }

    const data = {
      nama_kurikulum: namaKurikulum.trim(),
      kode_kurikulum: kodeKurikulum.trim().toUpperCase(),
      id_jenjang: parseInt(idJenjang),
      id_mata_pelajaran: parseInt(idMataPelajaran),
      deskripsi: deskripsi.trim(),
      tujuan: tujuan.trim(),
      tanggal_mulai: tanggalMulai.toISOString().split('T')[0],
      tanggal_selesai: tanggalSelesai.toISOString().split('T')[0],
      is_active: isActive
    };

    if (isEdit) {
      dispatch(updateKurikulum({ id: kurikulum.id_kurikulum, data }))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Kurikulum berhasil diperbarui');
          navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err.message || 'Gagal memperbarui kurikulum');
        });
    } else {
      dispatch(createKurikulum(data))
        .unwrap()
        .then(() => {
          Alert.alert('Berhasil', 'Kurikulum berhasil dibuat');
          navigation.goBack();
        })
        .catch(err => {
          Alert.alert('Error', err.message || 'Gagal membuat kurikulum');
        });
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEdit ? 'Edit Kurikulum' : 'Tambah Kurikulum'}</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Nama Kurikulum *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: Kurikulum Matematika SD Kelas 1"
          value={namaKurikulum}
          onChangeText={setNamaKurikulum}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Kode Kurikulum *</Text>
        <TextInput
          style={styles.input}
          placeholder="Contoh: KUR-MTK-SD1"
          value={kodeKurikulum}
          onChangeText={setKodeKurikulum}
          maxLength={20}
          autoCapitalize="characters"
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
        <Text style={styles.label}>Tanggal Mulai *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(tanggalMulai)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
        {showStartDatePicker && (
          <DateTimePicker
            value={tanggalMulai}
            mode="date"
            display="default"
            onChange={handleStartDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tanggal Selesai *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDate(tanggalSelesai)}</Text>
          <Ionicons name="calendar-outline" size={20} color="#666" />
        </TouchableOpacity>
        {showEndDatePicker && (
          <DateTimePicker
            value={tanggalSelesai}
            mode="date"
            display="default"
            onChange={handleEndDateChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Deskripsi</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Deskripsi kurikulum..."
          value={deskripsi}
          onChangeText={setDeskripsi}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tujuan</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Tujuan kurikulum..."
          value={tujuan}
          onChangeText={setTujuan}
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
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333'
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

export default KurikulumFormScreen;