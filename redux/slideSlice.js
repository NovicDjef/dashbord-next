import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getchSomeSlide } from '../services/routeApi';


export const fetchSlide = createAsyncThunk(
  'repas/fetchSlide',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getchSomeSlide();
      console.log('Slide fetched:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const repasSlice = createSlice({
  name: 'slide',
  initialState: {
    data: [],
    status: 'idle',
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSlide.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSlide.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchSlide.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { reducer } = repasSlice;