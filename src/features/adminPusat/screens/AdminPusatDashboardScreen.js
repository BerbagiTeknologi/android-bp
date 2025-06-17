import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

// Import components
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

// Import API
import { adminPusatApi } from '../api/adminPusatApi';

// Import hooks
import { useAuth } from '../../../common/hooks/useAuth';

const AdminPusatDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await adminPusatApi.getDashboard();
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
  const navigateToUsers = () => navigation.navigate('Management', { screen: 'UserManagement' });
  const navigateToKacab = () => navigation.navigate('Management', { screen: 'KacabManagement' });
  const navigateToKeluarga = () => navigation.navigate('Management', { screen: 'KeluargaManagement' });
  const navigateToAnak = () => navigation.navigate('Management', { screen: 'AnakManagement' });
  //const navigateToAddKeluarga = () => navigation.navigate('Management', { screen: 'KeluargaForm', params: { isNew: true } });
  const navigateToProfile = () => navigation.navigate('ProfileTab');

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

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeText}>
            Selamat datang kembali,
          </Text>
          <Text style={styles.nameText}>
            {profile?.nama_lengkap || user?.email || 'Admin Pusat'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileImageContainer}
          onPress={navigateToProfile}
        >
          {profile?.foto ? (
            <Image
              source={{ uri: `https://berbagipendidikan.org/storage/AdminPusat/${profile.id_admin_pusat}/${profile.foto}` }}
              style={styles.profileImage}
            />
          ) : (
            <View style={styles.profileImagePlaceholder}>
              <Ionicons name="person" size={30} color="#ffffff" />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons name="business-outline" size={24} color="#3498db" />
          <Text style={styles.statNumber}>
            {dashboardData?.kacab_count || 0}
          </Text>
          <Text style={styles.statLabel}>Cabang</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="home-outline" size={24} color="#e74c3c" />
          <Text style={styles.statNumber}>
            {dashboardData?.shelter_count || 0}
          </Text>
          <Text style={styles.statLabel}>Shelter</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="people-outline" size={24} color="#2ecc71" />
          <Text style={styles.statNumber}>
            {dashboardData?.children_count || 0}
          </Text>
          <Text style={styles.statLabel}>Anak</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="heart-outline" size={24} color="#9b59b6" />
          <Text style={styles.statNumber}>
            {dashboardData?.donatur_count || 0}
          </Text>
          <Text style={styles.statLabel}>Donatur</Text>
        </View>
      </View>

      {/* Quick Access */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Akses Cepat</Text>
        <View style={styles.quickAccessGrid}>
          <TouchableOpacity 
            style={styles.quickAccessItem} 
            onPress={navigateToUsers}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#3498db' }]}>
              <Ionicons name="people" size={24} color="#fff" />
            </View>
            <Text style={styles.quickAccessText}>Pengguna</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessItem} 
            onPress={navigateToKacab}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#2ecc71' }]}>
              <Ionicons name="business" size={24} color="#fff" />
            </View>
            <Text style={styles.quickAccessText}>Cabang</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={navigateToKeluarga}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#e67e22' }]}>
              <Ionicons name="people-circle" size={24} color="#fff" />
            </View>
            <Text style={styles.quickAccessText}>Keluarga</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.quickAccessItem}
            onPress={navigateToAnak}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#9b59b6' }]}>
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <Text style={styles.quickAccessText}>Anak</Text>
          </TouchableOpacity>
          
      

          <TouchableOpacity 
            style={styles.quickAccessItem}
          >
            <View style={[styles.iconContainer, { backgroundColor: '#1abc9c' }]}>
              <Ionicons name="settings" size={24} color="#fff" />
            </View>
            <Text style={styles.quickAccessText}>Pengaturan</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Aktivitas Terbaru</Text>
        {dashboardData?.recent_activities?.length > 0 ? (
          dashboardData.recent_activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="time-outline" size={20} color="#3498db" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Tidak ada aktivitas terbaru</Text>
        )}
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
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  profileImageContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAccessItem: {
    width: '48%',
    marginBottom: 16,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickAccessText: {
    fontWeight: '500',
    color: '#333',
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  emptyText: {
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 16,
  },
});

export default AdminPusatDashboardScreen;