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
  selectKurikulumItems,
  selectKurikulumLoading,
  selectKurikulumError,
  clearError,
  getAllKurikulum,
  deleteKurikulum
} from '../../../redux/akademik/kurikulumSlice';

const KurikulumListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const kurikulumList = useSelector(selectKurikulumItems);
  const loading = useSelector(selectKurikulumLoading);
  const error = useSelector(selectKurikulumError);

  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadKurikulumData();
    }, [])
  );

  const loadKurikulumData = async () => {
    try {
      await dispatch(getAllKurikulum()).unwrap();
    } catch (err) {
      console.error('Error loading kurikulum:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadKurikulumData();
    setRefreshing(false);
  };

  const handleEdit = (kurikulum) => {
    navigation.navigate('KurikulumForm', { kurikulum, isEdit: true });
  };

  const handleDetail = (kurikulum) => {
    navigation.navigate('KurikulumDetail', { kurikulumId: kurikulum.id_kurikulum });
  };

  const handleDelete = (kurikulum) => {
    Alert.alert(
      'Hapus Kurikulum',
      `Apakah Anda yakin ingin menghapus kurikulum "${kurikulum.nama_kurikulum}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => confirmDelete(kurikulum.id_kurikulum)
        }
      ]
    );
  };

  const confirmDelete = async (id) => {
    try {
      await dispatch(deleteKurikulum(id)).unwrap();
      Alert.alert('Berhasil', 'Kurikulum berhasil dihapus');
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal menghapus kurikulum');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  const renderKurikulumItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleDetail(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.nama_kurikulum}</Text>
        <Text style={styles.itemCode}>Kode: {item.kode_kurikulum}</Text>
        <Text style={styles.itemDescription}>
          Jenjang: {item.jenjang?.nama_jenjang || '-'} | 
          Mata Pelajaran: {item.mata_pelajaran?.nama_mata_pelajaran || '-'}
        </Text>
        <Text style={styles.itemPeriod}>
          Periode: {formatDate(item.tanggal_mulai)} - {formatDate(item.tanggal_selesai)}
        </Text>
        <Text style={styles.itemMateriCount}>
          Jumlah Materi: {item.materi_count || 0} materi
        </Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemMetaText}>
            Status: {item.is_active ? 'Aktif' : 'Tidak Aktif'}
          </Text>
          <Text style={styles.itemMetaText}>
            ID: {item.id_kurikulum}
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
      <Ionicons name="list-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Belum ada data kurikulum</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('KurikulumForm')}
      >
        <Text style={styles.addButtonText}>Tambah Kurikulum Pertama</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing && kurikulumList.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat data kurikulum...</Text>
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
              loadKurikulumData();
            }}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={kurikulumList}
        keyExtractor={(item) => item.id_kurikulum.toString()}
        renderItem={renderKurikulumItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={
          kurikulumList.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('KurikulumForm')}
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
  itemCode: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 4
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4
  },
  itemPeriod: {
    fontSize: 12,
    color: '#28a745',
    marginBottom: 4
  },
  itemMateriCount: {
    fontSize: 12,
    color: '#ffc107',
    fontWeight: '600',
    marginBottom: 8
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

export default KurikulumListScreen;