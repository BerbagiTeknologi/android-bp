import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Image, Dimensions, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { adminCabangApi } from '../api/adminCabangApi';
import { adminCabangSurveyApi } from '../api/adminCabangSurveyApi';
import { useAuth } from '../../../common/hooks/useAuth';

const { width } = Dimensions.get('window');

const AdminCabangDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, profile } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [surveyStats, setSurveyStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [dashboardResponse, statsResponse] = await Promise.all([
        adminCabangApi.getDashboard(),
        adminCabangSurveyApi.getStats()
      ]);
      setDashboardData(dashboardResponse.data.data);
      setSurveyStats(statsResponse.data.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Gagal memuat data dashboard. Silakan coba lagi.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleRefresh = () => { setRefreshing(true); fetchDashboardData(); };
  const navigateToSurveyManagement = () => navigation.navigate('Management');
  const navigateToProfile = () => navigation.navigate('ProfileTab');

  if (loading && !refreshing) return <LoadingSpinner fullScreen message="Memuat dashboard..." />;

  const quickActions = [
    { title: 'Manajemen Survey', description: 'Kelola semua persetujuan survey', icon: 'document-text', color: '#f39c12', onPress: navigateToSurveyManagement, badge: surveyStats.pending },
    { title: 'Laporan', description: 'Lihat statistik persetujuan', icon: 'stats-chart', color: '#9b59b6' },
    { title: 'Bantuan', description: 'Dapatkan dukungan dan panduan', icon: 'help-circle', color: '#2ecc71' }
  ];

  const statsData = [
    { icon: 'map-outline', color: '#2ecc71', value: dashboardData?.wilbin_count || 0, label: 'Wilayah Binaan' },
    { icon: 'home-outline', color: '#e74c3c', value: dashboardData?.shelter_count || 0, label: 'Shelter' },
    { icon: 'document-text-outline', color: '#f39c12', value: surveyStats.pending || 0, label: 'Survey Tertunda' }
  ];

  const surveyStatsData = [
    { icon: 'time-outline', color: '#f39c12', value: surveyStats.pending || 0, label: 'Tertunda' },
    { icon: 'checkmark-circle-outline', color: '#27ae60', value: surveyStats.approved || 0, label: 'Disetujui' },
    { icon: 'close-circle-outline', color: '#e74c3c', value: surveyStats.rejected || 0, label: 'Ditolak' }
  ];

  const StatCard = ({ icon, color, value, label, horizontal = false }) => (
    <View style={[styles.statCard, horizontal && styles.statCardHorizontal]}>
      <Ionicons name={icon} size={horizontal ? 28 : 24} color={color} />
      <View style={horizontal ? styles.statTextContainer : styles.statTextCenterContainer}>
        <Text style={[styles.statNumber, !horizontal && styles.statNumberCenter]}>{value}</Text>
        <Text style={[styles.statLabel, !horizontal && styles.statLabelCenter]}>{label}</Text>
      </View>
    </View>
  );

  const InfoItem = ({ label, value }) => (
    <View style={styles.cabangInfoRow}>
      <Text style={styles.cabangInfoLabel}>{label}:</Text>
      <Text style={styles.cabangInfoValue}>{value || '-'}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.welcomeText}>Selamat datang kembali,</Text>
            <Text style={styles.nameText}>{profile?.nama_lengkap || user?.email || 'Admin Cabang'}</Text>
            {dashboardData?.kacab && <Text style={styles.cabangText}>{dashboardData.kacab.nama_cabang || 'Cabang'}</Text>}
          </View>
          <TouchableOpacity style={styles.profileImageContainer} onPress={navigateToProfile}>
            {profile?.foto ? (
              <Image source={{ uri: `https://berbagipendidikan.org/storage/AdminCabang/${profile.id_admin_cabang}/${profile.foto}` }} style={styles.profileImage} />
            ) : (
              <View style={styles.profileImagePlaceholder}>
                <Ionicons name="person" size={24} color="#ffffff" />
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsOverview}>
        {statsData.map((stat, index) => <StatCard key={index} {...stat} horizontal />)}
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Statistik Survey</Text>
        <View style={styles.surveyStatsGrid}>
          {surveyStatsData.map((stat, index) => <StatCard key={index} {...stat} />)}
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Aksi Cepat</Text>
        <View style={styles.quickActionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity key={index} style={styles.actionCard} onPress={action.onPress}>
              <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={26} color="#fff" />
              </View>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
              {action.badge > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{action.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {dashboardData?.kacab && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Informasi Cabang</Text>
          <View style={styles.cabangInfoCard}>
            <InfoItem label="Nama Cabang" value={dashboardData.kacab.nama_cabang} />
            <InfoItem label="Alamat" value={dashboardData.kacab.alamat} />
            <InfoItem label="Telepon" value={dashboardData.kacab.no_telp} />
            <InfoItem label="Email" value={dashboardData.kacab.email} />
          </View>
        </View>
      )}

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Aktivitas Terkini</Text>
        {dashboardData?.recent_activities?.length > 0 ? (
          dashboardData.recent_activities.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="time-outline" size={20} color="#2ecc71" />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityText}>{activity.description}</Text>
                <Text style={styles.activityTime}>{activity.time}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Tidak ada aktivitas terkini ditemukan</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  contentContainer: { padding: 16 },
  headerSection: { backgroundColor: '#2ecc71', borderRadius: 12, padding: 20, marginBottom: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }, android: { elevation: 2 } }) },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 14, color: '#fff', opacity: 0.8 },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  cabangText: { fontSize: 16, color: '#fff', opacity: 0.9, marginTop: 4 },
  profileImageContainer: { width: 50, height: 50, borderRadius: 25, overflow: 'hidden', borderWidth: 2, borderColor: '#fff' },
  profileImage: { width: '100%', height: '100%' },
  profileImagePlaceholder: { width: '100%', height: '100%', backgroundColor: '#27ae60', justifyContent: 'center', alignItems: 'center' },
  statsOverview: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginHorizontal: 4, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }, android: { elevation: 2 } }) },
  statCardHorizontal: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  statTextContainer: { marginLeft: 10 },
  statTextCenterContainer: { alignItems: 'center', marginTop: 8 },
  statNumber: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  statNumberCenter: { fontSize: 20 },
  statLabel: { fontSize: 12, color: '#666' },
  statLabelCenter: { marginTop: 4 },
  sectionContainer: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 }, android: { elevation: 2 } }) },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  surveyStatsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  actionCard: { width: (width - 64) / 2, backgroundColor: '#f8f8f8', borderRadius: 12, padding: 16, marginBottom: 16, position: 'relative' },
  actionIconContainer: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  actionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 8 },
  actionDescription: { fontSize: 12, color: '#666' },
  badge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#e74c3c', borderRadius: 10, minWidth: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cabangInfoCard: { backgroundColor: '#f8f8f8', borderRadius: 8, padding: 16 },
  cabangInfoRow: { flexDirection: 'row', marginBottom: 10 },
  cabangInfoLabel: { width: 100, fontSize: 14, fontWeight: '500', color: '#666' },
  cabangInfoValue: { flex: 1, fontSize: 14, color: '#333' },
  activityItem: { flexDirection: 'row', marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  activityIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#e8f8f5', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, color: '#333' },
  activityTime: { fontSize: 12, color: '#999', marginTop: 4 },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 16 }
});

export default AdminCabangDashboardScreen;