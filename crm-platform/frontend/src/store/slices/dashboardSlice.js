import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

const initialState = {
  stats: null,
  leadsByStatus: [],
  leadsByPriority: [],
  leadsTimeline: [],
  topPerformers: [],
  activityStats: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch stats');
    }
  }
);

export const fetchLeadsByStatus = createAsyncThunk(
  'dashboard/fetchLeadsByStatus',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/leads-by-status');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads by status');
    }
  }
);

export const fetchLeadsByPriority = createAsyncThunk(
  'dashboard/fetchLeadsByPriority',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/leads-by-priority');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads by priority');
    }
  }
);

export const fetchLeadsTimeline = createAsyncThunk(
  'dashboard/fetchLeadsTimeline',
  async (days = 30, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/leads-timeline', { params: { days } });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch leads timeline');
    }
  }
);

export const fetchTopPerformers = createAsyncThunk(
  'dashboard/fetchTopPerformers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/top-performers');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch top performers');
    }
  }
);

export const fetchActivityStats = createAsyncThunk(
  'dashboard/fetchActivityStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/dashboard/activity-stats');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity stats');
    }
  }
);

// Slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stats
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Leads by Status
      .addCase(fetchLeadsByStatus.fulfilled, (state, action) => {
        state.leadsByStatus = action.payload;
      })
      // Fetch Leads by Priority
      .addCase(fetchLeadsByPriority.fulfilled, (state, action) => {
        state.leadsByPriority = action.payload;
      })
      // Fetch Leads Timeline
      .addCase(fetchLeadsTimeline.fulfilled, (state, action) => {
        state.leadsTimeline = action.payload;
      })
      // Fetch Top Performers
      .addCase(fetchTopPerformers.fulfilled, (state, action) => {
        state.topPerformers = action.payload;
      })
      // Fetch Activity Stats
      .addCase(fetchActivityStats.fulfilled, (state, action) => {
        state.activityStats = action.payload;
      });
  },
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

