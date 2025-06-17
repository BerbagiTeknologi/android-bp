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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import SemesterCard from '../components/SemesterCard';

// Import Redux
import {
  fetchSemesterList,
  deleteSemester,
  setActiveSemester,
  selectSemesterList,
  selectSemesterLoading,
  selectSemesterError,
  selectSemesterPagination
} from '../redux/semesterSlice';

const SemesterManagementScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const semesters = useSelector(selectSemesterList);
  const loading = useSelector(selectSemesterLoading);
  const error = useSelector(selectSemesterError);
  const pagination = useSelector(selectSemesterPagination);
  
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadSemesters();
  }, []);

  const loadSemesters = async (page = 1) => {
    dispatch(fetchSemesterList({ page }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSemesters(1);
    setRefreshing(false);
  };

  const handleLoadMore = async () => {
    if (pagination.current_page < pagination.last_page && !loadingMore) {
      setLoadingMore(true);
      await loadSemesters(pagination.current_page + 1);
      setLoadingMore(false);
    }
  };

  const navigateToForm = (semester = null) => {
    navigation.navigate('SemesterForm', { semester });
  };

  const navigateToDetail = (semester) => {
    navigation.navigate('SemesterDetail', { 
      semesterId: semester.id_semester,
      semester 
    });
  };

  const handleSetActive = (semester) => {
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
              await dispatch(setActiveSemester(semester.id_semester)).unwrap();
              Alert.alert('Sukses', 'Semester berhasil diaktifkan');
            } catch (err) {
              Alert.alert('Error', 'Gagal mengaktifkan semester');
            }
          }
        }
      ]
    );
  };

  const handleDelete = (semester) => {
    if (semester.is_active) {
      Alert.alert('Error', 'Semester aktif tidak dapat dihapus');
      return;
    }

    Alert.alert(
      'Hapus Semester',
      `Hapus ${semester.nama_semester} ${semester.tahun_ajaran}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteSemester(semester.id_semester)).unwrap();
              Alert.alert('Sukses', 'Semester berhasil dihapus');
            } catch (err) {
              Alert.alert('Error', 'Gagal menghapus semester');
            }
          }
        }
      ]
    );
  };

  const renderSemester = ({ item }) => (
    <SemesterCard
      semester={item}
      onPress={() => navigateToDetail(item)}
      onEdit={() => navigateToForm(item)}
      onSetActive={() => handleSetActive(item)}
      onDelete={() => handleDelete(item)}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Memuat semester..." />;
  }

  return (
    <View style={styles.container}>
      {error && (
        <ErrorMessage
          message={error}
          onRetry={() => loadSemesters()}
        />
      )}

      <FlatList
        data={semesters}
        renderItem={renderSemester}
        keyExtractor={(item) => item.id_semester.toString()}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color="#bdc3c7" />
            <Text style={styles.emptyText}>Belum ada semester</Text>
            <Text style={styles.emptySubText}>Tap tombol + untuk menambah semester</Text>
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
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
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

export default SemesterManagementScreen;