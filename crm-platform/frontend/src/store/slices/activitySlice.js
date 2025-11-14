import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

const initialState = {
  activities: [],
  upcomingActivities: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 20,
    pages: 0,
  },
  loading: false,
  error: null,
};

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async ({ leadId, params = {} }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/leads/${leadId}/activities`, { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activities');
    }
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async ({ leadId, activityData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/leads/${leadId}/activities`, activityData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create activity');
    }
  }
);

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/activities/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update activity');
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/activities/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete activity');
    }
  }
);

export const fetchUpcomingActivities = createAsyncThunk(
  'activities/fetchUpcomingActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/activities/upcoming');
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch upcoming activities');
    }
  }
);

// Slice
const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearActivities: (state) => {
      state.activities = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload.activities;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities.unshift(action.payload);
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Activity
      .addCase(updateActivity.fulfilled, (state, action) => {
        const index = state.activities.findIndex((act) => act.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
      })
      // Delete Activity
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.activities = state.activities.filter((act) => act.id !== action.payload);
      })
      // Fetch Upcoming Activities
      .addCase(fetchUpcomingActivities.fulfilled, (state, action) => {
        state.upcomingActivities = action.payload;
      });
  },
});

export const { clearActivities, clearError } = activitySlice.actions;
export default activitySlice.reducer;

