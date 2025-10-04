"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  IconMotorbike,
  IconMapPin,
  IconClock,
  IconPackage,
  IconTrendingUp,
  IconPhone,
  IconMail,
  IconEye,
  IconEdit,
  IconPlus
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
import { getLivreursAsync } from "@/redux/livreurSlice";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LivreurForm } from "@/components/livreur-form";
import { LivreurEditForm } from "@/components/livreur-edit-form";
import { LivreurDetailModal } from "@/components/livreur-detail-modal";

interface Livreur {
  id: number;
  username: string;
  prenom: string;
  telephone: string;
  email: string;
  disponible: boolean;
  zone?: string;
  typeVehicule: string;
  plaqueVehicule?: string;
  note: number;
  totalLivraisons: number;
  totalGains: number;
  gainsDisponibles: number;
  createdAt: string;
  updatedAt: string;
  image?: string;
  statut?: 'actif' | 'inactif' | 'en_livraison' | 'pause';
}

const statutConfig = {
  actif: { label: 'Actif', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' },
  inactif: { label: 'Inactif', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800' },
  en_livraison: { label: 'En livraison', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800' },
  pause: { label: 'En pause', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' }
};

export default function LivreursPage() {
  const dispatch = useDispatch();
  const { livreursList, status, error } = useSelector((state: any) => state.livreur);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [showLivreurForm, setShowLivreurForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLivreur, setSelectedLivreur] = useState<Livreur | null>(null);
  const loading = status === 'loading';
  
  console.log("Livreurs Redux state:", livreursList);
  
  // Extraire le tableau de livreurs depuis la réponse API et s'assurer que c'est un tableau
  const livreursArray = Array.isArray(livreursList?.livreurs) ? livreursList.livreurs : [];
  // Calculer les livreurs filtrés directement depuis Redux
  const filteredLivreurs = livreursArray.filter((livreur: Livreur) => {
    let matchStatut = false;
    if (filterStatut === 'all') {
      matchStatut = true;
    } else if (filterStatut === 'actif') {
      matchStatut = livreur.disponible === true;
    } else if (filterStatut === 'inactif') {
      matchStatut = livreur.disponible === false;
    }
    
    const matchZone = filterZone === 'all' || livreur.zone === filterZone;
    return matchStatut && matchZone;
  }); 


  useEffect(() => {
    console.log('Dispatching getLivreursAsync...');
    dispatch(getLivreursAsync());
  }, [dispatch]);

  // Debug logs
  useEffect(() => {
    console.log('Livreurs Redux state:', { livreursList, status, error });
    console.log('Filtered livreurs count:', filteredLivreurs.length);
  }, [livreursList, status, error]);

  // Recharger la liste après création réussie
  useEffect(() => {
    if (status === 'succeeded' && !showLivreurForm && livreursList) {
      // Recharger les livreurs seulement si nécessaire
      console.log('Rechargement après création réussie');
    }
  }, [status, showLivreurForm]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 0
    }).format(amount) + ' F';
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const calculateStats = () => {
    const total = livreursArray.length;
    const actifs = livreursArray.filter((l: Livreur) => l.disponible === true).length;
    const enLivraison = livreursArray.filter((l: Livreur) => l.statut === 'en_livraison').length;
    const totalLivraisons = livreursArray.reduce((sum: number, l: Livreur) => sum + (l.totalLivraisons || 0), 0);
    const totalCommissions = livreursArray.reduce((sum: number, l: Livreur) => sum + (l.totalGains || 0), 0);

    return { total, actifs, enLivraison, totalLivraisons, totalCommissions };
  };

  const stats = calculateStats();
  const zones = [...new Set(livreursArray.map((l: Livreur) => l.zone).filter(zone => zone))];

  // Fonctions pour gérer les actions
  const handleViewLivreur = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setShowDetailModal(true);
  };

  const handleEditLivreur = (livreur: Livreur) => {
    setSelectedLivreur(livreur);
    setShowEditForm(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLivreur(null);
  };

  const handleCloseEditForm = () => {
    setShowEditForm(false);
    setSelectedLivreur(null);
  };

  // Afficher une erreur si nécessaire
  if (error) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Erreur: {error}</p>
          <Button onClick={() => dispatch(getLivreursAsync())}>Réessayer</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="koursier-stats-card">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="koursier-skeleton h-12 rounded koursier-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="koursier-heading-1">Gestion des Livreurs</h1>
          <p className="koursier-body text-muted-foreground">
            Gérez votre équipe de livreurs et suivez leurs performances
          </p>
        </div>
        <button className="koursier-btn koursier-btn-primary koursier-btn-md" onClick={() => setShowLivreurForm(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Ajouter un livreur
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="koursier-metric-card bg-gradient-to-br from-orange-500/5 to-orange-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <IconMotorbike className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-orange-600">{stats.total}</div>
              <div className="koursier-stats-label text-orange-500/80">Total Livreurs</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <IconPackage className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-green-600">{stats.actifs}</div>
              <div className="koursier-stats-label text-green-500/80">Actifs</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <IconTrendingUp className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-blue-600">{stats.enLivraison}</div>
              <div className="koursier-stats-label text-blue-500/80">En livraison</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <IconPackage className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-purple-600">{stats.totalLivraisons}</div>
              <div className="koursier-stats-label text-purple-500/80">Total Livraisons</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <IconTrendingUp className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-yellow-600">{formatCurrency(stats.totalCommissions)}</div>
              <div className="koursier-stats-label text-yellow-500/80">Total Commissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des livreurs */}
      <div className="koursier-stats-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <h2 className="koursier-heading-3">Livreurs ({filteredLivreurs.length})</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Disponible</SelectItem>
                <SelectItem value="inactif">Indisponible</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterZone} onValueChange={setFilterZone}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les zones</SelectItem>
                {zones.map(zone => (
                  <SelectItem key={zone} value={zone}>{zone}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="koursier-data-table">
            <thead>
              <tr>
                <th>Livreur</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>Zone</th>
                <th>Véhicule</th>
                <th>Note</th>
                <th>Livraisons</th>
                <th>Commission</th>
                <th>Dernière connexion</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLivreurs.map((livreur: Livreur) => (
                <tr key={livreur.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="koursier-avatar">
                        <Avatar>
                          <AvatarImage src={livreur.image} />
                          <AvatarFallback>
                            {livreur.prenom?.[0] || 'L'}{livreur.username?.[0] || 'L'}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <div className="koursier-label font-medium">{livreur.prenom} ({livreur.username})</div>
                        <div className="koursier-caption text-muted-foreground">ID: {livreur.id}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 koursier-caption">
                        <IconPhone className="h-3 w-3" />
                        {livreur.telephone}
                      </div>
                      <div className="flex items-center gap-1 koursier-caption text-muted-foreground">
                        <IconMail className="h-3 w-3" />
                        {livreur.email}
                      </div>
                    </div>
                  </td>
                  <td>
                    <Badge className={livreur.disponible ?
                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800' :
                      'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800'
                    }>
                      {livreur.disponible ? '✅ Disponible' : '🔴 Indisponible'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 koursier-caption">
                      <IconMapPin className="h-3 w-3" />
                      {livreur.zone || 'Non définie'}
                    </div>
                  </td>
                  <td>
                    <div>
                      <div className="koursier-label">{livreur.typeVehicule}</div>
                      {livreur.plaqueVehicule && (
                        <div className="koursier-caption text-muted-foreground">{livreur.plaqueVehicule}</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 koursier-label">
                      ⭐ {(livreur.note || 0).toFixed(1)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1 koursier-label">
                      <IconPackage className="h-3 w-3" />
                      {livreur.totalLivraisons || 0}
                    </div>
                  </td>
                  <td className="koursier-label font-semibold text-green-600">
                    {formatCurrency(livreur.totalGains || 0)}
                  </td>
                  <td className="koursier-caption text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <IconClock className="h-3 w-3" />
                      {formatDate(livreur.updatedAt)}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLivreur(livreur)}
                        className="hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
                        title="Voir les détails"
                      >
                        <IconEye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditLivreur(livreur)}
                        title="Modifier"
                      >
                        <IconEdit className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredLivreurs.length === 0 && !loading && (
            <div className="koursier-empty-state">
              <div className="koursier-empty-icon">
                <IconMotorbike className="h-12 w-12" />
              </div>
              <h3 className="koursier-empty-title">Aucun livreur trouvé</h3>
              <p className="koursier-empty-description">
                {livreursArray.length === 0 ?
                  "Aucun livreur trouvé. Vérifiez votre connexion API ou ajoutez un nouveau livreur." :
                  "Aucun livreur trouvé avec les filtres sélectionnés."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Formulaire de création de livreur */}
      <LivreurForm
        open={showLivreurForm}
        onOpenChange={setShowLivreurForm}
      />

      {/* Modal de détail du livreur */}
      <LivreurDetailModal
        open={showDetailModal}
        onOpenChange={handleCloseDetailModal}
        livreur={selectedLivreur}
      />

      {/* Formulaire d'édition de livreur */}
      <LivreurEditForm
        open={showEditForm}
        onOpenChange={handleCloseEditForm}
        livreur={selectedLivreur}
      />
    </div>
  );
}