import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data/materi';

export const materiApi = {
  /**
   * Get all materi with optional filters
   * @param {Object} params - Query parameters (search, mata_pelajaran_id, kelas_id, page, limit, etc)
   * @returns {Promise} API response
   */
  getAll: async (params = {}) => {
    try {
      return await api.get(BASE_URL, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Create new materi
   * @param {Object} data - Materi data
   * @returns {Promise} API response
   */
  create: async (data) => {
    try {
      return await api.post(BASE_URL, data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get materi by ID
   * @param {number|string} id - Materi ID
   * @returns {Promise} API response
   */
  getById: async (id) => {
    try {
      return await api.get(`${BASE_URL}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Update materi
   * @param {number|string} id - Materi ID
   * @param {Object} data - Updated materi data
   * @returns {Promise} API response
   */
  update: async (id, data) => {
    try {
      return await api.put(`${BASE_URL}/${id}`, data);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Delete materi
   * @param {number|string} id - Materi ID
   * @returns {Promise} API response
   */
  delete: async (id) => {
    try {
      return await api.delete(`${BASE_URL}/${id}`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get materi for dropdown (simplified data)
   * @param {Object} params - Optional filters (mata_pelajaran_id, kelas_id)
   * @returns {Promise} API response with dropdown options
   */
  getForDropdown: async (params = {}) => {
    try {
      return await api.get(`${BASE_URL}/dropdown`, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get materi by kelas
   * @param {number|string} kelasId - Kelas ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  getByKelas: async (kelasId, params = {}) => {
    try {
      return await api.get(`${BASE_URL}/by-kelas/${kelasId}`, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get materi by mata pelajaran
   * @param {number|string} mataPelajaranId - Mata pelajaran ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  getByMataPelajaran: async (mataPelajaranId, params = {}) => {
    try {
      return await api.get(`${BASE_URL}/by-mata-pelajaran/${mataPelajaranId}`, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get cascade data (jenjang + mata pelajaran + kelas + materi)
   * @param {Object} params - Query parameters
   * @returns {Promise} API response with cascade data
   */
  getCascadeData: async (params = {}) => {
    try {
      return await api.get(`${BASE_URL}/cascade-data`, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get materi statistics
   * @param {Object} params - Filter parameters (mata_pelajaran_id, kelas_id, etc)
   * @returns {Promise} API response with statistics
   */
  getStatistics: async (params = {}) => {
    try {
      return await api.get(`${BASE_URL}/statistics`, { params });
    } catch (error) {
      throw error;
    }
  }
};