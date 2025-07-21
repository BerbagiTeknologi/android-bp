import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import DateTimePicker from '@react-native-community/datetimepicker';

import LoadingSpinner from '../../../common/components/LoadingSpinner';
import {
  createSemester,
  updateSemester,
  selectSemesterLoading,
  selectSelectedKurikulumForSemester,
  setSelectedKurikulumForSemester
} from '../redux/semesterSlice';
import {
  selectSelectedKurikulum,
  clearSelectedKurikulum
} from '../redux/kurikulumShelterSlice';

const SemesterFormScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  
  const { semester } = route.params || {};
  const isEdit = !!semester;
  
  const loading = useSelector(selectSemesterLoading);
  const selectedKurikulum = useSelector(selectSelectedKurikulum);
  const selectedKurikulumForSemester = useSelector(selectSelectedKurikulumForSemester);
  
  const [formData, setFormData] = useState({
    nama_semester: '',
    tahun_ajaran: '',
    periode: 'ganjil',
    tanggal_mulai: new Date(),
    tanggal_selesai: new Date(),
    is_active: false,
    kurikulum_id: null
  });
  
  const [showStartDate, setShowStartDate] = useState(false);
  const [showEndDate, setShowEndDate] = useState(false);

  useEffect(() => {
    if (semester) {
      setFormData({
        nama_semester: semester.nama_semester || '',
        tahun_ajaran: semester.tahun_ajaran || '',
        periode: semester.periode || 'ganjil',
        tanggal_mulai: semester.tanggal_mulai ? new Date(semester.tanggal_mulai) : new Date(),
        tanggal_selesai: semester.tanggal_selesai ? new Date(semester.tanggal_selesai) : new Date(),
        is_active: semester.is_active || false,
        kurikulum_id: semester.kurikulum_id || null
      });
    }
  }, [semester]);

  useEffect(() => {
    if (selectedKurikulum) {
      setFormData(prev => ({
        ...prev,
        kurikulum_id: selectedKurikulum.id_kurikulum
      }));
      dispatch(setSelectedKurikulumForSemester(selectedKurikulum));
    }
  }, [selectedKurikulum, dispatch]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (event, selectedDate, field) => {
    if (field === 'tanggal_mulai') {
      setShowStartDate(false);
    } else {
      setShowEndDate(false);
    }
    
    if (selectedDate) {
      handleInputChange(field, selectedDate);
    }
  };

  const navigateToKurikulumSelection = () => {
    navigation.navigate('KurikulumSelection');
  };

  const getKurikulumDisplayInfo = () => {
    const kurikulum = selectedKurikulumForSemester || selectedKurikulum;
    if (!kurikulum) return null;
    
    return {
      nama: kurikulum.nama_kurikulum,
      kode: kurikulum.kode_kurikulum,
      jenjang: kurikulum.jenjang?.nama_jenjang || 'N/A',
      mataPelajaran: kurikulum.mata_pelajaran?.nama_mata_pelajaran || 'N/A',
      materiCount: kurikulum.kurikulum_materi_count || kurikulum.materi_count || 0,
      status: kurikulum.is_active ? 'Aktif' : 'Tidak Aktif',
      statusColor: kurikulum.is_active ? '#27ae60' : '#e74c3c'
    };
  };

  const handleRemoveKurikulum = () => {
    Alert.alert(
      'Hapus Kurikulum',
      'Yakin ingin menghapus kurikulum dari semester ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setFormData(prev => ({ ...prev, kurikulum_id: null }));
            dispatch(clearSelectedKurikulum());
            dispatch(setSelectedKurikulumForSemester(null));
          }
        }
      ]
    );
  };

  const validateForm = () => {
    if (!formData.nama_semester.trim()) {
      Alert.alert('Error', 'Nama semester harus diisi');
      return false;
    }
    if (!formData.tahun_ajaran.trim()) {
      Alert.alert('Error', 'Tahun ajaran harus diisi');
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
      const submitData = {
        ...formData,
        tanggal_mulai: formData.tanggal_mulai.toISOString().split('T')[0],
        tanggal_selesai: formData.tanggal_selesai.toISOString().split('T')[0]
      };

      if (isEdit) {
        await dispatch(updateSemester({
          id: semester.id_semester,
          semesterData: submitData
        })).unwrap();
        Alert.alert('Sukses', 'Semester berhasil diperbarui');
      } else {
        await dispatch(createSemester(submitData)).unwrap();
        Alert.alert('Sukses', 'Semester berhasil ditambahkan');
      }
      
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal menyimpan semester');
    }
  };

  const currentKurikulum = selectedKurikulumForSemester || selectedKurikulum;

  if (loading) {
    return <LoadingSpinner fullScreen message="Menyimpan semester..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Kurikulum Selection Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kurikulum</Text>
          <Text style={styles.sectionSubtitle}>
            Pilih kurikulum yang akan digunakan (opsional)
          </Text>
          
          {currentKurikulum ? (
            <View style={styles.selectedKurikulum}>
              <View style={styles.kurikulumInfo}>
                <View style={styles.kurikulumHeader}>
                  <Ionicons name="school" size={20} color="#27ae60" />
                  <Text style={styles.kurikulumName}>{getKurikulumDisplayInfo()?.nama}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getKurikulumDisplayInfo()?.statusColor }]}>
                    <Text style={styles.statusText}>{getKurikulumDisplayInfo()?.status}</Text>
                  </View>
                </View>
                
                <Text style={styles.kurikulumCode}>Kode: {getKurikulumDisplayInfo()?.kode}</Text>
                
                <View style={styles.kurikulumMeta}>
                  <View style={styles.metaItem}>
                    <Ionicons name="library-outline" size={16} color="#7f8c8d" />
                    <Text style={styles.metaText}>Jenjang: {getKurikulumDisplayInfo()?.jenjang}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="book-outline" size={16} color="#7f8c8d" />
                    <Text style={styles.metaText}>Mata Pelajaran: {getKurikulumDisplayInfo()?.mataPelajaran}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Ionicons name="document-text-outline" size={16} color="#7f8c8d" />
                    <Text style={styles.metaText}>{getKurikulumDisplayInfo()?.materiCount} Materi</Text>
                  </View>
                </View>
                
                {currentKurikulum.deskripsi && (
                  <Text style={styles.kurikulumDesc} numberOfLines={2}>
                    {currentKurikulum.deskripsi}
                  </Text>
                )}
              </View>
              
              <View style={styles.kurikulumActions}>
                <TouchableOpacity
                  style={styles.changeButton}
                  onPress={navigateToKurikulumSelection}
                >
                  <Ionicons name="swap-horizontal" size={16} color="#3498db" />
                  <Text style={styles.changeButtonText}>Ganti</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveKurikulum}
                >
                  <Ionicons name="close-circle" size={20} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectKurikulumButton}
              onPress={navigateToKurikulumSelection}
            >
              <Ionicons name="add-circle-outline" size={24} color="#3498db" />
              <Text style={styles.selectKurikulumText}>Pilih Kurikulum</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Semester Form Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Semester</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Semester *</Text>
            <TextInput
              style={styles.input}
              value={formData.nama_semester}
              onChangeText={(value) => handleInputChange('nama_semester', value)}
              placeholder="Contoh: Semester Ganjil"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tahun Ajaran *</Text>
            <TextInput
              style={styles.input}
              value={formData.tahun_ajaran}
              onChangeText={(value) => handleInputChange('tahun_ajaran', value)}
              placeholder="Contoh: 2024/2025"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Periode *</Text>
            <View style={styles.periodeContainer}>
              <TouchableOpacity
                style={[
                  styles.periodeButton,
                  formData.periode === 'ganjil' && styles.periodeButtonActive
                ]}
                onPress={() => handleInputChange('periode', 'ganjil')}
              >
                <Text style={[
                  styles.periodeText,
                  formData.periode === 'ganjil' && styles.periodeTextActive
                ]}>
                  Ganjil
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.periodeButton,
                  formData.periode === 'genap' && styles.periodeButtonActive
                ]}
                onPress={() => handleInputChange('periode', 'genap')}
              >
                <Text style={[
                  styles.periodeText,
                  formData.periode === 'genap' && styles.periodeTextActive
                ]}>
                  Genap
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Mulai *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowStartDate(true)}
            >
              <Text style={styles.dateText}>
                {formData.tanggal_mulai.toLocaleDateString('id-ID')}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tanggal Selesai *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowEndDate(true)}
            >
              <Text style={styles.dateText}>
                {formData.tanggal_selesai.toLocaleDateString('id-ID')}
              </Text>
              <Ionicons name="calendar-outline" size={20} color="#7f8c8d" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Aktifkan Semester</Text>
              <Switch
                value={formData.is_active}
                onValueChange={(value) => handleInputChange('is_active', value)}
                trackColor={{ false: '#bdc3c7', true: '#27ae60' }}
                thumbColor={formData.is_active ? '#ffffff' : '#ecf0f1'}
              />
            </View>
            <Text style={styles.switchNote}>
              Semester aktif akan menjadi default untuk penilaian dan raport
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>
            {isEdit ? 'Perbarui Semester' : 'Tambah Semester'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Date Pickers */}
      {showStartDate && (
        <DateTimePicker
          value={formData.tanggal_mulai}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'tanggal_mulai')}
        />
      )}
      {showEndDate && (
        <DateTimePicker
          value={formData.tanggal_selesai}
          mode="date"
          display="default"
          onChange={(event, date) => handleDateChange(event, date, 'tanggal_selesai')}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 16,
  },
  selectedKurikulum: {
    backgroundColor: '#f8fff8',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#27ae60',
  },
  kurikulumInfo: {
    flex: 1,
  },
  kurikulumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  kurikulumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  kurikulumCode: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  kurikulumMeta: {
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 6,
  },
  kurikulumDesc: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
  kurikulumActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  changeButtonText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  removeButton: {
    padding: 4,
  },
  selectKurikulumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3498db',
    borderStyle: 'dashed',
  },
  selectKurikulumText: {
    fontSize: 16,
    color: '#3498db',
    fontWeight: '600',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  periodeContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodeButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  periodeButtonActive: {
    backgroundColor: '#e74c3c',
  },
  periodeText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '600',
  },
  periodeTextActive: {
    color: '#ffffff',
  },
  dateButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#ffffff',
  },
  dateText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  switchNote: {
    fontSize: 12,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});

export default SemesterFormScreen;