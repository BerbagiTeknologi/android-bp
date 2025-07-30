import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data';

export const jenjangApi = {
  // Get all jenjang with pagination
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/jenjang`, { params });
    return response.data;
  },

  // Get jenjang by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/jenjang/${id}`);
    return response.data;
  },

  // Create new jenjang
  create: async (data) => {
    const response = await api.post(`${BASE_URL}/jenjang`, data);
    return response.data;
  },

  // Update jenjang
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/jenjang/${id}`, data);
    return response.data;
  },

  // Delete jenjang
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/jenjang/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get(`${BASE_URL}/jenjang-statistics`);
    return response.data;
  },

  // Get dropdown data
  getDropdown: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/jenjang-dropdown`, { params });
    return response.data;
  },

  // Check urutan availability
  checkUrutan: async (urutan, excludeId = null) => {
    const response = await api.get(`${BASE_URL}/jenjang-check-urutan`, {
      params: { urutan, exclude_id: excludeId }
    });
    return response.data;
  },

  // Get existing urutan
  getExistingUrutan: async () => {
    const response = await api.get(`${BASE_URL}/jenjang-existing-urutan`);
    return response.data;
  }
};

export default jenjangApi;