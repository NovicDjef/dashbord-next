"use client"

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getImageUrl } from "@/services/urlApp";
import {
  fetchCategoriesData,
  createCategory,
  updateCategory,
  deleteCategory,
  clearError
} from "@/redux/categoriesSlice";
import { CategoryEditForm } from "@/components/category-edit-form";
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
  IconTrendingUp,
  IconChefHat,
  IconBuildingStore
} from "@tabler/icons-react";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.novic.dev';

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
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [categorieToView, setCategorieToView] = useState<CategorieInterface | null>(null);
  
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    image: undefined,
    restaurantId: undefined
  });

  const loading = status === 'loading';

  // S'assurer que les données sont des tableaux
  const categoriesArray = Array.isArray(categories) ? categories : [];
  const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];

  const filteredCategories = categoriesArray.filter((categorie: CategorieInterface) =>
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
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (categorie: CategorieInterface) => {
    setCategorieToDelete(categorie);
    setDeleteDialogOpen(true);
  };

  const openDetailDialog = (categorie: CategorieInterface) => {
    setCategorieToView(categorie);
    setDetailDialogOpen(true);
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
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="koursier-heading-1">Gestion des Catégories</h1>
          <p className="koursier-body text-muted-foreground">
            Organisez les repas par catégories pour vos restaurants
          </p>
        </div>
        <button className="koursier-btn koursier-btn-primary koursier-btn-md" onClick={() => setIsFormOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <IconCategory className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-blue-600">{categories.length}</div>
              <div className="koursier-stats-label text-blue-500/80">Total Catégories</div>
            </div>
          </div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <IconChefHat className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-green-600">{repas.length}</div>
              <div className="koursier-stats-label text-green-500/80">Total Repas</div>
            </div>
          </div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-orange-500/5 to-orange-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <IconBuildingStore className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-orange-600">{restaurants.length}</div>
              <div className="koursier-stats-label text-orange-500/80">Restaurants</div>
            </div>
          </div>
        </div>

        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <IconTrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-purple-600">
                {categories.length > 0 ? Math.round(repas.length / categories.length) : 0}
              </div>
              <div className="koursier-stats-label text-purple-500/80">Avg Repas/Cat</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="koursier-stats-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <h2 className="koursier-heading-3">Catégories ({filteredCategories.length})</h2>
          <div className="koursier-search-container max-w-md">
            <IconSearch className="koursier-search-icon" />
            <input
              className="koursier-search-input"
              placeholder="Rechercher par nom, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="koursier-scrollable overflow-x-auto">
          <table className="koursier-data-table">
            <thead>
              <tr>
                <th>Catégorie</th>
                <th>Restaurant</th>
                <th>Description</th>
                <th>Repas</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((categorie: CategorieInterface) => (
                <tr key={categorie.id}>
                  <td>
                    <div className="flex items-center gap-4">
                      <div className="koursier-avatar relative overflow-hidden rounded-full border-2 border-primary/10">
                        {categorie.image ? (
                          <img
                            src={baseImage(categorie.image || categorie.imageUrl)}
                            alt={categorie.name}
                            className="w-12 h-12 object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              if (e.currentTarget.nextElementSibling) {
                                (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-lg"
                          style={{display: categorie.image ? 'none' : 'flex'}}
                        >
                          {categorie.name[0]?.toUpperCase()}
                        </div>
                      </div>
                      <div>
                        <div className="koursier-label font-semibold">{categorie.name}</div>
                        <div className="koursier-caption text-muted-foreground">
                          ID: {categorie.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="koursier-label font-medium">
                      {categorie.restaurant?.name || `Restaurant ${categorie.restaurantId}`}
                    </div>
                  </td>
                  <td>
                    <div className="max-w-xs line-clamp-2 text-sm text-muted-foreground">
                      {categorie.description}
                    </div>
                  </td>
                  <td>
                    <Badge variant="outline" className="koursier-badge koursier-badge-info">
                      {getCategorieRepas(categorie.id).length} repas
                    </Badge>
                  </td>
                  <td className="koursier-caption text-muted-foreground">
                    {formatDate(categorie.createdAt)}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openDetailDialog(categorie)}>
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

          {(!filteredCategories || filteredCategories.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Aucune catégorie trouvée pour cette recherche." : (loading ? "Chargement..." : "Aucune catégorie enregistrée.")}
            </div>
          )}
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
                  {restaurantsArray.map((restaurant: any) => (
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
                    src={baseImage(categorie.image || categorie.imageUrl)}
                      src={formData.image instanceof File 
                        ? URL.createObjectURL(formData.image)
                        : baseImage(selectedCategorie?.image || selectedCategorie?.imageUrl)
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

      <CategoryEditForm
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        category={selectedCategorie}
        restaurants={restaurantsArray}
      />

      {/* Modal de détails */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <IconCategory className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-xl font-bold">Détails de la catégorie</div>
                <div className="text-sm text-muted-foreground">
                  {categorieToView?.name} - ID: {categorieToView?.id}
                </div>
              </div>
            </DialogTitle>
          </DialogHeader>

          {categorieToView && (
            <div className="space-y-6">
              {/* Image */}
              {categorieToView.image && (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={baseImage(categorieToView.image || categorieToView.imageUrl)}
                    alt={categorieToView.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Nom de la catégorie</Label>
                  <div className="text-lg font-semibold">{categorieToView.name}</div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Restaurant</Label>
                  <div className="text-base">
                    {categorieToView.restaurant?.name || `Restaurant ${categorieToView.restaurantId}`}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Nombre de repas</Label>
                  <Badge variant="outline" className="koursier-badge koursier-badge-info">
                    {getCategorieRepas(categorieToView.id).length} repas
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Date de création</Label>
                  <div className="text-base">{formatDate(categorieToView.createdAt)}</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                <div className="text-base p-4 bg-muted rounded-lg">
                  {categorieToView.description || "Aucune description"}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={() => {
              setDetailDialogOpen(false);
              handleEdit(categorieToView!);
            }}>
              <IconEdit className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}