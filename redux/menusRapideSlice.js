import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getchSomeRepas } from '../services/routeApi'; // Assurez-vous que le chemin d'importation est correct

export const fetchMenusRapide = createAsyncThunk(
  'menusRapide/fetchMenusRapide',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getchSomeRepas();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const menusRapideSlice = createSlice({
  name: 'menusRapide',
  initialState: {
    data: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenusRapide.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchMenusRapide.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchMenusRapide.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { reducer } = menusRapideSlice;