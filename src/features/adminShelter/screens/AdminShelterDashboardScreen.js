import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import TodayActivitiesCard from '../components/TodayActivitiesCard';
import CalendarWidget from '../components/CalendarWidget';
import { adminShelterApi } from '../api/adminShelterApi';

const { width } = Dimensions.get('window');

const AdminShelterDashboardScreen = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const menuItems = [
    { title: 'Keluarga', icon: 'home', color: '#1abc9c', onPress: () => navigation.navigate('Management', { screen: 'KeluargaManagement' }) },
    { title: 'Anak Binaan', icon: 'people', color: '#e74c3c', onPress: () => navigation.navigate('Management', { screen: 'AnakManagement' }) },
    { title: 'Tutor', icon: 'school', color: '#2ecc71', onPress: () => navigation.navigate('Management', { screen: 'TutorManagement' }) },
    { title: 'Keuangan', icon: 'wallet', color: '#f39c12', onPress: () => navigation.navigate('Management', { screen: 'KeuanganList' }) },
    { title: 'Kelola Kurikulum', icon: 'library', color: '#9b59b6', onPress: () => navigation.navigate('KurikulumHome') },
    { title: 'Laporan Kegiatan', icon: 'bar-chart', color: '#e67e22', onPress: () => navigation.navigate('Management', { screen: 'LaporanKegiatanMain' }) }
  ];

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

  useEffect(() => { fetchDashboardData(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) return <LoadingSpinner fullScreen message="Loading dashboard..." />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}
      
      {/* Today's Activities Card */}
      <TodayActivitiesCard />
      
      {/* Calendar Widget */}
      <CalendarWidget />
      
      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map(({ title, icon, color, onPress }, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: color }]}>
              <Ionicons name={icon} size={32} color="#ffffff" />
            </View>
            <Text style={styles.menuText}>{title}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16, paddingBottom: 32 },
  menuContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
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
    elevation: 3
  },
  menuIcon: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  menuText: { fontSize: 14, fontWeight: '600', color: '#333', textAlign: 'center' }
});

export default AdminShelterDashboardScreen;