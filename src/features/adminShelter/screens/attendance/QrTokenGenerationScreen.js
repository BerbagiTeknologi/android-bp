import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QrCodeDisplay from '../../components/QrCodeDisplay';
import ErrorMessage from '../../../../common/components/ErrorMessage';
import StudentTokenSection from '../../components/StudentTokenSection';
import TutorTokenSection from '../../components/TutorTokenSection';
import { useQrTokenGeneration } from '../../hooks/useQrTokenGeneration';

const QrTokenGenerationScreen = ({ navigation, route }) => {
  const hookData = useQrTokenGeneration(route.params || {});
  
  const {
    mode,
    setMode,
    selectedStudents,
    filteredStudents,
    studentTokens,
    activityName,
    activityDate,
    activityType,
    kelompokName,
    level,
    activityTutor,
    tokenLoading,
    tokenError,
    tutorLoading,
    tutorError,
    exportLoading,
    setQrRef,
    toggleStudentSelection,
    handleGenerateToken,
    handleExportQr
  } = hookData;

  const renderStudentItem = ({ item }) => {
    const isSelected = selectedStudents.includes(item.id_anak);
    const token = studentTokens[item.id_anak];
    
    return (
      <View style={styles.studentCard}>
        <View style={styles.studentHeader}>
          <TouchableOpacity
            style={[
              styles.checkbox,
              isSelected && styles.checkboxSelected
            ]}
            onPress={() => toggleStudentSelection(item.id_anak)}
          >
            {isSelected && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
          
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>
              {item.full_name || item.nick_name || 'Unknown'}
            </Text>
            <Text style={styles.studentId}>ID: {item.id_anak}</Text>
          </View>
          
          <View style={styles.studentActions}>
            <TouchableOpacity
              style={styles.generateButton}
              onPress={() => handleGenerateToken(item.id_anak)}
              disabled={tokenLoading}
            >
              <Text style={styles.generateButtonText}>
                {token ? 'Regenerate' : 'Generate'}
              </Text>
            </TouchableOpacity>
            
            {token && (
              <TouchableOpacity
                style={styles.exportButton}
                onPress={() => handleExportQr(item.id_anak)}
                disabled={exportLoading}
              >
                <Ionicons name="share-outline" size={16} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {token && (
          <QrCodeDisplay
            token={token.token}
            studentName={item.full_name || item.nick_name}
            studentId={item.id_anak}
            size={180}
            showExportButtons={false}
            ref={(ref) => setQrRef(item.id_anak, ref)}
          />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {activityName && (
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activityName}</Text>
          {activityDate && (
            <Text style={styles.activityDate}>{activityDate}</Text>
          )}
          
          {activityType === 'Bimbel' && kelompokName && (
            <View style={styles.contextInfo}>
              <Text style={styles.contextInfoText}>Group: {kelompokName}</Text>
              {level && <Text style={styles.contextInfoText}>Level: {level}</Text>}
            </View>
          )}
        </View>
      )}
      
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'students' && styles.modeButtonActive
          ]}
          onPress={() => setMode('students')}
        >
          <Ionicons 
            name="people" 
            size={20} 
            color={mode === 'students' ? '#fff' : '#3498db'} 
          />
          <Text style={[
            styles.modeButtonText,
            mode === 'students' && styles.modeButtonTextActive
          ]}>
            Students
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.modeButton,
            mode === 'tutor' && styles.modeButtonActive,
            !activityTutor && styles.modeButtonDisabled
          ]}
          onPress={() => activityTutor && setMode('tutor')}
          disabled={!activityTutor}
        >
          <Ionicons 
            name="person" 
            size={20} 
            color={mode === 'tutor' ? '#fff' : (!activityTutor ? '#bdc3c7' : '#3498db')} 
          />
          <Text style={[
            styles.modeButtonText,
            mode === 'tutor' && styles.modeButtonTextActive,
            !activityTutor && styles.modeButtonTextDisabled
          ]}>
            Tutor
          </Text>
        </TouchableOpacity>
      </View>
      
      {(tokenError || tutorError) && (
        <ErrorMessage message={tokenError || tutorError} />
      )}
      
      {mode === 'students' ? (
        <StudentTokenSection
          {...hookData}
          renderStudentItem={renderStudentItem}
        />
      ) : (
        <TutorTokenSection {...hookData} />
      )}
      
      {(tokenLoading || exportLoading || tutorLoading) && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>
            {exportLoading ? 'Exporting QR codes...' : 'Generating QR codes...'}
          </Text>
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
  activityInfo: {
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
  contextInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
  },
  contextInfoText: {
    fontSize: 12,
    color: '#fff',
    marginVertical: 2,
  },
  modeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e1e1',
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  modeButtonActive: {
    backgroundColor: '#3498db',
  },
  modeButtonDisabled: {
    opacity: 0.5,
  },
  modeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#3498db',
  },
  modeButtonTextActive: {
    color: '#fff',
  },
  modeButtonTextDisabled: {
    color: '#bdc3c7',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#3498db',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  studentId: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  studentActions: {
    flexDirection: 'row',
  },
  generateButton: {
    backgroundColor: '#f1c40f',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 6,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  exportButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
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

export default QrTokenGenerationScreen;