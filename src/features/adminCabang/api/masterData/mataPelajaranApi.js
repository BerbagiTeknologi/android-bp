import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data';

export const mataPelajaranApi = {
  // Get all mata pelajaran with pagination and filters
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/mata-pelajaran`, { params });
    return response.data;
  },

  // Get mata pelajaran by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/mata-pelajaran/${id}`);
    return response.data;
  },

  // Create new mata pelajaran
  create: async (data) => {
    const response = await api.post(`${BASE_URL}/mata-pelajaran`, data);
    return response.data;
  },

  // Update mata pelajaran
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/mata-pelajaran/${id}`, data);
    return response.data;
  },

  // Delete mata pelajaran
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/mata-pelajaran/${id}`);
    return response.data;
  },

  // Get mata pelajaran by jenjang (dependency)
  getByJenjang: async (jenjangId) => {
    const response = await api.get(`${BASE_URL}/mata-pelajaran-jenjang/${jenjangId}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get(`${BASE_URL}/mata-pelajaran-statistics`);
    return response.data;
  },

  // Get dropdown data
  getDropdown: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/mata-pelajaran-dropdown`, { params });
    return response.data;
  },

  // Get cascade data (jenjang + mata pelajaran)
  getCascadeData: async () => {
    const response = await api.get(`${BASE_URL}/mata-pelajaran-cascade-data`);
    return response.data;
  }
};

export default mataPelajaranApi;