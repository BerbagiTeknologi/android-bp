import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../../common/components/Button';
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import PrestasiListItem from '../../../../common/components/Anak/PrestasiListItem';

// Import API
import { adminPusatAnakApi } from '../../api/adminPusatAnakApi';

const PrestasiScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { anakData, anakId } = route.params || {};
  
  const [prestasiList, setPrestasiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState(''); // Filter by jenis_prestasi

  // Jenis Prestasi options for filtering
  const jenisPrestasiOptions = [
    { id: '', label: 'Semua' },
    { id: 'Akademik', label: 'Akademik' },
    { id: 'Non-Akademik', label: 'Non-Akademik' },
    { id: 'Olahraga', label: 'Olahraga' },
    { id: 'Seni', label: 'Seni' },
    { id: 'Lainnya', label: 'Lainnya' }
  ];

  // Fetch prestasi data
  const fetchPrestasiData = async () => {
    if (!anakId) return;
    
    try {
      setError(null);
      
      // Prepare params for filtering
      const params = {};
      if (filterType) {
        params.jenis_prestasi = filterType;
      }
      
      const response = await adminPusatAnakApi.getPrestasi(anakId, params);
      
      if (response.data.success) {
        setPrestasiList(response.data.data || []);
      } else {
        setError(response.data.message || 'Gagal memuat data prestasi');
      }
    } catch (err) {
      console.error('Error fetching prestasi data:', err);
      setError('Gagal memuat data prestasi. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchPrestasiData();
  }, [anakId, filterType]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchPrestasiData();
  };

  // Handle filter change
  const handleFilterChange = (type) => {
    setFilterType(type);
  };

  // Handle view prestasi detail
  const handleViewPrestasi = (prestasi) => {
    navigation.navigate('PrestasiDetail', {
      anakData,
      anakId,
      prestasiId: prestasi.id_prestasi,
      prestasiData: prestasi
    });
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerImageContainer}>
            {anakData?.foto_url ? (
              <Image
                source={{ uri: anakData.foto_url }}
                style={styles.headerImage}
              />
            ) : (
              <View style={styles.headerImagePlaceholder}>
                <Ionicons name="person" size={40} color="#ffffff" />
              </View>
            )}
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.headerName}>{anakData?.full_name || 'Nama Anak'}</Text>
            {anakData?.nick_name && (
              <Text style={styles.headerNickname}>{anakData.nick_name}</Text>
            )}
          </View>
        </View>
        <LoadingSpinner message="Memuat data prestasi..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerImageContainer}>
          {anakData?.foto_url ? (
            <Image
              source={{ uri: anakData.foto_url }}
              style={styles.headerImage}
            />
          ) : (
            <View style={styles.headerImagePlaceholder}>
              <Ionicons name="person" size={40} color="#ffffff" />
            </View>
          )}
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{anakData?.full_name || 'Nama Anak'}</Text>
          {anakData?.nick_name && (
            <Text style={styles.headerNickname}>{anakData.nick_name}</Text>
          )}
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            onRetry={fetchPrestasiData}
          />
        )}
        
        {/* Header */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Prestasi Anak</Text>
        </View>
        
        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <View style={styles.filterContainer}>
            {jenisPrestasiOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={[
                  styles.filterButton,
                  filterType === option.id && styles.filterButtonActive
                ]}
                onPress={() => handleFilterChange(option.id)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterType === option.id && styles.filterButtonTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        
        {/* Prestasi List */}
        {prestasiList.length > 0 ? (
          <FlatList
            data={prestasiList}
            renderItem={({ item }) => (
              <PrestasiListItem
                prestasi={item}
                onPress={() => handleViewPrestasi(item)}
              />
            )}
            keyExtractor={(item) => item.id_prestasi.toString()}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={80} color="#cccccc" />
            <Text style={styles.emptyTitle}>Belum Ada Prestasi</Text>
            <Text style={styles.emptyText}>
              {filterType 
                ? `Tidak ada prestasi dengan jenis "${filterType}"`
                : 'Belum ada data prestasi untuk anak ini.'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerImageContainer: {
    marginRight: 16,
  },
  headerImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  headerImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  headerNickname: {
    fontSize: 14,
    color: '#666666',
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  filterScrollView: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#3498db',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3498db',
  },
  filterButtonText: {
    color: '#3498db',
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#ffffff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 24,
  },
});

export default PrestasiScreen;