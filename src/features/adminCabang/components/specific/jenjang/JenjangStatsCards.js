import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import StatsCard from '../../shared/StatsCard';

const JenjangStatsCards = ({ statistics, loading = false }) => {
  if (!statistics && !loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>Data statistik tidak tersedia</Text>
      </View>
    );
  }

  const getPercentage = (value, total) => {
    if (!total || total === 0 || !value) return 0;
    return Math.round((value / total) * 100);
  };

  const safeValue = (value) => value || 0;

  return (
    <View style={styles.container}>
      {/* Total Overview */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Overview</Text>
        
        <StatsCard
          title="Total Jenjang"
          value={safeValue(statistics?.total_jenjang)}
          subtitle="Jenjang yang terdaftar"
          icon="library-outline"
          iconColor="#007bff"
          loading={loading}
        />

        <StatsCard
          title="Jenjang Aktif"
          value={safeValue(statistics?.total_jenjang_aktif)}
          subtitle={`${getPercentage(statistics?.total_jenjang_aktif, statistics?.total_jenjang)}% dari total`}
          icon="checkmark-circle-outline"
          iconColor="#28a745"
          loading={loading}
        />
      </View>

      {/* Usage Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Penggunaan</Text>
        
        <StatsCard
          title="Dengan Kelas"
          value={safeValue(statistics?.total_with_kelas)}
          subtitle={`${getPercentage(statistics?.total_with_kelas, statistics?.total_jenjang)}% memiliki kelas`}
          icon="people-outline"
          iconColor="#ffc107"
          loading={loading}
        />

        <StatsCard
          title="Dengan Mata Pelajaran"
          value={safeValue(statistics?.total_with_mata_pelajaran)}
          subtitle={`${getPercentage(statistics?.total_with_mata_pelajaran, statistics?.total_jenjang)}% memiliki mapel`}
          icon="book-outline"
          iconColor="#17a2b8"
          loading={loading}
        />
      </View>

      {/* Top Performance */}
      {statistics?.most_used_jenjang && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Paling Banyak Digunakan</Text>
          
          <View style={styles.topJenjangCard}>
            <View style={styles.topJenjangHeader}>
              <View style={styles.topJenjangIcon}>
                <Text style={styles.topJenjangIconText}>👑</Text>
              </View>
              <View style={styles.topJenjangContent}>
                <Text style={styles.topJenjangName}>
                  {statistics.most_used_jenjang.nama}
                </Text>
                <Text style={styles.topJenjangCount}>
                  {statistics.most_used_jenjang.kelas_count} kelas terdaftar
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Health Score */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kesehatan Data</Text>
        
        <View style={styles.healthScoreCard}>
          <View style={styles.healthScoreHeader}>
            <Text style={styles.healthScoreTitle}>Skor Kelengkapan</Text>
            <Text style={styles.healthScoreValue}>
              {Math.round(((safeValue(statistics?.total_with_kelas) + safeValue(statistics?.total_with_mata_pelajaran)) / 2))}%
            </Text>
          </View>
          
          <View style={styles.healthDetails}>
            <View style={styles.healthItem}>
              <View style={[
                styles.healthIndicator, 
                { backgroundColor: safeValue(statistics?.total_with_kelas) > 0 ? '#28a745' : '#dc3545' }
              ]} />
              <Text style={styles.healthItemText}>
                {safeValue(statistics?.total_with_kelas) > 0 ? 'Ada kelas terdaftar' : 'Belum ada kelas'}
              </Text>
            </View>
            
            <View style={styles.healthItem}>
              <View style={[
                styles.healthIndicator, 
                { backgroundColor: safeValue(statistics?.total_with_mata_pelajaran) > 0 ? '#28a745' : '#dc3545' }
              ]} />
              <Text style={styles.healthItemText}>
                {safeValue(statistics?.total_with_mata_pelajaran) > 0 ? 'Ada mata pelajaran' : 'Belum ada mata pelajaran'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    marginTop: 40
  },
  topJenjangCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  topJenjangHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  topJenjangIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff3cd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  topJenjangIconText: {
    fontSize: 24
  },
  topJenjangContent: {
    flex: 1
  },
  topJenjangName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4
  },
  topJenjangCount: {
    fontSize: 14,
    color: '#856404'
  },
  healthScoreCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  healthScoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  healthScoreTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  healthScoreValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff'
  },
  healthDetails: {
    marginTop: 8
  },
  healthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  healthIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8
  },
  healthItemText: {
    fontSize: 14,
    color: '#666'
  }
});

export default JenjangStatsCards;