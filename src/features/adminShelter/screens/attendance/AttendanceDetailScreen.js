import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

import VerificationStatusBadge from '../../components/VerificationStatusBadge';
import ErrorMessage from '../../../../common/components/ErrorMessage';

import { formatDateToIndonesian } from '../../../../common/utils/dateFormatter';
import AttendanceReportGenerator from '../../utils/attendanceReportGenerator';

const AttendanceDetailScreen = ({ navigation }) => {
  const route = useRoute();
  const { id_absen } = route.params || {};
  
  const attendanceRecord = useSelector(state => 
    state.attendance.attendanceRecords[id_absen] || null
  );
  
  const verificationHistory = useSelector(state =>
    state.attendance.verificationHistory[id_absen] || []
  );
  
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState('details');
  
  if (!attendanceRecord) {
    return (
      <View style={styles.container}>
        <ErrorMessage
          message="Attendance record not found"
          onRetry={() => navigation.goBack()}
          retryText="Go Back"
        />
      </View>
    );
  }
  
  const {
    absen,
    is_verified,
    verification_status,
    absen_user,
    aktivitas,
    latest_verification
  } = attendanceRecord;
  
  const person = absen_user?.anak || absen_user?.tutor || {};
  const personType = absen_user?.anak ? 'Student' : 'Tutor';
  const personName = absen_user?.anak ? 
    (person.full_name || person.name || 'Unknown Student') : 
    (person.nama || 'Unknown Tutor');
  const personId = absen_user?.anak ? person.id_anak : person.id_tutor;
  const activity = aktivitas || {};
  
  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  const shareAttendance = async () => {
    try {
      await Share.share({
        message: `Attendance record for ${personName}\n` +
                 `Type: ${personType}\n` +
                 `Status: ${absen === 'Ya' ? 'Present' : 'Absent'}\n` +
                 `Activity: ${activity.jenis_kegiatan || 'Activity'}\n` +
                 `Date: ${formatDateToIndonesian(activity.tanggal) || 'N/A'}\n` +
                 `Verification: ${is_verified ? 'Verified' : 'Not Verified'}`
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share attendance record');
    }
  };
  
  const getVerificationMethodText = (method) => {
    switch (method) {
      case 'qr_code':
        return 'QR Code';
      case 'manual':
        return 'Manual Verification';
      case 'face_recognition':
        return 'Face Recognition';
      case 'dual':
        return 'QR + Face Recognition';
      default:
        return method || 'Unknown';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{personName}</Text>
          <Text style={styles.personType}>{personType}</Text>
          <Text style={styles.activityName}>{activity.jenis_kegiatan || 'Activity'}</Text>
          <Text style={styles.activityDate}>{formatDateToIndonesian(activity.tanggal) || 'Date not available'}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.attendanceStatus,
            { backgroundColor: absen === 'Ya' ? '#2ecc71' : '#e74c3c' }
          ]}>
            <Text style={styles.attendanceStatusText}>
              {absen === 'Ya' ? 'Present' : 'Absent'}
            </Text>
          </View>
          
          <View style={styles.verificationStatus}>
            <VerificationStatusBadge
              isVerified={is_verified}
              status={verification_status}
              method={latest_verification?.verification_method}
              showMethod={true}
            />
          </View>
        </View>
      </View>
      
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          expandedSection === 'details' && styles.activeSectionHeader
        ]}
        onPress={() => toggleSection('details')}
      >
        <Text style={styles.sectionTitle}>Attendance Details</Text>
        <Ionicons
          name={expandedSection === 'details' ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#333"
        />
      </TouchableOpacity>
      
      {expandedSection === 'details' && (
        <View style={styles.sectionContent}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Record ID:</Text>
            <Text style={styles.detailValue}>{id_absen}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>{personType} ID:</Text>
            <Text style={styles.detailValue}>{personId || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Activity ID:</Text>
            <Text style={styles.detailValue}>{activity.id_aktivitas || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Activity Type:</Text>
            <Text style={styles.detailValue}>{activity.jenis_kegiatan || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date:</Text>
            <Text style={styles.detailValue}>{formatDateToIndonesian(activity.tanggal) || 'N/A'}</Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Status:</Text>
            <Text style={[
              styles.detailValue,
              { 
                color: absen === 'Ya' ? '#2ecc71' : '#e74c3c',
                fontWeight: 'bold'
              }
            ]}>
              {absen === 'Ya' ? 'Present' : 'Absent'}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Verification Status:</Text>
            <Text style={[
              styles.detailValue,
              { 
                color: is_verified ? '#2ecc71' : 
                      verification_status === 'rejected' ? '#e74c3c' : '#f39c12',
                fontWeight: 'bold'
              }
            ]}>
              {is_verified ? 
                (verification_status === 'manual' ? 'Manually Verified' : 'Verified') : 
                verification_status === 'rejected' ? 'Rejected' : 'Pending Verification'}
            </Text>
          </View>
        </View>
      )}
      
      <TouchableOpacity
        style={[
          styles.sectionHeader,
          expandedSection === 'verification' && styles.activeSectionHeader
        ]}
        onPress={() => toggleSection('verification')}
      >
        <Text style={styles.sectionTitle}>Verification History</Text>
        <Ionicons
          name={expandedSection === 'verification' ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="#333"
        />
      </TouchableOpacity>
      
      {expandedSection === 'verification' && (
        <View style={styles.sectionContent}>
          {verificationHistory.length > 0 ? (
            verificationHistory.map((verification, index) => (
              <View key={index} style={styles.verificationItem}>
                <View style={styles.verificationHeader}>
                  <View style={styles.verificationMethod}>
                    <Ionicons 
                      name={
                        verification.verification_method === 'qr_code' ? 'qr-code' :
                        verification.verification_method === 'manual' ? 'create' :
                        verification.verification_method === 'face_recognition' ? 'person' :
                        'shield-checkmark'
                      } 
                      size={18} 
                      color="#fff" 
                    />
                    <Text style={styles.verificationMethodText}>
                      {getVerificationMethodText(verification.verification_method)}
                    </Text>
                  </View>
                  
                  <Text style={styles.verificationDate}>
                    {formatDateToIndonesian(verification.verified_at)}
                  </Text>
                </View>
                
                <View style={styles.verificationBody}>
                  <Text style={styles.verificationStatus}>
                    Status: <Text style={{ 
                      color: verification.is_verified ? '#2ecc71' : '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      {verification.is_verified ? 'Verified' : 'Rejected'}
                    </Text>
                  </Text>
                  
                  <Text style={styles.verificationNotes}>
                    Notes: {verification.verification_notes || 'No notes provided'}
                  </Text>
                  
                  <Text style={styles.verificationPerson}>
                    Verified by: {verification.verified_by || 'System'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No verification history available</Text>
          )}
        </View>
      )}
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.shareButton]}
          onPress={shareAttendance}
        >
          <Ionicons name="share-outline" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#fff" />
          <Text style={styles.actionButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
      
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    backgroundColor: '#fff',
    padding: 16,
    margin: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  personInfo: {
    marginBottom: 12,
  },
  personName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  personType: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  attendanceStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#2ecc71',
  },
  attendanceStatusText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  verificationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  activeSectionHeader: {
    backgroundColor: '#ecf0f1',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  sectionContent: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  detailLabel: {
    width: 140,
    fontSize: 14,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 14,
    color: '#2c3e50',
  },
  verificationItem: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    overflow: 'hidden',
  },
  verificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#3498db',
  },
  verificationMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  verificationMethodText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '500',
  },
  verificationDate: {
    color: '#fff',
    fontSize: 12,
  },
  verificationBody: {
    padding: 12,
    backgroundColor: '#f9f9f9',
  },
  verificationStatus: {
    fontSize: 14,
    marginBottom: 4,
  },
  verificationNotes: {
    fontSize: 14,
    marginBottom: 4,
  },
  verificationPerson: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  noDataText: {
    textAlign: 'center',
    padding: 20,
    color: '#7f8c8d',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498db',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  shareButton: {
    backgroundColor: '#9b59b6',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AttendanceDetailScreen;