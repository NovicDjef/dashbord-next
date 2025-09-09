
import axios from 'axios';
import { BASE_URL } from '@/services/urlApp';

// Web Storage utility pour remplacer AsyncStorage
const webStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return Promise.resolve(null);
  }
};

const apiService = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,

  headers: {
    'Content-Type': 'application/json', 
  },

  responseType: 'json',
  //withCredentials: true,
});

apiService.interceptors.request.use(
  async (config) => {
    try {
      const token = await webStorage.getItem('userToken');

      if (token) {
        config.headers.Authorization = `Bearer ${token}`; 
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error); 
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiService;


