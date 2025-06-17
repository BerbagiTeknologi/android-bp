import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { adminCabangSurveyApi } from '../api/adminCabangSurveyApi';

const SurveyStatusFilterScreen = () => {
  const navigation = useNavigation();
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('pending');
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  const tabs = [
    { key: 'pending', label: 'Menunggu', icon: 'time-outline', color: '#f39c12' },
    { key: 'approved', label: 'Disetujui', icon: 'checkmark-circle-outline', color: '#27ae60' },
    { key: 'rejected', label: 'Ditolak', icon: 'close-circle-outline', color: '#e74c3c' }
  ];

  const statusConfig = {
    pending: { label: 'MENUNGGU', color: '#f39c12' },
    layak: { label: 'DISETUJUI', color: '#27ae60' },
    'tidak layak': { label: 'DITOLAK', color: '#e74c3c' }
  };

  const fetchSurveys = async (params = {}) => {
    try {
      setError(null);
      const response = await adminCabangSurveyApi.getAllSurveys({
        status: activeTab, search: searchText, ...params
      });
      setSurveys(response.data.data.data);
      setPagination({
        currentPage: response.data.data.current_page,
        lastPage: response.data.data.last_page,
        total: response.data.data.total
      });
    } catch (err) {
      setError('Gagal memuat survei');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminCabangSurveyApi.getStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Gagal memuat statistik:', err);
    }
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { setLoading(true); fetchSurveys(); }, [activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSurveys();
    fetchStats();
  };

  const handleSearch = () => { setLoading(true); fetchSurveys(); };
  
  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchText('');
  };

  const navigateToDetail = (survey) => 
    navigation.navigate('SurveyApprovalDetail', { surveyId: survey.id_survey });

  const getStatusBadge = (status) => {
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <View style={[styles.statusBadge, { backgroundColor: config.color }]}>
        <Text style={styles.statusText}>{config.label}</Text>
      </View>
    );
  };

  const InfoRow = ({ icon, text }) => (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={16} color="#666" />
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );

  const renderSurveyItem = ({ item }) => (
    <TouchableOpacity style={styles.surveyCard} onPress={() => navigateToDetail(item)}>
      <View style={styles.surveyHeader}>
        <Text style={styles.familyName}>{item.keluarga?.kepala_keluarga}</Text>
        {getStatusBadge(item.hasil_survey)}
      </View>
      
      <View style={styles.surveyInfo}>
        <InfoRow icon="home-outline" text={item.keluarga?.shelter?.nama_shelter} />
        <InfoRow icon="people-outline" text={`${item.keluarga?.anak?.length || 0} Anak`} />
        <InfoRow icon="calendar-outline" text={new Date(item.created_at).toLocaleDateString()} />
        {item.approved_at && (
          <InfoRow icon="checkmark-outline" text={`Diproses: ${new Date(item.approved_at).toLocaleDateString()}`} />
        )}
      </View>

      {item.keluarga?.anak?.length > 0 && (
        <View style={styles.childrenInfo}>
          <Text style={styles.childrenLabel}>Anak:</Text>
          {item.keluarga.anak.slice(0, 2).map((anak, index) => (
            <Text key={index} style={styles.childName}>
              {anak.full_name} ({anak.status_cpb})
            </Text>
          ))}
          {item.keluarga.anak.length > 2 && (
            <Text style={styles.moreChildren}>+{item.keluarga.anak.length - 2} lagi</Text>
          )}
        </View>
      )}

      {activeTab !== 'pending' && item.approvedBy && (
        <View style={styles.processedInfo}>
          <Text style={styles.processedLabel}>
            Diproses oleh: {item.approvedBy.nama_lengkap || 'Admin'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading && !refreshing) return <LoadingSpinner fullScreen message="Memuat survei..." />;

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && [styles.activeTab, { borderBottomColor: tab.color }]]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Ionicons name={tab.icon} size={20} color={activeTab === tab.key ? tab.color : '#999'} />
            <Text style={[styles.tabText, activeTab === tab.key && { color: tab.color }]}>
              {tab.label}
            </Text>
            {stats[tab.key] !== undefined && (
              <View style={[styles.tabBadge, { backgroundColor: tab.color }]}>
                <Text style={styles.tabBadgeText}>{stats[tab.key]}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari keluarga, nama anak, atau nomor KK..."
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
          />
        </View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {error && <ErrorMessage message={error} onRetry={fetchSurveys} />}

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {pagination.total || 0} {tabs.find(t => t.key === activeTab)?.label} Survei
        </Text>
      </View>

      <FlatList
        data={surveys}
        renderItem={renderSurveyItem}
        keyExtractor={(item) => item.id_survey.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Tidak ada survei {activeTab} ditemukan</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 8, borderBottomWidth: 3, borderBottomColor: 'transparent' },
  activeTab: { borderBottomWidth: 3 },
  tabText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: '#999' },
  tabBadge: { marginLeft: 8, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, minWidth: 20, alignItems: 'center' },
  tabBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  searchContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', alignItems: 'center' },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f8f8', borderRadius: 8, paddingHorizontal: 12, marginRight: 8 },
  searchInput: { flex: 1, padding: 12, fontSize: 16 },
  searchButton: { backgroundColor: '#2ecc71', padding: 12, borderRadius: 8 },
  statsContainer: { padding: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  statsText: { fontSize: 16, fontWeight: '600', color: '#333' },
  listContainer: { padding: 16 },
  surveyCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 2 },
  surveyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  familyName: { fontSize: 18, fontWeight: 'bold', color: '#333', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  surveyInfo: { marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoText: { marginLeft: 8, fontSize: 14, color: '#666' },
  childrenInfo: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8, marginBottom: 8 },
  childrenLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  childName: { fontSize: 14, color: '#666', marginBottom: 2 },
  moreChildren: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  processedInfo: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 8 },
  processedLabel: { fontSize: 12, color: '#999', fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 16, color: '#999', marginTop: 16 }
});

export default SurveyStatusFilterScreen;