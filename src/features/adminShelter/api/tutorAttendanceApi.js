import api from '../../../api/axiosConfig';

export const tutorAttendanceApi = {
  generateTutorToken: async (id_tutor, validDays = 30) => {
    return await api.post('/admin-shelter/tutor-attendance/generate-token', {
      id_tutor,
      valid_days: validDays
    });
  },

  validateTutorToken: async (token) => {
    return await api.post('/admin-shelter/tutor-attendance/validate-tutor-token', {
      token
    });
  },

  recordTutorAttendanceByQr: async (id_aktivitas, token, arrival_time = null, gps_data = null) => {
    const params = {
      id_aktivitas,
      token
    };
    
    if (arrival_time) {
      params.arrival_time = arrival_time;
    }
    
    if (gps_data) {
      params.gps_data = gps_data;
    }
    
    return await api.post('/admin-shelter/tutor-attendance/record-by-qr', params);
  },

  recordTutorAttendanceManually: async (id_tutor, id_aktivitas, status, notes = '', arrival_time = null, gps_data = null) => {
    const params = {
      id_tutor,
      id_aktivitas,
      notes
    };
    
    if (status) {
      params.status = status;
    }
    
    if (arrival_time) {
      params.arrival_time = arrival_time;
    }
    
    if (gps_data) {
      params.gps_data = gps_data;
    }
    
    return await api.post('/admin-shelter/tutor-attendance/record-manual', params);
  },

  getTutorAttendanceByActivity: async (id_aktivitas) => {
    return await api.get(`/admin-shelter/tutor-attendance/activity/${id_aktivitas}`);
  },

  getTutorAttendanceHistory: async (id_tutor, filters = {}) => {
    return await api.get(`/admin-shelter/tutor-attendance/tutor/${id_tutor}`, {
      params: filters
    });
  }
};