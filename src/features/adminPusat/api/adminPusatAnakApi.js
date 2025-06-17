import api from '../../../api/axiosConfig';
import { ADMIN_PUSAT_ENDPOINTS } from '../../../constants/endpoints';

/**
 * Admin Pusat Anak API service
 * Contains methods for anak (children) management API requests
 */
export const adminPusatAnakApi = {
  /**
   * Get list of children with filters
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with children data
   */
  getAllAnak: async (params = {}) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.ANAK.LIST, { params });
  },

  /**
   * Get child details
   * @param {number|string} id - Child ID
   * @returns {Promise} - API response with child details
   */
  getAnakDetail: async (id) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.ANAK.DETAIL(id));
  },

  /**
   * Update existing child
   * @param {number|string} id - Child ID
   * @param {Object} anakData - Child data to update (FormData object)
   * @returns {Promise} - API response
   */
  updateAnak: async (id, anakData) => {
    return await api.post(ADMIN_PUSAT_ENDPOINTS.ANAK.DETAIL(id), anakData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * Toggle child status between 'aktif' and 'non-aktif'
   * @param {number|string} id - Child ID
   * @returns {Promise} - API response
   */
  toggleAnakStatus: async (id) => {
    return await api.post(ADMIN_PUSAT_ENDPOINTS.ANAK.TOGGLE_STATUS(id));
  },

  /**
   * Get summary statistics of children
   * @returns {Promise} - API response with summary data
   */
  getAnakSummary: async () => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.ANAK.SUMMARY);
  },

  /**
   * Get raport list for a specific child
   * @param {number|string} childId - Child ID
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with raport data
   */
  getRaports: async (childId, params = {}) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.RAPORT.LIST(childId), { params });
  },

  /**
   * Get raport details
   * @param {number|string} childId - Child ID
   * @param {number|string} raportId - Raport ID
   * @returns {Promise} - API response with raport details
   */
  getRaportDetail: async (childId, raportId) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.RAPORT.DETAIL(childId, raportId));
  },

  /**
   * Get prestasi list for a specific child
   * @param {number|string} childId - Child ID
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with prestasi data
   */
  getPrestasi: async (childId, params = {}) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.PRESTASI.LIST(childId), { params });
  },

  /**
   * Get prestasi details
   * @param {number|string} childId - Child ID
   * @param {number|string} prestasiId - Prestasi ID
   * @returns {Promise} - API response with prestasi details
   */
  getPrestasiDetail: async (childId, prestasiId) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.PRESTASI.DETAIL(childId, prestasiId));
  },

  /**
   * Get riwayat list for a specific child
   * @param {number|string} childId - Child ID
   * @param {Object} params - Query parameters for filtering and pagination
   * @returns {Promise} - API response with riwayat data
   */
  getRiwayat: async (childId, params = {}) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.RIWAYAT.LIST(childId), { params });
  },

  /**
   * Get riwayat details
   * @param {number|string} childId - Child ID
   * @param {number|string} riwayatId - Riwayat ID
   * @returns {Promise} - API response with riwayat details
   */
  getRiwayatDetail: async (childId, riwayatId) => {
    return await api.get(ADMIN_PUSAT_ENDPOINTS.RIWAYAT.DETAIL(childId, riwayatId));
  }
};