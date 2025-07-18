import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data/mata-pelajaran';

export const mataPelajaranApi = {
  /**
   * Get all mata pelajaran with optional filters
   * @param {Object} params - Query parameters (search, jenjang_id, page, limit, etc)
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
   * Create new mata pelajaran
   * @param {Object} data - Mata pelajaran data
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
   * Get mata pelajaran by ID
   * @param {number|string} id - Mata pelajaran ID
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
   * Update mata pelajaran
   * @param {number|string} id - Mata pelajaran ID
   * @param {Object} data - Updated mata pelajaran data
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
   * Delete mata pelajaran
   * @param {number|string} id - Mata pelajaran ID
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
   * Get mata pelajaran for dropdown (simplified data)
   * @param {Object} params - Optional filters (jenjang_id)
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
   * Get mata pelajaran by jenjang
   * @param {number|string} jenjangId - Jenjang ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise} API response
   */
  getByJenjang: async (jenjangId, params = {}) => {
    try {
      return await api.get(`${BASE_URL}/by-jenjang/${jenjangId}`, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get cascade data (jenjang + mata pelajaran)
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
   * Get mata pelajaran statistics
   * @param {Object} params - Filter parameters (jenjang_id, etc)
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