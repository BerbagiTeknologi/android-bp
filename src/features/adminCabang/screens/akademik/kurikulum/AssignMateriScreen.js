import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
  SafeAreaView
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import {
  selectAvailableMateri,
  selectKurikulumLoading,
  selectKurikulumError,
  getAvailableMateri,
  assignMateri,
  clearError
} from '../../../redux/akademik/kurikulumSlice';
import {
  selectMataPelajaranDropdownOptions,
  getMataPelajaranForDropdown
} from '../../../redux/masterData/mataPelajaranSlice';
import {
  selectKelasDropdownOptions,
  getKelasForDropdown
} from '../../../redux/masterData/kelasSlice';

const AssignMateriScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  const { kurikulumId, kurikulumName } = route.params || {};
  
  const availableMateri = useSelector(selectAvailableMateri);
  const loading = useSelector(selectKurikulumLoading);
  const error = useSelector(selectKurikulumError);
  const mataPelajaranOptions = useSelector(selectMataPelajaranDropdownOptions);
  const kelasOptions = useSelector(selectKelasDropdownOptions);

  const [selectedMateri, setSelectedMateri] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMataPelajaran, setFilterMataPelajaran] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    if (kurikulumId) {
      loadAvailableMateri();
    }
    dispatch(getMataPelajaranForDropdown());
    dispatch(getKelasForDropdown());
  }, [kurikulumId]);

  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const loadAvailableMateri = () => {
    const params = {};
    if (filterMataPelajaran) params.mata_pelajaran_id = filterMataPelajaran;
    if (filterKelas) params.kelas_id = filterKelas;
    
    dispatch(getAvailableMateri({ kurikulumId, params }));
  };

  const filteredMateri = (availableMateri || []).filter(materi => 
    (materi?.nama_materi || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (materi?.kode_materi || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMateriSelection = (materi) => {
    setSelectedMateri(prev => {
      const isSelected = prev.find(m => m.id_materi === materi.id_materi);
      if (isSelected) {
        return prev.filter(m => m.id_materi !== materi.id_materi);
      } else {
        return [...prev, materi];
      }
    });
  };

  const handleAssignMateri = async () => {
    if (selectedMateri.length === 0) {
      Alert.alert('Peringatan', 'Pilih minimal satu materi untuk di-assign');
      return;
    }

    setIsAssigning(true);
    try {
      const materiIds = selectedMateri.map(materi => materi.id_materi);
      await dispatch(assignMateri({ kurikulumId, materiIds })).unwrap();
      
      Alert.alert(
        'Berhasil', 
        `${selectedMateri.length} materi berhasil di-assign ke kurikulum`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal assign materi');
    } finally {
      setIsAssigning(false);
    }
  };

  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <TextInput
        style={styles.searchInput}
        placeholder="Cari materi..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterButton, filterMataPelajaran && styles.filterButtonActive]}
          onPress={() => {
            // Simple filter toggle - in real app, you'd show a picker
            const currentIndex = mataPelajaranOptions.findIndex(
              mp => mp.id_mata_pelajaran.toString() === filterMataPelajaran
            );
            const nextIndex = (currentIndex + 1) % (mataPelajaranOptions.length + 1);
            const nextFilter = nextIndex === mataPelajaranOptions.length ? 
              '' : mataPelajaranOptions[nextIndex].id_mata_pelajaran.toString();
            setFilterMataPelajaran(nextFilter);
          }}
        >
          <Ionicons name="book-outline" size={16} color={filterMataPelajaran ? '#fff' : '#007bff'} />
          <Text style={[styles.filterButtonText, filterMataPelajaran && styles.filterButtonTextActive]}>
            {filterMataPelajaran ? 
              (mataPelajaranOptions.find(mp => mp.id_mata_pelajaran.toString() === filterMataPelajaran)?.nama_mata_pelajaran || 'Unknown').substring(0, 10) + '...' :
              'Mata Pelajaran'
            }
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterButton, filterKelas && styles.filterButtonActive]}
          onPress={() => {
            const currentIndex = kelasOptions.findIndex(
              k => k.id_kelas.toString() === filterKelas
            );
            const nextIndex = (currentIndex + 1) % (kelasOptions.length + 1);
            const nextFilter = nextIndex === kelasOptions.length ? 
              '' : kelasOptions[nextIndex].id_kelas.toString();
            setFilterKelas(nextFilter);
          }}
        >
          <Ionicons name="people-outline" size={16} color={filterKelas ? '#fff' : '#007bff'} />
          <Text style={[styles.filterButtonText, filterKelas && styles.filterButtonTextActive]}>
            {filterKelas ? 
              kelasOptions.find(k => k.id_kelas.toString() === filterKelas)?.nama_kelas || 'Unknown' :
              'Kelas'
            }
          </Text>
        </TouchableOpacity>

        {(filterMataPelajaran || filterKelas) && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              setFilterMataPelajaran('');
              setFilterKelas('');
              loadAvailableMateri();
            }}
          >
            <Ionicons name="close" size={16} color="#dc3545" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderMateriItem = ({ item }) => {
    const isSelected = selectedMateri.find(m => m.id_materi === item.id_materi);
    
    return (
      <TouchableOpacity
        style={[styles.materiItem, isSelected && styles.materiItemSelected]}
        onPress={() => toggleMateriSelection(item)}
        activeOpacity={0.7}
      >
        <View style={styles.materiContent}>
          <View style={styles.materiHeader}>
            <Text style={styles.materiName}>{item.nama_materi || 'Nama tidak tersedia'}</Text>
            <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
              {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
          </View>
          
          <Text style={styles.materiCode}>Kode: {item.kode_materi || 'Kode tidak tersedia'}</Text>
          
          <View style={styles.materiMeta}>
            <View style={styles.metaItem}>
              <Ionicons name="book-outline" size={14} color="#666" />
              <Text style={styles.metaText}>
                {item.mata_pelajaran?.nama_mata_pelajaran || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#666" />
              <Text style={styles.metaText}>
                {item.kelas?.nama_kelas || 'N/A'}
              </Text>
            </View>
            
          </View>

          {item.deskripsi && (
            <Text style={styles.materiDescription} numberOfLines={2}>
              {item.deskripsi}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && (availableMateri || []).length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Memuat materi tersedia...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#007bff" />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Assign Materi</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {kurikulumName}
            </Text>
          </View>
        </View>
        
        {selectedMateri.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>{selectedMateri.length}</Text>
          </View>
        )}
      </View>

      {renderFilterSection()}

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>
          Materi Tersedia ({filteredMateri.length})
        </Text>
        
        <FlatList
          data={filteredMateri}
          keyExtractor={(item) => item.id_materi.toString()}
          renderItem={renderMateriItem}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={loadAvailableMateri}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={48} color="#ccc" />
              <Text style={styles.emptyText}>Tidak ada materi tersedia</Text>
              <Text style={styles.emptySubtext}>
                Semua materi mungkin sudah di-assign atau tidak ada yang sesuai filter
              </Text>
            </View>
          }
        />
      </View>

      {selectedMateri.length > 0 && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.assignButton, isAssigning && styles.assignButtonDisabled]}
            onPress={handleAssignMateri}
            disabled={isAssigning}
          >
            {isAssigning ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.assignButtonText}>
                  Assign {selectedMateri.length} Materi
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  selectedBadge: {
    backgroundColor: '#007bff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  selectedBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filterSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#007bff',
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: '#007bff',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#007bff',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearFilterButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#f8d7da',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginVertical: 16,
  },
  materiItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  materiItemSelected: {
    borderColor: '#007bff',
    backgroundColor: '#f0f8ff',
  },
  materiContent: {
    flex: 1,
  },
  materiHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  materiName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  materiCode: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  materiMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
  },
  materiDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  bottomBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  assignButton: {
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  assignButtonDisabled: {
    backgroundColor: '#6c757d',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AssignMateriScreen;