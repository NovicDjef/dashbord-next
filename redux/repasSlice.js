import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/Api';

// Fetch all repas/plats
export const fetchRepas = createAsyncThunk(
  'repas/fetchRepas',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/plats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create repas
export const createRepas = createAsyncThunk(
  'repas/createRepas',
  async (repasData, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/plats', repasData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update repas
export const updateRepas = createAsyncThunk(
  'repas/updateRepas',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/plats/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete repas
export const deleteRepas = createAsyncThunk(
  'repas/deleteRepas',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/plats/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const repasSlice = createSlice({
  name: 'repas',
  initialState: {
    data: [],
    status: 'idle',
    error: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch repas
      .addCase(fetchRepas.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRepas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchRepas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la récupération';
      })
      
      // Create repas
      .addCase(createRepas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRepas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
        state.error = null;
      })
      .addCase(createRepas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la création';
      })
      
      // Update repas
      .addCase(updateRepas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRepas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRepas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la mise à jour';
      })
      
      // Delete repas
      .addCase(deleteRepas.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteRepas.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(item => item.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteRepas.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la suppression';
      });
  },
});

export const { clearError } = repasSlice.actions;
export const { reducer } = repasSlice;