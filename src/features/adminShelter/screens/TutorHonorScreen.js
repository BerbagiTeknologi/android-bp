import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import Button from '../../../common/components/Button';

import {
  fetchTutorHonor,
  calculateHonor,
  selectHonorList,
  selectHonorLoading,
  selectHonorError,
  selectHonorSummary,
  selectHonorActionStatus,
  resetActionStatus
} from '../redux/tutorHonorSlice';

const TutorHonorScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const route = useRoute();

  const { tutorId, tutorName } = route.params;
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const honorList = useSelector(selectHonorList);
  const loading = useSelector(selectHonorLoading);
  const error = useSelector(selectHonorError);
  const summary = useSelector(selectHonorSummary);
  const calculateStatus = useSelector(state => selectHonorActionStatus(state, 'calculate'));

  useFocusEffect(
    React.useCallback(() => {
      fetchData();
    }, [selectedYear])
  );

  const fetchData = () => {
    dispatch(fetchTutorHonor({ 
      tutorId, 
      params: { year: selectedYear } 
    }));
  };

  const handleCalculateHonor = (month) => {
    Alert.alert(
      'Hitung Honor',
      `Hitung honor untuk bulan ${getMonthName(month)} ${selectedYear}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hitung',
          onPress: () => {
            dispatch(calculateHonor({
              tutorId,
              data: { month, year: selectedYear }
            }))
              .unwrap()
              .then(() => {
                Alert.alert('Berhasil', 'Honor berhasil dihitung');
                fetchData();
              })
              .catch((err) => {
                Alert.alert('Gagal', err || 'Gagal menghitung honor');
              });
          }
        }
      ]
    );
  };

  const handleOpenCalculationModal = () => {
    navigation.navigate('HonorCalculation', { tutorId, tutorName });
  };

  const getMonthName = (month) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return months[month - 1];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return '#f39c12';
      case 'approved': return '#27ae60';
      case 'paid': return '#2ecc71';
      default: return '#95a5a6';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'approved': return 'Disetujui';
      case 'paid': return 'Dibayar';
      default: return 'Unknown';
    }
  };

  const renderHonorItem = ({ item }) => (
    <TouchableOpacity
      style={styles.honorItem}
      onPress={() => navigation.navigate('TutorHonorDetail', {
        tutorId,
        tutorName,
        month: item.bulan,
        year: item.tahun
      })}
    >
      <View style={styles.honorHeader}>
        <Text style={styles.monthText}>{item.bulan_nama} {item.tahun}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      
      <View style={styles.honorDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.total_aktivitas} aktivitas</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="people-outline" size={16} color="#666" />
          <Text style={styles.detailText}>{item.total_siswa_hadir} siswa hadir</Text>
        </View>
      </View>
      
      <Text style={styles.honorAmount}>Rp {item.total_honor?.toLocaleString('id-ID')}</Text>
      
      <View style={styles.actionRow}>
        {item.status === 'draft' && (
          <TouchableOpacity
            style={styles.calculateButton}
            onPress={(e) => {
              e.stopPropagation();
              handleCalculateHonor(item.bulan);
            }}
          >
            <Ionicons name="calculator-outline" size={16} color="#3498db" />
            <Text style={styles.calculateButtonText}>Hitung Ulang</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.viewButton}>
          <Ionicons name="eye-outline" size={16} color="#666" />
          <Text style={styles.viewButtonText}>Lihat Detail</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="document-text-outline" size={64} color="#e0e0e0" />
      <Text style={styles.emptyTitle}>Belum Ada Data Honor</Text>
      <Text style={styles.emptySubtitle}>
        Hitung honor tutor untuk melihat data
      </Text>
      <Button
        title="Hitung Honor"
        onPress={handleOpenCalculationModal}
        style={styles.calculateHonorButton}
        leftIcon={<Ionicons name="calculator" size={20} color="#fff" />}
      />
    </View>
  );

  if (loading && honorList.length === 0) {
    return <LoadingSpinner fullScreen message="Memuat data honor..." />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.tutorName}>{tutorName}</Text>
            <Text style={styles.yearText}>Tahun {selectedYear}</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleOpenCalculationModal}
          >
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>Rp {summary.yearlyTotal?.toLocaleString('id-ID')}</Text>
            <Text style={styles.summaryLabel}>Total Honor</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{summary.totalActivities}</Text>
            <Text style={styles.summaryLabel}>Total Aktivitas</Text>
          </View>
        </View>
      </View>

      {error && (
        <ErrorMessage
          message={error}
          onRetry={fetchData}
        />
      )}

      <FlatList
        data={honorList}
        renderItem={renderHonorItem}
        keyExtractor={(item) => `${item.bulan}_${item.tahun}`}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchData} />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  summaryCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed'
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tutorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  yearText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4
  },
  addButton: {
    backgroundColor: '#3498db',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  summaryItem: {
    alignItems: 'center'
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2ecc71'
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  listContainer: {
    padding: 16
  },
  honorItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2
  },
  honorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500'
  },
  honorDetails: {
    marginBottom: 12
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  detailText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666'
  },
  honorAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2ecc71',
    marginBottom: 12
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  calculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#ebf3fd'
  },
  calculateButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#3498db',
    fontWeight: '500'
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  viewButtonText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24
  },
  calculateHonorButton: {
    minWidth: 200
  }
});

export default TutorHonorScreen;