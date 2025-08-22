// Services temporaires pour maintenir la compatibilité
import apiService from './Api';

export const fetchColis = () => {
  return apiService.get('/colis').then(response => response.data).catch(() => []);
};