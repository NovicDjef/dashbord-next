// Services temporaires pour maintenir la compatibilité
import apiService from './Api';

export const fetchMenu = () => {
  return apiService.get('/menus').then(response => response.data).catch(() => []);
};