"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchRepas, 
  createRepas, 
  updateRepas, 
  deleteRepas,
  clearError 
} from "@/redux/repasSlice";
import { fetchCategoriesData } from "@/redux/categoriesSlice";
import { fetchRestaurantsData } from "@/redux/restaurantSlice";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconCurrencyEuro,
  IconChefHat,
  IconCategory,
  IconPhoto
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Repas {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
  categoryId: number;
  restaurantId: number;
  disponible: boolean;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: number;
    name: string;
  };
  restaurant?: {
    id: number;
    name: string;
  };
}

interface RepasFormData {
  name: string;
  description: string;
  price: number;
  image?: string;
  categoryId: number;
  restaurantId: number;
  disponible: boolean;
}

export default function RepasPage() {
  const dispatch = useDispatch();
  const { data: repas, status, error } = useSelector((state: any) => state.repas);
  const { data: categories } = useSelector((state: any) => state.categories);
  const { data: restaurants } = useSelector((state: any) => state.restaurants);
  
  const [filteredRepas, setFilteredRepas] = useState<Repas[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRepas, setSelectedRepas] = useState<Repas | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [repasToDelete, setRepasToDelete] = useState<Repas | null>(null);
  
  const loading = status === 'loading';
  const submitLoading = status === 'loading';

  // Form state
  const [formData, setFormData] = useState<RepasFormData>({
    name: "",
    description: "",
    price: 0,
    image: "",
    categoryId: 0,
    restaurantId: 0,
    disponible: true
  });

  useEffect(() => {
    dispatch(fetchRepas());
    dispatch(fetchCategoriesData());
    dispatch(fetchRestaurantsData());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = repas?.filter(repas =>
        repas.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repas.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repas.category?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        repas.restaurant?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRepas(filtered || []);
    } else {
      setFilteredRepas(repas || []);
    }
  }, [searchTerm, repas]);

  const handleCreateOrUpdate = async () => {
    try {
      const repasData = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        image: formData.image,
        categoryId: formData.categoryId,
        restaurantId: formData.restaurantId,
        disponible: formData.disponible
      };

      if (selectedRepas) {
        await dispatch(updateRepas({ id: selectedRepas.id, data: repasData }));
      } else {
        await dispatch(createRepas(repasData));
      }
      
      setIsFormOpen(false);
      setSelectedRepas(null);
      resetForm();
      
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleEdit = (repas: Repas) => {
    setSelectedRepas(repas);
    setFormData({
      name: repas.name,
      description: repas.description,
      price: repas.price,
      image: repas.image || "",
      categoryId: repas.categoryId,
      restaurantId: repas.restaurantId,
      disponible: repas.disponible
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!repasToDelete) return;
    
    try {
      await dispatch(deleteRepas(repasToDelete.id));
      setDeleteDialogOpen(false);
      setRepasToDelete(null);
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const openDeleteDialog = (repas: Repas) => {
    setRepasToDelete(repas);
    setDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      image: "",
      categoryId: 0,
      restaurantId: 0,
      disponible: true
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
    if (!imagePath) return "/placeholder-food.jpg";
    return imagePath.startsWith('http') ? imagePath : `${BASE_URL}/${imagePath}`;
  };

  if (loading && !repas) {
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
            <IconChefHat className="h-6 w-6" />
            Gestion des Repas
          </h1>
          <p className="text-muted-foreground">
            Gérez le menu de vos restaurants
          </p>
        </div>
        <Button onClick={() => {
          setSelectedRepas(null);
          resetForm();
          setIsFormOpen(true);
        }}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouveau repas
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Repas
            </CardTitle>
            <div className="text-2xl font-bold">{repas?.length || 0}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Disponibles
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">
              {repas?.filter(r => r.disponible).length || 0}
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Prix Moyen
            </CardTitle>
            <div className="text-2xl font-bold text-blue-600">
              {repas?.length > 0 
                ? (repas.reduce((sum, r) => sum + r.price, 0) / repas.length).toFixed(0) + "€"
                : "0€"
              }
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Catégories
            </CardTitle>
            <div className="text-2xl font-bold text-orange-600">
              {categories?.length || 0}
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
            placeholder="Rechercher par nom, description, catégorie ou restaurant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Liste des repas */}
      <Card>
        <CardHeader>
          <CardTitle>Repas ({filteredRepas?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Repas</TableHead>
                  <TableHead>Prix</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepas?.map((repas) => (
                  <TableRow key={repas.id} className="kourcier-table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(repas.image)} />
                          <AvatarFallback>
                            <IconChefHat className="h-5 w-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{repas.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {repas.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 font-semibold">
                        <IconCurrencyEuro className="h-4 w-4" />
                        {repas.price.toFixed(2)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {repas.category?.name || `Catégorie ${repas.categoryId}`}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {repas.restaurant?.name || `Restaurant ${repas.restaurantId}`}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={repas.disponible ? "default" : "secondary"}>
                        {repas.disponible ? "Disponible" : "Indisponible"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(repas.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm">
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(repas)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(repas)}
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
          
          {(!filteredRepas || filteredRepas.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Aucun repas trouvé pour cette recherche." : (loading ? "Chargement..." : "Aucun repas enregistré.")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
                <IconChefHat className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {selectedRepas ? "Modifier le repas" : "Nouveau repas"}
                </DialogTitle>
                <DialogDescription className="text-sm mt-1">
                  {selectedRepas 
                    ? "Modifiez les informations du repas ci-dessous"
                    : "Ajoutez un nouveau plat délicieux à votre menu"
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
                Informations du repas
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium flex items-center gap-1">
                    Nom du repas *
                    <span className="text-red-500">•</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Ex: Pizza Margherita, Burger Classic..."
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium flex items-center gap-1">
                    Prix (€) *
                    <span className="text-red-500">•</span>
                  </Label>
                  <div className="relative">
                    <IconCurrencyEuro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      placeholder="12.50"
                      className="pl-10 transition-all focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Prix affiché aux clients
                  </p>
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
                  placeholder="Décrivez ce délicieux repas, ses ingrédients principaux, ce qui le rend spécial..."
                  rows={3}
                  className="transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Une description appetissante augmente les ventes
                </p>
              </div>
            </div>

            {/* Classification */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <IconCategory className="h-4 w-4" />
                Classification
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm font-medium flex items-center gap-1">
                    Catégorie *
                    <span className="text-red-500">•</span>
                  </Label>
                  <Select value={formData.categoryId.toString()} onValueChange={(value) => setFormData({...formData, categoryId: parseInt(value)})}>
                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                <Label htmlFor="disponible" className="text-sm font-medium">
                  Statut de disponibilité
                </Label>
                <Select value={formData.disponible.toString()} onValueChange={(value) => setFormData({...formData, disponible: value === "true"})}>
                  <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        Disponible
                      </div>
                    </SelectItem>
                    <SelectItem value="false">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-destructive"></div>
                        Indisponible
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Image */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <IconPhoto className="h-4 w-4" />
                Image du repas
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
                    placeholder="https://example.com/delicious-food.jpg"
                    className="transition-all focus:ring-2 focus:ring-primary/20"
                  />
                  <p className="text-xs text-muted-foreground">
                    Une belle photo fait toute la différence pour attirer les clients
                  </p>
                </div>
                
                {formData.image && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Aperçu</Label>
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted border-2 border-dashed border-muted-foreground/25">
                      <img 
                        src={formData.image} 
                        alt="Aperçu du repas"
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

            {/* Résumé et validation */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">
                Résumé
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium">Informations</p>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>• Nom: {formData.name || "Non défini"}</p>
                    <p>• Prix: {formData.price ? `${formData.price.toFixed(2)}€` : "Non défini"}</p>
                    <p>• Statut: {formData.disponible ? "Disponible" : "Indisponible"}</p>
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                  <p className="text-sm font-medium">Validation</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0">
                      {formData.name && formData.price > 0 && formData.categoryId && formData.restaurantId ? (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      ) : (
                        <div className="w-2 h-2 bg-destructive rounded-full"></div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formData.name && formData.price > 0 && formData.categoryId && formData.restaurantId
                        ? "Formulaire valide, prêt à être soumis"
                        : "Veuillez remplir tous les champs obligatoires"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsFormOpen(false);
                resetForm();
                setSelectedRepas(null);
              }}
              className="transition-all"
            >
              Annuler
            </Button>
            <Button 
              onClick={handleCreateOrUpdate} 
              disabled={submitLoading || !formData.name || formData.price <= 0 || !formData.categoryId || !formData.restaurantId}
              className="min-w-[120px] transition-all"
            >
              {submitLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {selectedRepas ? "Modification..." : "Création..."}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {selectedRepas ? <IconEdit className="h-4 w-4" /> : <IconPlus className="h-4 w-4" />}
                  {selectedRepas ? "Modifier" : "Créer"}
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
              Êtes-vous sûr de vouloir supprimer le repas "{repasToDelete?.name}" ?
              Cette action est irréversible.
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
