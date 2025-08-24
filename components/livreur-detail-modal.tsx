"use client"

import { 
  IconUser,
  IconMail,
  IconPhone,
  IconMotorbike,
  IconMapPin,
  IconCalendar,
  IconStar,
  IconPackage,
  IconCurrencyEuro,
  IconClock,
  IconX,
  IconToggleRight,
  IconToggleLeft,
  IconId,
  IconWallet,
  IconTrendingUp
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
}

interface LivreurDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  livreur: Livreur | null;
}

export function LivreurDetailModal({ open, onOpenChange, livreur }: LivreurDetailModalProps) {
  if (!livreur) return null;

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

  const formatDateOnly = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusColor = (disponible: boolean) => {
    return disponible 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getNoteColor = (note: number) => {
    if (note >= 4.5) return 'text-green-600';
    if (note >= 4.0) return 'text-blue-600';
    if (note >= 3.5) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={livreur.image} />
              <AvatarFallback className="text-lg">
                {livreur.prenom?.[0]}{livreur.username?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">
                {livreur.prenom} ({livreur.username})
              </div>
              <div className="text-sm text-muted-foreground">
                Détails du livreur
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations complètes du livreur ID #{livreur.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et disponibilité */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Statut général
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Disponibilité :</span>
                <div className="flex items-center gap-2">
                  {livreur.disponible ? (
                    <IconToggleRight className="h-6 w-6 text-green-600" />
                  ) : (
                    <IconToggleLeft className="h-6 w-6 text-gray-400" />
                  )}
                  <Badge className={getStatusColor(livreur.disponible)}>
                    {livreur.disponible ? 'Disponible' : 'Indisponible'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Note moyenne :</span>
                <div className="flex items-center gap-1">
                  <IconStar className={`h-5 w-5 ${getNoteColor(livreur.note)}`} />
                  <span className={`font-bold text-lg ${getNoteColor(livreur.note)}`}>
                    {livreur.note.toFixed(1)}
                  </span>
                  <span className="text-muted-foreground">/5</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconId className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Nom d'utilisateur</div>
                    <div className="font-medium">{livreur.username}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Prénom</div>
                    <div className="font-medium">{livreur.prenom}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                    <div className="font-medium">{livreur.telephone}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{livreur.email || 'Non renseigné'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations véhicule et zone */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconMotorbike className="h-5 w-5" />
                Véhicule et zone
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconMotorbike className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Type de véhicule</div>
                    <div className="font-medium">{livreur.typeVehicule}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconId className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Plaque véhicule</div>
                    <div className="font-medium">{livreur.plaqueVehicule || 'Non renseignée'}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 md:col-span-2">
                  <IconMapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Zone d'activité</div>
                    <div className="font-medium">{livreur.zone || 'Non définie'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Statistiques de performance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconPackage className="h-5 w-5" />
                Performances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconPackage className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {livreur.totalLivraisons}
                  </div>
                  <div className="text-sm text-muted-foreground">Livraisons totales</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconCurrencyEuro className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(livreur.totalGains)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gains totaux</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconWallet className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {formatCurrency(livreur.gainsDisponibles)}
                  </div>
                  <div className="text-sm text-muted-foreground">Gains disponibles</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations temporelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconCalendar className="h-5 w-5" />
                Historique du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Inscrit le</div>
                    <div className="font-medium">{formatDateOnly(livreur.createdAt)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconClock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Dernière mise à jour</div>
                    <div className="font-medium">{formatDate(livreur.updatedAt)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Métriques calculées */}
          {livreur.totalLivraisons > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconTrendingUp className="h-5 w-5" />
                  Métriques
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Gain moyen par livraison</span>
                    <span className="font-bold">
                      {formatCurrency(livreur.totalGains / livreur.totalLivraisons)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm text-muted-foreground">Taux de gains disponibles</span>
                    <span className="font-bold">
                      {((livreur.gainsDisponibles / livreur.totalGains) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <IconX className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}