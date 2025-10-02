import { apiClient } from '../apiClient';

export type ColisStatus =
  | 'EN_ATTENTE'
  | 'VALIDER'
  | 'EN_COURS'
  | 'PAYEE'
  | 'LIVREE'
  | 'ANNULEE';

export interface Colis {
  id: number;
  usernameSend: string;
  usernamRecive: string;
  phoneRecive: number;
  description: string;
  poids?: number;
  prix: number;
  imageColis?: string;
  adresseDepart: string;
  adresseArrivee: string;
  status: ColisStatus;
  userId: number;
  livraisonId?: number;
  createdAt: string;
  updatedAt: string;
  user?: any;
  livraison?: any;
}

export interface ColisFilters {
  status?: ColisStatus;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ColisResponse {
  colis: Colis[];
  total: number;
  page: number;
  totalPages: number;
}

export const colisService = {
  /**
   * Récupérer tous les colis
   */
  async getAll(filters?: ColisFilters): Promise<ColisResponse> {
    return await apiClient.get<ColisResponse>('/colis', { params: filters });
  },

  /**
   * Récupérer un colis par ID
   */
  async getById(id: number): Promise<Colis> {
    return await apiClient.get<Colis>(`/colis/${id}`);
  },

  /**
   * Créer un colis
   */
  async create(data: Partial<Colis>): Promise<Colis> {
    return await apiClient.post<Colis>('/colis', data);
  },

  /**
   * Mettre à jour un colis
   */
  async update(id: number, data: Partial<Colis>): Promise<Colis> {
    return await apiClient.put<Colis>(`/colis/${id}`, data);
  },

  /**
   * Mettre à jour le statut d'un colis
   */
  async updateStatus(
    id: number,
    status: ColisStatus
  ): Promise<{ success: boolean; colis: Colis }> {
    return await apiClient.patch<{ success: boolean; colis: Colis }>(
      `/colis/${id}/status`,
      { status }
    );
  },

  /**
   * Annuler un colis
   */
  async cancel(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/colis/${id}/cancel`);
  },

  /**
   * Assigner un livreur à un colis
   */
  async assignLivreur(
    colisId: number,
    livreurId: number
  ): Promise<{ success: boolean; colis: Colis }> {
    return await apiClient.post<{ success: boolean; colis: Colis }>(
      `/colis/${colisId}/assign`,
      { livreurId }
    );
  },

  /**
   * Calculer le prix d'un colis
   */
  async calculatePrice(data: {
    poids: number;
    distance: number;
  }): Promise<{ prix: number }> {
    return await apiClient.post('/colis/calculate-price', data);
  },

  /**
   * Statistiques des colis
   */
  async getStats(period?: 'day' | 'week' | 'month' | 'year'): Promise<{
    total: number;
    enAttente: number;
    enCours: number;
    livres: number;
    annules: number;
    revenue: number;
  }> {
    return await apiClient.get('/colis/stats', { params: { period } });
  },
};
