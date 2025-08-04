import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminPusatAnakApi } from '../api/adminPusatAnakApi';

const { width } = Dimensions.get('window');

const AnakDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id, isNew } = route.params || {};
  
  const [anakData, setAnakData] = useState(null);
  const [loading, setLoading] = useState(!isNew);
  const [error, setError] = useState(null);

  // Define menu items
  const menuItems = [
    {
      title: 'Informasi Anak',
      screen: 'InformasiAnak',
      icon: '📋'
    },
    {
      title: 'Raport',
      screen: 'Raport',
      icon: '📚'
    },
    {
      title: 'Prestasi',
      screen: 'Prestasi',
      icon: '🏆'
    },
    {
      title: 'Surat',
      screen: 'Surat',
      icon: '✉️'
    },
    {
      title: 'Riwayat',
      screen: 'Riwayat',
      icon: '📖'
    },
    {
      title: 'Nilai Anak',
      screen: 'NilaiAnak',
      icon: '📊'
    },
    {
      title: 'Rapor Shelter',
      screen: 'RaporShelter',
      icon: '🏠'
    }
  ];

  // Fetch anak data
  useEffect(() => {
    if (!isNew && id) {
      fetchAnakDetail();
    }
  }, [id, isNew]);

  // Set screen title based on mode
  useEffect(() => {
    let title = isNew 
      ? 'Tambah Anak Baru' 
      : (anakData 
         ? (anakData.full_name || anakData.nick_name) 
         : 'Detail Anak');
    
    navigation.setOptions({ 
      title,
      headerRight: () => (
        !isNew && (
          <TouchableOpacity 
            style={{ marginRight: 16 }} 
            onPress={handleToggleStatus}
          >
            <Ionicons 
              name={anakData?.status_validasi === 'aktif' ? "close-circle-outline" : "checkmark-circle-outline"}
              size={24} 
              color={anakData?.status_validasi === 'aktif' ? "#e74c3c" : "#2ecc71"} 
            />
          </TouchableOpacity>
        )
      )
    });
  }, [isNew, anakData, navigation]);

  // Fetch anak detail
  const fetchAnakDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminPusatAnakApi.getAnakDetail(id);
      
      if (response.data.success) {
        setAnakData(response.data.data);
      } else {
        setError(response.data.message || 'Gagal memuat detail anak');
      }
    } catch (err) {
      console.error('Error fetching anak detail:', err);
      setError('Gagal memuat detail anak. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async () => {
    try {
      setLoading(true);
      await adminPusatAnakApi.toggleAnakStatus(id);
      
      // Refresh data after toggling status
      await fetchAnakDetail();
      
      // Show success message
      Alert.alert(
        'Status Diperbarui',
        `Status anak berhasil diubah menjadi ${anakData?.status_validasi === 'aktif' ? 'non-aktif' : 'aktif'}`
      );
    } catch (err) {
      console.error('Error toggling status:', err);
      Alert.alert('Error', 'Gagal memperbarui status');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to a menu screen
  const navigateToScreen = (screen) => {
    navigation.navigate(screen, { 
      anakData, 
      anakId: id,
      title: `${screen} - ${anakData?.full_name || 'Anak'}`
    });
  };

  // Render menu item
  const renderMenuItem = ({ item }) => (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={() => navigateToScreen(item.screen)}
    >
      <Text style={styles.menuIcon}>{item.icon}</Text>
      <Text style={styles.menuTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  // Handle edit
  const handleEdit = () => {
    navigation.navigate('AnakForm', { anakData, anakId: id, isEdit: true });
  };

  // Loading state
  if (loading) {
    return <LoadingSpinner fullScreen message="Memuat data anak..." />;
  }

  // New anak form
  if (isNew) {
    return (
      <View style={styles.container}>
        <Text>Form akan diimpementasikan nanti</Text>
        <Button
          title="Kembali"
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchAnakDetail}
          retryText="Coba Lagi"
        />
      )}

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.profileImageContainer}>
          {anakData?.foto_url ? (
            <Image
              source={{ uri: anakData.foto_url }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={50} color="#ffffff" />
            </View>
          )}
        </View>
        
        <Text style={styles.profileName}>{anakData?.full_name || 'Tanpa Nama'}</Text>
        {anakData?.nick_name && <Text style={styles.profileNickname}>{anakData.nick_name}</Text>}
        
        <View style={[
          styles.statusBadge,
          { backgroundColor: anakData?.status_validasi === 'aktif' ? '#2ecc71' : '#e74c3c' }
        ]}>
          <Text style={styles.statusText}>
            {anakData?.status_validasi === 'aktif' ? 'Aktif' : 'Non-Aktif'}
          </Text>
        </View>

        {/* Shelter info */}
        {anakData?.shelter && (
          <View style={styles.shelterInfo}>
            <Ionicons name="home-outline" size={16} color="#ffffff" />
            <Text style={styles.shelterText}>
              {anakData.shelter.nama_shelter}
            </Text>
          </View>
        )}

        {/* Edit button */}
        <Button
          title="Edit Profil"
          onPress={handleEdit}
          type="outline"
          style={styles.editButton}
        />
      </View>

      {/* Menu Grid */}
      <View style={styles.menuContainer}>
        <Text style={styles.menuSectionTitle}>Menu</Text>
        <FlatList
          data={menuItems}
          renderItem={renderMenuItem}
          keyExtractor={(item) => item.screen}
          numColumns={2}
          scrollEnabled={false}
          contentContainerStyle={styles.menuGrid}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#3498db',
    padding: 20,
    alignItems: 'center',
    paddingBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#ffffff',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2980b9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  profileNickname: {
    fontSize: 16,
    color: '#f8f8f8',
    marginTop: 4,
    textAlign: 'center',
  },
  statusBadge: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  shelterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  shelterText: {
    color: '#ffffff',
    marginLeft: 4,
  },
  editButton: {
    marginTop: 16,
    backgroundColor: 'white',
    borderColor: 'white',
    minWidth: 120,
  },
  menuContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -20,
  },
  menuSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    marginTop: 10,
  },
  menuGrid: {
    paddingBottom: 20,
  },
  menuItem: {
    width: (width - 48) / 2,
    aspectRatio: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 16,
    padding: 16,
    margin: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 20,
    alignSelf: 'center',
  }
});

export default AnakDetailScreen;