import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

// Import components to test
import KelompokFormScreen from '../../features/adminShelter/screens/KelompokFormScreen';
import KelompokManagementScreen from '../../features/adminShelter/screens/KelompokManagementScreen';
import KurikulumAssignmentScreen from '../../features/adminShelter/screens/kelola/KurikulumAssignmentScreen';

// Import test utilities
import { createTestStore } from '../api/kurikulumConsumerApi.test';
import { createMockNavigation } from '../utils/apiTestHelpers';

/**
 * End-to-End Kelompok Workflow Integration Tests
 * Tests complete user flows from kelompok creation to kurikulum assignment
 */

describe('Kelompok Workflow Integration Tests', () => {
  let store;
  let mockAxios;
  let navigation;

  beforeEach(() => {
    mockAxios = new MockAdapter(axios);
    store = createTestStore();
    navigation = createMockNavigation();
  });

  afterEach(() => {
    mockAxios.restore();
  });

  const renderWithProviders = (component) => {
    return render(
      <Provider store={store}>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </Provider>
    );
  };

  describe('Complete Kelompok Creation Flow', () => {
    test('should create kelompok with kelas gabungan and navigate to management', async () => {
      const mockKelompokData = {
        nama_kelompok: 'Test Kelompok SD-SMP',
        kelas_gabungan: [
          { jenjang: 'SD', kelas: '4' },
          { jenjang: 'SD', kelas: '5' },
          { jenjang: 'SMP', kelas: '7' }
        ],
        jumlah_anggota: 15
      };

      const mockCreateResponse = {
        data: {
          id_kelompok: 1,
          ...mockKelompokData,
          status: 'aktif',
          created_at: '2024-02-01T10:00:00Z'
        }
      };

      // Mock jenjang kelas options API call
      mockAxios.onGet('/admin-shelter/kelompok/jenjang-kelas-options').reply(200, {
        data: {
          'SD': ['1', '2', '3', '4', '5', '6'],
          'SMP': ['7', '8', '9'],
          'SMA': ['10', '11', '12']
        }
      });

      // Mock kelompok creation API call
      mockAxios.onPost('/admin-shelter/kelompok').reply(200, mockCreateResponse);

      // Mock validation API call
      mockAxios.onPost('/admin-shelter/kelompok/validate-kelas-gabungan').reply(200, {
        data: { 
          isValid: true, 
          compatibilityScore: 85,
          warnings: []
        }
      });

      const { getByText, getByTestId } = renderWithProviders(
        <KelompokFormScreen navigation={navigation} />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(getByText('Tambah Kelompok')).toBeTruthy();
      });

      // Fill in form data
      fireEvent.changeText(getByTestId('input-nama-kelompok'), mockKelompokData.nama_kelompok);
      fireEvent.changeText(getByTestId('input-jumlah-anggota'), mockKelompokData.jumlah_anggota.toString());

      // Open kelas gabungan selector
      fireEvent.press(getByTestId('button-select-kelas-gabungan'));

      await waitFor(() => {
        expect(getByText('Pilih Kelas Gabungan')).toBeTruthy();
      });

      // Select SD classes
      fireEvent.press(getByTestId('jenjang-section-SD'));
      fireEvent.press(getByTestId('kelas-chip-SD-4'));
      fireEvent.press(getByTestId('kelas-chip-SD-5'));

      // Select SMP class
      fireEvent.press(getByTestId('jenjang-section-SMP'));
      fireEvent.press(getByTestId('kelas-chip-SMP-7'));

      // Confirm selection
      fireEvent.press(getByTestId('button-confirm-kelas-gabungan'));

      // Submit form
      fireEvent.press(getByTestId('button-save-kelompok'));

      // Wait for API calls to complete
      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('KelompokManagement', {
          refresh: true,
          newKelompokId: 1
        });
      });

      // Verify API calls were made correctly
      expect(mockAxios.history.post).toHaveLength(2); // validation + creation
      
      const creationCall = mockAxios.history.post.find(call => 
        call.url === '/admin-shelter/kelompok'
      );
      const requestData = JSON.parse(creationCall.data);
      
      expect(requestData.nama_kelompok).toBe(mockKelompokData.nama_kelompok);
      expect(requestData.kelas_gabungan).toEqual(mockKelompokData.kelas_gabungan);
      expect(requestData.jumlah_anggota).toBe(mockKelompokData.jumlah_anggota);
    });

    test('should handle validation errors during kelompok creation', async () => {
      const mockValidationError = {
        message: 'Validation failed',
        errors: {
          kelas_gabungan: ['Kombinasi kelas tidak valid'],
          nama_kelompok: ['Nama kelompok sudah digunakan']
        }
      };

      mockAxios.onGet('/admin-shelter/kelompok/jenjang-kelas-options').reply(200, {
        data: { 'SD': ['1', '2', '3', '4', '5', '6'] }
      });

      mockAxios.onPost('/admin-shelter/kelompok').reply(422, mockValidationError);

      const { getByText, getByTestId } = renderWithProviders(
        <KelompokFormScreen navigation={navigation} />
      );

      await waitFor(() => {
        expect(getByText('Tambah Kelompok')).toBeTruthy();
      });

      // Fill form with invalid data
      fireEvent.changeText(getByTestId('input-nama-kelompok'), 'Existing Name');
      fireEvent.changeText(getByTestId('input-jumlah-anggota'), '10');

      // Submit form
      fireEvent.press(getByTestId('button-save-kelompok'));

      // Wait for error handling
      await waitFor(() => {
        expect(getByText('Kombinasi kelas tidak valid')).toBeTruthy();
        expect(getByText('Nama kelompok sudah digunakan')).toBeTruthy();
      });

      // Verify navigation did not occur
      expect(navigation.navigate).not.toHaveBeenCalled();
    });
  });

  describe('Kelompok Management to Assignment Flow', () => {
    test('should navigate from management to kurikulum assignment', async () => {
      const mockKelompokList = {
        data: [
          {
            id_kelompok: 1,
            nama_kelompok: 'Test Kelompok',
            kelas_gabungan: [
              { jenjang: 'SD', kelas: '4' },
              { jenjang: 'SD', kelas: '5' }
            ],
            jumlah_anggota: 12,
            status: 'aktif'
          }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 1
        }
      };

      const mockKurikulumSuggestions = {
        data: [
          {
            id_kurikulum: 1,
            nama_kurikulum: 'Matematika SD 4-5',
            compatibility_score: 90,
            reason: 'Perfect match for selected classes'
          }
        ]
      };

      // Mock kelompok list API call
      mockAxios.onGet('/admin-shelter/kelompok').reply(200, mockKelompokList);

      // Mock kurikulum suggestions API call
      mockAxios.onGet('/admin-shelter/kelompok/1/kurikulum-suggestions')
        .reply(200, mockKurikulumSuggestions);

      const { getByText, getByTestId } = renderWithProviders(
        <KelompokManagementScreen navigation={navigation} />
      );

      // Wait for kelompok list to load
      await waitFor(() => {
        expect(getByText('Test Kelompok')).toBeTruthy();
      });

      // Tap on kelompok to view detail
      fireEvent.press(getByTestId('kelompok-card-1'));

      await waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith('KelompokDetail', {
          kelompokId: 1
        });
      });

      // Simulate navigation to assignment screen
      const assignmentScreen = renderWithProviders(
        <KurikulumAssignmentScreen 
          navigation={navigation}
          route={{ params: { kelompokId: 1 } }}
        />
      );

      await waitFor(() => {
        expect(assignmentScreen.getByText('Assign Kurikulum')).toBeTruthy();
        expect(assignmentScreen.getByText('Matematika SD 4-5')).toBeTruthy();
      });
    });
  });

  describe('Complete Kurikulum Assignment Flow', () => {
    test('should complete 3-step kurikulum assignment process', async () => {
      const mockKurikulumData = {
        id_kurikulum: 1,
        nama_kurikulum: 'Matematika SD 4-5',
        semester: '2024/2025 Semester 1',
        kelas_gabungan: [
          { jenjang: 'SD', kelas: '4' },
          { jenjang: 'SD', kelas: '5' }
        ],
        total_materi: 20,
        total_aktivitas: 15,
        compatibility_score: 90
      };

      const mockAssignmentResponse = {
        data: {
          id: 1,
          kurikulum_id: 1,
          kelompok_id: 1,
          status: 'assigned',
          assigned_date: '2024-02-01T10:00:00Z'
        }
      };

      // Mock kurikulum browse API call
      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(200, {
        data: [mockKurikulumData],
        pagination: { currentPage: 1, totalPages: 1 }
      });

      // Mock assignment API call
      mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok')
        .reply(200, mockAssignmentResponse);

      const { getByText, getByTestId } = renderWithProviders(
        <KurikulumAssignmentScreen 
          navigation={navigation}
          route={{ params: { kelompokId: 1 } }}
        />
      );

      // Wait for component to load
      await waitFor(() => {
        expect(getByText('Assign Kurikulum')).toBeTruthy();
      });

      // Switch to Browse mode
      fireEvent.press(getByTestId('tab-browse'));

      await waitFor(() => {
        expect(getByText('Matematika SD 4-5')).toBeTruthy();
      });

      // Select kurikulum
      fireEvent.press(getByTestId('kurikulum-select-1'));

      // Step 1: Review kurikulum
      await waitFor(() => {
        expect(getByText('Review Kurikulum')).toBeTruthy();
        expect(getByText('Matematika SD 4-5')).toBeTruthy();
        expect(getByText('90%')).toBeTruthy(); // compatibility score
      });

      fireEvent.press(getByTestId('button-next-step'));

      // Step 2: Assignment settings
      await waitFor(() => {
        expect(getByText('Pengaturan Assignment')).toBeTruthy();
      });

      fireEvent.press(getByTestId('button-next-step'));

      // Step 3: Confirmation
      await waitFor(() => {
        expect(getByText('Konfirmasi Assignment')).toBeTruthy();
      });

      fireEvent.press(getByTestId('button-confirm-assignment'));

      // Wait for assignment to complete
      await waitFor(() => {
        expect(getByText('Kurikulum berhasil di-assign!')).toBeTruthy();
      });

      // Verify API call was made correctly
      const assignmentCall = mockAxios.history.post.find(call => 
        call.url === '/admin-shelter/kurikulum/apply-to-kelompok'
      );
      
      expect(assignmentCall).toBeTruthy();
      
      const requestData = JSON.parse(assignmentCall.data);
      expect(requestData.kurikulum_id).toBe(1);
      expect(requestData.kelompok_id).toBe(1);
    });

    test('should handle assignment errors gracefully', async () => {
      const mockError = {
        message: 'Assignment failed',
        errors: {
          kurikulum_id: ['Kurikulum not available'],
          kelompok_id: ['Kelompok already has active kurikulum']
        }
      };

      mockAxios.onGet('/admin-shelter/kurikulum/browse').reply(200, {
        data: [],
        pagination: { currentPage: 1, totalPages: 1 }
      });

      mockAxios.onPost('/admin-shelter/kurikulum/apply-to-kelompok')
        .reply(422, mockError);

      const { getByText, getByTestId } = renderWithProviders(
        <KurikulumAssignmentScreen 
          navigation={navigation}
          route={{ params: { kelompokId: 1 } }}
        />
      );

      await waitFor(() => {
        expect(getByText('Assign Kurikulum')).toBeTruthy();
      });

      // Simulate attempting assignment (mock the process)
      fireEvent.press(getByTestId('button-confirm-assignment'));

      await waitFor(() => {
        expect(getByText('Assignment failed')).toBeTruthy();
      });
    });
  });

  describe('Error Recovery and Retry Flow', () => {
    test('should recover from network errors with retry mechanism', async () => {
      // First call fails with network error
      mockAxios.onGet('/admin-shelter/kelompok')
        .replyOnce(() => Promise.reject(new Error('Network Error')))
        .onGet('/admin-shelter/kelompok')
        .reply(200, {
          data: [],
          pagination: { currentPage: 1, totalPages: 1 }
        });

      const { getByText, getByTestId } = renderWithProviders(
        <KelompokManagementScreen navigation={navigation} />
      );

      // Wait for error state
      await waitFor(() => {
        expect(getByText('Gagal memuat data')).toBeTruthy();
      });

      // Retry operation
      fireEvent.press(getByTestId('button-retry'));

      // Wait for successful load
      await waitFor(() => {
        expect(getByText('Kelompok Management')).toBeTruthy();
      });

      // Verify retry mechanism worked
      expect(mockAxios.history.get).toHaveLength(2);
    });
  });

  describe('Offline Behavior Integration', () => {
    test('should handle offline state gracefully', async () => {
      // Mock network unavailable
      mockAxios.onGet('/admin-shelter/kelompok').networkError();

      const { getByText, getByTestId } = renderWithProviders(
        <KelompokManagementScreen navigation={navigation} />
      );

      await waitFor(() => {
        expect(getByText('Tidak dapat terhubung ke server')).toBeTruthy();
        expect(getByTestId('offline-indicator')).toBeTruthy();
      });

      // Verify appropriate offline UI is shown
      expect(getByTestId('button-retry')).toBeTruthy();
    });
  });

  describe('Data Persistence Integration', () => {
    test('should maintain Redux state across screen transitions', async () => {
      const mockKelompokData = {
        data: [
          {
            id_kelompok: 1,
            nama_kelompok: 'Persistent Kelompok',
            kelas_gabungan: [{ jenjang: 'SD', kelas: '4' }]
          }
        ]
      };

      mockAxios.onGet('/admin-shelter/kelompok').reply(200, mockKelompokData);

      const managementScreen = renderWithProviders(
        <KelompokManagementScreen navigation={navigation} />
      );

      // Wait for data to load
      await waitFor(() => {
        expect(managementScreen.getByText('Persistent Kelompok')).toBeTruthy();
      });

      // Check Redux state
      const state = store.getState();
      expect(state.kelompok.list).toHaveLength(1);
      expect(state.kelompok.list[0].nama_kelompok).toBe('Persistent Kelompok');

      // Navigate to form and back
      navigation.navigate('KelompokForm');
      navigation.navigate('KelompokManagement');

      // Verify state persisted
      const newState = store.getState();
      expect(newState.kelompok.list).toHaveLength(1);
      expect(newState.kelompok.list[0].nama_kelompok).toBe('Persistent Kelompok');
    });
  });
});