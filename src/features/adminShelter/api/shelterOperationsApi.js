import axios from 'axios';
import { getToken } from '../../../common/utils/storageHelpers';

// Base URL configuration
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

// Create axios instance with authentication
const createAuthenticatedRequest = async () => {
  const token = await getToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    timeout: 30000, // 30 seconds timeout
  });
};

/**
 * Shelter Operations API
 * Handles kurikulum consumption, semester management, and operational features
 * for Admin Shelter role with kelas gabungan support
 */
export const shelterOperationsApi = {
  
  // =================================
  // KURIKULUM BROWSING & CONSUMPTION
  // =================================
  
  /**
   * Get all materi from cabang (for frontend caching & filtering)
   * SIMPLIFIED approach - frontend handles filtering
   */
  async getAllMateri() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/all-materi');
  },
  
  /**
   * Get available kelas for kelompok form
   */
  async getAvailableKelas() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/available-kelas');
  },
  
  /**
   * Get active semester info
   */
  async getSemesterAktif() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/semester-aktif');
  },
  
  /**
   * Get materi detail for preview (replaces complex kurikulum browsing)
   */
  async getMateriDetail(materiId) {
    const api = await createAuthenticatedRequest();
    return api.get(`/admin-shelter/kurikulum/materi/${materiId}`);
  },
  
  // =================================
  // SIMPLIFIED KURIKULUM OPERATIONS  
  // =================================
  // Note: Complex operations removed per architecture guide
  // Frontend handles filtering, backend provides simple data
  
  // =================================
  // KELOMPOK OPERATIONS WITH KELAS GABUNGAN
  // =================================
  
  /**
   * Get enhanced kelompok list with kurikulum compatibility info
   */
  async getKelompokWithKurikulumInfo(params = {}) {
    const api = await createAuthenticatedRequest();
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    if (params.include_kurikulum_info) queryParams.append('include_kurikulum_info', 'true');
    
    return api.get(`/admin-shelter/kelompok/enhanced?${queryParams.toString()}`);
  },
  
  /**
   * Validate kelas gabungan compatibility for kurikulum application
   */
  async validateKelasGabunganCompatibility(kelompokId, kurikulumId) {
    const api = await createAuthenticatedRequest();
    return api.post('/admin-shelter/kurikulum/validate-compatibility', {
      kelompok_id: kelompokId,
      kurikulum_id: kurikulumId
    });
  },
  
  // =================================
  // PROGRESS TRACKING & REPORTING
  // =================================
  
  /**
   * Get kurikulum progress for a kelompok
   */
  async getKelompokKurikulumProgress(kelompokId, kurikulumId) {
    const api = await createAuthenticatedRequest();
    return api.get(`/admin-shelter/kelompok/${kelompokId}/kurikulum/${kurikulumId}/progress`);
  },
  
  /**
   * Update kurikulum progress for a kelompok
   */
  async updateKurikulumProgress(kelompokId, kurikulumId, progressData) {
    const api = await createAuthenticatedRequest();
    return api.put(`/admin-shelter/kelompok/${kelompokId}/kurikulum/${kurikulumId}/progress`, {
      completed_materi: progressData.completedMateri,
      completed_aktivitas: progressData.completedAktivitas,
      notes: progressData.notes,
      completion_percentage: progressData.completionPercentage
    });
  },
  
  /**
   * Generate kurikulum usage report
   */
  async generateKurikulumReport(params) {
    const api = await createAuthenticatedRequest();
    return api.post('/admin-shelter/reports/kurikulum-usage', {
      date_range: params.dateRange,
      kelompok_ids: params.kelompokIds,
      kurikulum_ids: params.kurikulumIds,
      report_type: params.reportType, // 'summary', 'detailed', 'progress'
      format: params.format || 'json' // 'json', 'excel', 'pdf'
    });
  },
  
  // =================================
  // FAVORITES & BOOKMARKS
  // =================================
  
  /**
   * Add kurikulum to favorites
   */
  async addKurikulumToFavorites(kurikulumId) {
    const api = await createAuthenticatedRequest();
    return api.post(`/admin-shelter/kurikulum/${kurikulumId}/favorite`);
  },
  
  /**
   * Remove kurikulum from favorites
   */
  async removeKurikulumFromFavorites(kurikulumId) {
    const api = await createAuthenticatedRequest();
    return api.delete(`/admin-shelter/kurikulum/${kurikulumId}/favorite`);
  },
  
  /**
   * Get favorite kurikulum list
   */
  async getFavoriteKurikulum(params = {}) {
    const api = await createAuthenticatedRequest();
    
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);
    
    return api.get(`/admin-shelter/kurikulum/favorites?${queryParams.toString()}`);
  },
  
  // =================================
  // NOTIFICATIONS & UPDATES
  // =================================
  
  /**
   * Get kurikulum update notifications
   */
  async getKurikulumNotifications() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/notifications');
  },
  
  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId) {
    const api = await createAuthenticatedRequest();
    return api.put(`/admin-shelter/notifications/${notificationId}/read`);
  },
  
  /**
   * Subscribe to kurikulum updates
   */
  async subscribeToKurikulumUpdates(kurikulumId) {
    const api = await createAuthenticatedRequest();
    return api.post(`/admin-shelter/kurikulum/${kurikulumId}/subscribe`);
  },
  
  /**
   * Unsubscribe from kurikulum updates
   */
  async unsubscribeFromKurikulumUpdates(kurikulumId) {
    const api = await createAuthenticatedRequest();
    return api.delete(`/admin-shelter/kurikulum/${kurikulumId}/subscribe`);
  },
  
  // =================================
  // UTILITY FUNCTIONS
  // =================================
  
  /**
   * Get system configuration for kurikulum features
   */
  async getKurikulumConfig() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/config');
  },
  
  /**
   * Get available jenjang and kelas options
   */
  async getJenjangKelasOptions() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/jenjang-kelas-options');
  },
  
  /**
   * Validate shelter permissions for kurikulum operations
   */
  async validateKurikulumPermissions() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/permissions');
  },
  
  /**
   * Get kurikulum categories and subjects
   */
  async getKurikulumCategories() {
    const api = await createAuthenticatedRequest();
    return api.get('/admin-shelter/kurikulum/categories');
  },
  
  /**
   * Export kurikulum data for backup
   */
  async exportKurikulumData(kurikulumIds) {
    const api = await createAuthenticatedRequest();
    return api.post('/admin-shelter/kurikulum/export', {
      kurikulum_ids: kurikulumIds,
      include_materi: true,
      include_aktivitas: true,
      format: 'json'
    });
  }
};

// Error handling helper
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        return {
          message: 'Session expired. Please login again.',
          code: 'UNAUTHORIZED',
          shouldLogout: true
        };
      case 403:
        return {
          message: 'You do not have permission to perform this action.',
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: 'Requested resource not found.',
          code: 'NOT_FOUND'
        };
      case 422:
        return {
          message: data.message || 'Validation error occurred.',
          code: 'VALIDATION_ERROR',
          errors: data.errors
        };
      case 500:
        return {
          message: 'Server error occurred. Please try again later.',
          code: 'SERVER_ERROR'
        };
      default:
        return {
          message: data.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR'
        };
    }
  } else if (error.request) {
    // Network error
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
  } else {
    // Other error
    return {
      message: error.message || 'An unknown error occurred.',
      code: 'CLIENT_ERROR'
    };
  }
};

// Request interceptor for debugging (development only)
if (__DEV__) {
  const originalRequest = shelterOperationsApi.browseKurikulum;
  
  // Add request logging for development
  Object.keys(shelterOperationsApi).forEach(method => {
    if (typeof shelterOperationsApi[method] === 'function') {
      const originalMethod = shelterOperationsApi[method];
      
      shelterOperationsApi[method] = async (...args) => {
        console.log(`[ShelterOperationsAPI] ${method}:`, args);
        
        try {
          const result = await originalMethod(...args);
          console.log(`[ShelterOperationsAPI] ${method} success:`, result.data);
          return result;
        } catch (error) {
          console.error(`[ShelterOperationsAPI] ${method} error:`, error);
          throw error;
        }
      };
    }
  });
}

export default shelterOperationsApi;