import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image,
  Alert, Platform, ActivityIndicator, Switch
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

import Button from '../../../../common/components/Button';
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';

import {
  createAktivitas, updateAktivitas, selectAktivitasLoading, selectAktivitasError
} from '../../redux/aktivitasSlice';

import { adminShelterKelompokApi } from '../../api/adminShelterKelompokApi';
import { materiApi } from '../../api/materiApi';
import { adminShelterTutorApi } from '../../api/adminShelterTutorApi';

const ActivityFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { activity } = route.params || {};
  const isEditing = !!activity;
  
  const loading = useSelector(selectAktivitasLoading);
  const error = useSelector(selectAktivitasError);
  
  const [formData, setFormData] = useState({
    jenis_kegiatan: '', level: '', nama_kelompok: '', materi: '', id_materi: null,
    tanggal: new Date(), foto_1: null, foto_2: null, foto_3: null,
    selectedKelompokId: null, selectedLevelId: null, start_time: null,
    end_time: null, late_threshold: null, late_minutes_threshold: 15, id_tutor: null
  });
  
  const [uiState, setUIState] = useState({
    showDatePicker: false, showStartTimePicker: false, showEndTimePicker: false,
    showLateThresholdPicker: false, useCustomLateThreshold: false, useCustomMateri: false
  });
  
  const [photos, setPhotos] = useState({ foto_1: null, foto_2: null, foto_3: null });
  const [kelompokList, setKelompokList] = useState([]);
  const [materiList, setMateriList] = useState([]);
  const [tutorList, setTutorList] = useState([]);
  const [loadingStates, setLoadingStates] = useState({
    kelompok: false, materi: false, tutor: false
  });
  const [errors, setErrors] = useState({ kelompok: null, materi: null, tutor: null });
  
  useEffect(() => {
    if (isEditing && activity) initializeEditForm();
    fetchTutorData();
  }, [isEditing, activity]);
  
  useEffect(() => {
    if (formData.jenis_kegiatan === 'Bimbel') fetchKelompokData();
  }, [formData.jenis_kegiatan]);
  
  useEffect(() => {
    if (formData.selectedLevelId && formData.jenis_kegiatan === 'Bimbel' && !uiState.useCustomMateri) {
      fetchMateriData(formData.selectedLevelId);
    }
  }, [formData.selectedLevelId, formData.jenis_kegiatan, uiState.useCustomMateri]);
  
  const initializeEditForm = () => {
    const parseTime = (timeStr) => timeStr ? new Date(`2000-01-01T${timeStr}`) : null;
    
    setFormData({
      ...formData,
      jenis_kegiatan: activity.jenis_kegiatan || '',
      level: activity.level || '',
      nama_kelompok: activity.nama_kelompok || '',
      materi: activity.materi || '',
      id_materi: activity.id_materi || null,
      tanggal: activity.tanggal ? new Date(activity.tanggal) : new Date(),
      start_time: parseTime(activity.start_time),
      end_time: parseTime(activity.end_time),
      late_threshold: parseTime(activity.late_threshold),
      late_minutes_threshold: activity.late_minutes_threshold || 15,
      id_tutor: activity.tutor?.id_tutor || null
    });
    
    setPhotos({
      foto_1: activity.foto_1_url || null,
      foto_2: activity.foto_2_url || null,
      foto_3: activity.foto_3_url || null
    });
    
    setUIState(prev => ({
      ...prev,
      useCustomLateThreshold: activity.late_threshold !== null,
      useCustomMateri: !activity.id_materi
    }));
    
    if (activity.jenis_kegiatan === 'Bimbel') fetchKelompokData();
  };
  
  const fetchData = async (apiCall, setData, setLoading, setError, key) => {
    setLoadingStates(prev => ({ ...prev, [key]: true }));
    setErrors(prev => ({ ...prev, [key]: null }));
    
    try {
      const response = await apiCall();
      setData(response.data?.data || []);
    } catch (err) {
      console.error(`Error fetching ${key}:`, err);
      setErrors(prev => ({ ...prev, [key]: `Gagal memuat data ${key}` }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }));
    }
  };
  
  const fetchKelompokData = () => fetchData(
    adminShelterKelompokApi.getAllKelompok,
    (data) => {
      setKelompokList(data);
      if (isEditing && formData.nama_kelompok) {
        const match = data.find(k => k.nama_kelompok === formData.nama_kelompok);
        if (match) {
          setFormData(prev => ({
            ...prev,
            selectedKelompokId: match.id_kelompok,
            level: match.level_anak_binaan?.nama_level_binaan || prev.level,
            selectedLevelId: match.level_anak_binaan?.id_level_anak_binaan || null
          }));
        }
      }
    },
    setLoadingStates,
    setErrors,
    'kelompok'
  );
  
  const fetchMateriData = (levelId) => fetchData(
    () => materiApi.getMateriByLevel(levelId),
    setMateriList,
    setLoadingStates,
    setErrors,
    'materi'
  );
  
  const fetchTutorData = () => fetchData(
    adminShelterTutorApi.getActiveTutors,
    setTutorList,
    setLoadingStates,
    setErrors,
    'tutor'
  );
  
  const handleChange = (name, value) => {
    if (name === 'jenis_kegiatan') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        level: value === 'Bimbel' ? prev.level : '',
        nama_kelompok: value === 'Bimbel' ? prev.nama_kelompok : '',
        selectedKelompokId: value === 'Bimbel' ? prev.selectedKelompokId : null,
        selectedLevelId: value === 'Bimbel' ? prev.selectedLevelId : null,
        id_materi: value === 'Bimbel' ? prev.id_materi : null
      }));
      
      if (value !== 'Bimbel') {
        setMateriList([]);
        setUIState(prev => ({ ...prev, useCustomMateri: false }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleKelompokChange = (kelompokId) => {
    const selected = kelompokList.find(k => k.id_kelompok === kelompokId);
    
    setFormData(prev => ({
      ...prev,
      selectedKelompokId: kelompokId,
      nama_kelompok: selected?.nama_kelompok || '',
      level: selected?.level_anak_binaan?.nama_level_binaan || '',
      selectedLevelId: selected?.level_anak_binaan?.id_level_anak_binaan || null,
      id_materi: null,
      materi: ''
    }));
  };
  
  const handleMateriChange = (materiId) => {
    const selected = materiList.find(m => m.id_materi === materiId);
    setFormData(prev => ({
      ...prev,
      id_materi: materiId,
      materi: selected ? `${selected.mata_pelajaran} - ${selected.nama_materi}` : ''
    }));
  };
  
  const toggleCustomMateri = (value) => {
    setUIState(prev => ({ ...prev, useCustomMateri: value }));
    setFormData(prev => ({ ...prev, id_materi: null, materi: '' }));
    
    if (!value && formData.selectedLevelId) {
      fetchMateriData(formData.selectedLevelId);
    }
  };
  
  const handleTimeChange = (event, selectedTime, field, pickerField) => {
    setUIState(prev => ({ ...prev, [pickerField]: false }));
    if (selectedTime) {
      setFormData(prev => ({ ...prev, [field]: selectedTime }));
    }
  };
  
  const toggleCustomLateThreshold = (value) => {
    setUIState(prev => ({ ...prev, useCustomLateThreshold: value }));
    
    if (!value) {
      handleChange('late_threshold', null);
    } else if (formData.start_time && !formData.late_threshold) {
      const lateTime = new Date(formData.start_time);
      lateTime.setMinutes(lateTime.getMinutes() + formData.late_minutes_threshold);
      handleChange('late_threshold', lateTime);
    }
  };
  
  const handleSelectPhoto = async (photoKey) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Kami memerlukan izin galeri untuk memilih foto.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [4, 3], quality: 0.8
      });
      
      if (!result.canceled && result.assets?.[0]) {
        const image = result.assets[0];
        setFormData(prev => ({
          ...prev,
          [photoKey]: {
            uri: image.uri,
            name: image.uri.split('/').pop(),
            type: 'image/jpeg'
          }
        }));
        setPhotos(prev => ({ ...prev, [photoKey]: image.uri }));
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Gagal memilih foto');
    }
  };
  
  const handleRemovePhoto = (photoKey) => {
    setFormData(prev => ({ ...prev, [photoKey]: null }));
    setPhotos(prev => ({ ...prev, [photoKey]: null }));
  };
  
  const formatTime = (time) => !time ? 'Belum diatur' : format(time, 'HH:mm');
  
  const validateForm = () => {
    if (!formData.jenis_kegiatan || !formData.tanggal) {
      Alert.alert('Error Validasi', 'Jenis aktivitas dan tanggal wajib diisi');
      return false;
    }
    
    if (!formData.id_tutor) {
      Alert.alert('Error Validasi', 'Silakan pilih tutor untuk aktivitas ini');
      return false;
    }
    
    if (formData.jenis_kegiatan === 'Bimbel' && !formData.selectedKelompokId) {
      Alert.alert('Error Validasi', 'Silakan pilih kelompok untuk aktivitas Bimbel');
      return false;
    }
    
    if (formData.jenis_kegiatan === 'Bimbel' && !uiState.useCustomMateri && !formData.id_materi) {
      Alert.alert('Error Validasi', 'Silakan pilih materi dari daftar');
      return false;
    }
    
    if ((formData.jenis_kegiatan === 'Kegiatan' || uiState.useCustomMateri) && !formData.materi) {
      Alert.alert('Error Validasi', 'Materi tidak boleh kosong');
      return false;
    }
    
    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      Alert.alert('Error Validasi', 'Waktu selesai harus setelah waktu mulai');
      return false;
    }
    
    if (uiState.useCustomLateThreshold && formData.late_threshold && formData.start_time && 
        formData.late_threshold < formData.start_time) {
      Alert.alert('Error Validasi', 'Batas terlambat harus setelah waktu mulai');
      return false;
    }
    
    return true;
  };
  
  const prepareFormData = () => {
    const data = new FormData();
    
    data.append('jenis_kegiatan', formData.jenis_kegiatan);
    
    if (formData.id_tutor) data.append('id_tutor', formData.id_tutor);
    
    if (formData.jenis_kegiatan === 'Bimbel') {
      data.append('level', formData.level || '');
      data.append('nama_kelompok', formData.nama_kelompok || '');
      
      if (!uiState.useCustomMateri && formData.id_materi) {
        data.append('id_materi', formData.id_materi);
      } else {
        data.append('materi', formData.materi || '');
      }
    } else {
      data.append('level', '');
      data.append('nama_kelompok', '');
      data.append('materi', formData.materi || '');
    }
    
    data.append('tanggal', format(formData.tanggal, 'yyyy-MM-dd'));
    
    if (formData.start_time) data.append('start_time', format(formData.start_time, 'HH:mm:ss'));
    if (formData.end_time) data.append('end_time', format(formData.end_time, 'HH:mm:ss'));
    
    if (uiState.useCustomLateThreshold && formData.late_threshold) {
      data.append('late_threshold', format(formData.late_threshold, 'HH:mm:ss'));
    } else {
      data.append('late_minutes_threshold', formData.late_minutes_threshold.toString());
    }
    
    ['foto_1', 'foto_2', 'foto_3'].forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });
    
    return data;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    const data = prepareFormData();
    
    try {
      if (isEditing) {
        await dispatch(updateAktivitas({ id: activity.id_aktivitas, aktivitasData: data })).unwrap();
        Alert.alert('Berhasil', 'Aktivitas berhasil diperbarui', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        await dispatch(createAktivitas(data)).unwrap();
        Alert.alert('Berhasil', 'Aktivitas berhasil dibuat', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (err) {
      console.error('Error saving activity:', err);
      Alert.alert('Error', err || 'Gagal menyimpan aktivitas');
    }
  };

  const TypeButton = ({ type, label, active, onPress }) => (
    <TouchableOpacity
      style={[styles.typeButton, active && styles.typeButtonActive]}
      onPress={() => onPress(type)}
    >
      <Text style={[styles.typeButtonText, active && styles.typeButtonTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const TimePickerButton = ({ time, placeholder, onPress, icon = "time" }) => (
    <TouchableOpacity style={styles.timeButton} onPress={onPress}>
      <Text style={styles.timeText}>{formatTime(time) === 'Belum diatur' ? placeholder : formatTime(time)}</Text>
      <Ionicons name={icon} size={24} color="#3498db" />
    </TouchableOpacity>
  );

  const PhotoBox = ({ photoKey, uri, onSelect, onRemove }) => (
    <View style={styles.photoBox}>
      {uri ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri }} style={styles.photoPreview} />
          <TouchableOpacity style={styles.removePhotoButton} onPress={() => onRemove(photoKey)}>
            <Ionicons name="close-circle" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addPhotoButton} onPress={() => onSelect(photoKey)}>
          <Ionicons name="camera" size={32} color="#bdc3c7" />
          <Text style={styles.addPhotoText}>{photoKey.replace('foto_', 'Foto ')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const LoadingIndicator = ({ loading, text }) => loading && (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#3498db" />
      <Text style={styles.loadingText}>{text}</Text>
    </View>
  );

  const PickerSection = ({ data, loading, error, onRetry, placeholder, selectedValue, onValueChange, labelKey, valueKey }) => {
    if (loading) return <LoadingIndicator loading={loading} text="Memuat..." />;
    if (error) return <ErrorMessage message={error} onRetry={onRetry} style={styles.errorContainer} />;
    
    return (
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedValue || ''} onValueChange={onValueChange} style={styles.picker}>
          <Picker.Item label={placeholder} value="" />
          {data.map(item => (
            <Picker.Item key={item[valueKey]} label={item[labelKey]} value={item[valueKey]} />
          ))}
        </Picker>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <ErrorMessage message={error} />}
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Jenis Aktivitas<Text style={styles.required}>*</Text></Text>
        <View style={styles.typeButtons}>
          <TypeButton 
            type="Bimbel" 
            label="Bimbel" 
            active={formData.jenis_kegiatan === 'Bimbel'}
            onPress={(type) => handleChange('jenis_kegiatan', type)}
          />
          <TypeButton 
            type="Kegiatan" 
            label="Kegiatan" 
            active={formData.jenis_kegiatan === 'Kegiatan'}
            onPress={(type) => handleChange('jenis_kegiatan', type)}
          />
        </View>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tutor yang Ditugaskan<Text style={styles.required}>*</Text></Text>
        <PickerSection
          data={tutorList}
          loading={loadingStates.tutor}
          error={errors.tutor}
          onRetry={fetchTutorData}
          placeholder="Pilih tutor"
          selectedValue={formData.id_tutor}
          onValueChange={(value) => handleChange('id_tutor', value || null)}
          labelKey="nama"
          valueKey="id_tutor"
        />
      </View>
      
      {formData.jenis_kegiatan === 'Bimbel' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Kelompok<Text style={styles.required}>*</Text></Text>
            <PickerSection
              data={kelompokList}
              loading={loadingStates.kelompok}
              error={errors.kelompok}
              onRetry={fetchKelompokData}
              placeholder="Pilih kelompok"
              selectedValue={formData.selectedKelompokId}
              onValueChange={handleKelompokChange}
              labelKey="nama_kelompok"
              valueKey="id_kelompok"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tingkat</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={formData.level}
              editable={false}
              placeholder="Tingkat akan terisi otomatis"
            />
          </View>
          
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Input materi manual</Text>
              <Switch
                value={uiState.useCustomMateri}
                onValueChange={toggleCustomMateri}
                trackColor={{ false: '#bdc3c7', true: '#2ecc71' }}
                thumbColor={uiState.useCustomMateri ? '#27ae60' : '#ecf0f1'}
              />
            </View>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Materi<Text style={styles.required}>*</Text></Text>
            {uiState.useCustomMateri ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.materi}
                onChangeText={(value) => handleChange('materi', value)}
                placeholder="Deskripsi Materi"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : !formData.selectedLevelId ? (
              <View style={styles.infoContainer}>
                <Ionicons name="information-circle" size={20} color="#3498db" />
                <Text style={styles.infoText}>Silakan pilih kelompok terlebih dahulu</Text>
              </View>
            ) : (
              <PickerSection
                data={materiList}
                loading={loadingStates.materi}
                error={errors.materi}
                onRetry={() => fetchMateriData(formData.selectedLevelId)}
                placeholder="Pilih materi"
                selectedValue={formData.id_materi}
                onValueChange={handleMateriChange}
                labelKey={(item) => `${item.mata_pelajaran} - ${item.nama_materi}`}
                valueKey="id_materi"
              />
            )}
          </View>
        </>
      )}
      
      {formData.jenis_kegiatan === 'Kegiatan' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Materi<Text style={styles.required}>*</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.materi}
            onChangeText={(value) => handleChange('materi', value)}
            placeholder="Deskripsi Materi"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      )}
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tanggal<Text style={styles.required}>*</Text></Text>
        <TouchableOpacity 
          style={styles.dateButton}
          onPress={() => setUIState(prev => ({ ...prev, showDatePicker: true }))}
        >
          <Text style={styles.dateText}>{format(formData.tanggal, 'dd MMMM yyyy')}</Text>
          <Ionicons name="calendar" size={24} color="#3498db" />
        </TouchableOpacity>
        
        {uiState.showDatePicker && (
          <DateTimePicker
            value={formData.tanggal}
            mode="date"
            display="default"
            onChange={(event, date) => {
              setUIState(prev => ({ ...prev, showDatePicker: false }));
              if (date) handleChange('tanggal', date);
            }}
          />
        )}
      </View>
      
      <View style={styles.sectionHeader}>
        <Ionicons name="time-outline" size={20} color="#3498db" style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Jadwal Kegiatan</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Waktu Mulai</Text>
        <TimePickerButton
          time={formData.start_time}
          placeholder="Ketuk untuk mengatur waktu mulai"
          onPress={() => setUIState(prev => ({ ...prev, showStartTimePicker: true }))}
        />
        
        {uiState.showStartTimePicker && (
          <DateTimePicker
            value={formData.start_time || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, time) => handleTimeChange(event, time, 'start_time', 'showStartTimePicker')}
          />
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Waktu Selesai</Text>
        <TimePickerButton
          time={formData.end_time}
          placeholder="Ketuk untuk mengatur waktu selesai"
          onPress={() => setUIState(prev => ({ ...prev, showEndTimePicker: true }))}
        />
        
        {uiState.showEndTimePicker && (
          <DateTimePicker
            value={formData.end_time || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={(event, time) => handleTimeChange(event, time, 'end_time', 'showEndTimePicker')}
          />
        )}
      </View>
      
      <View style={styles.sectionHeader}>
        <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Pengaturan Keterlambatan</Text>
      </View>
      
      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Gunakan waktu terlambat khusus</Text>
          <Switch
            value={uiState.useCustomLateThreshold}
            onValueChange={toggleCustomLateThreshold}
            trackColor={{ false: '#bdc3c7', true: '#2ecc71' }}
            thumbColor={uiState.useCustomLateThreshold ? '#27ae60' : '#ecf0f1'}
          />
        </View>
        
        {uiState.useCustomLateThreshold ? (
          <View style={styles.nestedInput}>
            <Text style={styles.nestedLabel}>Waktu Terlambat</Text>
            <TimePickerButton
              time={formData.late_threshold}
              placeholder="Ketuk untuk mengatur batas terlambat"
              onPress={() => setUIState(prev => ({ ...prev, showLateThresholdPicker: true }))}
              icon="alert-circle"
            />
            
            {uiState.showLateThresholdPicker && (
              <DateTimePicker
                value={formData.late_threshold || new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={(event, time) => handleTimeChange(event, time, 'late_threshold', 'showLateThresholdPicker')}
              />
            )}
            <Text style={styles.helperText}>
              Siswa dianggap terlambat jika datang setelah waktu ini
            </Text>
          </View>
        ) : (
          <View style={styles.nestedInput}>
            <Text style={styles.nestedLabel}>Batas Waktu Terlambat (menit)</Text>
            <TextInput
              style={styles.minutesInput}
              value={formData.late_minutes_threshold.toString()}
              onChangeText={(value) => handleChange('late_minutes_threshold', parseInt(value) || 0)}
              keyboardType="number-pad"
              placeholder="15"
            />
            <Text style={styles.helperText}>
              Siswa dianggap terlambat jika datang {formData.late_minutes_threshold} menit setelah waktu mulai
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Foto</Text>
        <View style={styles.photosContainer}>
          {['foto_1', 'foto_2', 'foto_3'].map(key => (
            <PhotoBox
              key={key}
              photoKey={key}
              uri={photos[key]}
              onSelect={handleSelectPhoto}
              onRemove={handleRemovePhoto}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Perbarui Aktivitas' : 'Buat Aktivitas'}
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          fullWidth
        />
        
        <Button
          title="Batal"
          onPress={() => navigation.goBack()}
          type="outline"
          disabled={loading}
          fullWidth
          style={styles.cancelButton}
        />
      </View>
      
      {loading && (
        <LoadingSpinner 
          fullScreen 
          message={isEditing ? 'Memperbarui aktivitas...' : 'Membuat aktivitas...'}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: '#34495e', marginBottom: 8, fontWeight: '500' },
  required: { color: '#e74c3c' },
  typeButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  typeButton: {
    flex: 1, backgroundColor: '#f5f5f5', paddingVertical: 12, paddingHorizontal: 16,
    borderRadius: 8, alignItems: 'center', marginHorizontal: 4,
    borderWidth: 1, borderColor: '#ddd'
  },
  typeButtonActive: { backgroundColor: '#3498db', borderColor: '#3498db' },
  typeButtonText: { fontSize: 16, color: '#34495e', fontWeight: '500' },
  typeButtonTextActive: { color: '#fff' },
  input: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16
  },
  disabledInput: { backgroundColor: '#f0f0f0', color: '#7f8c8d' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  pickerContainer: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, overflow: 'hidden'
  },
  picker: { height: 50 },
  infoContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4f8',
    padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#bce0f4'
  },
  infoText: { flex: 1, marginLeft: 8, color: '#2c88a6', fontSize: 14 },
  dateButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10
  },
  dateText: { fontSize: 16, color: '#34495e' },
  timeButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10
  },
  timeText: { fontSize: 16, color: '#34495e' },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', marginBottom: 12,
    paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'
  },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#2c3e50' },
  switchContainer: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12
  },
  switchLabel: { fontSize: 16, color: '#34495e' },
  nestedInput: {
    marginTop: 8, marginLeft: 8, paddingLeft: 12,
    borderLeftWidth: 2, borderLeftColor: '#f0f0f0'
  },
  nestedLabel: { fontSize: 14, color: '#7f8c8d', marginBottom: 6 },
  minutesInput: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 16, width: '50%'
  },
  helperText: {
    fontSize: 12, color: '#95a5a6', marginTop: 6, fontStyle: 'italic'
  },
  photosContainer: {
    flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap'
  },
  photoBox: { width: '32%', aspectRatio: 1, marginBottom: 10, borderRadius: 8, overflow: 'hidden' },
  addPhotoButton: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  addPhotoText: { color: '#7f8c8d', marginTop: 4, fontSize: 12 },
  photoPreviewContainer: { width: '100%', height: '100%', position: 'relative' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 8 },
  removePhotoButton: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 12
  },
  buttonContainer: { marginTop: 20 },
  cancelButton: { marginTop: 12 },
  loadingContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 12, backgroundColor: '#f9f9f9', borderRadius: 8,
    borderWidth: 1, borderColor: '#ddd'
  },
  loadingText: { marginLeft: 8, color: '#7f8c8d' },
  errorContainer: { marginVertical: 0 }
});

export default ActivityFormScreen;