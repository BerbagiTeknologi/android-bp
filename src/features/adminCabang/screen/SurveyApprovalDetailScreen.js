import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, 
  TextInput, Alert, Modal
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import LoadingSpinner from '../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../common/components/ErrorMessage';
import { adminCabangSurveyApi } from '../api/adminCabangSurveyApi';

const SurveyApprovalDetailScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { surveyId } = route.params;
  
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState('');
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchSurveyDetail = async () => {
    try {
      setError(null);
      const response = await adminCabangSurveyApi.getSurveyDetail(surveyId);
      setSurvey(response.data.data);
    } catch (err) {
      setError('Failed to load survey details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveyDetail();
  }, [surveyId]);

  const showApprovalModal = (type) => {
    setActionType(type);
    setModalVisible(true);
    setNotes('');
    setRejectionReason('');
  };

  const handleApproval = async () => {
    if (actionType === 'reject' && !rejectionReason.trim()) {
      Alert.alert('Error', 'Rejection reason is required');
      return;
    }

    setActionLoading(true);
    try {
      const data = { approval_notes: notes };
      if (actionType === 'reject') data.rejection_reason = rejectionReason;

      await adminCabangSurveyApi[actionType === 'approve' ? 'approveSurvey' : 'rejectSurvey'](surveyId, data);
      
      Alert.alert('Success', `Survey ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setModalVisible(false);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to process survey');
    } finally {
      setActionLoading(false);
    }
  };

  const renderInfoSection = (title, data) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {Object.entries(data).map(([key, value]) => (
          <View key={key} style={styles.infoRow}>
            <Text style={styles.infoLabel}>{key}:</Text>
            <Text style={styles.infoValue}>{value || '-'}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  if (loading) return <LoadingSpinner fullScreen message="Loading survey details..." />;

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorMessage message={error} onRetry={fetchSurveyDetail} />
      </View>
    );
  }

  const { keluarga } = survey;
  const anak = keluarga?.anak?.[0];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderInfoSection('Family Information', {
          'Family Head': keluarga?.kepala_keluarga,
          'KK Number': keluarga?.no_kk,
          'Phone': keluarga?.no_telp,
          'Shelter': keluarga?.shelter?.nama_shelter,
          'Wilbin': keluarga?.shelter?.wilbin?.nama_wilbin
        })}

        {anak && renderInfoSection('Child Information', {
          'Full Name': anak.full_name,
          'Nickname': anak.nick_name,
          'Birth Date': new Date(anak.tanggal_lahir).toLocaleDateString(),
          'Current Status': anak.status_cpb
        })}

        {keluarga?.ayah && renderInfoSection('Father Information', {
          'Name': keluarga.ayah.nama_ayah,
          'NIK': keluarga.ayah.nik_ayah,
          'Birth Place': keluarga.ayah.tempat_lahir,
          'Income': keluarga.ayah.penghasilan
        })}

        {keluarga?.ibu && renderInfoSection('Mother Information', {
          'Name': keluarga.ibu.nama_ibu,
          'NIK': keluarga.ibu.nik_ibu,
          'Birth Place': keluarga.ibu.tempat_lahir,
          'Income': keluarga.ibu.penghasilan
        })}

        {renderInfoSection('Survey Information', {
          'Family Head Job': survey.pekerjaan_kepala_keluarga,
          'Income': survey.penghasilan,
          'Education': survey.pendidikan_kepala_keluarga,
          'Dependents': survey.jumlah_tanggungan,
          'House Ownership': survey.kepemilikan_rumah,
          'Wall Condition': survey.kondisi_rumah_dinding,
          'Floor Condition': survey.kondisi_rumah_lantai,
          'Water Source': survey.sumber_air_bersih,
          'Survey Date': new Date(survey.tanggal_survey).toLocaleDateString(),
          'Surveyor': survey.petugas_survey
        })}
      </ScrollView>

      {survey?.hasil_survey === 'pending' && (
        <View style={styles.actionContainer}>
          {['reject', 'approve'].map((action) => (
            <TouchableOpacity 
              key={action}
              style={[styles.actionButton, styles[`${action}Button`]]}
              onPress={() => showApprovalModal(action)}
            >
              <Ionicons 
                name={action === 'approve' ? 'checkmark-circle' : 'close-circle'} 
                size={24} 
                color="#fff" 
              />
              <Text style={styles.actionButtonText}>
                {action === 'approve' ? 'Approve' : 'Reject'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {actionType === 'approve' ? 'Approve Survey' : 'Reject Survey'}
            </Text>
            
            {actionType === 'reject' && (
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Rejection Reason *</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="Enter rejection reason..."
                  value={rejectionReason}
                  onChangeText={setRejectionReason}
                  multiline
                  numberOfLines={3}
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textArea}
                placeholder="Enter additional notes..."
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, actionType === 'approve' ? styles.approveButton : styles.rejectButton]}
                onPress={handleApproval}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <LoadingSpinner size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>
                    {actionType === 'approve' ? 'Approve' : 'Reject'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  scrollView: { flex: 1 },
  section: { backgroundColor: '#fff', marginHorizontal: 16, marginVertical: 8, borderRadius: 12, overflow: 'hidden' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', backgroundColor: '#f8f8f8', padding: 16 },
  sectionContent: { padding: 16 },
  infoRow: { flexDirection: 'row', marginBottom: 8 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#666', width: 120 },
  infoValue: { fontSize: 14, color: '#333', flex: 1 },
  actionContainer: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#eee' },
  actionButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 8, marginHorizontal: 4 },
  approveButton: { backgroundColor: '#27ae60' },
  rejectButton: { backgroundColor: '#e74c3c' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', borderRadius: 12, padding: 24, margin: 16, width: '90%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 16, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 8 },
  textArea: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, minHeight: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
  modalButton: { flex: 1, padding: 16, borderRadius: 8, alignItems: 'center', marginHorizontal: 4 },
  cancelButton: { backgroundColor: '#95a5a6' },
  cancelButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' }
});

export default SurveyApprovalDetailScreen;