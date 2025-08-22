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
  return commandes.map((item, index) => ({
    id: item.id?.toString() || `${type}-${index}`,
    numeroCommande: item.numeroCommande || `${type.toUpperCase()}-${String(item.id || index).padStart(4, '0')}`,
    type,
    client: {
      id: item.clientId?.toString() || `client-${index}`,
      nom: item.customerName || item.client?.nom || item.expediteur || `Client ${index + 1}`,
      telephone: item.client?.telephone || item.telephone || `+237 6${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      adresse: item.adresseLivraison || item.client?.adresse || item.adresse || `Adresse ${index + 1}`
    },
    montant: item.montant || item.prix || item.total || Math.random() * 50000 + 5000,
    commission: (item.montant || item.prix || 25000) * 0.1, // 10% de commission
    statut: mapStatus(item.statut || item.status) as any,
    dateCommande: item.createdAt || item.dateCommande || new Date().toISOString(),
    dateLivraison: item.dateLivraison,
    livreur: item.livreur ? {
      id: item.livreur.id?.toString() || 'livreur-1',
      nom: item.livreur.nom || item.livreurNom || 'Livreur assigné',
      telephone: item.livreur.telephone || '+237 6XX XX XX XX'
    } : undefined,
    restaurant: item.restaurant ? {
      id: item.restaurant.id?.toString() || item.restaurantId?.toString() || 'restaurant-1',
      nom: item.restaurant.nom || item.restaurantName || 'Restaurant partenaire',
      adresse: item.restaurant.adresse || 'Adresse restaurant'
    } : (type === 'repas' ? {
      id: 'restaurant-default',
      nom: 'Restaurant partenaire',
      adresse: 'Adresse non spécifiée'
    } : undefined),
    details: {
      items: item.items || item.plats || [],
      instructions: item.instructions || item.notes,
      ...item
    },
    notes: item.notes || item.commentaire
  }));
};

// Mapper les statuts vers notre format uniforme
const mapStatus = (status: string) => {
  const statusMap: { [key: string]: string } = {
    'pending': 'en_attente',
    'en_attente': 'en_attente',
    'confirmed': 'confirmee',
    'confirme': 'confirmee',
    'confirmee': 'confirmee',
    'preparing': 'preparee',
    'prepare': 'preparee',
    'preparee': 'preparee',
    'ready': 'preparee',
    'shipping': 'en_livraison',
    'en_livraison': 'en_livraison',
    'delivered': 'livree',
    'livre': 'livree',
    'livree': 'livree',
    'completed': 'livree',
    'cancelled': 'annulee',
    'annule': 'annulee',
    'annulee': 'annulee'
  };
  
  return statusMap[status?.toLowerCase()] || 'en_attente';
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
    if (commandes && commandes.length > 0) {
      const repasOrders = transformCommandeData(commandes, 'repas');
      
      // Ajouter quelques commandes gaz simulées pour la démo
      const gazOrders = Array.from({ length: 5 }, (_, index) => ({
        id: `gaz-${index}`,
        numeroCommande: `GAZ${String(1000 + index).padStart(4, '0')}`,
        type: 'gaz' as const,
        client: {
          id: `client-gaz-${index}`,
          nom: `Client Gaz ${index + 1}`,
          telephone: `+237 6${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
          adresse: `Quartier ${['Bonamoussadi', 'Akwa', 'Centre-ville', 'Makepe', 'PK8'][index % 5]}`
        },
        montant: Math.random() * 15000 + 8000,
        commission: (Math.random() * 15000 + 8000) * 0.15,
        statut: ['en_attente', 'confirmee', 'en_livraison', 'livree'][Math.floor(Math.random() * 4)] as any,
        dateCommande: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        livreur: Math.random() > 0.3 ? {
          id: `livreur-${index}`,
          nom: `Livreur Gaz ${index + 1}`,
          telephone: '+237 6XX XX XX XX'
        } : undefined,
        details: {
          marqueGaz: ['CAM GAZ', 'TRADEX', 'BOCCOM'][Math.floor(Math.random() * 3)],
          typeCommande: Math.random() > 0.5 ? 'recharge' : 'bouteille_complete',
          quantite: Math.floor(Math.random() * 3) + 1
        }
      }));

      const allOrders = [...repasOrders, ...gazOrders]
        .sort((a, b) => new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime());

      setOrders(allOrders);
    }
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
        <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded animate-pulse" />
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
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <IconShoppingCart className="h-6 w-6" />
            Gestion des Commandes
          </h1>
          <p className="text-muted-foreground">
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
