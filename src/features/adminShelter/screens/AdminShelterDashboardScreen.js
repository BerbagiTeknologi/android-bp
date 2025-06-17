import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminShelterApi } from '../api/adminShelterApi';

const { width } = Dimensions.get('window');

const AdminShelterDashboardScreen = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await adminShelterApi.getDashboard();
      setDashboardData(response.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  // Navigation handlers
  const navigateToAttendance = () => navigation.navigate('Attendance');
  const navigateToAnakManagement = () => navigation.navigate('Management', { screen: 'AnakManagement' });
  const navigateToKelompokManagement = () => navigation.navigate('Management', { screen: 'KelompokManagement' });
  const navigateToDonaturManagement = () => navigation.navigate('DonaturManagement');
  const navigateToProfile = () => navigation.navigate('ProfileTab');
  const navigateToTutorManagement = () => navigation.navigate('Management', { screen: 'TutorManagement' });
  const navigateToKeluargaManagement = () => navigation.navigate('Management', { screen: 'KeluargaManagement' });
  
  

  // Show loading indicator
  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Loading dashboard..." />;
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {/* Error Message */}
      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchDashboardData}
        />
      )}

      {/* Main Menu */}
      <View style={styles.menuContainer}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={navigateToKeluargaManagement}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#1abc9c' }]}>
            <Ionicons name="home" size={32} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Keluarga</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={navigateToAnakManagement}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#e74c3c' }]}>
            <Ionicons name="people" size={32} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Anak Binaan</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={navigateToKelompokManagement}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#9b59b6' }]}>
            <Ionicons name="people-circle" size={32} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Kelompok</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={navigateToTutorManagement}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#2ecc71' }]}>
            <Ionicons name="school" size={32} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Tutor</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={navigateToAttendance}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#3498db' }]}>
            <Ionicons name="calendar" size={32} color="#ffffff" />
          </View>
          <Text style={styles.menuText}>Absensi</Text>
        </TouchableOpacity>
        
       <TouchableOpacity 
  style={styles.menuItem}
  onPress={() => navigation.navigate('Management', { screen: 'SemesterManagement' })}
>
  <View style={[styles.menuIcon, { backgroundColor: '#8e44ad' }]}>
    <Ionicons name="calendar" size={32} color="#ffffff" />
  </View>
  <Text style={styles.menuText}>Semester</Text>
</TouchableOpacity>
        
        
      </View>
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
    paddingBottom: 32,
  },
  menuContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  menuIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});

export default AdminShelterDashboardScreen;