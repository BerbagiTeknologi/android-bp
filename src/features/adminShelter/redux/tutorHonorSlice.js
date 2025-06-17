import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tutorHonorApi } from '../api/tutorHonorApi';

const initialState = {
  honorList: [],
  selectedHonor: null,
  monthlyDetail: null,
  stats: null,
  loading: false,
  error: null,
  summary: {
    totalThisMonth: 0,
    totalActivities: 0,
    averageStudents: 0,
    yearlyTotal: 0
  },
  actionStatus: {
    calculate: 'idle',
    approve: 'idle',
    markPaid: 'idle'
  },
  actionError: {
    calculate: null,
    approve: null,
    markPaid: null
  },
  honorHistory: [],
  honorStatistics: null,
  historyFilters: {
    start_date: null,
    end_date: null,
    status: '',
    year: null
  },
  historyPagination: {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0
  },
  historyLoading: false,
  statisticsLoading: false,
  historyError: null,
  statisticsError: null
};

export const fetchTutorHonor = createAsyncThunk(
  'tutorHonor/fetchTutorHonor',
  async ({ tutorId, params }, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.getTutorHonor(tutorId, params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tutor honor');
    }
  }
);

export const fetchMonthlyDetail = createAsyncThunk(
  'tutorHonor/fetchMonthlyDetail',
  async ({ tutorId, month, year }, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.getMonthlyDetail(tutorId, month, year);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch monthly detail');
    }
  }
);

export const calculateHonor = createAsyncThunk(
  'tutorHonor/calculateHonor',
  async ({ tutorId, data }, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.calculateHonor(tutorId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to calculate honor');
    }
  }
);

export const approveHonor = createAsyncThunk(
  'tutorHonor/approveHonor',
  async (honorId, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.approveHonor(honorId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to approve honor');
    }
  }
);

export const markAsPaid = createAsyncThunk(
  'tutorHonor/markAsPaid',
  async (honorId, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.markAsPaid(honorId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark as paid');
    }
  }
);

export const fetchHonorStats = createAsyncThunk(
  'tutorHonor/fetchHonorStats',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.getHonorStats(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch honor stats');
    }
  }
);

export const fetchHonorHistory = createAsyncThunk(
  'tutorHonor/fetchHonorHistory',
  async ({ tutorId, filters }, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.getHonorHistory(tutorId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch honor history');
    }
  }
);

export const fetchHonorStatistics = createAsyncThunk(
  'tutorHonor/fetchHonorStatistics',
  async ({ tutorId, filters }, { rejectWithValue }) => {
    try {
      const response = await tutorHonorApi.getHonorStatistics(tutorId, filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch honor statistics');
    }
  }
);

const tutorHonorSlice = createSlice({
  name: 'tutorHonor',
  initialState,
  reducers: {
    resetHonorDetail: (state) => {
      state.selectedHonor = null;
      state.monthlyDetail = null;
    },
    resetError: (state) => {
      state.error = null;
    },
    resetActionStatus: (state, action) => {
      const actionType = action.payload;
      if (actionType && state.actionStatus[actionType]) {
        state.actionStatus[actionType] = 'idle';
        state.actionError[actionType] = null;
      } else {
        Object.keys(state.actionStatus).forEach(key => {
          state.actionStatus[key] = 'idle';
          state.actionError[key] = null;
        });
      }
    },
    updateSummary: (state, action) => {
      state.summary = { ...state.summary, ...action.payload };
    },
    setHistoryFilters: (state, action) => {
      state.historyFilters = { ...state.historyFilters, ...action.payload };
    },
    resetHistoryFilters: (state) => {
      state.historyFilters = {
        start_date: null,
        end_date: null,
        status: '',
        year: null
      };
    },
    resetHistoryError: (state) => {
      state.historyError = null;
    },
    resetStatisticsError: (state) => {
      state.statisticsError = null;
    },
    clearHonorHistory: (state) => {
      state.honorHistory = [];
      state.historyPagination = {
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0
      };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTutorHonor.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTutorHonor.fulfilled, (state, action) => {
        state.loading = false;
        state.honorList = action.payload.data?.honors_per_bulan || [];
        state.summary = {
          totalThisMonth: 0,
          totalActivities: action.payload.data?.total_aktivitas_tahun || 0,
          averageStudents: action.payload.data?.rata_rata_bulanan || 0,
          yearlyTotal: action.payload.data?.total_honor_tahun || 0
        };
      })
      .addCase(fetchTutorHonor.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(fetchMonthlyDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonthlyDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.monthlyDetail = action.payload.data;
        state.stats = action.payload.stats;
      })
      .addCase(fetchMonthlyDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      .addCase(calculateHonor.pending, (state) => {
        state.actionStatus.calculate = 'loading';
        state.actionError.calculate = null;
      })
      .addCase(calculateHonor.fulfilled, (state, action) => {
        state.actionStatus.calculate = 'succeeded';
        const calculatedHonor = action.payload.data;
        
        const existingIndex = state.honorList.findIndex(
          h => h.bulan === calculatedHonor.bulan && h.tahun === calculatedHonor.tahun
        );
        
        if (existingIndex !== -1) {
          state.honorList[existingIndex] = calculatedHonor;
        } else {
          state.honorList.unshift(calculatedHonor);
          state.honorList.sort((a, b) => {
            if (a.tahun !== b.tahun) return b.tahun - a.tahun;
            return b.bulan - a.bulan;
          });
        }
        
        if (state.monthlyDetail && 
            state.monthlyDetail.bulan === calculatedHonor.bulan && 
            state.monthlyDetail.tahun === calculatedHonor.tahun) {
          state.monthlyDetail = calculatedHonor;
        }
        
        state.summary.yearlyTotal = state.honorList
          .filter(h => h.tahun === calculatedHonor.tahun)
          .reduce((sum, h) => sum + parseFloat(h.total_honor || 0), 0);
      })
      .addCase(calculateHonor.rejected, (state, action) => {
        state.actionStatus.calculate = 'failed';
        state.actionError.calculate = action.payload;
      })
      
      .addCase(approveHonor.pending, (state) => {
        state.actionStatus.approve = 'loading';
        state.actionError.approve = null;
      })
      .addCase(approveHonor.fulfilled, (state, action) => {
        state.actionStatus.approve = 'succeeded';
        const approvedHonor = action.payload.data;
        
        const index = state.honorList.findIndex(h => h.id_honor === approvedHonor.id_honor);
        if (index !== -1) {
          state.honorList[index] = approvedHonor;
        }
        
        if (state.monthlyDetail && state.monthlyDetail.id_honor === approvedHonor.id_honor) {
          state.monthlyDetail = approvedHonor;
        }
      })
      .addCase(approveHonor.rejected, (state, action) => {
        state.actionStatus.approve = 'failed';
        state.actionError.approve = action.payload;
      })
      
      .addCase(markAsPaid.pending, (state) => {
        state.actionStatus.markPaid = 'loading';
        state.actionError.markPaid = null;
      })
      .addCase(markAsPaid.fulfilled, (state, action) => {
        state.actionStatus.markPaid = 'succeeded';
        const paidHonor = action.payload.data;
        
        const index = state.honorList.findIndex(h => h.id_honor === paidHonor.id_honor);
        if (index !== -1) {
          state.honorList[index] = paidHonor;
        }
        
        if (state.monthlyDetail && state.monthlyDetail.id_honor === paidHonor.id_honor) {
          state.monthlyDetail = paidHonor;
        }
      })
      .addCase(markAsPaid.rejected, (state, action) => {
        state.actionStatus.markPaid = 'failed';
        state.actionError.markPaid = action.payload;
      })
      
      .addCase(fetchHonorStats.fulfilled, (state, action) => {
        state.stats = action.payload.data;
      })
      
      .addCase(fetchHonorHistory.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchHonorHistory.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.honorHistory = action.payload.data || [];
        
        if (action.payload.pagination) {
          state.historyPagination = {
            current_page: action.payload.pagination.current_page || 1,
            last_page: action.payload.pagination.last_page || 1,
            per_page: action.payload.pagination.per_page || 10,
            total: action.payload.pagination.total || 0
          };
        }
      })
      .addCase(fetchHonorHistory.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.payload || 'Failed to fetch honor history';
      })
      
      .addCase(fetchHonorStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(fetchHonorStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.honorStatistics = action.payload.data;
      })
      .addCase(fetchHonorStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.payload || 'Failed to fetch honor statistics';
      });
  }
});

export const {
  resetHonorDetail,
  resetError,
  resetActionStatus,
  updateSummary,
  setHistoryFilters,
  resetHistoryFilters,
  resetHistoryError,
  resetStatisticsError,
  clearHonorHistory
} = tutorHonorSlice.actions;

export const selectHonorList = state => state.tutorHonor.honorList;
export const selectSelectedHonor = state => state.tutorHonor.selectedHonor;
export const selectMonthlyDetail = state => state.tutorHonor.monthlyDetail;
export const selectHonorStats = state => state.tutorHonor.stats;
export const selectHonorLoading = state => state.tutorHonor.loading;
export const selectHonorError = state => state.tutorHonor.error;
export const selectHonorSummary = state => state.tutorHonor.summary;
export const selectHonorActionStatus = (state, action) => state.tutorHonor.actionStatus[action];
export const selectHonorActionError = (state, action) => state.tutorHonor.actionError[action];
export const selectHonorHistory = state => state.tutorHonor.honorHistory;
export const selectHonorStatistics = state => state.tutorHonor.honorStatistics;
export const selectHistoryFilters = state => state.tutorHonor.historyFilters;
export const selectHistoryPagination = state => state.tutorHonor.historyPagination;
export const selectHistoryLoading = state => state.tutorHonor.historyLoading;
export const selectStatisticsLoading = state => state.tutorHonor.statisticsLoading;
export const selectHistoryError = state => state.tutorHonor.historyError;
export const selectStatisticsError = state => state.tutorHonor.statisticsError;

export default tutorHonorSlice.reducer;