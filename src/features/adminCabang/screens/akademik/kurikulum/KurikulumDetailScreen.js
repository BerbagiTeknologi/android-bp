import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MateriAssignmentModal from '../../../components/akademik/MateriAssignmentModal';
import {
  selectCurrentKurikulum,
  selectKurikulumLoading,
  selectKurikulumError,
  clearError,
  getKurikulumById,
  deleteKurikulum,
  removeMateri
} from '../../../redux/akademik/kurikulumSlice';

const KurikulumDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { kurikulumId } = route.params || {};
  
  const currentItem = useSelector(selectCurrentKurikulum);
  const loading = useSelector(selectKurikulumLoading);
  const error = useSelector(selectKurikulumError);
  
  // Modal state
  const [showAssignModal, setShowAssignModal] = useState(false);

  const kurikulum = currentItem?.kurikulum || currentItem;
  const materiList = currentItem?.kurikulum_materi?.map(km => ({
    id_materi: km.materi.id_materi,
    nama_materi: km.materi.nama_materi,
    kode_materi: km.materi.kode_materi || `MAT-${km.materi.id_materi}`,
    deskripsi: km.materi.deskripsi,
    mata_pelajaran: km.materi.mata_pelajaran,
    kelas: km.materi.kelas,
    urutan: km.urutan
  })) || [];
  const statistics = currentItem?.statistics;

  useEffect(() => {
    if (kurikulumId) {
      dispatch(getKurikulumById(kurikulumId));
    }
  }, [kurikulumId, dispatch]);

  // Reload data when screen comes into focus (after returning from AssignMateri)
  useFocusEffect(
    React.useCallback(() => {
      if (kurikulumId) {
        dispatch(getKurikulumById(kurikulumId));
      }
    }, [kurikulumId, dispatch])
  );

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEdit = () => {
    navigation.navigate('KurikulumForm', { kurikulum, isEdit: true });
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Kurikulum',
      `Apakah Anda yakin ingin menghapus kurikulum "${kurikulum?.nama_kurikulum}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: confirmDelete
        }
      ]
    );
  };

  const confirmDelete = async () => {
    try {
      await dispatch(deleteKurikulum(kurikulum.id_kurikulum)).unwrap();
      Alert.alert(
        'Berhasil',
        'Kurikulum berhasil dihapus',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal menghapus kurikulum');
    }
  };

  const handleRemoveMateri = (materiId) => {
    Alert.alert(
      'Hapus Materi',
      'Apakah Anda yakin ingin menghapus materi ini dari kurikulum?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => confirmRemoveMateri(materiId)
        }
      ]
    );
  };

  const confirmRemoveMateri = async (materiId) => {
    try {
      await dispatch(removeMateri({ 
        kurikulumId: kurikulum.id_kurikulum, 
        materiId 
      })).unwrap();
      Alert.alert('Berhasil', 'Materi berhasil dihapus dari kurikulum');
      // Reload data
      dispatch(getKurikulumById(kurikulumId));
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal menghapus materi');
    }
  };

  const handleAssignSuccess = () => {
    // Refresh kurikulum data to show updated materi count
    if (kurikulumId) {
      dispatch(getKurikulumById(kurikulumId));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderDetailItem = (label, value, icon) => (
    <View style={styles.detailItem}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={20} color="#007bff" />
      </View>
      <View style={styles.detailContent}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '-'}</Text>
      </View>
    </View>
  );

  const renderStatusBadge = (isActive) => (
    <View style={[
      styles.statusBadge,
      isActive ? styles.statusActive : styles.statusInactive
    ]}>
      <Text style={[
        styles.statusText,
        isActive ? styles.statusActiveText : styles.statusInactiveText
      ]}>
        {isActive ? 'Aktif' : 'Tidak Aktif'}
      </Text>
    </View>
  );

  const renderMateriItem = ({ item, index }) => (
    <View style={styles.materiItem}>
      <View style={styles.materiNumber}>
        <Text style={styles.materiNumberText}>{index + 1}</Text>
      </View>
      <View style={styles.materiContent}>
        <Text style={styles.materiName}>{item.nama_materi}</Text>
        <Text style={styles.materiCode}>Kode: {item.kode_materi}</Text>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveMateri(item.id_materi)}
      >
        <Ionicons name="close" size={16} color="#dc3545" />
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat detail kurikulum...</Text>
      </View>
    );
  }

  if (!kurikulum) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
        <Text style={styles.errorText}>Data kurikulum tidak ditemukan</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{kurikulum.nama_kurikulum}</Text>
          {renderStatusBadge(kurikulum.is_active)}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Dasar</Text>
          
          {renderDetailItem(
            'Nama Kurikulum',
            kurikulum.nama_kurikulum,
            'list-outline'
          )}

          {renderDetailItem(
            'Kode Kurikulum',
            kurikulum.kode_kurikulum,
            'code-outline'
          )}

          {renderDetailItem(
            'Jenjang',
            kurikulum.jenjang?.nama_jenjang,
            'school-outline'
          )}

          {renderDetailItem(
            'Mata Pelajaran',
            kurikulum.mata_pelajaran?.nama_mata_pelajaran,
            'book-outline'
          )}

          {renderDetailItem(
            'Periode',
            `${formatDate(kurikulum.tanggal_mulai)} - ${formatDate(kurikulum.tanggal_selesai)}`,
            'calendar-outline'
          )}

          {renderDetailItem(
            'Status',
            kurikulum.is_active ? 'Aktif' : 'Tidak Aktif',
            'checkmark-circle-outline'
          )}
        </View>

        {(kurikulum.deskripsi || kurikulum.tujuan) && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Konten</Text>
            
            {kurikulum.deskripsi && renderDetailItem(
              'Deskripsi',
              kurikulum.deskripsi,
              'document-text-outline'
            )}

            {kurikulum.tujuan && renderDetailItem(
              'Tujuan',
              kurikulum.tujuan,
              'flag-outline'
            )}
          </View>
        )}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daftar Materi ({materiList.length})</Text>
            <TouchableOpacity
              style={styles.addMateriButton}
              onPress={() => setShowAssignModal(true)}
            >
              <Ionicons name="add" size={16} color="#007bff" />
              <Text style={styles.addMateriText}>Tambah</Text>
            </TouchableOpacity>
          </View>
          
          {materiList.length > 0 ? (
            <FlatList
              data={materiList}
              keyExtractor={(item) => item.id_materi.toString()}
              renderItem={renderMateriItem}
              scrollEnabled={false}
            />
          ) : (
            <View style={styles.emptyMateri}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyMateriText}>Belum ada materi</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Sistem</Text>
          
          {renderDetailItem(
            'Dibuat pada',
            formatDate(kurikulum.created_at),
            'calendar-outline'
          )}

          {renderDetailItem(
            'Terakhir diperbarui',
            formatDate(kurikulum.updated_at),
            'time-outline'
          )}

          {kurikulum.created_by && renderDetailItem(
            'Dibuat oleh',
            kurikulum.created_by.name || kurikulum.created_by,
            'person-outline'
          )}
        </View>

        {statistics && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Statistik</Text>
            
            {renderDetailItem(
              'Total Durasi',
              `${statistics.total_durasi || 0} menit`,
              'time-outline'
            )}

            {renderDetailItem(
              'Jumlah Siswa',
              statistics.total_siswa?.toString() || '0',
              'people-outline'
            )}

            {renderDetailItem(
              'Tingkat Penyelesaian',
              `${statistics.completion_rate || 0}%`,
              'checkmark-done-outline'
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEdit}
        >
          <Ionicons name="pencil" size={20} color="white" />
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Ionicons name="trash" size={20} color="white" />
          <Text style={styles.deleteButtonText}>Hapus</Text>
        </TouchableOpacity>
      </View>

      <MateriAssignmentModal
        visible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        kurikulumId={kurikulum?.id_kurikulum}
        kurikulumName={kurikulum?.nama_kurikulum}
        onAssignSuccess={handleAssignSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666'
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center'
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  scrollView: {
    flex: 1
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 12
  },
  statusActive: {
    backgroundColor: '#d4edda'
  },
  statusInactive: {
    backgroundColor: '#f8d7da'
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600'
  },
  statusActiveText: {
    color: '#155724'
  },
  statusInactiveText: {
    color: '#721c24'
  },
  card: {
    backgroundColor: 'white',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  addMateriButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  addMateriText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
    marginLeft: 4
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  detailContent: {
    flex: 1
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500'
  },
  materiItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  materiNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  materiNumberText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600'
  },
  materiContent: {
    flex: 1
  },
  materiName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2
  },
  materiCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  materiDuration: {
    fontSize: 12,
    color: '#007bff'
  },
  removeButton: {
    padding: 8,
    borderRadius: 4
  },
  emptyMateri: {
    alignItems: 'center',
    paddingVertical: 32
  },
  emptyMateriText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8
  },
  actionBar: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    gap: 12
  },
  editButton: {
    flex: 1,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 8
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8
  }
});

export default KurikulumDetailScreen;