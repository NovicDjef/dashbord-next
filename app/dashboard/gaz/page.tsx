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
  statut: 'en_attente' | 'confirme' | 'en_livraison' | 'livre' | 'annule';
  livreur?: string;
  dateCommande: string;
  dateLivraison?: string;
}

const statutConfig = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirme: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  en_livraison: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  livre: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  annule: { label: 'Annulée', color: 'bg-red-100 text-red-800' }
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
  const loading = status === 'loading';

  useEffect(() => {
    dispatch(getGasOrdersAsync());
  }, [dispatch]);

  // Utiliser les données de Redux
  useEffect(() => {
    if (gasOrders && gasOrders.length > 0) {
      setFilteredCommandes(gasOrders);
    }
  }, [gasOrders]);

  useEffect(() => {
    let filtered = gasOrders || [];

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
  }, [gasOrders, filterStatut, filterType, filterPeriod]);

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

  const calculateStats = () => {
    const total = filteredCommandes.length;
    const enAttente = filteredCommandes.filter(c => c.statut === 'en_attente').length;
    const enLivraison = filteredCommandes.filter(c => c.statut === 'en_livraison').length;
    const livrees = filteredCommandes.filter(c => c.statut === 'livre').length;
    const chiffreAffaires = filteredCommandes.reduce((sum, c) => sum + c.prix, 0);
    const commissionsTotal = filteredCommandes.reduce((sum, c) => sum + c.commission, 0);

    return { total, enAttente, enLivraison, livrees, chiffreAffaires, commissionsTotal };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                <div className="h-8 bg-muted rounded w-3/4" />
              </CardHeader>
            </Card>
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IconGasStation className="h-6 w-6" />
            Livraisons de Gaz
          </h1>
          <p className="text-muted-foreground">
            Gérez les commandes et livraisons de bouteilles de gaz
          </p>
        </div>
        <Button>
          <IconDownload className="h-4 w-4 mr-2" />
          Exporter rapport
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
            <div className="text-2xl font-bold text-orange-600">{stats.enLivraison}</div>
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
            <CardTitle className="text-lg">Filtres</CardTitle>
            <IconFilter className="h-5 w-5 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirme">Confirmée</SelectItem>
                <SelectItem value="en_livraison">En livraison</SelectItem>
                <SelectItem value="livre">Livrée</SelectItem>
                <SelectItem value="annule">Annulée</SelectItem>
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
        </CardContent>
      </Card>

      {/* Tableau des commandes */}
      <Card>
        <CardHeader>
          <CardTitle>Commandes de Gaz ({filteredCommandes.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Commande</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Marque</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Qté</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Livreur</TableHead>
                  <TableHead>Date commande</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCommandes.slice(0, 50).map((commande) => (
                  <TableRow key={commande.id}>
                    <TableCell className="font-medium">{commande.numeroCommande}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{commande.client}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          {commande.adresse}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{commande.telephone}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{commande.marqueGaz}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span>{typeCommandeConfig[commande.typeCommande].icon}</span>
                        <span className="text-sm">{typeCommandeConfig[commande.typeCommande].label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{commande.quantite}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(commande.prix)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(commande.commission)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statutConfig[commande.statut].color}>
                        {statutConfig[commande.statut].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {commande.livreur || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {formatDate(commande.dateCommande)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredCommandes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucune commande trouvée avec les filtres sélectionnés.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}