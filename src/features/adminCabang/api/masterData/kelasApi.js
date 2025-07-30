import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data';

export const kelasApi = {
  // Get all kelas with pagination
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/kelas`, { params });
    return response.data;
  },

  // Get kelas by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/kelas/${id}`);
    return response.data;
  },

  // Create new kelas
  create: async (data) => {
    const response = await api.post(`${BASE_URL}/kelas`, data);
    return response.data;
  },

  // Update kelas
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/kelas/${id}`, data);
    return response.data;
  },

  // Delete kelas
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/kelas/${id}`);
    return response.data;
  },

  // Get statistics
  getStatistics: async () => {
    const response = await api.get(`${BASE_URL}/kelas-statistics`);
    return response.data;
  },

  // Get dropdown data
  getDropdown: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/kelas-dropdown`, { params });
    return response.data;
  },

  // Get kelas by jenjang
  getByJenjang: async (jenjangId, params = {}) => {
    const response = await api.get(`${BASE_URL}/kelas-jenjang/${jenjangId}`, { params });
    return response.data;
  },

  // Get cascade data (jenjang, tingkat options, etc.)
  getCascadeData: async () => {
    const response = await api.get(`${BASE_URL}/kelas-cascade-data`);
    return response.data;
  },

  // Check urutan availability (now with jenis_kelas)
  checkUrutan: async (urutan, jenjangId, jenisKelas, excludeId = null) => {
    const response = await api.get(`${BASE_URL}/kelas-check-urutan`, {
      params: { 
        urutan, 
        id_jenjang: jenjangId,
        jenis_kelas: jenisKelas,
        exclude_id: excludeId 
      }
    });
    return response.data;
  },

  // Get existing urutan for jenjang + jenis_kelas
  getExistingUrutan: async (jenjangId = null, jenisKelas = null) => {
    const response = await api.get(`${BASE_URL}/kelas-existing-urutan`, {
      params: { 
        id_jenjang: jenjangId,
        jenis_kelas: jenisKelas
      }
    });
    return response.data;
  }
};

export default kelasApi;