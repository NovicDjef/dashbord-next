// Services temporaires pour maintenir la compatibilité
import apiService from './Api';

export const fetchCommande = () => {
  return apiService.get('/commandes').then(response => response.data).catch(() => []);
};