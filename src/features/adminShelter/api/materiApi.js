// src/features/adminShelter/api/materiApi.js
import api from '../../../api/axiosConfig';

/**
 * Materi API service
 * Contains methods for materi management API requests
 */
export const materiApi = {
  /**
   * Get materi by level
   * @param {number|string} levelId - Level ID
   * @returns {Promise} - API response with materi data
   */
  getMateriByLevel: async (levelId) => {
    return await api.get('/admin-shelter/materi/by-level', {
      params: { id_level_anak_binaan: levelId }
    });
  }
};