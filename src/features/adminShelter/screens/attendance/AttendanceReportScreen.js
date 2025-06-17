import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Share
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, subDays, parseISO } from 'date-fns';

// Components
import ErrorMessage from '../../../../common/components/ErrorMessage';
import AttendanceFilter from '../../components/AttendanceFilter';

// Utils
import AttendanceReportGenerator from '../../utils/attendanceReportGenerator';

/**
 * Attendance Report Screen
 * Generates and displays attendance reports
 */
const AttendanceReportScreen = ({ navigation, route }) => {
  // Get params if provided
  const { id_aktivitas, activityName, activityDate } = route.params || {};
  
  // Get attendance records from redux state
  const attendanceRecords = useSelector(state => {
    if (id_aktivitas) {
      return state.attendance.activityRecords[id_aktivitas] || [];
    }
    return Object.values(state.attendance.attendanceRecords);
  });
  
  // Local state
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: id_aktivitas ? null : subDays(new Date(), 7),
    dateTo: id_aktivitas ? null : new Date(),
    status: 'all',
    verification: 'all',
    groupBy: 'none' // 'none', 'student', 'activity'
  });
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  // Generate report when filters change or on initial load
  useEffect(() => {
    if (attendanceRecords.length > 0) {
      generateReport();
    }
  }, [attendanceRecords, filters]);
  
  // Apply filters to records
  const filteredRecords = attendanceRecords.filter(record => {
    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      const recordDate = record.aktivitas?.tanggal ? parseISO(record.aktivitas.tanggal) : null;
      
      if (recordDate) {
        if (filters.dateFrom && recordDate < filters.dateFrom) {
          return false;
        }
        if (filters.dateTo) {
          // Set end of day for dateTo
          const endOfDay = new Date(filters.dateTo);
          endOfDay.setHours(23, 59, 59);
          if (recordDate > endOfDay) {
            return false;
          }
        }
      }
    }
    
    // Filter by attendance status
    if (filters.status === 'present' && record.absen !== 'Ya') {
      return false;
    }
    if (filters.status === 'absent' && record.absen === 'Ya') {
      return false;
    }
    
    // Filter by verification status
    if (filters.verification === 'verified' && !record.is_verified) {
      return false;
    }
    if (filters.verification === 'pending' && (record.is_verified || record.verification_status === 'rejected')) {
      return false;
    }
    if (filters.verification === 'rejected' && record.verification_status !== 'rejected') {
      return false;
    }
    
    return true;
  });
  
  // Generate attendance report
  const generateReport = () => {
    setLoading(true);
    
    try {
      // Generate statistics
      const stats = AttendanceReportGenerator.generateStatistics(filteredRecords, {
        groupByStudent: filters.groupBy === 'student'
      });
      
      setReportData(stats);
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };
  
  // Export report as PDF
  const exportPdf = async () => {
    setLoading(true);
    
    try {
      // Generate PDF
      const pdfBlob = await AttendanceReportGenerator.generatePdfReport(
        filteredRecords,
        reportData,
        {
          title: 'Attendance Report',
          activityName: activityName || 'All Activities',
          activityDate: activityDate || null,
          startDate: filters.dateFrom,
          endDate: filters.dateTo,
          includeRecords: true
        }
      );
      
      // Save PDF to temporary file
      const fileName = `attendance_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, pdfBlob, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      // Share PDF
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(fileUri);
      } else {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Share Attendance Report'
        });
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Failed to export report as PDF');
    } finally {
      setLoading(false);
    }
  };
  
  // Export report as CSV
  const exportCsv = async () => {
    setLoading(true);
    
    try {
      // Generate CSV
      const csvData = AttendanceReportGenerator.generateCsvData(filteredRecords);
      
      // Save CSV to temporary file
      const fileName = `attendance_report_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvData);
      
      // Share CSV
      if (Platform.OS === 'ios') {
        await Sharing.shareAsync(fileUri);
      } else {
        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Share Attendance Report'
        });
      }
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Failed to export report as CSV');
    } finally {
      setLoading(false);
    }
  };
  
  // Apply filters
  const applyFilters = (newFilters) => {
    setFilters(newFilters);
  };
  
  // Reset filters
  const resetFilters = () => {
    setFilters({
      dateFrom: id_aktivitas ? null : subDays(new Date(), 7),
      dateTo: id_aktivitas ? null : new Date(),
      status: 'all',
      verification: 'all',
      groupBy: 'none'
    });
  };
  
  // Format date for display
  const formatDate = (date) => {
    if (!date) return 'Not set';
    return format(date, 'dd MMM yyyy');
  };
  
  // Handle date changes
  const handleDateChange = (event, selectedDate, field) => {
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    
    if (selectedDate) {
      setFilters(prev => ({
        ...prev,
        [field]: selectedDate
      }));
    }
  };
  
  // Format percentage
  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <View style={styles.container}>
      {/* Report Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Report</Text>
        {activityName && (
          <Text style={styles.headerSubtitle}>{activityName}</Text>
        )}
        {activityDate && (
          <Text style={styles.headerDate}>{activityDate}</Text>
        )}
        
        {/* Filter Options */}
        <View style={styles.filterContainer}>
          {!id_aktivitas && (
            <View style={styles.dateFilterContainer}>
              <View style={styles.dateFilter}>
                <Text style={styles.dateLabel}>From:</Text>
                <TouchableOpacity 
                  style={styles.datePicker}
                  onPress={() => setShowFromDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {filters.dateFrom ? formatDate(filters.dateFrom) : 'Not set'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#3498db" />
                </TouchableOpacity>
                
                {showFromDatePicker && (
                  <DateTimePicker
                    value={filters.dateFrom || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateFrom')}
                  />
                )}
              </View>
              
              <View style={styles.dateFilter}>
                <Text style={styles.dateLabel}>To:</Text>
                <TouchableOpacity 
                  style={styles.datePicker}
                  onPress={() => setShowToDatePicker(true)}
                >
                  <Text style={styles.dateText}>
                    {filters.dateTo ? formatDate(filters.dateTo) : 'Not set'}
                  </Text>
                  <Ionicons name="calendar" size={20} color="#3498db" />
                </TouchableOpacity>
                
                {showToDatePicker && (
                  <DateTimePicker
                    value={filters.dateTo || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => handleDateChange(event, date, 'dateTo')}
                  />
                )}
              </View>
            </View>
          )}
          
          <View style={styles.filterButtonsContainer}>
            {/* Attendance Filter Component */}
            <AttendanceFilter
              filters={filters}
              onApplyFilters={applyFilters}
              onResetFilters={resetFilters}
            />
            
            {/* Group By Dropdown */}
            <TouchableOpacity
              style={styles.groupByButton}
              onPress={() => {
                Alert.alert(
                  'Group By',
                  'Select grouping option',
                  [
                    { text: 'None', onPress: () => setFilters(prev => ({ ...prev, groupBy: 'none' })) },
                    { text: 'Student', onPress: () => setFilters(prev => ({ ...prev, groupBy: 'student' })) },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }}
            >
              <Ionicons name="grid" size={20} color="#fff" />
              <Text style={styles.groupByButtonText}>
                Group: {filters.groupBy === 'none' ? 'None' : 
                        filters.groupBy === 'student' ? 'Student' : 
                        filters.groupBy}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {/* Report Content */}
      <ScrollView style={styles.reportContent}>
        {/* Error when no data */}
        {filteredRecords.length === 0 ? (
          <ErrorMessage
            message="No attendance records found for the selected filters"
            onRetry={resetFilters}
            retryText="Reset Filters"
          />
        ) : (
          <>
            {/* Stats Summary */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Attendance Summary</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{reportData?.total || 0}</Text>
                  <Text style={styles.statLabel}>Total Records</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#2ecc71' }]}>
                    {reportData?.present || 0}
                  </Text>
                  <Text style={styles.statLabel}>Present</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#e74c3c' }]}>
                    {reportData?.absent || 0}
                  </Text>
                  <Text style={styles.statLabel}>Absent</Text>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <Text style={styles.progressLabel}>
                  Attendance Rate: {formatPercentage(reportData?.attendanceRate || 0)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { width: `${reportData?.attendanceRate || 0}%` }
                    ]}
                  />
                </View>
              </View>
            </View>
            
            {/* Verification Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.cardTitle}>Verification Summary</Text>
              
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#2ecc71' }]}>
                    {reportData?.verified || 0}
                  </Text>
                  <Text style={styles.statLabel}>Verified</Text>
                </View>
                
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#e74c3c' }]}>
                    {reportData?.unverified || 0}
                  </Text>
                  <Text style={styles.statLabel}>Unverified</Text>
                </View>
              </View>
              
              <View style={styles.progressBarContainer}>
                <Text style={styles.progressLabel}>
                  Verification Rate: {formatPercentage(reportData?.verificationRate || 0)}
                </Text>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill,
                      { 
                        width: `${reportData?.verificationRate || 0}%`,
                        backgroundColor: '#3498db'
                      }
                    ]}
                  />
                </View>
              </View>
              
              {/* Verification Methods */}
              {reportData?.verificationMethods && Object.keys(reportData.verificationMethods).length > 0 && (
                <View style={styles.methodsContainer}>
                  <Text style={styles.subSectionTitle}>Verification Methods</Text>
                  
                  {Object.entries(reportData.verificationMethods).map(([method, count]) => {
                    const percentage = ((count / reportData.total) * 100);
                    let displayMethod = method;
                    let iconName;
                    
                    // Format method name for display
                    if (method === 'qr_code') {
                      displayMethod = 'QR Code';
                      iconName = 'qr-code';
                    } else if (method === 'face_recognition') {
                      displayMethod = 'Face Recognition';
                      iconName = 'person';
                    } else if (method === 'dual') {
                      displayMethod = 'Dual Verification';
                      iconName = 'shield-checkmark';
                    } else if (method === 'manual') {
                      displayMethod = 'Manual Verification';
                      iconName = 'create';
                    }
                    
                    return (
                      <View key={method} style={styles.methodItem}>
                        <View style={styles.methodInfo}>
                          <Ionicons name={iconName || 'checkmark-circle'} size={18} color="#3498db" />
                          <Text style={styles.methodName}>{displayMethod}</Text>
                          <Text style={styles.methodCount}>{count}</Text>
                        </View>
                        
                        <View style={styles.methodBar}>
                          <View 
                            style={[
                              styles.methodFill,
                              { width: `${percentage}%` }
                            ]}
                          />
                          <Text style={styles.methodPercentage}>
                            {formatPercentage(percentage)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
            
            {/* Student Stats if grouped by student */}
            {filters.groupBy === 'student' && reportData?.studentStats && reportData.studentStats.length > 0 && (
              <View style={styles.statsCard}>
                <Text style={styles.cardTitle}>Student Attendance</Text>
                
                {reportData.studentStats.map(student => (
                  <View key={student.id} style={styles.studentItem}>
                    <View style={styles.studentHeader}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentRate}>
                        {formatPercentage(student.rate)}
                      </Text>
                    </View>
                    
                    <View style={styles.studentProgressBar}>
                      <View 
                        style={[
                          styles.studentProgressFill,
                          { width: `${student.rate}%` }
                        ]}
                      />
                    </View>
                    
                    <View style={styles.studentStats}>
                      <Text style={styles.studentStat}>
                        Total: <Text style={styles.studentStatValue}>{student.total}</Text>
                      </Text>
                      <Text style={styles.studentStat}>
                        Present: <Text style={[styles.studentStatValue, { color: '#2ecc71' }]}>{student.present}</Text>
                      </Text>
                      <Text style={styles.studentStat}>
                        Absent: <Text style={[styles.studentStatValue, { color: '#e74c3c' }]}>{student.absent}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {/* Export Options */}
            <View style={styles.exportContainer}>
              <Text style={styles.exportTitle}>Export Report</Text>
              
              <View style={styles.exportButtons}>
                <TouchableOpacity
                  style={[styles.exportButton, styles.pdfButton]}
                  onPress={exportPdf}
                  disabled={loading}
                >
                  <Ionicons name="document-text" size={20} color="#fff" />
                  <Text style={styles.exportButtonText}>Export as PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.exportButton, styles.csvButton]}
                  onPress={exportCsv}
                  disabled={loading}
                >
                  <Ionicons name="grid" size={20} color="#fff" />
                  <Text style={styles.exportButtonText}>Export as CSV</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Generating report...</Text>
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
  header: {
    backgroundColor: '#3498db',
    padding: 16,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  headerDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginTop: 2,
  },
  filterContainer: {
    marginTop: 16,
  },
  dateFilterContainer: {
    marginBottom: 12,
  },
  dateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateLabel: {
    width: 45,
    color: '#fff',
    fontSize: 14,
  },
  datePicker: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 4,
    padding: 8,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
  },
  filterButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groupByButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  groupByButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  reportContent: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#34495e',
  },
  statLabel: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 4,
  },
  progressBarContainer: {
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 6,
  },
  progressBar: {
    height: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2ecc71',
    borderRadius: 6,
  },
  methodsContainer: {
    marginTop: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 12,
  },
  methodItem: {
    marginBottom: 10,
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  methodName: {
    fontSize: 14,
    color: '#34495e',
    flex: 1,
    marginLeft: 8,
  },
  methodCount: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
  },
  methodBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  methodFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  methodPercentage: {
    position: 'absolute',
    right: 4,
    top: -5,
    fontSize: 10,
    color: '#7f8c8d',
  },
  studentItem: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
    paddingBottom: 8,
  },
  studentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#34495e',
  },
  studentRate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  studentProgressBar: {
    height: 8,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  studentProgressFill: {
    height: '100%',
    backgroundColor: '#3498db',
    borderRadius: 4,
  },
  studentStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  studentStat: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  studentStatValue: {
    fontWeight: '500',
    color: '#34495e',
  },
  exportContainer: {
    marginTop: 8,
    marginBottom: 24,
  },
  exportTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#34495e',
    marginBottom: 12,
  },
  exportButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  pdfButton: {
    backgroundColor: '#e74c3c',
  },
  csvButton: {
    backgroundColor: '#27ae60',
  },
  exportButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#3498db',
  },
});

export default AttendanceReportScreen;