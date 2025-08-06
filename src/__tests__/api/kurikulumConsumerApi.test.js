import { configureStore } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

// Import the slice we're testing
import kurikulumConsumerReducer, {
  browseKurikulum,
  applyKurikulumToKelompok,
  getKurikulumSuggestions,
  getMateriCompatibility,
  selectKurikulumList,
  selectBrowseLoading,
  selectApplyLoading
} from '../../features/adminShelter/redux/kurikulumConsumerSlice';

/**
 * API Integration Tests for Kurikulum Consumer
 * Tests Redux slice integration with backend API endpoints
 */

describe('KurikulumConsumer API Integration Tests', () => {
  let store;
  let mockAxios;

  // Setup before each test
  beforeEach(() => {
    // Create mock axios instance
    mockAxios = new MockAdapter(axios);
    
    // Create test store
    store = configureStore({
      reducer: {
        kurikulumConsumer: kurikulumConsumerReducer
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
          serializableCheck: false
        })
    });
  });

  // Cleanup after each test
  afterEach(() => {
    mockAxios.restore();
  });

  describe('browseKurikulum API Integration', () => {
    const mockKurikulumData = {
      data: [
        {
          id_kurikulum: 1,
          nama_kurikulum: 'Matematika Dasar SD-SMP',
          semester: '2024/2025 Semester 1',
          jenjang_summary: ['SD', 'SMP'],
          kelas_gabungan: [
            { jenjang: 'SD', kelas: '4' },
            { jenjang: 'SD', kelas: '5' },
            { jenjang: 'SMP', kelas: '7' }
          ],
          total_materi: 45,
          total_aktivitas: 23,
          status: 'aktif'
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        hasMore: false
      }
    };

    test('should successfully fetch kurikulum list', async () => {
      // Mock successful API response
      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(200, mockKurikulumData);

      // Dispatch action
      const result = await store.dispatch(browseKurikulum({
        page: 1,
        per_page: 10,
        kelas_gabungan: [{ jenjang: 'SD', kelas: '4' }]
      }));

      // Assert action was fulfilled
      expect(result.type).toBe('kurikulumConsumer/browseKurikulum/fulfilled');
      
      // Assert state was updated correctly
      const state = store.getState();
      const kurikulumList = selectKurikulumList(state);
      const loading = selectBrowseLoading(state);

      expect(kurikulumList).toHaveLength(1);
      expect(kurikulumList[0].nama_kurikulum).toBe('Matematika Dasar SD-SMP');
      expect(loading).toBe(false);
    });

    test('should handle API error gracefully', async () => {
      // Mock API error response
      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(500, {
        message: 'Server error'
      });

      // Dispatch action
      const result = await store.dispatch(browseKurikulum({
        page: 1,
        per_page: 10
      }));

      // Assert action was rejected
      expect(result.type).toBe('kurikulumConsumer/browseKurikulum/rejected');
      
      // Assert error state was set
      const state = store.getState();
      expect(state.kurikulumConsumer.browseError).toBeTruthy();
      expect(selectBrowseLoading(state)).toBe(false);
    });

    test('should include kelas gabungan filter in API call', async () => {
      const kelasGabungan = [
        { jenjang: 'SD', kelas: '4' },
        { jenjang: 'SD', kelas: '5' }
      ];

      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(config => {
        // Verify kelas_gabungan parameter is included
        expect(config.params.kelas_gabungan).toBeDefined();
        expect(JSON.parse(config.params.kelas_gabungan)).toEqual(kelasGabungan);
        
        return [200, mockKurikulumData];
      });

      await store.dispatch(browseKurikulum({
        kelas_gabungan: kelasGabungan
      }));
    });
  });

  describe('applyKurikulumToKelompok API Integration', () => {
    const mockApplicationData = {
      kurikulumId: 1,
      kelompokId: 1,
      semesterId: 1,
      kelasGabungan: [
        { jenjang: 'SD', kelas: '4' },
        { jenjang: 'SD', kelas: '5' }
      ]
    };

    test('should successfully apply kurikulum to kelompok', async () => {
      const mockResponse = {
        data: {
          id: 1,
          kurikulum_id: 1,
          kelompok_id: 1,
          status: 'applied',
          applied_date: '2024-02-01'
        }
      };

      mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok').reply(200, mockResponse);

      const result = await store.dispatch(applyKurikulumToKelompok(mockApplicationData));

      expect(result.type).toBe('kurikulumConsumer/applyKurikulumToKelompok/fulfilled');
      
      const state = store.getState();
      expect(selectApplyLoading(state)).toBe(false);
      expect(state.kurikulumConsumer.applySuccess).toBe(true);
    });

    test('should handle validation errors for kurikulum application', async () => {
      const mockValidationError = {
        message: 'Validation error',
        errors: {
          kelas_gabungan: ['Invalid kelas gabungan combination']
        }
      };

      mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok').reply(422, mockValidationError);

      const result = await store.dispatch(applyKurikulumToKelompok(mockApplicationData));

      expect(result.type).toBe('kurikulumConsumer/applyKurikulumToKelompok/rejected');
      expect(result.payload).toContain('Validation error');
    });

    test('should include all required data in API call', async () => {
      mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok').reply(config => {
        const requestData = JSON.parse(config.data);
        
        expect(requestData.kurikulum_id).toBe(mockApplicationData.kurikulumId);
        expect(requestData.kelompok_id).toBe(mockApplicationData.kelompokId);
        expect(requestData.kelas_gabungan).toEqual(mockApplicationData.kelasGabungan);
        
        return [200, { data: { success: true } }];
      });

      await store.dispatch(applyKurikulumToKelompok(mockApplicationData));
    });
  });

  describe('getKurikulumSuggestions API Integration', () => {
    const mockSuggestions = {
      data: [
        {
          id_kurikulum: 1,
          nama_kurikulum: 'Suggested Kurikulum',
          compatibility_score: 85,
          reason: 'High compatibility with selected kelas gabungan'
        }
      ]
    };

    test('should fetch kurikulum suggestions for kelompok', async () => {
      const kelompokId = 1;
      
      mockAxios.onGet(`/admin-shelter/kelompok/${kelompokId}/kurikulum-suggestions`)
        .reply(200, mockSuggestions);

      const result = await store.dispatch(getKurikulumSuggestions(kelompokId));

      expect(result.type).toBe('kurikulumConsumer/getKurikulumSuggestions/fulfilled');
      
      const state = store.getState();
      expect(state.kurikulumConsumer.suggestions).toHaveLength(1);
      expect(state.kurikulumConsumer.suggestionsLoading).toBe(false);
    });
  });

  describe('getMateriCompatibility API Integration', () => {
    const mockCompatibilityData = {
      data: {
        'SD': { '4': 12, '5': 15 },
        'SMP': { '7': 20 }
      }
    };

    test('should fetch materi compatibility for kelas gabungan', async () => {
      const kelasGabungan = [
        { jenjang: 'SD', kelas: '4' },
        { jenjang: 'SD', kelas: '5' }
      ];

      mockAxios.onPost('/admin-shelter/kurikulum/materi-compatibility')
        .reply(200, mockCompatibilityData);

      const result = await store.dispatch(getMateriCompatibility(kelasGabungan));

      expect(result.type).toBe('kurikulumConsumer/getMateriCompatibility/fulfilled');
      
      const state = store.getState();
      expect(state.kurikulumConsumer.materiCompatibility).toEqual(mockCompatibilityData.data);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle network errors consistently', async () => {
      mockAxios.onGet('/admin-shelter/kurikulum/browse').networkError();

      const result = await store.dispatch(browseKurikulum({}));

      expect(result.type).toBe('kurikulumConsumer/browseKurikulum/rejected');
      expect(result.payload).toContain('Network Error');
    });

    test('should handle timeout errors', async () => {
      mockAxios.onGet('/admin-shelter/kurikulum/browse').timeout();

      const result = await store.dispatch(browseKurikulum({}));

      expect(result.type).toBe('kurikulumConsumer/browseKurikulum/rejected');
    });

    test('should handle unauthorized errors', async () => {
      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(401, {
        message: 'Unauthorized'
      });

      const result = await store.dispatch(browseKurikulum({}));

      expect(result.type).toBe('kurikulumConsumer/browseKurikulum/rejected');
      expect(result.payload).toContain('Unauthorized');
    });
  });

  describe('Loading States Integration', () => {
    test('should set loading state during API calls', async () => {
      // Create a slow response to test loading state
      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve([200, { data: [], pagination: {} }]);
          }, 100);
        });
      });

      // Dispatch action
      const promise = store.dispatch(browseKurikulum({}));
      
      // Check loading state is true
      let state = store.getState();
      expect(selectBrowseLoading(state)).toBe(true);

      // Wait for completion
      await promise;
      
      // Check loading state is false
      state = store.getState();
      expect(selectBrowseLoading(state)).toBe(false);
    });
  });

  describe('Data Persistence Integration', () => {
    test('should maintain state across multiple API calls', async () => {
      const firstBatch = {
        data: [{ id_kurikulum: 1, nama_kurikulum: 'First' }],
        pagination: { currentPage: 1, hasMore: true }
      };
      
      const secondBatch = {
        data: [{ id_kurikulum: 2, nama_kurikulum: 'Second' }],
        pagination: { currentPage: 2, hasMore: false }
      };

      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(200, firstBatch);
      
      // First API call
      await store.dispatch(browseKurikulum({ page: 1 }));
      
      let state = store.getState();
      expect(selectKurikulumList(state)).toHaveLength(1);

      // Mock second page
      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(200, secondBatch);
      
      // Second API call (load more)
      await store.dispatch(browseKurikulum({ page: 2 }));
      
      state = store.getState();
      expect(selectKurikulumList(state)).toHaveLength(1); // Should replace, not append
    });
  });
});

// Helper function to create test store with initial state
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      kurikulumConsumer: kurikulumConsumerReducer
    },
    preloadedState: {
      kurikulumConsumer: {
        ...kurikulumConsumerReducer(undefined, { type: 'test' }),
        ...initialState
      }
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  });
};

// Helper function to create mock kurikulum data
export const createMockKurikulum = (overrides = {}) => ({
  id_kurikulum: 1,
  nama_kurikulum: 'Test Kurikulum',
  semester: '2024/2025 Semester 1',
  jenjang_summary: ['SD'],
  kelas_gabungan: [{ jenjang: 'SD', kelas: '4' }],
  total_materi: 10,
  total_aktivitas: 5,
  status: 'aktif',
  ...overrides
});