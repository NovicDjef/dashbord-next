"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { IconShoppingCart } from "@tabler/icons-react";
import { OrderManagement } from "@/components/order-management";
import {
  getCommandesAsync,
  updateCommandeStatusAsync,
  fetchLivreursDisponiblesAsync,
  assignLivreurAsync
} from "@/redux/commandeSlice";

// Transformer les données de commande en format uniforme.
// GET /commandes inclut désormais `user`, `restaurant`, `livreur` et `items`
// (COMMANDE_LIST_INCLUDE côté backend) : on lit ces champs tels quels.
const transformCommandeData = (commandes: any[], type: 'repas' | 'colis' | 'gaz') => {
  return commandes.map((item, index) => {
    // Client : User public { id, username, phone, image, createdAt }
    const clientNom = item.user?.username || '—';
    const clientTelephone = item.user?.phone || item.telephone || '—';
    const clientAdresse = item.position || '—';

    // Restaurant : { id, name, adresse, image, latitude, longitude, phone, telephone }
    const restaurantNom = item.restaurant?.name
      || (type === 'repas' ? 'Restaurant partenaire' : null);
    const restaurantAdresse = item.restaurant?.adresse || 'Adresse non spécifiée';

    // Lignes de la commande : { id, quantity, prixUnitaire, nom, plat: {...} }
    const items = Array.isArray(item.items)
      ? item.items.map((l: any) => ({
          id: l.id,
          nom: l.nom || l.plat?.name || 'Plat',
          quantity: Number(l.quantity) || 1,
          prixUnitaire: Number(l.prixUnitaire) || Number(l.plat?.prix) || 0,
        }))
      : [];

    return {
      id: item.id?.toString() || `${type}-${index}`,
      numeroCommande: item.numeroCommande || `${type.toUpperCase()}-${String(item.id || index).padStart(4, '0')}`,
      type,
      client: {
        id: item.user?.id?.toString() || item.userId?.toString() || `client-${index}`,
        nom: clientNom,
        telephone: clientTelephone,
        adresse: clientAdresse
      },
      montant: (Number(item.prix) || 0) + (Number(item.deliveryPrice) || 0),
      commission: item.commission ?? Math.round((Number(item.deliveryPrice) || 0) * 0.35),
      statutBackend: item.status,
      statut: mapStatus(item.status) as any,
      dateCommande: item.createdAt || new Date().toISOString(),
      dateLivraison: item.deliveredAt || undefined,
      // Livreur public : { id, username, prenom, telephone, image, note, ... }
      livreur: item.livreur ? {
        id: item.livreur.id?.toString() || '',
        nom: [item.livreur.prenom, item.livreur.username].filter(Boolean).join(' ') || 'Livreur assigné',
        telephone: item.livreur.telephone || ''
      } : undefined,
      restaurant: restaurantNom ? {
        id: item.restaurant?.id?.toString() || item.restaurantId?.toString() || '',
        nom: restaurantNom,
        adresse: restaurantAdresse
      } : undefined,
      items,
      details: {
        recommandation: item.recommandation || null,
        distanceKm: item.distanceKm ?? null,
        paiement: item.payment ? { mode: item.payment.mode_payement, statut: item.payment.status } : null,
      },
      notes: item.recommandation || undefined
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
  // Le store est en JS non typé : `dispatch` reste souple pour les thunks.
  const dispatch: any = useDispatch();
  const { commandes, status } = useSelector((state: any) => state.commande);
  
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
    // Vérifier que commandes est bien un tableau
    if (!commandes) {
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
      setOrders([]);
      return;
    }

    // Pour le moment, afficher TOUTES les commandes sans filtre
    // Vous pourrez filtrer par type plus tard une fois qu'on aura identifié le bon champ
    const repasOrders = transformCommandeData(commandesArray, 'repas');

    // Trier par date (plus récent en premier)
    const sortedOrders = repasOrders.sort((a, b) =>
      new Date(b.dateCommande).getTime() - new Date(a.dateCommande).getTime()
    );

    setOrders(sortedOrders);
  }, [commandes]);

  // `newStatus` vient de la table des transitions admin : c'est déjà un statut
  // de l'enum backend, on le transmet tel quel.
  const handleOrderUpdate = async (orderId: string, newStatus: string, notes?: string) => {
    const res: any = await dispatch(
      (updateCommandeStatusAsync as any)({ id: orderId, status: newStatus, raison: notes || undefined })
    );
    if (res?.error) {
      throw new Error(res.payload?.message || "Le changement de statut a été refusé.");
    }
    await loadOrders();
  };

  const handleLoadLivreurs = async () => {
    const res: any = await dispatch(fetchLivreursDisponiblesAsync());
    if (res?.error) throw new Error(res.payload?.message || "Livreurs disponibles indisponibles.");
    return res.payload || [];
  };

  const handleAssignLivreur = async (orderId: string, livreurId: number) => {
    const res: any = await dispatch((assignLivreurAsync as any)({ id: orderId, livreurId }));
    if (res?.error) throw new Error(res.payload?.message || "L'affectation a échoué.");
    await loadOrders();
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
        onLoadLivreurs={handleLoadLivreurs}
        onAssignLivreur={handleAssignLivreur}
      />
    </div>
  );
}
