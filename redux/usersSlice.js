import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getUsersAsync as getUsersAPI, 
  createUserAsync as createUserAPI, 
  updateUserAsync as updateUserAPI
} from '../services/routeApi';
import { signUpUser, resetPassword } from './actions/authAction';

// Action pour récupérer tous les utilisateurs
export const getUsersAsync = createAsyncThunk(
  'users/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      console.log("Récupération de tous les utilisateurs...");
      const response = await getUsersAPI();
      console.log("Réponse API - Liste des utilisateurs:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les utilisateurs" });
    }
  }
);

// Action pour créer un utilisateur
export const createUserAsync = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      console.log("Création d'un nouvel utilisateur:", userData);
      const response = await createUserAPI(userData);
      console.log("Réponse API - Utilisateur créé:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de créer l'utilisateur" });
    }
  }
);

// Action pour mettre à jour un utilisateur
export const updateUserAsync = createAsyncThunk(
  'users/updateUser',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      console.log("Mise à jour de l'utilisateur:", id, data);
      const response = await updateUserAPI(id, data);
      console.log("Réponse API - Utilisateur mis à jour:", response.data);
      return { id, data: response.data };
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de mettre à jour l'utilisateur" });
    }
  }
);

const usersSlice = createSlice({
  name: 'users',
  initialState: {
    usersList: [],
    currentUser: null,
    status: 'idle',
    error: null,
    resetPasswordStatus: 'idle',
    resetPasswordError: null,
  },
  reducers: {
    clearUsersError: (state) => {
      state.error = null;
      state.resetPasswordError = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Récupération des utilisateurs
      .addCase(getUsersAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getUsersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.usersList = action.payload;
        state.error = null;
      })
      .addCase(getUsersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer les utilisateurs";
      })

      // Création d'utilisateur
      .addCase(createUserAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createUserAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ajouter le nouvel utilisateur à la liste
        if (action.payload && action.payload.user) {
          state.usersList.push(action.payload.user);
        }
        state.error = null;
      })
      .addCase(createUserAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de créer l'utilisateur";
      })

      // Mise à jour d'utilisateur
      .addCase(updateUserAsync.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateUserAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { id, data } = action.payload;
        // Mettre à jour l'utilisateur dans la liste
        const index = state.usersList.findIndex(u => u.id === id);
        if (index !== -1) {
          state.usersList[index] = { ...state.usersList[index], ...data };
        }
        state.error = null;
      })
      .addCase(updateUserAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de mettre à jour l'utilisateur";
      });
  },
});

export const { 
  clearUsersError, 
  setCurrentUser, 
  clearCurrentUser 
} = usersSlice.actions;

export default usersSlice.reducer;