import api from '../../../api/axiosConfig';

/**
 * QR Token API service
 * Contains methods for QR token management API requests
 */
export const qrTokenApi = {
  /**
   * Generate a QR token for a student
   * @param {number|string} id_anak - Student ID
   * @param {number} validDays - Number of days token should be valid
   * @returns {Promise} - API response with generated token
   */
  generateToken: async (id_anak, validDays = 30) => {
    return await api.post('/admin-shelter/qr-tokens/generate', {
      id_anak,
      valid_days: validDays
    });
  },

  /**
   * Generate QR tokens for multiple students
   * @param {Array} studentIds - Array of student IDs
   * @param {number} validDays - Number of days tokens should be valid
   * @returns {Promise} - API response with generated tokens
   */
  generateBatchTokens: async (studentIds, validDays = 30) => {
    return await api.post('/admin-shelter/qr-tokens/generate-batch', {
      student_ids: studentIds,
      valid_days: validDays
    });
  },

  /**
   * Validate a QR token
   * @param {string} token - QR token string
   * @returns {Promise} - API response with validation result
   */
 validateToken: async (token) => {
    return await api.post('/admin-shelter/qr-tokens/validate-token', {
        token
    });
},

  /**
   * Get active QR token for a student
   * @param {number|string} id_anak - Student ID
   * @returns {Promise} - API response with student's active token
   */
  getActiveToken: async (id_anak) => {
    return await api.get(`/admin-shelter/qr-tokens/student/${id_anak}`);
  },

  /**
   * Invalidate a QR token
   * @param {string} token - QR token to invalidate
   * @returns {Promise} - API response
   */
  invalidateToken: async (token) => {
    return await api.post('/admin-shelter/qr-tokens/invalidate', {
      token
    });
  }
};