import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { adminSignInAsync } from '@/services/routeApi';

// Web Storage utility pour remplacer AsyncStorage
const webStorage = {
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return Promise.resolve();
  },
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  removeItem: (key) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(key);
    }
    return Promise.resolve();
  }
};

// Action asynchrone pour la connexion admin
export const signInAdmin = createAsyncThunk(
  'adminAuth/signIn',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      console.log('🔄 Tentative de connexion admin...');
      
      const response = await adminSignInAsync(email, password);
      console.log('✅ Connexion admin réussie:', response.data);

      // Stocker le token et les données admin
      await webStorage.setItem('adminToken', response.data.token);
      await webStorage.setItem('adminData', JSON.stringify(response.data.admin));

      return response.data;
    } catch (error) {
      console.error('❌ Erreur de connexion admin:', error);
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Erreur de connexion'
      );
    }
  }
);

// Action pour vérifier l'authentification au démarrage
export const checkAdminAuth = createAsyncThunk(
  'adminAuth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const token = await webStorage.getItem('adminToken');
      const adminData = await webStorage.getItem('adminData');

      if (!token || !adminData) {
        return rejectWithValue('Aucune session trouvée');
      }

      // Vérifier si le token est expiré
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const isExpired = tokenPayload.exp * 1000 < Date.now();

      if (isExpired) {
        // Nettoyer le storage si le token est expiré
        await webStorage.removeItem('adminToken');
        await webStorage.removeItem('adminData');
        return rejectWithValue('Session expirée');
      }

      return {
        admin: JSON.parse(adminData),
        token: token
      };
    } catch (error) {
      // Nettoyer en cas d'erreur
      await webStorage.removeItem('adminToken');
      await webStorage.removeItem('adminData');
      return rejectWithValue('Erreur de vérification de session');
    }
  }
);

// Action pour la déconnexion
export const signOutAdmin = createAsyncThunk(
  'adminAuth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await webStorage.removeItem('adminToken');
      await webStorage.removeItem('adminData');
      console.log('✅ Déconnexion admin réussie');
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      return rejectWithValue('Erreur lors de la déconnexion');
    }
  }
);

const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    // Données de l'admin connecté
    admin: null,
    token: null,
    
    // États de l'authentification
    isAuthenticated: false,
    isLoading: false,
    isInitialized: false,
    
    // Gestion des erreurs
    error: null,
  },
  reducers: {
    // Nettoyer les erreurs
    clearError: (state) => {
      state.error = null;
    },
    
    // Déconnexion forcée (en cas d'expiration)
    forceSignOut: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = 'Session expirée. Veuillez vous reconnecter.';
      
      // Nettoyer le storage
      webStorage.removeItem('adminToken');
      webStorage.removeItem('adminData');
    },
    
    // Réinitialiser l'état
    resetAuthState: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Connexion admin
      .addCase(signInAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(signInAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = action.payload;
      })
      
      // Vérification d'authentification
      .addCase(checkAdminAuth.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkAdminAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.isInitialized = true;
        state.error = null;
      })
      .addCase(checkAdminAuth.rejected, (state) => {
        state.isLoading = false;
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isInitialized = true;
        state.error = null; // Pas d'erreur visible pour une vérification échouée
      })
      
      // Déconnexion
      .addCase(signOutAdmin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signOutAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(signOutAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, forceSignOut, resetAuthState } = adminAuthSlice.actions;
export default adminAuthSlice.reducer;