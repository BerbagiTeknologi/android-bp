import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kelasApi } from '../../api/masterData/kelasApi';

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
    tingkat: '',
    status: ''
  }
};

export const getAllKelas = createAsyncThunk(
  'kelas/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kelasApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKelasById = createAsyncThunk(
  'kelas/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await kelasApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createKelas = createAsyncThunk(
  'kelas/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await kelasApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateKelas = createAsyncThunk(
  'kelas/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await kelasApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteKelas = createAsyncThunk(
  'kelas/delete',
  async (id, { rejectWithValue }) => {
    try {
      await kelasApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKelasByJenjang = createAsyncThunk(
  'kelas/getByJenjang',
  async (jenjangId, { rejectWithValue }) => {
    try {
      const response = await kelasApi.getByJenjang(jenjangId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKelasForDropdown = createAsyncThunk(
  'kelas/getForDropdown',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kelasApi.getForDropdown(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKelasCascadeData = createAsyncThunk(
  'kelas/getCascadeData',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kelasApi.getCascadeData(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKelasStatistics = createAsyncThunk(
  'kelas/getStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kelasApi.getStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const kelasSlice = createSlice({
  name: 'kelas',
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
      .addCase(getAllKelas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllKelas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.data;
        state.pagination = {
          currentPage: action.payload.data.current_page,
          lastPage: action.payload.data.last_page,
          perPage: action.payload.data.per_page,
          total: action.payload.data.total
        };
      })
      .addCase(getAllKelas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil data kelas';
      })

      .addCase(getKelasById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKelasById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data;
      })
      .addCase(getKelasById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil detail kelas';
      })

      .addCase(createKelas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKelas.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createKelas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal membuat kelas';
      })

      .addCase(updateKelas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKelas.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id_kelas === action.payload.data.id_kelas);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
      })
      .addCase(updateKelas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengupdate kelas';
      })

      .addCase(deleteKelas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKelas.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id_kelas !== action.payload);
      })
      .addCase(deleteKelas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal menghapus kelas';
      })

      .addCase(getKelasByJenjang.fulfilled, (state, action) => {
        state.cascadeData.byJenjang = action.payload;
      })

      .addCase(getKelasForDropdown.fulfilled, (state, action) => {
        state.dropdownOptions = action.payload.data || action.payload;
      })

      .addCase(getKelasCascadeData.fulfilled, (state, action) => {
        state.cascadeData = { ...state.cascadeData, ...action.payload };
      })

      .addCase(getKelasStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      });
  }
});

export const { setFilters, resetFilters, clearCurrentItem, clearError } = kelasSlice.actions;

export const selectKelasItems = (state) => state.kelas.items;
export const selectCurrentKelas = (state) => state.kelas.currentItem;
export const selectKelasLoading = (state) => state.kelas.loading;
export const selectKelasError = (state) => state.kelas.error;
export const selectKelasPagination = (state) => state.kelas.pagination;
export const selectKelasFilters = (state) => state.kelas.filters;
export const selectKelasDropdownOptions = (state) => state.kelas.dropdownOptions;
export const selectKelasCascadeData = (state) => state.kelas.cascadeData;
export const selectKelasStatistics = (state) => state.kelas.statistics;

export const selectKelasByJenjang = (jenjangId) => (state) => {
  return state.kelas.items.filter(item => item.id_jenjang === jenjangId);
};

export const selectKelasByTingkat = (tingkat) => (state) => {
  return state.kelas.items.filter(item => item.tingkat === tingkat);
};

export const selectActiveKelas = (state) => {
  return state.kelas.items.filter(item => item.status === 'aktif');
};

export default kelasSlice.reducer;