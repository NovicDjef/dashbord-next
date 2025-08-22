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

interface Livreur {
  id: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  statut: 'actif' | 'inactif' | 'en_livraison' | 'pause';
  zone: string;
  vehicule: string;
  note: number;
  livraisons_effectuees: number;
  commission_totale: number;
  derniere_connexion: string;
  photo?: string;
}

const statutConfig = {
  actif: { label: 'Actif', color: 'bg-green-100 text-green-800' },
  inactif: { label: 'Inactif', color: 'bg-gray-100 text-gray-800' },
  en_livraison: { label: 'En livraison', color: 'bg-blue-100 text-blue-800' },
  pause: { label: 'En pause', color: 'bg-yellow-100 text-yellow-800' }
};

export default function LivreursPage() {
  const dispatch = useDispatch();
  const { livreursList, status, error } = useSelector((state: any) => state.livreur);
  const [filterStatut, setFilterStatut] = useState<string>('all');
  const [filterZone, setFilterZone] = useState<string>('all');
  const [filteredLivreurs, setFilteredLivreurs] = useState<Livreur[]>([]);
  const loading = status === 'loading'; 


  useEffect(() => {
    console.log('Dispatching getLivreursAsync...');
    dispatch(getLivreursAsync());
  }, [dispatch]);

  // Debug logs
  useEffect(() => {
    console.log('Livreurs Redux state:', { livreursList, status, error });
  }, [livreursList, status, error]);

  useEffect(() => {
    let filtered = livreursList || [];

    if (filterStatut !== 'all') {
      filtered = filtered.filter(l => l.statut === filterStatut);
    }

    if (filterZone !== 'all') {
      filtered = filtered.filter(l => l.zone === filterZone);
    }

    setFilteredLivreurs(filtered);
  }, [livreursList, filterStatut, filterZone]);

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
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const calculateStats = () => {
    const total = filteredLivreurs.length;
    const actifs = filteredLivreurs.filter(l => l.statut === 'actif').length;
    const enLivraison = filteredLivreurs.filter(l => l.statut === 'en_livraison').length;
    const totalLivraisons = filteredLivreurs.reduce((sum, l) => sum + l.livraisons_effectuees, 0);
    const totalCommissions = filteredLivreurs.reduce((sum, l) => sum + l.commission_totale, 0);

    return { total, actifs, enLivraison, totalLivraisons, totalCommissions };
  };

  const stats = calculateStats();
  const zones = [...new Set((livreursList || []).map(l => l.zone))];

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
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
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
            <IconMotorbike className="h-6 w-6" />
            Gestion des Livreurs
          </h1>
          <p className="text-muted-foreground">
            Gérez votre équipe de livreurs et suivez leurs performances
          </p>
        </div>
        <Button>
          <IconPlus className="h-4 w-4 mr-2" />
          Ajouter un livreur
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Livreurs
            </CardTitle>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Actifs
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{stats.actifs}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En livraison
            </CardTitle>
            <div className="text-2xl font-bold text-blue-600">{stats.enLivraison}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Livraisons
            </CardTitle>
            <div className="text-2xl font-bold">{stats.totalLivraisons}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Commissions Totales
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalCommissions)}</div>
          </CardHeader>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtres</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select value={filterStatut} onValueChange={setFilterStatut}>
              <SelectTrigger>
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="en_livraison">En livraison</SelectItem>
                <SelectItem value="pause">En pause</SelectItem>
                <SelectItem value="inactif">Inactif</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterZone} onValueChange={setFilterZone}>
              <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Tableau des livreurs */}
      <Card>
        <CardHeader>
          <CardTitle>Livreurs ({filteredLivreurs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Livreur</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Véhicule</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Livraisons</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLivreurs.map((livreur) => (
                  <TableRow key={livreur.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={livreur.photo} />
                          <AvatarFallback>
                            {livreur.prenom[0]}{livreur.nom[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{livreur.prenom} {livreur.nom}</div>
                          <div className="text-sm text-muted-foreground">ID: {livreur.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <IconPhone className="h-3 w-3" />
                          {livreur.telephone}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <IconMail className="h-3 w-3" />
                          {livreur.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={statutConfig[livreur.statut].color}>
                        {statutConfig[livreur.statut].label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IconMapPin className="h-3 w-3" />
                        {livreur.zone}
                      </div>
                    </TableCell>
                    <TableCell>{livreur.vehicule}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        ⭐ {livreur.note.toFixed(1)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IconPackage className="h-3 w-3" />
                        {livreur.livraisons_effectuees}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      {formatCurrency(livreur.commission_totale)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <IconClock className="h-3 w-3" />
                        {formatDate(livreur.derniere_connexion)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <IconEdit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredLivreurs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Aucun livreur trouvé avec les filtres sélectionnés.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}