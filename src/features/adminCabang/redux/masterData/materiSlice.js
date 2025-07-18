import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { materiApi } from '../../api/masterData/materiApi';

// Initial State
const initialState = {
  items: [],
  currentItem: null,
  dropdownOptions: [],
  cascadeData: {},
  statistics: {},
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0
  },
  filters: {
    search: '',
    id_mata_pelajaran: '',
    id_kelas: '',
    id_jenjang: ''
  }
};

// Async Thunks
export const getAllMateri = createAsyncThunk(
  'materi/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await materiApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMateriById = createAsyncThunk(
  'materi/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await materiApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMateri = createAsyncThunk(
  'materi/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await materiApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMateri = createAsyncThunk(
  'materi/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await materiApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMateri = createAsyncThunk(
  'materi/delete',
  async (id, { rejectWithValue }) => {
    try {
      await materiApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMateriByKelas = createAsyncThunk(
  'materi/getByKelas',
  async (kelasId, { rejectWithValue }) => {
    try {
      const response = await materiApi.getByKelas(kelasId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMateriByMataPelajaran = createAsyncThunk(
  'materi/getByMataPelajaran',
  async (params, { rejectWithValue }) => {
    try {
      const response = await materiApi.getByMataPelajaran(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMateriForDropdown = createAsyncThunk(
  'materi/getForDropdown',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await materiApi.getForDropdown(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMateriCascadeData = createAsyncThunk(
  'materi/getCascadeData',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await materiApi.getCascadeData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMateriStatistics = createAsyncThunk(
  'materi/getStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await materiApi.getStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Slice
const materiSlice = createSlice({
  name: 'materi',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get All Materi
      .addCase(getAllMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMateri.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.data;
        state.pagination = {
          currentPage: action.payload.data.current_page,
          lastPage: action.payload.data.last_page,
          perPage: action.payload.data.per_page,
          total: action.payload.data.total
        };
      })
      .addCase(getAllMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil data materi';
      })

      // Get Materi By ID
      .addCase(getMateriById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMateriById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(getMateriById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil detail materi';
      })

      // Create Materi
      .addCase(createMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMateri.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal membuat materi';
      })

      // Update Materi
      .addCase(updateMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMateri.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id_materi === action.payload.data.id_materi);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
      })
      .addCase(updateMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengupdate materi';
      })

      // Delete Materi
      .addCase(deleteMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMateri.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id_materi !== action.payload);
      })
      .addCase(deleteMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal menghapus materi';
      })

      // Get By Kelas
      .addCase(getMateriByKelas.fulfilled, (state, action) => {
        state.cascadeData.byKelas = action.payload;
      })

      // Get By Mata Pelajaran
      .addCase(getMateriByMataPelajaran.fulfilled, (state, action) => {
        state.cascadeData.byMataPelajaran = action.payload;
      })

      // Get For Dropdown
      .addCase(getMateriForDropdown.fulfilled, (state, action) => {
        state.dropdownOptions = action.payload.data || action.payload;
      })

      // Get Cascade Data
      .addCase(getMateriCascadeData.fulfilled, (state, action) => {
        state.cascadeData = { ...state.cascadeData, ...action.payload };
      })

      // Get Statistics
      .addCase(getMateriStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  }
});

// Actions
export const { setFilters, resetFilters, clearCurrentItem, clearError } = materiSlice.actions;

// Selectors
export const selectMateriItems = (state) => state.materi.items;
export const selectCurrentMateri = (state) => state.materi.currentItem;
export const selectMateriLoading = (state) => state.materi.loading;
export const selectMateriError = (state) => state.materi.error;
export const selectMateriPagination = (state) => state.materi.pagination;
export const selectMateriFilters = (state) => state.materi.filters;
export const selectMateriDropdownOptions = (state) => state.materi.dropdownOptions;
export const selectMateriCascadeData = (state) => state.materi.cascadeData;
export const selectMateriStatistics = (state) => state.materi.statistics;

export const selectMateriByKelas = (kelasId) => (state) => {
  return state.materi.items.filter(item => item.id_kelas === kelasId);
};

export const selectMateriByMataPelajaran = (mataPelajaranId) => (state) => {
  return state.materi.items.filter(item => item.id_mata_pelajaran === mataPelajaranId);
};

export const selectMateriForKurikulum = (state) => {
  return state.materi.items.map(item => ({
    id: item.id_materi,
    nama: item.nama_materi,
    mata_pelajaran: item.mata_pelajaran?.nama_mata_pelajaran,
    kelas: item.kelas?.nama_kelas,
    jenjang: item.mata_pelajaran?.jenjang?.nama_jenjang
  }));
};

export default materiSlice.reducer;