import api from '../../../api/axiosConfig';

export const kurikulumShelterApi = {
  /**
   * Get all kurikulum available for shelter (from cabang)
   */
  getAllKurikulum: async (params = {}) => {
    return await api.get('/admin-shelter/kurikulum', { params });
  },

  /**
   * Get kurikulum detail
   */
  getKurikulumDetail: async (id) => {
    return await api.get(`/admin-shelter/kurikulum/${id}`);
  },

  /**
   * Get kurikulum preview for selection
   */
  getKurikulumPreview: async (id) => {
    return await api.get(`/admin-shelter/kurikulum/${id}/preview`);
  },

  /**
   * Get kurikulum for dropdown
   */
  getForDropdown: async () => {
    return await api.get('/admin-shelter/kurikulum-dropdown');
  },

  /**
   * Get kurikulum list (alias for getAllKurikulum)
   */
  getKurikulumList: async (params = {}) => {
    return await api.get('/admin-shelter/kurikulum', { params });
  }
};