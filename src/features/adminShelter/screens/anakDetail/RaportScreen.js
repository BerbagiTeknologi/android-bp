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
import { useSelector, useDispatch } from 'react-redux';

// Import components
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import RaportCard from '../../components/RaportCard';

// Import Redux
import { 
  fetchRaportByAnak, 
  publishRaport,
  archiveRaport,
  deleteRaport,
  selectRaportByAnak,
  selectRaportLoading,
  selectRaportError
} from '../../redux/raportSlice';

const RaportScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { anakId, anakData } = route.params || {};
  
  const raportList = useSelector(selectRaportByAnak(anakId));
  const loading = useSelector(selectRaportLoading);
  const error = useSelector(selectRaportError);
  
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRaports();
  }, [anakId]);

  const loadRaports = async () => {
    if (anakId) {
      dispatch(fetchRaportByAnak(anakId));
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRaports();
    setRefreshing(false);
  };

  const navigateToView = (raport) => {
    navigation.navigate('RaportView', { 
      raportId: raport.id_raport,
      anakData 
    });
  };

  const navigateToGenerate = () => {
    navigation.navigate('RaportGenerate', { 
      anakId, 
      anakData 
    });
  };

  const handlePublish = (raport) => {
    Alert.alert(
      'Publish Raport',
      'Anda yakin ingin mempublikasikan raport ini? Raport yang sudah dipublikasi tidak dapat diedit.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Publish',
          onPress: async () => {
            try {
              await dispatch(publishRaport(raport.id_raport)).unwrap();
              Alert.alert('Sukses', 'Raport berhasil dipublikasikan');
              loadRaports();
            } catch (err) {
              Alert.alert('Error', 'Gagal mempublikasikan raport');
            }
          }
        }
      ]
    );
  };

  const handleArchive = (raport) => {
    Alert.alert(
      'Arsipkan Raport',
      'Anda yakin ingin mengarsipkan raport ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Arsipkan',
          onPress: async () => {
            try {
              await dispatch(archiveRaport(raport.id_raport)).unwrap();
              Alert.alert('Sukses', 'Raport berhasil diarsipkan');
              loadRaports();
            } catch (err) {
              Alert.alert('Error', 'Gagal mengarsipkan raport');
            }
          }
        }
      ]
    );
  };

  const handleDelete = (raport) => {
    if (raport.status === 'published') {
      Alert.alert('Error', 'Raport yang sudah dipublikasi tidak dapat dihapus');
      return;
    }

    Alert.alert(
      'Hapus Raport',
      'Anda yakin ingin menghapus raport ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteRaport(raport.id_raport)).unwrap();
              Alert.alert('Sukses', 'Raport berhasil dihapus');
              loadRaports();
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus raport');
            }
          }
        }
      ]
    );
  };

  const renderRaport = ({ item }) => (
    <RaportCard
      raport={item}
      onPress={() => navigateToView(item)}
      onPublish={() => handlePublish(item)}
      onArchive={() => handleArchive(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Memuat data raport..." />;
  }

  return (
    <View style={styles.container}>
      {/* Header Info */}
      <View style={styles.headerInfo}>
        <Ionicons name="person-outline" size={20} color="#3498db" />
        <Text style={styles.headerText}>
          {anakData?.full_name || 'Anak'}
        </Text>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={loadRaports}
        />
      )}

      <FlatList
        data={raportList}
        renderItem={renderRaport}
        keyExtractor={(item) => item.id_raport.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Belum ada raport</Text>
            <Text style={styles.emptySubText}>
              Tap tombol + untuk membuat raport baru
            </Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={navigateToGenerate}
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
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#bbdefb',
  },
  headerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
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

export default RaportScreen;