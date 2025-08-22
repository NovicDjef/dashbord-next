"use client"

import { useState } from "react";
import { 
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconDownload,
  IconRefresh,
  IconPizza,
  IconPackage,
  IconGasStation,
  IconCoin,
  IconArrowUpRight,
  IconCalendar
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet, WalletTransaction } from "@/hooks/use-wallet";

const serviceConfig = {
  REPAS: {
    label: 'Repas',
    icon: IconPizza,
    color: 'bg-orange-100 text-orange-800',
    chartColor: '#ea580c'
  },
  COLIS: {
    label: 'Colis',
    icon: IconPackage,
    color: 'bg-blue-100 text-blue-800',
    chartColor: '#2563eb'
  },
  GAZ: {
    label: 'Gaz',
    icon: IconGasStation,
    color: 'bg-green-100 text-green-800',
    chartColor: '#16a34a'
  }
};

export function WalletDashboard() {
  const { walletData, transactions, loading, error, refetch } = useWallet();
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');

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

  const getFilteredTransactions = () => {
    let filtered = transactions;

    if (filterService !== 'all') {
      filtered = filtered.filter(t => t.source.type === filterService);
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
      
      filtered = filtered.filter(t => new Date(t.date) >= filterDate);
    }

    return filtered;
  };

  const filteredTransactions = getFilteredTransactions();

  if (loading) {
    return (
      <div className="space-y-6 px-4 lg:px-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-1/3" />
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 lg:px-6">
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={refetch} variant="outline">
              <IconRefresh className="h-4 w-4 mr-2" />
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!walletData) {
    return (
      <div className="px-4 lg:px-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <IconWallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune donnée wallet disponible</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-4 lg:px-6">
      {/* Vue d'ensemble du wallet */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWallet className="h-5 w-5" />
            Vue d'ensemble du Wallet
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <IconCoin className="h-6 w-6 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-600">Balance Total</span>
              </div>
              <div className="text-3xl font-bold text-green-700">{formatCurrency(walletData.totalBalance)}</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <IconCalendar className="h-6 w-6 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-600">Ce Mois</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(walletData.monthlyEarnings)}</div>
              <div className="flex items-center justify-center mt-1">
                {walletData.monthlyGrowth >= 0 ? (
                  <IconTrendingUp className="h-4 w-4 text-green-600 mr-1" />
                ) : (
                  <IconTrendingDown className="h-4 w-4 text-red-600 mr-1" />
                )}
                <span className={`text-xs ${walletData.monthlyGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {walletData.monthlyGrowth >= 0 ? '+' : ''}{walletData.monthlyGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <IconArrowUpRight className="h-6 w-6 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-600">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-purple-700">{walletData.totalTransactions}</div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <IconTrendingUp className="h-6 w-6 text-orange-600 mr-2" />
                <span className="text-sm font-medium text-orange-600">Commissions</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">{formatCurrency(walletData.deliveryCommissions)}</div>
            </div>
          </div>

          {/* Répartition par service */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4">Gains par Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(walletData.earningsByService).map(([service, amount]) => {
                const config = serviceConfig[service as keyof typeof serviceConfig];
                const Icon = config.icon;
                return (
                  <div key={service} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" style={{ color: config.chartColor }} />
                      <span className="font-medium">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: config.chartColor }}>
                        {formatCurrency(amount)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {((amount / walletData.totalBalance) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des transactions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <CardTitle>Historique des Transactions</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <IconDownload className="h-4 w-4 mr-2" />
                Exporter
              </Button>
              <Button variant="outline" size="sm" onClick={refetch}>
                <IconRefresh className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Select value={filterService} onValueChange={setFilterService}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les services</SelectItem>
                <SelectItem value="REPAS">Repas</SelectItem>
                <SelectItem value="COLIS">Colis</SelectItem>
                <SelectItem value="GAZ">Gaz</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPeriod} onValueChange={setFilterPeriod}>
              <SelectTrigger className="w-full sm:w-48">
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

          {/* Tableau des transactions */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.slice(0, 50).map((transaction) => {
                  const serviceConfig = serviceConfig[transaction.source.type];
                  const ServiceIcon = serviceConfig.icon;
                  
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{transaction.description}</div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.source.restaurantName && `${transaction.source.restaurantName}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ServiceIcon className="h-4 w-4" />
                          <Badge className={serviceConfig.color}>
                            {serviceConfig.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {transaction.source.customerName}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={transaction.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-green-600">
                        +{formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune transaction trouvée avec les filtres sélectionnés.
            </div>
          )}
          
          {filteredTransactions.length > 50 && (
            <div className="text-center py-4 text-muted-foreground">
              Affichage de 50 transactions sur {filteredTransactions.length}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}