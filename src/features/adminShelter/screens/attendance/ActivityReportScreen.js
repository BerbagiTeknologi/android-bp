import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  Alert, ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

import Button from '../../../../common/components/Button';
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';

import { createActivityReport, fetchActivityReport } from '../../redux/aktivitasSlice';

const ActivityReportScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { id_aktivitas, activityName, activityDate } = route.params || {};
  
  const { activityReport, reportLoading, reportError } = useSelector(state => state.aktivitas);
  
  const [photos, setPhotos] = useState({ foto_1: null, foto_2: null, foto_3: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [checkingExisting, setCheckingExisting] = useState(true);
  
  // Check if report already exists when component mounts
  useEffect(() => {
    const checkExistingReport = async () => {
      if (!id_aktivitas) {
        setCheckingExisting(false);
        return;
      }
      
      try {
        const reportData = await dispatch(fetchActivityReport(id_aktivitas)).unwrap();
        // If successful, report exists - navigate to view screen
        navigation.replace('ViewReportScreen', {
          report: reportData,
          activityName,
          activityDate
        });
      } catch (err) {
        // Report doesn't exist, user can create new one
        setCheckingExisting(false);
      }
    };
    
    checkExistingReport();
  }, [id_aktivitas, dispatch, navigation, activityName, activityDate]);
  
  // Show loading while checking existing report
  if (checkingExisting) {
    return (
      <View style={styles.checkingContainer}>
        <LoadingSpinner message="Memeriksa laporan kegiatan..." />
      </View>
    );
  }
  
  const handleTakePhoto = async (photoKey) => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Ditolak', 'Kami memerlukan izin kamera untuk mengambil foto.');
        return;
      }
      
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8
      });
      
      if (!result.canceled && result.assets?.[0]) {
        const image = result.assets[0];
        setPhotos(prev => ({ ...prev, [photoKey]: image.uri }));
      }
    } catch (error) {
      console.error('Error mengambil foto:', error);
      Alert.alert('Error', 'Gagal mengambil foto');
    }
  };
  
  const handleRemovePhoto = (photoKey) => {
    setPhotos(prev => ({ ...prev, [photoKey]: null }));
  };
  
  const validateForm = () => {
    const photoCount = Object.values(photos).filter(Boolean).length;
    if (photoCount === 0) {
      Alert.alert('Error Validasi', 'Minimal ambil 1 foto untuk laporan');
      return false;
    }
    return true;
  };
  
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('id_aktivitas', id_aktivitas);
      
      Object.entries(photos).forEach(([key, uri]) => {
        if (uri) {
          formData.append(key, {
            uri,
            name: `${key}_${Date.now()}.jpg`,
            type: 'image/jpeg'
          });
        }
      });
      
      await dispatch(createActivityReport(formData)).unwrap();
      
      Alert.alert('Berhasil', 'Laporan kegiatan berhasil dikirim', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      console.error('Error mengirim laporan:', err);
      setError(err || 'Gagal mengirim laporan');
    } finally {
      setLoading(false);
    }
  };

  const PhotoBox = ({ photoKey, uri, onTakePhoto, onRemove }) => (
    <View style={styles.photoBox}>
      {uri ? (
        <View style={styles.photoPreviewContainer}>
          <Image source={{ uri }} style={styles.photoPreview} />
          <TouchableOpacity style={styles.removePhotoButton} onPress={() => onRemove(photoKey)}>
            <Ionicons name="close-circle" size={24} color="#e74c3c" />
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.addPhotoButton} onPress={() => onTakePhoto(photoKey)}>
          <Ionicons name="camera" size={32} color="#bdc3c7" />
          <Text style={styles.addPhotoText}>{photoKey.replace('foto_', 'Foto ')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {error && <ErrorMessage message={error} onRetry={() => setError(null)} />}
      
      <View style={styles.header}>
        <Text style={styles.title}>Laporan Kegiatan</Text>
        <Text style={styles.subtitle}>{activityName}</Text>
        {activityDate && <Text style={styles.date}>{activityDate}</Text>}
      </View>
      
      <View style={styles.instructionContainer}>
        <Ionicons name="information-circle" size={20} color="#3498db" />
        <Text style={styles.instructionText}>
          Ambil foto dokumentasi kegiatan menggunakan kamera. Minimal 1 foto, maksimal 3 foto.
        </Text>
      </View>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Foto Dokumentasi<Text style={styles.required}>*</Text></Text>
        <View style={styles.photosContainer}>
          {['foto_1', 'foto_2', 'foto_3'].map(key => (
            <PhotoBox
              key={key}
              photoKey={key}
              uri={photos[key]}
              onTakePhoto={handleTakePhoto}
              onRemove={handleRemovePhoto}
            />
          ))}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <Button
          title="Kirim Laporan"
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
          message="Mengirim laporan kegiatan..."
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, paddingBottom: 40 },
  checkingContainer: { 
    flex: 1, 
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: { marginBottom: 20, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', textAlign: 'center' },
  subtitle: { fontSize: 18, color: '#3498db', marginTop: 4, textAlign: 'center' },
  date: { fontSize: 14, color: '#7f8c8d', marginTop: 2, textAlign: 'center' },
  instructionContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#e8f4f8',
    padding: 12, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: '#bce0f4'
  },
  instructionText: { flex: 1, marginLeft: 8, color: '#2c88a6', fontSize: 14 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: '#34495e', marginBottom: 12, fontWeight: '500' },
  required: { color: '#e74c3c' },
  photosContainer: {
    flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap'
  },
  photoBox: { width: '32%', aspectRatio: 1, marginBottom: 10, borderRadius: 8, overflow: 'hidden' },
  addPhotoButton: {
    backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, width: '100%', height: '100%',
    justifyContent: 'center', alignItems: 'center'
  },
  addPhotoText: { color: '#7f8c8d', marginTop: 4, fontSize: 12, textAlign: 'center' },
  photoPreviewContainer: { width: '100%', height: '100%', position: 'relative' },
  photoPreview: { width: '100%', height: '100%', borderRadius: 8 },
  removePhotoButton: {
    position: 'absolute', top: 4, right: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.7)', borderRadius: 12
  },
  buttonContainer: { marginTop: 20 },
  cancelButton: { marginTop: 12 }
});

export default ActivityReportScreen;