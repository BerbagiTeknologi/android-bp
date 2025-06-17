import api from '../../../api/axiosConfig';
import { ADMIN_PUSAT_ENDPOINTS } from '../../../constants/endpoints';

/**
 * Admin Pusat Keluarga API service
 * Contains methods for family management API requests
 */
export const adminPusatKeluargaApi = {
  /**
   * Get list of families
   * @param {Object} params - Query parameters
   * @returns {Promise} - API response with families data
   */
  getAllKeluarga: async (params = {}) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.KELUARGA.LIST, { params });
  },

  /**
   * Get family details
   * @param {number|string} id - Family ID
   * @returns {Promise} - API response with family details
   */
  getKeluargaDetail: async (id) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.KELUARGA.DETAIL(id));
  },

  /**
   * Create new family
   * @param {Object} keluargaData - Family data (FormData object)
   * @returns {Promise} - API response
   */
  createKeluarga: async (keluargaData) => {
    return await api.post(ADMIN_PUSAT_ENDPOINTS.KELUARGA.LIST, keluargaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Increase timeout to 30 seconds
    });
  },

  /**
   * Update existing family
   * @param {number|string} id - Family ID
   * @param {Object} keluargaData - Family data to update (FormData object)
   * @returns {Promise} - API response
   */
  updateKeluarga: async (id, keluargaData) => {
    return await api.post(ADMIN_PUSAT_ENDPOINTS.KELUARGA.DETAIL(id), keluargaData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 30000, // Increase timeout to 30 seconds
    });
  },

  /**
   * Delete family
   * @param {number|string} id - Family ID
   * @returns {Promise} - API response
   */
  deleteKeluarga: async (id) => {
    return await api.delete(ADMIN_PUSAT_ENDPOINTS.KELUARGA.DETAIL(id));
  },

  /**
   * Get dropdown data for forms (kacab, bank, etc.)
   * @returns {Promise} - API response with dropdown data
   */
  getDropdownData: async () => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.KELUARGA.DROPDOWN);
  },

  /**
   * Get wilbin options based on kacab selection
   * @param {number|string} kacabId - Kacab ID
   * @returns {Promise} - API response with wilbin options
   */
  getWilbinByKacab: async (kacabId) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.KELUARGA.WILBIN_BY_KACAB(kacabId));
  },

  /**
   * Get shelter options based on wilbin selection
   * @param {number|string} wilbinId - Wilbin ID
   * @returns {Promise} - API response with shelter options
   */
  getShelterByWilbin: async (wilbinId) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.KELUARGA.SHELTER_BY_WILBIN(wilbinId));
  }
};