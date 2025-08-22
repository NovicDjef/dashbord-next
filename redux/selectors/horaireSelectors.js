// Sélecteurs pour les horaires
export const selectHorairesByRestaurant = (restaurantId) => (state) => {
  return state.horaires.byRestaurant[restaurantId] || [];
};

export const selectHorairesStatus = (state) => state.horaires.status;

export const selectRestaurantHorairesStatus = (restaurantId) => (state) => {
  return state.horaires.restaurantStatus[restaurantId] || 'idle';
};

export const selectHorairesError = (state) => state.horaires.error;

// Sélecteur pour vérifier si un restaurant a des horaires
export const selectHasHoraires = (restaurantId) => (state) => {
  const horaires = state.horaires.byRestaurant[restaurantId];
  return horaires && horaires.length > 0;
};