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
      minimumFractionDigits: 0
    }).format(amount) + ' F';
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
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="koursier-metric-card">
              <div className="koursier-skeleton h-6 rounded w-1/2 koursier-shimmer" />
              <div className="koursier-skeleton h-8 rounded w-full mt-4 koursier-shimmer" />
            </div>
          ))}
        </div>
        <div className="koursier-metric-card">
          <div className="koursier-skeleton h-6 rounded w-1/4 koursier-shimmer" />
          <div className="space-y-3 mt-4">
            {[...Array(5)].map((_, j) => (
              <div key={j} className="koursier-skeleton h-12 rounded koursier-shimmer" />
            ))}
          </div>
        </div>
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
      <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10 border-0">
        <h3 className="koursier-stats-label text-purple-600 dark:text-purple-400 flex items-center gap-2 mb-6">
          <IconWallet className="h-5 w-5" />
          Vue d'ensemble du Wallet
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
            <div className="koursier-stats-label text-green-600 dark:text-green-400 flex items-center gap-2">
              <IconCoin className="h-5 w-5" />
              Balance Total
            </div>
            <div className="koursier-stats-value text-green-600 dark:text-green-400">{formatCurrency(walletData.totalBalance)}</div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
            <div className="koursier-stats-label text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <IconCalendar className="h-5 w-5" />
              Ce Mois
            </div>
            <div className="koursier-stats-value text-blue-600 dark:text-blue-400">{formatCurrency(walletData.monthlyEarnings)}</div>
            <div className="flex items-center gap-1 mt-2">
              {walletData.monthlyGrowth >= 0 ? (
                <IconTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
              ) : (
                <IconTrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
              )}
              <span className={`koursier-caption ${walletData.monthlyGrowth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {walletData.monthlyGrowth >= 0 ? '+' : ''}{walletData.monthlyGrowth.toFixed(1)}%
              </span>
            </div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
            <div className="koursier-stats-label text-purple-600 dark:text-purple-400 flex items-center gap-2">
              <IconArrowUpRight className="h-5 w-5" />
              Transactions
            </div>
            <div className="koursier-stats-value text-purple-600 dark:text-purple-400">{walletData.totalTransactions}</div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-orange-500/5 to-orange-600/10">
            <div className="koursier-stats-label text-orange-600 dark:text-orange-400 flex items-center gap-2">
              <IconTrendingUp className="h-5 w-5" />
              Commissions
            </div>
            <div className="koursier-stats-value text-orange-600 dark:text-orange-400">{formatCurrency(walletData.deliveryCommissions)}</div>
          </div>
        </div>

        {/* Répartition par service */}
        <div className="mt-6">
          <h3 className="koursier-stats-label mb-4">Gains par Service</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(walletData.earningsByService).map(([service, amount]) => {
              const config = serviceConfig[service as keyof typeof serviceConfig];
              const Icon = config.icon;
              return (
                <div key={service} className="koursier-metric-card bg-gradient-to-br from-gray-500/5 to-gray-600/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-5 w-5" style={{ color: config.chartColor }} />
                      <span className="koursier-label">{config.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="koursier-stats-value" style={{ color: config.chartColor }}>
                        {formatCurrency(amount)}
                      </div>
                      <div className="koursier-caption">
                        {((amount / walletData.totalBalance) * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historique des transactions */}
      <div className="koursier-metric-card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">
          <div>
            <h3 className="koursier-stats-label mb-2">Historique des Transactions</h3>
            <p className="koursier-caption">Consultez toutes vos transactions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="koursier-btn">
              <IconDownload className="h-4 w-4 mr-2" />
              Exporter
            </Button>
            <Button variant="outline" size="sm" onClick={refetch} className="koursier-btn">
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          </div>
        </div>

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
          <table className="koursier-data-table">
            <thead>
              <tr>
                <th className="koursier-label">Date</th>
                <th className="koursier-label">Description</th>
                <th className="koursier-label">Service</th>
                <th className="koursier-label">Client</th>
                <th className="koursier-label">Statut</th>
                <th className="koursier-label text-right">Montant</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.slice(0, 50).map((transaction) => {
                const config = serviceConfig[transaction.source.type as keyof typeof serviceConfig];
                const ServiceIcon = config.icon;

                return (
                  <tr key={transaction.id}>
                    <td className="koursier-caption">
                      {formatDate(transaction.date)}
                    </td>
                    <td>
                      <div className="koursier-label font-medium">{transaction.description}</div>
                      <div className="koursier-caption">
                        {transaction.source.restaurantName && `${transaction.source.restaurantName}`}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <ServiceIcon className="h-4 w-4" />
                        <Badge className={config.color + ' dark:bg-opacity-20'}>
                          {config.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="koursier-caption">
                      {transaction.source.customerName}
                    </td>
                    <td>
                      <Badge
                        className={transaction.status === 'completed'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                        }
                      >
                        {transaction.status === 'completed' ? 'Complété' : 'En attente'}
                      </Badge>
                    </td>
                    <td className="koursier-label text-right font-semibold text-green-600 dark:text-green-400">
                      +{formatCurrency(transaction.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <div className="koursier-empty-state">
            <div className="koursier-empty-icon">
              <IconWallet className="h-12 w-12" />
            </div>
            <h3 className="koursier-empty-title">Aucune transaction trouvée</h3>
            <p className="koursier-caption">Essayez de modifier vos filtres</p>
          </div>
        )}

        {filteredTransactions.length > 50 && (
          <div className="text-center py-4">
            <p className="koursier-caption">
              Affichage de 50 transactions sur {filteredTransactions.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}