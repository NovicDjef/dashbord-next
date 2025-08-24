import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signUpUser, loginUser, resetPassword, checkAuthStatus } from './actions/authAction';
import { getUsersAsync } from '../services/routeApi';

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

// Action asynchrone pour récupérer tous les utilisateurs
export const fetchAllUsersAsync = createAsyncThunk(
  'auth/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log('🔄 Récupération de tous les utilisateurs...');
      const response = await getUsersAsync();
      console.log('✅ Utilisateurs récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
      return rejectWithValue({
        message: error.response?.data?.message || error.message || 'Erreur lors de la récupération des utilisateurs',
        status: error.response?.status
      });
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    isAuthenticated: false,
    error: null,
    redirectTo: null, // Nouvel état pour la redirection
    // États pour la liste des utilisateurs
    usersList: [],
    usersListLoading: false,
    usersListError: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.redirectTo = null; // Réinitialiser la redirection lors de la déconnexion
      webStorage.removeItem('userToken');
      AsyncStorage.removeItem('userData');
    },
    updateUserProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      AsyncStorage.setItem('userData', JSON.stringify(state.user));
    },
    setRedirectTo: (state, action) => {
      state.redirectTo = action.payload;
    },
    clearRedirectTo: (state) => {
      state.redirectTo = null;
    },
    // Actions pour gérer la liste des utilisateurs
    clearUsersListError: (state) => {
      state.usersListError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Gestion de fetchAllUsersAsync
      .addCase(fetchAllUsersAsync.pending, (state) => {
        state.usersListLoading = true;
        state.usersListError = null;
      })
      .addCase(fetchAllUsersAsync.fulfilled, (state, action) => {
        state.usersListLoading = false;
        state.usersList = action.payload?.users || action.payload || [];
        console.log('✅ Liste des utilisateurs mise à jour dans le store:', state.usersList.length, 'utilisateurs');
      })
      .addCase(fetchAllUsersAsync.rejected, (state, action) => {
        state.usersListLoading = false;
        state.usersListError = action.payload?.message || 'Erreur lors de la récupération des utilisateurs';
        console.error('❌ Échec de la récupération des utilisateurs');
      });
  },
});

export const { 
  logout, 
  updateUserProfile, 
  setRedirectTo, 
  clearRedirectTo, 
  clearUsersListError 
} = authSlice.actions;
export default authSlice.reducer;