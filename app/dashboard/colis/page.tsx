"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  IconPackage,
  IconTrendingUp,
  IconWeight,
  IconMapPin,
  IconEye,
  IconDownload,
  IconFilter,
  IconClock
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
import { getColisAsync } from '@/redux/colisSlice';
import { ColisDetailModal } from "@/components/colis-detail-modal";

interface Colis {
  id: string;
  numeroColis: string;
  expediteur: {
    nom: string;
    telephone: string;
    adresse: string;
    email?: string;
  };
  destinataire: {
    nom: string;
    telephone: string;
    adresse: string;
    email?: string;
  };
  description: string;
  poids: number;
  dimensions?: {
    longueur: number;
    largeur: number;
    hauteur: number;
  };
  prix: number;
  commission: number;
  statut: 'en_attente' | 'confirme' | 'collecte' | 'en_transit' | 'en_livraison' | 'livre' | 'annule';
  livreur?: {
    id: string;
    nom: string;
    telephone: string;
  };
  dateCreation: string;
  dateLivraison?: string;
  instructions?: string;
  fragile: boolean;
  valeurDeclaree?: number;
}

const statutConfig = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  confirme: { label: 'Confirmé', color: 'bg-blue-100 text-blue-800' },
  collecte: { label: 'En collecte', color: 'bg-purple-100 text-purple-800' },
  en_transit: { label: 'En transit', color: 'bg-indigo-100 text-indigo-800' },
  en_livraison: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  livre: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  annule: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
};

export default function ColisPage() {
  const dispatch = useDispatch();
  const { colisList, status, error } = useSelector((state: any) => state.colis);
  const [filteredColis, setFilteredColis] = useState<Colis[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const loading = status === 'loading';

  useEffect(() => {
    dispatch(getColisAsync());
  }, [dispatch]);

  // Transformer les données de l'API en format attendu par le modal
  const transformColisData = (colisList: any[]): Colis[] => {
    return colisList.map((item: any) => ({
      id: item.id?.toString() || '',
      numeroColis: `COL${String(item.id || '0000').padStart(4, '0')}`,
      expediteur: {
        nom: item.usernameSend || 'Expéditeur inconnu',
        telephone: item.phoneSend || '',
        adresse: item.adresseDepart || '',
        email: item.emailSend
      },
      destinataire: {
        nom: item.usernameRecive || 'Destinataire inconnu',
        telephone: item.phoneRecive || '',
        adresse: item.adresseArrivee || '',
        email: item.emailRecive
      },
      description: item.description || '',
      poids: parseFloat(item.poids) || 0,
      dimensions: item.dimensions ? {
        longueur: item.dimensions.longueur || 0,
        largeur: item.dimensions.largeur || 0,
        hauteur: item.dimensions.hauteur || 0,
      } : undefined,
      prix: parseFloat(item.prix) || 0,
      commission: (parseFloat(item.prix) || 0) * 0.15, // 15% de commission
      statut: mapStatus(item.status),
      livreur: item.livreur ? {
        id: item.livreur.id?.toString() || '',
        nom: item.livreur.nom || 'Livreur assigné',
        telephone: item.livreur.telephone || ''
      } : undefined,
      dateCreation: item.createdAt || new Date().toISOString(),
      dateLivraison: item.dateLivraison,
      instructions: item.instructions,
      fragile: item.fragile || false,
      valeurDeclaree: item.valeurDeclaree
    }));
  };

  // Mapper les statuts
  const mapStatus = (status: string): Colis['statut'] => {
    const statusMap: { [key: string]: Colis['statut'] } = {
      'pending': 'en_attente',
      'en_attente': 'en_attente',
      'confirmed': 'confirme',
      'confirme': 'confirme',
      'pickup': 'collecte',
      'collecte': 'collecte',
      'transit': 'en_transit',
      'en_transit': 'en_transit',
      'shipping': 'en_livraison',
      'en_livraison': 'en_livraison',
      'delivered': 'livre',
      'livre': 'livre',
      'cancelled': 'annule',
      'annule': 'annule',
      'Done': 'livre'
    };
    
    return statusMap[status?.toLowerCase()] || 'en_attente';
  };

  // Utiliser les données transformées
  useEffect(() => {
    if (colisList && colisList.length > 0) {
      const transformedData = transformColisData(colisList);
      setFilteredColis(transformedData);
    }
  }, [colisList]);

  useEffect(() => {
    let filtered = colisList ? transformColisData(colisList) : [];

    if (filterStatut !== 'all') {
      filtered = filtered.filter(c => c.statut === filterStatut);
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
      
      filtered = filtered.filter(c => new Date(c.dateCreation) >= filterDate);
    }

    setFilteredColis(filtered);
  }, [colisList, filterStatut, filterPeriod]);

  // Fonctions pour gérer les actions
  const handleViewColis = (colis: Colis) => {
    setSelectedColis(colis);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedColis(null);
  };

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={() => dispatch(getColisAsync())}>Réessayer</Button>
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

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} kg`;
    }
    return `${weight} g`;
  };

  const calculateStats = () => {
    const total = filteredColis.length;
    const enAttente = filteredColis.filter(c => c.statut === 'en_attente').length;
    const enTransit = filteredColis.filter(c => c.statut === 'en_transit').length;
    const livres = filteredColis.filter(c => c.statut === 'livre').length;
    const chiffreAffaires = filteredColis.reduce((sum, c) => sum + c.prix, 0);
    const commissionsTotal = filteredColis.reduce((sum, c) => sum + c.commission, 0);
    const poidsTotal = filteredColis.reduce((sum, c) => sum + c.poids, 0);

    return { total, enAttente, enTransit, livres, chiffreAffaires, commissionsTotal, poidsTotal };
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
            <IconPackage className="h-6 w-6" />
            Gestion des Colis
          </h1>
          <p className="text-muted-foreground">
            Gérez les envois et livraisons de colis
          </p>
        </div>
        <Button>
          <IconDownload className="h-4 w-4 mr-2" />
          Exporter rapport
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Colis
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
              En transit
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">{stats.enTransit}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Livrés
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.livres}</div>
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
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Poids Total
            </CardTitle>
            <div className="text-xl font-bold text-purple-600">{formatWeight(stats.poidsTotal)}</div>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="en_attente">En attente</SelectItem>
                <SelectItem value="confirme">Confirmé</SelectItem>
                <SelectItem value="collecte">En collecte</SelectItem>
                <SelectItem value="en_transit">En transit</SelectItem>
                <SelectItem value="en_livraison">En livraison</SelectItem>
                <SelectItem value="livre">Livré</SelectItem>
                <SelectItem value="annule">Annulé</SelectItem>
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

      {/* Tableau des colis */}
      <Card>
        <CardHeader>
          <CardTitle>Colis ({filteredColis.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Colis</TableHead>
                  <TableHead>Expéditeur</TableHead>
                  <TableHead>Destinataire</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Poids</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Livreur</TableHead>
                  <TableHead>Date création</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColis.slice(0, 50).map((colis) => (
                  <TableRow key={colis.id}>
                    <TableCell className="font-medium">{colis.numeroColis}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{colis.expediteur.nom}</div>
                        <div className="text-sm text-muted-foreground">{colis.expediteur.telephone}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          {colis.expediteur.adresse}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{colis.destinataire.nom}</div>
                        <div className="text-sm text-muted-foreground">{colis.destinataire.telephone}</div>
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <IconMapPin className="h-3 w-3" />
                          {colis.destinataire.adresse}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[180px] truncate">
                        {colis.description}
                        {colis.fragile && (
                          <Badge variant="destructive" className="ml-2 text-xs">
                            FRAGILE
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IconWeight className="h-3 w-3" />
                        {formatWeight(colis.poids)}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{formatCurrency(colis.prix)}</TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(colis.commission)}
                    </TableCell>
                    <TableCell>
                      <Badge className={statutConfig[colis.statut].color}>
                        {statutConfig[colis.statut].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {colis.livreur ? (
                        <div>
                          <div className="font-medium">{colis.livreur.nom}</div>
                          <div className="text-sm text-muted-foreground">{colis.livreur.telephone}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {formatDate(colis.dateCreation)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewColis(colis)}
                        title="Voir les détails"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredColis.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              {colisList && colisList.length === 0 ? 
                "Aucun colis trouvé. Vérifiez votre connexion API." : 
                "Aucun colis trouvé avec les filtres sélectionnés."
              }
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail du colis */}
      <ColisDetailModal
        open={showDetailModal}
        onOpenChange={handleCloseDetailModal}
        colis={selectedColis}
      />
    </div>
  );
}
