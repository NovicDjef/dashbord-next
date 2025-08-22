import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { getchSomeMenu } from '../services/routeApi'; // Assurez-vous que le chemin d'importation est correct

export const fetchMenusData = createAsyncThunk(
  'repas/fetchMenus',
  async (_, { rejectWithValue }) => {
    try {
       //console.log('Fetching menus...');
      const response = await getchSomeMenu();
       //console.log('Menus fetched:', response.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const menuSlice = createSlice({
  name: 'menus',
  initialState: {
    dataMenu: [], 
    statusMenus: 'idle', 
    errorMenus: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMenusData.pending, (state) => {
        state.statusMenus = 'loading'; 
      })
      .addCase(fetchMenusData.fulfilled, (state, action) => {
        state.statusMenus = 'succeeded';
        state.dataMenu = action.payload; 
      })
      .addCase(fetchMenusData.rejected, (state, action) => {
        state.statusMenus = 'failed';
        state.errorMenus = action.payload; 
      });
  },
});

export const { reducer } = menuSlice;