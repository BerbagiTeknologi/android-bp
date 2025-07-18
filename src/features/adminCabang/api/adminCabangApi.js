import api from '../../../api/axiosConfig';
import { ADMIN_CABANG_ENDPOINTS, MANAGEMENT_ENDPOINTS } from '../../../constants/endpoints';

// Import Master Data APIs
import { jenjangApi } from './masterData/jenjangApi';
import { mataPelajaranApi } from './masterData/mataPelajaranApi';
import { kelasApi } from './masterData/kelasApi';
import { materiApi } from './masterData/materiApi';

// Import Akademik APIs
import { kurikulumApi } from './akademik/kurikulumApi';

/**
 * Admin Cabang API service - Main entry point
 * Organized by sections: Core, Master Data, Akademik
 */
export const adminCabangApi = {
  // ==================== CORE ADMIN CABANG ====================
  
  /**
   * Get admin cabang dashboard data
   */
  getDashboard: async () => {
    return await api.get(ADMIN_CABANG_ENDPOINTS.DASHBOARD);
  },

  /**
   * Get admin cabang profile
   */
  getProfile: async () => {
    return await api.get(ADMIN_CABANG_ENDPOINTS.PROFILE);
  },

  /**
   * Update admin cabang profile
   */
  updateProfile: async (profileData) => {
    return await api.post(ADMIN_CABANG_ENDPOINTS.PROFILE, profileData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  /**
   * Get list of wilbin (wilayah binaan)
   */
  getWilbin: async (params = {}) => {
    return await api.get(MANAGEMENT_ENDPOINTS.WILBIN, { params });
  },

  /**
   * Get wilbin details
   */
  getWilbinDetail: async (wilbinId) => {
    return await api.get(MANAGEMENT_ENDPOINTS.WILBIN_DETAIL(wilbinId));
  },

  /**
   * Create new wilbin
   */
  createWilbin: async (wilbinData) => {
    return await api.post(MANAGEMENT_ENDPOINTS.WILBIN, wilbinData);
  },

  /**
   * Update wilbin
   */
  updateWilbin: async (wilbinId, wilbinData) => {
    return await api.put(MANAGEMENT_ENDPOINTS.WILBIN_DETAIL(wilbinId), wilbinData);
  },

  /**
   * Delete wilbin
   */
  deleteWilbin: async (wilbinId) => {
    return await api.delete(MANAGEMENT_ENDPOINTS.WILBIN_DETAIL(wilbinId));
  },

  // ==================== MASTER DATA SECTION ====================
  
  masterData: {
    jenjang: jenjangApi,
    mataPelajaran: mataPelajaranApi,
    kelas: kelasApi,
    materi: materiApi,
  },

  // ==================== AKADEMIK SECTION ====================
  
  akademik: {
    kurikulum: kurikulumApi,
  },

  // ==================== BACKWARD COMPATIBILITY ====================
  // Keep existing direct exports for backward compatibility
  
  jenjang: jenjangApi,
  mataPelajaran: mataPelajaranApi,
  kelas: kelasApi,
  materi: materiApi,
  kurikulum: kurikulumApi,
};

// ==================== DIRECT EXPORTS ====================
// Export individual APIs for direct import if needed

export { jenjangApi } from './masterData/jenjangApi';
export { mataPelajaranApi } from './masterData/mataPelajaranApi';
export { kelasApi } from './masterData/kelasApi';
export { materiApi } from './masterData/materiApi';
export { kurikulumApi } from './akademik/kurikulumApi';

// Default export
export default adminCabangApi;