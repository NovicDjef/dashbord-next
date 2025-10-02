import { apiClient } from '../apiClient';

export interface AppConfig {
  id: number;
  key: string;
  value: string;
  type: 'STRING' | 'NUMBER' | 'BOOLEAN' | 'JSON';
  category: 'GENERAL' | 'CLIENT' | 'LIVREUR' | 'PAYMENT' | 'NOTIFICATIONS';
  description?: string;
  updatedAt: string;
}

export interface CommissionConfig {
  id: number;
  serviceType: 'REPAS' | 'COLIS' | 'GAZ';
  commissionRate: number; // Pourcentage
  fixedAmount?: number; // Montant fixe optionnel
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TarifConfig {
  id: number;
  serviceType: 'REPAS' | 'COLIS' | 'GAZ';
  basePrice: number;
  pricePerKm?: number;
  pricePerKg?: number;
  minimumPrice: number;
  maximumPrice?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationConfig {
  id: number;
  type: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
  event: string;
  isEnabled: boolean;
  template?: string;
  recipients?: string[];
  createdAt: string;
  updatedAt: string;
}

export const configService = {
  /**
   * Récupérer toutes les configurations
   */
  async getAll(category?: string): Promise<AppConfig[]> {
    return await apiClient.get<AppConfig[]>('/config', {
      params: { category },
    });
  },

  /**
   * Récupérer une configuration par clé
   */
  async getByKey(key: string): Promise<AppConfig> {
    return await apiClient.get<AppConfig>(`/config/${key}`);
  },

  /**
   * Mettre à jour une configuration
   */
  async update(key: string, value: any): Promise<AppConfig> {
    return await apiClient.put<AppConfig>(`/config/${key}`, { value });
  },

  /**
   * Mettre à jour plusieurs configurations
   */
  async updateBulk(configs: Array<{ key: string; value: any }>): Promise<{
    success: boolean;
    updated: number;
  }> {
    return await apiClient.post('/config/bulk', { configs });
  },

  // === COMMISSIONS ===

  /**
   * Récupérer les configurations de commission
   */
  async getCommissions(): Promise<CommissionConfig[]> {
    return await apiClient.get<CommissionConfig[]>('/config/commissions');
  },

  /**
   * Mettre à jour une commission
   */
  async updateCommission(
    id: number,
    data: Partial<CommissionConfig>
  ): Promise<CommissionConfig> {
    return await apiClient.put<CommissionConfig>(`/config/commissions/${id}`, data);
  },

  /**
   * Créer une nouvelle commission
   */
  async createCommission(data: Partial<CommissionConfig>): Promise<CommissionConfig> {
    return await apiClient.post<CommissionConfig>('/config/commissions', data);
  },

  // === TARIFS ===

  /**
   * Récupérer les tarifs
   */
  async getTarifs(): Promise<TarifConfig[]> {
    return await apiClient.get<TarifConfig[]>('/config/tarifs');
  },

  /**
   * Mettre à jour un tarif
   */
  async updateTarif(id: number, data: Partial<TarifConfig>): Promise<TarifConfig> {
    return await apiClient.put<TarifConfig>(`/config/tarifs/${id}`, data);
  },

  /**
   * Créer un nouveau tarif
   */
  async createTarif(data: Partial<TarifConfig>): Promise<TarifConfig> {
    return await apiClient.post<TarifConfig>('/config/tarifs', data);
  },

  // === NOTIFICATIONS ===

  /**
   * Récupérer les configurations de notifications
   */
  async getNotifications(): Promise<NotificationConfig[]> {
    return await apiClient.get<NotificationConfig[]>('/config/notifications');
  },

  /**
   * Mettre à jour une notification
   */
  async updateNotification(
    id: number,
    data: Partial<NotificationConfig>
  ): Promise<NotificationConfig> {
    return await apiClient.put<NotificationConfig>(
      `/config/notifications/${id}`,
      data
    );
  },

  /**
   * Activer/Désactiver une notification
   */
  async toggleNotification(
    id: number,
    isEnabled: boolean
  ): Promise<{ success: boolean }> {
    return await apiClient.patch(`/config/notifications/${id}/toggle`, { isEnabled });
  },

  // === CONFIGURATIONS SPÉCIFIQUES ===

  /**
   * Récupérer les paramètres de l'app client
   */
  async getClientSettings(): Promise<Record<string, any>> {
    return await apiClient.get('/config/client-settings');
  },

  /**
   * Mettre à jour les paramètres de l'app client
   */
  async updateClientSettings(settings: Record<string, any>): Promise<{
    success: boolean;
  }> {
    return await apiClient.put('/config/client-settings', settings);
  },

  /**
   * Récupérer les paramètres de l'app livreur
   */
  async getLivreurSettings(): Promise<Record<string, any>> {
    return await apiClient.get('/config/livreur-settings');
  },

  /**
   * Mettre à jour les paramètres de l'app livreur
   */
  async updateLivreurSettings(settings: Record<string, any>): Promise<{
    success: boolean;
  }> {
    return await apiClient.put('/config/livreur-settings', settings);
  },
};
