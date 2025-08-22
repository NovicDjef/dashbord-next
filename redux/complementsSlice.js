import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getchSomeComplements } from '../services/routeApi'; // Assurez-vous que le chemin d'importation est correct

// Action asynchrone pour récupérer les compléments
export const fetchComplements = createAsyncThunk(
  'complements/fetchComplements',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getchSomeComplements();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const complementsSlice = createSlice({
  name: 'complements',
  initialState: {
    items: [],
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchComplements.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchComplements.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchComplements.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export default complementsSlice.reducer;