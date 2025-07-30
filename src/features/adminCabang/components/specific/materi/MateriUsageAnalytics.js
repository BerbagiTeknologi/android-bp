import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import StatsCard from '../../shared/StatsCard';
import ActionButton from '../../shared/ActionButton';
import { useUsageAnalytics } from '../../../hooks/useUsageAnalytics';

const MateriUsageAnalytics = ({
  materiId = null,
  style,
  onMateriPress,
  onExportReport
}) => {
  const {
    analytics,
    loading,
    error,
    fetchAnalytics,
    fetchUsageTrends,
    generateUsageReport,
    calculateEfficiency,
    getUsageByCategory,
    getTopUsedMateri,
    getUnderutilizedMateri
  } = useUsageAnalytics({ materiId });

  const [activeTab, setActiveTab] = useState('overview');
  const [trendsPeriod, setTrendsPeriod] = useState('6months');

  const handleExport = async (format) => {
    const report = await generateUsageReport(format);
    if (report) {
      onExportReport?.(report, format);
    }
  };

  const handleTrendsPeriodChange = (period) => {
    setTrendsPeriod(period);
    fetchUsageTrends(period);
  };

  const renderOverview = () => {
    const efficiency = calculateEfficiency(analytics.overview?.summary);
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.statsGrid}>
          <StatsCard
            title="Total Materi"
            value={analytics.overview?.total_materi || 0}
            icon="document-text-outline"
            iconColor="#007bff"
          />
          
          <StatsCard
            title="Materi Digunakan"
            value={analytics.overview?.used_materi || 0}
            subtitle={`${efficiency}% dari total`}
            icon="link-outline"
            iconColor="#28a745"
          />
          
          <StatsCard
            title="Tidak Digunakan"
            value={analytics.overview?.unused_materi || 0}
            subtitle="Dapat dioptimasi"
            icon="unlink-outline"
            iconColor="#ffc107"
          />
          
          <StatsCard
            title="Rata-rata per Kurikulum"
            value={analytics.overview?.avg_per_kurikulum || 0}
            icon="trending-up-outline"
            iconColor="#17a2b8"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribusi Penggunaan</Text>
          <View style={styles.categoryList}>
            {getUsageByCategory().map((category, index) => (
              <View key={index} style={styles.categoryItem}>
                <View style={styles.categoryInfo}>
                  <Text style={styles.categoryName}>{category.kategori}</Text>
                  <Text style={styles.categoryCount}>
                    {category.used_count}/{category.total_count}
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[
                    styles.progressFill,
                    { 
                      width: `${(category.used_count / category.total_count) * 100}%`,
                      backgroundColor: getCategoryColor(category.kategori)
                    }
                  ]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderTrends = () => (
    <View style={styles.tabContent}>
      <View style={styles.periodSelector}>
        {['3months', '6months', '1year'].map(period => (
          <TouchableOpacity
            key={period}
            style={[
              styles.periodButton,
              trendsPeriod === period && styles.periodButtonActive
            ]}
            onPress={() => handleTrendsPeriodChange(period)}
          >
            <Text style={[
              styles.periodText,
              trendsPeriod === period && styles.periodTextActive
            ]}>
              {period === '3months' ? '3 Bulan' : 
               period === '6months' ? '6 Bulan' : '1 Tahun'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.trendsChart}>
        <Text style={styles.chartTitle}>Tren Penggunaan Materi</Text>
        {analytics.trends.length > 0 ? (
          <View style={styles.chartContainer}>
            {analytics.trends.map((trend, index) => (
              <View key={index} style={styles.trendItem}>
                <Text style={styles.trendMonth}>{trend.period}</Text>
                <View style={styles.trendBar}>
                  <View style={[
                    styles.trendFill,
                    { height: `${(trend.usage_count / 100) * 60}%` }
                  ]} />
                </View>
                <Text style={styles.trendValue}>{trend.usage_count}</Text>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.noData}>
            <Ionicons name="bar-chart-outline" size={48} color="#ccc" />
            <Text style={styles.noDataText}>Belum ada data trend</Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderUnused = () => {
    const underutilized = getUnderutilizedMateri(2);
    
    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Materi Tidak Digunakan ({analytics.unused.length})
          </Text>
          
          {analytics.unused.length > 0 ? (
            <FlatList
              data={analytics.unused}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.unusedItem}
                  onPress={() => onMateriPress?.(item)}
                >
                  <View style={styles.unusedInfo}>
                    <Text style={styles.unusedName}>{item.nama_materi}</Text>
                    <Text style={styles.unusedMeta}>
                      {item.mata_pelajaran?.nama_mata_pelajaran} - {item.kelas?.nama_kelas}
                    </Text>
                    <Text style={styles.unusedDate}>
                      Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}
                    </Text>
                  </View>
                  <View style={styles.unusedActions}>
                    <View style={styles.unusedBadge}>
                      <Text style={styles.unusedBadgeText}>Tidak Digunakan</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
              keyExtractor={(item) => item.id_materi.toString()}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.noData}>
              <Ionicons name="checkmark-circle-outline" size={48} color="#28a745" />
              <Text style={styles.noDataText}>Semua materi sudah digunakan</Text>
            </View>
          )}
        </View>

        {underutilized.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Materi Kurang Dimanfaatkan ({underutilized.length})
            </Text>
            <Text style={styles.sectionDesc}>
              Materi yang digunakan dalam kurang dari 2 kurikulum
            </Text>
            
            <FlatList
              data={underutilized}
              renderItem={({ item }) => (
                <View style={styles.underutilizedItem}>
                  <Text style={styles.underutilizedName}>{item.nama_materi}</Text>
                  <Text style={styles.underutilizedUsage}>
                    Digunakan dalam {item.usage_count} kurikulum
                  </Text>
                </View>
              )}
              keyExtractor={(item) => item.id_materi.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  };

  const renderRecommendations = () => (
    <View style={styles.tabContent}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Rekomendasi Optimasi</Text>
        
        {analytics.recommendations.length > 0 ? (
          analytics.recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendationCard}>
              <View style={styles.recommendationHeader}>
                <Ionicons 
                  name={getRecommendationIcon(rec.type)} 
                  size={20} 
                  color={getRecommendationColor(rec.type)} 
                />
                <Text style={styles.recommendationTitle}>{rec.title}</Text>
              </View>
              
              <Text style={styles.recommendationDesc}>{rec.description}</Text>
              
              {rec.items && rec.items.length > 0 && (
                <View style={styles.recommendationItems}>
                  <Text style={styles.recommendationItemsTitle}>
                    {rec.items.length} item terkait:
                  </Text>
                  {rec.items.slice(0, 3).map((item, idx) => (
                    <Text key={idx} style={styles.recommendationItem}>
                      • {item.nama_materi}
                    </Text>
                  ))}
                  {rec.items.length > 3 && (
                    <Text style={styles.recommendationMore}>
                      +{rec.items.length - 3} lainnya
                    </Text>
                  )}
                </View>
              )}
              
              <View style={styles.recommendationFooter}>
                <Text style={styles.recommendationImpact}>
                  Impact: {rec.impact || 'Medium'}
                </Text>
                <Text style={styles.recommendationPriority}>
                  Priority: {rec.priority || 'Normal'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.noData}>
            <Ionicons name="thumbs-up-outline" size={48} color="#28a745" />
            <Text style={styles.noDataText}>Tidak ada rekomendasi optimasi</Text>
            <Text style={styles.noDataSubtext}>
              Penggunaan materi sudah optimal
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderTopUsed = () => {
    const topUsed = getTopUsedMateri(10);
    
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Materi Paling Banyak Digunakan</Text>
        
        {topUsed.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.topUsedItem}
            onPress={() => onMateriPress?.(item)}
          >
            <View style={styles.topUsedRank}>
              <Text style={styles.rankNumber}>#{index + 1}</Text>
            </View>
            
            <View style={styles.topUsedInfo}>
              <Text style={styles.topUsedName}>{item.nama_materi}</Text>
              <Text style={styles.topUsedMeta}>
                {item.mata_pelajaran?.nama_mata_pelajaran}
              </Text>
            </View>
            
            <View style={styles.topUsedStats}>
              <Text style={styles.usageCount}>{item.usage_count}</Text>
              <Text style={styles.usageLabel}>kurikulum</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: 'pie-chart-outline' },
    { key: 'trends', label: 'Trends', icon: 'trending-up-outline' },
    { key: 'unused', label: 'Tidak Digunakan', icon: 'unlink-outline' },
    { key: 'recommendations', label: 'Rekomendasi', icon: 'bulb-outline' }
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.loading, style]}>
        <Text style={styles.loadingText}>Memuat analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.error, style]}>
        <Text style={styles.errorText}>{error}</Text>
        <ActionButton
          title="Coba Lagi"
          onPress={fetchAnalytics}
          style={styles.retryButton}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>Usage Analytics</Text>
        <View style={styles.headerActions}>
          <ActionButton
            title="Export"
            icon="download-outline"
            variant="outline"
            size="small"
            onPress={() => handleExport('json')}
          />
        </View>
      </View>

      <View style={styles.tabs}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Ionicons 
                name={tab.icon} 
                size={16} 
                color={activeTab === tab.key ? '#007bff' : '#666'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'trends' && renderTrends()}
        {activeTab === 'unused' && renderUnused()}
        {activeTab === 'recommendations' && renderRecommendations()}
        
        {activeTab === 'overview' && renderTopUsed()}
      </ScrollView>
    </View>
  );
};

const getCategoryColor = (kategori) => {
  const colors = {
    wajib: '#007bff',
    muatan_lokal: '#28a745',
    pengembangan_diri: '#ffc107',
    pilihan: '#dc3545',
    ekstrakurikuler: '#6c757d'
  };
  return colors[kategori] || '#17a2b8';
};

const getRecommendationIcon = (type) => {
  const icons = {
    remove: 'trash-outline',
    merge: 'git-merge-outline',
    duplicate: 'copy-outline',
    optimize: 'settings-outline'
  };
  return icons[type] || 'bulb-outline';
};

const getRecommendationColor = (type) => {
  const colors = {
    remove: '#dc3545',
    merge: '#ffc107',
    duplicate: '#17a2b8',
    optimize: '#28a745'
  };
  return colors[type] || '#007bff';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    fontSize: 16,
    color: '#666'
  },
  error: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 16
  },
  retryButton: {
    width: 120
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  headerActions: {
    flexDirection: 'row'
  },
  tabs: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0'
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 8
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007bff'
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4
  },
  tabTextActive: {
    color: '#007bff',
    fontWeight: '600'
  },
  content: {
    flex: 1
  },
  tabContent: {
    padding: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8
  },
  sectionDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12
  },
  statsGrid: {
    gap: 8,
    marginBottom: 24
  },
  categoryList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  },
  categoryItem: {
    marginBottom: 16
  },
  categoryInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333'
  },
  categoryCount: {
    fontSize: 14,
    color: '#666'
  },
  progressBar: {
    height: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: 3
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 4,
    marginBottom: 16
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6
  },
  periodButtonActive: {
    backgroundColor: '#007bff'
  },
  periodText: {
    fontSize: 12,
    color: '#666'
  },
  periodTextActive: {
    color: '#fff',
    fontWeight: '600'
  },
  trendsChart: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'end',
    justifyContent: 'space-between',
    height: 120
  },
  trendItem: {
    alignItems: 'center',
    flex: 1
  },
  trendMonth: {
    fontSize: 10,
    color: '#666',
    marginBottom: 8
  },
  trendBar: {
    width: 20,
    height: 60,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden'
  },
  trendFill: {
    backgroundColor: '#007bff',
    borderRadius: 10
  },
  trendValue: {
    fontSize: 10,
    color: '#333',
    marginTop: 4
  },
  unusedItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8
  },
  unusedInfo: {
    flex: 1
  },
  unusedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  unusedMeta: {
    fontSize: 12,
    color: '#666',
    marginTop: 2
  },
  unusedDate: {
    fontSize: 10,
    color: '#999',
    marginTop: 4
  },
  unusedActions: {
    justifyContent: 'center'
  },
  unusedBadge: {
    backgroundColor: '#fff3cd',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8
  },
  unusedBadgeText: {
    fontSize: 10,
    color: '#856404',
    fontWeight: '600'
  },
  underutilizedItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 120
  },
  underutilizedName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333'
  },
  underutilizedUsage: {
    fontSize: 10,
    color: '#666',
    marginTop: 4
  },
  recommendationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8
  },
  recommendationDesc: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20
  },
  recommendationItems: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  recommendationItemsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  recommendationItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2
  },
  recommendationMore: {
    fontSize: 10,
    color: '#999',
    fontStyle: 'italic'
  },
  recommendationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  recommendationImpact: {
    fontSize: 12,
    color: '#007bff'
  },
  recommendationPriority: {
    fontSize: 12,
    color: '#ffc107'
  },
  topUsedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8
  },
  topUsedRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  rankNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff'
  },
  topUsedInfo: {
    flex: 1
  },
  topUsedName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333'
  },
  topUsedMeta: {
    fontSize: 12,
    color: '#666'
  },
  topUsedStats: {
    alignItems: 'center'
  },
  usageCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007bff'
  },
  usageLabel: {
    fontSize: 10,
    color: '#666'
  },
  noData: {
    alignItems: 'center',
    paddingVertical: 40
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12
  },
  noDataSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
  }
});

export default MateriUsageAnalytics;