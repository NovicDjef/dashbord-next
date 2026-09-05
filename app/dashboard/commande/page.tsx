"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconShoppingCart, IconTrendingUp } from "@tabler/icons-react";
import { OrderManagement } from "@/components/order-management";
import { 
  getCommandesAsync, 
  updateCommandeStatusAsync 
} from "@/redux/commandeSlice";

// Transformer les données de commande en format uniforme
const transformCommandeData = (commandes: any[], type: 'repas' | 'colis' | 'gaz') => {
  return commandes.map((item, index) => {
    // Extraction intelligente du nom du client
    const clientNom = item.customerName
      || item.client?.nom
      || item.client?.name
      || item.client?.prenom
      || (item.client?.prenom && item.client?.nom ? `${item.client.prenom} ${item.client.nom}` : null)
      || item.expediteur
      || item.nomClient
      || item.user?.username
      || '—';

    // Extraction intelligente du téléphone du client
    const clientTelephone = item.client?.telephone
      || item.client?.phone
      || item.telephone
      || item.phoneNumber
      || '—';

    // Extraction intelligente de l'adresse du client
    const clientAdresse = item.adresseLivraison
      || item.client?.adresse
      || item.client?.address
      || item.adresse
      || item.deliveryAddress
      || item.position
      || '—';

    // Extraction intelligente du nom du restaurant
    const restaurantNom = item.restaurant?.nom
      || item.restaurant?.name
      || item.restaurantName
      || item.nomRestaurant
      || (type === 'repas' ? 'Restaurant partenaire' : null);

    // Extraction intelligente de l'adresse du restaurant
    const restaurantAdresse = item.restaurant?.adresse
      || item.restaurant?.address
      || item.restaurantAdresse
      || 'Adresse non spécifiée';

    return {
      id: item.id?.toString() || `${type}-${index}`,
      numeroCommande: item.numeroCommande || `${type.toUpperCase()}-${String(item.id || index).padStart(4, '0')}`,
      type,
      client: {
        id: item.clientId?.toString() || item.client?.id?.toString() || `client-${index}`,
        nom: clientNom,
        telephone: clientTelephone,
        adresse: clientAdresse
      },
      montant: (Number(item.prix) || 0) + (Number(item.deliveryPrice) || 0),
      commission: item.commission ?? Math.round((Number(item.deliveryPrice) || 0) * 0.35),
      statutBackend: item.status,
      statut: mapStatus(item.statut || item.status) as any,
      dateCommande: item.createdAt || item.dateCommande || new Date().toISOString(),
      dateLivraison: item.dateLivraison,
      livreur: item.livreur ? {
        id: item.livreur.id?.toString() || 'livreur-1',
        nom: item.livreur.nom || item.livreur.name || item.livreurNom || 'Livreur assigné',
        telephone: item.livreur.telephone || item.livreur.phone || '+237 6XX XX XX XX'
      } : undefined,
      restaurant: restaurantNom ? {
        id: item.restaurant?.id?.toString() || item.restaurantId?.toString() || 'restaurant-1',
        nom: restaurantNom,
        adresse: restaurantAdresse
      } : undefined,
      details: {
        items: item.items || item.plats || [],
        instructions: item.instructions || item.notes,
        ...item
      },
      notes: item.notes || item.commentaire
    };
  });
};

// Mapper les statuts vers notre format uniforme
const mapStatus = (status: string) => {
  // Statuts backend (enum CommandeStatus) → clés de l'écran
  const statusMap: { [key: string]: string } = {
    EN_ATTENTE: 'en_attente',
    ACCEPTEE_RESTAURANT: 'confirmee',
    EN_PREPARATION: 'preparee',
    PRETE: 'preparee',
    VALIDER: 'en_livraison',
    ASSIGNEE: 'en_livraison',
    RECUPEREE: 'en_livraison',
    EN_COURS: 'en_livraison',
    LIVREE: 'livree',
    ANNULEE: 'annulee',
    REFUSEE_RESTAURANT: 'annulee',
  };
  return statusMap[String(status || '').toUpperCase()] || 'en_attente';
};

export default function CommandePage() {
  const dispatch = useDispatch();
  const { commandes, status, error } = useSelector((state: any) => state.commande);
  
  const [orders, setOrders] = useState<any[]>([]);
  const loading = status === 'loading';

  const loadOrders = async () => {
    try {
      // Charger les commandes depuis Redux
      await dispatch(getCommandesAsync());
    } catch (error) {
      console.error("Erreur lors du chargement des commandes:", error);
    }
  };

  // Traitement des commandes depuis Redux
  useEffect(() => {
    console.log("=== DEBUG COMMANDES ===");
    console.log("Type de commandes:", typeof commandes);
    console.log("Est un tableau?", Array.isArray(commandes));
    console.log("Valeur de commandes:", commandes);
    console.log("======================");

    // Vérifier que commandes est bien un tableau
    if (!commandes) {
      console.log("Commandes est null ou undefined");
      setOrders([]);
      return;
    }

    // Si commandes n'est pas un tableau, essayer d'extraire le tableau
    let commandesArray = Array.isArray(commandes) ? commandes : (commandes.data || commandes.commandes || []);

    if (!Array.isArray(commandesArray)) {
      console.error("Impossible de convertir commandes en tableau:", commandesArray);
      setOrders([]);
      return;
    }

    if (commandesArray.length === 0) {
      console.log("Aucune commande disponible");
      setOrders([]);
      return;
    }

    console.log("=== TOUTES LES COMMANDES ===");
    console.log("Total commandes:", commandesArray.length);
    console.log("Exemples de commandes:", commandesArray.slice(0, 3));
    console.log("============================");

    // Pour le moment, afficher TOUTES les commandes sans filtre
    // Vous pourrez filtrer par type plus tard une fois qu'on aura identifié le bon champ
    const repasOrders = transformCommandeData(commandesArray, 'repas');

    console.log("=== COMMANDES TRANSFORMÉES ===");
    console.log("Nombre transformées:", repasOrders.length);
    if (repasOrders.length > 0) {
      console.log("Première commande transformée:", repasOrders[0]);
    }
    console.log("==============================");

    // Trier par date (plus récent en premier)
    const sortedOrders = repasOrders.sort((a, b) =>
      new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime()
    );

    setOrders(sortedOrders);
  }, [commandes]);

  const handleOrderUpdate = async (orderId: string, newStatus: string, notes?: string) => {
    try {
      console.log(`Mise à jour commande ${orderId} vers ${newStatus}`, { notes });
      
      // Si c'est une vraie commande (pas gaz simulée), utiliser Redux
      if (!orderId.startsWith('gaz-')) {
        await dispatch(updateCommandeStatusAsync({ id: orderId, status: newStatus }));
      }
      
      // Mettre à jour localement pour les commandes simulées
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId 
            ? { ...order, statut: newStatus, notes: notes || order.notes }
            : order
        )
      );
      
      return Promise.resolve();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      throw error;
    }
  };

  useEffect(() => {
    loadOrders();
  }, [dispatch]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
        <div className="koursier-skeleton h-8 rounded w-1/3 koursier-shimmer" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="koursier-skeleton h-16 rounded koursier-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 py-4 md:gap-8 md:py-6 px-4 lg:px-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="koursier-heading-1 flex items-center gap-2">
            <IconShoppingCart className="h-7 w-7" />
            Gestion des Commandes
          </h1>
          <p className="koursier-body text-muted-foreground">
            Suivez et gérez toutes les commandes de votre plateforme de livraison
          </p>
        </div>
      </div>

      {/* Composant de gestion des commandes */}
      <OrderManagement 
        orders={orders}
        onOrderUpdate={handleOrderUpdate}
        onRefresh={loadOrders}
      />
    </div>
  );
}
