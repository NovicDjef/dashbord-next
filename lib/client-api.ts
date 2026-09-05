// Client HTTP de l'espace « Commander » (site public, compte client).
// Distinct du client admin : il n'utilise que le jeton client (`userToken`), comme l'application mobile Koursier.
import axios from 'axios';
import { BASE_URL } from '@/services/urlApp';

export const USER_TOKEN_KEY = 'userToken';
export const USER_DATA_KEY = 'userData';

export const clientApi = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

clientApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(USER_TOKEN_KEY);
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** Message d'erreur lisible renvoyé par l'API (userMessage > message > repli). */
export const apiError = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { userMessage?: string; message?: string; errors?: string[] } }; message?: string };
  const d = e?.response?.data;
  if (d?.userMessage) return d.userMessage;
  if (d?.errors?.length) return d.errors.join(' · ');
  if (d?.message) return d.message;
  return fallback;
};

/** URL absolue d'une image servie par l'API (nom de fichier, chemin images/… ou URL complète). */
export const imageUrl = (path?: string | null) => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/')) return `${BASE_URL}${path}`;
  if (path.startsWith('images/')) return `${BASE_URL}/${path}`;
  return `${BASE_URL}/images/${path}`;
};

/* ------------------------------------------------------------------ */
/* Types (alignés sur le schéma Prisma et les réponses du backend)     */
/* ------------------------------------------------------------------ */

export type ClientUser = { id: number; username: string; phone: string; avatar?: string | null; image?: string | null };

export type Horaire = { jour: string; heures: string };

export type CategorieLite = { id: number; name: string; image?: string | null; description?: string | null };

export type Complement = { id: number; name: string; price: number; restaurantId?: number };

export type RestaurantNearby = {
  id: number; name: string; phone?: string | null; adresse: string; image: string; description: string; ratings: number;
  latitude: number; longitude: number; delaiPreparationMin: number;
  ville?: { id: number; name: string } | null;
  categories: CategorieLite[];
  distanceKm: number; fraisLivraison: number; isOpen: boolean; horairesAujourdhui: string | null; horaires: Horaire[];
};

export type RestaurantFull = {
  id: number; name: string; phone?: string | null; adresse: string; image: string; description: string; ratings: number;
  latitude: number; longitude: number; delaiPreparationMin: number; validationStatus?: string;
  categories: CategorieLite[]; heuresOuverture: Horaire[]; complements: Complement[];
  ville?: { id: number; name: string } | null;
};

export type PlatNearby = {
  id: number; name: string; image: string; description?: string | null; prix: number; ratings: number; disponible: boolean;
  categorie: { id: number; name: string };
  restaurant: { id: number; name: string; image: string; adresse: string; latitude: number; longitude: number; delaiPreparationMin: number; isOpen: boolean };
  distanceKm: number; fraisLivraison: number;
};

export type Estimation = {
  success: boolean; fraisLivraison: number; distanceKm: number | null; distanceConnue: boolean;
  restaurant?: { id: number; name: string; delaiPreparationMin: number } | null; message?: string;
};

export type CommandeStatus =
  | 'EN_ATTENTE' | 'ACCEPTEE_RESTAURANT' | 'EN_PREPARATION' | 'PRETE' | 'VALIDER' | 'ASSIGNEE'
  | 'RECUPEREE' | 'EN_COURS' | 'LIVREE' | 'ANNULEE' | 'REFUSEE_RESTAURANT';

export type Commande = {
  id: number; orderNumber?: string; quantity: number; prix: number; deliveryPrice: number; recommandation?: string | null;
  position: string; clientLatitude?: number | null; clientLongitude?: number | null; distanceKm?: number | null; telephone: string;
  status: CommandeStatus; restaurantId?: number | null; userId?: number | null; platsId?: number | null; livreurId?: number | null;
  validationCode?: string | null; createdAt: string; updatedAt: string;
  acceptedAt?: string | null; readyAt?: string | null; assignedAt?: string | null; pickedUpAt?: string | null; deliveredAt?: string | null; cancelledAt?: string | null; cancelReason?: string | null;
  plat?: { id: number; name: string; image: string; prix: number; categorie?: { id: number; name: string; restaurantId: number } | null } | null;
  items?: { id: number; nom: string; prixUnitaire: number; quantity: number; complements?: { complementId: number; name: string; price: number; quantity: number }[] | null }[];
  complements?: { id: number; name: string; price: number; quantity: number }[];
  payment?: { id: number; amount: number; mode_payement: string; status: string; reference: string; authorization_url?: string | null } | null;
  livraison?: unknown[];
};

export type Tracking = {
  success: boolean;
  livraison: {
    id?: number; status: CommandeStatus;
    livreur?: { id: number; nom?: string; prenom?: string; username?: string; telephone?: string; photo?: string | null; positionActuelle?: { latitude: number; longitude: number; timestamp?: string } | null } | null;
    positionActuelle?: { latitude: number; longitude: number } | null;
    tempsEstime?: number | null;
    restaurant?: { name: string; latitude: number; longitude: number } | null;
  };
};

export type Colis = {
  id: number; orderNumber?: string; usernameSend: string; usernamRecive: string; phoneRecive: string | number; description: string;
  poids?: number | null; distance?: number | null; prix: number; deliveryPrice: number; imageColis?: string | null;
  adresseDepart: string; adresseArrivee: string; status: 'EN_ATTENTE' | 'VALIDER' | 'ASSIGNEE' | 'EN_COURS' | 'LIVREE' | 'ANNULEE';
  validationCode?: string | null; createdAt: string;
};

/* ------------------------------------------------------------------ */
/* Appels                                                              */
/* ------------------------------------------------------------------ */

export const api = {
  // Compte client
  login: (phone: string, password: string) => clientApi.post<{ user: ClientUser; token: string }>('/login', { phone, password }).then((r) => r.data),
  signup: (username: string, phone: string, password: string) => clientApi.post<{ user: ClientUser; token: string }>('/signup', { username, phone, password }).then((r) => r.data),
  verify: () => clientApi.post<{ success: boolean; user: ClientUser }>('/verify').then((r) => r.data),

  // Découverte
  restaurantsNearby: (p: { lat: number; lng: number; radius?: number; q?: string; limit?: number; openOnly?: boolean }) =>
    clientApi.get<{ restaurants: RestaurantNearby[]; total: number }>('/restaurants/nearby', { params: { lat: p.lat, lng: p.lng, radius: p.radius ?? 15, q: p.q || undefined, limit: p.limit ?? 60, openOnly: p.openOnly ? 'true' : undefined } }).then((r) => r.data),
  platsNearby: (p: { lat: number; lng: number; radius?: number; q?: string; limit?: number; restaurantId?: number; categorieId?: number }) =>
    clientApi.get<{ plats: PlatNearby[]; total: number }>('/plats/nearby', { params: { lat: p.lat, lng: p.lng, radius: p.radius ?? 15, q: p.q || undefined, limit: p.limit ?? 120, restaurantId: p.restaurantId, categorieId: p.categorieId } }).then((r) => r.data),
  restaurant: (id: number) => clientApi.get<RestaurantFull>(`/restaurants/${id}`).then((r) => r.data),
  platsByCategorie: (id: number) => clientApi.get<PlatNearby[]>(`/categories/${id}/plats`).then((r) => r.data),

  // Tarification et commande
  estimation: (body: { restaurantId?: number; platsId?: number; clientLatitude?: number; clientLongitude?: number; type?: 'REPAS' | 'COLIS' | 'GAZ'; distanceKm?: number }) =>
    clientApi.post<Estimation>('/tarifs/estimation', body).then((r) => r.data),
  createCommande: (body: {
    items: { platsId: number; quantity: number; complements: { complementId: number; quantity: number }[] }[];
    position: string; telephone: string; clientLatitude?: number; clientLongitude?: number; recommandation?: string;
    modePaiement?: 'A_LA_LIVRAISON' | 'MOBILE_MONEY' | 'CARTE_BANCAIRE';
  }) => clientApi.post<{ commande: Commande; tarification?: { sousTotal: number; fraisLivraison: number; total: number } }>('/commandes', body).then((r) => r.data),
  initierPaiement: (id: number, service: 'MTN' | 'ORANGE', phone: string) =>
    clientApi.post<{ success: boolean; authorization_url?: string | null; reference?: string; message?: string }>(`/commandes/${id}/paiement/initier`, { service, phone }).then((r) => r.data),
  paiementStatut: (id: number) => clientApi.get<{ montant: number; mode: string; status: string; payee: boolean }>(`/commandes/${id}/paiement`).then((r) => r.data),

  // Suivi
  mesCommandes: (userId: number) => clientApi.get<Commande[]>(`/users/${userId}/commandes`).then((r) => r.data),
  commande: (id: number) => clientApi.get<Commande>(`/commandes/${id}`).then((r) => r.data),
  tracking: (id: number) => clientApi.get<Tracking>(`/tracking/${id}`).then((r) => r.data),
  validationCode: (id: number) => clientApi.get<{ validationCode?: string; code?: string }>(`/commandes/${id}/validation-code`).then((r) => r.data),
  annuler: (id: number, raison: string) => clientApi.patch(`/commande/${id}`, { status: 'ANNULEE', raison }).then((r) => r.data),

  // Avis après livraison (restaurant et livreur, notes de 1 à 5)
  avis: (id: number) => clientApi.get<{ success: boolean; restaurant?: { overallRating: number; comment?: string | null } | null; livreur?: { overallRating: number; comment?: string | null } | null }>(`/commandes/${id}/avis`).then((r) => r.data),
  noter: (id: number, body: { noteRestaurant?: number; noteLivreur?: number; commentaireRestaurant?: string; commentaireLivreur?: string; recommande?: boolean }) =>
    clientApi.post<{ success: boolean; message: string }>(`/commandes/${id}/avis`, body).then((r) => r.data),

  // Profil
  resetPassword: (phone: string, newPassword: string) => clientApi.post<{ user: ClientUser; token: string }>('/resetPassword', { phone, newPassword }).then((r) => r.data),
  updateProfile: (userId: number, form: FormData) => clientApi.patch<{ user: ClientUser & { image?: string | null } }>(`/users/${userId}`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),

  // Accueil
  slides: () => clientApi.get<{ id: number; name: string; image: string }[]>('/slides').then((r) => r.data).catch(() => [] as { id: number; name: string; image: string }[]),
  menusRapides: () => clientApi.get<{ id: number; name: string; image: string; description?: string | null; prix: number }[]>('/menusrapides').then((r) => r.data).catch(() => []),

  // Colis
  prixColis: () => clientApi.get<{ id: number; montant: number; description?: string; status?: number | boolean }[]>('/prixcolis').then((r) => r.data),
  createColis: (form: FormData) => clientApi.post<{ colis: Colis }>('/colis', form, { headers: { 'Content-Type': 'multipart/form-data' } }).then((r) => r.data),
  mesColis: (userId: number) => clientApi.get<Colis[]>(`/users/${userId}/colis`).then((r) => r.data),
  colis: (id: number) => clientApi.get<Colis & { livraison?: unknown[] }>(`/colis/${id}`).then((r) => r.data),
};
