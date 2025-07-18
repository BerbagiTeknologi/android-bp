import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jenjangApi } from '../../api/masterData/jenjangApi';
import { extractErrorMessage, extractValidationErrors } from '../../../../common/utils/errorHandler';


const initialState = {
  items: [],
  currentItem: null,
  dropdownOptions: [],
  statistics: {},
  existingUrutan: [],
  urutanValidation: {
    checking: false,
    available: null,
    error: null
  },
  loading: false,
  error: null,
  validationErrors: null,
  pagination: {
    currentPage: 1,
    lastPage: 1,
    perPage: 20,
    total: 0
  },
  filters: {
    search: '',
    status: ''
  }
};

export const getAllJenjang = createAsyncThunk(
  'jenjang/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getJenjangById = createAsyncThunk(
  'jenjang/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createJenjang = createAsyncThunk(
  'jenjang/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateJenjang = createAsyncThunk(
  'jenjang/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteJenjang = createAsyncThunk(
  'jenjang/delete',
  async (id, { rejectWithValue }) => {
    try {
      await jenjangApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getJenjangForDropdown = createAsyncThunk(
  'jenjang/getForDropdown',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.getForDropdown(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getJenjangStatistics = createAsyncThunk(
  'jenjang/getStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.getStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const checkUrutanAvailability = createAsyncThunk(
  'jenjang/checkUrutanAvailability',
  async ({ urutan, excludeId }, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.checkUrutanAvailability(urutan, excludeId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getExistingUrutan = createAsyncThunk(
  'jenjang/getExistingUrutan',
  async (_, { rejectWithValue }) => {
    try {
      const response = await jenjangApi.getExistingUrutan();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const jenjangSlice = createSlice({
  name: 'jenjang',
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
      state.validationErrors = null;
    },
    clearUrutanValidation: (state) => {
      state.urutanValidation = {
        checking: false,
        available: null,
        error: null
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllJenjang.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllJenjang.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = {
          currentPage: action.payload.current_page,
          lastPage: action.payload.last_page,
          perPage: action.payload.per_page,
          total: action.payload.total
        };
      })
      .addCase(getAllJenjang.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload) || 'Gagal mengambil data jenjang';
        state.validationErrors = extractValidationErrors(action.payload);
      })

      .addCase(getJenjangById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getJenjangById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data.jenjang;
        state.statistics = action.payload.data.statistics;
      })
      .addCase(getJenjangById.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload) || 'Gagal mengambil detail jenjang';
        state.validationErrors = extractValidationErrors(action.payload);
      })

      .addCase(createJenjang.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createJenjang.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createJenjang.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload) || 'Gagal membuat jenjang';
        state.validationErrors = extractValidationErrors(action.payload);
      })

      .addCase(updateJenjang.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateJenjang.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id_jenjang === action.payload.data.id_jenjang);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
      })
      .addCase(updateJenjang.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload) || 'Gagal mengupdate jenjang';
        state.validationErrors = extractValidationErrors(action.payload);
      })

      .addCase(deleteJenjang.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteJenjang.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id_jenjang !== action.payload);
      })
      .addCase(deleteJenjang.rejected, (state, action) => {
        state.loading = false;
        state.error = extractErrorMessage(action.payload) || 'Gagal menghapus jenjang';
        state.validationErrors = extractValidationErrors(action.payload);
      })

      .addCase(getJenjangForDropdown.fulfilled, (state, action) => {
        state.dropdownOptions = action.payload.data || action.payload;
      })

      .addCase(getJenjangStatistics.fulfilled, (state, action) => {
        state.statistics = action.payload;
      })

      .addCase(checkUrutanAvailability.pending, (state) => {
        state.urutanValidation.checking = true;
        state.urutanValidation.error = null;
      })
      .addCase(checkUrutanAvailability.fulfilled, (state, action) => {
        state.urutanValidation.checking = false;
        state.urutanValidation.available = action.payload.data.available;
      })
      .addCase(checkUrutanAvailability.rejected, (state, action) => {
        state.urutanValidation.checking = false;
        state.urutanValidation.error = extractErrorMessage(action.payload);
      })

      .addCase(getExistingUrutan.fulfilled, (state, action) => {
        state.existingUrutan = action.payload.data || [];
      });
  }
});

export const { setFilters, resetFilters, clearCurrentItem, clearError, clearUrutanValidation } = jenjangSlice.actions;

export const selectJenjangItems = (state) => state.jenjang.items;
export const selectCurrentJenjang = (state) => state.jenjang.currentItem;
export const selectJenjangLoading = (state) => state.jenjang.loading;
export const selectJenjangError = (state) => state.jenjang.error;
export const selectJenjangValidationErrors = (state) => state.jenjang.validationErrors;
export const selectExistingUrutan = (state) => state.jenjang.existingUrutan;
export const selectUrutanValidation = (state) => state.jenjang.urutanValidation;
export const selectJenjangPagination = (state) => state.jenjang.pagination;
export const selectJenjangFilters = (state) => state.jenjang.filters;
export const selectJenjangDropdownOptions = (state) => state.jenjang.dropdownOptions;
export const selectJenjangStatistics = (state) => state.jenjang.statistics;

export const selectJenjangById = (id) => (state) => {
  return state.jenjang.items.find(item => item.id_jenjang === id);
};

export const selectActiveJenjang = (state) => {
  return state.jenjang.items.filter(item => item.status === 'aktif');
};

export default jenjangSlice.reducer;