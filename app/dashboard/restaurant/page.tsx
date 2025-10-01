"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "@/services/urlApp";
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
  IconStar,
  IconBuildingStore,
  IconCheck,
  IconCategory,
  IconSearch
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
import { RestaurantForm } from "@/components/restaurant-form-new";
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
    return imagePath.startsWith('http') ? imagePath : `${BASE_URL}/${imagePath}`;
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="koursier-stats-card">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="koursier-skeleton h-12 rounded koursier-shimmer" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="koursier-heading-1">Gestion des Restaurants</h1>
          <p className="koursier-body text-muted-foreground">
            Gérez les restaurants partenaires de votre plateforme
          </p>
        </div>
        <button className="koursier-btn koursier-btn-primary koursier-btn-md" onClick={() => setIsFormOpen(true)}>
          <IconPlus className="h-4 w-4 mr-2" />
          Nouveau restaurant
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="koursier-metric-card bg-gradient-to-br from-blue-500/5 to-blue-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <IconBuildingStore className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-blue-600">{restaurants?.length || 0}</div>
              <div className="koursier-stats-label text-blue-500/80">Total Restaurants</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-green-500/5 to-green-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <IconCheck className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-green-600">{restaurants?.length || 0}</div>
              <div className="koursier-stats-label text-green-500/80">Restaurants Actifs</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-yellow-500/5 to-yellow-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <IconStar className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-yellow-600">
                {restaurants?.length > 0 
                  ? (restaurants.reduce((sum, r) => sum + (r.ratings || 4.5), 0) / restaurants.length).toFixed(1)
                  : "0.0"
                }
              </div>
              <div className="koursier-stats-label text-yellow-500/80">Moyenne Notes</div>
            </div>
          </div>
        </div>
        <div className="koursier-metric-card bg-gradient-to-br from-purple-500/5 to-purple-600/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <IconCategory className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="koursier-stats-value text-purple-600">
                {restaurants?.reduce((sum, r) => sum + (r.categories?.length || 0), 0) || 0}
              </div>
              <div className="koursier-stats-label text-purple-500/80">Total Catégories</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des restaurants */}
      <div className="koursier-stats-card">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
          <h2 className="koursier-heading-3">Restaurants ({filteredRestaurants?.length || 0})</h2>
          <div className="koursier-search-container max-w-md">
            <IconSearch className="koursier-search-icon" />
            <input
              className="koursier-search-input"
              placeholder="Rechercher par nom, adresse ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="koursier-scrollable overflow-x-auto">
          <table className="koursier-data-table">
            <thead>
              <tr>
                <th>Restaurant</th>
                <th>Contact</th>
                <th>Localisation</th>
                <th>Note</th>
                <th>Commission</th>
                <th>Catégories</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                {filteredRestaurants?.map((restaurant) => (
                  <tr key={restaurant.id}>
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="koursier-avatar relative overflow-hidden rounded-full border-2 border-primary/10">
                          {restaurant.image ? (
                            <img 
                              src={getImageUrl(restaurant.image)} 
                              alt={restaurant.name}
                              className="w-12 h-12 object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                  e.currentTarget.nextElementSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div 
                            className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold text-lg" 
                            style={{display: restaurant.image ? 'none' : 'flex'}}
                          >
                            {restaurant.name[0]?.toUpperCase()}
                          </div>
                        </div>
                        <div>
                          <div className="koursier-label font-semibold">{restaurant.name}</div>
                          <div className="koursier-caption text-muted-foreground">
                            {restaurant.description.length > 16 ? `${restaurant.description.substring(0, 16)}...` : restaurant.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1.5 bg-green-500/10 rounded-md">
                            <IconPhone className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="font-medium">{restaurant.phone}</span>
                        </div>
                        <div className="koursier-caption text-muted-foreground pl-6">
                          {restaurant.admin?.email}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <div className="p-1.5 bg-blue-500/10 rounded-md">
                            <IconMapPin className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="font-medium">{restaurant.adresse}</span>
                        </div>
                        <div className="koursier-caption text-muted-foreground pl-6">
                          {restaurant.ville?.name}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 rounded-lg">
                        <IconStar className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-bold text-yellow-600">{restaurant.ratings?.toFixed(1) || "4.5"}</span>
                      </div>
                    </td>
                    <td>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="koursier-badge koursier-badge-success text-xs">
                            Admin: {(restaurant.adminCommissionPercent * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="koursier-badge koursier-badge-info text-xs">
                            Restaurant: {(restaurant.restaurantCommissionPercent * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="koursier-badge koursier-badge-neutral">
                        {restaurant.categories?.length || 0} catégories
                      </span>
                    </td>
                    <td className="koursier-caption">
                      {formatDate(restaurant.createdAt)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button 
                          className="koursier-btn koursier-btn-ghost koursier-btn-sm"
                          onClick={() => handleView(restaurant)}
                          title="Voir les détails"
                        >
                          <IconEye className="h-4 w-4" />
                        </button>
                        <button 
                          className="koursier-btn koursier-btn-ghost koursier-btn-sm"
                          onClick={() => handleEdit(restaurant)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </button>
                        <button 
                          className="koursier-btn koursier-btn-ghost koursier-btn-sm"
                          onClick={() => openDeleteDialog(restaurant)}
                        >
                          <IconTrash className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        
        {(!filteredRestaurants || filteredRestaurants.length === 0) && (
          <div className="text-center py-12">
            <div className="koursier-heading-4 text-muted-foreground mb-2">
              {searchTerm ? "Aucun restaurant trouvé" : (loading ? "Chargement..." : "Aucun restaurant enregistré")}
            </div>
            <div className="koursier-body text-muted-foreground">
              {searchTerm ? "Aucun restaurant ne correspond à votre recherche." : "Commencez par ajouter votre premier restaurant."}
            </div>
          </div>
        )}
      </div>

      {/* Formulaire de création/édition */}
      <RestaurantForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setSelectedRestaurant(null);
        }}
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
