import api from '../../../api/axiosConfig';

export const tutorHonorApi = {
  getTutorHonor: async (tutorId, params = {}) => {
    return await api.get(`/admin-shelter/tutor-honor/tutor/${tutorId}`, { params });
  },

  getHonorHistory: async (tutorId, params = {}) => {
    return await api.get(`/admin-shelter/tutor-honor/tutor/${tutorId}/history`, { params });
  },

  getHonorStatistics: async (tutorId, params = {}) => {
    return await api.get(`/admin-shelter/tutor-honor/tutor/${tutorId}/statistics`, { params });
  },

  getMonthlyDetail: async (tutorId, month, year) => {
    return await api.get(`/admin-shelter/tutor-honor/tutor/${tutorId}/month/${month}/year/${year}`);
  },

  calculateHonor: async (tutorId, data) => {
    return await api.post(`/admin-shelter/tutor-honor/calculate/${tutorId}`, data);
  },

  approveHonor: async (honorId) => {
    return await api.post(`/admin-shelter/tutor-honor/approve/${honorId}`);
  },

  markAsPaid: async (honorId) => {
    return await api.post(`/admin-shelter/tutor-honor/mark-paid/${honorId}`);
  },

  getHonorStats: async (params = {}) => {
    return await api.get('/admin-shelter/tutor-honor/stats', { params });
  }
};