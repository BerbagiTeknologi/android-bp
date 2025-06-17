import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
  Platform
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useDispatch } from 'react-redux';

// Import components
import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import Redux
import {
  createSemester,
  updateSemester
} from '../redux/semesterSlice';

const SemesterFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { semester } = route.params || {};
  
  const isEdit = !!semester;

  const [formData, setFormData] = useState({
    nama_semester: semester?.nama_semester || '',
    tahun_ajaran: semester?.tahun_ajaran || '',
    periode: semester?.periode || 'ganjil',
    tanggal_mulai: semester ? new Date(semester.tanggal_mulai) : new Date(),
    tanggal_selesai: semester ? new Date(semester.tanggal_selesai) : new Date(),
    is_active: semester?.is_active || false
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      title: isEdit ? 'Edit Semester' : 'Tambah Semester'
    });
  }, [isEdit]);

  const updateFormData = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.nama_semester.trim()) {
      Alert.alert('Error', 'Nama semester wajib diisi');
      return false;
    }
    if (!formData.tahun_ajaran.trim()) {
      Alert.alert('Error', 'Tahun ajaran wajib diisi');
      return false;
    }
    if (formData.tanggal_selesai <= formData.tanggal_mulai) {
      Alert.alert('Error', 'Tanggal selesai harus setelah tanggal mulai');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError(null);

      const submitData = {
        nama_semester: formData.nama_semester.trim(),
        tahun_ajaran: formData.tahun_ajaran.trim(),
        periode: formData.periode,
        tanggal_mulai: formData.tanggal_mulai.toISOString().split('T')[0],
        tanggal_selesai: formData.tanggal_selesai.toISOString().split('T')[0],
        is_active: formData.is_active
      };

      if (isEdit) {
        await dispatch(updateSemester({
          id: semester.id_semester,
          semesterData: submitData
        })).unwrap();
      } else {
        await dispatch(createSemester(submitData)).unwrap();
      }

      Alert.alert(
        'Sukses',
        isEdit ? 'Semester berhasil diperbarui' : 'Semester berhasil ditambahkan',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      setError(err.message || 'Gagal menyimpan semester');
    } finally {
      setLoading(false);
    }
  };

  const onStartDateChange = (event, selectedDate) => {
    setShowStartDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('tanggal_mulai', selectedDate);
    }
  };

  const onEndDateChange = (event, selectedDate) => {
    setShowEndDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      updateFormData('tanggal_selesai', selectedDate);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <ScrollView style={styles.container}>
      {error && <ErrorMessage message={error} />}

      <View style={styles.formContainer}>
        {/* Nama Semester */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nama Semester *</Text>
          <TextInput
            style={styles.input}
            value={formData.nama_semester}
            onChangeText={(value) => updateFormData('nama_semester', value)}
            placeholder="Contoh: Semester Ganjil"
            maxLength={255}
          />
        </View>

        {/* Tahun Ajaran */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tahun Ajaran *</Text>
          <TextInput
            style={styles.input}
            value={formData.tahun_ajaran}
            onChangeText={(value) => updateFormData('tahun_ajaran', value)}
            placeholder="Contoh: 2024/2025"
            maxLength={20}
          />
        </View>

        {/* Periode */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Periode *</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.periode}
              onValueChange={(value) => updateFormData('periode', value)}
              style={styles.picker}
            >
              <Picker.Item label="Semester Ganjil" value="ganjil" />
              <Picker.Item label="Semester Genap" value="genap" />
            </Picker>
          </View>
        </View>

        {/* Tanggal Mulai */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tanggal Mulai *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowStartDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
            <Text style={styles.dateText}>
              {formatDate(formData.tanggal_mulai)}
            </Text>
          </TouchableOpacity>
        </View>

        {showStartDatePicker && (
          <DateTimePicker
            value={formData.tanggal_mulai}
            mode="date"
            display="default"
            onChange={onStartDateChange}
          />
        )}

        {/* Tanggal Selesai */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tanggal Selesai *</Text>
          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowEndDatePicker(true)}
          >
            <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
            <Text style={styles.dateText}>
              {formatDate(formData.tanggal_selesai)}
            </Text>
          </TouchableOpacity>
        </View>

        {showEndDatePicker && (
          <DateTimePicker
            value={formData.tanggal_selesai}
            mode="date"
            display="default"
            onChange={onEndDateChange}
            minimumDate={formData.tanggal_mulai}
          />
        )}

        {/* Status Aktif */}
        <View style={styles.switchGroup}>
          <View style={styles.switchLabel}>
            <Ionicons name="power-outline" size={20} color="#3498db" />
            <Text style={styles.label}>Semester Aktif</Text>
          </View>
          <Switch
            value={formData.is_active}
            onValueChange={(value) => updateFormData('is_active', value)}
            trackColor={{ false: '#ecf0f1', true: '#3498db' }}
            thumbColor={formData.is_active ? '#2980b9' : '#bdc3c7'}
          />
        </View>

        {formData.is_active && (
          <View style={styles.warningCard}>
            <Ionicons name="warning-outline" size={20} color="#e74c3c" />
            <Text style={styles.warningText}>
              Mengaktifkan semester ini akan menonaktifkan semester lain yang sedang aktif.
            </Text>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            title={isEdit ? 'Perbarui' : 'Simpan'}
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
          />
          
          <Button
            title="Batal"
            onPress={() => navigation.goBack()}
            type="outline"
            style={styles.cancelButton}
            disabled={loading}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  formContainer: {
    padding: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2c3e50',
  },
  pickerContainer: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
  dateInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2c3e50',
    flex: 1,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 16,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  warningCard: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#ffcccc',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#c0392b',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 30,
    marginBottom: 20,
  },
  cancelButton: {
    marginTop: 12,
  },
});

export default SemesterFormScreen;