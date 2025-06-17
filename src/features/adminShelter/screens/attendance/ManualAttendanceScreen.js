import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format, isToday, isFuture, isPast, startOfDay } from 'date-fns';
import NetInfo from '@react-native-community/netinfo';

import LoadingSpinner from '../../../../common/components/LoadingSpinner';
import ErrorMessage from '../../../../common/components/ErrorMessage';

import { adminShelterAnakApi } from '../../api/adminShelterAnakApi';
import { adminShelterKelompokApi } from '../../api/adminShelterKelompokApi';
import { aktivitasApi } from '../../api/aktivitasApi';
import { adminShelterTutorApi } from '../../api/adminShelterTutorApi';

import {
  recordAttendanceManually,
  selectAttendanceLoading,
  selectAttendanceError,
  selectDuplicateError,
  resetAttendanceError
} from '../../redux/attendanceSlice';

import {
  recordTutorAttendanceManually,
  selectTutorAttendanceLoading,
  selectTutorAttendanceError,
  resetTutorAttendanceError
} from '../../redux/tutorAttendanceSlice';

import OfflineSync from '../../utils/offlineSync';

const ManualAttendanceScreen = ({ navigation, route }) => {
  const dispatch = useDispatch();
  
  const { 
    id_aktivitas, 
    activityName, 
    activityDate, 
    kelompokId, 
    kelompokName,
    activityType 
  } = route.params || {};
  
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const duplicateError = useSelector(selectDuplicateError);
  const tutorAttendanceLoading = useSelector(selectTutorAttendanceLoading);
  const tutorAttendanceError = useSelector(selectTutorAttendanceError);
  
  const [attendanceMode, setAttendanceMode] = useState('student');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTutor, setSelectedTutor] = useState(null);
  const [notes, setNotes] = useState('');
  const [students, setStudents] = useState([]);
  const [tutorList, setTutorList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTutors, setLoadingTutors] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [tutorError, setTutorError] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const [isBimbelActivity, setIsBimbelActivity] = useState(activityType === 'Bimbel');
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false);
  const [activityTutor, setActivityTutor] = useState(null);
  const [activityDetails, setActivityDetails] = useState(null);
  const [loadingActivityDetails, setLoadingActivityDetails] = useState(false);
  const [expectedStatus, setExpectedStatus] = useState('present');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [arrivalTime, setArrivalTime] = useState(new Date());
  const [activityDateStatus, setActivityDateStatus] = useState('valid');
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected && state.isInternetReachable);
    });
    
    return () => unsubscribe();
  }, []);
  
  useEffect(() => {
    setIsBimbelActivity(activityType === 'Bimbel');
    fetchActivityDetails();
    fetchActivityTutor();
    validateActivityDate();
  }, [activityType, id_aktivitas, activityDate]);
  
  useEffect(() => {
    if (attendanceMode === 'student' && activityDateStatus === 'valid') {
      if (isBimbelActivity && kelompokId) {
        fetchStudentsByKelompok(kelompokId);
      } else {
        fetchAllStudents();
      }
    }
  }, [attendanceMode, isBimbelActivity, kelompokId, activityDateStatus]);
  
  useEffect(() => {
    if (attendanceMode === 'tutor' && activityDateStatus === 'valid') {
      fetchTutors();
    }
  }, [attendanceMode, activityDateStatus]);
  
  useEffect(() => {
    if (duplicateError) {
      setShowDuplicateAlert(true);
    }
    
    return () => {
      dispatch(resetAttendanceError());
    };
  }, [duplicateError, dispatch]);
  
  useEffect(() => {
    updateExpectedStatus();
  }, [arrivalTime, activityDetails]);
  
  const validateActivityDate = () => {
    if (!activityDate) {
      setActivityDateStatus('unknown');
      return;
    }
    
    const today = startOfDay(new Date());
    const actDate = startOfDay(new Date(activityDate));
    
    if (isFuture(actDate)) {
      setActivityDateStatus('future');
    } else if (isPast(actDate)) {
      setActivityDateStatus('past');
    } else {
      setActivityDateStatus('valid');
    }
  };
  
  const fetchActivityDetails = async () => {
    if (!id_aktivitas) return;
    
    setLoadingActivityDetails(true);
    
    try {
      const response = await aktivitasApi.getAktivitasDetail(id_aktivitas);
      if (response.data && response.data.data) {
        setActivityDetails(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch activity details:', err);
    } finally {
      setLoadingActivityDetails(false);
    }
  };
  
  const fetchActivityTutor = async () => {
    if (!id_aktivitas) return;
    
    try {
      const response = await aktivitasApi.getAktivitasDetail(id_aktivitas);
      if (response.data && response.data.data && response.data.data.tutor) {
        setActivityTutor(response.data.data.tutor);
      }
    } catch (error) {
      console.error('Error fetching activity tutor:', error);
    }
  };
  
  const updateExpectedStatus = () => {
    if (!activityDetails || !arrivalTime) {
      return;
    }
    
    let status = 'present';
    
    if (activityDateStatus === 'past') {
      status = 'absent';
      setExpectedStatus(status);
      return;
    }
    
    if (activityDetails.end_time) {
      const activityDate = new Date(activityDetails.tanggal);
      const endTimeStr = activityDetails.end_time;
      
      if (typeof endTimeStr === 'string') {
        const [hours, minutes] = endTimeStr.split(':');
        const endTime = new Date(activityDate);
        endTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        
        if (arrivalTime > endTime) {
          status = 'absent';
        }
      }
    }
    
    if (status !== 'absent' && activityDetails.start_time) {
      const activityDate = new Date(activityDetails.tanggal);
      const startTimeStr = activityDetails.start_time;
      
      if (typeof startTimeStr === 'string') {
        const [hours, minutes] = startTimeStr.split(':');
        const startTime = new Date(activityDate);
        startTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
        
        if (activityDetails.late_threshold) {
          const lateThresholdStr = activityDetails.late_threshold;
          const [lateHours, lateMinutes] = lateThresholdStr.split(':');
          const lateThreshold = new Date(activityDate);
          lateThreshold.setHours(parseInt(lateHours, 10), parseInt(lateMinutes, 10));
          
          if (arrivalTime > lateThreshold) {
            status = 'late';
          }
        } else if (activityDetails.late_minutes_threshold) {
          const lateThreshold = new Date(startTime);
          lateThreshold.setMinutes(lateThreshold.getMinutes() + activityDetails.late_minutes_threshold);
          
          if (arrivalTime > lateThreshold) {
            status = 'late';
          }
        }
      }
    }
    
    setExpectedStatus(status);
  };
  
  const fetchAllStudents = async () => {
    setLoadingStudents(true);
    setStudentError(null);
    
    try {
      let allStudents = [];
      let currentPage = 1;
      let lastPage = 1;
      
      const initialResponse = await adminShelterAnakApi.getAllAnak({ page: 1 });
      
      if (initialResponse.data && initialResponse.data.pagination) {
        lastPage = initialResponse.data.pagination.last_page;
        allStudents = [...initialResponse.data.data];
        
        if (lastPage > 1) {
          for (let page = 2; page <= lastPage; page++) {
            const pageResponse = await adminShelterAnakApi.getAllAnak({ page });
            if (pageResponse.data && pageResponse.data.data) {
              allStudents = [...allStudents, ...pageResponse.data.data];
            }
          }
        }
        
        const activeStudents = allStudents.filter(
          student => student.status_validasi === 'aktif'
        );
        
        setStudents(activeStudents);
      } else {
        const fallbackResponse = await adminShelterAnakApi.getAllAnak({ per_page: 1000 });
        if (fallbackResponse.data && fallbackResponse.data.data) {
          const activeStudents = fallbackResponse.data.data.filter(
            student => student.status_validasi === 'aktif'
          );
          setStudents(activeStudents);
        } else {
          setStudents([]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch students:', err);
      setStudentError('Failed to load students. Please try again.');
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const fetchStudentsByKelompok = async (kelompokId) => {
    setLoadingStudents(true);
    setStudentError(null);
    
    try {
      const response = await adminShelterKelompokApi.getGroupChildren(kelompokId);
      if (response.data && response.data.data) {
        const activeStudents = response.data.data.filter(
          student => student.status_validasi === 'aktif'
        );
        setStudents(activeStudents);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to fetch students by kelompok:', err);
      setStudentError('Failed to load students from this group. Using all students instead.');
      fetchAllStudents();
    } finally {
      setLoadingStudents(false);
    }
  };
  
  const fetchTutors = async () => {
    setLoadingTutors(true);
    setTutorError(null);
    
    try {
      const response = await adminShelterTutorApi.getActiveTutors();
      if (response.data && response.data.data) {
        setTutorList(response.data.data);
      } else {
        setTutorList([]);
      }
    } catch (err) {
      console.error('Failed to fetch tutors:', err);
      setTutorError('Failed to load tutors. Please try again.');
    } finally {
      setLoadingTutors(false);
    }
  };
  
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setArrivalTime(selectedTime);
    }
  };
  
  const filteredStudents = students.filter(student => 
    (student.full_name || student.nick_name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
  };
  
  const handleSelectTutor = (tutor) => {
    setSelectedTutor(tutor);
  };
  
  const renderStudentItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.studentItem,
        selectedStudent?.id_anak === item.id_anak && styles.selectedStudentItem
      ]}
      onPress={() => handleSelectStudent(item)}
      disabled={activityDateStatus !== 'valid'}
    >
      <View style={styles.studentAvatar}>
        <Ionicons name="person" size={24} color="#95a5a6" />
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {item.full_name || item.nick_name || `Student ${item.id_anak}`}
        </Text>
        {item.id_anak && (
          <Text style={styles.studentId}>ID: {item.id_anak}</Text>
        )}
      </View>
      {selectedStudent?.id_anak === item.id_anak && (
        <Ionicons name="checkmark-circle" size={24} color="#3498db" />
      )}
    </TouchableOpacity>
  );
  
  const handleSubmit = async () => {
    if (activityDateStatus === 'future') {
      Alert.alert('Error', 'Activity has not started yet. Please wait until the activity date.');
      return;
    }
    
    if (attendanceMode === 'student') {
      if (!selectedStudent) {
        Alert.alert('Error', 'Please select a student');
        return;
      }
      
      if (!id_aktivitas) {
        Alert.alert('Error', 'Activity not specified');
        return;
      }
      
      if (!notes) {
        Alert.alert('Error', 'Please provide verification notes');
        return;
      }
      
      if (activityDateStatus === 'past') {
        Alert.alert(
          'Past Activity', 
          'This activity was in the past. Attendance will be marked as absent. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => submitStudentAttendance() }
          ]
        );
        return;
      }
      
      submitStudentAttendance();
    } else {
      if (!selectedTutor) {
        Alert.alert('Error', 'Please select a tutor');
        return;
      }
      
      if (!notes) {
        Alert.alert('Error', 'Please provide verification notes');
        return;
      }
      
      if (!activityTutor || activityTutor.id_tutor !== selectedTutor.id_tutor) {
        Alert.alert('Error', 'Selected tutor is not assigned to this activity');
        return;
      }
      
      if (activityDateStatus === 'past') {
        Alert.alert(
          'Past Activity', 
          'This activity was in the past. Attendance will be marked as absent. Continue?',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Continue', onPress: () => submitTutorAttendance() }
          ]
        );
        return;
      }
      
      submitTutorAttendance();
    }
  };
  
  const submitStudentAttendance = async () => {
    const formattedArrivalTime = format(arrivalTime, 'yyyy-MM-dd HH:mm:ss');
    
    const attendanceData = {
      id_anak: selectedStudent.id_anak,
      id_aktivitas,
      status: null,
      notes,
      arrival_time: formattedArrivalTime
    };
    
    try {
      if (isConnected) {
        await dispatch(recordAttendanceManually(attendanceData)).unwrap();
        Alert.alert(
          'Success', 
          'Student attendance recorded successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const result = await OfflineSync.processAttendance(attendanceData, 'manual');
        Alert.alert(
          'Offline Mode', 
          result.message || 'Attendance saved for syncing when online',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      if (!err.isDuplicate) {
        Alert.alert('Error', err.message || 'Failed to record attendance');
      }
    }
  };
  
  const submitTutorAttendance = async () => {
    const formattedArrivalTime = format(arrivalTime, 'yyyy-MM-dd HH:mm:ss');
    
    const tutorAttendanceData = {
      id_tutor: selectedTutor.id_tutor,
      id_aktivitas,
      status: null,
      notes,
      arrival_time: formattedArrivalTime
    };
    
    try {
      if (isConnected) {
        await dispatch(recordTutorAttendanceManually(tutorAttendanceData)).unwrap();
        Alert.alert(
          'Success', 
          'Tutor attendance recorded successfully',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        const result = await OfflineSync.processTutorAttendance(tutorAttendanceData, 'manual');
        Alert.alert(
          'Offline Mode', 
          result.message || 'Tutor attendance saved for syncing when online',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    } catch (err) {
      if (!err.isDuplicate) {
        Alert.alert('Error', err.message || 'Failed to record tutor attendance');
      }
    }
  };
  
  const handleCloseDuplicateAlert = () => {
    setShowDuplicateAlert(false);
    dispatch(resetAttendanceError());
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'absent':
        return '#e74c3c';
      case 'late':
        return '#f39c12';
      default:
        return '#2ecc71';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'absent':
        return 'close-circle';
      case 'late':
        return 'time';
      default:
        return 'checkmark-circle';
    }
  };

  const getActivityStatusInfo = () => {
    switch(activityDateStatus) {
      case 'future':
        return {
          show: true,
          color: '#f39c12',
          icon: 'time-outline',
          text: 'Activity has not started yet - form disabled'
        };
      case 'past':
        return {
          show: true,
          color: '#e74c3c',
          icon: 'alert-circle',
          text: 'Past activity - attendance will be marked as absent'
        };
      default:
        return { show: false };
    }
  };

  const isFormDisabled = activityDateStatus === 'future';
  const activityStatus = getActivityStatusInfo();
  
  const HeaderComponent = () => (
    <>
      {attendanceMode === 'student' ? (
        <>
          <Text style={styles.label}>
            {`Student${isBimbelActivity ? ` from ${kelompokName || 'this group'}` : ''}`}
          </Text>
          
          {!isFormDisabled && (
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#7f8c8d" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search student..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
                editable={!isFormDisabled}
              />
            </View>
          )}
        </>
      ) : (
        <>
          <Text style={styles.label}>Tutor</Text>
          
          {loadingTutors ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3498db" />
              <Text style={styles.loadingText}>Loading tutors...</Text>
            </View>
          ) : tutorError ? (
            <ErrorMessage 
              message={tutorError} 
              onRetry={fetchTutors}
              style={styles.errorContainer} 
            />
          ) : !isFormDisabled ? (
            <View style={styles.tutorSelectionContainer}>
              {tutorList.map(tutor => (
                <TouchableOpacity
                  key={tutor.id_tutor}
                  style={[
                    styles.tutorItem,
                    selectedTutor?.id_tutor === tutor.id_tutor && styles.selectedTutorItem,
                    activityTutor?.id_tutor === tutor.id_tutor && styles.assignedTutorItem,
                    isFormDisabled && styles.disabledItem
                  ]}
                  onPress={() => !isFormDisabled && setSelectedTutor(tutor)}
                  disabled={isFormDisabled}
                >
                  <View style={styles.tutorAvatar}>
                    <Ionicons name="person" size={24} color="#95a5a6" />
                  </View>
                  <View style={styles.tutorInfo}>
                    <Text style={styles.tutorName}>{tutor.nama}</Text>
                    <Text style={styles.tutorId}>ID: {tutor.id_tutor}</Text>
                    {activityTutor?.id_tutor === tutor.id_tutor && (
                      <Text style={styles.assignedLabel}>Assigned to Activity</Text>
                    )}
                  </View>
                  {selectedTutor?.id_tutor === tutor.id_tutor && (
                    <Ionicons name="checkmark-circle" size={24} color="#3498db" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          ) : null}
        </>
      )}
    </>
  );
  
  const FooterComponent = () => (
    <>
      {!isFormDisabled && (
        <>
          <View style={styles.formSection}>
            <Text style={styles.label}>Arrival Time</Text>
            <TouchableOpacity 
              style={[styles.timePickerButton, isFormDisabled && styles.disabledButton]}
              onPress={() => !isFormDisabled && setShowTimePicker(true)}
              disabled={isFormDisabled}
            >
              <Ionicons name="time-outline" size={20} color="#3498db" />
              <Text style={styles.timePickerText}>
                {format(arrivalTime, 'HH:mm')}
              </Text>
            </TouchableOpacity>
            
            {showTimePicker && (
              <DateTimePicker
                value={arrivalTime}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
              />
            )}
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Expected Status</Text>
            <View style={[styles.expectedStatus, { backgroundColor: getStatusColor(expectedStatus) }]}>
              <Ionicons name={getStatusIcon(expectedStatus)} size={20} color="#fff" />
              <Text style={styles.expectedStatusText}>
                {expectedStatus.charAt(0).toUpperCase() + expectedStatus.slice(1)}
              </Text>
            </View>
            <Text style={styles.helperText}>
              Status is automatically determined based on activity schedule and arrival time
            </Text>
          </View>
          
          <View style={styles.formSection}>
            <Text style={styles.label}>Verification Notes (Required)</Text>
            <TextInput
              style={[styles.notesInput, isFormDisabled && styles.disabledInput]}
              placeholder="Enter verification notes..."
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isFormDisabled}
            />
          </View>
        </>
      )}
      
      <View style={styles.buttonSection}>
        <TouchableOpacity 
          style={[styles.submitButton, isFormDisabled && styles.disabledSubmitButton]}
          onPress={handleSubmit}
          disabled={loading || tutorAttendanceLoading || isFormDisabled}
        >
          {(loading || tutorAttendanceLoading) ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={[styles.submitButtonText, isFormDisabled && styles.disabledSubmitButtonText]}>
              {isFormDisabled ? 'Form Disabled' : `Record ${attendanceMode === 'student' ? 'Student' : 'Tutor'} Attendance`}
            </Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={loading || tutorAttendanceLoading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const isAnyLoading = loading || tutorAttendanceLoading || loadingStudents || loadingTutors || loadingActivityDetails;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.activityInfo}>
          <Text style={styles.activityName}>{activityName || 'Activity'}</Text>
          <Text style={styles.activityDate}>{activityDate || 'Date not specified'}</Text>
          
          {isBimbelActivity && kelompokName && (
            <View style={styles.kelompokInfoContainer}>
              <Text style={styles.kelompokInfo}>Group: {kelompokName}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.modeToggleContainer}>
          <Text style={styles.modeToggleLabel}>Attendance Mode</Text>
          <View style={styles.modeToggleButtons}>
            <TouchableOpacity
              style={[
                styles.modeToggleButton,
                attendanceMode === 'student' && styles.modeToggleButtonActive,
                isFormDisabled && styles.disabledButton
              ]}
              onPress={() => !isFormDisabled && setAttendanceMode('student')}
              disabled={isFormDisabled}
            >
              <Text style={[
                styles.modeToggleButtonText,
                attendanceMode === 'student' && styles.modeToggleButtonTextActive
              ]}>
                Student
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.modeToggleButton,
                attendanceMode === 'tutor' && styles.modeToggleButtonActive,
                isFormDisabled && styles.disabledButton
              ]}
              onPress={() => !isFormDisabled && setAttendanceMode('tutor')}
              disabled={isFormDisabled}
            >
              <Text style={[
                styles.modeToggleButtonText,
                attendanceMode === 'tutor' && styles.modeToggleButtonTextActive
              ]}>
                Tutor
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {activityStatus.show && (
          <View style={[styles.activityStatusAlert, { backgroundColor: activityStatus.color }]}>
            <Ionicons name={activityStatus.icon} size={18} color="#fff" />
            <Text style={styles.activityStatusText}>{activityStatus.text}</Text>
          </View>
        )}
        
        {!isConnected && (
          <View style={styles.offlineIndicator}>
            <Ionicons name="cloud-offline" size={18} color="#fff" />
            <Text style={styles.offlineText}>Offline Mode - Data will be synced later</Text>
          </View>
        )}
        
        {showDuplicateAlert && (
          <View style={styles.duplicateAlert}>
            <Ionicons name="alert-circle" size={20} color="#fff" />
            <Text style={styles.duplicateAlertText}>
              {duplicateError || 'This attendance record already exists for this activity'}
            </Text>
            <TouchableOpacity
              style={styles.duplicateAlertCloseButton}
              onPress={handleCloseDuplicateAlert}
            >
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        
        {(error || tutorAttendanceError) && (
          <ErrorMessage message={error || tutorAttendanceError} />
        )}
        {studentError && <ErrorMessage message={studentError} onRetry={fetchAllStudents} />}
        
        <View style={styles.formContainer}>
          {isAnyLoading ? (
            <ActivityIndicator size="large" color="#3498db" style={styles.loadingIndicator} />
          ) : (
            attendanceMode === 'student' ? (
              <FlatList
                data={isFormDisabled ? [] : filteredStudents}
                renderItem={renderStudentItem}
                keyExtractor={(item) => item.id_anak.toString()}
                ListHeaderComponent={HeaderComponent}
                ListFooterComponent={FooterComponent}
                ListEmptyComponent={
                  !isFormDisabled ? <Text style={styles.emptyListText}>No students found</Text> : null
                }
                contentContainerStyle={styles.studentListContent}
              />
            ) : (
              <FlatList
                data={[]}
                renderItem={() => null}
                ListHeaderComponent={HeaderComponent}
                ListFooterComponent={FooterComponent}
                contentContainerStyle={styles.studentListContent}
              />
            )
          )}
        </View>
        
        {isAnyLoading && (
          <LoadingSpinner 
            fullScreen 
            message={`Recording ${attendanceMode} attendance...`}
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activityStatusAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  activityStatusText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  disabledItem: {
    opacity: 0.5,
  },
  disabledSubmitButton: {
    backgroundColor: '#bdc3c7',
  },
  disabledSubmitButtonText: {
    color: '#7f8c8d',
  },
  modeToggleContainer: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    marginBottom: 16,
  },
  modeToggleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 12,
  },
  modeToggleButtons: {
    flexDirection: 'row',
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    padding: 4,
  },
  modeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  modeToggleButtonActive: {
    backgroundColor: '#3498db',
  },
  modeToggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  modeToggleButtonTextActive: {
    color: '#fff',
  },
  tutorSelectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 16,
  },
  tutorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  selectedTutorItem: {
    backgroundColor: '#e1f5fe',
  },
  assignedTutorItem: {
    backgroundColor: '#e8f5e8',
  },
  tutorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  tutorId: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
  assignedLabel: {
    fontSize: 11,
    color: '#28a745',
    fontWeight: '500',
    marginTop: 2,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
  kelompokInfoContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
  },
  kelompokInfo: {
    fontSize: 14,
    color: '#fff',
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 12,
    borderRadius: 0,
  },
  offlineText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
  },
  duplicateAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f39c12',
    padding: 12,
    borderRadius: 0,
  },
  duplicateAlertText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  duplicateAlertCloseButton: {
    padding: 5,
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
    color: '#2c3e50',
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    fontSize: 16,
  },
  studentListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  studentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginHorizontal: 16,
    backgroundColor: '#fff',
  },
  selectedStudentItem: {
    backgroundColor: '#e1f5fe',
  },
  studentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  studentId: {
    fontSize: 12,
    color: '#777',
  },
  emptyListText: {
    textAlign: 'center',
    padding: 20,
    color: '#7f8c8d',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  timePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  timePickerText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#2c3e50',
  },
  expectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  expectedStatusText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  helperText: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 6,
    fontStyle: 'italic',
  },
  notesInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  buttonSection: {
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  submitButton: {
    backgroundColor: '#3498db',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#7f8c8d',
  },
  errorContainer: {
    margin: 16,
  },
});

export default ManualAttendanceScreen;