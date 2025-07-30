import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/akademik';

export const kurikulumApi = {
  // Get all kurikulum with pagination
  getAll: async (params = {}) => {
    const response = await api.get(`${BASE_URL}/kurikulum`, { params });
    return response.data;
  },

  // Get kurikulum by ID
  getById: async (id) => {
    const response = await api.get(`${BASE_URL}/kurikulum/${id}`);
    return response.data;
  },

  // Create new kurikulum
  create: async (data) => {
    const response = await api.post(`${BASE_URL}/kurikulum`, data);
    return response.data;
  },

  // Update kurikulum
  update: async (id, data) => {
    const response = await api.put(`${BASE_URL}/kurikulum/${id}`, data);
    return response.data;
  },

  // Delete kurikulum
  delete: async (id) => {
    const response = await api.delete(`${BASE_URL}/kurikulum/${id}`);
    return response.data;
  },

  // Assign materi to kurikulum
  assignMateri: async (id, materiIds) => {
    const response = await api.post(`${BASE_URL}/kurikulum/${id}/assign-materi`, {
      materi_ids: materiIds
    });
    return response.data;
  },

  // Remove materi from kurikulum
  removeMateri: async (id, materiId) => {
    const response = await api.delete(`${BASE_URL}/kurikulum/${id}/remove-materi/${materiId}`);
    return response.data;
  },

  // Reorder materi in kurikulum
  reorderMateri: async (id, materiOrders) => {
    const response = await api.post(`${BASE_URL}/kurikulum/${id}/reorder-materi`, {
      materi_orders: materiOrders
    });
    return response.data;
  },

  // Get available materi for assignment
  getAvailableMateri: async (id, params = {}) => {
    const response = await api.get(`${BASE_URL}/kurikulum/${id}/available-materi`, { params });
    return response.data;
  },

  // Set kurikulum as active
  setActive: async (id) => {
    const response = await api.post(`${BASE_URL}/kurikulum/${id}/set-active`);
    return response.data;
  },

  // Get general statistics
  getStatistics: async () => {
    const response = await api.get(`${BASE_URL}/statistics`);
    return response.data;
  }
};

export default kurikulumApi;