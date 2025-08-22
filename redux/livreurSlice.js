import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getLivreursAsync as getLivreursAPI, createLivreurAsync as createLivreurAPI, updateLivreurAsync as updateLivreurAPI } from '../services/routeApi';

// Action asynchrone pour récupérer tous les livreurs
export const getLivreursAsync = createAsyncThunk(
  'livreur/fetchLivreurs',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Récupération de tous les livreurs...");
      const response = await getLivreursAPI();
      console.log("Réponse API - Liste des livreurs:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des livreurs:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les livreurs" });
    }
  }
);

// Action asynchrone pour créer un livreur
export const createLivreurAsync = createAsyncThunk(
  'livreur/createLivreur',
  async (livreurData, { rejectWithValue }) => {
    try {
      console.log("Création d'un nouveau livreur:", livreurData);
      const response = await createLivreurAPI(livreurData);
      console.log("Réponse API - Livreur créé:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création du livreur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de créer le livreur" });
    }
  }
);

// Action asynchrone pour mettre à jour un livreur
export const updateLivreurAsync = createAsyncThunk(
  'livreur/updateLivreur',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log("Mise à jour du livreur:", id, data);
      const response = await updateLivreurAPI(id, data);
      console.log("Réponse API - Livreur mis à jour:", response.data);
      return { id, data: response.data };
    } catch (error) {
      console.error("Erreur lors de la mise à jour du livreur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de mettre à jour le livreur" });
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

      // Gestion de la création d'un livreur
      .addCase(createLivreurAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createLivreurAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ajouter le nouveau livreur à la liste si elle existe
        if (state.livreursList && state.livreursList.livreurs) {
          state.livreursList.livreurs.push(action.payload.livreur || action.payload);
          state.livreursList.count = (state.livreursList.count || 0) + 1;
        }
        state.error = null;
      })
      .addCase(createLivreurAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de créer le livreur";
      })

      // Gestion de la mise à jour d'un livreur
      .addCase(updateLivreurAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateLivreurAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { id, data } = action.payload;
        // Mettre à jour le livreur dans la liste
        if (state.livreursList && state.livreursList.livreurs) {
          const index = state.livreursList.livreurs.findIndex(l => l.id === id);
          if (index !== -1) {
            state.livreursList.livreurs[index] = { ...state.livreursList.livreurs[index], ...data };
          }
        }
        state.error = null;
      })
      .addCase(updateLivreurAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de mettre à jour le livreur";
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