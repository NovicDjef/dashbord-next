"use client"

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  IconTag,
  IconX,
  IconDeviceFloppy,
  IconFileText,
  IconCamera,
  IconTrash,
  IconBuildingStore
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
import { updateCategory, fetchCategoriesData } from "@/redux/categoriesSlice";
import { BASE_URL, getImageUrl } from "@/services/urlApp";

interface CategoryEditFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: any;
  restaurants: any[];
}

export function CategoryEditForm({ open, onOpenChange, category, restaurants }: CategoryEditFormProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    restaurantId: ""
  });

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<any>({});

  // Remplir le formulaire avec les données de la catégorie
  useEffect(() => {
    if (category && open) {
      setFormData({
        name: category.name || "",
        description: category.description || "",
        restaurantId: category.restaurantId?.toString() || ""
      });

      // Charger l'image existante
      if (category.image) {
        const imageUrl = getImageUrl(category.image);
        setImagePreview(imageUrl || "");
      } else {
        setImagePreview("");
      }
      setSelectedImage(null);
    }
  }, [category, open]);

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

  // Gestion de l'image
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }

      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('L\'image ne doit pas dépasser 5MB');
        return;
      }

      setSelectedImage(file);

      // Créer un aperçu
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    const imageUrl = category?.image ? getImageUrl(category.image) : "";
    setImagePreview(imageUrl || "");
  };

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.name.trim()) newErrors.name = "Nom de la catégorie requis";
    if (!formData.description.trim()) newErrors.description = "Description requise";
    if (!formData.restaurantId) newErrors.restaurantId = "Restaurant requis";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Préparer les données de base
      const baseData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        restaurantId: parseInt(formData.restaurantId)
      };

      console.log('🔄 Modification de la catégorie');
      console.log('Nouvelle image:', selectedImage ? 'Oui' : 'Non');

      let requestBody: any;
      let requestHeaders: HeadersInit = {};

      if (selectedImage) {
        // Si une image est sélectionnée, utiliser FormData
        setUploadingImage(true);
        const formDataObj = new FormData();

        Object.entries(baseData).forEach(([key, value]) => {
          formDataObj.append(key, value.toString());
        });
        formDataObj.append('image', selectedImage);

        requestBody = formDataObj;
        setUploadingImage(false);

        console.log('📦 Envoi avec FormData (avec image)');
      } else {
        // Sinon, utiliser JSON
        requestBody = JSON.stringify(baseData);
        requestHeaders['Content-Type'] = 'application/json';

        console.log('📦 Envoi avec JSON (sans image):', baseData);
      }

      // Récupérer le token d'authentification
      let token = localStorage.getItem('userToken');
      if (!token) {
        token = localStorage.getItem('adminToken');
      }

      if (token) {
        requestHeaders['Authorization'] = `Bearer ${token}`;
      } else {
        alert('Erreur: Vous devez être connecté pour modifier une catégorie');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BASE_URL}/categories/${category.id}`, {
        method: 'PUT',
        headers: requestHeaders,
        body: requestBody,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Erreur lors de la modification' }));
        alert(`Erreur ${response.status}: ${errorData.message || response.statusText}`);
        throw new Error(errorData.message || 'Erreur lors de la modification');
      }

      const result = await response.json();
      console.log('✅ Catégorie modifiée avec succès:', result);
      alert('Catégorie modifiée avec succès!');

      // Recharger les catégories
      await dispatch(fetchCategoriesData() as any);

      // Fermer le modal
      onOpenChange(false);
    } catch (error) {
      console.error('❌ Erreur lors de la modification:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!category) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="flex items-center justify-center h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <IconTag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <div className="text-xl font-bold">Modifier la catégorie</div>
              <div className="text-sm text-muted-foreground">
                {category.name} - ID: {category.id}
              </div>
            </div>
          </DialogTitle>
          <DialogDescription>
            Modifiez les informations de cette catégorie.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <IconTag className="h-5 w-5" />
                Informations de base
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload d'image */}
              <div className="space-y-2">
                <Label>Image de la catégorie</Label>
                <div className="flex flex-col gap-4">
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={imagePreview}
                        alt="Aperçu de la catégorie"
                        className="w-full h-full object-cover"
                      />
                      {selectedImage && (
                        <div className="absolute top-2 right-2">
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={removeImage}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('category-image-upload')?.click()}
                      className="flex-1"
                      disabled={uploadingImage}
                    >
                      <IconCamera className="h-4 w-4 mr-2" />
                      {selectedImage ? 'Changer l\'image' : imagePreview ? 'Modifier l\'image' : 'Ajouter une image'}
                    </Button>
                    <input
                      id="category-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Formats acceptés: JPG, PNG, GIF (max 5MB)
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie *</Label>
                <div className="relative">
                  <IconTag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    placeholder="Nom de la catégorie"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`pl-10 ${errors.name ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <div className="relative">
                  <IconFileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea
                    id="description"
                    placeholder="Description de la catégorie"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`pl-10 min-h-[100px] ${errors.description ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurantId">Restaurant *</Label>
                <Select
                  value={formData.restaurantId}
                  onValueChange={(value) => handleInputChange('restaurantId', value)}
                >
                  <SelectTrigger className={errors.restaurantId ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Sélectionner un restaurant" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant) => (
                      <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                        {restaurant.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.restaurantId && <p className="text-sm text-red-500">{errors.restaurantId}</p>}
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              <IconX className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button type="submit" disabled={loading || uploadingImage}>
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {uploadingImage ? 'Upload image...' : loading ? 'Modification...' : 'Modifier la catégorie'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
