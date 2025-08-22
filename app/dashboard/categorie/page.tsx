"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchCategoriesData, 
  createCategory, 
  updateCategory, 
  deleteCategory,
  clearError 
} from "@/redux/categoriesSlice";
import { fetchRepas } from "@/redux/repasSlice";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconPhoto,
  IconChefHat,
  IconCategory
} from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Categorie {
  id: number;
  name: string;
  image?: string;
  description: string;
  restaurantId: number;
  createdAt: string;
  updatedAt: string;
  restaurant?: {
    id: number;
    name: string;
  };
  repas?: Array<{
    id: number;
    name: string;
    price: number;
    description: string;
    image?: string;
  }>;
}

interface CategorieFormData {
  name: string;
  description: string;
  image?: string;
  restaurantId: number;
}

export default function CategoriePage() {
  const dispatch = useDispatch();
  const { data: categories, status, error } = useSelector((state: any) => state.categories);
  const { data: repas } = useSelector((state: any) => state.repas);
  
  const [filteredCategories, setFilteredCategories] = useState<Categorie[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categorieToDelete, setCategorieToDelete] = useState<Categorie | null>(null);
  
  const loading = status === 'loading';
  const submitLoading = status === 'loading';

  // Form state
  const [formData, setFormData] = useState<CategorieFormData>({
    name: "",
    description: "",
    image: "",
    restaurantId: 0
  });

  useEffect(() => {
    dispatch(fetchCategoriesData());
    dispatch(fetchRepas());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = categories.filter(categorie =>
        categorie.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categorie.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        categorie.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories);
    }
  }, [searchTerm, categories]);


  const handleCreateOrUpdate = async () => {
    try {
      const categorieData = {
        name: formData.name,
        description: formData.description,
        image: formData.image,
        restaurantId: formData.restaurantId
      };

      if (selectedCategorie) {
        // Update categorie
        await dispatch(updateCategory({ id: selectedCategorie.id, data: categorieData }));
      } else {
        // Create categorie
        await dispatch(createCategory(categorieData));
      }
      
      // Close form
      setIsFormOpen(false);
      setSelectedCategorie(null);
      resetForm();
      
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (categorie: Categorie) => {
    setSelectedCategorie(categorie);
    setFormData({
      name: categorie.name,
      description: categorie.description,
      image: categorie.image || "",
      restaurantId: categorie.restaurantId
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!categorieToDelete) return;
    
    try {
      await dispatch(deleteCategory(categorieToDelete.id));
      setDeleteDialogOpen(false);
      setCategorieToDelete(null);
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const openDeleteDialog = (categorie: Categorie) => {
    setCategorieToDelete(categorie);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      image: "",
      restaurantId: 0
    });
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
    return imagePath.startsWith('http') ? imagePath : `https://api.novic.dev/${imagePath}`;
  };

  const getCategorieRepas = (categorieId: number) => {
    return repas.filter(r => r.categorieId === categorieId || r.categoryId === categorieId);
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IconCategory className="h-6 w-6" />
            Gestion des Catégories
          </h1>
          <p className="text-muted-foreground">
            Organisez les repas par catégories pour vos restaurants
          </p>
        </div>
        <Button onClick={() => {
          setSelectedCategorie(null);
          resetForm();
          setIsFormOpen(true);
        }}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouvelle catégorie
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Catégories
            </CardTitle>
            <div className="text-2xl font-bold">{categories?.length || 0}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Repas
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">{repas?.length || 0}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories Actives
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{categories?.length || 0}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Restaurants
            </CardTitle>
            <div className="text-2xl font-bold text-blue-600">
              {categories ? new Set(categories.map(c => c.restaurantId)).size : 0}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Recherche */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Rechercher par nom, description ou restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Liste des catégories */}
      <Card>
        <CardHeader>
          <CardTitle>Catégories ({filteredCategories?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Repas</TableHead>
                  <TableHead>Créée le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories?.map((categorie) => (
                  <TableRow key={categorie.id} className="kourcier-table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(categorie.image)} />
                          <AvatarFallback>
                            <IconChefHat className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{categorie.name}</div>
                          <div className="text-sm text-muted-foreground">
                            ID: {categorie.id}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {categorie.restaurant?.name || `Restaurant ${categorie.restaurantId}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs line-clamp-2 text-sm text-muted-foreground">
                        {categorie.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategorieRepas(categorie.id).length} repas
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(categorie.createdAt)}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {(!filteredCategories || filteredCategories.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Aucune catégorie trouvée pour cette recherche." : (loading ? "Chargement..." : "Aucune catégorie enregistrée.")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCategorie ? "Modifier la catégorie" : "Nouvelle catégorie"}
            </DialogTitle>
            <DialogDescription>
              {selectedCategorie 
                ? "Modifiez les informations de la catégorie ci-dessous"
                : "Remplissez les informations pour créer une nouvelle catégorie"
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nom de la catégorie *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Ex: Petit déjeuner, Plats principaux..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Décrivez cette catégorie..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image">URL de l'image</Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) => setFormData({...formData, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <Label htmlFor="restaurantId">ID du restaurant *</Label>
              <Input
                id="restaurantId"
                type="number"
                value={formData.restaurantId || ""}
                onChange={(e) => setFormData({...formData, restaurantId: parseInt(e.target.value) || 0})}
                placeholder="1"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleCreateOrUpdate} 
              disabled={submitLoading || !formData.name}
            >
              {submitLoading ? (
                selectedCategorie ? "Modification..." : "Création..."
              ) : (
                selectedCategorie ? "Modifier" : "Créer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de suppression */}
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
