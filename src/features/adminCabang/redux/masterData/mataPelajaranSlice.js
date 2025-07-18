import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { mataPelajaranApi } from '../../api/masterData/mataPelajaranApi';

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
    id_jenjang: '',
    kategori: '',
    status: ''
  }
};

export const getAllMataPelajaran = createAsyncThunk(
  'mataPelajaran/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMataPelajaranById = createAsyncThunk(
  'mataPelajaran/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createMataPelajaran = createAsyncThunk(
  'mataPelajaran/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateMataPelajaran = createAsyncThunk(
  'mataPelajaran/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteMataPelajaran = createAsyncThunk(
  'mataPelajaran/delete',
  async (id, { rejectWithValue }) => {
    try {
      await mataPelajaranApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMataPelajaranByJenjang = createAsyncThunk(
  'mataPelajaran/getByJenjang',
  async (jenjangId, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.getByJenjang(jenjangId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMataPelajaranForDropdown = createAsyncThunk(
  'mataPelajaran/getForDropdown',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.getForDropdown(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMataPelajaranCascadeData = createAsyncThunk(
  'mataPelajaran/getCascadeData',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.getCascadeData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getMataPelajaranStatistics = createAsyncThunk(
  'mataPelajaran/getStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await mataPelajaranApi.getStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const mataPelajaranSlice = createSlice({
  name: 'mataPelajaran',
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
      .addCase(getAllMataPelajaran.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllMataPelajaran.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.data;
        state.pagination = {
          currentPage: action.payload.data.current_page,
          lastPage: action.payload.data.last_page,
          perPage: action.payload.data.per_page,
          total: action.payload.data.total
        };
      })
      .addCase(getAllMataPelajaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil data mata pelajaran';
      })

      .addCase(getMataPelajaranById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMataPelajaranById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(getMataPelajaranById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil detail mata pelajaran';
      })

      .addCase(createMataPelajaran.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMataPelajaran.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createMataPelajaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal membuat mata pelajaran';
      })

      .addCase(updateMataPelajaran.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMataPelajaran.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id_mata_pelajaran === action.payload.data.id_mata_pelajaran);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
      })
      .addCase(updateMataPelajaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengupdate mata pelajaran';
      })

      .addCase(deleteMataPelajaran.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMataPelajaran.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id_mata_pelajaran !== action.payload);
      })
      .addCase(deleteMataPelajaran.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal menghapus mata pelajaran';
      })

      .addCase(getMataPelajaranByJenjang.fulfilled, (state, action) => {
        state.cascadeData.byJenjang = action.payload;
      })

      .addCase(getMataPelajaranForDropdown.fulfilled, (state, action) => {
        state.dropdownOptions = action.payload.data || action.payload;
      })

      .addCase(getMataPelajaranCascadeData.fulfilled, (state, action) => {
        state.cascadeData = { ...state.cascadeData, ...action.payload };
      })

      .addCase(getMataPelajaranStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearCurrentItem, clearError } = mataPelajaranSlice.actions;

export const selectMataPelajaranItems = (state) => state.mataPelajaran.items;
export const selectCurrentMataPelajaran = (state) => state.mataPelajaran.currentItem;
export const selectMataPelajaranLoading = (state) => state.mataPelajaran.loading;
export const selectMataPelajaranError = (state) => state.mataPelajaran.error;
export const selectMataPelajaranPagination = (state) => state.mataPelajaran.pagination;
export const selectMataPelajaranFilters = (state) => state.mataPelajaran.filters;
export const selectMataPelajaranDropdownOptions = (state) => state.mataPelajaran.dropdownOptions;
export const selectMataPelajaranCascadeData = (state) => state.mataPelajaran.cascadeData;
export const selectMataPelajaranStatistics = (state) => state.mataPelajaran.statistics;

export const selectMataPelajaranByJenjang = (jenjangId) => (state) => {
  return state.mataPelajaran.items.filter(item => item.id_jenjang === jenjangId);
};

export const selectMataPelajaranByKategori = (kategori) => (state) => {
  return state.mataPelajaran.items.filter(item => item.kategori === kategori);
};

export const selectActiveMataPelajaran = (state) => {
  return state.mataPelajaran.items.filter(item => item.status === 'aktif');
};

export default mataPelajaranSlice.reducer;