import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  selectCurrentKelas,
  selectKelasLoading,
  selectKelasError,
  clearError,
  getKelasById,
  deleteKelas
} from '../../../redux/masterData/kelasSlice';

const KelasDetailScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { kelasId } = route.params || {};
  
  const currentItem = useSelector(selectCurrentKelas);
  const loading = useSelector(selectKelasLoading);
  const error = useSelector(selectKelasError);

  const kelas = currentItem?.kelas || currentItem;
  const statistics = currentItem?.statistics;

  useEffect(() => {
    if (kelasId) {
      dispatch(getKelasById(kelasId));
    }
  }, [kelasId, dispatch]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleEdit = () => {
    navigation.navigate('KelasForm', { kelas, isEdit: true });
  };

  const handleDelete = () => {
    Alert.alert(
      'Hapus Kelas',
      `Apakah Anda yakin ingin menghapus kelas "${kelas?.nama_kelas}"?`,
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
      await dispatch(deleteKelas(kelas.id_kelas)).unwrap();
      Alert.alert(
        'Berhasil',
        'Kelas berhasil dihapus',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal menghapus kelas');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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

  const renderTypeBadge = (jenisKelas) => (
    <View style={[
      styles.typeBadge,
      jenisKelas === 'standard' ? styles.typeStandard : styles.typeCustom
    ]}>
      <Text style={[
        styles.typeText,
        jenisKelas === 'standard' ? styles.typeStandardText : styles.typeCustomText
      ]}>
        {jenisKelas === 'standard' ? 'Standard' : 'Custom'}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat detail kelas...</Text>
      </View>
    );
  }

  if (!kelas) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#dc3545" />
        <Text style={styles.errorText}>Data kelas tidak ditemukan</Text>
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
          <Text style={styles.title}>{kelas.nama_kelas}</Text>
          <View style={styles.badges}>
            {renderStatusBadge(kelas.is_active)}
            {renderTypeBadge(kelas.jenis_kelas)}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Dasar</Text>
          
          {renderDetailItem(
            'Nama Kelas',
            kelas.nama_kelas,
            'library-outline'
          )}


          {renderDetailItem(
            'Jenjang',
            kelas.jenjang?.nama_jenjang,
            'school-outline'
          )}


          {kelas.tingkat && renderDetailItem(
            'Tingkat',
            kelas.tingkat.toString(),
            'trending-up-outline'
          )}

          {renderDetailItem(
            'Jenis Kelas',
            kelas.jenis_kelas === 'standard' ? 'Standard' : 'Custom',
            'layers-outline'
          )}

          {renderDetailItem(
            'Urutan',
            kelas.urutan?.toString() || '-',
            'reorder-three-outline'
          )}

          {renderDetailItem(
            'Deskripsi',
            kelas.deskripsi,
            'document-text-outline'
          )}

          {renderDetailItem(
            'Status',
            kelas.is_active ? 'Aktif' : 'Tidak Aktif',
            'checkmark-circle-outline'
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi Sistem</Text>
          
          {renderDetailItem(
            'Dibuat pada',
            formatDate(kelas.created_at),
            'calendar-outline'
          )}

          {renderDetailItem(
            'Terakhir diperbarui',
            formatDate(kelas.updated_at),
            'time-outline'
          )}

          {kelas.created_by && renderDetailItem(
            'Dibuat oleh',
            kelas.created_by.name || kelas.created_by,
            'person-outline'
          )}
        </View>

        {statistics && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Statistik</Text>
            
            {renderDetailItem(
              'Jumlah Materi',
              statistics.total_materi?.toString() || '0',
              'document-text-outline'
            )}

            {renderDetailItem(
              'Jumlah Kurikulum',
              statistics.total_kurikulum?.toString() || '0',
              'list-outline'
            )}

            {renderDetailItem(
              'Jumlah Siswa',
              statistics.total_siswa?.toString() || '0',
              'people-outline'
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
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12
  },
  badges: {
    flexDirection: 'row',
    gap: 8
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
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
  typeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16
  },
  typeStandard: {
    backgroundColor: '#cce5ff'
  },
  typeCustom: {
    backgroundColor: '#fff3cd'
  },
  typeText: {
    fontSize: 12,
    fontWeight: '600'
  },
  typeStandardText: {
    color: '#004085'
  },
  typeCustomText: {
    color: '#856404'
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
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

export default KelasDetailScreen;