import { useState, useEffect } from 'react';
import apiService from '@/services/Api';

export interface CommissionConfig {
  id: number;
  serviceType: string;
  livreurPercent: number;
  adminPercent: number;
  livreurPercentage: string;
  adminPercentage: string;
  isActive: boolean;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: null | string;
}

export interface DeliveryHistory {
  id: number;
  status: string;
  typeLivraison: string;
  createdAt: string;
  heureLivraison: string;
  earnings: {
    prixLivraison: number;
    gainLivreur: number;
    commissionAdmin: number;
    pourcentageCommission: string;
    prixCommande: number;
  };
  details: any;
}

export interface CommissionStats {
  totalCommissions: number;
  totalRevenue: number;
  completedDeliveries: number;
  totalDeliveries: number;
  commissionsByType: {
    REPAS: number;
    COLIS: number;
    GAZ: number;
  };
}

/**
 * Historique global de la plateforme : `GET /historique/admin` (super admin).
 * La réponse expose `financials` / `actors` ; on la ramène ici à la forme
 * `earnings` / `details` utilisée par les écrans wallet et commissions.
 */
export async function fetchAdminDeliveries(period: 'week' | 'month' | 'year' | 'all' = 'all'): Promise<DeliveryHistory[]> {
  try {
    const response = await apiService.get('/historique/admin', { params: { period, limit: 200 } });
    const rows = response.data?.livraisons || [];
    return rows.map((l: any) => ({
      id: l.id,
      status: l.status,
      typeLivraison: l.typeLivraison,
      createdAt: l.createdAt,
      heureLivraison: l.heureLivraison,
      earnings: {
        prixLivraison: l.financials?.prixLivraison ?? 0,
        gainLivreur: l.financials?.gainLivreur ?? 0,
        commissionAdmin: l.financials?.commissionAdmin ?? 0,
        pourcentageCommission: l.financials?.pourcentageCommission ?? '0%',
        prixCommande: l.financials?.prixCommande ?? 0,
      },
      details: {
        ...(l.details || {}),
        client: l.actors?.client || null,
        livreur: l.actors?.livreur || null,
        restaurant: l.details?.restaurant ? { name: l.details.restaurant } : null,
        vendor: l.details?.vendor ? { name: l.details.vendor } : null,
      },
    }));
  } catch (err) {
    console.error("Erreur lors de la récupération de l'historique admin:", err);
    return [];
  }
}

export function useCommissions() {
  const [configs, setConfigs] = useState<CommissionConfig[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryHistory[]>([]);
  const [stats, setStats] = useState<CommissionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommissionConfigs = async () => {
    try {
      const response = await apiService.get('/commissions');
      if (response.data.success) {
        return response.data.configs;
      }
      throw new Error(response.data.message || 'Erreur lors de la récupération des configurations');
    } catch (err: any) {
      console.error('Erreur lors de la récupération des configurations de commission:', err);
      throw err;
    }
  };

  const fetchAllDeliveries = () => fetchAdminDeliveries();

  const calculateStats = (deliveries: DeliveryHistory[]): CommissionStats => {
    const totalCommissions = deliveries.reduce((sum, delivery) => sum + delivery.earnings.commissionAdmin, 0);
    const totalRevenue = deliveries.reduce((sum, delivery) => sum + delivery.earnings.prixCommande, 0);
    const completedDeliveries = deliveries.filter(d => d.status === 'LIVREE').length;
    
    const commissionsByType = deliveries.reduce((acc, delivery) => {
      const type = delivery.typeLivraison as keyof typeof acc;
      if (acc[type] !== undefined) {
        acc[type] += delivery.earnings.commissionAdmin;
      }
      return acc;
    }, { REPAS: 0, COLIS: 0, GAZ: 0 });

    return {
      totalCommissions,
      totalRevenue,
      completedDeliveries,
      totalDeliveries: deliveries.length,
      commissionsByType
    };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [commissionsData, deliveriesData] = await Promise.all([
        fetchCommissionConfigs(),
        fetchAllDeliveries()
      ]);

      setConfigs(commissionsData);
      setDeliveries(deliveriesData);
      setStats(calculateStats(deliveriesData));
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return {
    configs,
    deliveries,
    stats,
    loading,
    error,
    refetch
  };
}