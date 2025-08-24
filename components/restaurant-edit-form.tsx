"use client"

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { 
  IconTag,
  IconPhone,
  IconMapPin,
  IconX,
  IconDeviceFloppy,
  IconEdit,
  IconPercentage,
  IconFileText
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RestaurantEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: any;
}

export function RestaurantEditForm({ open, onOpenChange, restaurant }: RestaurantEditFormProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    adresse: "",
    description: "",
    latitude: "",
    longitude: "",
    villeId: "",
    adminCommissionPercent: "",
    restaurantCommissionPercent: ""
  });

  const [errors, setErrors] = useState<any>({});

  // Liste des villes (vous devrez adapter selon votre API)
  const villes = [
    { id: 1, name: "Douala" },
    { id: 2, name: "Yaoundé" },
    { id: 3, name: "Bafoussam" },
    { id: 4, name: "Bamenda" }
  ];

  // Remplir le formulaire avec les données du restaurant
  useEffect(() => {
    if (restaurant && open) {
      setFormData({
        name: restaurant.name || "",
        phone: restaurant.phone || "",
        adresse: restaurant.adresse || "",
        description: restaurant.description || "",
        latitude: restaurant.latitude?.toString() || "",
        longitude: restaurant.longitude?.toString() || "",
        villeId: restaurant.villeId?.toString() || "",
        adminCommissionPercent: restaurant.adminCommissionPercent?.toString() || "",
        restaurantCommissionPercent: restaurant.restaurantCommissionPercent?.toString() || ""
      });
    }
  }, [restaurant, open]);

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

    // Validation des champs requis
    if (!formData.name.trim()) newErrors.name = "Nom du restaurant requis";
    if (!formData.phone.trim()) newErrors.phone = "Téléphone requis";
    if (!formData.adresse.trim()) newErrors.adresse = "Adresse requise";
    if (!formData.description.trim()) newErrors.description = "Description requise";
    if (!formData.latitude.trim()) newErrors.latitude = "Latitude requise";
    if (!formData.longitude.trim()) newErrors.longitude = "Longitude requise";
    if (!formData.villeId) newErrors.villeId = "Ville requise";

    // Validation du téléphone
    const phoneRegex = /^(237)?[6][0-9]{8}$/;
    if (formData.phone && !phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Format de téléphone invalide (ex: 6XXXXXXXX)";
    }

    // Validation des coordonnées
    const lat = parseFloat(formData.latitude);
    const lng = parseFloat(formData.longitude);
    if (formData.latitude && (isNaN(lat) || lat < -90 || lat > 90)) {
      newErrors.latitude = "Latitude invalide (-90 à 90)";
    }
    if (formData.longitude && (isNaN(lng) || lng < -180 || lng > 180)) {
      newErrors.longitude = "Longitude invalide (-180 à 180)";
    }

    // Validation des pourcentages
    const adminComm = parseFloat(formData.adminCommissionPercent);
    const restComm = parseFloat(formData.restaurantCommissionPercent);
    if (formData.adminCommissionPercent && (isNaN(adminComm) || adminComm < 0 || adminComm > 1)) {
      newErrors.adminCommissionPercent = "Pourcentage admin invalide (0 à 1)";
    }
    if (formData.restaurantCommissionPercent && (isNaN(restComm) || restComm < 0 || restComm > 1)) {
      newErrors.restaurantCommissionPercent = "Pourcentage restaurant invalide (0 à 1)";
    }
    if (formData.adminCommissionPercent && formData.restaurantCommissionPercent) {
      if (Math.abs((adminComm + restComm) - 1) > 0.001) { // Tolérance pour les erreurs de virgule flottante
        newErrors.commissions = "La somme des commissions doit être égale à 100%";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Préparer les données pour l'API
      const restaurantData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        adresse: formData.adresse.trim(),
        description: formData.description.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        villeId: parseInt(formData.villeId),
        adminCommissionPercent: parseFloat(formData.adminCommissionPercent),
        restaurantCommissionPercent: parseFloat(formData.restaurantCommissionPercent)
      };

      console.log('🔄 Modification du restaurant:', restaurantData);
      
      // TODO: Implémenter l'appel API pour modifier le restaurant
      // const response = await updateRestaurantAsync(restaurant.id, restaurantData);
      // console.log('✅ Restaurant modifié:', response.data);

      // Simuler la modification pour l'instant
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Fermer le modal
      onOpenChange(false);

    } catch (error: any) {
      console.error('❌ Erreur lors de la modification:', error);
      setErrors({
        submit: error.response?.data?.message || error.message || 'Erreur lors de la modification du restaurant'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!restaurant) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <IconEdit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Modifier le restaurant</div>
              <div className="text-sm text-muted-foreground">
                {restaurant.name} - ID: {restaurant.id}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de ce restaurant.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations de base */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconTag className="h-5 w-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom du restaurant *</Label>
                  <div className="relative">
                    <IconTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Nom du restaurant"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      placeholder="653297055"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`pl-10 ${errors.phone ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adresse">Adresse *</Label>
                <div className="relative">
                  <IconMapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="adresse"
                    placeholder="Adresse complète du restaurant"
                    value={formData.adresse}
                    onChange={(e) => handleInputChange('adresse', e.target.value)}
                    className={`pl-10 min-h-[80px] ${errors.adresse ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.adresse && <p className="text-sm text-red-500">{errors.adresse}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <div className="relative">
                  <IconFileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="description"
                    placeholder="Description du restaurant et de ses spécialités"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`pl-10 min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Localisation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconMapPin className="h-5 w-5" />
                Localisation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="villeId">Ville *</Label>
                  <Select value={formData.villeId} onValueChange={(value) => handleInputChange('villeId', value)}>
                    <SelectTrigger className={errors.villeId ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Sélectionner une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {villes.map((ville) => (
                        <SelectItem key={ville.id} value={ville.id.toString()}>
                          {ville.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.villeId && <p className="text-sm text-red-500">{errors.villeId}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    placeholder="4.04827"
                    value={formData.latitude}
                    onChange={(e) => handleInputChange('latitude', e.target.value)}
                    className={errors.latitude ? 'border-red-500' : ''}
                  />
                  {errors.latitude && <p className="text-sm text-red-500">{errors.latitude}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    placeholder="9.70428"
                    value={formData.longitude}
                    onChange={(e) => handleInputChange('longitude', e.target.value)}
                    className={errors.longitude ? 'border-red-500' : ''}
                  />
                  {errors.longitude && <p className="text-sm text-red-500">{errors.longitude}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Commissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconPercentage className="h-5 w-5" />
                Configuration des commissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminCommissionPercent">Commission Admin</Label>
                  <div className="relative">
                    <IconPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="adminCommissionPercent"
                      placeholder="0.1"
                      value={formData.adminCommissionPercent}
                      onChange={(e) => handleInputChange('adminCommissionPercent', e.target.value)}
                      className={`pl-10 ${errors.adminCommissionPercent ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.adminCommissionPercent && <p className="text-sm text-red-500">{errors.adminCommissionPercent}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantCommissionPercent">Commission Restaurant</Label>
                  <div className="relative">
                    <IconPercentage className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="restaurantCommissionPercent"
                      placeholder="0.9"
                      value={formData.restaurantCommissionPercent}
                      onChange={(e) => handleInputChange('restaurantCommissionPercent', e.target.value)}
                      className={`pl-10 ${errors.restaurantCommissionPercent ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {errors.restaurantCommissionPercent && <p className="text-sm text-red-500">{errors.restaurantCommissionPercent}</p>}
                </div>
              </div>
              
              {errors.commissions && (
                <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-950 rounded-md">
                  {errors.commissions}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 font-medium text-sm">
                    💡 Note :
                  </div>
                  <div className="text-blue-700 text-sm">
                    Les pourcentages doivent être entre 0 et 1 (ex: 0.1 = 10%, 0.9 = 90%) et leur somme doit égaler 1.
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
              {loading ? 'Modification...' : 'Modifier le restaurant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}