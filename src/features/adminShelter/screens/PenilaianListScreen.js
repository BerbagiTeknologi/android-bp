import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import Button from '../../../common/components/Button';

// Import API
import { penilaianApi } from '../api/penilaianApi';
import { semesterApi } from '../api/semesterApi';

const PenilaianListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { anakId, anakData } = route.params || {};
  
  const [penilaianList, setPenilaianList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [activeSemester, setActiveSemester] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);

  useEffect(() => {
    fetchActiveSemester();
  }, []);

  useEffect(() => {
    if (selectedSemester) {
      fetchPenilaian();
    }
  }, [selectedSemester]);

  const fetchActiveSemester = async () => {
    try {
      const response = await semesterApi.getActive();
      if (response.data.success) {
        setActiveSemester(response.data.data);
        setSelectedSemester(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching active semester:', err);
    }
  };

  const fetchPenilaian = async () => {
    try {
      setError(null);
      const response = await penilaianApi.getByAnakSemester(anakId, selectedSemester.id_semester);
      
      if (response.data.success) {
        setPenilaianList(response.data.data);
      } else {
        setError(response.data.message || 'Gagal memuat data penilaian');
      }
    } catch (err) {
      console.error('Error fetching penilaian:', err);
      setError('Gagal memuat data penilaian. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPenilaian();
  };

  const navigateToForm = (penilaian = null) => {
    navigation.navigate('PenilaianForm', {
      anakId,
      anakData,
      penilaian,
      semesterId: selectedSemester?.id_semester
    });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Hapus Penilaian',
      'Anda yakin ingin menghapus penilaian ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await penilaianApi.deletePenilaian(id);
              fetchPenilaian();
              Alert.alert('Sukses', 'Penilaian berhasil dihapus');
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus penilaian');
            }
          }
        }
      ]
    );
  };

  const renderPenilaianCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigateToForm(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.materi?.nama_materi || 'Unknown'}</Text>
        <Text style={[styles.nilaiHuruf, { color: getNilaiColor(item.nilai) }]}>
          {item.nilai_huruf}
        </Text>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={16} color="#7f8c8d" />
          <Text style={styles.infoText}>{item.jenisPenilaian?.nama_jenis}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color="#7f8c8d" />
          <Text style={styles.infoText}>{formatDate(item.tanggal_penilaian)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="star-outline" size={16} color="#7f8c8d" />
          <Text style={styles.infoText}>Nilai: {item.nilai}</Text>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigateToForm(item)}
        >
          <Ionicons name="pencil" size={20} color="#3498db" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDelete(item.id_penilaian)}
        >
          <Ionicons name="trash" size={20} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const getNilaiColor = (nilai) => {
    if (nilai >= 90) return '#2ecc71';
    if (nilai >= 80) return '#3498db';
    if (nilai >= 70) return '#f39c12';
    if (nilai >= 60) return '#e67e22';
    return '#e74c3c';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Memuat data penilaian..." />;
  }

  return (
    <View style={styles.container}>
      {/* Semester Info */}
      {selectedSemester && (
        <View style={styles.semesterInfo}>
          <Ionicons name="school-outline" size={20} color="#3498db" />
          <Text style={styles.semesterText}>
            {selectedSemester.nama_semester} - {selectedSemester.tahun_ajaran}
          </Text>
        </View>
      )}

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchPenilaian}
        />
      )}

      <FlatList
        data={Object.entries(penilaianList)}
        renderItem={({ item: [mapel, penilaianGroup] }) => (
          <View key={mapel}>
            <Text style={styles.sectionHeader}>{mapel}</Text>
           {penilaianGroup.map(penilaian => (
  <View key={penilaian.id_penilaian}>
    {renderPenilaianCard({ item: penilaian })}
  </View>
))}
          </View>
        )}
        keyExtractor={(item) => item[0]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Belum ada penilaian</Text>
            <Text style={styles.emptySubText}>Tap tombol + untuk menambah penilaian</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigateToForm()}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#ffffff" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  semesterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  semesterText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
  },
  nilaiHuruf: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#7f8c8d',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
    paddingTop: 12,
  },
  actionButton: {
    padding: 8,
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
});

export default PenilaianListScreen;