import { apiClient } from '../apiClient';

export type CommandeStatus =
  | 'EN_ATTENTE'
  | 'VALIDER'
  | 'EN_COURS'
  | 'PAYEE'
  | 'LIVREE'
  | 'ANNULEE';

export interface Commande {
  id: number;
  quantity: number;
  prix: number;
  recommandation?: string;
  position: string;
  telephone: number;
  status: CommandeStatus;
  userId?: number;
  platsId?: number;
  livraisonId?: number;
  createdAt: string;
  updatedAt: string;
  user?: any;
  plat?: any;
  livraison?: any;
  payment?: any;
}

export interface CommandeFilters {
  status?: CommandeStatus;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface CommandesResponse {
  commandes: Commande[];
  total: number;
  page: number;
  totalPages: number;
}

export const commandesService = {
  /**
   * Récupérer toutes les commandes
   */
  async getAll(filters?: CommandeFilters): Promise<CommandesResponse> {
    return await apiClient.get<CommandesResponse>('/commande', { params: filters });
  },

  /**
   * Récupérer une commande par ID
   */
  async getById(id: number): Promise<Commande> {
    return await apiClient.get<Commande>(`/commande/${id}`);
  },

  /**
   * Créer une commande
   */
  async create(data: Partial<Commande>): Promise<Commande> {
    return await apiClient.post<Commande>('/commande', data);
  },

  /**
   * Mettre à jour une commande
   */
  async update(id: number, data: Partial<Commande>): Promise<Commande> {
    return await apiClient.put<Commande>(`/commande/${id}`, data);
  },

  /**
   * Mettre à jour le statut d'une commande
   */
  async updateStatus(
    id: number,
    status: CommandeStatus
  ): Promise<{ success: boolean; commande: Commande }> {
    return await apiClient.patch<{ success: boolean; commande: Commande }>(
      `/commande/${id}/status`,
      { status }
    );
  },

  /**
   * Annuler une commande
   */
  async cancel(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/commande/${id}/cancel`);
  },

  /**
   * Assigner un livreur à une commande
   */
  async assignLivreur(
    commandeId: number,
    livreurId: number
  ): Promise<{ success: boolean; commande: Commande }> {
    return await apiClient.post<{ success: boolean; commande: Commande }>(
      `/commande/${commandeId}/assign`,
      { livreurId }
    );
  },

  /**
   * Statistiques des commandes
   */
  async getStats(period?: 'day' | 'week' | 'month' | 'year'): Promise<{
    total: number;
    enAttente: number;
    enCours: number;
    livrees: number;
    annulees: number;
    revenue: number;
  }> {
    return await apiClient.get('/commande/stats', { params: { period } });
  },
};
