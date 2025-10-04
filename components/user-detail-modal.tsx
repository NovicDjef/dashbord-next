"use client"

import { 
  IconUser,
  IconMail,
  IconPhone,
  IconMapPin,
  IconCalendar,
  IconCoin,
  IconClock,
  IconX,
  IconId,
  IconInfoCircle,
  IconShieldCheck,
  IconPackage,
  IconTrendingUp,
  IconStar,
  IconWallet,
  IconHistory,
  IconSettings
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

interface User {
  id: string;
  username: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse?: string;
  dateNaissance?: string;
  status: 'actif' | 'inactif' | 'suspendu' | 'verifie';
  type: 'client' | 'admin' | 'livreur' | 'restaurant';
  dateInscription: string;
  dernierLogin?: string;
  avatar?: string;
  emailVerifie: boolean;
  telephoneVerifie: boolean;
  totalCommandes?: number;
  totalDepenses?: number;
  soldeWallet?: number;
  noteClient?: number;
  preferences?: {
    notifications: boolean;
    marketing: boolean;
    newsletter: boolean;
  };
}

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

const statusConfig = {
  actif: { label: 'Actif', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '✅' },
  inactif: { label: 'Inactif', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200', icon: '⭕' },
  suspendu: { label: 'Suspendu', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: '🚫' },
  verifie: { label: 'Vérifié', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '✅' }
};

const typeConfig = {
  client: { label: 'Client', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: '👤' },
  admin: { label: 'Administrateur', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: '⚡' },
  livreur: { label: 'Livreur', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200', icon: '🏍️' },
  restaurant: { label: 'Restaurant', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: '🍽️' }
};

export function UserDetailModal({ open, onOpenChange, user }: UserDetailModalProps) {
  if (!user) return null;

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

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const getVerificationStatus = () => {
    const emailVerified = user.emailVerifie;
    const phoneVerified = user.telephoneVerifie;
    
    if (emailVerified && phoneVerified) {
      return { label: 'Complètement vérifié', color: 'bg-green-100 text-green-800', icon: '✅' };
    } else if (emailVerified || phoneVerified) {
      return { label: 'Partiellement vérifié', color: 'bg-yellow-100 text-yellow-800', icon: '⚠️' };
    } else {
      return { label: 'Non vérifié', color: 'bg-red-100 text-red-800', icon: '❌' };
    }
  };

  const verificationStatus = getVerificationStatus();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="text-lg">
                {user.prenom?.[0]}{user.nom?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="text-xl font-bold">
                {user.prenom} {user.nom}
              </div>
              <div className="text-sm text-muted-foreground">
                Détails de l'utilisateur
              </div>
            </div>
            <div className="ml-auto">
              <Badge className={typeConfig[user.type].color}>
                <span className="mr-1">{typeConfig[user.type].icon}</span>
                {typeConfig[user.type].label}
              </Badge>
            </div>
          </DialogTitle>
          <DialogDescription>
            Informations complètes de l'utilisateur ID #{user.id}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Statut et vérification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconShieldCheck className="h-5 w-5" />
                Statut du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Statut :</span>
                  <div className="flex items-center gap-2">
                    <span>{statusConfig[user.status].icon}</span>
                    <Badge className={statusConfig[user.status].color}>
                      {statusConfig[user.status].label}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Vérification :</span>
                  <div className="flex items-center gap-2">
                    <span>{verificationStatus.icon}</span>
                    <Badge className={verificationStatus.color}>
                      {verificationStatus.label}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconMail className="h-4 w-4" />
                    <span className="text-sm">Email vérifié</span>
                  </div>
                  <span>{user.emailVerifie ? '✅' : '❌'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <IconPhone className="h-4 w-4" />
                    <span className="text-sm">Téléphone vérifié</span>
                  </div>
                  <span>{user.telephoneVerifie ? '✅' : '❌'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconUser className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconUser className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Nom d'utilisateur</div>
                    <div className="font-medium">{user.username}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconId className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">ID utilisateur</div>
                    <div className="font-medium font-mono">{user.id}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconMail className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="font-medium">{user.email}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <IconPhone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Téléphone</div>
                    <div className="font-medium">{user.telephone}</div>
                  </div>
                </div>
              </div>

              {user.adresse && (
                <div className="flex items-start gap-3">
                  <IconMapPin className="h-4 w-4 text-muted-foreground mt-1" />
                  <div>
                    <div className="text-sm text-muted-foreground">Adresse</div>
                    <div className="font-medium">{user.adresse}</div>
                  </div>
                </div>
              )}

              {user.dateNaissance && (
                <div className="flex items-center gap-3">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Date de naissance</div>
                    <div className="font-medium">
                      {formatDateOnly(user.dateNaissance)} ({calculateAge(user.dateNaissance)} ans)
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Statistiques d'activité pour les clients */}
          {(user.type === 'client' && (user.totalCommandes || user.totalDepenses || user.noteClient)) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconTrendingUp className="h-5 w-5" />
                  Activité client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {user.totalCommandes && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <IconPackage className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600">
                        {user.totalCommandes}
                      </div>
                      <div className="text-sm text-muted-foreground">Commandes totales</div>
                    </div>
                  )}
                  
                  {user.totalDepenses && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <IconCoin className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatCurrency(user.totalDepenses)}
                      </div>
                      <div className="text-sm text-muted-foreground">Dépenses totales</div>
                    </div>
                  )}
                  
                  {user.noteClient && (
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <IconStar className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div className="text-2xl font-bold text-yellow-600">
                        {user.noteClient.toFixed(1)}
                      </div>
                      <div className="text-sm text-muted-foreground">Note moyenne</div>
                    </div>
                  )}
                </div>

                {user.totalCommandes && user.totalDepenses && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Panier moyen</span>
                      <span className="font-bold">
                        {formatCurrency(user.totalDepenses / user.totalCommandes)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Wallet */}
          {user.soldeWallet !== undefined && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconWallet className="h-5 w-5" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950 dark:to-green-950 rounded-lg">
                  <div className="flex items-center justify-center mb-3">
                    <IconWallet className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCurrency(user.soldeWallet)}
                  </div>
                  <div className="text-sm text-muted-foreground">Solde disponible</div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Préférences */}
          {user.preferences && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <IconSettings className="h-5 w-5" />
                  Préférences
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Notifications</span>
                    <span>{user.preferences.notifications ? '✅' : '❌'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Marketing</span>
                    <span>{user.preferences.marketing ? '✅' : '❌'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="text-sm">Newsletter</span>
                    <span>{user.preferences.newsletter ? '✅' : '❌'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historique du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconHistory className="h-5 w-5" />
                Historique du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <IconCalendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">Inscrit le</div>
                    <div className="font-medium">{formatDate(user.dateInscription)}</div>
                  </div>
                </div>
                
                {user.dernierLogin && (
                  <div className="flex items-center gap-3">
                    <IconClock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="text-sm text-muted-foreground">Dernière connexion</div>
                      <div className="font-medium">{formatDate(user.dernierLogin)}</div>
                    </div>
                  </div>
                )}
              </div>

              {user.dernierLogin && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Temps depuis dernière connexion</span>
                    <span className="font-medium">
                      {Math.floor((Date.now() - new Date(user.dernierLogin).getTime()) / (1000 * 60 * 60 * 24))} jours
                    </span>
                  </div>
                </div>
              )}
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