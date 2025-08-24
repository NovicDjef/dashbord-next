"use client"

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  IconUser,
  IconPhone,
  IconX,
  IconDeviceFloppy,
  IconEdit
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchAllUsersAsync } from "@/redux/authSlice";
import { updateUserAsync } from "@/services/routeApi";

interface UserEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: any;
}

export function UserEditForm({ open, onOpenChange, user }: UserEditFormProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    telephone: ""
  });

  const [errors, setErrors] = useState<any>({});

  // Remplir le formulaire avec les données de l'utilisateur
  useEffect(() => {
    if (user && open) {
      setFormData({
        username: user.username || "",
        telephone: user.telephone || ""
      });
    }
  }, [user, open]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Validation des champs requis - Username et téléphone seulement
    if (!formData.username.trim()) newErrors.username = "Nom d'utilisateur requis";
    if (!formData.telephone.trim()) newErrors.telephone = "Téléphone requis";

    // Validation du téléphone (format Cameroun)
    const phoneRegex = /^(237)?[6][0-9]{8}$/;
    if (formData.telephone && !phoneRegex.test(formData.telephone.replace(/\s/g, ''))) {
      newErrors.telephone = "Format de téléphone invalide (ex: 6XXXXXXXX)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Préparer les données pour l'API - Seulement username et phone
      const userData = {
        username: formData.username.trim(),
        phone: formData.telephone.trim()
      };

      console.log('🔄 Modification de l\'utilisateur:', userData);
      const response = await updateUserAsync(user.id, userData);
      console.log('✅ Utilisateur modifié:', response.data);

      // Recharger la liste des utilisateurs
      dispatch(fetchAllUsersAsync());

      // Fermer le modal
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Erreur lors de la modification de l\'utilisateur'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <IconEdit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Modifier l'utilisateur</div>
              <div className="text-sm text-muted-foreground">
                ID: {user.id} - {user.username}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Modifiez le nom d'utilisateur et le numéro de téléphone.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations modifiables */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconEdit className="h-5 w-5" />
                Modification du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur *</Label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="username"
                      placeholder="Entrez le nom d'utilisateur"
                      value={formData.username}
                      onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`pl-10 ${errors.username ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.username && <p className="text-sm text-red-500">{errors.username}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Numéro de téléphone *</Label>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="telephone"
                      placeholder="690089999"
                      value={formData.telephone}
                      onChange={(e) => handleInputChange('telephone', e.target.value)}
                      className={`pl-10 ${errors.telephone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.telephone && <p className="text-sm text-red-500">{errors.telephone}</p>}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 font-medium text-sm">
                    💡 Note :
                  </div>
                  <div className="text-blue-700 text-sm">
                    Seuls le nom d'utilisateur et le numéro de téléphone peuvent être modifiés.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {errors.submit && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-md">
              {errors.submit}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <IconX className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {loading ? 'Modification...' : 'Modifier l\'utilisateur'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}