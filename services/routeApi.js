import apiService from "./Api";

// Helpers d'appel API réellement utilisés par les slices/écrans.
// Les chemins doivent exister dans Backend_foodtech/routes/*.js.

export const getchSomeMenu = () => {
    return apiService.get('/menus')
};

export const getchSomeRepas = () => {
    return apiService.get('/plats');
};

export const getchSomePriceCommande = () => {
    return apiService.get('/prixcommande')
};

export const getSomeGasOrdersAsync = () => {
    return apiService.get('/orders')
};

export const getLivreursAsync = () => {
    return apiService.get('/livreurs')
};

export const createLivreurAsync = (livreurData) => {
    return apiService.post('/livreur/signup', livreurData)
};

export const updateLivreurAsync = (livreurId, livreurData) => {
    return apiService.patch(`/livreur/${livreurId}`, livreurData)
};

export const getUsersAsync = () => {
    return apiService.get('/users')
};

export const createUserAsync = (userData) => {
    return apiService.post('/signup', userData)
};

export const updateUserAsync = (userId, userData) => {
    return apiService.patch(`/users/${userId}`, userData)
};

export const getSomeHoraireAsync = () => {
    return apiService.get('/heures')
};

export const createSomeRestaurantAsync = (restaurantData) => {
    return apiService.post('/restaurants', restaurantData)
};

export const adminSignInAsync = (email, password) => {
    return apiService.post('/admin/login', { email, password })
};

export const getHorairesByRestaurant = (restaurantId) => {
    return apiService.get(`/restaurants/${restaurantId}/heures`)
};

export const addHorairesBulk = (restaurantId, horaires) => {
    return apiService.post(`/restaurants/${restaurantId}/heures/bulk`, { horaires })
};

export const updateHoraire = (horaireId, horaireData) => {
    return apiService.put(`/heures/${horaireId}`, horaireData)
};

export const deleteHoraire = (horaireId) => {
    return apiService.delete(`/heures/${horaireId}`)
};

export const getchSomeComplements = () => {
    return apiService.get('/complements')
};

export const getchSomePriceColis = () => {
    return apiService.get('/prixcolis')
};

export const getchSomeNotification = () => {
    return apiService.get('/notifications')
};

export const getSomeCommande = () => {
    return apiService.get("/commandes")
};

export const getchSomeSlide = () => {
    return apiService.get("/slides")
};

export const calculSomeGainsLivreur = (gainData) => {
    return apiService.post(`/gains/calculer`, gainData)
};

export const getSomeDetailsLivraison = (livraisonId) => {
  return apiService.get(`/livraison/${livraisonId}`)
};

export const updateSomeCommandeLivred = (livraisonId, livreurId) => {
  return apiService.put('/commandes/delivered', {
    livraisonId: parseInt(livraisonId),
    livreurId: parseInt(livreurId)
  });
};

export const updateSomeLivreurLocation = (livreurId, latitude, longitude) => {
  return apiService.put('/livreur/location', {
    livreurId: parseInt(livreurId),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude)
  })
};

export const fetchSomeRegisterPushToken = (livreurId, pushToken) => {
  return apiService.post('/livreur/register-push-token', {
    livreurId: parseInt(livreurId),
    pushToken: pushToken
  })
};

export const getSomeHistoriqueLivraisons = (livreurId, period) => {
  return apiService.get(`/livraisons/historique/${livreurId}?period=${period}`)
};

export const getSomeActiveLivraisons = (livreurId) => {
  return apiService.get(`/livraisons/active/${livreurId}`)
};

export const getSomeStatsLivreur = (livreurId) => {
  return apiService.get(`/livreur/${livreurId}/stats`)
};

export const addSomeCommande = (commandeData) => {
    return apiService.post("/commandes", {commandeData: commandeData})
};

export const updateSomeUser = async (userId, data) => {
  if (!userId || !data) throw new Error("userId et data sont requis");
  
  const pushToken = typeof data === 'string' ? data : data.pushToken;
  
  if (!pushToken) throw new Error("pushToken est requis");
  
  
  return apiService.patch(`/user/${userId}/push-token`, { pushToken });
};

export const updateSomeUserInfo = async (userId, userData) => {
  if (!userId || !userData) throw new Error("userId et userData sont requis");
  
  
  return apiService.patch(`/users/${userId}`, userData);
};

export const updateSomeGazSatus = (id, status, livreurId) => {
  return apiService.patch(`/orders/${id}`, { 
    status, 
    livreurId: parseInt(livreurId) // ✅ Conversion explicite
  });
};
