import { useState, useEffect } from 'react';
import apiService from '@/services/Api';
import { DeliveryHistory, CommissionConfig } from './use-commissions';

export interface WalletTransaction {
  id: string;
  type: 'delivery_commission' | 'restaurant_commission';
  amount: number;
  date: string;
  description: string;
  source: {
    type: 'REPAS' | 'COLIS' | 'GAZ';
    orderId?: string;
    customerName?: string;
    restaurantName?: string;
  };
  status: 'completed' | 'pending';
}

export interface WalletStats {
  totalBalance: number;
  monthlyEarnings: number;
  deliveryCommissions: number;
  restaurantCommissions: number;
  totalTransactions: number;
  recentTransactions: WalletTransaction[];
  earningsByService: {
    REPAS: number;
    COLIS: number;
    GAZ: number;
  };
  monthlyGrowth: number;
}

export function useWallet() {
  const [walletData, setWalletData] = useState<WalletStats | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Récupérer les configurations de commission
      const commissionsResponse = await apiService.get('/commissions');
      let configs: CommissionConfig[] = [];
      if (commissionsResponse.data.success) {
        configs = commissionsResponse.data.configs;
      }

      // Récupérer l'historique des livraisons
      let deliveries: DeliveryHistory[] = [];
      try {
        const deliveriesResponse = await apiService.get('/livraisons/historique/all');
        if (deliveriesResponse.data.success) {
          deliveries = deliveriesResponse.data.livraisons;
        }
      } catch (error) {
        // Si l'endpoint 'all' n'existe pas, utilisez un livreur spécifique
        const livreurId = 1;
        const deliveriesResponse = await apiService.get(`/livraisons/historique/${livreurId}`);
        if (deliveriesResponse.data.success) {
          deliveries = deliveriesResponse.data.livraisons;
        }
      }

      // Calculer les statistiques wallet
      const totalBalance = deliveries.reduce((sum, d) => sum + d.earnings.commissionAdmin, 0);
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyDeliveries = deliveries.filter(d => {
        const deliveryDate = new Date(d.createdAt);
        return deliveryDate.getMonth() === currentMonth && deliveryDate.getFullYear() === currentYear;
      });
      
      const monthlyEarnings = monthlyDeliveries.reduce((sum, d) => sum + d.earnings.commissionAdmin, 0);
      
      const earningsByService = deliveries.reduce((acc, delivery) => {
        const type = delivery.typeLivraison as keyof typeof acc;
        if (acc[type] !== undefined) {
          acc[type] += delivery.earnings.commissionAdmin;
        }
        return acc;
      }, { REPAS: 0, COLIS: 0, GAZ: 0 });

      // Créer les transactions wallet
      const walletTransactions: WalletTransaction[] = deliveries.map((delivery) => ({
        id: `delivery-${delivery.id}`,
        type: 'delivery_commission' as const,
        amount: delivery.earnings.commissionAdmin,
        date: delivery.createdAt,
        description: `Commission ${delivery.typeLivraison.toLowerCase()} - Livraison #${delivery.id}`,
        source: {
          type: delivery.typeLivraison as 'REPAS' | 'COLIS' | 'GAZ',
          orderId: delivery.id.toString(),
          customerName: delivery.details?.client?.username || 'Client inconnu',
          restaurantName: delivery.details?.restaurant?.name || delivery.details?.vendor?.name || ''
        },
        status: delivery.status === 'LIVREE' ? 'completed' as const : 'pending' as const
      }));

      // Trier par date décroissante
      walletTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      // Calculer la croissance mensuelle (simulation)
      const lastMonthEarnings = monthlyEarnings * 0.85; // Simulation
      const monthlyGrowth = lastMonthEarnings > 0 ? ((monthlyEarnings - lastMonthEarnings) / lastMonthEarnings) * 100 : 0;

      const stats: WalletStats = {
        totalBalance,
        monthlyEarnings,
        deliveryCommissions: totalBalance,
        restaurantCommissions: 0, // À implémenter selon vos besoins
        totalTransactions: walletTransactions.length,
        recentTransactions: walletTransactions.slice(0, 10),
        earningsByService,
        monthlyGrowth
      };

      setWalletData(stats);
      setTransactions(walletTransactions);
    } catch (err: any) {
      console.error('Erreur lors de la récupération des données wallet:', err);
      setError(err.message || 'Erreur lors du chargement des données wallet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const refetch = () => {
    fetchWalletData();
  };

  return {
    walletData,
    transactions,
    loading,
    error,
    refetch
  };
}