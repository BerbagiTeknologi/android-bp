import api from '../../../api/axiosConfig';
import { ADMIN_SHELTER_ENDPOINTS } from '../../../constants/endpoints';

/**
 * Aktivitas API service
 * Contains methods for aktivitas (activities) management API requests
 */
export const aktivitasApi = {
  /**
   * Get list of activities
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with activities data
   */
  getAllAktivitas: async (params = {}) => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.AKTIVITAS.LIST, { params });
  },

  /**
   * Get activity details
   * @param {number|string} id - Activity ID
   * @returns {Promise} - API response with activity details
   */
  getAktivitasDetail: async (id) => {
    return await api.get(ADMIN_SHELTER_ENDPOINTS.AKTIVITAS.DETAIL(id));
  },

  /**
   * Create new activity
   * @param {Object} aktivitasData - Activity data (FormData object)
   * @returns {Promise} - API response
   */
  createAktivitas: async (aktivitasData) => {
    // For FormData, the browser will automatically set the correct Content-Type with boundary
    return await api.post(ADMIN_SHELTER_ENDPOINTS.AKTIVITAS.CREATE, aktivitasData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Update existing activity
   * @param {number|string} id - Activity ID
   * @param {Object} aktivitasData - Activity data to update (FormData object)
   * @returns {Promise} - API response
   */
  updateAktivitas: async (id, aktivitasData) => {
    return await api.put(ADMIN_SHELTER_ENDPOINTS.AKTIVITAS.DETAIL(id), aktivitasData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  /**
   * Delete activity
   * @param {number|string} id - Activity ID
   * @returns {Promise} - API response
   */
  deleteAktivitas: async (id) => {
    return await api.delete(ADMIN_SHELTER_ENDPOINTS.AKTIVITAS.DETAIL(id));
  }
};