"use client"

import { 
  IconPackage,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCurrencyEuro,
  IconClock,
  IconX,
  IconTruck,
  IconId,
  IconInfoCircle,
  IconReceipt,
  IconMotorbike,
  IconWeight,
  IconRuler
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

interface ColisDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  colis: Colis | null;
}

const statutConfig = {
  en_attente: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '⏳' },
  confirme: { label: 'Confirmé', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '✅' },
  collecte: { label: 'En collecte', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '📥' },
  en_transit: { label: 'En transit', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200', icon: '🚛' },
  en_livraison: { label: 'En livraison', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🚚' },
  livre: { label: 'Livré', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '📦' },
  annule: { label: 'Annulé', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '❌' }
};

export function ColisDetailModal({ open, onOpenChange, colis }: ColisDetailModalProps) {
  if (!colis) return null;

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

  const calculateVolume = () => {
    if (!colis.dimensions) return null;
    const { longueur, largeur, hauteur } = colis.dimensions;
    return (longueur * largeur * hauteur / 1000000).toFixed(3); // m³
  };

  const calculateMargin = () => {
    return ((colis.commission / colis.prix) * 100).toFixed(1);
  };

  const formatWeight = (weight: number) => {
    if (weight >= 1000) {
      return `${(weight / 1000).toFixed(1)} kg`;
    }
    return `${weight} g`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <IconPackage className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">
                Colis {colis.numeroColis}
              </div>
              <div className="text-sm text-muted-foreground">
                Détails de l'envoi de colis
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations complètes du colis ID #{colis.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconInfoCircle className="h-5 w-5" />
                Statut du colis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Statut actuel :</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{statutConfig[colis.statut].icon}</span>
                  <Badge className={statutConfig[colis.statut].color}>
                    {statutConfig[colis.statut].label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Date de création :</span>
                <div className="flex items-center gap-1">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(colis.dateCreation)}</span>
                </div>
              </div>

              {colis.dateLivraison && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Date de livraison :</span>
                  <div className="flex items-center gap-1">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(colis.dateLivraison)}</span>
                  </div>
                </div>
              )}

              {colis.fragile && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Colis fragile :</span>
                  <Badge variant="destructive">⚠️ FRAGILE</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations expéditeur et destinataire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Expéditeur */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconUser className="h-5 w-5" />
                  Expéditeur
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Nom</div>
                    <div className="font-medium">{colis.expediteur.nom}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                    <div className="font-medium">{colis.expediteur.telephone}</div>
                  </div>
                </div>

                {colis.expediteur.email && (
                  <div className="flex items-center gap-3">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium text-sm">{colis.expediteur.email}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <IconMapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Adresse</div>
                    <div className="font-medium text-sm">{colis.expediteur.adresse}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Destinataire */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconMapPin className="h-5 w-5" />
                  Destinataire
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Nom</div>
                    <div className="font-medium">{colis.destinataire.nom}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                    <div className="font-medium">{colis.destinataire.telephone}</div>
                  </div>
                </div>

                {colis.destinataire.email && (
                  <div className="flex items-center gap-3">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Email</div>
                      <div className="font-medium text-sm">{colis.destinataire.email}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <IconMapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Adresse</div>
                    <div className="font-medium text-sm">{colis.destinataire.adresse}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Détails du colis */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconPackage className="h-5 w-5" />
                Détails du colis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <IconInfoCircle className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Description</div>
                    <div className="font-medium">{colis.description}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconWeight className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Poids</div>
                    <div className="font-medium">{formatWeight(colis.poids)}</div>
                  </div>
                </div>

                {colis.valeurDeclaree && (
                  <div className="flex items-center gap-3">
                    <IconCurrencyEuro className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Valeur déclarée</div>
                      <div className="font-medium">{formatCurrency(colis.valeurDeclaree)}</div>
                    </div>
                  </div>
                )}
              </div>

              {colis.dimensions && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <IconRuler className="h-4 w-4" />
                    <span className="font-medium">Dimensions</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <div className="text-muted-foreground">Longueur</div>
                      <div className="font-medium">{colis.dimensions.longueur} cm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Largeur</div>
                      <div className="font-medium">{colis.dimensions.largeur} cm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Hauteur</div>
                      <div className="font-medium">{colis.dimensions.hauteur} cm</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Volume</div>
                      <div className="font-medium">{calculateVolume()} m³</div>
                    </div>
                  </div>
                </div>
              )}

              {colis.instructions && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <IconInfoCircle className="h-4 w-4" />
                    <span className="font-medium">Instructions spéciales</span>
                  </div>
                  <div className="text-sm">{colis.instructions}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations financières */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconReceipt className="h-5 w-5" />
                Informations financières
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconCurrencyEuro className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(colis.prix)}
                  </div>
                  <div className="text-sm text-muted-foreground">Prix total</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconCurrencyEuro className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(colis.commission)}
                  </div>
                  <div className="text-sm text-muted-foreground">Commission</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconCurrencyEuro className="h-6 w-6 text-orange-600" />
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {calculateMargin()}%
                  </div>
                  <div className="text-sm text-muted-foreground">Marge</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Livreur assigné */}
          {colis.livreur && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconMotorbike className="h-5 w-5" />
                  Livreur assigné
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-full">
                    <IconMotorbike className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{colis.livreur.nom}</div>
                    <div className="text-sm text-muted-foreground">{colis.livreur.telephone}</div>
                    <div className="text-xs text-muted-foreground">ID: {colis.livreur.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {colis.statut === 'en_livraison' ? 'En cours de livraison' : 
                       colis.statut === 'collecte' ? 'En collecte' : 'Assigné'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métriques calculées */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconId className="h-5 w-5" />
                Informations de suivi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">ID de colis</span>
                  <span className="font-bold font-mono">{colis.id}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Coût par kg</span>
                  <span className="font-bold">
                    {formatCurrency((colis.prix / (colis.poids / 1000)))}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Commission par kg</span>
                  <span className="font-bold">
                    {formatCurrency((colis.commission / (colis.poids / 1000)))}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Prix client</span>
                  <span className="font-bold">
                    {formatCurrency(colis.prix - colis.commission)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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