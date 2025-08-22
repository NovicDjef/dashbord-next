"use client"

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { 
  IconUpload, 
  IconX, 
  IconPlus, 
  IconMinus,
  IconMapPin,
  IconClock,
  IconDeviceFloppy,
  IconTrash
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RestaurantFormData {
  name: string;
  phone: string;
  adresse: string;
  image?: string;
  description: string;
  latitude: number;
  longitude: number;
  villeId: number;
  adminCommissionPercent: number;
  restaurantCommissionPercent: number;
  heuresOuverture: {
    jour: string;
    heures: string;
  }[];
}

interface Restaurant {
  id?: number;
  name: string;
  phone: string;
  adresse: string;
  image?: string;
  description: string;
  ratings?: number;
  latitude: number;
  longitude: number;
  adminId?: number;
  villeId: number;
  adminCommissionPercent: number;
  restaurantCommissionPercent: number;
  createdAt?: string;
  updatedAt?: string;
  heuresOuverture?: {
    id?: number;
    jour: string;
    heures: string;
    restaurantId?: number;
  }[];
  ville?: {
    id: number;
    name: string;
    longitude: number;
    latitude: number;
  };
}

interface RestaurantFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RestaurantFormData) => Promise<void>;
  restaurant?: Restaurant | null;
  villes: Array<{ id: number; name: string; latitude: number; longitude: number }>;
  loading?: boolean;
}

const joursDefault = [
  "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"
];

export function RestaurantForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  restaurant, 
  villes, 
  loading = false 
}: RestaurantFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [heuresOuverture, setHeuresOuverture] = useState(
    joursDefault.map(jour => ({ jour, heures: "08:00-22:00" }))
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<RestaurantFormData>();

  const villeId = watch("villeId");

  useEffect(() => {
    if (restaurant) {
      // Pré-remplir le formulaire avec les données du restaurant
      setValue("name", restaurant.name);
      setValue("phone", restaurant.phone);
      setValue("adresse", restaurant.adresse);
      setValue("description", restaurant.description);
      setValue("latitude", restaurant.latitude);
      setValue("longitude", restaurant.longitude);
      setValue("villeId", restaurant.villeId);
      setValue("adminCommissionPercent", restaurant.adminCommissionPercent);
      setValue("restaurantCommissionPercent", restaurant.restaurantCommissionPercent);
      
      if (restaurant.image) {
        setImagePreview(restaurant.image.startsWith('http') 
          ? restaurant.image 
          : `https://api.novic.dev/${restaurant.image}`);
      }
      
      if (restaurant.heuresOuverture && restaurant.heuresOuverture.length > 0) {
        setHeuresOuverture(restaurant.heuresOuverture.map(h => ({
          jour: h.jour,
          heures: h.heures
        })));
      }
    } else {
      // Reset form pour nouveau restaurant
      reset();
      setImagePreview("");
      setImageFile(null);
      setHeuresOuverture(joursDefault.map(jour => ({ jour, heures: "08:00-22:00" })));
    }
  }, [restaurant, setValue, reset]);

  // Auto-fill coordinates when ville changes
  useEffect(() => {
    if (villeId && villes.length > 0) {
      const selectedVille = villes.find(v => v.id === parseInt(villeId.toString()));
      if (selectedVille) {
        setValue("latitude", selectedVille.latitude);
        setValue("longitude", selectedVille.longitude);
      }
    }
  }, [villeId, villes, setValue]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHeuresChange = (jour: string, heures: string) => {
    setHeuresOuverture(prev => 
      prev.map(h => h.jour === jour ? { ...h, heures } : h)
    );
  };

  const onFormSubmit = async (data: RestaurantFormData) => {
    try {
      const formData = {
        ...data,
        heuresOuverture,
        image: imageFile || restaurant?.image
      };
      
      await onSubmit(formData);
      
      // Reset form after successful submission
      if (!restaurant) {
        reset();
        setImagePreview("");
        setImageFile(null);
        setHeuresOuverture(joursDefault.map(jour => ({ jour, heures: "08:00-22:00" })));
      }
    } catch (error) {
      console.error("Erreur lors de la soumission:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {restaurant ? "Modifier le restaurant" : "Nouveau restaurant"}
          </DialogTitle>
          <DialogDescription>
            {restaurant 
              ? "Modifiez les informations du restaurant ci-dessous"
              : "Remplissez les informations pour créer un nouveau restaurant"
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informations de base */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informations générales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du restaurant *</Label>
                  <Input
                    id="name"
                    {...register("name", { required: "Le nom est requis" })}
                    placeholder="Ex: Chez Mama Mbakara"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    {...register("phone", { required: "Le téléphone est requis" })}
                    placeholder="+237 6XX XX XX XX"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="adresse">Adresse *</Label>
                  <Input
                    id="adresse"
                    {...register("adresse", { required: "L'adresse est requise" })}
                    placeholder="Ex: Quartier Bastos"
                  />
                  {errors.adresse && (
                    <p className="text-sm text-red-500 mt-1">{errors.adresse.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Décrivez votre restaurant, spécialités, ambiance..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="villeId">Ville *</Label>
                  <Select onValueChange={(value) => setValue("villeId", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez une ville" />
                    </SelectTrigger>
                    <SelectContent>
                      {villes.map((ville) => (
                        <SelectItem key={ville.id} value={ville.id.toString()}>
                          {ville.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.villeId && (
                    <p className="text-sm text-red-500 mt-1">La ville est requise</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Image et localisation */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Image et localisation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="image">Image du restaurant</Label>
                  <div className="mt-2">
                    {imagePreview && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden mb-3">
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          className="w-full h-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => {
                            setImagePreview("");
                            setImageFile(null);
                          }}
                        >
                          <IconX className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file:mr-3 file:py-2 file:px-4 file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="latitude">Latitude *</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      {...register("latitude", { 
                        required: "La latitude est requise",
                        valueAsNumber: true
                      })}
                      placeholder="3.8874201"
                    />
                    {errors.latitude && (
                      <p className="text-sm text-red-500 mt-1">{errors.latitude.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="longitude">Longitude *</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      {...register("longitude", { 
                        required: "La longitude est requise",
                        valueAsNumber: true
                      })}
                      placeholder="11.5026379"
                    />
                    {errors.longitude && (
                      <p className="text-sm text-red-500 mt-1">{errors.longitude.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adminCommissionPercent">Commission Admin (%)</Label>
                    <Input
                      id="adminCommissionPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      {...register("adminCommissionPercent", { valueAsNumber: true })}
                      placeholder="0.1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="restaurantCommissionPercent">Commission Restaurant (%)</Label>
                    <Input
                      id="restaurantCommissionPercent"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      {...register("restaurantCommissionPercent", { valueAsNumber: true })}
                      placeholder="0.9"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heures d'ouverture */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconClock className="h-5 w-5" />
                Heures d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {heuresOuverture.map((horaire, index) => (
                  <div key={horaire.jour} className="flex items-center space-x-2">
                    <Badge variant="outline" className="min-w-[80px] justify-center">
                      {horaire.jour}
                    </Badge>
                    <Input
                      type="text"
                      value={horaire.heures}
                      onChange={(e) => handleHeuresChange(horaire.jour, e.target.value)}
                      placeholder="08:00-22:00"
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Format: HH:MM-HH:MM (ex: 08:00-22:00). Pour fermé, utilisez: 00:00-00:00
              </p>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2" />
                  {restaurant ? "Modification..." : "Création..."}
                </>
              ) : (
                <>
                  <IconDeviceFloppy className="h-4 w-4 mr-2" />
                  {restaurant ? "Modifier" : "Créer"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}