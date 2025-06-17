import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { aktivitasApi } from '../api/aktivitasApi';
import { adminShelterKelompokApi } from '../api/adminShelterKelompokApi';

// Initial state
const initialState = {
  aktivitasList: [],
  aktivitasDetail: null,
  loading: false,
  error: null,
  kelompokDetail: null,
  kelompokLoading: false,
  kelompokError: null,
  pagination: {
    total: 0,
    currentPage: 1,
    lastPage: 1,
    perPage: 10,
    from: 0,
    to: 0
  },
  isLoadingMore: false
};

// Async thunks
export const fetchAllAktivitas = createAsyncThunk(
  'aktivitas/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await aktivitasApi.getAllAktivitas(params);
      return { 
        ...response.data, 
        isLoadMore: params.page && params.page > 1,
        page: params.page || 1 
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const fetchAktivitasDetail = createAsyncThunk(
  'aktivitas/fetchDetail',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      const response = await aktivitasApi.getAktivitasDetail(id);
      
      // If this is a Bimbel activity and has a nama_kelompok, fetch the kelompok details
      const aktivitasData = response.data.data;
      if (aktivitasData.jenis_kegiatan === 'Bimbel' && aktivitasData.nama_kelompok) {
        dispatch(fetchKelompokByName(aktivitasData.nama_kelompok));
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity details');
    }
  }
);

export const fetchKelompokByName = createAsyncThunk(
  'aktivitas/fetchKelompokByName',
  async (kelompokName, { rejectWithValue }) => {
    try {
      const response = await adminShelterKelompokApi.getAllKelompok();
      const kelompokList = response.data.data || [];
      
      const matchingKelompok = kelompokList.find(
        kelompok => kelompok.nama_kelompok === kelompokName
      );
      
      if (matchingKelompok) {
        const detailResponse = await adminShelterKelompokApi.getKelompokDetail(matchingKelompok.id_kelompok);
        return detailResponse.data;
      } else {
        return rejectWithValue('Kelompok not found with name: ' + kelompokName);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch kelompok details');
    }
  }
);

export const createAktivitas = createAsyncThunk(
  'aktivitas/create',
  async (aktivitasData, { rejectWithValue }) => {
    try {
      const response = await aktivitasApi.createAktivitas(aktivitasData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create activity');
    }
  }
);

export const updateAktivitas = createAsyncThunk(
  'aktivitas/update',
  async ({ id, aktivitasData }, { rejectWithValue }) => {
    try {
      const response = await aktivitasApi.updateAktivitas(id, aktivitasData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update activity');
    }
  }
);

export const deleteAktivitas = createAsyncThunk(
  'aktivitas/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await aktivitasApi.deleteAktivitas(id);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activity');
    }
  }
);

// Slice
const aktivitasSlice = createSlice({
  name: 'aktivitas',
  initialState,
  reducers: {
    resetAktivitasDetail: (state) => {
      state.aktivitasDetail = null;
      state.kelompokDetail = null;
    },
    resetAktivitasError: (state) => {
      state.error = null;
    },
    resetAktivitasList: (state) => {
      state.aktivitasList = [];
      state.pagination = initialState.pagination;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchAllAktivitas
      .addCase(fetchAllAktivitas.pending, (state, action) => {
        const isLoadMore = action.meta.arg?.page > 1;
        if (isLoadMore) {
          state.isLoadingMore = true;
        } else {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(fetchAllAktivitas.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoadingMore = false;
        
        const { data, meta, isLoadMore } = action.payload;
        
        // Update activities list
        if (isLoadMore) {
          // For pagination, append new data to existing list
          state.aktivitasList = [...state.aktivitasList, ...data];
        } else {
          // For new search/filter, replace entire list
          state.aktivitasList = data;
        }
        
        // Update pagination metadata
        if (meta) {
          state.pagination = {
            total: meta.total || 0,
            currentPage: meta.current_page || 1,
            lastPage: meta.last_page || 1,
            perPage: meta.per_page || 10,
            from: meta.from || 0,
            to: meta.to || 0
          };
        }
      })
      .addCase(fetchAllAktivitas.rejected, (state, action) => {
        state.loading = false;
        state.isLoadingMore = false;
        state.error = action.payload || 'Failed to fetch activities';
      })
      
      // fetchAktivitasDetail
      .addCase(fetchAktivitasDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAktivitasDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.aktivitasDetail = action.payload.data;
        
        // Parse time fields if they exist
        if (state.aktivitasDetail) {
          if (state.aktivitasDetail.start_time) {
            try {
              state.aktivitasDetail.start_time = new Date(`2000-01-01T${state.aktivitasDetail.start_time}`);
            } catch (error) {
              console.error('Error parsing start_time:', error);
            }
          }
          
          if (state.aktivitasDetail.end_time) {
            try {
              state.aktivitasDetail.end_time = new Date(`2000-01-01T${state.aktivitasDetail.end_time}`);
            } catch (error) {
              console.error('Error parsing end_time:', error);
            }
          }
          
          if (state.aktivitasDetail.late_threshold) {
            try {
              state.aktivitasDetail.late_threshold = new Date(`2000-01-01T${state.aktivitasDetail.late_threshold}`);
            } catch (error) {
              console.error('Error parsing late_threshold:', error);
            }
          }
        }
        
        // Ensure we have a selectedKelompokId field if this is a Bimbel activity
        if (
          state.aktivitasDetail && 
          state.aktivitasDetail.jenis_kegiatan === 'Bimbel' && 
          state.kelompokDetail &&
          state.kelompokDetail.data
        ) {
          state.aktivitasDetail.selectedKelompokId = state.kelompokDetail.data.id_kelompok;
        }
      })
      .addCase(fetchAktivitasDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch activity details';
      })
      
      // fetchKelompokByName
      .addCase(fetchKelompokByName.pending, (state) => {
        state.kelompokLoading = true;
        state.kelompokError = null;
      })
      .addCase(fetchKelompokByName.fulfilled, (state, action) => {
        state.kelompokLoading = false;
        state.kelompokDetail = action.payload;
        
        if (state.aktivitasDetail && action.payload.data) {
          state.aktivitasDetail.selectedKelompokId = action.payload.data.id_kelompok;
        }
      })
      .addCase(fetchKelompokByName.rejected, (state, action) => {
        state.kelompokLoading = false;
        state.kelompokError = action.payload || 'Failed to fetch kelompok details';
      })
      
      // createAktivitas
      .addCase(createAktivitas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAktivitas.fulfilled, (state, action) => {
        state.loading = false;
        state.aktivitasList = [action.payload.data, ...state.aktivitasList];
        state.pagination.total += 1;
      })
      .addCase(createAktivitas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create activity';
      })
      
      // updateAktivitas
      .addCase(updateAktivitas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAktivitas.fulfilled, (state, action) => {
        state.loading = false;
        const updatedAktivitas = action.payload.data;
        
        state.aktivitasList = state.aktivitasList.map(item => 
          item.id_aktivitas === updatedAktivitas.id_aktivitas ? updatedAktivitas : item
        );
        
        if (state.aktivitasDetail && state.aktivitasDetail.id_aktivitas === updatedAktivitas.id_aktivitas) {
          if (updatedAktivitas.start_time) {
            try {
              updatedAktivitas.start_time = new Date(`2000-01-01T${updatedAktivitas.start_time}`);
            } catch (error) {
              console.error('Error parsing start_time:', error);
            }
          }
          
          if (updatedAktivitas.end_time) {
            try {
              updatedAktivitas.end_time = new Date(`2000-01-01T${updatedAktivitas.end_time}`);
            } catch (error) {
              console.error('Error parsing end_time:', error);
            }
          }
          
          if (updatedAktivitas.late_threshold) {
            try {
              updatedAktivitas.late_threshold = new Date(`2000-01-01T${updatedAktivitas.late_threshold}`);
            } catch (error) {
              console.error('Error parsing late_threshold:', error);
            }
          }
          
          state.aktivitasDetail = updatedAktivitas;
        }
      })
      .addCase(updateAktivitas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update activity';
      })
      
      // deleteAktivitas
      .addCase(deleteAktivitas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAktivitas.fulfilled, (state, action) => {
        state.loading = false;
        state.aktivitasList = state.aktivitasList.filter(
          item => item.id_aktivitas !== action.payload.id
        );
        state.pagination.total -= 1;
        
        if (state.aktivitasDetail && state.aktivitasDetail.id_aktivitas === action.payload.id) {
          state.aktivitasDetail = null;
          state.kelompokDetail = null;
        }
      })
      .addCase(deleteAktivitas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete activity';
      });
  }
});

// Actions
export const { resetAktivitasDetail, resetAktivitasError, resetAktivitasList } = aktivitasSlice.actions;

// Selectors
export const selectAktivitasList = (state) => state.aktivitas.aktivitasList;
export const selectAktivitasDetail = (state) => state.aktivitas.aktivitasDetail;
export const selectAktivitasLoading = (state) => state.aktivitas.loading;
export const selectAktivitasError = (state) => state.aktivitas.error;
export const selectAktivitasPagination = (state) => state.aktivitas.pagination;
export const selectKelompokDetail = (state) => state.aktivitas.kelompokDetail?.data;
export const selectKelompokLoading = (state) => state.aktivitas.kelompokLoading;
export const selectIsLoadingMore = (state) => state.aktivitas.isLoadingMore;

export default aktivitasSlice.reducer;