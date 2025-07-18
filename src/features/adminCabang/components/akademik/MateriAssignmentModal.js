import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAvailableMateri,
  selectKurikulumLoading,
  selectKurikulumError,
  getAvailableMateri,
  assignMateri,
} from '../../redux/akademik/kurikulumSlice';
import {
  selectMataPelajaranDropdownOptions,
  getMataPelajaranForDropdown
} from '../../redux/masterData/mataPelajaranSlice';
import {
  selectKelasDropdownOptions,
  getKelasForDropdown
} from '../../redux/masterData/kelasSlice';

const MateriAssignmentModal = ({
  visible,
  onClose,
  kurikulumId,
  kurikulumName,
  onAssignSuccess,
  testID = "materi-assignment-modal",
}) => {
  const dispatch = useDispatch();
  
  // Redux selectors
  const availableMateri = useSelector(selectAvailableMateri);
  const loading = useSelector(selectKurikulumLoading);
  const error = useSelector(selectKurikulumError);
  const mataPelajaranOptions = useSelector(selectMataPelajaranDropdownOptions);
  const kelasOptions = useSelector(selectKelasDropdownOptions);

  // Local state
  const [selectedMateri, setSelectedMateri] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMataPelajaran, setFilterMataPelajaran] = useState('');
  const [filterKelas, setFilterKelas] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Load initial data when modal opens
  useEffect(() => {
    if (visible && kurikulumId) {
      loadInitialData();
    }
  }, [visible, kurikulumId]);

  // Load available materi with filters
  useEffect(() => {
    if (visible && kurikulumId) {
      loadAvailableMateri(1, true); // Reset to page 1 when filters change
    }
  }, [filterMataPelajaran, filterKelas, visible, kurikulumId]);

  const loadInitialData = async () => {
    try {
      await Promise.all([
        dispatch(getMataPelajaranForDropdown()).unwrap(),
        dispatch(getKelasForDropdown()).unwrap(),
      ]);
      loadAvailableMateri(1, true);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  };

  const loadAvailableMateri = (pageNum = 1, reset = false) => {
    const params = {
      page: pageNum,
      per_page: 20,
    };
    
    if (filterMataPelajaran) {
      params.mata_pelajaran_id = filterMataPelajaran;
    }
    if (filterKelas) {
      params.kelas_id = filterKelas;
    }
    if (searchQuery.trim()) {
      params.search = searchQuery.trim();
    }
    
    dispatch(getAvailableMateri({ kurikulumId, params }));
    
    if (reset) {
      setPage(1);
      setSelectedMateri([]);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    // Debounce search
    const timeoutId = setTimeout(() => {
      loadAvailableMateri(1, true);
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterMataPelajaran = (value) => {
    setFilterMataPelajaran(value);
    setFilterKelas(''); // Reset kelas when mata pelajaran changes
  };

  const handleFilterKelas = (value) => {
    setFilterKelas(value);
  };

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

  const handleSelectAll = () => {
    if (selectedMateri.length === availableMateri.length) {
      setSelectedMateri([]);
    } else {
      setSelectedMateri([...availableMateri]);
    }
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
        [{ 
          text: 'OK', 
          onPress: () => {
            setSelectedMateri([]);
            onAssignSuccess?.();
            onClose();
          }
        }]
      );
    } catch (err) {
      Alert.alert('Error', err.message || 'Gagal assign materi');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleClose = () => {
    setSelectedMateri([]);
    setSearchQuery('');
    setFilterMataPelajaran('');
    setFilterKelas('');
    setPage(1);
    onClose();
  };

  const renderFilterSection = () => (
    <View style={styles.filterSection}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari materi..."
          value={searchQuery}
          onChangeText={handleSearch}
          testID={`${testID}-search`}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              loadAvailableMateri(1, true);
            }}
            style={styles.clearSearchButton}
          >
            <Ionicons name="close" size={16} color="#7f8c8d" />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.filterRow}>
        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Mata Pelajaran</Text>
          <TouchableOpacity
            style={[styles.filterButton, filterMataPelajaran && styles.filterButtonActive]}
            onPress={() => {
              const currentIndex = mataPelajaranOptions.findIndex(
                mp => mp.id_mata_pelajaran.toString() === filterMataPelajaran
              );
              const nextIndex = (currentIndex + 1) % (mataPelajaranOptions.length + 1);
              const nextFilter = nextIndex === mataPelajaranOptions.length ? 
                '' : mataPelajaranOptions[nextIndex].id_mata_pelajaran.toString();
              handleFilterMataPelajaran(nextFilter);
            }}
          >
            <Ionicons name="book-outline" size={16} color={filterMataPelajaran ? '#fff' : '#3498db'} />
            <Text style={[styles.filterButtonText, filterMataPelajaran && styles.filterButtonTextActive]}>
              {filterMataPelajaran ? 
                mataPelajaranOptions.find(mp => mp.id_mata_pelajaran.toString() === filterMataPelajaran)?.nama_mata_pelajaran.substring(0, 8) + '...' :
                'Semua'
              }
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.filterItem}>
          <Text style={styles.filterLabel}>Kelas</Text>
          <TouchableOpacity
            style={[styles.filterButton, filterKelas && styles.filterButtonActive]}
            onPress={() => {
              const currentIndex = kelasOptions.findIndex(
                k => k.id_kelas.toString() === filterKelas
              );
              const nextIndex = (currentIndex + 1) % (kelasOptions.length + 1);
              const nextFilter = nextIndex === kelasOptions.length ? 
                '' : kelasOptions[nextIndex].id_kelas.toString();
              handleFilterKelas(nextFilter);
            }}
          >
            <Ionicons name="people-outline" size={16} color={filterKelas ? '#fff' : '#3498db'} />
            <Text style={[styles.filterButtonText, filterKelas && styles.filterButtonTextActive]}>
              {filterKelas ? 
                kelasOptions.find(k => k.id_kelas.toString() === filterKelas)?.nama_kelas || 'Unknown' :
                'Semua'
              }
            </Text>
          </TouchableOpacity>
        </View>

        {(filterMataPelajaran || filterKelas) && (
          <TouchableOpacity
            style={styles.clearFilterButton}
            onPress={() => {
              setFilterMataPelajaran('');
              setFilterKelas('');
            }}
          >
            <Ionicons name="close" size={16} color="#e74c3c" />
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
              <Ionicons name="book-outline" size={14} color="#7f8c8d" />
              <Text style={styles.metaText}>
                {item.mata_pelajaran?.nama_mata_pelajaran || 'N/A'}
              </Text>
            </View>
            
            <View style={styles.metaItem}>
              <Ionicons name="people-outline" size={14} color="#7f8c8d" />
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

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={handleClose}
          testID={`${testID}-close`}
        >
          <Ionicons name="close" size={24} color="#2c3e50" />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Assign Materi</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {kurikulumName}
          </Text>
        </View>
        {selectedMateri.length > 0 && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedBadgeText}>{selectedMateri.length}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.headerActions}>
        <TouchableOpacity
          style={styles.selectAllButton}
          onPress={handleSelectAll}
          testID={`${testID}-select-all`}
        >
          <Ionicons 
            name={selectedMateri.length === availableMateri.length ? "checkbox" : "checkbox-outline"} 
            size={16} 
            color="#3498db" 
          />
          <Text style={styles.selectAllText}>
            {selectedMateri.length === availableMateri.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.countText}>
          {availableMateri.length} materi tersedia
        </Text>
      </View>
    </View>
  );

  const renderFooter = () => {
    if (selectedMateri.length === 0) return null;
    
    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.assignButton, isAssigning && styles.assignButtonDisabled]}
          onPress={handleAssignMateri}
          disabled={isAssigning}
          testID={`${testID}-assign`}
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
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
      testID={testID}
    >
      <SafeAreaView style={styles.container}>
        {renderHeader()}
        {renderFilterSection()}
        
        <View style={styles.listContainer}>
          {loading && availableMateri.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Memuat materi tersedia...</Text>
            </View>
          ) : (
            <FlatList
              data={availableMateri}
              keyExtractor={(item) => item.id_materi.toString()}
              renderItem={renderMateriItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="document-text-outline" size={48} color="#bdc3c7" />
                  <Text style={styles.emptyText}>Tidak ada materi tersedia</Text>
                  <Text style={styles.emptySubtext}>
                    Semua materi mungkin sudah di-assign atau tidak ada yang sesuai filter
                  </Text>
                </View>
              }
            />
          )}
        </View>

        {renderFooter()}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  closeButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  selectedBadge: {
    backgroundColor: '#3498db',
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
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#e3f2fd',
  },
  selectAllText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
    marginLeft: 6,
  },
  countText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  filterSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
  },
  clearSearchButton: {
    padding: 4,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterItem: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginBottom: 4,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3498db',
    backgroundColor: '#fff',
    gap: 4,
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  clearFilterButton: {
    padding: 8,
    borderRadius: 16,
    backgroundColor: '#ffeaa7',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
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
    borderColor: '#3498db',
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
    color: '#2c3e50',
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
    backgroundColor: '#3498db',
    borderColor: '#3498db',
  },
  materiCode: {
    fontSize: 12,
    color: '#7f8c8d',
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
    color: '#7f8c8d',
  },
  materiDescription: {
    fontSize: 14,
    color: '#7f8c8d',
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
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  assignButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  assignButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  assignButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MateriAssignmentModal;