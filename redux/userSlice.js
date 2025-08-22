// src/redux/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { updateSomeUser, updateSomeUserInfo } from '../services/routeApi';

export const updatePushTokenAsync = createAsyncThunk(
  'user/updatePushToken',
  async ({ userId, pushToken }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Mise à jour du token push pour l'utilisateur ${userId}`);
      console.log(`📱 Token à envoyer:`, pushToken);
      
      // ✅ CORRECTION: Passer directement le token, pas un objet
      const response = await updateSomeUser(userId, pushToken);  // ✅ Pas { pushToken }
      
      console.log('✅ Réponse serveur:', response.data);
      return {
        userId,
        pushToken,
        response: response.data
      };
    } catch (error) {
      console.error('❌ Erreur API updatePushToken:', error);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du token',
        status: error.response?.status
      });
    }
  }
);

// Action pour mettre à jour le profil utilisateur
export const updateUserProfileAsync = createAsyncThunk(
  'user/updateProfile',
  async ({ userData }, { rejectWithValue }) => {
    try {
      console.log('🔄 Mise à jour du profil utilisateur:', userData);
      
      // Préparer les données pour l'API (sans inclure l'image source)
      const apiData = {
        username: userData.username,
        phone: userData.phone,
        email: userData.email,
        avatarId: userData.avatarId,
      };
      
      // Appel API pour sauvegarder côté serveur
      const response = await updateSomeUserInfo(userData.id, apiData);
      console.log('✅ Réponse serveur:', response.data);
      
      return {
        user: {
          ...userData,
          ...response.data?.user, // Données mises à jour du serveur si disponibles
        },
        message: response.data?.message || 'Profil mis à jour avec succès'
      };
    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du profil:', error);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Erreur lors de la mise à jour du profil'
      });
    }
  }
);

// Dans votre userSlice, ajoutez dans extraReducers :
const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    pushToken: null,
    pushTokenLoading: false,
    pushTokenError: null,
    profileUpdateLoading: false,
    profileUpdateError: null,
    profileUpdateSuccess: false,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearUser: (state) => {
      state.currentUser = null;
      state.pushToken = null;
      state.profileUpdateSuccess = false;
    },
    clearProfileUpdateStatus: (state) => {
      state.profileUpdateSuccess = false;
      state.profileUpdateError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Gestion de updatePushTokenAsync
      .addCase(updatePushTokenAsync.pending, (state) => {
        state.pushTokenLoading = true;
        state.pushTokenError = null;
      })
      .addCase(updatePushTokenAsync.fulfilled, (state, action) => {
        state.pushTokenLoading = false;
        state.pushToken = action.payload.pushToken;
        console.log('✅ Token push mis à jour dans le store');
      })
      .addCase(updatePushTokenAsync.rejected, (state, action) => {
        state.pushTokenLoading = false;
        state.pushTokenError = action.payload?.message || 'Erreur inconnue';
        console.error('❌ Échec de la mise à jour du token push');
      })
      // Gestion de updateUserProfileAsync
      .addCase(updateUserProfileAsync.pending, (state) => {
        state.profileUpdateLoading = true;
        state.profileUpdateError = null;
        state.profileUpdateSuccess = false;
      })
      .addCase(updateUserProfileAsync.fulfilled, (state, action) => {
        state.profileUpdateLoading = false;
        state.currentUser = action.payload.user;
        state.profileUpdateSuccess = true;
        console.log('✅ Profil utilisateur mis à jour dans le store');
      })
      .addCase(updateUserProfileAsync.rejected, (state, action) => {
        state.profileUpdateLoading = false;
        state.profileUpdateError = action.payload?.message || 'Erreur lors de la mise à jour du profil';
        console.error('❌ Échec de la mise à jour du profil utilisateur');
      });
  },
});

export const { setCurrentUser, clearUser, clearProfileUpdateStatus } = userSlice.actions;
export default userSlice.reducer;