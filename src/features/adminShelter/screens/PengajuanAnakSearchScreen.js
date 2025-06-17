import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import Button from '../../../common/components/Button';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminShelterPengajuanAnakApi } from '../api/adminShelterPengajuanAnakApi';

const PengajuanAnakSearchScreen = () => {
  const navigation = useNavigation();
  
  // State
  const [kkNumber, setKkNumber] = useState('');
  const [searching, setSearching] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  
  // Handle search for KK
  const handleSearch = async () => {
    if (!kkNumber.trim()) {
      Alert.alert('Input Required', 'Please enter a KK number to search');
      return;
    }
    
    try {
      setSearching(true);
      setError(null);
      
      const response = await adminShelterPengajuanAnakApi.searchKeluarga(kkNumber.trim());
      
      if (response.data.success) {
        setSearchResults(response.data.data || []);
      } else {
        setError(response.data.message || 'Failed to search for families');
      }
    } catch (err) {
      console.error('Error searching families:', err);
      setError('Failed to search for families. Please try again.');
    } finally {
      setSearching(false);
    }
  };
  
  // Handle selecting a family
  const handleSelectFamily = async (keluarga) => {
    try {
      setValidating(true);
      
      // Validate KK before proceeding
      const response = await adminShelterPengajuanAnakApi.validateKK(keluarga.no_kk);
      
      setValidating(false);
      
      if (response.data.success) {
        // Navigate to the form to add a child to this family
        navigation.navigate('PengajuanAnakForm', { 
          keluarga: response.data.keluarga,
          mode: 'existing'
        });
      } else {
        Alert.alert('Error', response.data.message || 'Failed to validate family');
      }
    } catch (err) {
      setValidating(false);
      console.error('Error validating KK:', err);
      
      // If 404, family not found, ask to create new
      if (err.response && err.response.status === 404) {
        Alert.alert(
          'Family Not Found',
          'This KK number is not registered yet. Would you like to register a new family?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Buat Keluarga Baru',
              onPress: () => navigation.navigate('KeluargaForm', { isNew: true })
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to validate family. Please try again.');
      }
    }
  };
  
  // Navigate to create new family
  const handleCreateNewFamily = () => {
    navigation.navigate('KeluargaForm', { isNew: true });
  };
  
  // Render family item
  const renderFamilyItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.familyItem}
        onPress={() => handleSelectFamily(item)}
        disabled={validating}
      >
        <View style={styles.familyItemContent}>
          <Text style={styles.familyName}>{item.kepala_keluarga}</Text>
          <Text style={styles.kkNumber}>KK: {item.no_kk}</Text>
        </View>
        {validating ? (
          <ActivityIndicator size="small" color="#3498db" />
        ) : (
          <Ionicons name="chevron-forward" size={24} color="#bbb" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}></Text>
        
      </View> */}
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.inputContainer}>
          <Ionicons name="search" size={20} color="#777" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Masukan No KK"
            value={kkNumber}
            onChangeText={setKkNumber}
            keyboardType="numeric"
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {kkNumber.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => setKkNumber('')}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Search"
          onPress={handleSearch}
          loading={searching}
          disabled={searching || !kkNumber.trim()}
          type="primary"
          style={styles.searchButton}
        />
      </View>
      
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={handleSearch}
        />
      )}
      
      {/* Results or Empty State */}
      {searching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Mencari...</Text>
        </View>
      ) : searchResults.length > 0 ? (
        <FlatList
          data={searchResults}
          renderItem={renderFamilyItem}
          keyExtractor={(item) => item.id_keluarga?.toString()}
          contentContainerStyle={styles.resultsList}
          ListHeaderComponent={
            <Text style={styles.resultsHeader}>
              Ditemukan {searchResults.length} Hasil{searchResults.length > 1 ? '' : ''}
            </Text>
          }
        />
      ) : kkNumber && !searching && !error ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search" size={60} color="#ddd" />
          <Text style={styles.emptyText}>Nomor KK Tidak ditemukan</Text>
          <Button
            title="Buat Keluarga Baru"
            onPress={handleCreateNewFamily}
            type="primary"
            style={styles.createButton}
          />
        </View>
      ) : (
        <View style={styles.instructionsContainer}>
          <Ionicons name="information-circle" size={60} color="#3498db" />
          {/* <Text style={styles.instructionsText}>
            Search for an existing family by KK number to add a child, or create a new family.
          </Text> */}
          <Button
            title="Buat Keluarga Baru"
            onPress={handleCreateNewFamily}
            type="outline"
            style={styles.createButton}
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
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginRight: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    height: 48,
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  resultsList: {
    paddingTop: 12,
  },
  resultsHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginBottom: 12,
  },
  familyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  familyItemContent: {
    flex: 1,
  },
  familyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  kkNumber: {
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
  },
  instructionsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  instructionsText: {
    fontSize: 16,
    color: '#666',
    marginVertical: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  createButton: {
    minWidth: 200,
    marginTop: 16,
  },
});

export default PengajuanAnakSearchScreen;