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
      pending: deliveries.filter(d => d.status === 'EN_ATTENTE').length,
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconTrendingUp className="h-5 w-5" />
            Tableau de Bord des Commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{formatCurrency(filteredStats.total)}</div>
              <div className="text-sm text-green-600">Total Commissions Admin</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">{formatCurrency(filteredStats.totalRevenue)}</div>
              <div className="text-sm text-purple-600">Chiffre d'Affaires Total</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{filteredStats.completed}</div>
              <div className="text-sm text-blue-600">Livraisons Complétées</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg">
              <div className="text-2xl font-bold text-yellow-700">{filteredStats.pending}</div>
              <div className="text-sm text-yellow-600">En attente</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{filteredStats.cancelled}</div>
              <div className="text-sm text-red-600">Annulées</div>
            </div>
          </div>
          
          {/* Commissions par type de service */}
          {stats && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-4">Commissions par Type de Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IconPizza className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Repas</span>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {formatCurrency(stats.commissionsByType.REPAS)}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IconPackage className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Colis</span>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {formatCurrency(stats.commissionsByType.COLIS)}
                  </div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <IconGasStation className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Gaz</span>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {formatCurrency(stats.commissionsByType.GAZ)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle className="text-lg">Filtres</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <IconDownload className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <SelectItem value="EN_ATTENTE">En attente</SelectItem>
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
        </CardContent>
      </Card>

      {/* Tableau des livraisons */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des Livraisons ({filteredDeliveries.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Livraison</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Montant Commande</TableHead>
                  <TableHead>Commission Admin</TableHead>
                  <TableHead>Gain Livreur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.slice(0, 50).map((delivery) => {
                  const TypeIcon = typeConfig[delivery.typeLivraison as keyof typeof typeConfig]?.icon || IconPackage;
                  const typeInfo = typeConfig[delivery.typeLivraison as keyof typeof typeConfig];
                  const statusInfo = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig['EN_ATTENTE'];
                  
                  return (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-medium">#{delivery.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <TypeIcon className="h-4 w-4" />
                          {typeInfo && (
                            <Badge className={typeInfo.color}>
                              {typeInfo.label}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {delivery.details?.client?.username || 'Client inconnu'}
                      </TableCell>
                      <TableCell>{formatCurrency(delivery.earnings.prixCommande)}</TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(delivery.earnings.commissionAdmin)}
                      </TableCell>
                      <TableCell className="font-semibold text-blue-600">
                        {formatCurrency(delivery.earnings.gainLivreur)}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusInfo.color}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(delivery.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredDeliveries.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune livraison trouvée avec les filtres sélectionnés.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}