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
  selectQrTokenError,
  resetQrTokenError
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
  const [targets, setTargets] = useState([]);
  
  const qrRefs = useRef({}); // Unified QR refs for all targets

  const setQrRef = (targetId, ref) => {
    qrRefs.current[targetId] = ref;
  };

  useEffect(() => {
    if (completeActivity && completeActivity.tutor) {
      setActivityTutor(completeActivity.tutor);
    }
  }, [completeActivity]);
  
  // Clear token errors on mount (no active token is expected behavior)
  useEffect(() => {
    dispatch(resetQrTokenError());
  }, [dispatch]);
  
  // Context-aware detection: Auto-load data based on activity context
  useEffect(() => {
    // For contextual mode (activity-specific), set appropriate visibility
    if (isContextualMode) {
      // For Bimbel activities, don't need kelompok list (already have specific kelompok)
      if (activityType !== 'Bimbel') {
        fetchKelompokList();
      }
    } else {
      // For non-contextual mode, always fetch kelompok list for selection
      fetchKelompokList();
    }
  }, [isContextualMode, activityType, completeActivity]);
  
  useEffect(() => {
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
  }, [isContextualMode, activityType, kelompokId, selectedKelompokId]);

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
  
  // Build unified targets array from students and tutor
  useEffect(() => {
    const newTargets = [];
    
    // Add tutor if assigned
    if (activityTutor) {
      newTargets.push({
        type: 'tutor',
        id: activityTutor.id_tutor,
        name: activityTutor.nama,
        data: activityTutor,
        token: tutorToken
      });
    }
    
    // Add students
    filteredStudents.forEach(student => {
      newTargets.push({
        type: 'student',
        id: student.id_anak,
        name: student.full_name || student.nick_name || 'Tidak Diketahui',
        data: student,
        token: studentTokens[student.id_anak],
        selected: selectedStudents.includes(student.id_anak)
      });
    });
    
    setTargets(newTargets);
  }, [
    filteredStudents.length, 
    activityTutor?.id_tutor, 
    tutorToken?.token, 
    Object.keys(studentTokens).length,
    selectedStudents.length
  ]);
  
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
  
  const handleGenerateToken = async (target) => {
    try {
      if (target.type === 'student') {
        await dispatch(generateToken({ id_anak: target.id, validDays })).unwrap();
      } else if (target.type === 'tutor') {
        await dispatch(generateTutorToken({ id_tutor: target.id, validDays })).unwrap();
        Alert.alert('Success', `Generated token for tutor: ${target.name}`);
      }
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
  

  const getQrDataUrl = async (targetId) => {
    return new Promise((resolve, reject) => {
      if (!qrRefs.current[targetId] || !qrRefs.current[targetId].getDataURL) {
        reject(new Error('QR code ref not found'));
        return;
      }
      
      qrRefs.current[targetId].getDataURL()
        .then(resolve)
        .catch(reject);
    });
  };

  const handleExportQr = async (target) => {
    try {
      const isSharingAvailable = await qrExportHelper.isSharingAvailable();
      if (!isSharingAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      setExportLoading(true);
      
      if (!target.token) {
        Alert.alert('Error', `No token found for this ${target.type}`);
        return;
      }
      
      const base64Data = await getQrDataUrl(target.id);
      if (!base64Data) {
        throw new Error('Failed to generate QR code image');
      }
      
      const fileUri = await qrExportHelper.saveQrCodeToFile(base64Data, target.data);
      await qrExportHelper.shareQrCode(fileUri, {
        title: `QR Code - ${target.name} (${target.type})`
      });
    } catch (error) {
      console.error('Error exporting QR code:', error);
      Alert.alert('Error', error.message || 'Failed to export QR code');
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
    targets,
    
    // Target selection helpers
    selectedTargets: selectedStudents.map(id => targets.find(t => t.id === id)).filter(Boolean),
    
    // Unified target handlers
    handleToggleTargetSelection: (target) => {
      if (target.type === 'student') {
        toggleStudentSelection(target.id);
      }
    },
    
    handleSelectAllTargets: () => {
      const studentTargets = targets.filter(t => t.type === 'student');
      if (selectedStudents.length === studentTargets.length) {
        setSelectedStudents([]);
      } else {
        setSelectedStudents(studentTargets.map(t => t.id));
      }
    },
    
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
    
    // Unified QR management
    qrRefs,
    setQrRef,
    
    // Unified handlers
    handleGenerateToken,
    handleExportQr,
    
    // Batch operations
    handleBatchGenerate: () => {
      const selectedTargets = targets.filter(t => 
        t.type === 'student' && selectedStudents.includes(t.id)
      );
      
      if (selectedTargets.length === 0) {
        Alert.alert('No Students Selected', 'Please select at least one student.');
        return;
      }
      
      return handleGenerateBatchTokens();
    },
    
    handleBatchExport: () => {
      const selectedTargets = targets.filter(t => 
        t.type === 'student' && selectedStudents.includes(t.id)
      );
      
      if (selectedTargets.length === 0) {
        Alert.alert('No Students Selected', 'Please select at least one student.');
        return;
      }
      
      return handleExportBatchQr();
    },
    
    // Legacy handlers (for compatibility)
    handleKelompokChange,
    toggleStudentSelection,
    selectAllStudents,
    handleGenerateBatchTokens,
    handleExportBatchQr,
    getQrDataUrl,
    
    // Functions
    fetchAllStudents,
    fetchStudentsByKelompok,
    fetchKelompokList
  };
};