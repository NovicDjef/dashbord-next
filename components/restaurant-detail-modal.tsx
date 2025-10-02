"use client"

import { BASE_URL, getImageUrl } from "@/services/urlApp";
import { 
  IconX,
  IconMapPin,
  IconPhone,
  IconStar,
  IconClock,
  IconUser,
  IconMail,
  IconTag,
  IconPercentage,
  IconCalendar,
  IconImage
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RestaurantDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
}

// Fonction utilitaire pour formatter les devises en Franc CFA
const formatCFA = (amount: number) => {
  return new Intl.NumberFormat('fr-CM', {
    style: 'currency',
    currency: 'XAF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export function RestaurantDetailModal({ open, onOpenChange, restaurant }: RestaurantDetailModalProps) {
  if (!restaurant) return null;

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {restaurant.image ? (
              <div className="relative h-12 w-12 rounded-lg overflow-hidden border-2 border-green-200">
                <img
                  src={getImageUrl(restaurant.image) || ''}
                  alt={restaurant.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 font-bold text-lg"
                  style={{display: 'none'}}
                >
                  {restaurant.name[0]?.toUpperCase()}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-green-600 dark:text-green-400 font-bold text-lg">
                  {restaurant.name[0]?.toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="text-xl font-bold">{restaurant.name}</div>
              <div className="text-sm text-muted-foreground">
                Détails du restaurant
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations complètes du restaurant et de ses services.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Image du restaurant */}
          {restaurant.image && (
            <Card>
              <CardContent className="p-4">
                <div className="relative w-full h-64 rounded-lg overflow-hidden">
                  <img
                    src={getImageUrl(restaurant.image) || ''}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconTag className="h-5 w-5" />
                  Informations générales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Téléphone:</span>
                    <span className="text-sm">{restaurant.phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <IconMapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Adresse:</span>
                      <p className="text-sm text-muted-foreground">{restaurant.adresse}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconStar className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">Note:</span>
                    <span className="text-sm">{restaurant.ratings}/5</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <IconMapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Coordonnées:</span>
                    <span className="text-sm">{restaurant.latitude}, {restaurant.longitude}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconPercentage className="h-5 w-5" />
                  Commissions (Franc CFA)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-orange-800">Commission Plateforme:</span>
                      <div className="text-right">
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {(restaurant.adminCommissionPercent * 100).toFixed(1)}%
                        </Badge>
                        <div className="text-sm text-orange-600 mt-1">
                          {formatCFA(restaurant.adminCommissionPercent * 1000000)} sur {formatCFA(1000000)}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-800">Commission Restaurant:</span>
                      <div className="text-right">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          {(restaurant.restaurantCommissionPercent * 100).toFixed(1)}%
                        </Badge>
                        <div className="text-sm text-green-600 mt-1">
                          {formatCFA(restaurant.restaurantCommissionPercent * 1000000)} sur {formatCFA(1000000)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-800">
                    💡 <strong>Exemple:</strong> Sur une commande de {formatCFA(1000000)}, le restaurant recevra {formatCFA(restaurant.restaurantCommissionPercent * 1000000)} et la plateforme {formatCFA(restaurant.adminCommissionPercent * 1000000)}.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {restaurant.description}
              </p>
            </CardContent>
          </Card>

          {/* Ville et Admin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {restaurant.ville && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconMapPin className="h-5 w-5" />
                    Ville
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Nom:</span>
                    <span className="text-sm">{restaurant.ville.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Coordonnées:</span>
                    <span className="text-sm">{restaurant.ville.latitude}, {restaurant.ville.longitude}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {restaurant.admin && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <IconUser className="h-5 w-5" />
                    Administrateur
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <IconUser className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{restaurant.admin.username}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{restaurant.admin.email}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Catégories */}
          {restaurant.categories && restaurant.categories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconTag className="h-5 w-5" />
                  Catégories ({restaurant.categories.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {restaurant.categories.map((category: any) => (
                    <div key={category.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      {category.image && (
                        <img
                          src={`${BASE_URL}/${category.image}`}
                          alt={category.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.description}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Créé le {formatDate(category.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Heures d'ouverture */}
          {restaurant.heuresOuverture && restaurant.heuresOuverture.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconClock className="h-5 w-5" />
                  Heures d'ouverture
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {restaurant.heuresOuverture.map((horaire: any) => (
                    <div key={horaire.id} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                      <span className="font-medium">{horaire.jour}</span>
                      <span className="text-sm text-muted-foreground">{horaire.heures}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconCalendar className="h-5 w-5" />
                Informations de création
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Créé le:</span>
                <span className="text-sm text-muted-foreground">{formatDate(restaurant.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Modifié le:</span>
                <span className="text-sm text-muted-foreground">{formatDate(restaurant.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>
            <IconX className="h-4 w-4 mr-2" />
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}