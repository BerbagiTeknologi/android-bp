import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import MasterDataCard from '../components/masterData/MasterDataCard';
import {
  selectJenjangLoading,
  selectJenjangError,
  selectJenjangStatistics,
  getJenjangStatistics
} from '../redux/masterData/jenjangSlice';
import {
  selectMataPelajaranStatistics,
  selectMataPelajaranLoading,
  selectMataPelajaranError,
  getMataPelajaranStatistics
} from '../redux/masterData/mataPelajaranSlice';
import {
  selectKelasStatistics,
  selectKelasLoading,
  selectKelasError,
  getKelasStatistics
} from '../redux/masterData/kelasSlice';
import {
  selectMateriStatistics,
  selectMateriLoading,
  selectMateriError,
  getMateriStatistics
} from '../redux/masterData/materiSlice';

const MasterDataMenuScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
  // Jenjang selectors
  const jenjangLoading = useSelector(selectJenjangLoading);
  const jenjangError = useSelector(selectJenjangError);
  const jenjangStatistics = useSelector(selectJenjangStatistics);
  
  // Mata Pelajaran selectors
  const mataPelajaranLoading = useSelector(selectMataPelajaranLoading);
  const mataPelajaranError = useSelector(selectMataPelajaranError);
  const mataPelajaranStatistics = useSelector(selectMataPelajaranStatistics);
  
  // Kelas selectors
  const kelasLoading = useSelector(selectKelasLoading);
  const kelasError = useSelector(selectKelasError);
  const kelasStatistics = useSelector(selectKelasStatistics);
  
  // Materi selectors
  const materiLoading = useSelector(selectMateriLoading);
  const materiError = useSelector(selectMateriError);
  const materiStatistics = useSelector(selectMateriStatistics);
  
  // Overall loading state
  const isLoading = jenjangLoading || mataPelajaranLoading || kelasLoading || materiLoading;

  useFocusEffect(
    React.useCallback(() => {
      loadStatistics();
    }, [])
  );

  const loadStatistics = async () => {
    try {
      await Promise.all([
        dispatch(getJenjangStatistics()).unwrap(),
        dispatch(getMataPelajaranStatistics()).unwrap(),
        dispatch(getKelasStatistics()).unwrap(),
        dispatch(getMateriStatistics()).unwrap()
      ]);
    } catch (err) {
      console.error('Error loading statistics:', err);
    }
  };

  const handleJenjangPress = () => {
    navigation.navigate('JenjangList');
  };

  const handleMataPelajaranPress = () => {
    navigation.navigate('MataPelajaranList');
  };

  const handleKelasPress = () => {
    navigation.navigate('KelasList');
  };

  const handleMateriPress = () => {
    navigation.navigate('MateriList');
  };

  const handleAddJenjang = () => {
    navigation.navigate('JenjangForm');
  };

  const handleAddMataPelajaran = () => {
    navigation.navigate('MataPelajaranForm');
  };

  const handleAddKelas = () => {
    navigation.navigate('KelasForm');
  };

  const handleAddMateri = () => {
    navigation.navigate('MateriForm');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadStatistics}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.title}>Master Data</Text>
          <Text style={styles.subtitle}>Kelola data master sistem</Text>
        </View>

        <View style={styles.cardsContainer}>
          <MasterDataCard
            title="Jenjang"
            icon="school-outline"
            statistics={{
              total: jenjangStatistics?.data?.total_jenjang || 0,
              active: jenjangStatistics?.data?.total_jenjang_aktif || 0,
            }}
            loading={jenjangLoading}
            error={jenjangError}
            onPress={handleJenjangPress}
            onAddNew={handleAddJenjang}
            primaryColor="#3498db"
            testID="jenjang-card"
          />
          
          <MasterDataCard
            title="Mata Pelajaran"
            icon="book-outline"
            statistics={{
              total: mataPelajaranStatistics?.data?.total_mata_pelajaran || 0,
              active: mataPelajaranStatistics?.data?.total_mata_pelajaran_aktif || 0,
            }}
            loading={mataPelajaranLoading}
            error={mataPelajaranError}
            onPress={handleMataPelajaranPress}
            onAddNew={handleAddMataPelajaran}
            primaryColor="#27ae60"
            testID="mata-pelajaran-card"
          />
          
          <MasterDataCard
            title="Kelas"
            icon="library-outline"
            statistics={{
              total: kelasStatistics?.data?.total_kelas || 0,
              active: kelasStatistics?.data?.total_kelas_aktif || 0,
            }}
            loading={kelasLoading}
            error={kelasError}
            onPress={handleKelasPress}
            onAddNew={handleAddKelas}
            primaryColor="#f39c12"
            testID="kelas-card"
          />
          
          <MasterDataCard
            title="Materi"
            icon="document-text-outline"
            statistics={{
              total: materiStatistics?.data?.total_materi || 0,
              active: materiStatistics?.data?.total_materi_aktif || 0,
            }}
            loading={materiLoading}
            error={materiError}
            onPress={handleMateriPress}
            onAddNew={handleAddMateri}
            primaryColor="#e74c3c"
            testID="materi-card"
          />
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Ringkasan Master Data</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Jenjang Aktif:</Text>
            <Text style={styles.summaryValue}>{jenjangStatistics?.data?.total_jenjang_aktif || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Mata Pelajaran:</Text>
            <Text style={styles.summaryValue}>{mataPelajaranStatistics?.data?.total_mata_pelajaran || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Kelas:</Text>
            <Text style={styles.summaryValue}>{kelasStatistics?.data?.total_kelas || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Materi:</Text>
            <Text style={styles.summaryValue}>{materiStatistics?.data?.total_materi || 0}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Jenjang Terbanyak Kelas:</Text>
            <Text style={styles.summaryValue}>{jenjangStatistics?.data?.jenjang_with_most_kelas?.nama_jenjang || '-'}</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.quickActionsTitle}>Aksi Cepat</Text>
          
          <TouchableOpacity style={styles.quickActionButton} onPress={handleAddJenjang}>
            <Ionicons name="add-circle-outline" size={20} color="#007bff" />
            <Text style={styles.quickActionText}>Tambah Jenjang Baru</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('MataPelajaranForm')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#28a745" />
            <Text style={[styles.quickActionText, { color: '#28a745' }]}>Tambah Mata Pelajaran</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('KelasForm')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#ffc107" />
            <Text style={[styles.quickActionText, { color: '#ffc107' }]}>Tambah Kelas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('MateriForm')}
          >
            <Ionicons name="add-circle-outline" size={20} color="#dc3545" />
            <Text style={[styles.quickActionText, { color: '#dc3545' }]}>Tambah Materi</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
// ... rest of the styles

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  scrollView: {
    flex: 1
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4
  },
  subtitle: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  cardsContainer: {
    padding: 16,
    gap: 16
  },
  summaryCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1'
  },
  summaryLabel: {
    fontSize: 14,
    color: '#7f8c8d'
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50'
  },
  quickActions: {
    margin: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 8
  },
  disabledButton: {
    backgroundColor: '#f5f5f5'
  },
  quickActionText: {
    fontSize: 14,
    color: '#3498db',
    marginLeft: 12,
    fontWeight: '500'
  },
  disabledText: {
    color: '#bdc3c7'
  }
});

export default MasterDataMenuScreen;