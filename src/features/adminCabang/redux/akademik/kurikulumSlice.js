import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { kurikulumApi } from '../../api/akademik/kurikulumApi';

const initialState = {
  items: [],
  currentItem: null,
  availableMateri: [],
  assignedMateri: [],
  statistics: {
    kurikulum: 0,
    assigned_materi: 0,
    active_semester: 0,
    total_pembelajaran: 0,
    recent_kurikulum: []
  },
  loading: false,
  statisticsLoading: false,
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
    status: ''
  }
};

export const getAllKurikulum = createAsyncThunk(
  'kurikulum/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKurikulumById = createAsyncThunk(
  'kurikulum/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createKurikulum = createAsyncThunk(
  'kurikulum/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateKurikulum = createAsyncThunk(
  'kurikulum/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteKurikulum = createAsyncThunk(
  'kurikulum/delete',
  async (id, { rejectWithValue }) => {
    try {
      await kurikulumApi.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const assignMateri = createAsyncThunk(
  'kurikulum/assignMateri',
  async ({ kurikulumId, materiIds }, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.assignMateri(kurikulumId, materiIds);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const removeMateri = createAsyncThunk(
  'kurikulum/removeMateri',
  async ({ kurikulumId, materiId }, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.removeMateri(kurikulumId, materiId);
      return { kurikulumId, materiId };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const reorderMateri = createAsyncThunk(
  'kurikulum/reorderMateri',
  async ({ kurikulumId, materiOrder }, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.reorderMateri(kurikulumId, materiOrder);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getAvailableMateri = createAsyncThunk(
  'kurikulum/getAvailableMateri',
  async ({ kurikulumId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.getAvailableMateri(kurikulumId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getKurikulumStatistics = createAsyncThunk(
  'kurikulum/getStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await kurikulumApi.getGeneralStatistics(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const kurikulumSlice = createSlice({
  name: 'kurikulum',
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
      state.assignedMateri = [];
      state.availableMateri = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    updateMateriOrder: (state, action) => {
      state.assignedMateri = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAllKurikulum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllKurikulum.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data.data;
        state.pagination = {
          currentPage: action.payload.data.current_page,
          lastPage: action.payload.data.last_page,
          perPage: action.payload.data.per_page,
          total: action.payload.data.total
        };
      })
      .addCase(getAllKurikulum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil data kurikulum';
      })

      .addCase(getKurikulumById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getKurikulumById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload.data;
        // Extract materi from kurikulum_materi
        state.assignedMateri = action.payload.data.kurikulum_materi?.map(km => km.materi) || [];
      })
      .addCase(getKurikulumById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil detail kurikulum';
      })

      .addCase(createKurikulum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createKurikulum.fulfilled, (state, action) => {
        state.loading = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createKurikulum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal membuat kurikulum';
      })

      .addCase(updateKurikulum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateKurikulum.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.items.findIndex(item => item.id_kurikulum === action.payload.data.id_kurikulum);
        if (index !== -1) {
          state.items[index] = action.payload.data;
        }
        state.currentItem = action.payload.data;
      })
      .addCase(updateKurikulum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengupdate kurikulum';
      })

      .addCase(deleteKurikulum.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteKurikulum.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id_kurikulum !== action.payload);
      })
      .addCase(deleteKurikulum.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal menghapus kurikulum';
      })

      .addCase(assignMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(assignMateri.fulfilled, (state, action) => {
        state.loading = false;
        // Update currentItem with the full kurikulum data returned from backend
        state.currentItem = action.payload.data;
        // Extract materi from kurikulum_materi for assignedMateri
        state.assignedMateri = action.payload.data.kurikulum_materi?.map(km => km.materi) || [];
      })
      .addCase(assignMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal menambah materi ke kurikulum';
      })

      .addCase(removeMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeMateri.fulfilled, (state, action) => {
        state.loading = false;
        const { materiId } = action.payload;
        // Remove from assignedMateri
        state.assignedMateri = state.assignedMateri.filter(materi => materi.id_materi !== materiId);
        // Remove from currentItem.kurikulum_materi
        if (state.currentItem && state.currentItem.kurikulum_materi) {
          state.currentItem.kurikulum_materi = state.currentItem.kurikulum_materi.filter(
            km => km.materi.id_materi !== materiId
          );
        }
      })
      .addCase(removeMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal menghapus materi dari kurikulum';
      })

      .addCase(reorderMateri.fulfilled, (state, action) => {
        // Update currentItem with the full kurikulum data returned from backend
        state.currentItem = action.payload.data;
        // Extract materi from kurikulum_materi for assignedMateri
        state.assignedMateri = action.payload.data.kurikulum_materi?.map(km => km.materi) || [];
      })

      .addCase(getAvailableMateri.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableMateri.fulfilled, (state, action) => {
        state.loading = false;
        // FIX: Extract the actual data array from paginated response
        state.availableMateri = action.payload.data?.data || [];
      })
      .addCase(getAvailableMateri.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Gagal mengambil data materi tersedia';
        state.availableMateri = [];
      })

      .addCase(getKurikulumStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.error = null;
      })
      .addCase(getKurikulumStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload.data || {};
      })
      .addCase(getKurikulumStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.error = action.payload?.message || action.payload || 'Gagal mengambil statistik kurikulum';
      });
  }
});

export const { setFilters, resetFilters, clearCurrentItem, clearError, updateMateriOrder } = kurikulumSlice.actions;

export const selectKurikulumItems = (state) => state.kurikulum.items;
export const selectCurrentKurikulum = (state) => state.kurikulum.currentItem;
export const selectKurikulumLoading = (state) => state.kurikulum.loading;
export const selectKurikulumError = (state) => state.kurikulum.error;
export const selectKurikulumPagination = (state) => state.kurikulum.pagination;
export const selectKurikulumFilters = (state) => state.kurikulum.filters;
export const selectAssignedMateri = (state) => state.kurikulum.assignedMateri;
export const selectAvailableMateri = (state) => state.kurikulum?.availableMateri || [];
export const selectKurikulumStatistics = (state) => state.kurikulum.statistics;
export const selectStatisticsLoading = (state) => state.kurikulum.statisticsLoading;

export const selectKurikulumById = (id) => (state) => {
  return state.kurikulum.items.find(item => item.id_kurikulum === id);
};

export const selectActiveKurikulum = (state) => {
  return state.kurikulum.items.filter(item => item.status === 'aktif');
};

export const selectKurikulumForDropdown = (state) => {
  return state.kurikulum.items.map(item => ({
    value: item.id_kurikulum,
    label: item.nama_kurikulum,
    jenjang: item.jenjang?.nama_jenjang
  }));
};

export default kurikulumSlice.reducer;