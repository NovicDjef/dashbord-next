import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getchSomeNotification } from '../services/routeApi'; // Assurez-vous que le chemin d'importation est correct

// Thunk pour récupérer les notifications
export const fetchNotificationsData = createAsyncThunk(
  'notifications/fetchNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getchSomeNotification();
      return response.data; // Comme on utilise .json() dans le service, pas besoin de faire response.data ici
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch notifications');
    }
  }
);

// Slice Redux pour gérer l'état des notifications
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    data: [], // Données des notifications
    status: 'idle', // idle | loading | succeeded | failed
    error: null, // Erreur potentielle lors de la récupération
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Gestion des états pour la récupération des notifications
      .addCase(fetchNotificationsData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNotificationsData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload; // On stocke les notifications dans state.data
      })
      .addCase(fetchNotificationsData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // On stocke l'erreur en cas d'échec
      });
  },
});

// Export du reducer pour l'inclure dans le store Redux
export const { reducer } = notificationsSlice;
