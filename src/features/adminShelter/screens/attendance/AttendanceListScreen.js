import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

import AttendanceCard from '../../components/AttendanceCard';
import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';

import {
  getAttendanceByActivity,
  manualVerify,
  rejectVerification,
  selectActivityAttendance,
  selectAttendanceLoading,
  selectAttendanceError,
  resetAttendanceError
} from '../../redux/attendanceSlice';

const AttendanceListScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  const { id_aktivitas, activityName, activityDate } = route.params || {};
  
  const attendanceRecords = useSelector(state => selectActivityAttendance(state, id_aktivitas));
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCardId, setExpandedCardId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  useEffect(() => {
    if (id_aktivitas) {
      fetchAttendanceRecords();
    }
    
    return () => {
      dispatch(resetAttendanceError());
    };
  }, [id_aktivitas, dispatch]);
  
  const fetchAttendanceRecords = async () => {
    if (!id_aktivitas) return;
    
    try {
      await dispatch(getAttendanceByActivity({ id_aktivitas })).unwrap();
    } catch (err) {
      console.error('Failed to fetch attendance:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  const handleRefresh = () => {
    setRefreshing(true);
    fetchAttendanceRecords();
  };
  
  const getPersonName = (record) => {
    if (record.absen_user?.anak) {
      return record.absen_user.anak.full_name || record.absen_user.anak.name || 'Unknown Student';
    }
    if (record.absen_user?.tutor) {
      return record.absen_user.tutor.nama || 'Unknown Tutor';
    }
    return 'Unknown Person';
  };
  
  const getPersonType = (record) => {
    return record.absen_user?.anak ? 'Student' : 'Tutor';
  };
  
  const filteredRecords = attendanceRecords.filter(record => {
    const personName = getPersonName(record);
    const matchesSearch = personName.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'verified') {
      matchesFilter = record.is_verified;
    } else if (filterStatus === 'pending') {
      matchesFilter = !record.is_verified && record.verification_status === 'pending';
    } else if (filterStatus === 'rejected') {
      matchesFilter = record.verification_status === 'rejected';
    }
    
    return matchesSearch && matchesFilter;
  });
  
  const getFilterCounts = () => {
    const verified = attendanceRecords.filter(r => r.is_verified).length;
    const pending = attendanceRecords.filter(r => !r.is_verified && r.verification_status === 'pending').length;
    const rejected = attendanceRecords.filter(r => r.verification_status === 'rejected').length;
    
    return { verified, pending, rejected, all: attendanceRecords.length };
  };
  
  const counts = getFilterCounts();
  
  const handleVerify = (id_absen) => {
    Alert.prompt(
      'Manual Verification',
      'Enter verification notes:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Verify',
          onPress: (notes) => {
            if (!notes) {
              Alert.alert('Error', 'Verification notes are required');
              return;
            }
            
            dispatch(manualVerify({ id_absen, notes }))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Attendance manually verified');
              })
              .catch((err) => {
                Alert.alert('Error', err.message || 'Failed to verify attendance');
              });
          }
        }
      ],
      'plain-text'
    );
  };
  
  const handleReject = (id_absen) => {
    Alert.prompt(
      'Reject Verification',
      'Enter reason for rejection:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Reject',
          onPress: (reason) => {
            if (!reason) {
              Alert.alert('Error', 'Rejection reason is required');
              return;
            }
            
            dispatch(rejectVerification({ id_absen, reason }))
              .unwrap()
              .then(() => {
                Alert.alert('Success', 'Attendance verification rejected');
              })
              .catch((err) => {
                Alert.alert('Error', err.message || 'Failed to reject verification');
              });
          }
        }
      ],
      'plain-text'
    );
  };
  
  const navigateToScanner = () => {
    navigation.navigate('QrScanner', {
      id_aktivitas,
      activityName,
      activityDate
    });
  };
  
  const navigateToManualEntry = () => {
    navigation.navigate('ManualAttendance', {
      id_aktivitas,
      activityName,
      activityDate
    });
  };
  
  const renderAttendanceCard = ({ item }) => (
    <View style={styles.attendanceCard}>
      <TouchableOpacity
        style={styles.cardHeader}
        onPress={() => setExpandedCardId(expandedCardId === item.id_absen ? null : item.id_absen)}
      >
        <View style={styles.personInfo}>
          <View style={styles.personDetails}>
            <Text style={styles.personName}>{getPersonName(item)}</Text>
            <Text style={styles.personType}>{getPersonType(item)}</Text>
          </View>
          
          <View style={styles.statusContainer}>
            <View style={[
              styles.attendanceStatus,
              { backgroundColor: item.absen === 'Ya' ? '#2ecc71' : item.absen === 'Terlambat' ? '#f39c12' : '#e74c3c' }
            ]}>
              <Text style={styles.attendanceStatusText}>
                {item.absen === 'Ya' ? 'Present' : item.absen === 'Terlambat' ? 'Late' : 'Absent'}
              </Text>
            </View>
            
            <View style={[
              styles.verificationStatus,
              { backgroundColor: item.is_verified ? '#27ae60' : item.verification_status === 'rejected' ? '#e74c3c' : '#f39c12' }
            ]}>
              <Text style={styles.verificationStatusText}>
                {item.is_verified ? 'Verified' : item.verification_status === 'rejected' ? 'Rejected' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>
        
        <Ionicons
          name={expandedCardId === item.id_absen ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#7f8c8d"
        />
      </TouchableOpacity>
      
      {expandedCardId === item.id_absen && (
        <View style={styles.cardContent}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Time Arrived:</Text>
            <Text style={styles.detailValue}>
              {item.time_arrived ? new Date(item.time_arrived).toLocaleTimeString() : 'Not recorded'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verification:</Text>
            <Text style={styles.detailValue}>{item.verification_status}</Text>
          </View>
          
          {!item.is_verified && item.verification_status === 'pending' && (
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.verifyButton]}
                onPress={() => handleVerify(item.id_absen)}
              >
                <Text style={styles.actionButtonText}>Verify</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleReject(item.id_absen)}
              >
                <Text style={styles.actionButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="calendar-outline" size={64} color="#bdc3c7" />
      <Text style={styles.emptyText}>No attendance records found</Text>
      <Text style={styles.emptySubText}>
        {searchQuery 
          ? 'Try changing your search or filters' 
          : 'Tap the + button to record attendance'}
      </Text>
    </View>
  );
  
  if (error && !refreshing) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message={error}
          onRetry={fetchAttendanceRecords}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.activityHeader}>
        <Text style={styles.activityName}>{activityName || 'Activity'}</Text>
        <Text style={styles.activityDate}>{activityDate || 'Date not specified'}</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search" size={20} color="#7f8c8d" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
        </View>
      </View>
      
      <View style={styles.filterTabs}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'all' && styles.activeFilterTab
          ]}
          onPress={() => setFilterStatus('all')}
        >
          <Text style={[
            styles.filterTabText,
            filterStatus === 'all' && styles.activeFilterTabText
          ]}>
            All ({counts.all})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'verified' && styles.activeFilterTab
          ]}
          onPress={() => setFilterStatus('verified')}
        >
          <Text style={[
            styles.filterTabText,
            filterStatus === 'verified' && styles.activeFilterTabText
          ]}>
            Verified ({counts.verified})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'pending' && styles.activeFilterTab
          ]}
          onPress={() => setFilterStatus('pending')}
        >
          <Text style={[
            styles.filterTabText,
            filterStatus === 'pending' && styles.activeFilterTabText
          ]}>
            Pending ({counts.pending})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterTab,
            filterStatus === 'rejected' && styles.activeFilterTab
          ]}
          onPress={() => setFilterStatus('rejected')}
        >
          <Text style={[
            styles.filterTabText,
            filterStatus === 'rejected' && styles.activeFilterTabText
          ]}>
            Rejected ({counts.rejected})
          </Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredRecords}
        renderItem={renderAttendanceCard}
        keyExtractor={item => item.id_absen.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#3498db']}
          />
        }
      />
      
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={[styles.fab, styles.secondaryFab]}
          onPress={navigateToManualEntry}
        >
          <Ionicons name="create" size={24} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.fab}
          onPress={navigateToScanner}
        >
          <Ionicons name="qr-code" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {loading && !refreshing && (
        <View style={styles.loadingOverlay}>
          <LoadingSpinner />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  activityHeader: {
    backgroundColor: '#3498db',
    padding: 16,
    alignItems: 'center',
  },
  activityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  activityDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
  },
  searchContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  filterTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  filterTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeFilterTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3498db',
  },
  filterTabText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  activeFilterTabText: {
    color: '#3498db',
    fontWeight: '500',
  },
  listContainer: {
    padding: 12,
    paddingBottom: 80,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  personInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  personType: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  attendanceStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  attendanceStatusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  verificationStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 120,
    fontSize: 14,
    color: '#7f8c8d',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  verifyButton: {
    backgroundColor: '#27ae60',
  },
  rejectButton: {
    backgroundColor: '#e74c3c',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#7f8c8d',
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 8,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  secondaryFab: {
    backgroundColor: '#9b59b6',
    marginRight: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AttendanceListScreen;