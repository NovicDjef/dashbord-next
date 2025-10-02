"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <IconRefresh className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">Chargement des wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6">
      {/* Header */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconWallet className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Wallets Livreurs</h1>
              <p className="text-muted-foreground">
                Gérez les gains et les retraits des livreurs
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData}>
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button variant="outline">
              <IconDownload className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="px-4 lg:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Livreurs Actifs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{livreurs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Gains Totaux
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(wallets.reduce((sum, w) => sum + w.balance.total, 0))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconClock className="h-4 w-4 text-yellow-600" />
                Retraits en Attente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {formatCurrency(totalPending)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {withdrawals.filter((w) => w.status === 'PENDING').length} demandes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <IconCheck className="h-4 w-4 text-green-600" />
                Retraits Approuvés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(totalApproved)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Wallets Table */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Wallets des Livreurs</CardTitle>
            <CardDescription>Vue d&apos;ensemble des gains de chaque livreur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Livreur</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead className="text-right">Balance Totale</TableHead>
                    <TableHead className="text-right">Disponible</TableHead>
                    <TableHead className="text-right">En Attente</TableHead>
                    <TableHead className="text-right">Retiré</TableHead>
                    <TableHead className="text-right">Ce Mois</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wallets.map((wallet) => (
                    <TableRow key={wallet.livreurId}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <IconMotorbike className="h-4 w-4 text-muted-foreground" />
                          {wallet.livreur.username}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {wallet.livreur.phone}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(wallet.balance.total)}
                      </TableCell>
                      <TableCell className="text-right text-green-600 font-semibold">
                        {formatCurrency(wallet.balance.available)}
                      </TableCell>
                      <TableCell className="text-right text-yellow-600">
                        {formatCurrency(wallet.balance.pending)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatCurrency(wallet.balance.withdrawn)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <IconTrendingUp className="h-4 w-4 text-green-600" />
                          {formatCurrency(wallet.stats.monthlyEarnings)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => viewLivreurDetails(wallet.livreur)}
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {wallets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun wallet trouvé
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Withdrawal Requests */}
      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Demandes de Retrait</CardTitle>
                <CardDescription>
                  Gérez les demandes de retrait des livreurs
                </CardDescription>
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
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Livreur</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead>Méthode</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWithdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(withdrawal.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </TableCell>
                      <TableCell className="font-medium">
                        {withdrawal.livreur?.username || `Livreur #${withdrawal.livreurId}`}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(withdrawal.amount)}
                      </TableCell>
                      <TableCell>{withdrawal.method}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            withdrawal.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : withdrawal.status === 'APPROVED'
                              ? 'bg-blue-100 text-blue-800'
                              : withdrawal.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
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
                      </TableCell>
                      <TableCell>
                        {withdrawal.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveWithdrawal(withdrawal.id)}
                            >
                              <IconCheck className="h-4 w-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectWithdrawal(withdrawal.id)}
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
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredWithdrawals.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune demande de retrait
              </div>
            )}
          </CardContent>
        </Card>
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
