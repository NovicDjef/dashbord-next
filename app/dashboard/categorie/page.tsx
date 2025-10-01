"use client"

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchCategoriesData, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError 
} from "@/redux/categoriesSlice";
import { fetchRestaurantsData } from "@/redux/restaurantSlice";
import { fetchRepas } from "@/redux/repasSlice";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  IconCategory, 
  IconPlus, 
  IconSearch, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconTrendingUp
} from "@tabler/icons-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CategoryFormData {
  name: string;
  description: string;
  image?: File | string;
  restaurantId?: number;
}

interface CategorieInterface {
  id: number;
  name: string;
  description: string;
  image?: string;
  restaurantId: number;
  restaurant?: {
    id: number;
    name: string;
  };
  createdAt: string;
}

export default function CategoriePage() {
  const dispatch = useDispatch();
  const { data: categories, status, error } = useSelector((state: any) => state.categories);
  const { data: repas } = useSelector((state: any) => state.repas);
  const { data: restaurants } = useSelector((state: any) => state.restaurants);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<CategorieInterface | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categorieToDelete, setCategorieToDelete] = useState<CategorieInterface | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    image: undefined,
    restaurantId: undefined
  });

  const loading = status === 'loading';
  const filteredCategories = categories.filter((categorie: CategorieInterface) =>
    categorie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    categorie.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    dispatch(fetchCategoriesData() as any);
    dispatch(fetchRestaurantsData() as any);
    dispatch(fetchRepas() as any);
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: undefined,
      restaurantId: undefined
    });
    setSelectedCategorie(null);
  };

  const handleEdit = (categorie: CategorieInterface) => {
    setSelectedCategorie(categorie);
    setFormData({
      name: categorie.name,
      description: categorie.description,
      image: categorie.image,
      restaurantId: categorie.restaurantId
    });
    setIsFormOpen(true);
  };

  const openDeleteDialog = (categorie: CategorieInterface) => {
    setCategorieToDelete(categorie);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!categorieToDelete) return;
    
    try {
      await dispatch(deleteCategory(categorieToDelete.id) as any);
      toast.success("Catégorie supprimée avec succès");
      setDeleteDialogOpen(false);
      setCategorieToDelete(null);
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Le nom de la catégorie est requis");
      return;
    }

    if (!formData.restaurantId) {
      toast.error("Veuillez sélectionner un restaurant");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('restaurantId', formData.restaurantId.toString());
      
      if (formData.image instanceof File) {
        submitData.append('image', formData.image);
      }

      if (selectedCategorie) {
        await dispatch(updateCategory({ 
          id: selectedCategorie.id, 
          categoryData: submitData 
        }) as any);
        toast.success("Catégorie modifiée avec succès");
      } else {
        await dispatch(createCategory(submitData) as any);
        toast.success("Catégorie créée avec succès");
      }

      setIsFormOpen(false);
      resetForm();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/placeholder-category.jpg";
    return imagePath.startsWith('http') ? imagePath : `${BASE_URL}/${imagePath}`;
  };

  const getCategorieRepas = (categorieId: number) => {
    return repas.filter((r: any) => r.categorieId === categorieId || r.categoryId === categorieId);
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <IconCategory className="h-6 w-6" />
              Gestion des Catégories
            </h1>
            <p className="text-muted-foreground">
              Organisez les repas par catégories pour vos restaurants
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsFormOpen(true)}
                className="bg-primary hover:bg-primary/90"
              >
                <IconPlus className="h-4 w-4 mr-2" />
                Nouvelle catégorie
              </Button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <IconSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Rechercher une catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="koursier-stat-card">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-500/10">
                  <IconCategory className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{categories.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="koursier-stat-card">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-green-50 dark:bg-green-500/10">
                  <IconCategory className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Repas</p>
                  <p className="text-2xl font-bold">{repas.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="koursier-stat-card">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-orange-50 dark:bg-orange-500/10">
                  <IconCategory className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Restaurants</p>
                  <p className="text-2xl font-bold">{restaurants.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="koursier-stat-card">
            <div className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-50 dark:bg-purple-500/10">
                  <IconTrendingUp className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Avg Repas/Cat</p>
                  <p className="text-2xl font-bold">
                    {categories.length > 0 ? Math.round(repas.length / categories.length) : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-4">Catégories ({filteredCategories.length})</h2>
            
            <div className="koursier-table-container">
              <table className="w-full">
                <thead>
                  <tr className="koursier-table-header">
                    <th className="koursier-table-cell text-left">Catégorie</th>
                    <th className="koursier-table-cell text-left">Restaurant</th>
                    <th className="koursier-table-cell text-left">Description</th>
                    <th className="koursier-table-cell text-left">Repas</th>
                    <th className="koursier-table-cell text-left">Date</th>
                    <th className="koursier-table-cell text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((categorie: CategorieInterface) => (
                    <tr key={categorie.id} className="koursier-table-row">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted">
                            <img
                              src={getImageUrl(categorie.image)}
                              alt={categorie.name}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/placeholder-category.jpg";
                              }}
                            />
                          </div>
                          <div>
                            <div className="font-medium">{categorie.name}</div>
                            <div className="text-sm text-muted-foreground">
                              ID: {categorie.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-medium">
                          {categorie.restaurant?.name || `Restaurant ${categorie.restaurantId}`}
                        </div>
                      </td>
                      <td>
                        <div className="max-w-xs line-clamp-2 text-sm text-muted-foreground">
                          {categorie.description}
                        </div>
                      </td>
                      <td>
                        <Badge variant="outline">
                          {getCategorieRepas(categorie.id).length} repas
                        </Badge>
                      </td>
                      <td className="text-sm text-muted-foreground">
                        {formatDate(categorie.createdAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm">
                            <IconEye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleEdit(categorie)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDeleteDialog(categorie)}
                          >
                            <IconTrash className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {(!filteredCategories || filteredCategories.length === 0) && (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "Aucune catégorie trouvée pour cette recherche." : (loading ? "Chargement..." : "Aucune catégorie enregistrée.")}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <IconCategory className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {selectedCategorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {selectedCategorie 
                    ? "Modifiez les informations de la catégorie" 
                    : "Créez une nouvelle catégorie pour organiser vos repas"
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de la catégorie</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                  placeholder="Ex: Plats principaux"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Décrivez le type de repas dans cette catégorie..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurantId">Restaurant</Label>
                <select
                  id="restaurantId"
                  value={formData.restaurantId || ''}
                  onChange={(e) => setFormData(prev => ({...prev, restaurantId: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  required
                >
                  <option value="">Sélectionner un restaurant</option>
                  {restaurants.map((restaurant: any) => (
                    <option key={restaurant.id} value={restaurant.id}>
                      {restaurant.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setFormData(prev => ({...prev, image: file}));
                    }
                  }}
                />
                {(formData.image || selectedCategorie?.image) && (
                  <div className="mt-2">
                    <img
                      src={formData.image instanceof File 
                        ? URL.createObjectURL(formData.image)
                        : getImageUrl(selectedCategorie?.image)
                      }
                      alt="Aperçu"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enregistrement..." : (selectedCategorie ? "Modifier" : "Créer")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la catégorie "{categorieToDelete?.name}" ?
              Cette action supprimera également tous les repas associés à cette catégorie.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}