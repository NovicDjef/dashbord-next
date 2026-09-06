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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getColisAsync } from '@/redux/colisSlice';
import { COLIS_STATUSES, type ColisStatus } from '@/lib/service-status';
import { ColisDetailModal } from "@/components/colis-detail-modal";
import { Pagination } from "@/components/pagination";

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
  // Valeurs de l'enum ColisStatus (prisma/schema.prisma du backend)
  statut: ColisStatus;
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

const statutConfig: Record<ColisStatus, { label: string; color: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' },
  VALIDER: { label: 'Livreur affecté', color: 'bg-violet-100 text-violet-800' },
  ASSIGNEE: { label: 'Livreur affecté', color: 'bg-violet-100 text-violet-800' },
  EN_COURS: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  LIVREE: { label: 'Livré', color: 'bg-green-100 text-green-800' },
  ANNULEE: { label: 'Annulé', color: 'bg-red-100 text-red-800' }
};

export default function ColisPage() {
  const dispatch = useDispatch();
  const { colisList, status, error } = useSelector((state: any) => state.colis);
  const [filteredColis, setFilteredColis] = useState<Colis[]>([]);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedColis, setSelectedColis] = useState<Colis | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;
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
        nom: item.usernamRecive || 'Destinataire inconnu',
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
      // Livreur public inclus par GET /colis : { id, username, prenom, telephone, ... }
      livreur: item.livreur ? {
        id: item.livreur.id?.toString() || '',
        nom: [item.livreur.prenom, item.livreur.username].filter(Boolean).join(' ') || 'Livreur assigné',
        telephone: item.livreur.telephone || ''
      } : undefined,
      dateCreation: item.createdAt || new Date().toISOString(),
      dateLivraison: item.dateLivraison,
      instructions: item.instructions,
      fragile: item.fragile || false,
      valeurDeclaree: item.valeurDeclaree
    }));
  };

  // Le backend renvoie directement une valeur de ColisStatus.
  const mapStatus = (status: string): ColisStatus =>
    COLIS_STATUSES.includes(status as ColisStatus) ? (status as ColisStatus) : 'EN_ATTENTE';

  // Utiliser les données transformées
  useEffect(() => {

    // S'assurer que colisList est un tableau
    const colisArray = Array.isArray(colisList) ? colisList : (colisList?.data || colisList?.colis || []);

    if (Array.isArray(colisArray) && colisArray.length > 0) {
      const transformedData = transformColisData(colisArray);
      setFilteredColis(transformedData);
    } else {
      setFilteredColis([]);
    }
  }, [colisList]);

  useEffect(() => {
    // S'assurer que colisList est un tableau
    const colisArray = Array.isArray(colisList) ? colisList : (colisList?.data || colisList?.colis || []);

    if (!Array.isArray(colisArray)) {
      console.error("colisList n'est pas un tableau:", colisArray);
      setFilteredColis([]);
      return;
    }

    let filtered = colisArray.length > 0 ? transformColisData(colisArray) : [];

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
    setCurrentPage(1); // Réinitialiser à la page 1 quand les filtres changent
  }, [colisList, filterStatut, filterPeriod]);

  // Calcul de la pagination
  const totalPages = Math.ceil(filteredColis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedColis = filteredColis.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} kg`;
    }
    return `${weight} g`;
  };

  const calculateStats = () => {
    const total = filteredColis.length;
    const enAttente = filteredColis.filter(c => c.statut === 'EN_ATTENTE').length;
    const enTransit = filteredColis.filter(c => c.statut === 'EN_COURS').length;
    const livres = filteredColis.filter(c => c.statut === 'LIVREE').length;
    const chiffreAffaires = filteredColis.reduce((sum, c) => sum + c.prix, 0);
    const commissionsTotal = filteredColis.reduce((sum, c) => sum + c.commission, 0);
    const poidsTotal = filteredColis.reduce((sum, c) => sum + c.poids, 0);

    return { total, enAttente, enTransit, livres, chiffreAffaires, commissionsTotal, poidsTotal };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => (
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
            <IconPackage className="h-7 w-7" />
            Gestion des Colis
          </h1>
          <p className="koursier-body text-muted-foreground">
            Gérez les envois et livraisons de colis
          </p>
        </div>
        <Button className="koursier-btn-primary">
          <IconDownload className="h-4 w-4 mr-2" />
          Exporter rapport
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10 border-0">
          <div className="koursier-stats-label text-blue-600 dark:text-blue-400">
            Total Colis
          </div>
          <div className="koursier-stats-value text-blue-600 dark:text-blue-400">{stats.total}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10 border-0">
          <div className="koursier-stats-label text-yellow-600 dark:text-yellow-400">
            En attente
          </div>
          <div className="koursier-stats-value text-yellow-600 dark:text-yellow-400">{stats.enAttente}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10 border-0">
          <div className="koursier-stats-label text-purple-600 dark:text-purple-400">
            En transit
          </div>
          <div className="koursier-stats-value text-purple-600 dark:text-purple-400">{stats.enTransit}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10 border-0">
          <div className="koursier-stats-label text-green-600 dark:text-green-400">
            Livrés
          </div>
          <div className="koursier-stats-value text-green-600 dark:text-green-400">{stats.livres}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-cyan-500/5 to-cyan-600/10 border-0">
          <div className="koursier-stats-label text-cyan-600 dark:text-cyan-400">
            Chiffre d'affaires
          </div>
          <div className="koursier-stats-value text-cyan-600 dark:text-cyan-400">{formatCurrency(stats.chiffreAffaires)}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-emerald-500/5 to-emerald-600/10 border-0">
          <div className="koursier-stats-label text-emerald-600 dark:text-emerald-400">
            Commissions
          </div>
          <div className="koursier-stats-value text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.commissionsTotal)}</div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-indigo-500/5 to-indigo-600/10 border-0">
          <div className="koursier-stats-label text-indigo-600 dark:text-indigo-400">
            Poids Total
          </div>
          <div className="koursier-stats-value text-indigo-600 dark:text-indigo-400">{formatWeight(stats.poidsTotal)}</div>
        </div>
      </div>

      {/* Filtres */}
      <div className="koursier-metric-card bg-gradient-to-br from-slate-500/5 to-slate-600/10 border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="koursier-label text-slate-600 dark:text-slate-400">Filtres</h3>
          <IconFilter className="h-5 w-5 text-slate-600 dark:text-slate-400" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select value={filterStatut} onValueChange={setFilterStatut}>
            <SelectTrigger>
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {COLIS_STATUSES.map((st) => (
                <SelectItem key={st} value={st}>{statutConfig[st].label}</SelectItem>
              ))}
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

      {/* Tableau des colis */}
      <div className="koursier-data-table">
        <div className="mb-4">
          <h3 className="koursier-label">Colis ({filteredColis.length})</h3>
        </div>

        {filteredColis.length === 0 && !loading ? (
          <div className="koursier-empty-state">
            <IconPackage className="h-12 w-12 mb-4 text-muted-foreground" />
            <p className="koursier-body text-muted-foreground">
              {colisList && colisList.length === 0 ?
                "Aucun colis trouvé. Vérifiez votre connexion API." :
                "Aucun colis trouvé avec les filtres sélectionnés."
              }
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th className="koursier-label">N° Colis</th>
                    <th className="koursier-label">Expéditeur</th>
                    <th className="koursier-label">Destinataire</th>
                    <th className="koursier-label">Description</th>
                    <th className="koursier-label">Poids</th>
                    <th className="koursier-label">Prix</th>
                    <th className="koursier-label">Commission</th>
                    <th className="koursier-label">Statut</th>
                    <th className="koursier-label">Livreur</th>
                    <th className="koursier-label">Date création</th>
                    <th className="koursier-label">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedColis.map((colis) => (
                    <tr key={colis.id}>
                      <td className="koursier-body font-medium">{colis.numeroColis}</td>
                      <td>
                        <div>
                          <div className="koursier-body font-medium">{colis.expediteur.nom}</div>
                          <div className="koursier-caption text-muted-foreground">{colis.expediteur.telephone}</div>
                          <div className="koursier-caption text-muted-foreground flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {colis.expediteur.adresse}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="koursier-body font-medium">{colis.destinataire.nom}</div>
                          <div className="koursier-caption text-muted-foreground">{colis.destinataire.telephone}</div>
                          <div className="koursier-caption text-muted-foreground flex items-center gap-1">
                            <IconMapPin className="h-3 w-3" />
                            {colis.destinataire.adresse}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="max-w-[180px] truncate koursier-body">
                          {colis.description}
                          {colis.fragile && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              FRAGILE
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-1 koursier-body">
                          <IconWeight className="h-3 w-3" />
                          {formatWeight(colis.poids)}
                        </div>
                      </td>
                      <td className="koursier-body font-semibold">{formatCurrency(colis.prix)}</td>
                      <td className="koursier-body font-semibold text-green-600">
                        {formatCurrency(colis.commission)}
                      </td>
                      <td>
                        <Badge className={statutConfig[colis.statut].color}>
                          {statutConfig[colis.statut].label}
                        </Badge>
                      </td>
                      <td>
                        {colis.livreur ? (
                          <div>
                            <div className="koursier-body font-medium">{colis.livreur.nom}</div>
                            <div className="koursier-caption text-muted-foreground">{colis.livreur.telephone}</div>
                          </div>
                        ) : (
                          <span className="koursier-caption text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="koursier-caption text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <IconClock className="h-3 w-3" />
                          {formatDate(colis.dateCreation)}
                        </div>
                      </td>
                      <td>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewColis(colis)}
                          title="Voir les détails"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredColis.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                totalItems={filteredColis.length}
              />
            )}
          </>
        )}
      </div>

      {/* Modal de détail du colis */}
      <ColisDetailModal
        open={showDetailModal}
        onOpenChange={handleCloseDetailModal}
        colis={selectedColis}
      />
    </div>
  );
}
