"use client"

import { useEffect, useState } from "react";
import { useHoraires } from "@/hooks/use-horaires";
import {
  IconClock,
  IconEdit,
  IconTrash,
  IconPlus,
  IconDeviceFloppy,
  IconX
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface HorairesManagementProps {
  restaurantId?: number;
  showAllRestaurants?: boolean;
}

export function HorairesManagement({ 
  restaurantId, 
  showAllRestaurants = false 
}: HorairesManagementProps) {
  const {
    horaires,
    horairesByRestaurant,
    fetchHoraires,
    fetchRestaurantHoraires,
    createHoraires,
    updateHoraire,
    deleteHoraire,
    getHorairesByRestaurant,
    formatHoraires,
    createDefaultHoraires,
    isRestaurantOpen,
    isLoading,
    isError,
    error
  } = useHoraires();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHoraire, setEditingHoraire] = useState(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState(restaurantId || 1);
  const [formData, setFormData] = useState({
    jour: '',
    heures: ''
  });

  const jours = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

  useEffect(() => {
    if (showAllRestaurants) {
      fetchHoraires();
    } else if (restaurantId) {
      fetchRestaurantHoraires(restaurantId);
    }
  }, [restaurantId, showAllRestaurants]);

  const handleSaveHoraire = () => {
    if (editingHoraire) {
      updateHoraire(editingHoraire.id, formData);
    } else {
      // Pour l'ajout, on utilise le bulk avec un seul élément
      createHoraires(selectedRestaurant, [formData]);
    }
    
    setIsDialogOpen(false);
    setEditingHoraire(null);
    setFormData({ jour: '', heures: '' });
  };

  const handleEditHoraire = (horaire) => {
    setEditingHoraire(horaire);
    setFormData({
      jour: horaire.jour,
      heures: horaire.heures
    });
    setIsDialogOpen(true);
  };

  const handleDeleteHoraire = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet horaire ?')) {
      deleteHoraire(id);
    }
  };

  const handleCreateDefault = () => {
    createDefaultHoraires(selectedRestaurant);
  };

  const currentHoraires = showAllRestaurants 
    ? horaires 
    : getHorairesByRestaurant(selectedRestaurant);
    
  const formattedHoraires = formatHoraires(currentHoraires);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Chargement des horaires...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Erreur: {error}</p>
            <Button 
              onClick={() => showAllRestaurants ? fetchHoraires() : fetchRestaurantHoraires(selectedRestaurant)}
              className="mt-2"
            >
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <IconClock className="h-6 w-6" />
            Gestion des Horaires
          </h2>
          <p className="text-muted-foreground">
            Gérez les horaires d'ouverture des restaurants
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsDialogOpen(true)}>
            <IconPlus className="h-4 w-4 mr-2" />
            Ajouter un horaire
          </Button>
          <Button variant="outline" onClick={handleCreateDefault}>
            Créer horaires par défaut
          </Button>
        </div>
      </div>

      {/* Sélecteur de restaurant */}
      {!restaurantId && (
        <Card>
          <CardContent className="p-4">
            <Label htmlFor="restaurant-select">Restaurant:</Label>
            <Select value={selectedRestaurant.toString()} onValueChange={(value) => {
              const id = parseInt(value);
              setSelectedRestaurant(id);
              fetchRestaurantHoraires(id);
            }}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Sélectionnez un restaurant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Restaurant 1</SelectItem>
                <SelectItem value="2">Restaurant 2</SelectItem>
                <SelectItem value="3">Restaurant 3</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Statut d'ouverture */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span>Statut actuel:</span>
            <Badge variant={isRestaurantOpen(selectedRestaurant) ? "default" : "destructive"}>
              {isRestaurantOpen(selectedRestaurant) ? "Ouvert" : "Fermé"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tableau des horaires */}
      <Card>
        <CardHeader>
          <CardTitle>Horaires d'ouverture</CardTitle>
        </CardHeader>
        <CardContent>
          {formattedHoraires.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <IconClock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Aucun horaire configuré</p>
              <Button onClick={handleCreateDefault} className="mt-2">
                Créer des horaires par défaut
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jour</TableHead>
                  <TableHead>Heures</TableHead>
                  {showAllRestaurants && <TableHead>Restaurant</TableHead>}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formattedHoraires.map((horaire) => (
                  <TableRow key={horaire.id}>
                    <TableCell className="font-medium">{horaire.jour}</TableCell>
                    <TableCell>
                      <Badge variant={horaire.heures === 'Fermé' ? 'destructive' : 'default'}>
                        {horaire.heures}
                      </Badge>
                    </TableCell>
                    {showAllRestaurants && (
                      <TableCell>Restaurant {horaire.restaurantId}</TableCell>
                    )}
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditHoraire(horaire)}
                        >
                          <IconEdit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteHoraire(horaire.id)}
                        >
                          <IconTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog pour ajouter/modifier */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHoraire ? 'Modifier l\'horaire' : 'Ajouter un horaire'}
            </DialogTitle>
            <DialogDescription>
              Configurez les heures d'ouverture pour le jour sélectionné
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="jour">Jour</Label>
              <Select 
                value={formData.jour} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, jour: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un jour" />
                </SelectTrigger>
                <SelectContent>
                  {jours.map(jour => (
                    <SelectItem key={jour} value={jour}>{jour}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="heures">Heures (format: HH:MM-HH:MM ou "Fermé")</Label>
              <Input
                id="heures"
                value={formData.heures}
                onChange={(e) => setFormData(prev => ({ ...prev, heures: e.target.value }))}
                placeholder="08:00-18:00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              <IconX className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button onClick={handleSaveHoraire}>
              <IconDeviceFloppy className="h-4 w-4 mr-2" />
              {editingHoraire ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}