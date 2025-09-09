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
  IconUser
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
  }, [searchTerm, filterType, filterStatus, orders]);

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
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0
    }).format(amount);
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Commandes
            </CardTitle>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
            <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En livraison
            </CardTitle>
            <div className="text-2xl font-bold text-purple-600">{stats.enLivraison}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Livrées
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.livrees}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Chiffre d'affaires
            </CardTitle>
            <div className="text-xl font-bold text-blue-600">{formatCurrency(stats.chiffreAffaires)}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commissions
            </CardTitle>
            <div className="text-xl font-bold text-green-600">{formatCurrency(stats.commissionsTotal)}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filtres et Recherche</CardTitle>
            {onRefresh && (
              <Button variant="outline" onClick={onRefresh}>
                <IconRefresh className="h-4 w-4 mr-2" />
                Actualiser
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
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

            <div className="flex items-center text-sm text-muted-foreground">
              {filteredOrders.length} résultat{filteredOrders.length > 1 ? 's' : ''}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Restaurant/Service</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Livreur</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const StatusIcon = statutsConfig[order.statut].icon;
                  const typeInfo = typeConfig[order.type];
                  
                  return (
                    <TableRow key={order.id} className="Koursier-table-row">
                      <TableCell className="font-medium">
                        {order.numeroCommande}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{typeInfo.icon}</span>
                          <Badge className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.client.nom}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            <IconPhone className="h-3 w-3" />
                            {order.client.telephone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.restaurant ? (
                          <div>
                            <div className="font-medium">{order.restaurant.nom}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <IconMapPin className="h-3 w-3" />
                              {order.restaurant.adresse}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(order.montant)}
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">
                        {formatCurrency(order.commission)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge className={statutsConfig[order.statut].color}>
                            {statutsConfig[order.statut].label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {order.livreur ? (
                          <div>
                            <div className="font-medium">{order.livreur.nom}</div>
                            <div className="text-sm text-muted-foreground">
                              {order.livreur.telephone}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Non assigné</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(order.dateCommande)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDetailsDialog(order)}
                          >
                            <IconEye className="h-4 w-4" />
                          </Button>
                          {statutsConfig[order.statut].nextStatuts.length > 0 && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openStatusDialog(order)}
                            >
                              <IconEdit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterType !== "all" || filterStatus !== "all" 
                ? "Aucune commande trouvée avec les filtres sélectionnés."
                : "Aucune commande enregistrée."
              }
            </div>
          )}
        </CardContent>
      </Card>

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