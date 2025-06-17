import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import Button from '../../../common/components/Button';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { adminShelterKelompokApi } from '../api/adminShelterKelompokApi';
import { useAuth } from '../../../common/hooks/useAuth';

const AddChildrenToKelompokScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { profile } = useAuth();
  
  const { kelompokId, kelompokName, shelterId } = route.params || {};
  
  const [kelompokDetails, setKelompokDetails] = useState(null);
  const [availableChildren, setAvailableChildren] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const fetchKelompokDetails = async () => {
    try {
      const response = await adminShelterKelompokApi.getKelompokDetail(kelompokId);
      if (response.data.success) {
        setKelompokDetails(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching kelompok details:', err);
    }
  };
  
  const fetchAvailableChildren = async () => {
    try {
      setError(null);
      
      const response = await adminShelterKelompokApi.getAvailableChildren(
        shelterId || profile?.shelter?.id_shelter
      );
      
      if (response.data.success) {
        const children = response.data.data || [];
        setAvailableChildren(children);
        setFilteredChildren(children);
      } else {
        setError(response.data.message || 'Failed to load available children');
      }
    } catch (err) {
      console.error('Error fetching available children:', err);
      setError('Failed to load available children. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    navigation.setOptions({
      headerTitle: `Add to ${kelompokName || 'Group'}`
    });
    Promise.all([
      fetchKelompokDetails(),
      fetchAvailableChildren()
    ]);
  }, []);
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredChildren(availableChildren);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = availableChildren.filter(child => 
        (child.full_name && child.full_name.toLowerCase().includes(query)) ||
        (child.nick_name && child.nick_name.toLowerCase().includes(query)) ||
        (child.nik_anak && child.nik_anak.includes(query))
      );
      setFilteredChildren(filtered);
    }
  }, [searchQuery, availableChildren]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setSelectedChildren([]);
    Promise.all([
      fetchKelompokDetails(),
      fetchAvailableChildren()
    ]);
  };
  
  const toggleChildSelection = (childId) => {
    setSelectedChildren(prev => {
      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };
  
  const selectAll = () => {
    const allChildIds = filteredChildren.map(child => child.id_anak);
    setSelectedChildren(allChildIds);
  };
  
  const deselectAll = () => {
    setSelectedChildren([]);
  };
  
  const checkEducationCompatibility = (child, kelompok) => {
    if (!child.anakPendidikan || !kelompok?.level_anak_binaan) {
      return { compatible: true, reason: 'No education data' };
    }

    const jenjang = child.anakPendidikan.jenjang?.toLowerCase().trim() || '';
    const levelName = kelompok.level_anak_binaan.nama_level_binaan?.toLowerCase().trim() || '';

    const compatibility = {
      'belum_sd': ['tk', 'paud', 'early', 'dini', 'kelas 1', 'kelas 2', 'kelas 3'],
      'sd': ['sd', 'elementary', 'dasar', 'kelas 1', 'kelas 2', 'kelas 3', 'kelas 4', 'kelas 5', 'kelas 6'],
      'smp': ['smp', 'mts', 'junior', 'menengah pertama', 'kelas 7', 'kelas 8', 'kelas 9'],
      'sma': ['sma', 'smk', 'ma', 'senior', 'menengah atas', 'kelas 10', 'kelas 11', 'kelas 12'],
      'perguruan_tinggi': ['universitas', 'college', 'tinggi', 'sarjana', 'semester']
    };

    if (!compatibility[jenjang]) {
      return { compatible: true, reason: 'Unknown education level' };
    }

    const isCompatible = compatibility[jenjang].some(keyword => 
      levelName.includes(keyword)
    );

    return {
      compatible: isCompatible,
      reason: isCompatible ? 'Compatible' : `${jenjang.toUpperCase()} doesn't match ${levelName}`
    };
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
  
  const handleSubmit = async () => {
    if (selectedChildren.length === 0) {
      Alert.alert('No Selection', 'Please select at least one child to add.');
      return;
    }
    
    Alert.alert(
      'Confirm',
      `Add ${selectedChildren.length} child${selectedChildren.length > 1 ? 'ren' : ''} to the group?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Add', 
          onPress: async () => {
            setSubmitting(true);
            
            try {
              const results = [];
              const errors = [];
              
              for (const childId of selectedChildren) {
                try {
                  const response = await adminShelterKelompokApi.addChildToGroup(
                    kelompokId,
                    { id_anak: childId }
                  );
                  results.push(response);
                } catch (err) {
                  errors.push({ childId, error: err });
                  console.error(`Error adding child ${childId}:`, err);
                }
              }
              
              if (errors.length === 0) {
                Alert.alert(
                  'Success',
                  `${results.length} child${results.length > 1 ? 'ren' : ''} added successfully`,
                  [
                    {
                      text: 'OK',
                      onPress: () => {
                        navigation.goBack();
                        if (route.params?.onRefresh) {
                          route.params.onRefresh();
                        }
                      }
                    }
                  ]
                );
              } else {
                Alert.alert(
                  'Partial Success',
                  `Added ${results.length} child${results.length > 1 ? 'ren' : ''}, but ${errors.length} failed.`,
                  [{ text: 'OK' }]
                );
              }
            } catch (err) {
              console.error('Error submitting children:', err);
              Alert.alert('Error', 'Failed to add children. Please try again.');
            } finally {
              setSubmitting(false);
            }
          }
        }
      ]
    );
  };
  
  const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    
    let dob;
    try {
      if (birthDate.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{4}$/)) {
        const parts = birthDate.split(/[-/]/);
        dob = new Date(parts[2], parts[1] - 1, parts[0]);
      } else if (birthDate.match(/^\d{4}[-/]\d{1,2}[-/]\d{1,2}$/)) {
        dob = new Date(birthDate);
      } else {
        dob = new Date(birthDate);
      }
      
      if (isNaN(dob.getTime())) return '';
      
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
  
  const renderChildItem = ({ item: child }) => {
    const isSelected = selectedChildren.includes(child.id_anak);
    const compatibility = checkEducationCompatibility(child, kelompokDetails);
    
    return (
      <TouchableOpacity
        style={[
          styles.childItem, 
          isSelected && styles.childItemSelected,
          !compatibility.compatible && styles.childItemIncompatible
        ]}
        onPress={() => toggleChildSelection(child.id_anak)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxContainer}>
          <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </View>
        </View>
        
        <View style={styles.childImageContainer}>
          {child.foto_url && child.foto_url !== 'http://127.0.0.1:8000/images/default.png' ? (
            <Image source={{ uri: child.foto_url }} style={styles.childImage} />
          ) : (
            <View style={styles.childImagePlaceholder}>
              <Ionicons 
                name={child.jenis_kelamin === 'Laki-laki' ? 'man' : 'woman'} 
                size={24} 
                color="#666" 
              />
            </View>
          )}
        </View>
        
        <View style={styles.childInfo}>
          <View style={styles.childHeader}>
            <Text style={styles.childName} numberOfLines={1}>
              {child.full_name || child.nick_name}
            </Text>
            
            <View style={styles.compatibilityIndicator}>
              <Ionicons 
                name={compatibility.compatible ? 'checkmark-circle' : 'warning-outline'} 
                size={18} 
                color={compatibility.compatible ? '#2ecc71' : '#f39c12'} 
              />
            </View>
          </View>
          
          <Text style={styles.childDetails}>
            {child.jenis_kelamin === 'Laki-laki' ? 'L' : 'P'}
            {child.tanggal_lahir && ` • ${calculateAge(child.tanggal_lahir)}`}
          </Text>
          
          {child.nik_anak && (
            <Text style={styles.childNik}>NIK: {child.nik_anak}</Text>
          )}
          
          <View style={styles.badgeContainer}>
            {child.levelAnakBinaan && (
              <View style={[
                styles.levelBadge,
                { backgroundColor: getLevelBadgeColor(child.levelAnakBinaan) }
              ]}>
                <Text style={styles.levelBadgeText}>
                  Current: {child.levelAnakBinaan.nama_level_binaan}
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
            
            {!compatibility.compatible && (
              <View style={styles.warningBadge}>
                <Text style={styles.warningBadgeText}>
                  Level Mismatch
                </Text>
              </View>
            )}
          </View>
          
          {!compatibility.compatible && (
            <Text style={styles.compatibilityNote}>
              {compatibility.reason}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="people-outline" size={48} color="#bdc3c7" />
      <Text style={styles.emptyText}>
        {searchQuery.trim() !== '' 
          ? 'No children found matching your search'
          : 'No available children without group'}
      </Text>
    </View>
  );
  
  if (loading) {
    return <LoadingSpinner fullScreen message="Loading available children..." />;
  }
  
  return (
    <View style={styles.container}>
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchAvailableChildren}
        />
      )}
      
      {kelompokDetails && (
        <View style={styles.kelompokInfoContainer}>
          <Text style={styles.kelompokInfoTitle}>Target Group Level:</Text>
          <View style={[
            styles.targetLevelBadge,
            { backgroundColor: getLevelBadgeColor(kelompokDetails.level_anak_binaan) }
          ]}>
            <Text style={styles.targetLevelText}>
              {kelompokDetails.level_anak_binaan?.nama_level_binaan || 'No Level'}
            </Text>
          </View>
        </View>
      )}
      
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or NIK..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {filteredChildren.length > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedChildren.length} of {filteredChildren.length} selected
          </Text>
          <View style={styles.selectionActions}>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={selectAll}
              disabled={selectedChildren.length === filteredChildren.length}
            >
              <Text style={[
                styles.selectionButtonText,
                selectedChildren.length === filteredChildren.length && styles.disabledText
              ]}>
                Select All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.selectionButton}
              onPress={deselectAll}
              disabled={selectedChildren.length === 0}
            >
              <Text style={[
                styles.selectionButtonText,
                selectedChildren.length === 0 && styles.disabledText
              ]}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      <FlatList
        data={filteredChildren}
        renderItem={renderChildItem}
        keyExtractor={(item) => item.id_anak.toString()}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#9b59b6']}
          />
        }
      />
      
      {selectedChildren.length > 0 && (
        <View style={styles.submitContainer}>
          <Button
            title={`Add ${selectedChildren.length} Child${selectedChildren.length > 1 ? 'ren' : ''}`}
            onPress={handleSubmit}
            loading={submitting}
            disabled={submitting}
            type="primary"
            size="large"
            fullWidth
            style={styles.submitButton}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  kelompokInfoContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  kelompokInfoTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginRight: 8,
  },
  targetLevelBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  targetLevelText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionButton: {
    marginLeft: 16,
  },
  selectionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9b59b6',
  },
  disabledText: {
    color: '#ccc',
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 80,
  },
  childItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  childItemSelected: {
    backgroundColor: '#f2e5ff',
    borderWidth: 1,
    borderColor: '#9b59b6',
  },
  childItemIncompatible: {
    borderLeftWidth: 4,
    borderLeftColor: '#f39c12',
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#9b59b6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#9b59b6',
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
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  childName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  compatibilityIndicator: {
    marginLeft: 8,
  },
  childDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  childNik: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  badgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
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
  warningBadge: {
    backgroundColor: '#f39c12',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  warningBadgeText: {
    fontSize: 10,
    color: '#ffffff',
    fontWeight: '500',
  },
  compatibilityNote: {
    fontSize: 12,
    color: '#f39c12',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  submitButton: {
    backgroundColor: '#9b59b6',
  },
});

export default AddChildrenToKelompokScreen;