import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import Button from '../../../common/components/Button';

// Import Redux
import {
  fetchSemesterDetail,
  fetchSemesterStatistics,
  setActiveSemester,
  deleteSemester,
  selectSemesterDetail,
  selectSemesterStatistics,
  selectSemesterLoading,
  selectSemesterError
} from '../redux/semesterSlice';

const SemesterDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { semesterId, semester: initialSemester } = route.params || {};
  
  const semesterDetail = useSelector(selectSemesterDetail);
  const statistics = useSelector(selectSemesterStatistics);
  const loading = useSelector(selectSemesterLoading);
  const error = useSelector(selectSemesterError);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (semesterId) {
      loadData();
    }
  }, [semesterId]);

  useEffect(() => {
    const semester = semesterDetail || initialSemester;
    if (semester) {
      navigation.setOptions({
        title: `${semester.nama_semester} ${semester.tahun_ajaran}`,
        headerRight: () => (
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigateToEdit()}
          >
            <Ionicons name="create-outline" size={24} color="#ffffff" />
          </TouchableOpacity>
        )
      });
    }
  }, [semesterDetail, initialSemester]);

  const loadData = async () => {
    dispatch(fetchSemesterDetail(semesterId));
    dispatch(fetchSemesterStatistics(semesterId));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const navigateToEdit = () => {
    const semester = semesterDetail || initialSemester;
    navigation.navigate('SemesterForm', { semester });
  };

  const handleSetActive = () => {
    const semester = semesterDetail || initialSemester;
    if (semester.is_active) {
      Alert.alert('Info', 'Semester ini sudah aktif');
      return;
    }

    Alert.alert(
      'Set Semester Aktif',
      `Jadikan ${semester.nama_semester} ${semester.tahun_ajaran} sebagai semester aktif?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya',
          onPress: async () => {
            try {
              await dispatch(setActiveSemester(semesterId)).unwrap();
              Alert.alert('Sukses', 'Semester berhasil diaktifkan');
              loadData();
            } catch (err) {
              Alert.alert('Error', 'Gagal mengaktifkan semester');
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    const semester = semesterDetail || initialSemester;
    if (semester.is_active) {
      Alert.alert('Error', 'Semester aktif tidak dapat dihapus');
      return;
    }

    Alert.alert(
      'Hapus Semester',
      `Hapus ${semester.nama_semester} ${semester.tahun_ajaran}?\n\nPerhatian: Tindakan ini akan menghapus semua data terkait.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteSemester(semesterId)).unwrap();
              Alert.alert(
                'Sukses',
                'Semester berhasil dihapus',
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus semester');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const semester = semesterDetail || initialSemester;

  if (loading && !refreshing && !semester) {
    return <LoadingSpinner fullScreen message="Memuat detail semester..." />;
  }

  if (!semester) {
    return (
      <View style={styles.errorContainer}>
        <ErrorMessage 
          message="Data semester tidak ditemukan" 
          onRetry={loadData}
        />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {error && <ErrorMessage message={error} onRetry={loadData} />}

      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <Text style={styles.semesterName}>{semester.nama_semester}</Text>
          <View style={[
            styles.statusBadge,
            { backgroundColor: semester.is_active ? '#2ecc71' : '#95a5a6' }
          ]}>
            <Text style={styles.statusText}>
              {semester.is_active ? 'AKTIF' : 'NON-AKTIF'}
            </Text>
          </View>
        </View>
        <Text style={styles.tahunAjaran}>Tahun Ajaran {semester.tahun_ajaran}</Text>
        <Text style={styles.periode}>
          {semester.periode === 'ganjil' ? 'Semester Ganjil' : 'Semester Genap'}
        </Text>
      </View>

      {/* Period Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Periode Semester</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#3498db" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tanggal Mulai</Text>
              <Text style={styles.infoValue}>{formatDate(semester.tanggal_mulai)}</Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#e74c3c" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tanggal Selesai</Text>
              <Text style={styles.infoValue}>{formatDate(semester.tanggal_selesai)}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Kurikulum Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kurikulum</Text>
        {semester.kurikulum ? (
          <View style={styles.kurikulumCard}>
            <View style={styles.kurikulumHeader}>
              <View style={styles.kurikulumIconContainer}>
                <Ionicons name="library" size={24} color="#fff" />
              </View>
              <View style={styles.kurikulumInfo}>
                <Text style={styles.kurikulumName}>{semester.kurikulum.nama_kurikulum}</Text>
                <Text style={styles.kurikulumCode}>Kode: {semester.kurikulum.kode_kurikulum}</Text>
                <View style={[
                  styles.kurikulumStatusBadge,
                  { backgroundColor: semester.kurikulum.is_active ? '#2ecc71' : '#95a5a6' }
                ]}>
                  <Text style={styles.kurikulumStatusText}>
                    {semester.kurikulum.is_active ? 'Aktif' : 'Non-Aktif'}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.kurikulumDetails}>
              <View style={styles.kurikulumDetailRow}>
                <Ionicons name="school-outline" size={16} color="#7f8c8d" />
                <Text style={styles.kurikulumDetailLabel}>Jenjang:</Text>
                <Text style={styles.kurikulumDetailValue}>
                  {semester.kurikulum.jenjang?.nama_jenjang || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.kurikulumDetailRow}>
                <Ionicons name="book-outline" size={16} color="#7f8c8d" />
                <Text style={styles.kurikulumDetailLabel}>Mata Pelajaran:</Text>
                <Text style={styles.kurikulumDetailValue}>
                  {semester.kurikulum.mata_pelajaran?.nama_mata_pelajaran || 'N/A'}
                </Text>
              </View>
              
              <View style={styles.kurikulumDetailRow}>
                <Ionicons name="document-text-outline" size={16} color="#7f8c8d" />
                <Text style={styles.kurikulumDetailLabel}>Jumlah Materi:</Text>
                <Text style={styles.kurikulumDetailValue}>
                  {semester.kurikulum.kurikulum_materi_count || semester.kurikulum.materi_count || 0} materi
                </Text>
              </View>
              
              {semester.kurikulum.deskripsi && (
                <View style={styles.kurikulumDescription}>
                  <Text style={styles.kurikulumDescLabel}>Deskripsi:</Text>
                  <Text style={styles.kurikulumDescText}>{semester.kurikulum.deskripsi}</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity 
              style={styles.kurikulumViewButton}
              onPress={() => {
                // Show kurikulum detail in a modal or navigate to selection screen
                navigation.navigate('KurikulumSelection', {
                  selectedKurikulumId: semester.kurikulum.id_kurikulum,
                  viewMode: true
                });
              }}
            >
              <Ionicons name="eye-outline" size={16} color="#3498db" />
              <Text style={styles.kurikulumViewButtonText}>Lihat Detail Kurikulum</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.noKurikulumCard}>
            <Ionicons name="library-outline" size={48} color="#bdc3c7" />
            <Text style={styles.noKurikulumText}>Tidak ada kurikulum yang dipilih</Text>
            <Text style={styles.noKurikulumSubtext}>
              Edit semester untuk menambahkan kurikulum
            </Text>
          </View>
        )}
      </View>

      {/* Statistics */}
      {statistics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistik</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="document-text-outline" size={32} color="#3498db" />
              <Text style={styles.statValue}>{statistics.total_anak_with_raport}</Text>
              <Text style={styles.statLabel}>Raport</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="heart-outline" size={32} color="#e74c3c" />
              <Text style={styles.statValue}>{statistics.total_anak_with_nilai_sikap}</Text>
              <Text style={styles.statLabel}>Nilai Sikap</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="star-outline" size={32} color="#f39c12" />
              <Text style={styles.statValue}>{statistics.total_penilaian}</Text>
              <Text style={styles.statLabel}>Penilaian</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="checkmark-circle-outline" size={32} color="#2ecc71" />
              <Text style={styles.statValue}>{statistics.published_raport}</Text>
              <Text style={styles.statLabel}>Raport Published</Text>
            </View>
          </View>
        </View>
      )}

      {/* Attendance Average */}
      {statistics && statistics.average_attendance > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kehadiran</Text>
          <View style={styles.attendanceCard}>
            <Ionicons name="bar-chart-outline" size={48} color="#3498db" />
            <View style={styles.attendanceInfo}>
              <Text style={styles.attendanceValue}>
                {statistics.average_attendance.toFixed(1)}%
              </Text>
              <Text style={styles.attendanceLabel}>Rata-rata Kehadiran</Text>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {!semester.is_active && (
          <Button
            title="Set Sebagai Aktif"
            onPress={handleSetActive}
            leftIcon={<Ionicons name="power" size={20} color="#ffffff" />}
            style={styles.actionButton}
          />
        )}
        
        <Button
          title="Edit Semester"
          onPress={navigateToEdit}
          type="outline"
          leftIcon={<Ionicons name="create" size={20} color="#3498db" />}
          style={styles.actionButton}
        />
        
        {!semester.is_active && (
          <Button
            title="Hapus Semester"
            onPress={handleDelete}
            type="danger"
            leftIcon={<Ionicons name="trash" size={20} color="#ffffff" />}
            style={styles.actionButton}
          />
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  errorContainer: {
    flex: 1,
    padding: 16,
  },
  headerButton: {
    marginRight: 16,
  },
  headerCard: {
    backgroundColor: '#e74c3c',
    margin: 16,
    borderRadius: 12,
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  semesterName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tahunAjaran: {
    fontSize: 18,
    color: '#ffffff',
    marginBottom: 4,
  },
  periode: {
    fontSize: 14,
    color: '#ffebee',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoContent: {
    marginLeft: 16,
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  divider: {
    height: 1,
    backgroundColor: '#ecf0f1',
    marginVertical: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    width: '48%',
    marginBottom: 12,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  attendanceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
  },
  attendanceInfo: {
    marginLeft: 20,
    flex: 1,
  },
  attendanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
  },
  attendanceLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 4,
  },
  actions: {
    padding: 16,
    paddingBottom: 32,
  },
  actionButton: {
    marginBottom: 12,
  },
  kurikulumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  kurikulumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  kurikulumIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  kurikulumInfo: {
    flex: 1,
  },
  kurikulumName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  kurikulumCode: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  kurikulumStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  kurikulumStatusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  kurikulumDetails: {
    marginBottom: 16,
  },
  kurikulumDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  kurikulumDetailLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginLeft: 8,
    minWidth: 110,
  },
  kurikulumDetailValue: {
    fontSize: 14,
    color: '#2c3e50',
    fontWeight: '500',
    flex: 1,
  },
  kurikulumDescription: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
  },
  kurikulumDescLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  kurikulumDescText: {
    fontSize: 14,
    color: '#2c3e50',
    lineHeight: 20,
  },
  kurikulumViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e3f2fd',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  kurikulumViewButtonText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '600',
  },
  noKurikulumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  noKurikulumText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
    textAlign: 'center',
  },
  noKurikulumSubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default SemesterDetailScreen;