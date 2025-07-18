import api from '../../../../api/axiosConfig';

const BASE_URL = '/admin-cabang/master-data/jenjang';

export const jenjangApi = {
  /**
   * Get all jenjang with optional filters
   * @param {Object} params - Query parameters (search, page, limit, etc)
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
   * Create new jenjang
   * @param {Object} data - Jenjang data
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
   * Get jenjang by ID
   * @param {number|string} id - Jenjang ID
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
   * Update jenjang
   * @param {number|string} id - Jenjang ID
   * @param {Object} data - Updated jenjang data
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
   * Delete jenjang
   * @param {number|string} id - Jenjang ID
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
   * Get jenjang for dropdown (simplified data)
   * @returns {Promise} API response with dropdown options
   */
  getForDropdown: async () => {
    try {
      return await api.get(`${BASE_URL}/dropdown`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get jenjang statistics
   * @returns {Promise} API response with statistics
   */
  getStatistics: async () => {
    try {
      return await api.get(`${BASE_URL}/statistics`);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Check if urutan is available
   * @param {number} urutan - Urutan to check
   * @param {number|string} excludeId - ID to exclude (for edit mode)
   * @returns {Promise} API response with availability status
   */
  checkUrutanAvailability: async (urutan, excludeId = null) => {
    try {
      const params = { urutan };
      if (excludeId) {
        params.exclude_id = excludeId;
      }
      return await api.get(`${BASE_URL}/check-urutan`, { params });
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get all existing urutan values
   * @returns {Promise} API response with existing urutan array
   */
  getExistingUrutan: async () => {
    try {
      return await api.get(`${BASE_URL}/existing-urutan`);
    } catch (error) {
      throw error;
    }
  }
};