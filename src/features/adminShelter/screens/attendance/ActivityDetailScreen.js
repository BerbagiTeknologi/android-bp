import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import GroupStudentsList from '../../components/GroupStudentsList';

import {
  fetchAktivitasDetail, deleteAktivitas, selectAktivitasDetail,
  selectAktivitasLoading, selectAktivitasError, selectKelompokDetail
} from '../../redux/aktivitasSlice';

const ActivityDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { id_aktivitas } = route.params || {};
  
  const activity = useSelector(selectAktivitasDetail);
  const loading = useSelector(selectAktivitasLoading);
  const error = useSelector(selectAktivitasError);
  const kelompokDetail = useSelector(selectKelompokDetail);
  
  const [activePhoto, setActivePhoto] = useState(0);
  
  useEffect(() => {
    if (id_aktivitas) dispatch(fetchAktivitasDetail(id_aktivitas));
  }, [dispatch, id_aktivitas]);
  
  const handleEditActivity = () => navigation.navigate('ActivityForm', { activity });
  
  const handleDeleteActivity = () => {
    Alert.alert(
      'Hapus Aktivitas',
      'Yakin ingin menghapus aktivitas ini? Tindakan ini tidak dapat dibatalkan.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAktivitas(id_aktivitas)).unwrap();
              Alert.alert('Berhasil', 'Aktivitas berhasil dihapus');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err || 'Gagal menghapus aktivitas');
            }
          }
        }
      ]
    );
  };
  
  const handleRecordAttendance = () => {
    if (!activity) return;
    navigation.navigate('AttendanceManagement', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || kelompokDetail?.id_kelompok || null,
      kelompokName: activity.nama_kelompok || null
    });
  };
  
  const handleManualAttendance = () => {
    if (!activity) return;
    navigation.navigate('ManualAttendance', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || kelompokDetail?.id_kelompok || null,
      kelompokName: activity.nama_kelompok || null
    });
  };
  
  const handleViewAttendanceRecords = () => {
    if (!activity) return;
    navigation.navigate('AttendanceManagement', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || kelompokDetail?.id_kelompok || null,
      kelompokName: activity.nama_kelompok || null,
      initialTab: 'AttendanceList'
    });
  };
  
  const handleGenerateQrCodes = () => {
    if (!activity) return;
    navigation.navigate('AttendanceManagement', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || kelompokDetail?.id_kelompok || null,
      kelompokName: activity.nama_kelompok || null,
      level: activity.level || null,
      completeActivity: activity,
      initialTab: 'QrTokenGeneration'
    });
  };
  
  if (loading && !activity) {
    return <LoadingSpinner fullScreen message="Memuat detail aktivitas..." />;
  }
  
  if (error && !activity) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message={error}
          onRetry={() => dispatch(fetchAktivitasDetail(id_aktivitas))}
        />
      </View>
    );
  }
  
  if (!activity) return null;
  
  const kelompokId = activity.selectedKelompokId || kelompokDetail?.id_kelompok || null;
  const photos = [
    activity.foto_1_url, activity.foto_2_url, activity.foto_3_url
  ].filter(Boolean);

  const DetailItem = ({ label, value }) => (
    <View style={styles.detail}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || 'Tidak ditentukan'}</Text>
    </View>
  );

  const ActionButton = ({ onPress, icon, text, style }) => (
    <TouchableOpacity style={[styles.attendanceButton, style]} onPress={onPress}>
      <Ionicons name={icon} size={24} color="#fff" />
      <Text style={styles.attendanceButtonText}>{text}</Text>
    </TouchableOpacity>
  );

  const PhotoGallery = () => photos.length > 0 ? (
    <View style={styles.gallery}>
      <Image
        source={{ uri: photos[activePhoto] }}
        style={styles.mainPhoto}
        resizeMode="cover"
      />
      
      {photos.length > 1 && (
        <View style={styles.thumbnails}>
          {photos.map((photo, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.thumbnail, activePhoto === index && styles.activeThumbnail]}
              onPress={() => setActivePhoto(index)}
            >
              <Image source={{ uri: photo }} style={styles.thumbnailImage} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  ) : (
    <View style={styles.noPhotoPlaceholder}>
      <Ionicons
        name={activity.jenis_kegiatan?.toLowerCase() === 'bimbel' ? 'book' : 'people'}
        size={60}
        color="#bdc3c7"
      />
      <Text style={styles.noPhotoText}>Tidak ada foto tersedia</Text>
    </View>
  );

  const TutorInfo = () => activity.tutor && (
    <View style={styles.tutorSection}>
      <Text style={styles.sectionTitle}>Tutor yang Ditugaskan</Text>
      
      <View style={styles.tutorCard}>
        <View style={styles.tutorAvatar}>
          {activity.tutor.foto_url ? (
            <Image source={{ uri: activity.tutor.foto_url }} style={styles.tutorImage} />
          ) : (
            <Ionicons name="person-circle" size={50} color="#bdc3c7" />
          )}
        </View>
        
        <View style={styles.tutorInfo}>
          <Text style={styles.tutorName}>{activity.tutor.nama}</Text>
          <Text style={styles.tutorDetail}>ID: {activity.tutor.id_tutor}</Text>
          {activity.tutor.no_hp && (
            <View style={styles.tutorContact}>
              <Ionicons name="call-outline" size={14} color="#7f8c8d" />
              <Text style={styles.tutorDetail}>{activity.tutor.no_hp}</Text>
            </View>
          )}
          {activity.tutor.email && (
            <View style={styles.tutorContact}>
              <Ionicons name="mail-outline" size={14} color="#7f8c8d" />
              <Text style={styles.tutorDetail}>{activity.tutor.email}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const StudentsSection = () => (
    <View style={styles.studentsSection}>
      <Text style={styles.sectionTitle}>Siswa dalam Kelompok</Text>
      
      {activity.jenis_kegiatan === 'Bimbel' ? (
        kelompokId ? (
          <GroupStudentsList
            kelompokId={kelompokId}
            showTitle={false}
            onRefresh={() => dispatch(fetchAktivitasDetail(id_aktivitas))}
          />
        ) : (
          <View style={styles.noGroupContainer}>
            <Ionicons name="people-outline" size={48} color="#bdc3c7" />
            <Text style={styles.noGroupText}>Tidak ada kelompok terkait dengan aktivitas ini</Text>
            <Text style={styles.noGroupSubtext}>Edit aktivitas untuk menentukan kelompok</Text>
          </View>
        )
      ) : (
        <View style={styles.noGroupContainer}>
          <Ionicons name="information-circle-outline" size={48} color="#bdc3c7" />
          <Text style={styles.noGroupText}>Daftar siswa hanya tersedia untuk aktivitas Bimbel</Text>
        </View>
      )}
    </View>
  );

  // Data for FlatList sections
  const sections = [
    { id: 'photo', component: <PhotoGallery /> },
    { 
      id: 'header', 
      component: (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{activity.jenis_kegiatan}</Text>
            <Text style={styles.date}>
              {activity.tanggal
                ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id })
                : 'Tidak ada tanggal'}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditActivity}>
              <Ionicons name="create-outline" size={24} color="#3498db" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton} onPress={handleDeleteActivity}>
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    {
      id: 'details',
      component: (
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Detail</Text>
          <DetailItem label="Tingkat" value={activity.level} />
          <DetailItem label="Kelompok" value={activity.nama_kelompok} />
          <DetailItem label="Materi" value={activity.materi} />
        </View>
      )
    },
    { id: 'tutor', component: <TutorInfo /> },
    {
      id: 'attendanceActions',
      component: (
        <View style={styles.attendanceActions}>
          <ActionButton
            onPress={handleRecordAttendance}
            icon="calendar"
            text="Kelola Kehadiran"
            style={styles.fullWidthButton}
          />
          <ActionButton
            onPress={handleManualAttendance}
            icon="create"
            text="Input Manual"
            style={styles.manualButton}
          />
        </View>
      )
    },
    { id: 'students', component: <StudentsSection /> }
  ];

  return (
    <FlatList
      data={sections}
      renderItem={({ item }) => (
        <View style={item.id === 'photo' ? {} : styles.infoContainer}>
          {item.component}
        </View>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { paddingBottom: 20 },
  gallery: { backgroundColor: '#000' },
  mainPhoto: { width: '100%', height: 250 },
  thumbnails: { flexDirection: 'row', padding: 8, backgroundColor: '#222' },
  thumbnail: {
    width: 60, height: 60, marginRight: 8, borderRadius: 4,
    borderWidth: 2, borderColor: 'transparent', overflow: 'hidden'
  },
  activeThumbnail: { borderColor: '#3498db' },
  thumbnailImage: { width: '100%', height: '100%' },
  noPhotoPlaceholder: {
    height: 200, backgroundColor: '#ecf0f1',
    justifyContent: 'center', alignItems: 'center'
  },
  noPhotoText: { marginTop: 10, color: '#7f8c8d', fontSize: 16 },
  infoContainer: { padding: 16 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 16
  },
  titleContainer: { flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50', marginBottom: 4 },
  date: { fontSize: 16, color: '#7f8c8d' },
  actions: { flexDirection: 'row' },
  actionButton: { padding: 8, marginLeft: 8 },
  detailsSection: {
    backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 12 },
  detail: { flexDirection: 'row', marginBottom: 8 },
  detailLabel: { width: 100, fontSize: 16, color: '#7f8c8d', fontWeight: '500' },
  detailValue: { flex: 1, fontSize: 16, color: '#34495e' },
  tutorSection: {
    backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
  },
  tutorCard: { flexDirection: 'row', alignItems: 'center' },
  tutorAvatar: {
    width: 60, height: 60, borderRadius: 30, overflow: 'hidden',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0'
  },
  tutorImage: { width: 60, height: 60, borderRadius: 30 },
  tutorInfo: { flex: 1, marginLeft: 12 },
  tutorName: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50' },
  tutorDetail: { fontSize: 14, color: '#7f8c8d', marginTop: 2 },
  tutorContact: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  attendanceActions: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16
  },
  attendanceButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#3498db', paddingVertical: 12, paddingHorizontal: 8,
    borderRadius: 8, marginHorizontal: 4
  },
  manualButton: { backgroundColor: '#9b59b6' },
  recordsButton: { backgroundColor: '#2ecc71' },
  qrButton: { backgroundColor: '#f1c40f', marginBottom: 16 },
  fullWidthButton: { marginHorizontal: 0 },
  attendanceButtonText: { color: '#fff', marginLeft: 4, fontWeight: '500', fontSize: 12 },
  studentsSection: {
    backgroundColor: '#fff', borderRadius: 10, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2, minHeight: 200
  },
  noGroupContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  noGroupText: { fontSize: 16, color: '#7f8c8d', marginTop: 16, textAlign: 'center' },
  noGroupSubtext: { fontSize: 14, color: '#95a5a6', marginTop: 8, textAlign: 'center' }
});

export default ActivityDetailScreen;