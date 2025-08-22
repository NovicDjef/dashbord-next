import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/Api';

// Action asynchrone pour récupérer tous les livreurs
export const getLivreursAsync = createAsyncThunk(
  'livreur/fetchLivreurs',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Récupération de tous les livreurs...");
      const response = await apiService.get('/livreurs');
      console.log("Réponse API - Liste des livreurs:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des livreurs:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les livreurs" });
    }
  }
);

// Action asynchrone pour récupérer un livreur spécifique par ID
export const getLivreurByIdAsync = createAsyncThunk(
  'livreur/fetchLivreurById',
  async (livreurId, { rejectWithValue }) => {
    try {
      console.log("Récupération du livreur ID:", livreurId);
      const response = await apiService.get(`/livreur/${livreurId}`);
      console.log("Réponse API - Livreur:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du livreur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer le livreur" });
    }
  }
);

const livreurSlice = createSlice({
  name: 'livreur',
  initialState: {
    currentLivreur: null,
    livreursList: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion de la récupération de tous les livreurs
      .addCase(getLivreursAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getLivreursAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.livreursList = action.payload;
      })
      .addCase(getLivreursAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer les livreurs";
      })
      
      // Gestion de la récupération d'un livreur par ID
      .addCase(getLivreurByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getLivreurByIdAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentLivreur = action.payload;
      })
      .addCase(getLivreurByIdAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer le livreur";
      });
  },
});

export const { resetLivreurState } = livreurSlice.actions;
export default livreurSlice.reducer;