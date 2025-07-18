import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  getKurikulumStatistics,
  selectKurikulumStatistics,
  selectStatisticsLoading,
  selectKurikulumError
} from '../redux/akademik/kurikulumSlice';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';

const AkademikMenuScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const statistics = useSelector(selectKurikulumStatistics);
  const isLoading = useSelector(selectStatisticsLoading);
  const error = useSelector(selectKurikulumError);

  useFocusEffect(
    useCallback(() => {
      loadStatistics();
    }, [])
  );

  const loadStatistics = () => {
    dispatch(getKurikulumStatistics());
  };


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif':
        return '#27ae60';
      case 'draft':
        return '#f39c12';
      default:
        return '#7f8c8d';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'draft':
        return 'Draft';
      default:
        return 'Tidak Aktif';
    }
  };

  const handleCreateKurikulum = () => {
    navigation.navigate('KurikulumForm');
  };

  const handleViewAllKurikulum = () => {
    navigation.navigate('KurikulumList');
  };

  const handleKurikulumPress = (kurikulum) => {
    console.log('Navigating to KurikulumDetail with:', kurikulum);
    navigation.navigate('KurikulumDetail', { kurikulumId: kurikulum.id_kurikulum || kurikulum.id });
  };

  if (isLoading && (!statistics || statistics.kurikulum === undefined)) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // Don't show error screen if we have some statistics data, show inline error instead
  if (error && (!statistics || statistics.kurikulum === undefined)) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={styles.errorTitle}>Gagal memuat data</Text>
          <Text style={styles.errorMessage}>
            {typeof error === 'string' ? error : error.message || 'Terjadi kesalahan saat memuat statistik kurikulum'}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadStatistics}
          >
            <Text style={styles.retryText}>Coba Lagi</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderQuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={handleCreateKurikulum}
        activeOpacity={0.8}
      >
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.primaryActionText}>Buat Kurikulum Baru</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryActionButton}
        onPress={handleViewAllKurikulum}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={20} color="#3498db" />
        <Text style={styles.secondaryActionText}>Lihat Semua Kurikulum</Text>
      </TouchableOpacity>
    </View>
  );

  const renderStatsCard = () => (
    <View style={styles.statsCard}>
      <Text style={styles.statsTitle}>Statistik Kurikulum</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#3498db' }]}>
            <Ionicons name="library" size={20} color="white" />
          </View>
          <Text style={styles.statNumber}>{statistics.kurikulum || 0}</Text>
          <Text style={styles.statLabel}>Total Kurikulum</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#27ae60' }]}>
            <Ionicons name="checkmark-circle" size={20} color="white" />
          </View>
          <Text style={[styles.statNumber, { color: '#27ae60' }]}>
            {statistics.active_semester || 0}
          </Text>
          <Text style={styles.statLabel}>Semester Aktif</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#f39c12' }]}>
            <Ionicons name="document-text" size={20} color="white" />
          </View>
          <Text style={[styles.statNumber, { color: '#f39c12' }]}>
            {statistics.assigned_materi || 0}
          </Text>
          <Text style={styles.statLabel}>Materi Tertaut</Text>
        </View>
        
        <View style={styles.statItem}>
          <View style={[styles.statIcon, { backgroundColor: '#e74c3c' }]}>
            <Ionicons name="school" size={20} color="white" />
          </View>
          <Text style={[styles.statNumber, { color: '#e74c3c' }]}>
            {statistics.total_pembelajaran || 0}
          </Text>
          <Text style={styles.statLabel}>Total Pembelajaran</Text>
        </View>
      </View>
    </View>
  );

  const renderKurikulumItem = ({ item }) => (
    <TouchableOpacity
      style={styles.kurikulumItem}
      onPress={() => handleKurikulumPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.kurikulumHeader}>
        <View style={styles.kurikulumInfo}>
          <Text style={styles.kurikulumName}>{item.nama}</Text>
          <Text style={styles.kurikulumJenjang}>
            {item.jenjang?.nama_jenjang || `Tahun ${item.tahun_berlaku}`}
          </Text>
        </View>
        <View style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) }
        ]}>
          <Text style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
      
      <View style={styles.kurikulumFooter}>
        <View style={styles.kurikulumMeta}>
          <Ionicons name="document-text" size={14} color="#7f8c8d" />
          <Text style={styles.metaText}>{item.materi_count || 0} Materi</Text>
        </View>
        <View style={styles.kurikulumMeta}>
          <Ionicons name="calendar" size={14} color="#7f8c8d" />
          <Text style={styles.metaText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecentKurikulum = () => (
    <View style={styles.recentSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Kurikulum Terbaru</Text>
        <TouchableOpacity onPress={handleViewAllKurikulum}>
          <Text style={styles.seeAllText}>Lihat Semua</Text>
        </TouchableOpacity>
      </View>
      
      {statistics.recent_kurikulum && statistics.recent_kurikulum.length > 0 ? (
        <FlatList
          data={statistics.recent_kurikulum}
          renderItem={renderKurikulumItem}
          keyExtractor={(item) => (item.id_kurikulum || item.id).toString()}
          scrollEnabled={false}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={48} color="#bdc3c7" />
          <Text style={styles.emptyText}>Belum ada kurikulum</Text>
          <Text style={styles.emptySubtext}>Buat kurikulum pertama Anda</Text>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={loadStatistics}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Akademik</Text>
          <Text style={styles.headerSubtitle}>
            Kelola kurikulum dan sistem pembelajaran
          </Text>
        </View>

        {renderQuickActions()}
        {renderStatsCard()}
        {renderRecentKurikulum()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  quickActionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  primaryActionButton: {
    backgroundColor: '#3498db',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  primaryActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryActionButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  secondaryActionText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
    textAlign: 'center',
  },
  recentSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  kurikulumItem: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  kurikulumHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  kurikulumInfo: {
    flex: 1,
  },
  kurikulumName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 2,
  },
  kurikulumJenjang: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '500',
  },
  kurikulumFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  kurikulumMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 4,
  },
  separator: {
    height: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7f8c8d',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#3498db',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AkademikMenuScreen;