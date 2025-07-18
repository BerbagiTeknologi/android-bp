import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/akademik/kurikulum';

export const kurikulumApi = {
  getAll: async (params = {}) => {
    try {
      return await api.get(BASE_URL, { params });
    } catch (error) {
      throw error;
    }
  },

  create: async (data) => {
    try {
      return await api.post(BASE_URL, data);
    } catch (error) {
      throw error;
    }
  },

  getById: async (id) => {
    try {
      return await api.get(`${BASE_URL}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      return await api.put(`${BASE_URL}/${id}`, data);
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      return await api.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  assignMateri: async (kurikulumId, materiIds) => {
    try {
      return await api.post(`${BASE_URL}/${kurikulumId}/assign-materi`, { 
        materi_ids: materiIds 
      });
    } catch (error) {
      throw error;
    }
  },

  removeMateri: async (kurikulumId, materiId) => {
    try {
      return await api.delete(`${BASE_URL}/${kurikulumId}/remove-materi/${materiId}`);
    } catch (error) {
      throw error;
    }
  },

  reorderMateri: async (kurikulumId, materiOrder) => {
    try {
      return await api.post(`${BASE_URL}/${kurikulumId}/reorder-materi`, { 
        materi_orders: materiOrder 
      });
    } catch (error) {
      throw error;
    }
  },

  getAvailableMateri: async (kurikulumId, params = {}) => {
    try {
      return await api.get(`${BASE_URL}/${kurikulumId}/available-materi`, { params });
    } catch (error) {
      throw error;
    }
  },

  getGeneralStatistics: async () => {
    try {
      return await api.get('/admin-cabang/akademik/statistics');
    } catch (error) {
      throw error;
    }
  }
};