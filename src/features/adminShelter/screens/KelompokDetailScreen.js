import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
  Image
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { adminShelterKelompokApi } from '../api/adminShelterKelompokApi';
import { useAuth } from '../../../common/hooks/useAuth';

const KelompokDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  
  const { id } = route.params || {};
  
  const [kelompok, setKelompok] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchKelompokDetails = async () => {
    try {
      setError(null);
      
      const response = await adminShelterKelompokApi.getKelompokDetail(id);
      
      if (response.data.success) {
        setKelompok(response.data.data);
        navigation.setOptions({ 
          headerTitle: response.data.data.nama_kelompok || 'Group Detail' 
        });
      } else {
        setError(response.data.message || 'Failed to load group details');
      }
    } catch (err) {
      console.error('Error fetching kelompok details:', err);
      setError('Failed to load group details. Please try again.');
    }
  };
  
  const fetchGroupChildren = async () => {
    try {
      const response = await adminShelterKelompokApi.getGroupChildren(id);
      
      if (response.data.success) {
        setChildren(response.data.data || []);
      } else {
        console.error('Error fetching group children:', response.data.message);
      }
    } catch (err) {
      console.error('Error fetching group children:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    if (id) {
      Promise.all([
        fetchKelompokDetails(),
        fetchGroupChildren()
      ]);
    }
  }, [id]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([
      fetchKelompokDetails(),
      fetchGroupChildren()
    ]);
  };
  
  const handleEditKelompok = () => {
    navigation.navigate('KelompokForm', { kelompok });
  };
  
  const handleDeleteKelompok = () => {
    Alert.alert(
      'Delete Group',
      `Are you sure you want to delete ${kelompok.nama_kelompok}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              if (children.length > 0) {
                Alert.alert(
                  'Cannot Delete',
                  'This group has children assigned to it. Remove all children first.',
                  [{ text: 'OK' }]
                );
                setLoading(false);
                return;
              }
              
              const response = await adminShelterKelompokApi.deleteKelompok(id);
              
              if (response.data.success) {
                Alert.alert(
                  'Success',
                  'Group has been deleted',
                  [
                    {
                      text: 'OK',
                      onPress: () => navigation.goBack()
                    }
                  ]
                );
              } else {
                setError(response.data.message || 'Failed to delete group');
                setLoading(false);
              }
            } catch (err) {
              console.error('Error deleting kelompok:', err);
              setError('Failed to delete group. Please try again.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleRemoveChild = (child) => {
    Alert.alert(
      'Remove Child',
      `Are you sure you want to remove ${child.full_name || child.nick_name} from this group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await adminShelterKelompokApi.removeChildFromGroup(
                id,
                child.id_anak
              );
              
              if (response.data.success) {
                fetchGroupChildren();
                fetchKelompokDetails();
              } else {
                setError(response.data.message || 'Failed to remove child');
                setLoading(false);
              }
            } catch (err) {
              console.error('Error removing child:', err);
              setError('Failed to remove child. Please try again.');
              setLoading(false);
            }
          }
        }
      ]
    );
  };
  
  const handleAddChildren = () => {
    navigation.navigate('AddChildrenToKelompok', {
      kelompokId: id,
      kelompokName: kelompok?.nama_kelompok,
      shelterId: kelompok?.shelter?.id_shelter || profile?.shelter?.id_shelter,
      onRefresh: () => {
        handleRefresh();
      }
    });
  };

  const getLevelBadgeColor = (level) => {
    if (!level) return '#95a5a6';
    
    const levelName = level.nama_level_binaan?.toLowerCase() || '';
    
    if (levelName.includes('sd') || levelName.includes('dasar')) return '#3498db';
    if (levelName.includes('smp') || levelName.includes('menengah pertama')) return '#f39c12';
    if (levelName.includes('sma') || levelName.includes('menengah atas')) return '#e74c3c';
    if (levelName.includes('tk') || levelName.includes('paud')) return '#9b59b6';
    if (levelName.includes('universitas') || levelName.includes('tinggi')) return '#2ecc71';
    
    return '#95a5a6';
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    try {
      let dob;
      if (birthDate.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = birthDate.split(/[-/]/);
        dob = new Date(parts[2], parts[1] - 1, parts[0]);
      } else if (birthDate.match(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/)) {
        dob = new Date(birthDate);
      } else {
        dob = new Date(birthDate);
      }
      
      if (isNaN(dob.getTime())) {
        return '';
      }
      
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      return `${age}y`;
    } catch (error) {
      return '';
    }
  };
  
  const renderChildItem = ({ item: child }) => (
    <View style={styles.childItem}>
      <View style={styles.childImageContainer}>
        {child.foto_url && child.foto_url !== 'http://127.0.0.1:8000/images/default.png' ? (
          <Image source={{ uri: child.foto_url }} style={styles.childImage} />
        ) : (
          <View style={styles.childImagePlaceholder}>
            <Ionicons 
              name={child.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'} 
              size={20} 
              color="#666" 
            />
          </View>
        )}
      </View>
      
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.full_name || child.nick_name}</Text>
        <Text style={styles.childDetails}>
          {child.jenis_kelamin === 'Laki-laki' ? 'Laki-laki' : 'Perempuan'} 
          {child.tanggal_lahir ? ` • ${calculateAge(child.tanggal_lahir)}` : ''}
          {child.nik_anak ? ` • ${child.nik_anak}` : ''}
        </Text>
        
        <View style={styles.childBadgeContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: child.status_validasi === 'aktif' ? '#2ecc71' : '#e74c3c' }
          ]}>
            <Text style={styles.statusBadgeText}>
              {child.status_validasi === 'aktif' ? 'Active' : 'Inactive'}
            </Text>
          </View>
          
          {child.levelAnakBinaan && (
            <View style={[
              styles.levelBadge,
              { backgroundColor: getLevelBadgeColor(child.levelAnakBinaan) }
            ]}>
              <Text style={styles.levelBadgeText}>
                {child.levelAnakBinaan.nama_level_binaan}
              </Text>
            </View>
          )}

          {child.anakPendidikan && (
            <View style={styles.educationBadge}>
              <Text style={styles.educationBadgeText}>
                {child.anakPendidikan.jenjang?.toUpperCase()}
                {child.anakPendidikan.kelas ? ` ${child.anakPendidikan.kelas}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveChild(child)}
      >
        <Ionicons name="close-circle" size={22} color="#e74c3c" />
      </TouchableOpacity>
    </View>
  );
  
  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading group details..." />;
  }
  
  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleRefresh}
        />
      )}
      
      {kelompok && (
        <>
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Text style={styles.groupName}>{kelompok.nama_kelompok}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleEditKelompok}
                >
                  <Ionicons name="create-outline" size={22} color="#3498db" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={handleDeleteKelompok}
                >
                  <Ionicons name="trash-outline" size={22} color="#e74c3c" />
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tingkat:</Text>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>
                  {kelompok.level_anak_binaan?.nama_level_binaan || 'No Level'}
                </Text>
                {kelompok.level_anak_binaan && (
                  <View style={[
                    styles.levelIndicator,
                    { backgroundColor: getLevelBadgeColor(kelompok.level_anak_binaan) }
                  ]}>
                    <Text style={styles.levelIndicatorText}>
                      {kelompok.level_anak_binaan.nama_level_binaan}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jumlah Anak:</Text>
              <Text style={styles.detailValue}>{kelompok.anak_count || 0}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Shelter:</Text>
              <Text style={styles.detailValue}>
                {kelompok.shelter?.nama_shelter || 'Unknown Shelter'}
              </Text>
            </View>
          </View>
          
          <View style={styles.childrenContainer}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Daftar Anak ({children.length})</Text>
              <Button
                title="Tambah Anak"
                onPress={handleAddChildren}
                type="primary"
                size="small"
                style={styles.addChildrenButton}
                leftIcon={<Ionicons name="add" size={16} color="#ffffff" />}
              />
            </View>
            
            {children.length > 0 ? (
              <FlatList
                data={children}
                renderItem={renderChildItem}
                keyExtractor={(item) => item.id_anak?.toString()}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyChildren}>
                <Ionicons name="people" size={40} color="#cccccc" />
                <Text style={styles.emptyText}>Belum ada Anak binaan</Text>
                <Button
                  title="Tambah Anak"
                  onPress={handleAddChildren}
                  type="outline"
                  size="small"
                  style={styles.emptyButton}
                />
              </View>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  groupName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  detailValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelIndicator: {
    marginLeft: 8,
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  levelIndicatorText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  childrenContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
    color: '#333',
  },
  addChildrenButton: {
    backgroundColor: '#9b59b6',
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  childImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    marginRight: 12,
  },
  childImage: {
    width: '100%',
    height: '100%',
  },
  childImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  childBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  statusBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  levelBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  levelBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  educationBadge: {
    backgroundColor: '#ecf0f1',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  educationBadgeText: {
    fontSize: 10,
    color: '#34495e',
    fontWeight: '500',
  },
  removeButton: {
    padding: 8,
  },
  emptyChildren: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 10,
    marginBottom: 16,
  },
  emptyButton: {
    minWidth: 150,
  }
});

export default KelompokDetailScreen;