import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import {
  selectMateriItems,
  selectMateriLoading,
  selectMateriError,
  clearError,
  getAllMateri,
  deleteMateri
} from '../../../redux/masterData/materiSlice';

const MateriListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const materiList = useSelector(selectMateriItems);
  const loading = useSelector(selectMateriLoading);
  const error = useSelector(selectMateriError);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadMateriData();
    }, [])
  );

  const loadMateriData = async () => {
    try {
      await dispatch(getAllMateri()).unwrap();
    } catch (err) {
      console.error('Error loading materi:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMateriData();
    setRefreshing(false);
  };

  const handleEdit = (materi) => {
    navigation.navigate('MateriForm', { materi, isEdit: true });
  };

  const handleDetail = (materi) => {
    navigation.navigate('MateriDetail', { materiId: materi.id_materi });
  };

  const handleDelete = (materi) => {
    Alert.alert(
      'Hapus Materi',
      `Apakah Anda yakin ingin menghapus materi "${materi.nama_materi}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => confirmDelete(materi.id_materi)
        }
      ]
    );
  };

  const confirmDelete = async (id) => {
    try {
      await dispatch(deleteMateri(id)).unwrap();
      Alert.alert('Berhasil', 'Materi berhasil dihapus');
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal menghapus materi');
    }
  };

  const renderMateriItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleDetail(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.nama_materi}</Text>
        <Text style={styles.itemDescription}>
          Kelas: {item.kelas?.nama_kelas || '-'}
        </Text>
        <Text style={styles.itemSubject}>
          Mata Pelajaran: {item.mata_pelajaran?.nama_mata_pelajaran || '-'}
        </Text>
        <Text style={styles.itemJenjang}>
          Jenjang: {item.kelas?.jenjang?.nama_jenjang || item.mata_pelajaran?.jenjang?.nama_jenjang || '-'}
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemMetaText}>
            ID: {item.id_materi}
          </Text>
          <Text style={styles.itemMetaText}>
            {item.kurikulum_materi_count || 0} Kurikulum
          </Text>
        </View>
      </View>
      <View style={styles.itemActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleEdit(item)}
        >
          <Ionicons name="pencil" size={16} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDelete(item)}
        >
          <Ionicons name="trash" size={16} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Belum ada data materi</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('MateriForm')}
      >
        <Text style={styles.addButtonText}>Tambah Materi Pertama</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing && materiList.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat data materi...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              dispatch(clearError());
              loadMateriData();
            }}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={materiList}
        keyExtractor={(item) => item.id_materi.toString()}
        renderItem={renderMateriItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={
          materiList.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('MateriForm')}
      >
        <Ionicons name="add" size={24} color="white" />
      </TouchableOpacity>
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
    backgroundColor: '#fee',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545'
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginBottom: 8
  },
  retryButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4
  },
  retryButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600'
  },
  list: {
    padding: 16
  },
  emptyList: {
    flex: 1
  },
  itemContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2
  },
  itemContent: {
    flex: 1
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4
  },
  itemJenjang: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 4
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  itemSubject: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 4
  },
  itemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  itemMetaText: {
    fontSize: 12,
    color: '#999'
  },
  itemActions: {
    flexDirection: 'row',
    marginLeft: 12
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 4
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center'
  },
  addButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600'
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4
  }
});

export default MateriListScreen;