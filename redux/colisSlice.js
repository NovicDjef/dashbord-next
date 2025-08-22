import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import apiService from '../services/Api';
import { showNotification } from '../app/utils/notificationUtils';


export const createColisAsync = createAsyncThunk(
    'colis/addSomeColis',
    async (formData, { rejectWithValue }) => {
      try {
        console.log("Données envoyées à l'API:", formData);
        const response = await apiService.post('/colis', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        console.log("Reponse API:", response.data);
        return response.data;
      } catch (error) {
        console.error("Erreur lors de l'appel API:", error.response?.data);
        return rejectWithValue(error.response?.data || { message: "Une erreur est survenue" });
      }
    }
  );
export const getColisAsync = createAsyncThunk(
  'colis/fetchColis',
  async (_, { rejectWithValue }) => {
    try {
      // Appel API pour récupérer les colis
      const response = await apiService.get('/colis');
      return response.data; // Retourne les données des colis
    } catch (error) {
      console.error("Erreur lors de la récupération des colis:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les colis" });
    }
  }
);

// Action pour détecter les changements de statut et envoyer des notifications
export const updateColisStatusAsync = createAsyncThunk(
  'colis/updateStatus',
  async (colisData, { getState, rejectWithValue }) => {
    try {
      const currentState = getState();
      const currentColis = currentState.colis.colisList.find(c => c.id === colisData.id);
      
      // Si le statut a changé, créer une notification
      if (currentColis && currentColis.status !== colisData.status) {
        console.log(`🔔 Changement de statut détecté pour le colis ${colisData.id}: ${currentColis.status} -> ${colisData.status}`);
        
        try {
          await showNotification(
            colisData,
            'colis',
            colisData.status
          );
          console.log('✅ Notification de mise à jour créée pour le colis');
        } catch (notificationError) {
          console.error('❌ Erreur lors de la création de la notification:', notificationError);
        }
      }
      
      return colisData;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      return rejectWithValue(error.message || "Erreur lors de la mise à jour du statut");
    }
  }
);

const colisSlice = createSlice({
    name: 'colis',
    initialState: {
      currentColis: null,
      colisList: [],
      status: 'idle',
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        .addCase(createColisAsync.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(createColisAsync.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.currentColis = action.payload;
        })
        .addCase(createColisAsync.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || "Une erreur est survenue";
        })
        // Gestion de la récupération des colis
      .addCase(getColisAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(getColisAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Conserver les anciens colis pour détecter les changements
        const oldColisList = [...state.colisList];
        state.colisList = action.payload;
        
        // Détecter les changements de statut
        if (oldColisList.length > 0) {
          action.payload.forEach(newColis => {
            const oldColis = oldColisList.find(c => c.id === newColis.id);
            if (oldColis && oldColis.status !== newColis.status) {
              console.log(`🔔 Détection changement statut colis ${newColis.id}: ${oldColis.status} -> ${newColis.status}`);
            }
          });
        }
      })
      .addCase(getColisAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer les colis";
      })
      // Gestion de la mise à jour de statut
      .addCase(updateColisStatusAsync.fulfilled, (state, action) => {
        const updatedColis = action.payload;
        const index = state.colisList.findIndex(c => c.id === updatedColis.id);
        if (index !== -1) {
          state.colisList[index] = updatedColis;
        }
      });
    },
  });

export const { resetColisState } = colisSlice.actions;
// /export { updateColisStatusAsync };
export default colisSlice.reducer;