import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
  ActivityIndicator, Platform, Share
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, subDays, parseISO } from 'date-fns';

import ErrorMessage from '../../../../common/components/ErrorMessage';
import AttendanceFilter from '../../components/AttendanceFilter';
import AttendanceReportGenerator from '../../utils/attendanceReportGenerator';

const AttendanceReportScreen = ({ navigation, route }) => {
  const { id_aktivitas, activityName, activityDate } = route.params || {};
  
  const attendanceRecords = useSelector(state => {
    if (id_aktivitas) return state.attendance.activityRecords[id_aktivitas] || [];
    return Object.values(state.attendance.attendanceRecords);
  });
  
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: id_aktivitas ? null : subDays(new Date(), 7),
    dateTo: id_aktivitas ? null : new Date(),
    status: 'all', verification: 'all', groupBy: 'none'
  });
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  
  useEffect(() => {
    if (attendanceRecords.length > 0) generateReport();
  }, [attendanceRecords, filters]);
  
  const filteredRecords = attendanceRecords.filter(record => {
    if (filters.dateFrom || filters.dateTo) {
      const recordDate = record.aktivitas?.tanggal ? parseISO(record.aktivitas.tanggal) : null;
      if (recordDate) {
        if (filters.dateFrom && recordDate < filters.dateFrom) return false;
        if (filters.dateTo) {
          const endOfDay = new Date(filters.dateTo);
          endOfDay.setHours(23, 59, 59);
          if (recordDate > endOfDay) return false;
        }
      }
    }
    
    if (filters.status === 'present' && record.absen !== 'Ya') return false;
    if (filters.status === 'absent' && record.absen === 'Ya') return false;
    if (filters.verification === 'verified' && !record.is_verified) return false;
    if (filters.verification === 'pending' && (record.is_verified || record.verification_status === 'rejected')) return false;
    if (filters.verification === 'rejected' && record.verification_status !== 'rejected') return false;
    
    return true;
  });
  
  const generateReport = () => {
    setLoading(true);
    try {
      const stats = AttendanceReportGenerator.generateStatistics(filteredRecords, {
        groupByStudent: filters.groupBy === 'student'
      });
      setReportData(stats);
    } catch (error) {
      console.error('Error generating report:', error);
      Alert.alert('Error', 'Gagal membuat laporan');
    } finally {
      setLoading(false);
    }
  };
  
  const exportPdf = async () => {
    setLoading(true);
    try {
      const pdfBlob = await AttendanceReportGenerator.generatePdfReport(
        filteredRecords, reportData, {
          title: 'Laporan Kehadiran',
          activityName: activityName || 'Semua Aktivitas',
          activityDate: activityDate || null,
          startDate: filters.dateFrom, endDate: filters.dateTo,
          includeRecords: true
        }
      );
      
      const fileName = `laporan_kehadiran_${format(new Date(), 'yyyyMMdd_HHmmss')}.pdf`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, pdfBlob, {
        encoding: FileSystem.EncodingType.Base64
      });
      
      Platform.OS === 'ios' 
        ? await Sharing.shareAsync(fileUri)
        : await Sharing.shareAsync(fileUri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Bagikan Laporan Kehadiran'
          });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      Alert.alert('Error', 'Gagal mengekspor laporan sebagai PDF');
    } finally {
      setLoading(false);
    }
  };
  
  const exportCsv = async () => {
    setLoading(true);
    try {
      const csvData = AttendanceReportGenerator.generateCsvData(filteredRecords);
      const fileName = `laporan_kehadiran_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`;
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvData);
      
      Platform.OS === 'ios' 
        ? await Sharing.shareAsync(fileUri)
        : await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Bagikan Laporan Kehadiran'
          });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      Alert.alert('Error', 'Gagal mengekspor laporan sebagai CSV');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (date) => !date ? 'Tidak diset' : format(date, 'dd MMM yyyy');
  const formatPercentage = (value) => `${value.toFixed(1)}%`;
  
  const handleDateChange = (event, selectedDate, field) => {
    setShowFromDatePicker(false);
    setShowToDatePicker(false);
    if (selectedDate) {
      setFilters(prev => ({ ...prev, [field]: selectedDate }));
    }
  };
  
  const getVerificationMethodText = (method) => ({
    'qr_code': 'Kode QR',
    'manual': 'Verifikasi Manual',
    'face_recognition': 'Pengenalan Wajah',
    'dual': 'Verifikasi Ganda'
  }[method] || method || 'Tidak Diketahui');
  
  const getMethodIcon = (method) => ({
    'qr_code': 'qr-code',
    'face_recognition': 'person',
    'dual': 'shield-checkmark',
    'manual': 'create'
  }[method] || 'checkmark-circle');

  const StatCard = ({ title, children }) => (
    <View style={styles.statsCard}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );

  const StatRow = ({ stats }) => (
    <View style={styles.statsRow}>
      <StatItem value={stats?.total || 0} label="Total Catatan" />
      <StatItem value={stats?.present || 0} label="Hadir" color="#2ecc71" />
      <StatItem value={stats?.absent || 0} label="Tidak Hadir" color="#e74c3c" />
    </View>
  );

  const StatItem = ({ value, label, color = '#34495e' }) => (
    <View style={styles.statItem}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  const ProgressBar = ({ label, percentage, color = '#2ecc71' }) => (
    <View style={styles.progressBarContainer}>
      <Text style={styles.progressLabel}>{label}: {formatPercentage(percentage)}</Text>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );

  const DateFilter = ({ label, value, onPress }) => (
    <View style={styles.dateFilter}>
      <Text style={styles.dateLabel}>{label}:</Text>
      <TouchableOpacity style={styles.datePicker} onPress={onPress}>
        <Text style={styles.dateText}>{formatDate(value)}</Text>
        <Ionicons name="calendar" size={20} color="#3498db" />
      </TouchableOpacity>
    </View>
  );

  const ExportButton = ({ onPress, icon, text, style, disabled }) => (
    <TouchableOpacity
      style={[styles.exportButton, style]}
      onPress={onPress}
      disabled={disabled}
    >
      <Ionicons name={icon} size={20} color="#fff" />
      <Text style={styles.exportButtonText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Laporan Kehadiran</Text>
        {activityName && <Text style={styles.headerSubtitle}>{activityName}</Text>}
        {activityDate && <Text style={styles.headerDate}>{activityDate}</Text>}
        
        <View style={styles.filterContainer}>
          {!id_aktivitas && (
            <View style={styles.dateFilterContainer}>
              <DateFilter
                label="Dari"
                value={filters.dateFrom}
                onPress={() => setShowFromDatePicker(true)}
              />
              <DateFilter
                label="Sampai"
                value={filters.dateTo}
                onPress={() => setShowToDatePicker(true)}
              />
              
              {showFromDatePicker && (
                <DateTimePicker
                  value={filters.dateFrom || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => handleDateChange(event, date, 'dateFrom')}
                />
              )}
              
              {showToDatePicker && (
                <DateTimePicker
                  value={filters.dateTo || new Date()}
                  mode="date"
                  display="default"
                  onChange={(event, date) => handleDateChange(event, date, 'dateTo')}
                />
              )}
            </View>
          )}
          
          <View style={styles.filterButtonsContainer}>
            <AttendanceFilter
              filters={filters}
              onApplyFilters={setFilters}
              onResetFilters={() => setFilters({
                dateFrom: id_aktivitas ? null : subDays(new Date(), 7),
                dateTo: id_aktivitas ? null : new Date(),
                status: 'all', verification: 'all', groupBy: 'none'
              })}
            />
            
            <TouchableOpacity
              style={styles.groupByButton}
              onPress={() => {
                Alert.alert('Kelompokkan Berdasarkan', 'Pilih opsi pengelompokan', [
                  { text: 'Tidak Ada', onPress: () => setFilters(prev => ({ ...prev, groupBy: 'none' })) },
                  { text: 'Siswa', onPress: () => setFilters(prev => ({ ...prev, groupBy: 'student' })) },
                  { text: 'Batal', style: 'cancel' }
                ]);
              }}
            >
              <Ionicons name="grid" size={20} color="#fff" />
              <Text style={styles.groupByButtonText}>
                Kelompok: {filters.groupBy === 'none' ? 'Tidak Ada' : 
                          filters.groupBy === 'student' ? 'Siswa' : filters.groupBy}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <ScrollView style={styles.reportContent}>
        {filteredRecords.length === 0 ? (
          <ErrorMessage
            message="Tidak ada catatan kehadiran ditemukan untuk filter yang dipilih"
            onRetry={() => setFilters({
              dateFrom: id_aktivitas ? null : subDays(new Date(), 7),
              dateTo: id_aktivitas ? null : new Date(),
              status: 'all', verification: 'all', groupBy: 'none'
            })}
            retryText="Reset Filter"
          />
        ) : (
          <>
            <StatCard title="Ringkasan Kehadiran">
              <StatRow stats={reportData} />
              <ProgressBar 
                label="Tingkat Kehadiran" 
                percentage={reportData?.attendanceRate || 0} 
              />
            </StatCard>
            
            <StatCard title="Ringkasan Verifikasi">
              <View style={styles.statsRow}>
                <StatItem value={reportData?.verified || 0} label="Terverifikasi" color="#2ecc71" />
                <StatItem value={reportData?.unverified || 0} label="Belum Verifikasi" color="#e74c3c" />
              </View>
              <ProgressBar 
                label="Tingkat Verifikasi" 
                percentage={reportData?.verificationRate || 0} 
                color="#3498db"
              />
              
              {reportData?.verificationMethods && Object.keys(reportData.verificationMethods).length > 0 && (
                <View style={styles.methodsContainer}>
                  <Text style={styles.subSectionTitle}>Metode Verifikasi</Text>
                  {Object.entries(reportData.verificationMethods).map(([method, count]) => {
                    const percentage = ((count / reportData.total) * 100);
                    return (
                      <View key={method} style={styles.methodItem}>
                        <View style={styles.methodInfo}>
                          <Ionicons name={getMethodIcon(method)} size={18} color="#3498db" />
                          <Text style={styles.methodName}>{getVerificationMethodText(method)}</Text>
                          <Text style={styles.methodCount}>{count}</Text>
                        </View>
                        <View style={styles.methodBar}>
                          <View style={[styles.methodFill, { width: `${percentage}%` }]} />
                          <Text style={styles.methodPercentage}>{formatPercentage(percentage)}</Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </StatCard>
            
            {filters.groupBy === 'student' && reportData?.studentStats?.length > 0 && (
              <StatCard title="Kehadiran Siswa">
                {reportData.studentStats.map(student => (
                  <View key={student.id} style={styles.studentItem}>
                    <View style={styles.studentHeader}>
                      <Text style={styles.studentName}>{student.name}</Text>
                      <Text style={styles.studentRate}>{formatPercentage(student.rate)}</Text>
                    </View>
                    <View style={styles.studentProgressBar}>
                      <View style={[styles.studentProgressFill, { width: `${student.rate}%` }]} />
                    </View>
                    <View style={styles.studentStats}>
                      <Text style={styles.studentStat}>
                        Total: <Text style={styles.studentStatValue}>{student.total}</Text>
                      </Text>
                      <Text style={styles.studentStat}>
                        Hadir: <Text style={[styles.studentStatValue, { color: '#2ecc71' }]}>{student.present}</Text>
                      </Text>
                      <Text style={styles.studentStat}>
                        Tidak Hadir: <Text style={[styles.studentStatValue, { color: '#e74c3c' }]}>{student.absent}</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </StatCard>
            )}
            
            <View style={styles.exportContainer}>
              <Text style={styles.exportTitle}>Ekspor Laporan</Text>
              <View style={styles.exportButtons}>
                <ExportButton
                  onPress={exportPdf}
                  icon="document-text"
                  text="Ekspor sebagai PDF"
                  style={styles.pdfButton}
                  disabled={loading}
                />
                <ExportButton
                  onPress={exportCsv}
                  icon="grid"
                  text="Ekspor sebagai CSV"
                  style={styles.csvButton}
                  disabled={loading}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Membuat laporan...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#3498db', padding: 16, paddingTop: 20 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: '#fff', textAlign: 'center', marginTop: 4 },
  headerDate: { fontSize: 14, color: 'rgba(255, 255, 255, 0.8)', textAlign: 'center', marginTop: 2 },
  filterContainer: { marginTop: 16 },
  dateFilterContainer: { marginBottom: 12 },
  dateFilter: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateLabel: { width: 55, color: '#fff', fontSize: 14 },
  datePicker: {
    flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 4,
    padding: 8, justifyContent: 'space-between', alignItems: 'center'
  },
  dateText: { fontSize: 14, color: '#333' },
  filterButtonsContainer: { flexDirection: 'row', justifyContent: 'space-between' },
  groupByButton: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2c3e50',
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20
  },
  groupByButtonText: { color: '#fff', marginLeft: 6, fontWeight: '500' },
  reportContent: { flex: 1, padding: 16 },
  statsCard: {
    backgroundColor: '#fff', borderRadius: 8, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50', marginBottom: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#34495e' },
  statLabel: { fontSize: 12, color: '#7f8c8d', marginTop: 4 },
  progressBarContainer: { marginTop: 8 },
  progressLabel: { fontSize: 14, color: '#7f8c8d', marginBottom: 6 },
  progressBar: { height: 12, backgroundColor: '#ecf0f1', borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#2ecc71', borderRadius: 6 },
  methodsContainer: { marginTop: 16 },
  subSectionTitle: { fontSize: 16, fontWeight: '500', color: '#34495e', marginBottom: 12 },
  methodItem: { marginBottom: 10 },
  methodInfo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  methodName: { fontSize: 14, color: '#34495e', flex: 1, marginLeft: 8 },
  methodCount: { fontSize: 14, fontWeight: '500', color: '#34495e' },
  methodBar: { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  methodFill: { height: '100%', backgroundColor: '#3498db', borderRadius: 4 },
  methodPercentage: { position: 'absolute', right: 4, top: -5, fontSize: 10, color: '#7f8c8d' },
  studentItem: {
    marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#ecf0f1', paddingBottom: 8
  },
  studentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  studentName: { fontSize: 14, fontWeight: '500', color: '#34495e' },
  studentRate: { fontSize: 14, fontWeight: 'bold', color: '#3498db' },
  studentProgressBar: { height: 8, backgroundColor: '#ecf0f1', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  studentProgressFill: { height: '100%', backgroundColor: '#3498db', borderRadius: 4 },
  studentStats: { flexDirection: 'row', justifyContent: 'space-between' },
  studentStat: { fontSize: 12, color: '#7f8c8d' },
  studentStatValue: { fontWeight: '500', color: '#34495e' },
  exportContainer: { marginTop: 8, marginBottom: 24 },
  exportTitle: { fontSize: 16, fontWeight: '500', color: '#34495e', marginBottom: 12 },
  exportButtons: { flexDirection: 'row', justifyContent: 'space-between' },
  exportButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, borderRadius: 8, flex: 1, marginHorizontal: 4
  },
  pdfButton: { backgroundColor: '#e74c3c' },
  csvButton: { backgroundColor: '#27ae60' },
  exportButtonText: { color: '#fff', fontWeight: '500', marginLeft: 8 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center', alignItems: 'center'
  },
  loadingText: { marginTop: 12, fontSize: 16, color: '#3498db' }
});

export default AttendanceReportScreen;