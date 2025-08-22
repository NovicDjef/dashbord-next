// redux/ordersSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/Api';
// Actions async pour les commandes
export const fetchOrderDetails = createAsyncThunk(
  'orders/fetchOrderDetails',
  async (orderId, { rejectWithValue }) => {
    try {
      console.log(`🔄 Récupération détails commande ${orderId}`);
      
      const response = await apiService.get(`/commandes/${orderId}`);
      
      console.log('✅ Détails commande récupérés:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération commande:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Erreur lors de la récupération de la commande',
        status: error.response?.status
      });
    }
  }
);

export const fetchUserOrders = createAsyncThunk(
  'orders/fetchUserOrders',
  async (userId, { rejectWithValue }) => {
    try {
      console.log(`🔄 Récupération commandes utilisateur ${userId}`);
      
      const response = await apiService.get(`/users/${userId}/commandes`);
      
      console.log('✅ Commandes utilisateur récupérées:', response.data.length);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération commandes:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Erreur lors de la récupération des commandes',
        status: error.response?.status
      });
    }
  }
);

// Slice des commandes
const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: [],
    loading: false,
    error: null,
    
    // État spécifique au suivi de commande
    trackingLoading: false,
    trackingError: null,
    
    // Historique des changements de statut
    statusHistory: {},
  },
  reducers: {
    // Action pour mettre à jour le statut d'une commande (depuis les notifications)
    updateOrderStatus: (state, action) => {
      const { orderId, newStatus, timestamp, livreurInfo } = action.payload;
      
      console.log(`🔔 Mise à jour statut commande ${orderId}: ${newStatus}`);
      
      // Mettre à jour dans la liste des commandes
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        const oldStatus = state.orders[orderIndex].status;
        state.orders[orderIndex].status = newStatus;
        
        // Mettre à jour les timestamps selon le statut
        const timestampField = getTimestampField(newStatus);
        if (timestampField) {
          state.orders[orderIndex][timestampField] = timestamp;
        }
        
        // Mettre à jour les infos livreur si disponibles
        if (livreurInfo) {
          state.orders[orderIndex].livreur = livreurInfo;
        }
        
        // Sauvegarder l'historique des changements
        if (!state.statusHistory[orderId]) {
          state.statusHistory[orderId] = [];
        }
        
        state.statusHistory[orderId].push({
          from: oldStatus,
          to: newStatus,
          timestamp: timestamp || new Date().toISOString(),
          livreur: livreurInfo
        });
        
        console.log(`✅ Statut mis à jour: ${oldStatus} → ${newStatus}`);
      }
      
      // Mettre à jour la commande courante si c'est celle qui est trackée
      if (state.currentOrder && state.currentOrder.id === orderId) {
        state.currentOrder.status = newStatus;
        
        const timestampField = getTimestampField(newStatus);
        if (timestampField) {
          state.currentOrder[timestampField] = timestamp;
        }
        
        if (livreurInfo) {
          state.currentOrder.livreur = livreurInfo;
        }
      }
    },
    
    // Action pour nettoyer les erreurs
    clearOrdersError: (state) => {
      state.error = null;
      state.trackingError = null;
    },
    
    // Action pour définir la commande courante
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },
    
    // Action pour ajouter une nouvelle commande
    addOrder: (state, action) => {
      state.orders.unshift(action.payload);
      console.log('✅ Nouvelle commande ajoutée:', action.payload.id);
    },
    
    // Action pour marquer une commande comme vue
    markOrderAsViewed: (state, action) => {
      const orderId = action.payload;
      const orderIndex = state.orders.findIndex(order => order.id === orderId);
      if (orderIndex !== -1) {
        state.orders[orderIndex].viewed = true;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Gestion de fetchOrderDetails
      .addCase(fetchOrderDetails.pending, (state) => {
        state.trackingLoading = true;
        state.trackingError = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.trackingLoading = false;
        state.currentOrder = action.payload;
        state.trackingError = null;
        
        // Mettre à jour aussi dans la liste si elle existe
        const orderIndex = state.orders.findIndex(order => order.id === action.payload.id);
        if (orderIndex !== -1) {
          state.orders[orderIndex] = action.payload;
        }
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.trackingLoading = false;
        state.trackingError = action.payload?.message || 'Erreur lors du chargement';
      })
      
      // Gestion de fetchUserOrders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
        state.error = null;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Erreur lors du chargement';
      });
  },
});

// Fonction utilitaire pour mapper les statuts aux champs timestamp
const getTimestampField = (status) => {
  const mapping = {
    'VALIDER': 'validatedAt',
    'EN_PREPARATION': 'preparationStartedAt',
    'PRET': 'readyAt',
    'EN_LIVRAISON': 'shippedAt',
    'LIVREE': 'deliveredAt'
  };
  return mapping[status];
};

// Actions exportées
export const { 
  updateOrderStatus, 
  clearOrdersError, 
  setCurrentOrder, 
  addOrder,
  markOrderAsViewed 
} = ordersSlice.actions;

// Sélecteurs
export const selectOrders = (state) => state.orders.orders;
export const selectCurrentOrder = (state) => state.orders.currentOrder;
export const selectOrdersLoading = (state) => state.orders.loading;
export const selectOrdersError = (state) => state.orders.error;
export const selectTrackingLoading = (state) => state.orders.trackingLoading;
export const selectTrackingError = (state) => state.orders.trackingError;
export const selectOrderById = (orderId) => (state) => 
  state.orders.orders.find(order => order.id === orderId);
export const selectStatusHistory = (orderId) => (state) => 
  state.orders.statusHistory[orderId] || [];

export default ordersSlice.reducer;

