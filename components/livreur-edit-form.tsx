"use client"

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateLivreurAsync } from "@/redux/livreurSlice";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMotorbike,
  IconDeviceFloppy,
  IconX,
  IconToggleLeft,
  IconToggleRight
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

interface LivreurEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  livreur: Livreur | null;
}

interface LivreurEditFormData {
  prenom: string;
  email: string;
  telephone: string;
  typeVehicule: string;
  plaqueVehicule: string;
  disponible: boolean;
  zone: string;
}

export function LivreurEditForm({ open, onOpenChange, livreur }: LivreurEditFormProps) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state: any) => state.livreur);
  const loading = status === 'loading';

  const [formData, setFormData] = useState<LivreurEditFormData>({
    prenom: '',
    email: '',
    telephone: '',
    typeVehicule: '',
    plaqueVehicule: '',
    disponible: true,
    zone: ''
  });

  const [formErrors, setFormErrors] = useState<Partial<LivreurEditFormData>>({});

  // Remplir le formulaire avec les données du livreur sélectionné
  useEffect(() => {
    if (livreur && open) {
      setFormData({
        prenom: livreur.prenom || '',
        email: livreur.email || '',
        telephone: livreur.telephone || '',
        typeVehicule: livreur.typeVehicule || '',
        plaqueVehicule: livreur.plaqueVehicule || '',
        disponible: livreur.disponible ?? true,
        zone: livreur.zone || ''
      });
      setFormErrors({});
    }
  }, [livreur, open]);

  const handleInputChange = (field: keyof LivreurEditFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<LivreurEditFormData> = {};

    if (!formData.prenom.trim()) {
      errors.prenom = 'Le prénom est requis';
    }

    if (!formData.email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Format d\'email invalide';
    }

    if (!formData.telephone.trim()) {
      errors.telephone = 'Le téléphone est requis';
    } else if (!/^[0-9+\-\s()]{8,}$/.test(formData.telephone)) {
      errors.telephone = 'Format de téléphone invalide';
    }

    if (!formData.typeVehicule) {
      errors.typeVehicule = 'Le type de véhicule est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!livreur || !validateForm()) {
      return;
    }

    const updateData = {
      prenom: formData.prenom.trim(),
      email: formData.email.trim(),
      telephone: formData.telephone.trim(),
      typeVehicule: formData.typeVehicule,
      disponible: formData.disponible,
      ...(formData.plaqueVehicule.trim() && { plaqueVehicule: formData.plaqueVehicule.trim() }),
      ...(formData.zone.trim() && { zone: formData.zone.trim() })
    };

    try {
      await dispatch(updateLivreurAsync({ id: livreur.id, data: updateData }));
      // Si succès, fermer le modal
      if (status !== 'failed') {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setFormErrors({});
  };

  if (!livreur) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="h-5 w-5" />
            Modifier le livreur
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de {livreur.prenom} ({livreur.username}).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          {/* Informations de base */}
          <div className="grid grid-cols-2 gap-4">
            {/* Prénom */}
            <div className="space-y-2">
              <Label htmlFor="prenom">Prénom *</Label>
              <Input
                id="prenom"
                value={formData.prenom}
                onChange={(e) => handleInputChange('prenom', e.target.value)}
                placeholder="Jean"
                className={formErrors.prenom ? 'border-red-500' : ''}
              />
              {formErrors.prenom && (
                <p className="text-sm text-red-500">{formErrors.prenom}</p>
              )}
            </div>

            {/* Zone */}
            <div className="space-y-2">
              <Label htmlFor="zone">Zone</Label>
              <Input
                id="zone"
                value={formData.zone}
                onChange={(e) => handleInputChange('zone', e.target.value)}
                placeholder="Douala"
                className={formErrors.zone ? 'border-red-500' : ''}
              />
              {formErrors.zone && (
                <p className="text-sm text-red-500">{formErrors.zone}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              <IconMail className="inline h-4 w-4 mr-1" />
              Email *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="livreur@example.com"
              className={formErrors.email ? 'border-red-500' : ''}
            />
            {formErrors.email && (
              <p className="text-sm text-red-500">{formErrors.email}</p>
            )}
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="telephone">
              <IconPhone className="inline h-4 w-4 mr-1" />
              Téléphone *
            </Label>
            <Input
              id="telephone"
              value={formData.telephone}
              onChange={(e) => handleInputChange('telephone', e.target.value)}
              placeholder="690123456"
              className={formErrors.telephone ? 'border-red-500' : ''}
            />
            {formErrors.telephone && (
              <p className="text-sm text-red-500">{formErrors.telephone}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Type de véhicule */}
            <div className="space-y-2">
              <Label>
                <IconMotorbike className="inline h-4 w-4 mr-1" />
                Type de véhicule *
              </Label>
              <Select
                value={formData.typeVehicule}
                onValueChange={(value) => handleInputChange('typeVehicule', value)}
              >
                <SelectTrigger className={formErrors.typeVehicule ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Choisir..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MOTO">Moto</SelectItem>
                  <SelectItem value="VOITURE">Voiture</SelectItem>
                  <SelectItem value="VELO">Vélo</SelectItem>
                  <SelectItem value="SCOOTER">Scooter</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.typeVehicule && (
                <p className="text-sm text-red-500">{formErrors.typeVehicule}</p>
              )}
            </div>

            {/* Plaque véhicule */}
            <div className="space-y-2">
              <Label htmlFor="plaqueVehicule">Plaque</Label>
              <Input
                id="plaqueVehicule"
                value={formData.plaqueVehicule}
                onChange={(e) => handleInputChange('plaqueVehicule', e.target.value)}
                placeholder="AB-123-CD"
                className={formErrors.plaqueVehicule ? 'border-red-500' : ''}
              />
              {formErrors.plaqueVehicule && (
                <p className="text-sm text-red-500">{formErrors.plaqueVehicule}</p>
              )}
            </div>
          </div>

          {/* Disponibilité */}
          <div className="space-y-2">
            <Label>Disponibilité</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleInputChange('disponible', !formData.disponible)}
                className="h-auto p-2"
              >
                {formData.disponible ? (
                  <IconToggleRight className="h-6 w-6 text-green-600" />
                ) : (
                  <IconToggleLeft className="h-6 w-6 text-gray-400" />
                )}
              </Button>
              <span className={formData.disponible ? 'text-green-600' : 'text-gray-500'}>
                {formData.disponible ? 'Disponible' : 'Indisponible'}
              </span>
            </div>
          </div>

          {/* Informations en lecture seule */}
          <div className="border-t pt-4 space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">Informations du compte</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Username:</span>
                <span className="ml-2 font-medium">{livreur.username}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Note:</span>
                <span className="ml-2 font-medium">⭐ {livreur.note.toFixed(1)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Livraisons:</span>
                <span className="ml-2 font-medium">{livreur.totalLivraisons}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Gains totaux:</span>
                <span className="ml-2 font-medium">{livreur.totalGains} XAF</span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              <IconX className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {loading ? 'Modification...' : 'Modifier'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}