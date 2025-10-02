import { apiClient } from '../apiClient';

export interface Livreur {
  id: number;
  username: string;
  phone: string;
  email?: string;
  image?: string;
  status: 'DISPONIBLE' | 'OCCUPE' | 'OFFLINE';
  ratings: number;
  totalLivraisons: number;
  createdAt: string;
  updatedAt: string;
  geolocalisation?: {
    latitude: number;
    longitude: number;
  };
}

export interface LivreurFilters {
  status?: 'DISPONIBLE' | 'OCCUPE' | 'OFFLINE';
  search?: string;
  page?: number;
  limit?: number;
}

export interface LiveursResponse {
  livreurs: Livreur[];
  total: number;
  page: number;
  totalPages: number;
}

export interface LivreurStats {
  totalLivraisons: number;
  enCours: number;
  completees: number;
  annulees: number;
  earnings: number;
  ratings: number;
}

export const livreursService = {
  /**
   * Récupérer tous les livreurs
   */
  async getAll(filters?: LivreurFilters): Promise<LiveursResponse> {
    return await apiClient.get<LiveursResponse>('/livreurs', { params: filters });
  },

  /**
   * Récupérer un livreur par ID
   */
  async getById(id: number): Promise<Livreur> {
    return await apiClient.get<Livreur>(`/livreurs/${id}`);
  },

  /**
   * Créer un livreur
   */
  async create(data: Partial<Livreur>): Promise<Livreur> {
    return await apiClient.post<Livreur>('/livreurs', data);
  },

  /**
   * Mettre à jour un livreur
   */
  async update(id: number, data: Partial<Livreur>): Promise<Livreur> {
    return await apiClient.put<Livreur>(`/livreurs/${id}`, data);
  },

  /**
   * Supprimer un livreur
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/livreurs/${id}`);
  },

  /**
   * Mettre à jour le statut d'un livreur
   */
  async updateStatus(
    id: number,
    status: 'DISPONIBLE' | 'OCCUPE' | 'OFFLINE'
  ): Promise<Livreur> {
    return await apiClient.patch<Livreur>(`/livreurs/${id}/status`, { status });
  },

  /**
   * Mettre à jour la position d'un livreur
   */
  async updateLocation(
    id: number,
    location: { latitude: number; longitude: number }
  ): Promise<{ success: boolean }> {
    return await apiClient.post(`/livreurs/${id}/location`, location);
  },

  /**
   * Récupérer les statistiques d'un livreur
   */
  async getStats(id: number): Promise<LivreurStats> {
    return await apiClient.get<LivreurStats>(`/livreurs/${id}/stats`);
  },

  /**
   * Récupérer l'historique des livraisons d'un livreur
   */
  async getHistory(
    id: number,
    filters?: {
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    return await apiClient.get(`/livreurs/${id}/history`, { params: filters });
  },

  /**
   * Trouver les livreurs disponibles à proximité
   */
  async findNearby(location: {
    latitude: number;
    longitude: number;
    radius?: number;
  }): Promise<Livreur[]> {
    return await apiClient.post<Livreur[]>('/livreurs/nearby', location);
  },
};
