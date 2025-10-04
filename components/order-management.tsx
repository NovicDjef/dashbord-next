"use client"

import { useState, useEffect } from "react";
import {
  IconEdit,
  IconEye,
  IconClock,
  IconTruck,
  IconCheck,
  IconX,
  IconRefresh,
  IconFilter,
  IconSearch,
  IconMapPin,
  IconPhone,
  IconUser,
  IconShoppingCart
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/pagination";

interface Order {
  id: string;
  numeroCommande: string;
  type: 'repas' | 'colis' | 'gaz';
  client: {
    id: string;
    nom: string;
    telephone: string;
    adresse: string;
  };
  montant: number;
  commission: number;
  statut: 'en_attente' | 'confirmee' | 'preparee' | 'en_livraison' | 'livree' | 'annulee';
  dateCommande: string;
  dateLivraison?: string;
  livreur?: {
    id: string;
    nom: string;
    telephone: string;
  };
  restaurant?: {
    id: string;
    nom: string;
    adresse: string;
  };
  details: any;
  notes?: string;
}

const statutsConfig = {
  en_attente: {
    label: 'En attente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: IconClock,
    nextStatuts: ['confirmee', 'annulee']
  },
  confirmee: {
    label: 'Confirmée',
    color: 'bg-blue-100 text-blue-800',
    icon: IconCheck,
    nextStatuts: ['preparee', 'annulee']
  },
  preparee: {
    label: 'Préparée',
    color: 'bg-orange-100 text-orange-800',
    icon: IconClock,
    nextStatuts: ['en_livraison', 'annulee']
  },
  en_livraison: {
    label: 'En livraison',
    color: 'bg-purple-100 text-purple-800',
    icon: IconTruck,
    nextStatuts: ['livree']
  },
  livree: {
    label: 'Livrée',
    color: 'bg-green-100 text-green-800',
    icon: IconCheck,
    nextStatuts: []
  },
  annulee: {
    label: 'Annulée',
    color: 'bg-red-100 text-red-800',
    icon: IconX,
    nextStatuts: []
  }
};

const typeConfig = {
  repas: { label: 'Repas', color: 'bg-orange-100 text-orange-800', icon: '🍽️' },
  colis: { label: 'Colis', color: 'bg-blue-100 text-blue-800', icon: '📦' },
  gaz: { label: 'Gaz', color: 'bg-green-100 text-green-800', icon: '⛽' }
};

interface OrderManagementProps {
  orders?: Order[];
  onOrderUpdate?: (orderId: string, newStatus: string, notes?: string) => Promise<void>;
  onRefresh?: () => Promise<void>;
}

export function OrderManagement({ orders = [], onOrderUpdate, onRefresh }: OrderManagementProps) {
  const [filteredOrders, setFilteredOrders] = useState<Order[]>(orders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [statusNotes, setStatusNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    setFilteredOrders(orders);
  }, [orders]);

  useEffect(() => {
    let filtered = orders;

    // Filtrer par recherche
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.numeroCommande.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.client.telephone.includes(searchTerm) ||
        order.restaurant?.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par type
    if (filterType !== "all") {
      filtered = filtered.filter(order => order.type === filterType);
    }

    // Filtrer par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(order => order.statut === filterStatus);
    }

    setFilteredOrders(filtered);
    setCurrentPage(1); // Réinitialiser à la page 1 quand les filtres changent
  }, [searchTerm, filterType, filterStatus, orders]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStatusChange = async () => {
    if (!selectedOrder || !newStatus || !onOrderUpdate) return;

    try {
      setUpdating(true);
      await onOrderUpdate(selectedOrder.id, newStatus, statusNotes);
      
      // Fermer le dialog
      setStatusDialogOpen(false);
      setNewStatus("");
      setStatusNotes("");
      setSelectedOrder(null);
      
      // Rafraîchir les données
      if (onRefresh) {
        await onRefresh();
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut:", error);
    } finally {
      setUpdating(false);
    }
  };

  const openStatusDialog = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus("");
    setStatusNotes(order.notes || "");
    setStatusDialogOpen(true);
  };

  const openDetailsDialog = (order: Order) => {
    setSelectedOrder(order);
    setDetailsDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(amount) + ' F';
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const calculateStats = () => {
    const total = filteredOrders.length;
    const enAttente = filteredOrders.filter(o => o.statut === 'en_attente').length;
    const enLivraison = filteredOrders.filter(o => o.statut === 'en_livraison').length;
    const livrees = filteredOrders.filter(o => o.statut === 'livree').length;
    const chiffreAffaires = filteredOrders.reduce((sum, o) => sum + o.montant, 0);
    const commissionsTotal = filteredOrders.reduce((sum, o) => sum + o.commission, 0);

    return { total, enAttente, enLivraison, livrees, chiffreAffaires, commissionsTotal };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="koursier-metric-card bg-gradient-to-br from-indigo-500/5 to-indigo-600/10">
          <div className="koursier-stats-label text-indigo-600 dark:text-indigo-400">
            Total Commandes
          </div>
          <div className="koursier-stats-value text-indigo-600 dark:text-indigo-400">{stats.total}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10">
          <div className="koursier-stats-label text-yellow-600 dark:text-yellow-400">
            En attente
          </div>
          <div className="koursier-stats-value text-yellow-600 dark:text-yellow-400">{stats.enAttente}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
          <div className="koursier-stats-label text-purple-600 dark:text-purple-400">
            En livraison
          </div>
          <div className="koursier-stats-value text-purple-600 dark:text-purple-400">{stats.enLivraison}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
          <div className="koursier-stats-label text-green-600 dark:text-green-400">
            Livrées
          </div>
          <div className="koursier-stats-value text-green-600 dark:text-green-400">{stats.livrees}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-cyan-500/5 to-cyan-600/10">
          <div className="koursier-stats-label text-cyan-600 dark:text-cyan-400">
            Chiffre d'affaires
          </div>
          <div className="koursier-stats-value text-xl text-cyan-600 dark:text-cyan-400">{formatCurrency(stats.chiffreAffaires)}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-emerald-500/5 to-emerald-600/10">
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
            Filtres et Recherche
          </h3>
          {onRefresh && (
            <Button variant="outline" onClick={onRefresh} className="koursier-btn">
              <IconRefresh className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <IconSearch className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="N° commande, client, restaurant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Type de service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="repas">Repas</SelectItem>
              <SelectItem value="colis">Colis</SelectItem>
              <SelectItem value="gaz">Gaz</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="en_attente">En attente</SelectItem>
              <SelectItem value="confirmee">Confirmée</SelectItem>
              <SelectItem value="preparee">Préparée</SelectItem>
              <SelectItem value="en_livraison">En livraison</SelectItem>
              <SelectItem value="livree">Livrée</SelectItem>
              <SelectItem value="annulee">Annulée</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center koursier-caption text-muted-foreground">
            {filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Tableau des commandes */}
      <div className="koursier-metric-card border-0">
        <h3 className="koursier-stats-label mb-6">
          Commandes ({filteredOrders.length})
        </h3>
        {filteredOrders.length === 0 ? (
          <div className="koursier-empty-state">
            <IconShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="koursier-body text-muted-foreground">
              {searchTerm || filterType !== "all" || filterStatus !== "all"
                ? "Aucune commande trouvée avec les filtres sélectionnés."
                : "Aucune commande enregistrée."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="koursier-data-table">
              <thead>
                <tr>
                  <th className="koursier-label">N° Commande</th>
                  <th className="koursier-label">Type</th>
                  <th className="koursier-label">Client</th>
                  <th className="koursier-label">Restaurant/Service</th>
                  <th className="koursier-label">Montant</th>
                  <th className="koursier-label">Commission</th>
                  <th className="koursier-label">Statut</th>
                  <th className="koursier-label">Livreur</th>
                  <th className="koursier-label">Date</th>
                  <th className="koursier-label">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order) => {
                  const StatusIcon = statutsConfig[order.statut].icon;
                  const typeInfo = typeConfig[order.type];

                  return (
                    <tr key={order.id}>
                      <td className="koursier-label font-medium">
                        {order.numeroCommande}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <span>{typeInfo.icon}</span>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="koursier-label font-medium">{order.client.nom}</div>
                          <div className="koursier-caption text-muted-foreground flex items-center gap-1">
                            <IconPhone className="h-3 w-3" />
                            {order.client.telephone}
                          </div>
                        </div>
                      </td>
                      <td>
                        {order.restaurant ? (
                          <div>
                            <div className="koursier-label font-medium">{order.restaurant.nom}</div>
                            <div className="koursier-caption text-muted-foreground flex items-center gap-1">
                              <IconMapPin className="h-3 w-3" />
                              {order.restaurant.adresse}
                            </div>
                          </div>
                        ) : (
                          <span className="koursier-caption text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="koursier-label font-semibold">
                        {formatCurrency(order.montant)}
                      </td>
                      <td className="koursier-label font-semibold text-green-600 dark:text-green-400">
                        {formatCurrency(order.commission)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statutsConfig[order.statut].color}>
                            {statutsConfig[order.statut].label}
                          </Badge>
                        </div>
                      </td>
                      <td>
                        {order.livreur ? (
                          <div>
                            <div className="koursier-label font-medium">{order.livreur.nom}</div>
                            <div className="koursier-caption text-muted-foreground">
                              {order.livreur.telephone}
                            </div>
                          </div>
                        ) : (
                          <span className="koursier-caption text-muted-foreground">Non assigné</span>
                        )}
                      </td>
                      <td className="koursier-caption text-muted-foreground">
                        {formatDate(order.dateCommande)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDetailsDialog(order)}
                            className="koursier-btn"
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                          {statutsConfig[order.statut].nextStatuts.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openStatusDialog(order)}
                              className="koursier-btn"
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredOrders.length}
          />
        )}
      </div>

      {/* Dialog de changement de statut */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le statut de la commande</DialogTitle>
            <DialogDescription>
              Commande: {selectedOrder?.numeroCommande}
              <br />
              Client: {selectedOrder?.client.nom}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="status">Nouveau statut</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un statut" />
                </SelectTrigger>
                <SelectContent>
                  {selectedOrder && statutsConfig[selectedOrder.statut].nextStatuts.map((status) => (
                    <SelectItem key={status} value={status}>
                      {statutsConfig[status as keyof typeof statutsConfig].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
                placeholder="Ajouter des notes sur cette modification..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleStatusChange} 
              disabled={!newStatus || updating}
            >
              {updating ? "Modification..." : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog des détails */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Détails de la commande</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">N° Commande</Label>
                  <p>{selectedOrder.numeroCommande}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <p>{typeConfig[selectedOrder.type].label}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p>{selectedOrder.client.nom}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.client.telephone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Adresse</Label>
                  <p>{selectedOrder.client.adresse}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Montant</Label>
                  <p className="font-semibold">{formatCurrency(selectedOrder.montant)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Commission</Label>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedOrder.commission)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Date commande</Label>
                  <p>{formatDate(selectedOrder.dateCommande)}</p>
                </div>
                {selectedOrder.dateLivraison && (
                  <div>
                    <Label className="text-sm font-medium">Date livraison</Label>
                    <p>{formatDate(selectedOrder.dateLivraison)}</p>
                  </div>
                )}
              </div>

              {selectedOrder.notes && (
                <div>
                  <Label className="text-sm font-medium">Notes</Label>
                  <p className="bg-muted p-3 rounded-lg">{selectedOrder.notes}</p>
                </div>
              )}

              {selectedOrder.details && (
                <div>
                  <Label className="text-sm font-medium">Détails supplémentaires</Label>
                  <pre className="bg-muted p-3 rounded-lg text-sm overflow-x-auto">
                    {JSON.stringify(selectedOrder.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setDetailsDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}