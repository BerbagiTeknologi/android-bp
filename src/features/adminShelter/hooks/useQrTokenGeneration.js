import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Alert } from 'react-native';
import { adminShelterAnakApi } from '../api/adminShelterAnakApi';
import { adminShelterKelompokApi } from '../api/adminShelterKelompokApi';
import { 
  generateToken, 
  generateBatchTokens,
  getActiveToken,
  selectQrTokenLoading, 
  selectQrTokenError
} from '../redux/qrTokenSlice';
import {
  generateTutorToken,
  selectCurrentTutorToken,
  selectTutorAttendanceLoading,
  selectTutorAttendanceError
} from '../redux/tutorAttendanceSlice';
import qrExportHelper from '../utils/qrExportHelper';

export const useQrTokenGeneration = (routeParams = {}) => {
  const dispatch = useDispatch();
  
  const { 
    id_aktivitas, 
    activityName, 
    activityDate,
    activityType,
    kelompokId,
    kelompokName,
    level,
    completeActivity
  } = routeParams;
  
  const tokenLoading = useSelector(selectQrTokenLoading);
  const tokenError = useSelector(selectQrTokenError);
  const studentTokens = useSelector(state => state.qrToken.studentTokens);
  const tutorToken = useSelector(selectCurrentTutorToken);
  const tutorLoading = useSelector(selectTutorAttendanceLoading);
  const tutorError = useSelector(selectTutorAttendanceError);
  
  const [mode, setMode] = useState('students');
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validDays, setValidDays] = useState(30);
  const [exportLoading, setExportLoading] = useState(false);
  const [activityTutor, setActivityTutor] = useState(null);
  const [kelompokList, setKelompokList] = useState([]);
  const [selectedKelompokId, setSelectedKelompokId] = useState(kelompokId || '');
  const [kelompokLoading, setKelompokLoading] = useState(false);
  const [kelompokError, setKelompokError] = useState(null);
  const [isContextualMode, setIsContextualMode] = useState(!!id_aktivitas);
  
  const qrRefs = useRef({});
  const tutorQrRef = useRef(null);

  const setQrRef = (studentId, ref) => {
    qrRefs.current[studentId] = ref;
  };

  useEffect(() => {
    if (completeActivity && completeActivity.tutor) {
      setActivityTutor(completeActivity.tutor);
    }
  }, [completeActivity]);
  
  useEffect(() => {
    if (!isContextualMode || (isContextualMode && activityType !== 'Bimbel')) {
      fetchKelompokList();
    }
  }, [isContextualMode, activityType]);
  
  useEffect(() => {
    if (mode === 'students') {
      if (isContextualMode && activityType === 'Bimbel' && kelompokId) {
        fetchStudentsByKelompok(kelompokId);
      } 
      else if (isContextualMode && activityType === 'Kegiatan') {
        fetchAllStudents();
      }
      else if (selectedKelompokId) {
        fetchStudentsByKelompok(selectedKelompokId);
      } 
      else {
        fetchAllStudents();
      }
    }
  }, [isContextualMode, activityType, kelompokId, selectedKelompokId, mode]);

  const fetchKelompokList = async () => {
    try {
      setKelompokLoading(true);
      setKelompokError(null);
      
      const response = await adminShelterKelompokApi.getAllKelompok();
      
      if (response.data && response.data.data) {
        setKelompokList(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching kelompok list:', error);
      setKelompokError('Failed to load groups. Please try again.');
    } finally {
      setKelompokLoading(false);
    }
  };
  
  const fetchAllStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
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
        setSelectedStudents([]);
        
        setTimeout(() => {
          activeStudents.forEach(student => {
            if (!studentTokens[student.id_anak]) {
              dispatch(getActiveToken(student.id_anak));
            }
          });
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching all students:', error);
      setError('Failed to load students. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchStudentsByKelompok = async (kelompokId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await adminShelterKelompokApi.getGroupChildren(kelompokId);
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        const kelompokStudents = response.data.data;
        
        const activeStudents = kelompokStudents.filter(
          student => student.status_validasi === 'aktif'
        );
        
        setStudents(activeStudents);
        setSelectedStudents([]);
        
        setTimeout(() => {
          activeStudents.forEach(student => {
            if (!studentTokens[student.id_anak]) {
              dispatch(getActiveToken(student.id_anak));
            }
          });
        }, 100);
      } else {
        setError('Students data structure is invalid. Please try a different group.');
      }
    } catch (error) {
      console.error('Error fetching students by kelompok:', error);
      setError(`Failed to load students: ${error.message}`);
      
      if (isContextualMode) {
        fetchAllStudents();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKelompokChange = (kelompokId) => {
    setSelectedKelompokId(kelompokId);
  };
  
  const filteredStudents = students.filter(student => 
    (student.full_name || student.nick_name || '')
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );
  
  const toggleStudentSelection = (studentId) => {
    if (selectedStudents.includes(studentId)) {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
    } else {
      setSelectedStudents([...selectedStudents, studentId]);
    }
  };
  
  const selectAllStudents = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(student => student.id_anak));
    }
  };
  
  const handleGenerateToken = async (studentId) => {
    try {
      await dispatch(generateToken({ id_anak: studentId, validDays })).unwrap();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate token');
    }
  };
  
  const handleGenerateBatchTokens = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert('No Students Selected', 'Please select at least one student.');
      return;
    }
    
    try {
      await dispatch(generateBatchTokens({ 
        studentIds: selectedStudents, 
        validDays 
      })).unwrap();
      
      Alert.alert('Success', `Generated tokens for ${selectedStudents.length} students.`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate batch tokens');
    }
  };
  
  const handleGenerateTutorToken = async () => {
    if (!activityTutor) {
      Alert.alert('Error', 'No tutor assigned to this activity');
      return;
    }
    
    try {
      await dispatch(generateTutorToken({ 
        id_tutor: activityTutor.id_tutor, 
        validDays 
      })).unwrap();
      
      Alert.alert('Success', `Generated token for tutor: ${activityTutor.nama}`);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to generate tutor token');
    }
  };

  const getQrDataUrl = async (studentId) => {
    return new Promise((resolve, reject) => {
      if (!qrRefs.current[studentId] || !qrRefs.current[studentId].getDataURL) {
        reject(new Error('QR code ref not found'));
        return;
      }
      
      qrRefs.current[studentId].getDataURL()
        .then(resolve)
        .catch(reject);
    });
  };
  
  const getTutorQrDataUrl = async () => {
    return new Promise((resolve, reject) => {
      if (!tutorQrRef.current || !tutorQrRef.current.getDataURL) {
        reject(new Error('Tutor QR code ref not found'));
        return;
      }
      
      tutorQrRef.current.getDataURL()
        .then(resolve)
        .catch(reject);
    });
  };

  const handleExportQr = async (studentId) => {
    try {
      const isSharingAvailable = await qrExportHelper.isSharingAvailable();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      setExportLoading(true);
      
      const token = studentTokens[studentId];
      if (!token) {
        Alert.alert('Error', 'No token found for this student');
        return;
      }
      
      const student = students.find(s => s.id_anak === studentId);
      if (!student) {
        Alert.alert('Error', 'Student information not found');
        return;
      }
      
      const base64Data = await getQrDataUrl(studentId);
      if (!base64Data) {
        throw new Error('Failed to generate QR code image');
      }
      
      const fileUri = await qrExportHelper.saveQrCodeToFile(base64Data, student);
      await qrExportHelper.shareQrCode(fileUri);
    } catch (error) {
      console.error('Error exporting QR code:', error);
      Alert.alert('Error', error.message || 'Failed to export QR code');
    } finally {
      setExportLoading(false);
    }
  };
  
  const handleExportTutorQr = async () => {
    try {
      const isSharingAvailable = await qrExportHelper.isSharingAvailable();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      setExportLoading(true);
      
      if (!tutorToken) {
        Alert.alert('Error', 'No token found for tutor');
        return;
      }
      
      const base64Data = await getTutorQrDataUrl();
      if (!base64Data) {
        throw new Error('Failed to generate tutor QR code image');
      }
      
      const tutorInfo = {
        full_name: activityTutor.nama,
        id_tutor: activityTutor.id_tutor
      };
      const fileUri = await qrExportHelper.saveQrCodeToFile(base64Data, tutorInfo);
      await qrExportHelper.shareQrCode(fileUri);
    } catch (error) {
      console.error('Error exporting tutor QR code:', error);
      Alert.alert('Error', error.message || 'Failed to export tutor QR code');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportBatchQr = async () => {
    if (selectedStudents.length === 0) {
      Alert.alert('No Students Selected', 'Please select at least one student.');
      return;
    }
    
    try {
      const isSharingAvailable = await qrExportHelper.isSharingAvailable();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      setExportLoading(true);
      
      const qrDataArray = [];
      
      for (const studentId of selectedStudents) {
        const token = studentTokens[studentId];
        if (!token) continue;
        
        const student = students.find(s => s.id_anak === studentId);
        if (!student) continue;
        
        try {
          const base64Data = await getQrDataUrl(studentId);
          if (base64Data) {
            qrDataArray.push({ base64Data, student });
          }
        } catch (err) {
          console.error(`Error getting QR for student ${studentId}:`, err);
        }
      }
      
      if (qrDataArray.length === 0) {
        Alert.alert('Error', 'No QR codes could be generated');
        return;
      }
      
      const results = await qrExportHelper.processBatch(qrDataArray);
      
      const successfulExports = results.filter(r => r.success);
      const fileUris = successfulExports.map(r => r.fileUri);
      
      if (fileUris.length === 0) {
        Alert.alert('Error', 'Failed to export QR codes');
        return;
      }
      
      await qrExportHelper.handleMultipleQrCodes(fileUris);
      
    } catch (error) {
      console.error('Error exporting QR codes:', error);
      Alert.alert('Error', error.message || 'Failed to export QR codes');
    } finally {
      setExportLoading(false);
    }
  };

  return {
    // State
    mode,
    setMode,
    students,
    selectedStudents,
    searchQuery,
    setSearchQuery,
    loading,
    error,
    validDays,
    setValidDays,
    exportLoading,
    activityTutor,
    kelompokList,
    selectedKelompokId,
    kelompokLoading,
    kelompokError,
    isContextualMode,
    
    // Redux state
    tokenLoading,
    tokenError,
    studentTokens,
    tutorToken,
    tutorLoading,
    tutorError,
    
    // Route params
    id_aktivitas,
    activityName,
    activityDate,
    activityType,
    kelompokId,
    kelompokName,
    level,
    
    // Computed values
    filteredStudents,
    
    // Refs
    qrRefs,
    tutorQrRef,
    setQrRef,
    
    // Handlers
    handleKelompokChange,
    toggleStudentSelection,
    selectAllStudents,
    handleGenerateToken,
    handleGenerateBatchTokens,
    handleGenerateTutorToken,
    handleExportQr,
    handleExportTutorQr,
    handleExportBatchQr,
    getQrDataUrl,
    getTutorQrDataUrl,
    
    // Functions
    fetchAllStudents,
    fetchStudentsByKelompok,
    fetchKelompokList
  };
};