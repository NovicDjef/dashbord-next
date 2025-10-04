"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconWallet,
  IconMotorbike,
  IconCash,
  IconTrendingUp,
  IconClock,
  IconCheck,
  IconX,
  IconRefresh,
  IconDownload,
  IconEye,
  IconAlertCircle
} from "@tabler/icons-react";
import { useToast } from "@/hooks/use-toast";
import { walletService, livreursService } from '@/services/api';

interface Livreur {
  id: number;
  username: string;
  phone: string;
  email?: string;
}

interface WalletData {
  livreurId: number;
  livreur: Livreur;
  balance: {
    total: number;
    available: number;
    pending: number;
    withdrawn: number;
  };
  stats: {
    totalEarnings: number;
    monthlyEarnings: number;
    weeklyEarnings: number;
    todayEarnings: number;
  };
}

interface WithdrawalRequest {
  id: number;
  livreurId: number;
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED';
  method: string;
  createdAt: string;
  livreur?: Livreur;
}

export default function WalletLivreursPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [livreurs, setLivreurs] = useState<Livreur[]>([]);
  const [wallets, setWallets] = useState<WalletData[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [withdrawalDetailsOpen, setWithdrawalDetailsOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [livreursData, withdrawalsData] = await Promise.all([
        livreursService.getAll(),
        walletService.getWithdrawals(),
      ]);

      setLivreurs(livreursData.livreurs);
      setWithdrawals(withdrawalsData.withdrawals || []);

      // Charger les wallets de tous les livreurs
      const walletsPromises = livreursData.livreurs.map(async (livreur: Livreur) => {
        try {
          const [balance, stats] = await Promise.all([
            walletService.getLivreurBalance(livreur.id),
            walletService.getLivreurStats(livreur.id),
          ]);

          return {
            livreurId: livreur.id,
            livreur,
            balance,
            stats,
          };
        } catch (error) {
          return null;
        }
      });

      const walletsData = (await Promise.all(walletsPromises)).filter(Boolean) as WalletData[];
      setWallets(walletsData);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveWithdrawal = async (id: number) => {
    try {
      await walletService.approveWithdrawal(id);
      toast({
        title: "Succès",
        description: "Demande de retrait approuvée",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de l'approbation",
        variant: "destructive",
      });
    }
  };

  const handleRejectWithdrawal = async (id: number) => {
    const reason = prompt('Raison du refus:');
    if (!reason) return;

    try {
      await walletService.rejectWithdrawal(id, reason);
      toast({
        title: "Succès",
        description: "Demande de retrait rejetée",
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du rejet",
        variant: "destructive",
      });
    }
  };

  const viewLivreurDetails = async (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setDetailsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0,
    }).format(amount) + ' F';
  };

  const filteredWithdrawals = withdrawals.filter((w) =>
    filterStatus === 'all' ? true : w.status === filterStatus
  );

  const totalPending = withdrawals
    .filter((w) => w.status === 'PENDING')
    .reduce((sum, w) => sum + w.amount, 0);

  const totalApproved = withdrawals
    .filter((w) => w.status === 'APPROVED' || w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
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

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="koursier-heading-1 flex items-center gap-2">
              <IconWallet className="h-7 w-7" />
              Wallets Livreurs
            </h1>
            <p className="koursier-body text-muted-foreground">
              Gérez les gains et les retraits des livreurs
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} className="koursier-btn">
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline" className="koursier-btn">
              <IconDownload className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="koursier-metric-card bg-gradient-to-br from-indigo-500/5 to-indigo-600/10">
            <div className="koursier-stats-label text-indigo-600 dark:text-indigo-400 flex items-center gap-2">
              <IconMotorbike className="h-5 w-5" />
              Total Livreurs Actifs
            </div>
            <div className="koursier-stats-value text-indigo-600 dark:text-indigo-400">{livreurs.length}</div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
            <div className="koursier-stats-label text-green-600 dark:text-green-400 flex items-center gap-2">
              <IconCash className="h-5 w-5" />
              Gains Totaux
            </div>
            <div className="koursier-stats-value text-green-600 dark:text-green-400">
              {formatCurrency(wallets.reduce((sum, w) => sum + w.balance.total, 0))}
            </div>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10">
            <div className="koursier-stats-label text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
              <IconClock className="h-5 w-5" />
              Retraits en Attente
            </div>
            <div className="koursier-stats-value text-yellow-600 dark:text-yellow-400">
              {formatCurrency(totalPending)}
            </div>
            <p className="koursier-caption mt-2">
              {withdrawals.filter((w) => w.status === 'PENDING').length} demandes
            </p>
          </div>

          <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
            <div className="koursier-stats-label text-blue-600 dark:text-blue-400 flex items-center gap-2">
              <IconCheck className="h-5 w-5" />
              Retraits Approuvés
            </div>
            <div className="koursier-stats-value text-blue-600 dark:text-blue-400">
              {formatCurrency(totalApproved)}
            </div>
          </div>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="px-4 lg:px-6">
        <div className="koursier-metric-card">
          <h3 className="koursier-stats-label mb-2">Wallets des Livreurs</h3>
          <p className="koursier-caption mb-6">Vue d&apos;ensemble des gains de chaque livreur</p>

          <div className="overflow-x-auto">
            <table className="koursier-data-table">
              <thead>
                <tr>
                  <th className="koursier-label">Livreur</th>
                  <th className="koursier-label">Contact</th>
                  <th className="koursier-label text-right">Balance Totale</th>
                  <th className="koursier-label text-right">Disponible</th>
                  <th className="koursier-label text-right">En Attente</th>
                  <th className="koursier-label text-right">Retiré</th>
                  <th className="koursier-label text-right">Ce Mois</th>
                  <th className="koursier-label">Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map((wallet) => (
                  <tr key={wallet.livreurId}>
                    <td className="koursier-label font-medium">
                      <div className="flex items-center gap-2">
                        <IconMotorbike className="h-4 w-4 text-muted-foreground" />
                        {wallet.livreur.username}
                      </div>
                    </td>
                    <td className="koursier-caption">
                      {wallet.livreur.phone}
                    </td>
                    <td className="koursier-label text-right font-semibold">
                      {formatCurrency(wallet.balance.total)}
                    </td>
                    <td className="koursier-label text-right text-green-600 dark:text-green-400 font-semibold">
                      {formatCurrency(wallet.balance.available)}
                    </td>
                    <td className="koursier-label text-right text-yellow-600 dark:text-yellow-400">
                      {formatCurrency(wallet.balance.pending)}
                    </td>
                    <td className="koursier-caption text-right">
                      {formatCurrency(wallet.balance.withdrawn)}
                    </td>
                    <td className="koursier-label text-right">
                      <div className="flex items-center justify-end gap-1">
                        <IconTrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        {formatCurrency(wallet.stats.monthlyEarnings)}
                      </div>
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => viewLivreurDetails(wallet.livreur)}
                        className="koursier-btn"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {wallets.length === 0 && (
            <div className="koursier-empty-state">
              <div className="koursier-empty-icon">
                <IconWallet className="h-12 w-12" />
              </div>
              <h3 className="koursier-empty-title">Aucun wallet trouvé</h3>
            </div>
          )}
        </div>
      </div>

      {/* Withdrawal Requests */}
      <div className="px-4 lg:px-6">
        <div className="koursier-metric-card">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="koursier-stats-label mb-2">Demandes de Retrait</h3>
              <p className="koursier-caption">
                Gérez les demandes de retrait des livreurs
              </p>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="APPROVED">Approuvé</SelectItem>
                <SelectItem value="REJECTED">Rejeté</SelectItem>
                <SelectItem value="COMPLETED">Complété</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="koursier-data-table">
              <thead>
                <tr>
                  <th className="koursier-label">Date</th>
                  <th className="koursier-label">Livreur</th>
                  <th className="koursier-label text-right">Montant</th>
                  <th className="koursier-label">Méthode</th>
                  <th className="koursier-label">Statut</th>
                  <th className="koursier-label">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id}>
                    <td className="koursier-caption">
                      {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="koursier-label font-medium">
                      {withdrawal.livreur?.username || `Livreur #${withdrawal.livreurId}`}
                    </td>
                    <td className="koursier-label text-right font-semibold">
                      {formatCurrency(withdrawal.amount)}
                    </td>
                    <td className="koursier-caption">{withdrawal.method}</td>
                    <td>
                      <Badge
                        className={
                          withdrawal.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
                            : withdrawal.status === 'APPROVED'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                            : withdrawal.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                        }
                      >
                        {withdrawal.status === 'PENDING'
                          ? 'En attente'
                          : withdrawal.status === 'APPROVED'
                          ? 'Approuvé'
                          : withdrawal.status === 'COMPLETED'
                          ? 'Complété'
                          : 'Rejeté'}
                      </Badge>
                    </td>
                    <td>
                      {withdrawal.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            className="koursier-btn"
                          >
                            <IconCheck className="h-4 w-4 mr-1" />
                            Approuver
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectWithdrawal(withdrawal.id)}
                            className="koursier-btn"
                          >
                            <IconX className="h-4 w-4 mr-1" />
                            Rejeter
                          </Button>
                        </div>
                      )}
                      {withdrawal.status !== 'PENDING' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedWithdrawal(withdrawal);
                            setWithdrawalDetailsOpen(true);
                          }}
                          className="koursier-btn"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredWithdrawals.length === 0 && (
            <div className="koursier-empty-state">
              <div className="koursier-empty-icon">
                <IconAlertCircle className="h-12 w-12" />
              </div>
              <h3 className="koursier-empty-title">Aucune demande de retrait</h3>
            </div>
          )}
        </div>
      </div>

      {/* Livreur Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Détails du Wallet</DialogTitle>
            <DialogDescription>
              {selectedLivreur?.username} - {selectedLivreur?.phone}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {wallets
                .filter((w) => w.livreurId === selectedLivreur?.id)
                .map((wallet) => (
                  <>
                    <Card key={`total-${wallet.livreurId}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Balance Totale</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(wallet.balance.total)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card key={`available-${wallet.livreurId}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Disponible</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(wallet.balance.available)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card key={`month-${wallet.livreurId}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Ce Mois</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(wallet.stats.monthlyEarnings)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card key={`week-${wallet.livreurId}`}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Cette Semaine</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {formatCurrency(wallet.stats.weeklyEarnings)}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                ))}
            </div>

            <div className="pt-4">
              <h3 className="text-lg font-semibold mb-4">Dernières Transactions</h3>
              <p className="text-muted-foreground text-center py-8">
                Historique des transactions disponible bientôt
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdrawal Details Dialog */}
      <Dialog open={withdrawalDetailsOpen} onOpenChange={setWithdrawalDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Détails du Retrait</DialogTitle>
          </DialogHeader>

          {selectedWithdrawal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Montant</Label>
                  <p className="text-lg font-semibold">
                    {formatCurrency(selectedWithdrawal.amount)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Statut</Label>
                  <Badge
                    className={
                      selectedWithdrawal.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }
                  >
                    {selectedWithdrawal.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Méthode</Label>
                  <p className="font-medium">{selectedWithdrawal.method}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">Date</Label>
                  <p className="font-medium">
                    {new Date(selectedWithdrawal.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setWithdrawalDetailsOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
