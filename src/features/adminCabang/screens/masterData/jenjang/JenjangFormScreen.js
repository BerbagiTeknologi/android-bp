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
  selectJenjangDropdownOptions,
  selectJenjangLoading,
  selectJenjangError,
  clearError,
  getJenjangForDropdown,
  deleteJenjang
} from '../../../redux/masterData/jenjangSlice';

const JenjangListScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const jenjangList = useSelector(selectJenjangDropdownOptions);
  const loading = useSelector(selectJenjangLoading);
  const error = useSelector(selectJenjangError);

  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadJenjangData();
    }, [])
  );

  const loadJenjangData = async () => {
    try {
      await dispatch(getJenjangForDropdown()).unwrap();
    } catch (err) {
      console.error('Error loading jenjang:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadJenjangData();
    setRefreshing(false);
  };

  const handleEdit = (jenjang) => {
    navigation.navigate('JenjangForm', { jenjang, isEdit: true });
  };

  const handleDetail = (jenjang) => {
    navigation.navigate('JenjangDetail', { jenjangId: jenjang.id_jenjang });
  };

  const handleDelete = (jenjang) => {
    Alert.alert(
      'Hapus Jenjang',
      `Apakah Anda yakin ingin menghapus jenjang "${jenjang.nama_jenjang}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => confirmDelete(jenjang.id_jenjang)
        }
      ]
    );
  };

  const confirmDelete = async (id) => {
    console.log('🔄 JenjangListScreen - Delete clicked for ID:', id);
    console.log('📊 Current jenjangList:', jenjangList);
    
    setDeleting(true);
    
    try {
      console.log('📤 JenjangListScreen - Calling deleteJenjang Redux action...');
      const result = await dispatch(deleteJenjang(id)).unwrap();
      console.log('✅ JenjangListScreen - Delete successful, result:', result);
      
      Alert.alert(
        'Berhasil', 
        'Jenjang berhasil dihapus',
        [{ text: 'OK', onPress: () => {
          console.log('📱 JenjangListScreen - Success alert closed, refreshing data...');
          loadJenjangData();
        }}]
      );
    } catch (err) {
      console.log('❌ JenjangListScreen - Delete failed with error:', err);
      console.log('🔍 Error details:', JSON.stringify(err, null, 2));
      console.log('🔍 Error message:', err.message);
      console.log('🔍 Error type:', typeof err);
      
      // Better error message handling
      let errorMessage = 'Gagal menghapus jenjang';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.data && err.data.message) {
        errorMessage = err.data.message;
      }
      
      console.log('📱 JenjangListScreen - Showing error alert:', errorMessage);
      
      Alert.alert(
        'Tidak Dapat Menghapus', 
        errorMessage,
        [{ text: 'Mengerti' }]
      );
    } finally {
      console.log('🏁 JenjangListScreen - Delete operation finished');
      setDeleting(false);
    }
  };

  const renderJenjangItem = ({ item }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => handleDetail(item)}
    >
      <View style={styles.itemContent}>
        <Text style={styles.itemTitle}>{item.nama_jenjang}</Text>
        <Text style={styles.itemCode}>Kode: {item.kode_jenjang}</Text>
        <Text style={styles.itemDescription}>Urutan: {item.urutan}</Text>
        <View style={styles.itemMeta}>
          <Text style={styles.itemMetaText}>
            Status: Aktif
          </Text>
          <Text style={styles.itemMetaText}>
            ID: {item.id_jenjang}
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
          style={[styles.actionButton, deleting && styles.actionButtonDisabled]}
          onPress={() => handleDelete(item)}
          disabled={deleting}
        >
          <Ionicons 
            name="trash" 
            size={16} 
            color={deleting ? "#999" : "#dc3545"} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="school-outline" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Belum ada data jenjang</Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('JenjangForm')}
      >
        <Text style={styles.addButtonText}>Tambah Jenjang Pertama</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing && jenjangList.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Memuat data jenjang...</Text>
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
              loadJenjangData();
            }}
          >
            <Text style={styles.retryButtonText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={jenjangList}
        keyExtractor={(item) => item.id_jenjang.toString()}
        renderItem={renderJenjangItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={
          jenjangList.length === 0 ? styles.emptyList : styles.list
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('JenjangForm')}
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
  actionButtonDisabled: {
    opacity: 0.5
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

export default JenjangListScreen;