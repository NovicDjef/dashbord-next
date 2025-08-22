import { createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../../services/Api';

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

// JWT decode function replacement
const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Token decode error:', error);
    return {};
  }
};

export const signUpUser = createAsyncThunk(
  'auth/signUpUser',
  async ({ username, phone, image, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/signup', { username, phone, image, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        console.debug("Token user :", token)
        console.debug("Données utilisateur reçues :", user)
        try{
          const decodedToken = decodeToken(token);
          console.log("Token décodé:", decodedToken);

          await webStorage.setItem('userToken', token);
          await webStorage.setItem('userData', JSON.stringify({ ...user, ...decodedToken }));

          return {
            token,
            user: { ...user, ...decodedToken },
            message: response.data.userMessage
          };
        } catch (decodeError) {
          console.error("Erreur lors du décodage du token ou de la sauvegarde:", decodeError);
          return rejectWithValue("Erreur lors du traitement des données d'authentification.");
        }
      } else {
        console.log("La requête a réussi mais avec une réponse négative:", response.data);
        return rejectWithValue(response.data.userMessage || "L'inscription a échoué pour une raison inconnue.");
      }
    } catch (error) {
      console.error("Erreur lors de la requête d'inscription:", error);
      return rejectWithValue(error.response?.data?.userMessage || "Une erreur s'est produite lors de l'inscription.");
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkAuthStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = await webStorage.getItem('userToken');
      const userData = await webStorage.getItem('userData');
      
      if (token && userData) {
        return { token, user: JSON.parse(userData) };
      }
      return rejectWithValue('Aucune session active');
    } catch (error) {
      return rejectWithValue("Erreur lors de la vérification de l'authentification");
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ phone, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/login', { phone, password });
      
      if (response.data.success) {
        const { token, user } = response.data;
        const decodedToken = decodeToken(token);
        
        await webStorage.setItem('userToken', token);
        await webStorage.setItem('userData', JSON.stringify({ ...user, ...decodedToken }));
        
        return {
          token,
          user: { ...user, ...decodedToken },
          message: response.data.userMessage
        };
      } else {
        return rejectWithValue(response.data.userMessage);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.userMessage || "Une erreur s'est produite lors de la connexion.");
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ phone, newPassword }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/resetPassword', { phone, newPassword });
      
      if (response.data.success) {
        const { token, user } = response.data;
        const decodedToken = decodeToken(token);
        console.debug("Token user :", decodedToken)
        await webStorage.setItem('userToken', token);
        await webStorage.setItem('userData', JSON.stringify({ ...user, ...decodedToken }));
        
        return {
          token,
          user: { ...user, ...decodedToken },
          message: response.data.userMessage
        };
      } else {
        return rejectWithValue(response.data.userMessage);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.userMessage || "Une erreur s'est produite lors de la réinitialisation du mot de passe.");
    }
  }
);

