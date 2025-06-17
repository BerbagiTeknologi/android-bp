import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

// Components
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import GroupStudentsList from '../../components/GroupStudentsList';

// Redux
import {
  fetchAktivitasDetail,
  deleteAktivitas,
  selectAktivitasDetail,
  selectAktivitasLoading,
  selectAktivitasError,
  selectKelompokDetail
} from '../../redux/aktivitasSlice';

const ActivityDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  // Get activity ID from route params
  const { id_aktivitas } = route.params || {};
  
  // Redux state
  const activity = useSelector(selectAktivitasDetail);
  const loading = useSelector(selectAktivitasLoading);
  const error = useSelector(selectAktivitasError);
  const kelompokDetail = useSelector(selectKelompokDetail);
  
  // Local state for image gallery
  const [activePhoto, setActivePhoto] = useState(0);
  
  // Fetch activity detail on mount
  useEffect(() => {
    if (id_aktivitas) {
      dispatch(fetchAktivitasDetail(id_aktivitas));
    }
  }, [dispatch, id_aktivitas]);
  
  // Handle edit activity
  const handleEditActivity = () => {
    navigation.navigate('ActivityForm', { activity });
  };
  
  // Handle delete activity
  const handleDeleteActivity = () => {
    Alert.alert(
      'Delete Activity',
      'Are you sure you want to delete this activity? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteAktivitas(id_aktivitas)).unwrap();
              Alert.alert('Success', 'Activity deleted successfully');
              navigation.goBack();
            } catch (err) {
              Alert.alert('Error', err || 'Failed to delete activity');
            }
          }
        }
      ]
    );
  };
  
  // Handle record attendance button
  const handleRecordAttendance = () => {
    navigation.navigate('QrScanner', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || (kelompokDetail ? kelompokDetail.id_kelompok : null),
      kelompokName: activity.nama_kelompok || null
    });
  };
  
  // Handle manual attendance button
  const handleManualAttendance = () => {
    navigation.navigate('ManualAttendance', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || (kelompokDetail ? kelompokDetail.id_kelompok : null),
      kelompokName: activity.nama_kelompok || null
    });
  };
  
  // Handle view attendance records button
  const handleViewAttendanceRecords = () => {
    navigation.navigate('AttendanceList', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null
    });
  };

  // Handle QR code generation button
  const handleGenerateQrCodes = () => {
    navigation.navigate('QrTokenGeneration', {
      id_aktivitas,
      activityName: activity.jenis_kegiatan,
      activityDate: activity.tanggal ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id }) : null,
      activityType: activity.jenis_kegiatan,
      kelompokId: activity.selectedKelompokId || (kelompokDetail ? kelompokDetail.id_kelompok : null),
      kelompokName: activity.nama_kelompok || null,
      level: activity.level || null,
      completeActivity: activity // Pass the complete activity object for context
    });
  };
  
  // Show loading spinner while fetching data
  if (loading && !activity) {
    return <LoadingSpinner fullScreen message="Loading activity details..." />;
  }
  
  // Show error message if fetch failed
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
  
  // Return null if activity is not loaded yet
  if (!activity) {
    return null;
  }
  
  // Get kelompok ID from activity or kelompokDetail
  const kelompokId = activity.selectedKelompokId || (kelompokDetail ? kelompokDetail.id_kelompok : null);
  
  // Get all available photos
  const photos = [
    activity.foto_1_url,
    activity.foto_2_url,
    activity.foto_3_url
  ].filter(Boolean);

  return (
    <ScrollView style={styles.container}>
      {/* Photo Gallery */}
      {photos.length > 0 ? (
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
                  style={[
                    styles.thumbnail,
                    activePhoto === index && styles.activeThumbnail
                  ]}
                  onPress={() => setActivePhoto(index)}
                >
                  <Image
                    source={{ uri: photo }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noPhotoPlaceholder}>
          <Ionicons
            name={
              activity.jenis_kegiatan?.toLowerCase() === 'bimbel'
                ? 'book'
                : 'people'
            }
            size={60}
            color="#bdc3c7"
          />
          <Text style={styles.noPhotoText}>No photos available</Text>
        </View>
      )}
      
      {/* Activity Info */}
      <View style={styles.infoContainer}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{activity.jenis_kegiatan}</Text>
            <Text style={styles.date}>
              {activity.tanggal
                ? format(new Date(activity.tanggal), 'EEEE, dd MMMM yyyy', { locale: id })
                : 'No date'}
            </Text>
          </View>
          
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleEditActivity}
            >
              <Ionicons name="create-outline" size={24} color="#3498db" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleDeleteActivity}
            >
              <Ionicons name="trash-outline" size={24} color="#e74c3c" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Activity Details */}
        {/* Activity Details */}
        <View style={styles.detailsSection}>
          <Text style={styles.sectionTitle}>Details</Text>
          
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Level:</Text>
            <Text style={styles.detailValue}>{activity.level || 'Not specified'}</Text>
          </View>
          
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Group:</Text>
            <Text style={styles.detailValue}>{activity.nama_kelompok || 'Not specified'}</Text>
          </View>
          
          <View style={styles.detail}>
            <Text style={styles.detailLabel}>Materials:</Text>
            <Text style={styles.detailValue}>{activity.materi || 'Not specified'}</Text>
          </View>
        </View>
        
        {/* Tutor Information */}
        {activity.tutor && (
          <View style={styles.tutorSection}>
            <Text style={styles.sectionTitle}>Assigned Tutor</Text>
            
            <View style={styles.tutorCard}>
              <View style={styles.tutorAvatar}>
                {activity.tutor.foto_url ? (
                  <Image 
                    source={{ uri: activity.tutor.foto_url }} 
                    style={styles.tutorImage} 
                  />
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
        )}
        
        {/* Attendance Actions */}
        <View style={styles.attendanceActions}>
          <TouchableOpacity
            style={styles.attendanceButton}
            onPress={handleRecordAttendance}
          >
            <Ionicons name="qr-code" size={24} color="#fff" />
            <Text style={styles.attendanceButtonText}>QR Attendance</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.attendanceButton, styles.manualButton]}
            onPress={handleManualAttendance}
          >
            <Ionicons name="create" size={24} color="#fff" />
            <Text style={styles.attendanceButtonText}>Manual Entry</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.attendanceButton, styles.recordsButton]}
            onPress={handleViewAttendanceRecords}
          >
            <Ionicons name="list" size={24} color="#fff" />
            <Text style={styles.attendanceButtonText}>View Records</Text>
          </TouchableOpacity>
        </View>

        {/* QR Code Generation Button */}
        <TouchableOpacity 
          style={[styles.attendanceButton, styles.qrButton, styles.fullWidthButton]}
          onPress={handleGenerateQrCodes}
        >
          <Ionicons name="qr-code" size={24} color="#fff" />
          <Text style={styles.attendanceButtonText}>Generate QR</Text>
        </TouchableOpacity>
        
        {/* Students List Section */}
        <View style={styles.studentsSection}>
          <Text style={styles.sectionTitle}>Students in Group</Text>
          
          {/* Only show the group student list for Bimbel activities */}
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
                <Text style={styles.noGroupText}>No group associated with this activity</Text>
                <Text style={styles.noGroupSubtext}>Edit the activity to assign a group</Text>
              </View>
            )
          ) : (
            <View style={styles.noGroupContainer}>
              <Ionicons name="information-circle-outline" size={48} color="#bdc3c7" />
              <Text style={styles.noGroupText}>Student list is only available for Bimbel activities</Text>
            </View>
          )}
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
  gallery: {
    backgroundColor: '#000',
  },
  mainPhoto: {
    width: '100%',
    height: 250,
  },
  thumbnails: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#222',
  },
  thumbnail: {
    width: 60,
    height: 60,
    marginRight: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  activeThumbnail: {
    borderColor: '#3498db',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  noPhotoPlaceholder: {
    height: 200,
    backgroundColor: '#ecf0f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPhotoText: {
    marginTop: 10,
    color: '#7f8c8d',
    fontSize: 16,
  },
  infoContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  date: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  detailsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  detail: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#34495e',
  },
  attendanceActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  attendanceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  manualButton: {
    backgroundColor: '#9b59b6',
  },
  recordsButton: {
    backgroundColor: '#2ecc71',
  },
  qrButton: {
    backgroundColor: '#f1c40f',
    marginBottom: 16,
  },
  fullWidthButton: {
    marginHorizontal: 0,
  },
  attendanceButtonText: {
    color: '#fff',
    marginLeft: 4,
    fontWeight: '500',
    fontSize: 12,
  },
  studentsSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    minHeight: 200,
  },
  noGroupContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noGroupText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 16,
    textAlign: 'center',
  },
  noGroupSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
});

export default ActivityDetailScreen;