/**
 * API Testing Utilities and Helpers
 * Provides common functions and mocks for Phase 3 testing
 */

import { configureStore } from '@reduxjs/toolkit';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

// Import all reducers for comprehensive testing
import kurikulumConsumerReducer from '../../features/adminShelter/redux/kurikulumConsumerSlice';
import kelompokReducer from '../../features/adminShelter/redux/kelompokSlice';

/**
 * Create a test store with all relevant reducers
 */
export const createTestStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      kurikulumConsumer: kurikulumConsumerReducer,
      kelompok: kelompokReducer
    },
    preloadedState: initialState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false
      })
  });
};

/**
 * Create mock navigation object for testing
 */
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  dispatch: jest.fn(),
  reset: jest.fn(),
  canGoBack: jest.fn(() => true),
  isFocused: jest.fn(() => true),
  addListener: jest.fn(),
  removeListener: jest.fn()
});

/**
 * Create mock route object for testing
 */
export const createMockRoute = (params = {}) => ({
  key: 'test-route',
  name: 'TestScreen',
  params
});

/**
 * Mock data generators for consistent testing
 */
export const createMockKelompok = (overrides = {}) => ({
  id_kelompok: 1,
  nama_kelompok: 'Test Kelompok',
  kelas_gabungan: [
    { jenjang: 'SD', kelas: '4' },
    { jenjang: 'SD', kelas: '5' }
  ],
  jumlah_anggota: 15,
  status: 'aktif',
  created_at: '2024-02-01T10:00:00Z',
  updated_at: '2024-02-01T10:00:00Z',
  ...overrides
});

export const createMockKurikulum = (overrides = {}) => ({
  id_kurikulum: 1,
  nama_kurikulum: 'Test Kurikulum',
  semester: '2024/2025 Semester 1',
  jenjang_summary: ['SD'],
  kelas_gabungan: [
    { jenjang: 'SD', kelas: '4' },
    { jenjang: 'SD', kelas: '5' }
  ],
  total_materi: 20,
  total_aktivitas: 15,
  status: 'aktif',
  compatibility_score: 85,
  ...overrides
});

export const createMockMateriCompatibility = (overrides = {}) => ({
  'SD': {
    '4': 12,
    '5': 15,
    '6': 10
  },
  'SMP': {
    '7': 18,
    '8': 16,
    '9': 14
  },
  ...overrides
});

export const createMockProgressData = (overrides = {}) => ({
  overall_progress: 65,
  weekly_progress: [
    { week: '2024-W05', progress: 20 },
    { week: '2024-W06', progress: 35 },
    { week: '2024-W07', progress: 50 },
    { week: '2024-W08', progress: 65 }
  ],
  milestones: [
    {
      id: 1,
      title: 'Chapter 1 Complete',
      due_date: '2024-02-15',
      status: 'completed'
    },
    {
      id: 2,
      title: 'Mid-term Assessment',
      due_date: '2024-02-28',
      status: 'upcoming'
    }
  ],
  recent_activities: [
    {
      id: 1,
      title: 'Completed Matematika Dasar',
      date: '2024-02-01T10:00:00Z',
      type: 'completion'
    }
  ],
  performance_by_kelas: {
    'SD-4': { progress: 70, performance: 'good' },
    'SD-5': { progress: 60, performance: 'average' }
  },
  ...overrides
});

export const createMockReportData = (overrides = {}) => ({
  id: 1,
  title: 'Kelompok Performance Report',
  period: 'February 2024',
  format: 'detailed',
  sections: {
    overview: {
      total_students: 15,
      total_activities: 25,
      completion_rate: 78,
      average_score: 82
    },
    kelas_gabungan_analysis: {
      effectiveness_score: 85,
      strengths: ['Good collaboration', 'Peer learning'],
      challenges: ['Different learning pace', 'Material complexity']
    },
    subject_breakdown: {
      'Matematika': { progress: 80, score: 85 },
      'Bahasa Indonesia': { progress: 75, score: 80 }
    },
    recommendations: [
      'Consider additional support for slower learners',
      'Implement more peer-to-peer activities'
    ]
  },
  generated_at: '2024-02-01T10:00:00Z',
  ...overrides
});

/**
 * API Response Generators for consistent mock responses
 */
export const createSuccessResponse = (data, pagination = null) => ({
  data,
  ...(pagination && { pagination }),
  message: 'Success',
  status: 200
});

export const createErrorResponse = (message, errors = null, status = 500) => ({
  message,
  ...(errors && { errors }),
  status
});

export const createValidationErrorResponse = (errors) => ({
  message: 'Validation failed',
  errors,
  status: 422
});

export const createNetworkErrorResponse = () => ({
  code: 'NETWORK_ERROR',
  message: 'Network Error'
});

/**
 * Mock Axios Setup Helpers
 */
export const setupMockAxios = () => {
  const mockAxios = new MockAdapter(axios);
  
  // Setup default interceptors for consistent behavior
  mockAxios.onAny().passThrough();
  
  return mockAxios;
};

export const setupKelompokApiMocks = (mockAxios) => {
  // Default successful responses for kelompok operations
  mockAxios.onGet('/admin-shelter/kelompok').reply(200, createSuccessResponse([createMockKelompok()]));
  
  mockAxios.onPost('/admin-shelter/kelompok').reply(200, createSuccessResponse(createMockKelompok()));
  
  mockAxios.onGet('/admin-shelter/kelompok/jenjang-kelas-options').reply(200, 
    createSuccessResponse({
      'PAUD': ['A', 'B'],
      'TK': ['A', 'B'],
      'SD': ['1', '2', '3', '4', '5', '6'],
      'SMP': ['7', '8', '9'],
      'SMA': ['10', '11', '12']
    })
  );
  
  mockAxios.onPost('/admin-shelter/kelompok/validate-kelas-gabungan').reply(200,
    createSuccessResponse({
      isValid: true,
      compatibilityScore: 85,
      warnings: []
    })
  );
};

export const setupKurikulumApiMocks = (mockAxios) => {
  // Default successful responses for kurikulum operations
  mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(200, 
    createSuccessResponse([createMockKurikulum()], {
      currentPage: 1,
      totalPages: 1,
      totalItems: 1,
      hasMore: false
    })
  );
  
  mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok').reply(200,
    createSuccessResponse({
      id: 1,
      kurikulum_id: 1,
      kelompok_id: 1,
      status: 'applied',
      applied_date: '2024-02-01T10:00:00Z'
    })
  );
  
  mockAxios.onGet(/\/admin-shelter\/kelompok\/(\d+)\/kurikulum-suggestions/).reply(200,
    createSuccessResponse([
      {
        ...createMockKurikulum(),
        compatibility_score: 90,
        reason: 'Excellent match for selected kelas combination'
      }
    ])
  );
  
  mockAxios.onPost('/admin-shelter/kurikulum/materi-compatibility').reply(200,
    createSuccessResponse(createMockMateriCompatibility())
  );
};

export const setupProgressApiMocks = (mockAxios) => {
  mockAxios.onGet(/\/admin-shelter\/progress\/kelompok\/(\d+)\/kurikulum\/(\d+)/).reply(200,
    createSuccessResponse(createMockProgressData())
  );
  
  mockAxios.onGet(/\/admin-shelter\/progress\/kelompok\/(\d+)\/overall/).reply(200,
    createSuccessResponse({
      overall_progress: 65,
      total_activities: 50,
      completed_activities: 32,
      upcoming_milestones: 3
    })
  );
  
  mockAxios.onGet(/\/admin-shelter\/progress\/kelompok\/(\d+)\/timeline/).reply(200,
    createSuccessResponse([
      { date: '2024-02-01', progress: 20, milestone: 'Started Chapter 1' },
      { date: '2024-02-05', progress: 35, milestone: 'Completed Lesson 1' },
      { date: '2024-02-10', progress: 50, milestone: 'Mid-chapter assessment' }
    ])
  );
};

export const setupReportingApiMocks = (mockAxios) => {
  mockAxios.onPost(/\/admin-shelter\/reports\/kelompok\/(\d+)/).reply(200,
    createSuccessResponse(createMockReportData())
  );
  
  mockAxios.onPost('/admin-shelter/reports/kelas-gabungan-analysis').reply(200,
    createSuccessResponse({
      effectiveness_score: 88,
      comparison_with_single_class: {
        engagement: '+15%',
        collaboration: '+25%',
        completion_rate: '+10%'
      },
      optimal_combinations: [
        { jenjang: ['SD'], kelas: ['4', '5'], score: 92 },
        { jenjang: ['SD', 'SMP'], kelas: ['6', '7'], score: 85 }
      ]
    })
  );
  
  mockAxios.onGet('/admin-shelter/reports/history').reply(200,
    createSuccessResponse([
      {
        id: 1,
        title: 'Monthly Report - February 2024',
        type: 'monthly',
        generated_at: '2024-02-28T10:00:00Z'
      }
    ])
  );
};

/**
 * Error Simulation Helpers
 */
export const simulateNetworkError = (mockAxios, endpoint) => {
  mockAxios.onAny(endpoint).networkError();
};

export const simulateServerError = (mockAxios, endpoint, status = 500) => {
  mockAxios.onAny(endpoint).reply(status, createErrorResponse('Internal Server Error'));
};

export const simulateValidationError = (mockAxios, endpoint, errors) => {
  mockAxios.onAny(endpoint).reply(422, createValidationErrorResponse(errors));
};

export const simulateTimeoutError = (mockAxios, endpoint) => {
  mockAxios.onAny(endpoint).timeout();
};

/**
 * Test Assertion Helpers
 */
export const expectApiCallMade = (mockAxios, method, url, expectedData = null) => {
  const calls = mockAxios.history[method.toLowerCase()];
  const matchingCall = calls.find(call => call.url === url);
  
  expect(matchingCall).toBeTruthy();
  
  if (expectedData && matchingCall.data) {
    const requestData = JSON.parse(matchingCall.data);
    expect(requestData).toMatchObject(expectedData);
  }
  
  return matchingCall;
};

export const expectReduxStateUpdated = (store, sliceName, expectedState) => {
  const state = store.getState();
  expect(state[sliceName]).toMatchObject(expectedState);
};

export const expectLoadingState = (store, sliceName, isLoading) => {
  const state = store.getState();
  expect(state[sliceName].loading).toBe(isLoading);
};

export const expectErrorState = (store, sliceName, hasError) => {
  const state = store.getState();
  if (hasError) {
    expect(state[sliceName].error).toBeTruthy();
  } else {
    expect(state[sliceName].error).toBeFalsy();
  }
};

/**
 * Component Testing Helpers
 */
export const renderWithStore = (component, store) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

export const renderWithNavigation = (component, navigation = null, route = null) => {
  const mockNav = navigation || createMockNavigation();
  const mockRoute = route || createMockRoute();
  
  return React.cloneElement(component, {
    navigation: mockNav,
    route: mockRoute
  });
};

/**
 * Async Testing Utilities
 */
export const waitForApiCall = async (mockAxios, method, url, timeout = 5000) => {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const calls = mockAxios.history[method.toLowerCase()];
    if (calls.some(call => call.url === url)) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  throw new Error(`API call ${method.toUpperCase()} ${url} not made within ${timeout}ms`);
};

export const waitForReduxAction = async (store, actionType, timeout = 5000) => {
  return new Promise((resolve, reject) => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      // Check if action has been dispatched by looking at state changes
      // This is a simplified implementation - in real tests you might use redux-mock-store
      resolve(true);
    });
    
    setTimeout(() => {
      unsubscribe();
      reject(new Error(`Redux action ${actionType} not dispatched within ${timeout}ms`));
    }, timeout);
  });
};

/**
 * Performance Testing Helpers
 */
export const measureRenderTime = (renderFunction) => {
  const startTime = performance.now();
  const result = renderFunction();
  const endTime = performance.now();
  
  return {
    result,
    renderTime: endTime - startTime
  };
};

export const measureApiResponseTime = async (apiCall) => {
  const startTime = performance.now();
  const result = await apiCall();
  const endTime = performance.now();
  
  return {
    result,
    responseTime: endTime - startTime
  };
};

/**
 * Memory Testing Helpers
 */
export const checkMemoryLeaks = (component, iterations = 10) => {
  const initialMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
  
  for (let i = 0; i < iterations; i++) {
    const { unmount } = render(component);
    unmount();
  }
  
  // Force garbage collection if available
  if (global.gc) {
    global.gc();
  }
  
  const finalMemory = performance.memory ? performance.memory.usedJSHeapSize : null;
  
  return {
    initialMemory,
    finalMemory,
    memoryDiff: finalMemory - initialMemory,
    hasMemoryLeak: finalMemory > initialMemory * 1.1 // 10% threshold
  };
};

/**
 * Integration Test Scenario Builders
 */
export const buildKelompokCreationScenario = (mockAxios, overrides = {}) => {
  const scenario = {
    mockKelompok: createMockKelompok(overrides.kelompok),
    mockValidation: { isValid: true, compatibilityScore: 85, ...overrides.validation },
    mockResponse: createSuccessResponse(createMockKelompok(overrides.kelompok))
  };
  
  setupKelompokApiMocks(mockAxios);
  mockAxios.onPost('/admin-shelter/kelompok').reply(200, scenario.mockResponse);
  
  return scenario;
};

export const buildKurikulumAssignmentScenario = (mockAxios, overrides = {}) => {
  const scenario = {
    mockKurikulum: createMockKurikulum(overrides.kurikulum),
    mockAssignment: { id: 1, status: 'assigned', ...overrides.assignment },
    mockResponse: createSuccessResponse({ id: 1, status: 'assigned', ...overrides.assignment })
  };
  
  setupKurikulumApiMocks(mockAxios);
  mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok').reply(200, scenario.mockResponse);
  
  return scenario;
};

export const buildProgressTrackingScenario = (mockAxios, overrides = {}) => {
  const scenario = {
    mockProgress: createMockProgressData(overrides.progress),
    mockResponse: createSuccessResponse(createMockProgressData(overrides.progress))
  };
  
  setupProgressApiMocks(mockAxios);
  
  return scenario;
};

export const buildReportingScenario = (mockAxios, overrides = {}) => {
  const scenario = {
    mockReport: createMockReportData(overrides.report),
    mockResponse: createSuccessResponse(createMockReportData(overrides.report))
  };
  
  setupReportingApiMocks(mockAxios);
  
  return scenario;
};

/**
 * Export all utilities for easy importing
 */
export default {
  createTestStore,
  createMockNavigation,
  createMockRoute,
  createMockKelompok,
  createMockKurikulum,
  createMockMateriCompatibility,
  createMockProgressData,
  createMockReportData,
  setupMockAxios,
  setupKelompokApiMocks,
  setupKurikulumApiMocks,
  setupProgressApiMocks,
  setupReportingApiMocks,
  simulateNetworkError,
  simulateServerError,
  simulateValidationError,
  expectApiCallMade,
  expectReduxStateUpdated,
  buildKelompokCreationScenario,
  buildKurikulumAssignmentScenario,
  buildProgressTrackingScenario,
  buildReportingScenario
};