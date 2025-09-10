"use client"

import { useEffect, useState } from "react";
import { 
  IconCalendar,
  IconFilter,
  IconDownload,
  IconEye,
  IconTrendingUp,
  IconUsers,
  IconPackage,
  IconPizza,
  IconGasStation,
  IconMotorbike
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCommissions, DeliveryHistory } from "@/hooks/use-commissions";

const typeConfig = {
  REPAS: {
    label: 'Repas',
    icon: IconPizza,
    color: 'bg-orange-100 text-orange-800'
  },
  COLIS: {
    label: 'Colis',
    icon: IconPackage,
    color: 'bg-blue-100 text-blue-800'
  },
  GAZ: {
    label: 'Gaz',
    icon: IconGasStation,
    color: 'bg-green-100 text-green-800'
  }
};

const statusConfig = {
  'EN_ATTENTE': { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  'LIVREE': { label: 'Livré', color: 'bg-green-100 text-green-800' },
  'ANNULEE': { label: 'Annulé', color: 'bg-red-100 text-red-800' },
  'EN_COURS': { label: 'En cours', color: 'bg-blue-100 text-blue-800' }
};

export function CommissionDashboard() {
  const { configs, deliveries, stats, loading, error, refetch } = useCommissions();
  const [filteredDeliveries, setFilteredDeliveries] = useState<DeliveryHistory[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  useEffect(() => {
    setFilteredDeliveries(deliveries);
  }, [deliveries]);

  useEffect(() => {
    let filtered = deliveries;

    if (filterType !== 'all') {
      filtered = filtered.filter(d => d.typeLivraison === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(d => d.status === filterStatus);
    }

    if (filterPeriod !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filterPeriod) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(d => new Date(d.createdAt) >= filterDate);
    }

    setFilteredDeliveries(filtered);
  }, [deliveries, filterType, filterStatus, filterPeriod]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const calculateFilteredStats = (deliveries: DeliveryHistory[]) => {
    return {
      total: deliveries.reduce((sum, d) => sum + d.earnings.commissionAdmin, 0),
      completed: deliveries.filter(d => d.status === 'LIVREE').length,
      cancelled: deliveries.filter(d => d.status === 'ANNULEE').length,
      totalRevenue: deliveries.reduce((sum, d) => sum + d.earnings.prixCommande, 0)
    };
  };

  const filteredStats = calculateFilteredStats(filteredDeliveries);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600">Erreur</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={refetch} variant="outline">
            Réessayer
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="koursier-stats-card">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary/10 rounded-xl">
            <IconTrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h1 className="koursier-heading-2">Tableau de Bord des Commissions</h1>
        </div>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
              <div className="koursier-stats-value text-green-600">{formatCurrency(filteredStats.total)}</div>
              <div className="koursier-stats-label text-green-500/80">Total Commissions Admin</div>
            </div>
            <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
              <div className="koursier-stats-value text-purple-600">{formatCurrency(filteredStats.totalRevenue)}</div>
              <div className="koursier-stats-label text-purple-500/80">Chiffre d'Affaires Total</div>
            </div>
            <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
              <div className="koursier-stats-value text-blue-600">{filteredStats.completed}</div>
              <div className="koursier-stats-label text-blue-500/80">Livraisons Complétées</div>
            </div>
            <div className="koursier-metric-card bg-gradient-to-br from-red-500/5 to-red-600/10">
              <div className="koursier-stats-value text-red-600">{filteredStats.cancelled}</div>
              <div className="koursier-stats-label text-red-500/80">Annulées</div>
            </div>
          </div>
          
          {/* Commissions par type de service */}
          {stats && (
            <div>
              <h3 className="koursier-heading-3 mb-6">Commissions par Type de Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="koursier-metric-card">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 bg-orange-500/10 rounded-lg">
                      <IconPizza className="h-6 w-6 text-orange-600" />
                    </div>
                    <span className="koursier-label">Repas</span>
                  </div>
                  <div className="koursier-stats-value text-orange-600">
                    {formatCurrency(stats.commissionsByType.REPAS)}
                  </div>
                </div>
                <div className="koursier-metric-card">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <IconPackage className="h-6 w-6 text-blue-600" />
                    </div>
                    <span className="koursier-label">Colis</span>
                  </div>
                  <div className="koursier-stats-value text-blue-600">
                    {formatCurrency(stats.commissionsByType.COLIS)}
                  </div>
                </div>
                <div className="koursier-metric-card">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                      <IconGasStation className="h-6 w-6 text-green-600" />
                    </div>
                    <span className="koursier-label">Gaz</span>
                  </div>
                  <div className="koursier-stats-value text-green-600">
                    {formatCurrency(stats.commissionsByType.GAZ)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtres */}
      <div className="koursier-stats-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <h2 className="koursier-heading-3">Filtres</h2>
          <button className="koursier-btn koursier-btn-secondary koursier-btn-sm">
            <IconDownload className="h-4 w-4 mr-2" />
            Exporter
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                <SelectItem value="REPAS">Repas</SelectItem>
                <SelectItem value="COLIS">Colis</SelectItem>
                <SelectItem value="GAZ">Gaz</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="LIVREE">Livré</SelectItem>
                <SelectItem value="EN_COURS">En cours</SelectItem>
                <SelectItem value="ANNULEE">Annulé</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute période</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">7 derniers jours</SelectItem>
                <SelectItem value="month">30 derniers jours</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </div>

      {/* Tableau des livraisons */}
      <div className="koursier-stats-card">
        <h2 className="koursier-heading-3 mb-6">Historique des Livraisons ({filteredDeliveries.length})</h2>
        <div className="koursier-scrollable overflow-x-auto">
          <table className="koursier-data-table">
            <thead>
              <tr>
                <th>ID Livraison</th>
                <th>Type</th>
                <th>Client</th>
                <th>Montant Commande</th>
                <th>Commission Admin</th>
                <th>Gain Livreur</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {filteredDeliveries.slice(0, 50).map((delivery) => {
                  const TypeIcon = typeConfig[delivery.typeLivraison as keyof typeof typeConfig]?.icon || IconPackage;
                  const typeInfo = typeConfig[delivery.typeLivraison as keyof typeof typeConfig];
                  const statusInfo = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig['EN_ATTENTE'];
                  
                  return (
                    <tr key={delivery.id}>
                      <td className="font-bold text-primary">#{delivery.id}</td>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeInfo?.color?.includes('orange') ? 'bg-orange-500/10' : typeInfo?.color?.includes('blue') ? 'bg-blue-500/10' : 'bg-green-500/10'}`}>
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          {typeInfo && (
                            <span className={`koursier-badge ${
                              typeInfo.color.includes('orange') ? 'koursier-badge-warning' :
                              typeInfo.color.includes('blue') ? 'koursier-badge-info' :
                              'koursier-badge-success'
                            }`}>
                              {typeInfo.label}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="koursier-label">
                        {delivery.details?.client?.username || 'Client inconnu'}
                      </td>
                      <td className="font-semibold">{formatCurrency(delivery.earnings.prixCommande)}</td>
                      <td className="font-bold koursier-trend-up">
                        {formatCurrency(delivery.earnings.commissionAdmin)}
                      </td>
                      <td className="font-bold text-blue-600">
                        {formatCurrency(delivery.earnings.gainLivreur)}
                      </td>
                      <td>
                        <span className={`koursier-badge ${
                          statusInfo.color.includes('green') ? 'koursier-badge-success' :
                          statusInfo.color.includes('red') ? 'koursier-badge-error' :
                          statusInfo.color.includes('blue') ? 'koursier-badge-info' :
                          'koursier-badge-neutral'
                        }`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="koursier-caption">
                        {formatDate(delivery.createdAt)}
                      </td>
                      <td>
                        <button className="koursier-btn koursier-btn-ghost koursier-btn-sm">
                          <IconEye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        
        {filteredDeliveries.length === 0 && (
          <div className="text-center py-12">
            <div className="koursier-heading-4 text-muted-foreground mb-2">
              Aucune livraison trouvée
            </div>
            <div className="koursier-body text-muted-foreground">
              Aucune livraison ne correspond aux filtres sélectionnés.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}