"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchRestaurantsData, 
  createRestaurant, 
  updateRestaurant, 
  deleteRestaurant,
  clearError 
} from "@/redux/restaurantSlice";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconEye,
  IconMapPin,
  IconPhone,
  IconClock,
  IconStar
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
import { RestaurantForm } from "@/components/restaurant-form";
import { RestaurantDetailModal } from "@/components/restaurant-detail-modal";
import { RestaurantEditForm } from "@/components/restaurant-edit-form";

interface Restaurant {
  id: number;
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
  createdAt: string;
  updatedAt: string;
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
  categories?: Array<{
    id: number;
    name: string;
    image?: string;
    description?: string;
  }>;
  admin?: {
    id: number;
    username: string;
    email: string;
  };
}

// Mock villes data - à remplacer par votre API
const mockVilles = [
  { id: 1, name: "Douala", latitude: 4.0435, longitude: 9.7095 },
  { id: 2, name: "Yaoundé", latitude: 3.8480, longitude: 11.5021 },
  { id: 3, name: "Bafoussam", latitude: 5.4781, longitude: 10.4199 },
  { id: 4, name: "Bamenda", latitude: 5.9631, longitude: 10.1591 }
];

export default function RestaurantPage() {
  const dispatch = useDispatch();
  const { data: restaurants, status, error } = useSelector((state: any) => state.restaurants);
  
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditFormOpen, setIsEditFormOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [restaurantToEdit, setRestaurantToEdit] = useState<Restaurant | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null);
  
  const loading = status === 'loading';
  const submitLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchRestaurantsData());
  }, [dispatch]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = restaurants.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.adresse.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.ville?.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    } else {
      setFilteredRestaurants(restaurants);
    }
  }, [searchTerm, restaurants]);

  useEffect(() => {
    if (error) {
      console.error('Erreur Redux:', error);
    }
  }, [error]);


  const handleCreateOrUpdate = async (formData: any) => {
    try {
      // Préparer les données pour l'API
      const restaurantData = {
        name: formData.name,
        phone: formData.phone,
        adresse: formData.adresse,
        description: formData.description,
        latitude: formData.latitude,
        longitude: formData.longitude,
        villeId: formData.villeId,
        adminCommissionPercent: formData.adminCommissionPercent || 0.1,
        restaurantCommissionPercent: formData.restaurantCommissionPercent || 0.9,
        heuresOuverture: formData.heuresOuverture
      };

      if (selectedRestaurant) {
        // Update restaurant
        await dispatch(updateRestaurant({ id: selectedRestaurant.id, data: restaurantData }));
      } else {
        // Create restaurant
        await dispatch(createRestaurant({
          ...restaurantData,
          adminId: 1 // ID de l'admin connecté
        }));
      }
      
      // Fermer le formulaire
      setIsFormOpen(false);
      setSelectedRestaurant(null);
      
    } catch (error) {
      console.error("Erreur:", error);
    }
  };

  const handleView = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (restaurant: Restaurant) => {
    setRestaurantToEdit(restaurant);
    setIsEditFormOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedRestaurant(null);
  };

  const handleCloseEditForm = () => {
    setIsEditFormOpen(false);
    setRestaurantToEdit(null);
  };

  const handleDelete = async () => {
    if (!restaurantToDelete) return;
    
    try {
      await dispatch(deleteRestaurant(restaurantToDelete.id));
      
      // Fermer le dialog
      setDeleteDialogOpen(false);
      setRestaurantToDelete(null);
      
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
    }
  };

  const openDeleteDialog = (restaurant: Restaurant) => {
    setRestaurantToDelete(restaurant);
    setDeleteDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getImageUrl = (imagePath?: string) => {
    if (!imagePath) return "/placeholder-restaurant.jpg";
    return imagePath.startsWith('http') ? imagePath : `https://api.novic.dev/${imagePath}`;
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
          <h1 className="text-2xl font-bold">Gestion des Restaurants</h1>
          <p className="text-muted-foreground">
            Gérez les restaurants partenaires de votre plateforme
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouveau restaurant
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Restaurants
            </CardTitle>
            <div className="text-2xl font-bold">{restaurants?.length || 0}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Restaurants Actifs
            </CardTitle>
            <div className="text-2xl font-bold text-green-600">{restaurants?.length || 0}</div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Moyenne Notes
            </CardTitle>
            <div className="text-2xl font-bold text-yellow-600">
              {restaurants?.length > 0 
                ? (restaurants.reduce((sum, r) => sum + (r.ratings || 4.5), 0) / restaurants.length).toFixed(1)
                : "0.0"
              }
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Catégories
            </CardTitle>
            <div className="text-2xl font-bold text-blue-600">
              {restaurants?.reduce((sum, r) => sum + (r.categories?.length || 0), 0) || 0}
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
            placeholder="Rechercher par nom, adresse ou ville..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </CardContent>
      </Card>

      {/* Liste des restaurants */}
      <Card>
        <CardHeader>
          <CardTitle>Restaurants ({filteredRestaurants?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Restaurant</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Catégories</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRestaurants?.map((restaurant) => (
                  <TableRow key={restaurant.id} className="kourcier-table-row">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={getImageUrl(restaurant.image)} />
                          <AvatarFallback>{restaurant.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{restaurant.name}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {restaurant.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <IconPhone className="h-3 w-3" />
                          {restaurant.phone}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {restaurant.admin?.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <IconMapPin className="h-3 w-3" />
                          {restaurant.adresse}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {restaurant.ville?.name}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <IconStar className="h-4 w-4 text-yellow-500 fill-current" />
                        <span>{restaurant.ratings?.toFixed(1) || "4.5"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Admin: {(restaurant.adminCommissionPercent * 100).toFixed(0)}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Restaurant: {(restaurant.restaurantCommissionPercent * 100).toFixed(0)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {restaurant.categories?.length || 0} catégories
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(restaurant.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleView(restaurant)}
                          title="Voir les détails"
                        >
                          <IconEye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(restaurant)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openDeleteDialog(restaurant)}
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
          
          {(!filteredRestaurants || filteredRestaurants.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm ? "Aucun restaurant trouvé pour cette recherche." : (loading ? "Chargement..." : "Aucun restaurant enregistré.")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulaire de création/édition */}
      <RestaurantForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedRestaurant(null);
        }}
        onSubmit={handleCreateOrUpdate}
        restaurant={selectedRestaurant}
        villes={mockVilles}
        loading={submitLoading}
      />

      {/* Modal de détail du restaurant */}
      <RestaurantDetailModal
        open={isDetailModalOpen}
        onOpenChange={handleCloseDetailModal}
        restaurant={selectedRestaurant}
      />

      {/* Formulaire d'édition du restaurant */}
      <RestaurantEditForm
        open={isEditFormOpen}
        onOpenChange={handleCloseEditForm}
        restaurant={restaurantToEdit}
      />

      {/* Dialog de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le restaurant "{restaurantToDelete?.name}" ?
              Cette action est irréversible et supprimera également toutes les données associées.
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
