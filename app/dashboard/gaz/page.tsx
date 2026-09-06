"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  IconGasStation,
  IconTrendingUp,
  IconPackage,
  IconClock,
  IconMapPin,
  IconEye,
  IconDownload,
  IconFilter
} from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getGasOrdersAsync } from "@/redux/gazSlice";
import { GAS_ORDER_STATUSES, type GasOrderStatus } from "@/lib/service-status";
import { GazDetailModal } from "@/components/gaz-detail-modal";
import { Pagination } from "@/components/pagination";


interface CommandeGaz {
  id: string;
  numeroCommande: string;
  client: string;
  telephone: string;
  adresse: string;
  marqueGaz: string;
  typeCommande: 'recharge' | 'bouteille_complete';
  quantite: number;
  prix: number;
  commission: number;
  // Valeurs de l'enum GasOrderStatus (prisma/schema.prisma du backend)
  statut: GasOrderStatus;
  livreur?: string;
  dateCommande: string;
  dateLivraison?: string;
}

const statutConfig: Record<GasOrderStatus, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  VALIDER: { label: 'Livreur affecté', color: 'bg-violet-100 text-violet-800' },
  ASSIGNEE: { label: 'Livreur affecté', color: 'bg-violet-100 text-violet-800' },
  EN_COURS: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  LIVREE: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-800' },
  REMBOURSE: { label: 'Remboursée', color: 'bg-zinc-200 text-zinc-800' }
};

const typeCommandeConfig = {
  recharge: { label: 'Recharge seulement', icon: '🔄', prix: 6500 },
  bouteille_complete: { label: 'Bouteille complète', icon: '🆕', prix: 30000 }
};

const marques = ['CAM GAZ', 'TRADEX', 'BOCCOM', 'SCTM', 'TOTAL GAS', 'SHELL GAS'];

export default function GazPage() {
  const dispatch = useDispatch();
  const { gasOrders, status, error } = useSelector((state: any) => state.gas);
  const [filteredCommandes, setFilteredCommandes] = useState<CommandeGaz[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState<CommandeGaz | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const loading = status === 'loading';

  // Le backend renvoie directement une valeur de GasOrderStatus.
  const mapStatus = (status: string): GasOrderStatus =>
    GAS_ORDER_STATUSES.includes(status as GasOrderStatus) ? (status as GasOrderStatus) : 'EN_ATTENTE';

  // Fonction pour mapper le type de commande
  const mapOrderType = (orderType: string): 'recharge' | 'bouteille_complete' => {
    return orderType === 'REFILL' ? 'recharge' : 'bouteille_complete';
  };

  // Transformer les données de l'API au format attendu
  const transformGasOrders = (orders: any[]): CommandeGaz[] => {
    return orders.map(order => ({
      id: order.id?.toString() || '',
      numeroCommande: order.orderNumber || `GAZ-${order.id}`,
      client: order.user?.username || 'Client inconnu',
      telephone: order.phone || order.user?.phone || '',
      adresse: order.deliveryAddress || '',
      marqueGaz: order.selectedBrand?.replace('_', ' ') || 'BOCCOM',
      typeCommande: mapOrderType(order.orderType),
      quantite: order.quantity || 1,
      prix: order.totalPrice || order.basePrice || 0,
      commission: order.adminShare || 0,
      statut: mapStatus(order.status),
      livreur: order.livreur ? `${order.livreur.username} ${order.livreur.prenom || ''}`.trim() : undefined,
      dateCommande: order.createdAt || new Date().toISOString(),
      dateLivraison: order.deliveredAt
    }));
  };

  useEffect(() => {
    dispatch(getGasOrdersAsync());
  }, [dispatch]);

  // Utiliser les données de Redux
  useEffect(() => {
    console.log("=== DEBUG GAZ PAGE ===");
    console.log("gasOrders type:", typeof gasOrders);
    console.log("gasOrders isArray:", Array.isArray(gasOrders));
    console.log("gasOrders value:", gasOrders);
    console.log("=====================");

    // S'assurer que gasOrders est un tableau
    const ordersArray = Array.isArray(gasOrders) ? gasOrders : [];

    if (ordersArray.length > 0) {
      const transformedOrders = transformGasOrders(ordersArray);
      console.log("Commandes transformées:", transformedOrders);
      setFilteredCommandes(transformedOrders);
    } else {
      setFilteredCommandes([]);
    }
  }, [gasOrders]);

  useEffect(() => {
    // S'assurer que gasOrders est un tableau
    const ordersArray = Array.isArray(gasOrders) ? gasOrders : [];

    if (!Array.isArray(ordersArray)) {
      console.error("gasOrders n'est pas un tableau:", ordersArray);
      setFilteredCommandes([]);
      return;
    }

    // Transformer les données
    let filtered = ordersArray.length > 0 ? transformGasOrders(ordersArray) : [];

    if (filterStatut !== 'all') {
      filtered = filtered.filter(c => c.statut === filterStatut);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(c => c.typeCommande === filterType);
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

      filtered = filtered.filter(c => new Date(c.dateCommande) >= filterDate);
    }

    setFilteredCommandes(filtered);
    setCurrentPage(1); // Réinitialiser à la page 1 quand les filtres changent
  }, [gasOrders, filterStatut, filterType, filterPeriod]);

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredCommandes.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCommandes = filteredCommandes.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={() => dispatch(getGasOrdersAsync())}>Réessayer</Button>
        </div>
      </div>
    );
  }

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

  const calculateStats = () => {
    const total = filteredCommandes.length;
    const enAttente = filteredCommandes.filter(c => c.statut === 'EN_ATTENTE').length;
    const enLivraison = filteredCommandes.filter(c => c.statut === 'EN_COURS').length;
    const livrees = filteredCommandes.filter(c => c.statut === 'LIVREE').length;
    const chiffreAffaires = filteredCommandes.reduce((sum, c) => sum + c.prix, 0);
    const commissionsTotal = filteredCommandes.reduce((sum, c) => sum + c.commission, 0);

    return { total, enAttente, enLivraison, livrees, chiffreAffaires, commissionsTotal };
  };

  const stats = calculateStats();

  // Fonctions pour gérer les actions
  const handleViewCommande = (commande: CommandeGaz) => {
    setSelectedCommande(commande);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCommande(null);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="koursier-skeleton h-24 rounded koursier-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="koursier-heading-1 flex items-center gap-2">
            <IconGasStation className="h-7 w-7" />
            Livraisons de Gaz
          </h1>
          <p className="koursier-body text-muted-foreground">
            Gérez les commandes et livraisons de bouteilles de gaz
          </p>
        </div>
        <Button className="koursier-btn-primary">
          <IconDownload className="h-4 w-4 mr-2" />
          Exporter rapport
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="koursier-metric-card bg-gradient-to-br from-orange-500/5 to-orange-600/10 border-0">
          <div className="koursier-stats-label text-orange-600 dark:text-orange-400">
            Total Commandes
          </div>
          <div className="koursier-stats-value text-orange-600 dark:text-orange-400">{stats.total}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10 border-0">
          <div className="koursier-stats-label text-yellow-600 dark:text-yellow-400">
            En attente
          </div>
          <div className="koursier-stats-value text-yellow-600 dark:text-yellow-400">{stats.enAttente}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10 border-0">
          <div className="koursier-stats-label text-purple-600 dark:text-purple-400">
            En livraison
          </div>
          <div className="koursier-stats-value text-purple-600 dark:text-purple-400">{stats.enLivraison}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10 border-0">
          <div className="koursier-stats-label text-green-600 dark:text-green-400">
            Livrées
          </div>
          <div className="koursier-stats-value text-green-600 dark:text-green-400">{stats.livrees}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-0">
          <div className="koursier-stats-label text-blue-600 dark:text-blue-400">
            Chiffre d'affaires
          </div>
          <div className="koursier-stats-value text-xl text-blue-600 dark:text-blue-400">{formatCurrency(stats.chiffreAffaires)}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-0">
          <div className="koursier-stats-label text-emerald-600 dark:text-emerald-400">
            Commissions
          </div>
          <div className="koursier-stats-value text-xl text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.commissionsTotal)}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="koursier-metric-card bg-gradient-to-br from-slate-500/5 to-slate-600/10 border-0">
        <div className="flex items-center justify-between mb-6">
          <h3 className="koursier-stats-label text-slate-600 dark:text-slate-400 flex items-center gap-2">
            <IconFilter className="h-5 w-5" />
            Filtres
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                {GAS_ORDER_STATUSES.map((st) => (
                  <SelectItem key={st} value={st}>{statutConfig[st].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type de commande" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="recharge">Recharge seulement</SelectItem>
                <SelectItem value="bouteille_complete">Bouteille complète</SelectItem>
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

      {/* Tableau des commandes */}
      <div className="koursier-metric-card border-0">
        <h3 className="koursier-stats-label mb-6">
          Commandes de Gaz ({filteredCommandes.length})
        </h3>
        {filteredCommandes.length === 0 ? (
          <div className="koursier-empty-state">
            <IconGasStation className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="koursier-body text-muted-foreground">
              Aucune commande trouvée avec les filtres sélectionnés.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="koursier-data-table">
              <thead>
                <tr>
                  <th className="koursier-label">N° Commande</th>
                  <th className="koursier-label">Client</th>
                  <th className="koursier-label">Contact</th>
                  <th className="koursier-label">Marque</th>
                  <th className="koursier-label">Type</th>
                  <th className="koursier-label">Qté</th>
                  <th className="koursier-label">Prix</th>
                  <th className="koursier-label">Commission</th>
                  <th className="koursier-label">Statut</th>
                  <th className="koursier-label">Livreur</th>
                  <th className="koursier-label">Date commande</th>
                  <th className="koursier-label">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCommandes.map((commande) => (
                  <tr key={commande.id}>
                    <td className="koursier-label font-medium">{commande.numeroCommande}</td>
                    <td>
                      <div>
                        <div className="koursier-label font-medium">{commande.client}</div>
                        <div className="koursier-caption text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          {commande.adresse}
                        </div>
                      </div>
                    </td>
                    <td className="koursier-caption">{commande.telephone}</td>
                    <td>
                      <Badge variant="outline">{commande.marqueGaz}</Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <span>{typeCommandeConfig[commande.typeCommande].icon}</span>
                        <span className="koursier-caption">{typeCommandeConfig[commande.typeCommande].label}</span>
                      </div>
                    </td>
                    <td className="koursier-label text-center">{commande.quantite}</td>
                    <td className="koursier-label font-semibold">{formatCurrency(commande.prix)}</td>
                    <td className="koursier-label font-semibold text-green-600 dark:text-green-400">
                      {formatCurrency(commande.commission)}
                    </td>
                    <td>
                      <Badge className={statutConfig[commande.statut].color}>
                        {statutConfig[commande.statut].label}
                      </Badge>
                    </td>
                    <td className="koursier-caption">
                      {commande.livreur || <span className="text-muted-foreground">-</span>}
                    </td>
                    <td className="koursier-caption text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {formatDate(commande.dateCommande)}
                      </div>
                    </td>
                    <td>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCommande(commande)}
                        title="Voir les détails"
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
        )}

        {/* Pagination */}
        {filteredCommandes.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredCommandes.length}
          />
        )}
      </div>

      {/* Modal de détail de la commande */}
      <GazDetailModal
        open={showDetailModal}
        onOpenChange={handleCloseDetailModal}
        commande={selectedCommande}
      />
    </div>
  );
}