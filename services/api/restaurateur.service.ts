// Appels API de l'espace restaurateur et des écrans admin associés (phase 2).
import { apiClient } from '../apiClient';
import type { OrderStatus } from '@/lib/order-status';

export type ValidationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Restaurant {
  id: number; name: string; phone?: string | null; adresse: string; description?: string; image?: string | null;
  ratings?: number; latitude: number; longitude: number; villeId?: number | null;
  validationStatus: ValidationStatus; rejectionReason?: string | null; delaiPreparationMin: number; createdAt?: string;
  enPause?: boolean; pauseMessage?: string | null; delaiFermetureCommandeMin?: number;
  heuresOuverture?: Horaire[];
  disponibilite?: Disponibilite;
  /** Rôle du compte connecté sur ce restaurant */
  monRole?: RestaurantRole;
  ville?: { id: number; name: string } | null;
  admin?: { id: number; username: string; email: string; phone?: string };
  _count?: { categories: number; commandes: number };
}

export type RestaurantRole = 'PROPRIETAIRE' | 'GERANT' | 'CAISSE';
export const ROLE_LABEL: Record<RestaurantRole, string> = { PROPRIETAIRE: 'Propriétaire', GERANT: 'Gérant', CAISSE: 'Caisse' };
export interface Membre { membreId?: number; id: number; username: string; email: string; phone?: string; role: 'GERANT' | 'CAISSE'; createdAt?: string }

/** État de commande d'un restaurant (services/availability.js côté backend). */
export interface Disponibilite {
  isOpen: boolean; enPause: boolean; acceptsOrders: boolean;
  reason: null | 'NON_VALIDE' | 'PAUSE' | 'FERME' | 'FERMETURE_PROCHE';
  message: string | null; closesAt: string | null; opensAt: string | null; ordersUntil: string | null;
  minutesUntilClose: number | null; minutesUntilOrdersClose: number | null; delaiFermetureCommandeMin: number; horairesAujourdhui: string | null;
  closesAtHM?: string | null; opensAtHM?: string | null; ordersUntilHM?: string | null;
}

export interface Categorie { id: number; name: string; image?: string | null; description?: string | null; restaurantId: number; visible?: boolean }
export interface Plat { id: number; name: string; image?: string | null; description?: string | null; prix: number; disponible: boolean; stock?: number | null; categorieId: number | null; categorie?: Categorie | null }
export interface Complement { id: number; name: string; price: number; restaurantId: number; stock?: number | null; disponible?: boolean }
export interface Horaire { id?: number; jour: string; heures: string }

export interface CommandeItem { id: number; nom: string; prixUnitaire: number; quantity: number; complements?: { name: string; price: number; quantity: number }[] | null }
export interface Commande {
  id: number; orderNumber: string; status: OrderStatus; prix: number; deliveryPrice: number; distanceKm?: number | null;
  position: string; telephone: string; recommandation?: string | null; createdAt: string; updatedAt: string;
  cancelReason?: string | null; validationCode?: string | null; deliveredAt?: string | null; cancelledAt?: string | null; arrivedAtRestaurantAt?: string | null;
  user?: { id: number; username: string; phone: string } | null;
  items?: CommandeItem[];
  livreur?: { id: number; username: string; prenom: string; telephone: string; typeVehicule: string } | null;
  payment?: { status: string; mode_payement: string; amount: number } | null;
}

export interface RestaurantStats {
  periode: { from: string; to: string };
  total: number;
  livrees: { count: number; ca: number; panierMoyen: number };
  refusees: number; annulees: number; enCours: number; tauxAcceptation: number | null;
  parJour: { jour: string; commandes: number; ca: number }[];
  topPlats: { platsId: number | null; nom: string; quantite: number; ca: number }[];
}

export interface TarifConfig {
  id?: number; typeLivraison: 'REPAS' | 'COLIS' | 'GAZ'; prixBase: number; franchiseKm: number; prixParKm: number;
  multiplicateurWeekend: number; multiplicateurNuit: number; actif: boolean;
}

const multipart = (data: Record<string, any>, file?: File | null, fileField = 'image') => {
  const fd = new FormData();
  Object.entries(data).forEach(([k, v]) => { if (v !== undefined && v !== null) fd.append(k, String(v)); });
  if (file) fd.append(fileField, file);
  return fd;
};
const mp = { headers: { 'Content-Type': 'multipart/form-data' } };

export const restaurateurService = {
  // --- Compte
  signup: (payload: { username: string; email: string; phone: string; password: string; restaurant: Record<string, any> }, image?: File | null) => {
    if (!image) return apiClient.post('/restaurateur/signup', payload);
    const flat: Record<string, any> = { username: payload.username, email: payload.email, phone: payload.phone, password: payload.password };
    Object.entries(payload.restaurant).forEach(([k, v]) => { flat[`restaurant[${k}]`] = v; });
    return apiClient.post('/restaurateur/signup', multipart(flat, image), mp);
  },
  me: () => apiClient.get<{ admin: any; restaurants: Restaurant[] }>('/restaurateur/me'),
  /** Mot de passe oublié (restaurateur ou admin) : code à 6 chiffres envoyé par email, valable 15 min */
  forgotPassword: (email: string) => apiClient.post<{ success: boolean; message: string; devCode?: string }>('/admin/password/forgot', { email }),
  resetPassword: (email: string, code: string, newPassword: string) => apiClient.post<{ success: boolean; message: string }>('/admin/password/reset', { email, code, newPassword }),

  // --- Commandes du restaurant
  commandes: (params: { status?: string; since?: string; from?: string; to?: string; q?: string; restaurantId?: number; limit?: number; offset?: number } = {}) =>
    apiClient.get<{ commandes: Commande[]; total: number; offset: number; limit: number; enAttente: number; serverTime: string }>('/restaurateur/commandes', { params }),
  // --- Équipe du restaurant
  equipe: (restaurantId: number) => apiClient.get<{ proprietaire: { id: number; username: string; email: string; phone?: string } | null; membres: Membre[] }>('/restaurateur/equipe', { params: { restaurantId } }),
  ajouterMembre: (restaurantId: number, data: { username: string; email: string; phone: string; password: string; role: 'GERANT' | 'CAISSE' }) => apiClient.post<{ membre: Membre; compteExistant: boolean; message: string }>('/restaurateur/equipe', { ...data, restaurantId }),
  modifierMembre: (restaurantId: number, adminId: number, role: 'GERANT' | 'CAISSE') => apiClient.patch(`/restaurateur/equipe/${adminId}`, { role, restaurantId }),
  retirerMembre: (restaurantId: number, adminId: number) => apiClient.delete(`/restaurateur/equipe/${adminId}`, { params: { restaurantId } }),
  /** Chiffre d'affaires et volumes sur une période (30 derniers jours par défaut) */
  stats: (params: { from?: string; to?: string; restaurantId?: number } = {}) => apiClient.get<RestaurantStats>('/restaurateur/stats', { params }),
  accepter: (id: number) => apiClient.post(`/restaurateur/commandes/${id}/accepter`),
  preparer: (id: number) => apiClient.post(`/restaurateur/commandes/${id}/preparer`),
  prete: (id: number) => apiClient.post(`/restaurateur/commandes/${id}/prete`),
  refuser: (id: number, raison: string) => apiClient.post(`/restaurateur/commandes/${id}/refuser`, { raison }),

  // --- Restaurant
  getRestaurant: (id: number) => apiClient.get<Restaurant>(`/restaurants/${id}`),
  updateRestaurant: (id: number, data: Record<string, any>, image?: File | null) =>
    image ? apiClient.put(`/restaurants/${id}`, multipart(data, image), mp) : apiClient.put(`/restaurants/${id}`, data),
  /** Pause / reprise des commandes */
  setPause: (id: number, enPause: boolean, message?: string) => apiClient.patch<{ restaurant: Restaurant; disponibilite: Disponibilite }>(`/restaurants/${id}/pause`, { enPause, message }),
  /** État de commande public (compte à rebours) */
  disponibilite: (id: number) => apiClient.get<{ serverTime: string; disponibilite: Disponibilite }>(`/restaurants/${id}/disponibilite`),
  horaires: (restaurantId: number) => apiClient.get<Horaire[]>(`/restaurants/${restaurantId}/heures`),
  saveHoraires: (restaurantId: number, horaires: Horaire[]) => apiClient.post(`/restaurants/${restaurantId}/heures/bulk`, { horaires }),

  // --- Menu
  categories: () => apiClient.get<Categorie[]>('/categories'),
  createCategorie: (data: { name: string; description?: string; restaurantId: number }, image?: File | null) =>
    apiClient.post('/categories', multipart(data, image), mp),
  updateCategorie: (id: number, data: { name?: string; description?: string }, image?: File | null) =>
    image ? apiClient.put(`/categories/${id}`, multipart(data, image), mp) : apiClient.put(`/categories/${id}`, data),
  deleteCategorie: (id: number) => apiClient.delete(`/categories/${id}`),
  /** Masquer / réafficher toute une catégorie côté client */
  setCategorieVisible: (id: number, visible: boolean) => apiClient.patch<{ categorie: Categorie }>(`/categories/${id}/visibilite`, { visible }),
  plats: () => apiClient.get<Plat[]>('/plats'),
  createPlat: (data: { name: string; prix: number; description?: string; categorieId: number; disponible?: boolean }, image?: File | null) =>
    apiClient.post('/plats', multipart(data, image), mp),
  updatePlat: (id: number, data: Record<string, any>, image?: File | null) =>
    image ? apiClient.put(`/plats/${id}`, multipart(data, image), mp) : apiClient.put(`/plats/${id}`, data),
  setPlatDisponible: (id: number, disponible: boolean) => apiClient.patch(`/plats/${id}/disponibilite`, { disponible }),
  deletePlat: (id: number) => apiClient.delete(`/plats/${id}`),
  complements: () => apiClient.get<Complement[]>('/complements'),
  createComplement: (data: { name: string; price: number; restaurantId: number; stock?: number | string | null; disponible?: boolean }) => apiClient.post('/complements', data),
  updateComplement: (id: number, data: { name?: string; price?: number; stock?: number | string | null; disponible?: boolean }) => apiClient.put(`/complements/${id}`, data),
  deleteComplement: (id: number) => apiClient.delete(`/complements/${id}`),

  // --- Référentiels
  villes: () => apiClient.get<any>('/villes'),
};

export const adminValidationService = {
  list: (status?: ValidationStatus) =>
    apiClient.get<{ restaurants: Restaurant[]; counts: Partial<Record<ValidationStatus, number>> }>('/admin/restaurants', { params: status ? { status } : {} }),
  setValidation: (id: number, status: ValidationStatus, reason?: string) =>
    apiClient.patch(`/admin/restaurants/${id}/validation`, { status, reason }),
};

export const tarifService = {
  config: () => apiClient.get<{ tarifs: TarifConfig[] }>('/tarifs/config'),
  save: (type: string, data: Partial<TarifConfig>) => apiClient.put(`/tarifs/config/${type}`, data),
  estimation: (body: { distanceKm?: number; restaurantId?: number; clientLatitude?: number; clientLongitude?: number; type?: string }) =>
    apiClient.post<{ fraisLivraison: number; distanceKm: number | null; distanceConnue: boolean; detail: any }>('/tarifs/estimation', body),
};

/** Message d'erreur lisible depuis une erreur axios. */
export const apiErrorMessage = (e: any, fallback = 'Une erreur est survenue') => {
  const d = e?.response?.data;
  if (d?.errors?.length) return d.errors.join(' · ');
  return d?.userMessage || d?.message || e?.message || fallback;
};
