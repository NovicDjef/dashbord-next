"use client"

import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";

export function NotificationToast() {
  const { toast } = useToast();
  
  // Écouter les erreurs Redux
  const restaurantError = useSelector((state: any) => state.restaurants.error);
  const categoryError = useSelector((state: any) => state.categories.error);
  const repasError = useSelector((state: any) => state.repas.error);
  const commandeError = useSelector((state: any) => state.commande.error);

  // Écouter les statuts de succès
  const restaurantStatus = useSelector((state: any) => state.restaurants.status);
  const categoryStatus = useSelector((state: any) => state.categories.status);
  const repasStatus = useSelector((state: any) => state.repas.status);
  const commandeStatus = useSelector((state: any) => state.commande.status);

  useEffect(() => {
    if (restaurantError) {
      toast({
        variant: "destructive",
        title: "Erreur Restaurant",
        description: restaurantError,
      });
    }
  }, [restaurantError, toast]);

  useEffect(() => {
    if (categoryError) {
      toast({
        variant: "destructive",
        title: "Erreur Catégorie",
        description: categoryError,
      });
    }
  }, [categoryError, toast]);

  useEffect(() => {
    if (repasError) {
      toast({
        variant: "destructive",
        title: "Erreur Repas",
        description: repasError,
      });
    }
  }, [repasError, toast]);

  useEffect(() => {
    if (commandeError) {
      toast({
        variant: "destructive",
        title: "Erreur Commande",
        description: commandeError,
      });
    }
  }, [commandeError, toast]);

  return null; // Ce composant n'affiche rien, il écoute juste les changements d'état
}