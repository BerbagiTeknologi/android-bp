import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data';

export const materiApi = {
  // Get all materi with cascade filtering
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/materi`, { params });
    return response.data;
  },

  // Get materi by ID with relationships
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/materi/${id}`);
    return response.data;
  },

  // Create new materi with triple dependency validation
  create: async (data) => {
    const response = await api.post(`${BASE_URL}/materi`, data);
    return response.data;
  },

  // Update materi
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/materi/${id}`, data);
    return response.data;
  },

  // Delete materi with usage validation
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/materi/${id}`);
    return response.data;
  },

  // Get statistics with usage analytics
  getStatistics: async () => {
    const response = await api.get(`${BASE_URL}/materi-statistics`);
    return response.data;
  },

  // Get dropdown data with cascade filtering
  getDropdown: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/materi-dropdown`, { params });
    return response.data;
  },

  // Get cascade data for triple dependencies
  getCascadeData: async () => {
    const response = await api.get(`${BASE_URL}/materi-cascade-data`);
    return response.data;
  },

  // Get materi by mata pelajaran
  getByMataPelajaran: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/materi-mata-pelajaran`, { params });
    return response.data;
  },

  // Get materi by kelas
  getByKelas: async (kelasId, params = {}) => {
    const response = await api.get(`${BASE_URL}/materi-kelas/${kelasId}`, { params });
    return response.data;
  },

  // Get usage analytics for specific materi
  getUsageAnalytics: async (materiId) => {
    const response = await api.get(`${BASE_URL}/materi/${materiId}/usage-analytics`);
    return response.data;
  },

  // Bulk operations
  bulkDelete: async (ids) => {
    const response = await api.post(`${BASE_URL}/materi/bulk-delete`, { ids });
    return response.data;
  },

  // Export data
  exportData: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/materi/export`, { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // Import data
  importData: async (formData) => {
    const response = await api.post(`${BASE_URL}/materi/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }
};

export default materiApi;