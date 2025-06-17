import api from '../../../api/axiosConfig';
import { ADMIN_CABANG_ENDPOINTS, MANAGEMENT_ENDPOINTS } from '../../../constants/endpoints';

/**
 * Admin Cabang API service
 * Contains methods for admin cabang specific API requests
 */
export const adminCabangApi = {
  /**
   * Get admin cabang dashboard data
   * @returns {Promise} - API response with dashboard data
   */
  getDashboard: async () => {
    return await api.get(ADMIN_CABANG_ENDPOINTS.DASHBOARD);
  },

  /**
   * Get admin cabang profile
   * @returns {Promise} - API response with profile data
   */
  getProfile: async () => {
    return await api.get(ADMIN_CABANG_ENDPOINTS.PROFILE);
  },

  /**
   * Update admin cabang profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise} - API response
   */
  updateProfile: async (profileData) => {
    return await api.post(ADMIN_CABANG_ENDPOINTS.PROFILE, profileData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Get list of wilbin (wilayah binaan)
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with wilbin data
   */
  getWilbin: async (params = {}) => {
    return await api.get(MANAGEMENT_ENDPOINTS.WILBIN, { params });
  },

  /**
   * Get wilbin details
   * @param {number|string} wilbinId - Wilbin ID
   * @returns {Promise} - API response with wilbin details
   */
  getWilbinDetail: async (wilbinId) => {
    return await api.get(MANAGEMENT_ENDPOINTS.WILBIN_DETAIL(wilbinId));
  },

  /**
   * Create new wilbin
   * @param {Object} wilbinData - Wilbin data
   * @returns {Promise} - API response
   */
  createWilbin: async (wilbinData) => {
    return await api.post(MANAGEMENT_ENDPOINTS.WILBIN, wilbinData);
  },

  /**
   * Update wilbin
   * @param {number|string} wilbinId - Wilbin ID
   * @param {Object} wilbinData - Wilbin data
   * @returns {Promise} - API response
   */
  updateWilbin: async (wilbinId, wilbinData) => {
    return await api.put(MANAGEMENT_ENDPOINTS.WILBIN_DETAIL(wilbinId), wilbinData);
  },

  /**
   * Delete wilbin
   * @param {number|string} wilbinId - Wilbin ID
   * @returns {Promise} - API response
   */
  deleteWilbin: async (wilbinId) => {
    return await api.delete(MANAGEMENT_ENDPOINTS.WILBIN_DETAIL(wilbinId));
  },

  /**
   * Get list of shelters
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with shelter data
   */
  getShelters: async (params = {}) => {
    return await api.get(MANAGEMENT_ENDPOINTS.SHELTER, { params });
  },

  /**
   * Get shelter details
   * @param {number|string} shelterId - Shelter ID
   * @returns {Promise} - API response with shelter details
   */
  getShelterDetail: async (shelterId) => {
    return await api.get(MANAGEMENT_ENDPOINTS.SHELTER_DETAIL(shelterId));
  },

  /**
   * Create new shelter
   * @param {Object} shelterData - Shelter data
   * @returns {Promise} - API response
   */
  createShelter: async (shelterData) => {
    return await api.post(MANAGEMENT_ENDPOINTS.SHELTER, shelterData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update shelter
   * @param {number|string} shelterId - Shelter ID
   * @param {Object} shelterData - Shelter data
   * @returns {Promise} - API response
   */
  updateShelter: async (shelterId, shelterData) => {
    return await api.post(MANAGEMENT_ENDPOINTS.SHELTER_DETAIL(shelterId), shelterData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete shelter
   * @param {number|string} shelterId - Shelter ID
   * @returns {Promise} - API response
   */
  deleteShelter: async (shelterId) => {
    return await api.delete(MANAGEMENT_ENDPOINTS.SHELTER_DETAIL(shelterId));
  },

  /**
   * Get list of admin shelter
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with admin shelter data
   */
  getAdminShelters: async (params = {}) => {
    return await api.get('/admin-shelter', { params });
  },

  /**
   * Get admin shelter details
   * @param {number|string} adminShelterId - Admin Shelter ID
   * @returns {Promise} - API response with admin shelter details
   */
  getAdminShelterDetail: async (adminShelterId) => {
    return await api.get(`/admin-shelter/${adminShelterId}`);
  },

  /**
   * Create new admin shelter
   * @param {Object} adminShelterData - Admin Shelter data
   * @returns {Promise} - API response
   */
  createAdminShelter: async (adminShelterData) => {
    return await api.post('/admin-shelter', adminShelterData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update admin shelter
   * @param {number|string} adminShelterId - Admin Shelter ID
   * @param {Object} adminShelterData - Admin Shelter data
   * @returns {Promise} - API response
   */
  updateAdminShelter: async (adminShelterId, adminShelterData) => {
    return await api.post(`/admin-shelter/${adminShelterId}`, adminShelterData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Delete admin shelter
   * @param {number|string} adminShelterId - Admin Shelter ID
   * @returns {Promise} - API response
   */
  deleteAdminShelter: async (adminShelterId) => {
    return await api.delete(`/admin-shelter/${adminShelterId}`);
  }
};