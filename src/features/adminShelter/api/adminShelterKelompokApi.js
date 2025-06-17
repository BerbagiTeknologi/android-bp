import api from '../../../api/axiosConfig';

/**
 * Admin Shelter Kelompok API service
 * Contains methods for kelompok (group) management API requests
 */
export const adminShelterKelompokApi = {
  /**
   * Get list of kelompok
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with kelompok data
   */
  getAllKelompok: async (params = {}) => {
    return await api.get('/admin-shelter/kelompok', { params });
  },

  /**
   * Get kelompok details
   * @param {number|string} id - Kelompok ID
   * @returns {Promise} - API response with kelompok details
   */
  getKelompokDetail: async (id) => {
    return await api.get(`/admin-shelter/kelompok/${id}`);
  },

  /**
   * Create new kelompok
   * @param {Object} kelompokData - Kelompok data
   * @returns {Promise} - API response
   */
  createKelompok: async (kelompokData) => {
    return await api.post('/admin-shelter/kelompok', kelompokData);
  },

  /**
   * Update kelompok
   * @param {number|string} id - Kelompok ID
   * @param {Object} kelompokData - Kelompok data
   * @returns {Promise} - API response
   */
  updateKelompok: async (id, kelompokData) => {
    return await api.post(`/admin-shelter/kelompok/${id}`, kelompokData);
  },

  /**
   * Delete kelompok
   * @param {number|string} id - Kelompok ID
   * @returns {Promise} - API response
   */
  deleteKelompok: async (id) => {
    return await api.delete(`/admin-shelter/kelompok/${id}`);
  },

  /**
   * Get levels for kelompok
   * @returns {Promise} - API response with levels data
   */
  getLevels: async () => {
    return await api.get('/admin-shelter/kelompok-levels');
  },

  /**
   * Get available children for kelompok
   * @param {number|string} shelterId - Shelter ID
   * @returns {Promise} - API response with available children data
   */
  getAvailableChildren: async (shelterId) => {
    return await api.get(`/admin-shelter/kelompok/available-children/${shelterId}`);
  },

  /**
   * Get children in a kelompok
   * @param {number|string} kelompokId - Kelompok ID
   * @returns {Promise} - API response with kelompok children
   */
  getGroupChildren: async (kelompokId) => {
    return await api.get(`/admin-shelter/kelompok/${kelompokId}/children`);
  },

  /**
 * Add child to kelompok
 * @param {number|string} kelompokId - Kelompok ID
 * @param {Object} data - Request data with id_anak
 * @returns {Promise} - API response
 */
addChildToGroup: async (kelompokId, data) => {
  return await api.post(`/admin-shelter/kelompok/${kelompokId}/add-child`, data);
},

  /**
   * Remove child from kelompok
   * @param {number|string} kelompokId - Kelompok ID
   * @param {number|string} childId - Child ID
   * @returns {Promise} - API response
   */
  removeChildFromGroup: async (kelompokId, childId) => {
    return await api.delete(`/admin-shelter/kelompok/${kelompokId}/remove-child/${childId}`);
  },

  /**
   * Move child to different shelter
   * @param {number|string} childId - Child ID
   * @param {number|string} shelterId - Shelter ID
   * @returns {Promise} - API response
   */
  moveChildToShelter: async (childId, shelterId) => {
    return await api.post(`/admin-shelter/move-child/${childId}`, { id_shelter_baru: shelterId });
  }
};