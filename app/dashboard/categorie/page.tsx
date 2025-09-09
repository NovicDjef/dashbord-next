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
import { fetchRestaurantsData } from "@/redux/restaurantSlice";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconPhoto,
  IconChefHat,
  IconCategory
} from "@tabler/icons-react";
import { BASE_URL } from "@/services/urlApp";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { data: restaurants } = useSelector((state: any) => state.restaurants);
  
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
    dispatch(fetchRestaurantsData());
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
    return imagePath.startsWith('http') ? imagePath : `${BASE_URL}/${imagePath}`;
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
                    ? "Modifiez les informations de la catégorie ci-dessous"
                    : "Créez une nouvelle catégorie pour organiser vos repas"
                  }
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Informations principales */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <IconChefHat className="h-4 w-4" />
                Informations principales
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                    Nom de la catégorie *
                    <span className="text-red-500">•</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Petit déjeuner, Plats principaux..."
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="restaurantId" className="text-sm font-medium flex items-center gap-1">
                    Restaurant *
                    <span className="text-red-500">•</span>
                  </Label>
                  <Select value={formData.restaurantId.toString()} onValueChange={(value) => setFormData({...formData, restaurantId: parseInt(value)})}>
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Sélectionner un restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants?.map((restaurant: any) => (
                        <SelectItem key={restaurant.id} value={restaurant.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            {restaurant.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Décrivez cette catégorie et le type de repas qu'elle contient..."
                  rows={3}
                  className="transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Une bonne description aide les clients à comprendre cette catégorie
                </p>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Image de la catégorie
              </h4>
              
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="image" className="text-sm font-medium">
                    URL de l'image
                  </Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({...formData, image: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Ajoutez une image attrayante pour représenter cette catégorie
                  </p>
                </div>
                
                {formData.image && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Aperçu</Label>
                    <div className="relative w-full h-32 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/25">
                      <img 
                        src={formData.image} 
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Validation */}
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
              <div className="flex-shrink-0">
                {formData.name && formData.restaurantId ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-destructive rounded-full"></div>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.name && formData.restaurantId 
                  ? "Formulaire valide, prêt à être soumis"
                  : "Veuillez remplir tous les champs obligatoires (*)"}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
                setSelectedCategorie(null);
              }}
              className="transition-all"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateOrUpdate} 
              disabled={submitLoading || !formData.name || !formData.restaurantId}
              className="min-w-[120px] transition-all"
            >
              {submitLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {selectedCategorie ? "Modification..." : "Création..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {selectedCategorie ? <IconEdit className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                  {selectedCategorie ? "Modifier" : "Créer"}
                </div>
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
