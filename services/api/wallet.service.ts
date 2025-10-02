import { apiClient } from '../apiClient';

export type TransactionType = 'CREDIT' | 'DEBIT' | 'COMMISSION' | 'RETRAIT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
export type ServiceType = 'REPAS' | 'COLIS' | 'GAZ';

export interface Transaction {
  id: number;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  serviceType: ServiceType;
  description: string;
  reference: string;
  userId?: number;
  livreurId?: number;
  commandeId?: number;
  colisId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface WalletBalance {
  total: number;
  available: number;
  pending: number;
  withdrawn: number;
}

export interface WalletStats {
  totalEarnings: number;
  monthlyEarnings: number;
  weeklyEarnings: number;
  todayEarnings: number;
  totalTransactions: number;
  earningsByService: {
    REPAS: number;
    COLIS: number;
    GAZ: number;
  };
  commissions: {
    total: number;
    repas: number;
    colis: number;
    gaz: number;
  };
}

export interface TransactionFilters {
  type?: TransactionType;
  status?: TransactionStatus;
  serviceType?: ServiceType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  totalPages: number;
}

export interface WithdrawalRequest {
  amount: number;
  method: 'MOBILE_MONEY' | 'BANK_TRANSFER';
  accountDetails: {
    phone?: string;
    accountNumber?: string;
    bankName?: string;
  };
}

export const walletService = {
  /**
   * Récupérer le solde du wallet admin
   */
  async getAdminBalance(): Promise<WalletBalance> {
    return await apiClient.get<WalletBalance>('/wallet/admin/balance');
  },

  /**
   * Récupérer les statistiques du wallet admin
   */
  async getAdminStats(): Promise<WalletStats> {
    return await apiClient.get<WalletStats>('/wallet/admin/stats');
  },

  /**
   * Récupérer les transactions du wallet admin
   */
  async getAdminTransactions(
    filters?: TransactionFilters
  ): Promise<TransactionsResponse> {
    return await apiClient.get<TransactionsResponse>('/wallet/admin/transactions', {
      params: filters,
    });
  },

  /**
   * Récupérer le solde du wallet d'un livreur
   */
  async getLivreurBalance(livreurId: number): Promise<WalletBalance> {
    return await apiClient.get<WalletBalance>(`/wallet/livreur/${livreurId}/balance`);
  },

  /**
   * Récupérer les statistiques du wallet d'un livreur
   */
  async getLivreurStats(livreurId: number): Promise<WalletStats> {
    return await apiClient.get<WalletStats>(`/wallet/livreur/${livreurId}/stats`);
  },

  /**
   * Récupérer les transactions du wallet d'un livreur
   */
  async getLivreurTransactions(
    livreurId: number,
    filters?: TransactionFilters
  ): Promise<TransactionsResponse> {
    return await apiClient.get<TransactionsResponse>(
      `/wallet/livreur/${livreurId}/transactions`,
      { params: filters }
    );
  },

  /**
   * Créer une demande de retrait pour un livreur
   */
  async createWithdrawal(
    livreurId: number,
    data: WithdrawalRequest
  ): Promise<{
    success: boolean;
    withdrawalId: number;
    message: string;
  }> {
    return await apiClient.post(`/wallet/livreur/${livreurId}/withdraw`, data);
  },

  /**
   * Récupérer les demandes de retrait
   */
  async getWithdrawals(filters?: {
    status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
    livreurId?: number;
    page?: number;
    limit?: number;
  }): Promise<any> {
    return await apiClient.get('/wallet/withdrawals', { params: filters });
  },

  /**
   * Approuver une demande de retrait
   */
  async approveWithdrawal(
    withdrawalId: number
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/wallet/withdrawals/${withdrawalId}/approve`);
  },

  /**
   * Rejeter une demande de retrait
   */
  async rejectWithdrawal(
    withdrawalId: number,
    reason: string
  ): Promise<{ success: boolean; message: string }> {
    return await apiClient.post(`/wallet/withdrawals/${withdrawalId}/reject`, {
      reason,
    });
  },

  /**
   * Exporter les transactions en CSV
   */
  async exportTransactions(filters?: TransactionFilters): Promise<Blob> {
    const response = await apiClient.getClient().get('/wallet/export', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  /**
   * Récupérer l'historique des commissions
   */
  async getCommissionsHistory(filters?: {
    serviceType?: ServiceType;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<any> {
    return await apiClient.get('/wallet/commissions', { params: filters });
  },
};
