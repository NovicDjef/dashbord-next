"use client"

// Fiche client. GET /users (admin) ne renvoie que
// { id, username, phone, image, createdAt, _count: { commandes } } :
// on n'affiche rien d'autre pour ne pas inventer de données.
import { IconUser, IconPhone, IconCalendar, IconPackage, IconId, IconX } from "@tabler/icons-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getImageUrl } from "@/services/urlApp";

export interface ClientUser {
  id: string;
  username: string;
  phone: string;
  image?: string | null;
  createdAt: string;
  totalCommandes: number;
}

interface UserDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: ClientUser | null;
}

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(date));

export function UserDetailModal({ open, onOpenChange, user }: UserDetailModalProps) {
  if (!user) return null;

  const avatar = user.image ? getImageUrl(user.image) : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={avatar} />
              <AvatarFallback>{user.username?.slice(0, 2).toUpperCase() || 'CL'}</AvatarFallback>
            </Avatar>
            <span>{user.username}</span>
          </DialogTitle>
          <DialogDescription>Client inscrit le {formatDate(user.createdAt)}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconUser className="h-4 w-4" />
                Identité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <IconId className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Identifiant</span>
                <span className="ml-auto font-medium">#{user.id}</span>
              </p>
              <p className="flex items-center gap-2">
                <IconPhone className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Téléphone</span>
                <span className="ml-auto font-medium">{user.phone || '—'}</span>
              </p>
              <p className="flex items-center gap-2">
                <IconCalendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Inscription</span>
                <span className="ml-auto font-medium">{formatDate(user.createdAt)}</span>
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <IconPackage className="h-4 w-4" />
                Activité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{user.totalCommandes}</div>
              <p className="text-sm text-muted-foreground">
                commande{user.totalCommandes > 1 ? 's' : ''} passée{user.totalCommandes > 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <IconX className="mr-2 h-4 w-4" />
            Fermer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
