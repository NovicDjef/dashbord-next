"use client"

import { 
  IconGasStation,
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconPackage,
  IconCoin,
  IconClock,
  IconX,
  IconTruck,
  IconId,
  IconInfoCircle,
  IconReceipt,
  IconMotorbike
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
import { type GasOrderStatus } from "@/lib/service-status";

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
  statut: GasOrderStatus;
  livreur?: string;
  dateCommande: string;
  dateLivraison?: string;
}

interface GazDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  commande: CommandeGaz | null;
}

const statutConfig: Record<GasOrderStatus, { label: string; color: string; icon: string }> = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: '⏳' },
  VALIDER: { label: 'Livreur affecté', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', icon: '🛵' },
  ASSIGNEE: { label: 'Livreur affecté', color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200', icon: '🛵' },
  EN_COURS: { label: 'En livraison', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🚚' },
  LIVREE: { label: 'Livrée', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '📦' },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '❌' },
  REMBOURSE: { label: 'Remboursée', color: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200', icon: '↩️' }
};

const typeCommandeConfig = {
  recharge: { label: 'Recharge seulement', icon: '🔄', description: 'Recharge de bouteille vide' },
  bouteille_complete: { label: 'Bouteille complète', icon: '🆕', description: 'Bouteille neuve avec gaz' }
};

export function GazDetailModal({ open, onOpenChange, commande }: GazDetailModalProps) {
  if (!commande) return null;

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

  const getStatusIcon = (statut: GasOrderStatus) => statutConfig[statut]?.icon || '⏳';

  const calculateMargin = () => {
    return ((commande.commission / commande.prix) * 100).toFixed(1);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <IconGasStation className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold">
                Commande {commande.numeroCommande}
              </div>
              <div className="text-sm text-muted-foreground">
                Détails de la commande de gaz
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations complètes de la commande ID #{commande.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconInfoCircle className="h-5 w-5" />
                Statut de la commande
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Statut actuel :</span>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(commande.statut)}</span>
                  <Badge className={statutConfig[commande.statut].color}>
                    {statutConfig[commande.statut].label}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">Date de commande :</span>
                <div className="flex items-center gap-1">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(commande.dateCommande)}</span>
                </div>
              </div>

              {commande.dateLivraison && (
                <div className="flex items-center justify-between">
                  <span className="font-medium">Date de livraison :</span>
                  <div className="flex items-center gap-1">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(commande.dateLivraison)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Informations client
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Nom du client</div>
                    <div className="font-medium">{commande.client}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                    <div className="font-medium">{commande.telephone}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <IconMapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div>
                  <div className="text-sm text-muted-foreground">Adresse de livraison</div>
                  <div className="font-medium">{commande.adresse}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détails produit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconPackage className="h-5 w-5" />
                Détails du produit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconGasStation className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Marque de gaz</div>
                    <div className="font-medium">{commande.marqueGaz}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPackage className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Quantité</div>
                    <div className="font-medium">{commande.quantite} bouteille{commande.quantite > 1 ? 's' : ''}</div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                <div className="text-3xl">
                  {typeCommandeConfig[commande.typeCommande].icon}
                </div>
                <div>
                  <div className="font-medium">
                    {typeCommandeConfig[commande.typeCommande].label}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {typeCommandeConfig[commande.typeCommande].description}
                  </div>
                </div>
              </div>
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
                    <IconCoin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(commande.prix)}
                  </div>
                  <div className="text-sm text-muted-foreground">Prix total</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconCoin className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(commande.commission)}
                  </div>
                  <div className="text-sm text-muted-foreground">Commission</div>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center mb-2">
                    <IconCoin className="h-6 w-6 text-orange-600" />
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
          {commande.livreur && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconMotorbike className="h-5 w-5" />
                  Livreur assigné
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full">
                    <IconMotorbike className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <div className="font-medium">{commande.livreur}</div>
                    <div className="text-sm text-muted-foreground">
                      {commande.statut === 'EN_COURS' ? 'En cours de livraison' : 'Livreur assigné'}
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
                  <span className="text-sm text-muted-foreground">ID de commande</span>
                  <span className="font-bold font-mono">{commande.id}</span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Prix unitaire</span>
                  <span className="font-bold">
                    {formatCurrency(commande.prix / commande.quantite)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Commission par unité</span>
                  <span className="font-bold">
                    {formatCurrency(commande.commission / commande.quantite)}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Valeur client</span>
                  <span className="font-bold">
                    {formatCurrency(commande.prix - commande.commission)}
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