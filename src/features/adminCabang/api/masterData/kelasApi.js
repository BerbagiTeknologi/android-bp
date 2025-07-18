import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data/kelas';

export const kelasApi = {
  /**
   * Get all kelas with optional filters
   * @param {Object} params - Query parameters (search, jenjang_id, tingkat, page, limit, etc)
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
   * Create new kelas
   * @param {Object} data - Kelas data
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
   * Get kelas by ID
   * @param {number|string} id - Kelas ID
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
   * Update kelas
   * @param {number|string} id - Kelas ID
   * @param {Object} data - Updated kelas data
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
   * Delete kelas
   * @param {number|string} id - Kelas ID
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
   * Get kelas for dropdown (simplified data)
   * @param {Object} params - Optional filters (jenjang_id, tingkat)
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
   * Get kelas by jenjang
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
   * Get cascade data (jenjang + kelas)
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
   * Get kelas statistics
   * @param {Object} params - Filter parameters (jenjang_id, tingkat, etc)
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