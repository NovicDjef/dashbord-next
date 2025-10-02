import { apiClient } from '../apiClient';

export type StockMovementType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE';

export interface StockItem {
  id: number;
  name: string;
  sku: string;
  category: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unit: string;
  unitPrice: number;
  totalValue: number;
  restaurantId?: number;
  platsId?: number;
  lastRestockDate?: string;
  expirationDate?: string;
  supplier?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockMovement {
  id: number;
  stockItemId: number;
  type: StockMovementType;
  quantity: number;
  reason?: string;
  reference?: string;
  userId: number;
  createdAt: string;
  stockItem?: StockItem;
  user?: any;
}

export interface StockAlert {
  id: number;
  stockItemId: number;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON' | 'EXPIRED';
  message: string;
  isRead: boolean;
  createdAt: string;
  stockItem?: StockItem;
}

export interface StockFilters {
  category?: string;
  restaurantId?: number;
  lowStock?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface StockItemsResponse {
  items: StockItem[];
  total: number;
  page: number;
  totalPages: number;
  stats: {
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
  };
}

export const stockService = {
  /**
   * Récupérer tous les articles en stock
   */
  async getAll(filters?: StockFilters): Promise<StockItemsResponse> {
    return await apiClient.get<StockItemsResponse>('/stock', { params: filters });
  },

  /**
   * Récupérer un article par ID
   */
  async getById(id: number): Promise<StockItem> {
    return await apiClient.get<StockItem>(`/stock/${id}`);
  },

  /**
   * Créer un nouvel article
   */
  async create(data: Partial<StockItem>): Promise<StockItem> {
    return await apiClient.post<StockItem>('/stock', data);
  },

  /**
   * Mettre à jour un article
   */
  async update(id: number, data: Partial<StockItem>): Promise<StockItem> {
    return await apiClient.put<StockItem>(`/stock/${id}`, data);
  },

  /**
   * Supprimer un article
   */
  async delete(id: number): Promise<{ success: boolean; message: string }> {
    return await apiClient.delete(`/stock/${id}`);
  },

  /**
   * Ajouter du stock (entrée)
   */
  async addStock(
    id: number,
    data: {
      quantity: number;
      reason?: string;
      reference?: string;
    }
  ): Promise<{ success: boolean; stockItem: StockItem }> {
    return await apiClient.post(`/stock/${id}/add`, data);
  },

  /**
   * Retirer du stock (sortie)
   */
  async removeStock(
    id: number,
    data: {
      quantity: number;
      reason?: string;
      reference?: string;
    }
  ): Promise<{ success: boolean; stockItem: StockItem }> {
    return await apiClient.post(`/stock/${id}/remove`, data);
  },

  /**
   * Ajuster le stock (correction)
   */
  async adjustStock(
    id: number,
    data: {
      newQuantity: number;
      reason: string;
    }
  ): Promise<{ success: boolean; stockItem: StockItem }> {
    return await apiClient.post(`/stock/${id}/adjust`, data);
  },

  /**
   * Récupérer l'historique des mouvements de stock
   */
  async getMovements(
    itemId?: number,
    filters?: {
      type?: StockMovementType;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    movements: StockMovement[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const url = itemId ? `/stock/${itemId}/movements` : '/stock/movements';
    return await apiClient.get(url, { params: filters });
  },

  /**
   * Récupérer les alertes de stock
   */
  async getAlerts(filters?: {
    type?: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON' | 'EXPIRED';
    isRead?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{
    alerts: StockAlert[];
    total: number;
    unreadCount: number;
  }> {
    return await apiClient.get('/stock/alerts', { params: filters });
  },

  /**
   * Marquer une alerte comme lue
   */
  async markAlertAsRead(alertId: number): Promise<{ success: boolean }> {
    return await apiClient.patch(`/stock/alerts/${alertId}/read`);
  },

  /**
   * Marquer toutes les alertes comme lues
   */
  async markAllAlertsAsRead(): Promise<{ success: boolean; count: number }> {
    return await apiClient.post('/stock/alerts/read-all');
  },

  /**
   * Récupérer les statistiques du stock
   */
  async getStats(restaurantId?: number): Promise<{
    totalValue: number;
    totalItems: number;
    lowStockItems: number;
    outOfStockItems: number;
    expiringItems: number;
    categoryBreakdown: Array<{
      category: string;
      count: number;
      value: number;
    }>;
    recentMovements: StockMovement[];
  }> {
    return await apiClient.get('/stock/stats', {
      params: { restaurantId },
    });
  },

  /**
   * Prévisions de stock
   */
  async getForecast(
    itemId: number,
    days: number = 30
  ): Promise<{
    currentStock: number;
    averageDailyUsage: number;
    estimatedDaysLeft: number;
    suggestedRestockQuantity: number;
    suggestedRestockDate: string;
  }> {
    return await apiClient.get(`/stock/${itemId}/forecast`, {
      params: { days },
    });
  },

  /**
   * Exporter l'inventaire en CSV
   */
  async exportInventory(filters?: StockFilters): Promise<Blob> {
    const response = await apiClient.getClient().get('/stock/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
