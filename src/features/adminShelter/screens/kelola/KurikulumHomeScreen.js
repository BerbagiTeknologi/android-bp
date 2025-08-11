import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  RefreshControl, Dimensions, Alert 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';

const { width } = Dimensions.get('window');

const KurikulumHomeScreen = () => {
  const navigation = useNavigation();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Operational menu items for daily kurikulum activities
  const operationalMenuItems = [
    { 
      title: 'Kelompok', 
      icon: 'people-circle', 
      color: '#9b59b6', 
      description: 'Kelola kelompok belajar',
      onPress: () => navigation.navigate('Management', { screen: 'KelompokManagement' }) 
    },
    { 
      title: 'Aktivitas', 
      icon: 'calendar', 
      color: '#3498db', 
      description: 'Buat & kelola aktivitas',
      onPress: () => navigation.navigate('Attendance', { screen: 'ActivitiesList' }) 
    },
    { 
      title: 'Absensi', 
      icon: 'checkmark-circle', 
      color: '#2ecc71', 
      description: 'Pantau kehadiran siswa',
      onPress: () => navigation.navigate('Attendance', { screen: 'AttendanceList' }) 
    },
    { 
      title: 'Semester', 
      icon: 'time', 
      color: '#8e44ad', 
      description: 'Info semester aktif',
      onPress: () => navigation.navigate('Management', { screen: 'SemesterManagement' }) 
    },
    { 
      title: 'Materi Kurikulum', 
      icon: 'library', 
      color: '#e67e22', 
      description: 'Lihat materi dari cabang',
      onPress: () => navigation.navigate('KurikulumBrowser') 
    }
  ];

  const showComingSoon = (featureName) => {
    Alert.alert(
      'Segera Hadir', 
      `Fitur ${featureName} akan segera tersedia pada update berikutnya.`,
      [{ text: 'OK' }]
    );
  };

  const fetchDashboardData = async () => {
    try {
      setError(null);
      // Mock data for now - will be replaced with actual API call
      const mockData = {
        semesterAktif: {
          nama: 'Semester Ganjil 2024/2025',
          periode: 'Agustus 2024 - Januari 2025',
          progress: 65
        },
        todayStats: {
          totalKelompok: 12,
          aktivitasHariIni: 8,
          siswaAktif: 145,
          tutorAktif: 18
        },
        recentActivity: [
          { time: '09:00', activity: 'Bimbel Matematika - Kelas 5', tutor: 'Bu Sari' },
          { time: '10:30', activity: 'Kegiatan Seni - Kelompok A', tutor: 'Pak Joko' },
          { time: '13:00', activity: 'Bimbel Bahasa Indonesia - Kelas 4', tutor: 'Bu Ani' }
        ]
      };
      setDashboardData(mockData);
    } catch (err) {
      console.error('Error fetching kurikulum dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { 
    fetchDashboardData(); 
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return <LoadingSpinner fullScreen message="Memuat dashboard kurikulum..." />;
  }

  const SemesterBanner = ({ semesterData }) => (
    <View style={styles.semesterBanner}>
      <View style={styles.semesterHeader}>
        <Ionicons name="school" size={24} color="#fff" />
        <View style={styles.semesterInfo}>
          <Text style={styles.semesterTitle}>{semesterData?.nama || 'Semester Aktif'}</Text>
          <Text style={styles.semesterPeriod}>{semesterData?.periode || 'Periode tidak tersedia'}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>{semesterData?.progress || 0}%</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View 
          style={[
            styles.progressFill, 
            { width: `${semesterData?.progress || 0}%` }
          ]} 
        />
      </View>
    </View>
  );

  const QuickStatsCard = ({ stats }) => (
    <View style={styles.statsContainer}>
      <View style={styles.statCard}>
        <Ionicons name="people-circle" size={32} color="#9b59b6" />
        <Text style={styles.statNumber}>{stats?.totalKelompok || 0}</Text>
        <Text style={styles.statLabel}>Kelompok</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="calendar" size={32} color="#3498db" />
        <Text style={styles.statNumber}>{stats?.aktivitasHariIni || 0}</Text>
        <Text style={styles.statLabel}>Aktivitas Hari Ini</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="people" size={32} color="#2ecc71" />
        <Text style={styles.statNumber}>{stats?.siswaAktif || 0}</Text>
        <Text style={styles.statLabel}>Siswa Aktif</Text>
      </View>
      <View style={styles.statCard}>
        <Ionicons name="school" size={32} color="#e67e22" />
        <Text style={styles.statNumber}>{stats?.tutorAktif || 0}</Text>
        <Text style={styles.statLabel}>Tutor Aktif</Text>
      </View>
    </View>
  );

  const TodayScheduleCard = ({ activities }) => (
    <View style={styles.scheduleCard}>
      <View style={styles.cardHeader}>
        <Ionicons name="today" size={20} color="#3498db" />
        <Text style={styles.cardTitle}>Jadwal Hari Ini</Text>
      </View>
      {activities?.length ? (
        activities.map((item, index) => (
          <View key={index} style={styles.scheduleItem}>
            <View style={styles.scheduleTime}>
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
            <View style={styles.scheduleContent}>
              <Text style={styles.activityText}>{item.activity}</Text>
              <Text style={styles.tutorText}>Tutor: {item.tutor}</Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptySchedule}>
          <Ionicons name="calendar-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>Tidak ada jadwal hari ini</Text>
        </View>
      )}
    </View>
  );

  const OperationalMenuGrid = ({ menuItems }) => (
    <View style={styles.menuContainer}>
      <Text style={styles.sectionTitle}>Operasional Harian</Text>
      <View style={styles.menuGrid}>
        {menuItems.map(({ title, icon, color, description, onPress }, index) => (
          <TouchableOpacity key={index} style={styles.menuItem} onPress={onPress}>
            <View style={[styles.menuIcon, { backgroundColor: color }]}>
              <Ionicons name={icon} size={28} color="#ffffff" />
            </View>
            <Text style={styles.menuTitle}>{title}</Text>
            <Text style={styles.menuDescription}>{description}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
      }
    >
      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}
      
      {/* Semester Banner */}
      <SemesterBanner semesterData={dashboardData?.semesterAktif} />
      
      {/* Quick Stats */}
      <QuickStatsCard stats={dashboardData?.todayStats} />
      
      {/* Today Schedule */}
      <TodayScheduleCard activities={dashboardData?.recentActivity} />
      
      {/* Operational Menu Grid */}
      <OperationalMenuGrid menuItems={operationalMenuItems} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#f5f5f5' 
  },
  content: { 
    padding: 16, 
    paddingBottom: 32 
  },
  
  // Semester Banner
  semesterBanner: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  semesterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  semesterInfo: {
    flex: 1,
    marginLeft: 12
  },
  semesterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff'
  },
  semesterPeriod: {
    fontSize: 14,
    color: '#ecf0f1',
    marginTop: 2
  },
  progressContainer: {
    alignItems: 'center'
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff'
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2
  },
  
  // Quick Stats
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 4
  },
  statLabel: {
    fontSize: 10,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 2
  },
  
  // Schedule Card
  scheduleCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginLeft: 8
  },
  scheduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa'
  },
  scheduleTime: {
    width: 60,
    alignItems: 'center'
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db'
  },
  scheduleContent: {
    flex: 1,
    marginLeft: 12
  },
  activityText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2c3e50'
  },
  tutorText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2
  },
  emptySchedule: {
    alignItems: 'center',
    paddingVertical: 24
  },
  emptyText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 8
  },
  
  // Menu Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12
  },
  menuContainer: {
    marginBottom: 16
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  menuItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  menuIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 4
  },
  menuDescription: {
    fontSize: 11,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 14
  }
});

export default KurikulumHomeScreen;