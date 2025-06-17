import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  ActivityIndicator,
  Switch
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { format } from 'date-fns';

// Components
import Button from '../../../../common/components/Button';
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';

// Redux
import {
  createAktivitas,
  updateAktivitas,
  selectAktivitasLoading,
  selectAktivitasError
} from '../../redux/aktivitasSlice';

// API
import { adminShelterKelompokApi } from '../../api/adminShelterKelompokApi';
import { materiApi } from '../../api/materiApi';
import { adminShelterTutorApi } from '../../api/adminShelterTutorApi';

const ActivityFormScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  // Get activity from route params if editing
  const { activity } = route.params || {};
  const isEditing = !!activity;
  
  // Redux state
  const loading = useSelector(selectAktivitasLoading);
  const error = useSelector(selectAktivitasError);
  
  // Form state
  const [formData, setFormData] = useState({
    jenis_kegiatan: '',
    level: '',
    nama_kelompok: '',
    materi: '',
    id_materi: null,
    tanggal: new Date(),
    foto_1: null,
    foto_2: null,
    foto_3: null,
    selectedKelompokId: null,
    selectedLevelId: null, // Store level ID for materi fetching
    start_time: null,
    end_time: null,
    late_threshold: null,
    late_minutes_threshold: 15,
    id_tutor: null
  });
  
  // UI state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showLateThresholdPicker, setShowLateThresholdPicker] = useState(false);
  const [useCustomLateThreshold, setUseCustomLateThreshold] = useState(false);
  
  const [photos, setPhotos] = useState({
    foto_1: null,
    foto_2: null,
    foto_3: null
  });
  
  // Kelompok data state
  const [kelompokList, setKelompokList] = useState([]);
  const [kelompokLoading, setKelompokLoading] = useState(false);
  const [kelompokError, setKelompokError] = useState(null);
  
  // Materi data state
  const [materiList, setMateriList] = useState([]);
  const [materiLoading, setMateriLoading] = useState(false);
  const [materiError, setMateriError] = useState(null);
  const [useCustomMateri, setUseCustomMateri] = useState(false);
  
const [tutorList, setTutorList] = useState([]);
const [tutorLoading, setTutorLoading] = useState(false);
const [tutorError, setTutorError] = useState(null);

  // Load activity data if editing
  useEffect(() => {
    if (isEditing && activity) {
      const startTime = activity.start_time ? new Date(`2000-01-01T${activity.start_time}`) : null;
      const endTime = activity.end_time ? new Date(`2000-01-01T${activity.end_time}`) : null;
      const lateThreshold = activity.late_threshold ? new Date(`2000-01-01T${activity.late_threshold}`) : null;
      
      setFormData({
        jenis_kegiatan: activity.jenis_kegiatan || '',
        level: activity.level || '',
        nama_kelompok: activity.nama_kelompok || '',
        materi: activity.materi || '',
        id_materi: activity.id_materi || null,
        tanggal: activity.tanggal ? new Date(activity.tanggal) : new Date(),
        selectedKelompokId: null,
        selectedLevelId: null,
        start_time: startTime,
        end_time: endTime,
        late_threshold: lateThreshold,
        late_minutes_threshold: activity.late_minutes_threshold || 15
      });
      
      // Set photos and custom toggles
      setPhotos({
        foto_1: activity.foto_1_url || null,
        foto_2: activity.foto_2_url || null,
        foto_3: activity.foto_3_url || null
      });
      
      setUseCustomLateThreshold(activity.late_threshold !== null);
      setUseCustomMateri(!activity.id_materi);
      
      // If activity type is Bimbel, fetch kelompok data
      if (activity.jenis_kegiatan === 'Bimbel') {
        fetchKelompokData();
        
      }
    }
  }, [isEditing, activity]);
  
  // Fetch kelompok data when Bimbel is selected
  useEffect(() => {
    if (formData.jenis_kegiatan === 'Bimbel') {
      fetchKelompokData();
    }
  }, [formData.jenis_kegiatan]);
  
  // Fetch materi when level changes
  useEffect(() => {
    if (formData.selectedLevelId && formData.jenis_kegiatan === 'Bimbel' && !useCustomMateri) {
      fetchMateriData(formData.selectedLevelId);
    }
  }, [formData.selectedLevelId, formData.jenis_kegiatan, useCustomMateri]);
  
  useEffect(() => {
  fetchTutorData();
}, []);

  // Fetch kelompok data from API
  const fetchKelompokData = async () => {
    setKelompokLoading(true);
    setKelompokError(null);
    
    try {
      const response = await adminShelterKelompokApi.getAllKelompok();
      
      if (response.data && response.data.data) {
        setKelompokList(response.data.data);
        
        // If editing and we have nama_kelompok, try to find matching kelompok
        if (isEditing && formData.nama_kelompok) {
          const matchingKelompok = response.data.data.find(
            k => k.nama_kelompok === formData.nama_kelompok
          );
          
          if (matchingKelompok) {
            setFormData(prev => ({
              ...prev,
              selectedKelompokId: matchingKelompok.id_kelompok,
              level: matchingKelompok.level_anak_binaan?.nama_level_binaan || prev.level,
              selectedLevelId: matchingKelompok.level_anak_binaan?.id_level_anak_binaan || null
            }));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching kelompok data:', error);
      setKelompokError('Failed to load group data. Please try again.');
    } finally {
      setKelompokLoading(false);
    }
  };
  
  // Fetch materi data from API
  const fetchMateriData = async (levelId) => {
    setMateriLoading(true);
    setMateriError(null);
    
    try {
      const response = await materiApi.getMateriByLevel(levelId);
      
      if (response.data && response.data.data) {
        setMateriList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching materi data:', error);
      setMateriError('Failed to load materi data.');
    } finally {
      setMateriLoading(false);
    }
  };
  
  // Add this method to fetch tutor data
const fetchTutorData = async () => {
  setTutorLoading(true);
  setTutorError(null);
  
  try {
    const response = await adminShelterTutorApi.getActiveTutors();
    
    if (response.data && response.data.data) {
      setTutorList(response.data.data);
    } else {
      setTutorList([]);
    }
  } catch (error) {
    console.error('Error fetching tutor data:', error);
    setTutorError('Failed to load tutor data. Please try again.');
  } finally {
    setTutorLoading(false);
  }
};

  // Handle form input changes
  const handleChange = (name, value) => {
    if (name === 'jenis_kegiatan') {
      // Clear level and kelompok data when switching activity types
      setFormData({
        ...formData,
        [name]: value,
        level: value === 'Bimbel' ? formData.level : '',
        nama_kelompok: value === 'Bimbel' ? formData.nama_kelompok : '',
        selectedKelompokId: value === 'Bimbel' ? formData.selectedKelompokId : null,
        selectedLevelId: value === 'Bimbel' ? formData.selectedLevelId : null,
        id_materi: value === 'Bimbel' ? formData.id_materi : null
      });
      
      if (value !== 'Bimbel') {
        setMateriList([]);
        setUseCustomMateri(false);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle kelompok selection
  const handleKelompokChange = (kelompokId) => {
    const selectedKelompok = kelompokList.find(k => k.id_kelompok === kelompokId);
    
    if (selectedKelompok) {
      setFormData({
        ...formData,
        selectedKelompokId: kelompokId,
        nama_kelompok: selectedKelompok.nama_kelompok,
        level: selectedKelompok.level_anak_binaan?.nama_level_binaan || '',
        selectedLevelId: selectedKelompok.level_anak_binaan?.id_level_anak_binaan || null,
        id_materi: null, // Reset materi selection when kelompok changes
        materi: '' // Reset custom materi text
      });
    } else {
      setFormData({
        ...formData,
        selectedKelompokId: null,
        nama_kelompok: '',
        level: '',
        selectedLevelId: null,
        id_materi: null,
        materi: ''
      });
    }
  };
  
  // Handle materi selection
  const handleMateriChange = (materiId) => {
    const selectedMateri = materiList.find(m => m.id_materi === materiId);
    
    if (selectedMateri) {
      setFormData({
        ...formData,
        id_materi: materiId,
        materi: `${selectedMateri.mata_pelajaran} - ${selectedMateri.nama_materi}`
      });
    } else {
      setFormData({
        ...formData,
        id_materi: null,
        materi: ''
      });
    }
  };
  
  // Toggle custom materi input
  const toggleCustomMateri = (value) => {
    setUseCustomMateri(value);
    
    if (value) {
      // Switch to custom materi input
      setFormData({
        ...formData,
        id_materi: null,
        materi: ''
      });
    } else {
      // Switch to dropdown, clear materi text
      setFormData({
        ...formData,
        id_materi: null,
        materi: ''
      });
      
      // Refetch materi if level is selected
      if (formData.selectedLevelId) {
        fetchMateriData(formData.selectedLevelId);
      }
    }
  };
  
  // Handle date change
  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      handleChange('tanggal', selectedDate);
    }
  };
  
  // Handle time changes (same as before)
  const handleStartTimeChange = (event, selectedTime) => {
    setShowStartTimePicker(false);
    if (selectedTime) {
      setFormData(prevData => ({
        ...prevData,
        start_time: selectedTime
      }));
    }
  };
  
  const handleEndTimeChange = (event, selectedTime) => {
    setShowEndTimePicker(false);
    if (selectedTime) {
      setFormData(prevData => ({
        ...prevData,
        end_time: selectedTime
      }));
    }
  };
  
  const handleLateThresholdChange = (event, selectedTime) => {
    setShowLateThresholdPicker(false);
    if (selectedTime) {
      setFormData(prevData => ({
        ...prevData,
        late_threshold: selectedTime
      }));
    }
  };
  
  // Toggle custom late threshold
  const toggleCustomLateThreshold = (value) => {
    setUseCustomLateThreshold(value);
    
    if (!value) {
      handleChange('late_threshold', null);
    } else if (formData.start_time && !formData.late_threshold) {
      const lateTime = new Date(formData.start_time);
      lateTime.setMinutes(lateTime.getMinutes() + formData.late_minutes_threshold);
      handleChange('late_threshold', lateTime);
    }
  };
  
  // Handle photo selection (same as before)
  const handleSelectPhoto = async (photoKey) => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'We need camera roll permissions to select photos.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedImage = result.assets[0];
        
        setFormData({
          ...formData,
          [photoKey]: {
            uri: selectedImage.uri,
            name: selectedImage.uri.split('/').pop(),
            type: 'image/jpeg'
          }
        });
        
        setPhotos({
          ...photos,
          [photoKey]: selectedImage.uri
        });
      }
    } catch (error) {
      console.error('Error selecting photo:', error);
      Alert.alert('Error', 'Failed to select photo');
    }
  };
  
  const handleRemovePhoto = (photoKey) => {
    setFormData({
      ...formData,
      [photoKey]: null
    });
    
    setPhotos({
      ...photos,
      [photoKey]: null
    });
  };
  
  // Format time for display
  const formatTime = (time) => {
    if (!time) return 'Not set';
    return format(time, 'HH:mm');
  };
  
  // Prepare form data for submission
  // Updated prepareFormData function
const prepareFormData = () => {
  const data = new FormData();
  
  // Add text fields
  data.append('jenis_kegiatan', formData.jenis_kegiatan);
  
  // Add tutor ID
  if (formData.id_tutor) {
    data.append('id_tutor', formData.id_tutor);
  }
  
  // Only include level and nama_kelompok if jenis_kegiatan is Bimbel
  if (formData.jenis_kegiatan === 'Bimbel') {
    data.append('level', formData.level || '');
    data.append('nama_kelompok', formData.nama_kelompok || '');
    
    // Include either id_materi or custom materi text
    if (!useCustomMateri && formData.id_materi) {
      data.append('id_materi', formData.id_materi);
    } else {
      data.append('materi', formData.materi || '');
    }
  } else {
    // For Kegiatan, explicitly send empty strings and custom materi
    data.append('level', '');
    data.append('nama_kelompok', '');
    data.append('materi', formData.materi || '');
  }
  
  data.append('tanggal', format(formData.tanggal, 'yyyy-MM-dd'));
  
  // Add time information if available
  if (formData.start_time) {
    data.append('start_time', format(formData.start_time, 'HH:mm:ss'));
  }
  
  if (formData.end_time) {
    data.append('end_time', format(formData.end_time, 'HH:mm:ss'));
  }
  
  // Add late threshold information
  if (useCustomLateThreshold && formData.late_threshold) {
    data.append('late_threshold', format(formData.late_threshold, 'HH:mm:ss'));
  } else {
    data.append('late_minutes_threshold', formData.late_minutes_threshold.toString());
  }
  
  // Add photos if selected
  if (formData.foto_1) {
    data.append('foto_1', formData.foto_1);
  }
  
  if (formData.foto_2) {
    data.append('foto_2', formData.foto_2);
  }
  
  if (formData.foto_3) {
    data.append('foto_3', formData.foto_3);
  }
  
  return data;
};
  
  // Handle form submission
  const handleSubmit = async () => {
  // Validate required fields
  if (!formData.jenis_kegiatan || !formData.tanggal) {
    Alert.alert('Validation Error', 'Activity type and date are required');
    return;
  }
  
  // Validate tutor selection (required field)
  if (!formData.id_tutor) {
    Alert.alert('Validation Error', 'Please select a tutor for this activity');
    return;
  }
  
  // If Bimbel is selected, validate kelompok selection
  if (formData.jenis_kegiatan === 'Bimbel' && !formData.selectedKelompokId) {
    Alert.alert('Validation Error', 'Please select a group for Bimbel activity');
    return;
  }
  
  // Validate materi field
  if (formData.jenis_kegiatan === 'Bimbel' && !useCustomMateri && !formData.id_materi) {
    Alert.alert('Validation Error', 'Please select a materi from the list');
    return;
  }
  
  if ((formData.jenis_kegiatan === 'Kegiatan' || useCustomMateri) && !formData.materi) {
    Alert.alert('Validation Error', 'Materi cannot be empty');
    return;
  }
  
  // Validate schedule consistency
  if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
    Alert.alert('Validation Error', 'End time must be after start time');
    return;
  }
  
  if (useCustomLateThreshold && formData.late_threshold && formData.start_time && formData.late_threshold < formData.start_time) {
    Alert.alert('Validation Error', 'Late threshold must be after start time');
    return;
  }
  
  const data = prepareFormData();
  
  try {
    if (isEditing) {
      await dispatch(updateAktivitas({ id: activity.id_aktivitas, aktivitasData: data })).unwrap();
      Alert.alert('Success', 'Activity updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } else {
      await dispatch(createAktivitas(data)).unwrap();
      Alert.alert('Success', 'Activity created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    }
  } catch (err) {
    console.error('Error saving activity:', err);
    Alert.alert('Error', err || 'Failed to save activity');
  }
};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* Error message */}
      {error && <ErrorMessage message={error} />}
      
      {/* Activity Type - Button Selection */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tipe Aktivitas<Text style={styles.required}>*</Text></Text>
        <View style={styles.activityTypeButtons}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.jenis_kegiatan === 'Bimbel' && styles.typeButtonActive
            ]}
            onPress={() => handleChange('jenis_kegiatan', 'Bimbel')}
          >
            <Text style={[
              styles.typeButtonText,
              formData.jenis_kegiatan === 'Bimbel' && styles.typeButtonTextActive
            ]}>
              Bimbel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              formData.jenis_kegiatan === 'Kegiatan' && styles.typeButtonActive
            ]}
            onPress={() => handleChange('jenis_kegiatan', 'Kegiatan')}
          >
            <Text style={[
              styles.typeButtonText,
              formData.jenis_kegiatan === 'Kegiatan' && styles.typeButtonTextActive
            ]}>
              Kegiatan
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      
{/* Tutor Selection */}
<View style={styles.inputGroup}>
  <Text style={styles.label}>Assigned Tutor</Text>
  
  {tutorLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="small" color="#3498db" />
      <Text style={styles.loadingText}>Loading tutors...</Text>
    </View>
  ) : tutorError ? (
    <ErrorMessage 
      message={tutorError} 
      onRetry={fetchTutorData}
      style={styles.errorContainer} 
    />
  ) : (
    <View style={styles.pickerContainer}>
      <Picker
        selectedValue={formData.id_tutor || ''}
        onValueChange={(value) => handleChange('id_tutor', value || null)}
        style={styles.picker}
        enabled={!loading}
      >
        <Picker.Item label="No tutor assigned" value="" />
        {tutorList.map(tutor => (
          <Picker.Item 
            key={tutor.id_tutor} 
            label={tutor.nama}
            value={tutor.id_tutor} 
          />
        ))}
      </Picker>
    </View>
  )}
</View>
      
      {/* Kelompok Picker - Only shown for Bimbel */}
      {formData.jenis_kegiatan === 'Bimbel' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Kelompok<Text style={styles.required}>*</Text></Text>
          
          {kelompokLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.loadingText}>Loading groups...</Text>
            </View>
          ) : kelompokError ? (
            <ErrorMessage 
              message={kelompokError} 
              onRetry={fetchKelompokData}
              style={styles.errorContainer} 
            />
          ) : (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.selectedKelompokId || ''}
                onValueChange={handleKelompokChange}
                style={styles.picker}
                enabled={!loading}
              >
                <Picker.Item label="Select a group" value="" />
                {kelompokList.map(kelompok => (
                  <Picker.Item 
                    key={kelompok.id_kelompok} 
                    label={kelompok.nama_kelompok}
                    value={kelompok.id_kelompok} 
                  />
                ))}
              </Picker>
            </View>
          )}
        </View>
      )}
      
      {/* Level - Only shown for Bimbel (read-only) */}
      {formData.jenis_kegiatan === 'Bimbel' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Tingkat</Text>
          <TextInput
            style={[styles.input, styles.disabledInput]}
            value={formData.level}
            editable={false}
            placeholder="Level will be filled automatically"
          />
        </View>
      )}
      
      {/* Materi Section - Different behavior for Bimbel and Kegiatan */}
      {formData.jenis_kegiatan === 'Bimbel' && (
        <>
          {/* Custom Materi Toggle */}
          <View style={styles.inputGroup}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Input materi manual</Text>
              <Switch
                value={useCustomMateri}
                onValueChange={toggleCustomMateri}
                trackColor={{ false: '#bdc3c7', true: '#2ecc71' }}
                thumbColor={useCustomMateri ? '#27ae60' : '#ecf0f1'}
              />
            </View>
          </View>
          
          {/* Materi Selection/Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Materi<Text style={styles.required}>*</Text></Text>
            
            {useCustomMateri ? (
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.materi}
                onChangeText={(value) => handleChange('materi', value)}
                placeholder="Deskripsi Materi"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            ) : (
              <>
                {!formData.selectedLevelId ? (
                  <View style={styles.infoContainer}>
                    <Ionicons name="information-circle" size={20} color="#3498db" />
                    <Text style={styles.infoText}>Please select a group first to load materi options</Text>
                  </View>
                ) : materiLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#3498db" />
                    <Text style={styles.loadingText}>Loading materi...</Text>
                  </View>
                ) : materiError ? (
                  <ErrorMessage 
                    message={materiError} 
                    onRetry={() => fetchMateriData(formData.selectedLevelId)}
                    style={styles.errorContainer} 
                  />
                ) : materiList.length === 0 ? (
                  <View style={styles.infoContainer}>
                    <Ionicons name="alert-circle" size={20} color="#e74c3c" />
                    <Text style={styles.infoText}>No materi available for this level</Text>
                  </View>
                ) : (
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={formData.id_materi || ''}
                      onValueChange={handleMateriChange}
                      style={styles.picker}
                      enabled={!loading}
                    >
                      <Picker.Item label="Select materi" value="" />
                      {materiList.map(materi => (
                        <Picker.Item 
                          key={materi.id_materi} 
                          label={`${materi.mata_pelajaran} - ${materi.nama_materi}`}
                          value={materi.id_materi} 
                        />
                      ))}
                    </Picker>
                  </View>
                )}
              </>
            )}
          </View>
        </>
      )}
      
      {/* Materi for Kegiatan - Always manual input */}
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
      
      {/* Date */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tanggal<Text style={styles.required}>*</Text></Text>
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>
            {format(formData.tanggal, 'dd MMMM yyyy')}
          </Text>
          <Ionicons name="calendar" size={24} color="#3498db" />
        </TouchableOpacity>
        
        {showDatePicker && (
          <DateTimePicker
            value={formData.tanggal}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      
      {/* Schedule Section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="time-outline" size={20} color="#3498db" style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Jadwal Kegiatan</Text>
      </View>
      
      {/* Start Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Waktu Mulai</Text>
        <TouchableOpacity 
          style={styles.timePickerButton}
          onPress={() => setShowStartTimePicker(true)}
        >
          <Text style={styles.timeText}>
            {formData.start_time ? formatTime(formData.start_time) : 'Tap to set start time'}
          </Text>
          <Ionicons name="time" size={24} color="#3498db" />
        </TouchableOpacity>
        
        {showStartTimePicker && (
          <DateTimePicker
            value={formData.start_time || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleStartTimeChange}
          />
        )}
      </View>
      
      {/* End Time */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Waktu Selesai</Text>
        <TouchableOpacity 
          style={styles.timePickerButton}
          onPress={() => setShowEndTimePicker(true)}
        >
          <Text style={styles.timeText}>
            {formData.end_time ? formatTime(formData.end_time) : 'Tap to set end time'}
          </Text>
          <Ionicons name="time" size={24} color="#3498db" />
        </TouchableOpacity>
        
        {showEndTimePicker && (
          <DateTimePicker
            value={formData.end_time || new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleEndTimeChange}
          />
        )}
      </View>
      
      {/* Late Threshold Section */}
      <View style={styles.sectionHeader}>
        <Ionicons name="alert-circle-outline" size={20} color="#e74c3c" style={styles.sectionIcon} />
        <Text style={styles.sectionTitle}>Pengaturan Keterlambatan</Text>
      </View>
      
      {/* Custom Threshold Toggle */}
      <View style={styles.inputGroup}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Gunakan waktu terlambat khusus</Text>
          <Switch
            value={useCustomLateThreshold}
            onValueChange={toggleCustomLateThreshold}
            trackColor={{ false: '#bdc3c7', true: '#2ecc71' }}
            thumbColor={useCustomLateThreshold ? '#27ae60' : '#ecf0f1'}
          />
        </View>
        
        {/* Custom Late Threshold Time */}
        {useCustomLateThreshold ? (
          <View style={styles.nestedInput}>
            <Text style={styles.nestedLabel}>Waktu Terlambat</Text>
            <TouchableOpacity 
              style={styles.timePickerButton}
              onPress={() => setShowLateThresholdPicker(true)}
            >
              <Text style={styles.timeText}>
                {formData.late_threshold ? formatTime(formData.late_threshold) : 'Tap to set late threshold'}
              </Text>
              <Ionicons name="time" size={24} color="#e74c3c" />
            </TouchableOpacity>
            
            {showLateThresholdPicker && (
              <DateTimePicker
                value={formData.late_threshold || new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleLateThresholdChange}
              />
            )}
            <Text style={styles.helperText}>
              Mahasiswa dianggap terlambat jika datang setelah waktu ini
            </Text>
          </View>
        ) : (
          /* Minutes-based Late Threshold */
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
              Mahasiswa dianggap terlambat jika datang {formData.late_minutes_threshold} menit setelah waktu mulai
            </Text>
          </View>
        )}
      </View>
      
      {/* Photos */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Foto</Text>
        
        <View style={styles.photosContainer}>
          {/* Photo 1 */}
          <View style={styles.photoBox}>
            {photos.foto_1 ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photos.foto_1 }} style={styles.photoPreview} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto('foto_1')}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={() => handleSelectPhoto('foto_1')}
              >
                <Ionicons name="camera" size={32} color="#bdc3c7" />
                <Text style={styles.addPhotoText}>Foto 1</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Photo 2 */}
          <View style={styles.photoBox}>
            {photos.foto_2 ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photos.foto_2 }} style={styles.photoPreview} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto('foto_2')}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={() => handleSelectPhoto('foto_2')}
              >
                <Ionicons name="camera" size={32} color="#bdc3c7" />
                <Text style={styles.addPhotoText}>Foto 2</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {/* Photo 3 */}
          <View style={styles.photoBox}>
            {photos.foto_3 ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: photos.foto_3 }} style={styles.photoPreview} />
                <TouchableOpacity 
                  style={styles.removePhotoButton}
                  onPress={() => handleRemovePhoto('foto_3')}
                >
                  <Ionicons name="close-circle" size={24} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={() => handleSelectPhoto('foto_3')}
              >
                <Ionicons name="camera" size={32} color="#bdc3c7" />
                <Text style={styles.addPhotoText}>Foto 3</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
      
      {/* Submit Button */}
      <View style={styles.buttonContainer}>
        <Button
          title={isEditing ? 'Update Activitas' : 'Buat Activity'}
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
      
      {/* Loading Overlay */}
      {loading && (
        <LoadingSpinner 
          fullScreen 
          message={isEditing ? 'Updating activity...' : 'Creating activity...'}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#e74c3c',
  },
  activityTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeButton: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  typeButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  typeButtonText: {
    fontSize: 16,
    color: '#34495e',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: '#f0f0f0',
    color: '#7f8c8d',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f4f8',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bce0f4',
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    color: '#2c88a6',
    fontSize: 14,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: {
    fontSize: 16,
    color: '#34495e',
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  timeText: {
    fontSize: 16,
    color: '#34495e',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
    color: '#34495e',
  },
  nestedInput: {
    marginTop: 8,
    marginLeft: 8,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#f0f0f0',
  },
  nestedLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  minutesInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    width: '50%',
  },
  helperText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 6,
    fontStyle: 'italic',
  },
  photosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  photoBox: {
    width: '32%',
    aspectRatio: 1,
    marginBottom: 10,
    borderRadius: 8,
    overflow: 'hidden',
  },
  addPhotoButton: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    color: '#7f8c8d',
    marginTop: 4,
    fontSize: 12,
  },
  photoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 12,
  },
  buttonContainer: {
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 12,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  loadingText: {
    marginLeft: 8,
    color: '#7f8c8d',
  },
  errorContainer: {
    marginVertical: 0,
  },
});

export default ActivityFormScreen;