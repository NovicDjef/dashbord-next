import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/Api';

// Fetch all restaurants
export const fetchRestaurantsData = createAsyncThunk(
  'restaurants/fetchRestaurants',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiService.get('/restaurants');
      console.log('Réponse de l\'API:', response.data); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Create restaurant
export const createRestaurant = createAsyncThunk(
  'restaurants/createRestaurant',
  async (restaurantData, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/restaurant', restaurantData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Update restaurant
export const updateRestaurant = createAsyncThunk(
  'restaurants/updateRestaurant',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiService.put(`/restaurant/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

// Delete restaurant
export const deleteRestaurant = createAsyncThunk(
  'restaurants/deleteRestaurant',
  async (id, { rejectWithValue }) => {
    try {
      await apiService.delete(`/restaurant/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const restaurantSlice = createSlice({
  name: 'restaurants',
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
      // Fetch restaurants
      .addCase(fetchRestaurantsData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRestaurantsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchRestaurantsData.rejected, (state, action) => {
        state.status = 'failed';
        if (typeof action.payload === 'string' && action.payload.includes('<!DOCTYPE html>')) {
          state.error = 'Service temporairement indisponible. Veuillez réessayer plus tard.';
        } else if (action.payload?.message) {
          state.error = action.payload.message;
        } else if (typeof action.payload === 'string') {
          state.error = action.payload;
        } else {
          state.error = 'Erreur de connexion au serveur';
        }
        console.error('Erreur lors de la récupération des restaurants:', action.payload);
      })
      
      // Create restaurant
      .addCase(createRestaurant.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data.push(action.payload);
        state.error = null;
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la création';
      })
      
      // Update restaurant
      .addCase(updateRestaurant.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.data.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la mise à jour';
      })
      
      // Delete restaurant
      .addCase(deleteRestaurant.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = state.data.filter(item => item.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || action.payload || 'Erreur lors de la suppression';
      });
  },
});

export const { clearError } = restaurantSlice.actions;
export const { reducer: restaurantReducer } = restaurantSlice;