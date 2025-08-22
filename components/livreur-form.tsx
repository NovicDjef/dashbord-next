"use client"

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createLivreurAsync } from "@/redux/livreurSlice";
import {
  IconUser,
  IconMail,
  IconPhone,
  IconMotorbike,
  IconEye,
  IconEyeOff,
  IconDeviceFloppy,
  IconX
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
// import { Alert, AlertDescription } from "@/components/ui/alert";

interface LivreurFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface LivreurFormData {
  username: string;
  prenom: string;
  email: string;
  telephone: string;
  password: string;
  confirmPassword: string;
  typeVehicule: string;
  plaqueVehicule: string;
}

export function LivreurForm({ open, onOpenChange }: LivreurFormProps) {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state: any) => state.livreur);
  const loading = status === 'loading';

  const [formData, setFormData] = useState<LivreurFormData>({
    username: '',
    prenom: '',
    email: '',
    telephone: '',
    password: '',
    confirmPassword: '',
    typeVehicule: '',
    plaqueVehicule: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LivreurFormData>>({});

  const handleInputChange = (field: keyof LivreurFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<LivreurFormData> = {};

    if (!formData.username.trim()) {
      errors.username = 'Le nom d\'utilisateur est requis';
    }

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

    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    if (!formData.typeVehicule) {
      errors.typeVehicule = 'Le type de véhicule est requis';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const livreurData = {
      username: formData.username.trim(),
      prenom: formData.prenom.trim(),
      email: formData.email.trim(),
      telephone: formData.telephone.trim(),
      password: formData.password,
      typeVehicule: formData.typeVehicule,
      ...(formData.plaqueVehicule.trim() && { plaqueVehicule: formData.plaqueVehicule.trim() })
    };

    try {
      await dispatch(createLivreurAsync(livreurData));
      // Si succès, fermer le modal et réinitialiser le formulaire
      if (status !== 'failed') {
        onOpenChange(false);
        resetForm();
      }
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      username: '',
      prenom: '',
      email: '',
      telephone: '',
      password: '',
      confirmPassword: '',
      typeVehicule: '',
      plaqueVehicule: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconMotorbike className="h-5 w-5" />
            Ajouter un nouveau livreur
          </DialogTitle>
          <DialogDescription>
            Créez un compte livreur pour qu'il puisse accéder à l'application mobile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-800 bg-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">
                <IconUser className="inline h-4 w-4 mr-1" />
                Nom d'utilisateur *
              </Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="livreur123"
                className={formErrors.username ? 'border-red-500' : ''}
              />
              {formErrors.username && (
                <p className="text-sm text-red-500">{formErrors.username}</p>
              )}
            </div>

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
            {/* Mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••"
                  className={formErrors.password ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formErrors.password && (
                <p className="text-sm text-red-500">{formErrors.password}</p>
              )}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="••••••••"
                  className={formErrors.confirmPassword ? 'border-red-500' : ''}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <IconEyeOff className="h-4 w-4" />
                  ) : (
                    <IconEye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {formErrors.confirmPassword && (
                <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>
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
              <Label htmlFor="plaqueVehicule">Plaque (optionnel)</Label>
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
              {loading ? 'Création...' : 'Créer le livreur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}