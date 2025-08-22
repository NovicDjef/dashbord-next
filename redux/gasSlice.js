import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiService from '../services/Api';
import { showNotification } from '../app/utils/notificationUtils';

// Web Storage utility pour remplacer AsyncStorage
const webStorage = {
  getItem: (key) => {
    if (typeof window !== 'undefined') {
      return Promise.resolve(localStorage.getItem(key));
    }
    return Promise.resolve(null);
  },
  setItem: (key, value) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, value);
    }
    return Promise.resolve();
  }
};

// Marques de gaz disponibles (synchronisées avec le backend)
export const GAS_BRANDS = {
  CAM_GAZ: { label: 'Cam Gaz', value: 'CAM_GAZ', icon: '🇨🇲' },
  TRADEX: { label: 'Tradex', value: 'TRADEX', icon: '🔥' },
  BOCCOM: { label: 'Boccom', value: 'BOCCOM', icon: '⚡' },
  SCTM: { label: 'SCTM', value: 'SCTM', icon: '🚢' },
  TOTAL_GAS: { label: 'Total Gas', value: 'TOTAL_GAS', icon: '🌍' },
  SHELL_GAS: { label: 'Shell Gas', value: 'SHELL_GAS', icon: '🐚' }
};

// Options pour le détendeur/saucle
export const REGULATOR_OPTIONS = {
  WITH: { label: 'Avec saucle (détendeur)', value: 'WITH', icon: '🔧', description: 'Inclut le détendeur' },
  WITHOUT: { label: 'Sans saucle', value: 'WITHOUT', icon: '⚙️', description: 'Bouteille seulement' }
};

// Types de commande
export const GAS_ORDER_TYPES = {
  REFILL: { 
    label: 'Recharge seulement', 
    value: 'REFILL', 
    icon: '🔄', 
    price: 6500,
    description: 'Recharge de votre bouteille vide'
  },
  FULL_BOTTLE: { 
    label: 'Achat bouteille pleine', 
    value: 'FULL_BOTTLE', 
    icon: '🆕', 
    price: 30000,
    description: 'Nouvelle bouteille avec gaz'
  }
};

// ========================================
// ACTIONS ASYNCHRONES
// ========================================

// Récupérer tous les vendeurs de gaz
export const fetchGasVendorsAsync = createAsyncThunk(
  'gas/fetchVendors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { isActive = true } = params;
      const response = await apiService.get(`/vendors?isActive=${isActive}`);

      const vendors = response.data;
      
      // Enrichir avec les informations des marques
      const enrichedVendors = vendors.map(vendor => ({
        ...vendor,
        enrichedBrands: vendor.availableBrands?.map(brandKey => GAS_BRANDS[brandKey]).filter(Boolean) || []
      }));

      return enrichedVendors;
    } catch (error) {
      console.error("Erreur lors de la récupération des vendeurs:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les vendeurs" });
    }
  }
);

// Récupérer les vendeurs proches
export const fetchNearbyVendorsAsync = createAsyncThunk(
  'gas/fetchNearbyVendors',
  async ({ latitude, longitude, radius = 10 }, { rejectWithValue }) => {
    try {
      const response = await apiService.post('/vendors/nearby', {
        latitude,
        longitude,
        radius
      });

      const data = response.data;
      
      // Enrichir avec les informations des marques
      const enrichedVendors = data.vendors.map(vendor => ({
        ...vendor,
        enrichedBrands: vendor.availableBrands?.map(brandKey => GAS_BRANDS[brandKey]).filter(Boolean) || []
      }));

      return {
        ...data,
        vendors: enrichedVendors
      };
    } catch (error) {
      console.error("Erreur lors de la recherche des vendeurs proches:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de trouver les vendeurs proches" });
    }
  }
);

// Récupérer un vendeur par ID
export const fetchVendorByIdAsync = createAsyncThunk(
  'gas/fetchVendorById',
  async (vendorId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/vendors/${vendorId}`);
      const vendor = response.data;
      
      // Enrichir avec les informations des marques
      const enrichedVendor = {
        ...vendor,
        enrichedBrands: vendor.availableBrands?.map(brandKey => GAS_BRANDS[brandKey]).filter(Boolean) || []
      };

      return enrichedVendor;
    } catch (error) {
      console.error("Erreur lors de la récupération du vendeur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Vendeur non trouvé" });
    }
  }
);

// Créer une commande de gaz

// Créer une commande de gaz
export const createGasOrderAsync = createAsyncThunk(
  'gas/createOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      // ✅ NOUVEAU - Récupérer l'userId depuis AsyncStorage
      const userData = await webStorage.getItem('userData');
      const parsedUserData = userData ? JSON.parse(userData) : null;
      const userId = parsedUserData?.id;

      console.log('📋 Données utilisateur depuis AsyncStorage:', parsedUserData);
      console.log('📋 userId récupéré:', userId);

      if (!userId) {
        return rejectWithValue({ message: 'Utilisateur non connecté' });
      }

      // Enrichir les données de commande
      const enrichedOrderData = {
        ...orderData,
        userId,
        basePrice: GAS_ORDER_TYPES[orderData.orderType]?.price || 0,
      };

      // Calculer les prix
      const subtotal = enrichedOrderData.basePrice * enrichedOrderData.quantity;
      const totalPrice = subtotal + enrichedOrderData.deliveryPrice;

      const finalOrderData = {
        ...enrichedOrderData,
        subtotal,
        totalPrice
      };

      console.log('📋 Données envoyées à l\'API:', finalOrderData);

      const response = await apiService.post('/orders', finalOrderData);

      return response.data.order;
    } catch (error) {
      if (error.response) {
        console.error("Erreur API (status):", error.response.status);
        console.error("Erreur API (data):", error.response.data);
      } else {
        console.error("Erreur Axios:", error.message);
      }
      return rejectWithValue(error.response?.data || { message: "Impossible de créer la commande" });
    }
  }
);

// Récupérer les commandes de l'utilisateur

export const fetchUserGasOrdersAsync = createAsyncThunk(
  'gas/fetchUserOrders',
  async ({ page = 1, limit = 20, status } = {}, { rejectWithValue }) => {
    try {
      const userDataString = await webStorage.getItem('userData');
      if (!userDataString) throw new Error('Utilisateur non connecté');

      const userData = JSON.parse(userDataString);
      const userId = userData?.id;

      if (!userId) throw new Error('ID utilisateur manquant');

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(status && { status }),
      });

      const response = await apiService.get(`/orders/user/${userId}?${queryParams}`);
      return response.data;

    } catch (error) {
      console.error("Erreur lors de la récupération des commandes:", error.response?.data || error.message);
      return rejectWithValue(error.response?.data || { message: error.message || "Erreur inconnue" });
    }
  }
);

// Action pour détecter les changements de statut et envoyer des notifications
export const updateGasOrderStatusAsync = createAsyncThunk(
  'gas/updateOrderStatus',
  async (orderData, { getState, rejectWithValue }) => {
    try {
      const currentState = getState();
      const currentOrder = currentState.gas.userOrders.find(o => o.id === orderData.id);
      
      // Si le statut a changé, créer une notification
      if (currentOrder && currentOrder.status !== orderData.status) {
        console.log(`🔔 Changement de statut détecté pour la commande gaz ${orderData.id}: ${currentOrder.status} -> ${orderData.status}`);
        
        try {
          await showNotification(
            orderData,
            'gas',
            orderData.status
          );
          console.log('✅ Notification de mise à jour créée pour la commande gaz');
        } catch (notificationError) {
          console.error('❌ Erreur lors de la création de la notification:', notificationError);
        }
      }
      
      return orderData;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut:", error);
      return rejectWithValue(error.message || "Erreur lors de la mise à jour du statut");
    }
  }
);

// Récupérer une commande par ID
export const fetchGasOrderByIdAsync = createAsyncThunk(
  'gas/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/orders/${orderId}`);

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Commande non trouvée" });
    }
  }
);

// Annuler une commande
export const cancelGasOrderAsync = createAsyncThunk(
  'gas/cancelOrder',
  async ({ orderId, cancellationReason }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/orders/${orderId}/cancel`, {
        cancellationReason
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de l'annulation de la commande:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible d'annuler la commande" });
    }
  }
);

// Créer un avis sur une commande
export const createOrderReviewAsync = createAsyncThunk(
  'gas/createOrderReview',
  async (reviewData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = state.user?.currentUser?.id;

      if (!userId) {
        return rejectWithValue({ message: 'Utilisateur non connecté' });
      }

      const response = await apiService.post('/reviews/order', {
        ...reviewData,
        userId
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'avis:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de créer l'avis" });
    }
  }
);

// Créer un avis sur un vendeur
export const createVendorReviewAsync = createAsyncThunk(
  'gas/createVendorReview',
  async (reviewData, { rejectWithValue, getState }) => {
    try {
      const state = getState();
      const userId = state.user?.currentUser?.id;

      if (!userId) {
        return rejectWithValue({ message: 'Utilisateur non connecté' });
      }

      const response = await apiService.post('/reviews/vendor', {
        ...reviewData,
        userId
      });

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la création de l'avis vendeur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de créer l'avis" });
    }
  }
);

// Récupérer les avis d'un vendeur
export const fetchVendorReviewsAsync = createAsyncThunk(
  'gas/fetchVendorReviews',
  async ({ vendorId, page = 1, limit = 10 }, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await apiService.get(`/vendors/${vendorId}/reviews?${queryParams}`);

      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération des avis:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les avis" });
    }
  }
);

export const refreshOrderStatusAsync = createAsyncThunk(
  'gas/refreshOrderStatus',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/orders/${orderId}/status`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du statut:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de rafraîchir le statut" });
    }
  }
);

// 2. ✅ NOUVEAU - Action pour marquer une commande comme livrée (côté client)
export const confirmOrderDeliveryAsync = createAsyncThunk(
  'gas/confirmDelivery',
  async ({ orderId, deliveryCode }, { rejectWithValue }) => {
    try {
      const response = await apiService.patch(`/orders/${orderId}/confirm-delivery`, {
        deliveryCode
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la confirmation de livraison:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de confirmer la livraison" });
    }
  }
);

// 3. ✅ NOUVEAU - Action pour obtenir les détails du livreur
export const fetchDeliveryPersonAsync = createAsyncThunk(
  'gas/fetchDeliveryPerson',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await apiService.get(`/orders/${orderId}/delivery-person`);
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la récupération du livreur:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Livreur non assigné" });
    }
  }
);

// 4. ✅ NOUVEAU - Action pour signaler un problème sur une commande
export const reportOrderIssueAsync = createAsyncThunk(
  'gas/reportIssue',
  async ({ orderId, issueType, description }, { rejectWithValue }) => {
    try {
      const response = await apiService.post(`/orders/${orderId}/report-issue`, {
        issueType,
        description
      });
      return response.data;
    } catch (error) {
      console.error("Erreur lors du signalement:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de signaler le problème" });
    }
  }
);

// ========================================
// SLICE REDUX
// ========================================

const gasSlice = createSlice({
  name: 'gas',
  initialState: {
    // Vendeurs
    vendors: [],
    nearbyVendors: [],
    selectedVendor: null,
    
    // Commandes
    userOrders: [],
    currentOrder: null,
    loading: false,
    
    // Avis
    vendorReviews: [],
    
    // États de formulaire
    orderForm: {
      selectedBrand: '',
      hasRegulator: '',
      orderType: '',
      quantity: 1,
      deliveryAddress: '',
      phone: '',
      specialInstructions: '',
    },
    
    // Localisation
    userLocation: null,
    searchRadius: 10,
    
    // Pagination
    pagination: {
      vendors: { page: 1, limit: 20, total: 0 },
      orders: { page: 1, limit: 20, total: 0 },
      reviews: { page: 1, limit: 10, total: 0 }
    },

     // ✅ NOUVEAUX - États spécifiques pour le suivi de commande
    orderTracking: {
      isRefreshing: false,
      lastRefreshed: null,
      autoRefreshInterval: null,
    },
    
    // ✅ NOUVEAUX - États de chargement granulaires
    loadingStates: {
      isSubmittingOrder: false,
      isCancellingOrder: false,
      isConfirmingDelivery: false,
      isReportingIssue: false,
      isFetchingDeliveryPerson: false,
    },

    // ✅ NOUVEAU - Détails du livreur pour la commande courante
    currentDeliveryPerson: null,

    // États de chargement et erreurs
    status: 'idle',
    error: null,
  },
  reducers: {
    // Actions pour le formulaire de commande
    updateOrderForm: (state, action) => {
      state.orderForm = { ...state.orderForm, ...action.payload };
    },
    
    resetOrderForm: (state) => {
      state.orderForm = {
        selectedBrand: '',
        hasRegulator: '',
        orderType: '',
        quantity: 1,
        deliveryAddress: '',
        phone: '',
        specialInstructions: '',
      };
    },
    
    // Actions pour la localisation
    setUserLocation: (state, action) => {
      state.userLocation = action.payload;
    },
    
    setSearchRadius: (state, action) => {
      state.searchRadius = action.payload;
    },
    
    // Actions pour la sélection
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload;
    },
    
    setCurrentOrder: (state, action) => {
      state.currentOrder = action.payload;
    },

    // Reset d'état
    resetGasState: (state) => {
      state.error = null;
      state.status = 'idle';
    },
    // ✅ NOUVEAUX - Reducers pour le suivi de commande
    startAutoRefresh: (state, action) => {
      state.orderTracking.autoRefreshInterval = action.payload;
    },

    stopAutoRefresh: (state) => {
      state.orderTracking.autoRefreshInterval = null;
    },

    updateLastRefreshed: (state) => {
      state.orderTracking.lastRefreshed = new Date().toISOString();
    },

    clearOrderTrackingError: (state) => {
      state.error = null;
    },

    resetCurrentDeliveryPerson: (state) => {
      state.currentDeliveryPerson = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch vendors
      .addCase(fetchGasVendorsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGasVendorsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vendors = action.payload;
      })
      .addCase(fetchGasVendorsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer les vendeurs";
      })
      
      // Fetch nearby vendors
      .addCase(fetchNearbyVendorsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchNearbyVendorsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.nearbyVendors = action.payload.vendors;
        state.pagination.vendors = {
          ...state.pagination.vendors,
          total: action.payload.totalFound
        };
      })
      .addCase(fetchNearbyVendorsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de trouver les vendeurs proches";
      })
      
      // Fetch vendor by ID
      .addCase(fetchVendorByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVendorByIdAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedVendor = action.payload;
      })
      .addCase(fetchVendorByIdAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Vendeur non trouvé";
      })
      
      // Create order
      .addCase(createGasOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createGasOrderAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
        state.userOrders.unshift(action.payload);
        // Reset form after successful order
        gasSlice.caseReducers.resetOrderForm(state);
      })
      .addCase(createGasOrderAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de créer la commande";
      })
      
      // Fetch user orders
      .addCase(fetchUserGasOrdersAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUserGasOrdersAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        
        // Conserver les anciennes commandes pour détecter les changements
        const oldOrders = [...state.userOrders];
        state.userOrders = action.payload.orders;
        
        // Détecter les changements de statut
        if (oldOrders.length > 0) {
          action.payload.orders.forEach(newOrder => {
            const oldOrder = oldOrders.find(o => o.id === newOrder.id);
            if (oldOrder && oldOrder.status !== newOrder.status) {
              console.log(`🔔 Détection changement statut commande gaz ${newOrder.id}: ${oldOrder.status} -> ${newOrder.status}`);
            }
          });
        }
        
        state.pagination.orders = {
          ...state.pagination.orders,
          ...action.payload.pagination
        };
      })
      .addCase(fetchUserGasOrdersAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer les commandes";
      })
      
      // Fetch order by ID
      .addCase(fetchGasOrderByIdAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchGasOrderByIdAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentOrder = action.payload;
      })
      .addCase(fetchGasOrderByIdAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Commande non trouvée";
      })
      
      // Cancel order
      .addCase(cancelGasOrderAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(cancelGasOrderAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedOrder = action.payload.order;
        // Mettre à jour dans la liste
        const index = state.userOrders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.userOrders[index] = updatedOrder;
        }
        // Mettre à jour l'ordre actuel si c'est le même
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(cancelGasOrderAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible d'annuler la commande";
      })
      
      // Create order review
      .addCase(createOrderReviewAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createOrderReviewAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const review = action.payload.review;
        
        // Mettre à jour la commande avec l'avis
        const orderIndex = state.userOrders.findIndex(order => order.id === review.orderId);
        if (orderIndex !== -1) {
          state.userOrders[orderIndex].review = review;
        }
        
        if (state.currentOrder && state.currentOrder.id === review.orderId) {
          state.currentOrder.review = review;
        }
      })
      .addCase(createOrderReviewAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de créer l'avis";
      })
      
      // Create vendor review
      .addCase(createVendorReviewAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(createVendorReviewAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ajouter l'avis à la liste des avis du vendeur
        state.vendorReviews.unshift(action.payload.review);
      })
      .addCase(createVendorReviewAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de créer l'avis";
      })
      
      // Fetch vendor reviews
      .addCase(fetchVendorReviewsAsync.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchVendorReviewsAsync.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.vendorReviews = action.payload.reviews;
        state.pagination.reviews = {
          ...state.pagination.reviews,
          ...action.payload.pagination
        };
      })
      .addCase(fetchVendorReviewsAsync.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.message || "Impossible de récupérer les avis";
      })
  // Refresh order status
      .addCase(refreshOrderStatusAsync.pending, (state) => {
        state.orderTracking.isRefreshing = true;
      })
      .addCase(refreshOrderStatusAsync.fulfilled, (state, action) => {
        state.orderTracking.isRefreshing = false;
        
        // Mettre à jour la commande courante si c'est la même
        if (state.currentOrder && state.currentOrder.id === action.payload.id) {
          state.currentOrder = { ...state.currentOrder, ...action.payload };
        }
        
        // Mettre à jour dans la liste des commandes
        const index = state.userOrders.findIndex(order => order.id === action.payload.id);
        if (index !== -1) {
          state.userOrders[index] = { ...state.userOrders[index], ...action.payload };
        }
        
        state.orderTracking.lastRefreshed = new Date().toISOString();
      })
      .addCase(refreshOrderStatusAsync.rejected, (state, action) => {
        state.orderTracking.isRefreshing = false;
        state.error = action.payload?.message || "Impossible de rafraîchir le statut";
      })
      
      // Confirm delivery
      .addCase(confirmOrderDeliveryAsync.pending, (state) => {
        state.loadingStates.isConfirmingDelivery = true;
        state.error = null;
      })
      .addCase(confirmOrderDeliveryAsync.fulfilled, (state, action) => {
        state.loadingStates.isConfirmingDelivery = false;
        const updatedOrder = action.payload.order;
        
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
        
        const index = state.userOrders.findIndex(order => order.id === updatedOrder.id);
        if (index !== -1) {
          state.userOrders[index] = updatedOrder;
        }
      })
      .addCase(confirmOrderDeliveryAsync.rejected, (state, action) => {
        state.loadingStates.isConfirmingDelivery = false;
        state.error = action.payload?.message || "Impossible de confirmer la livraison";
      })
      
      // Fetch delivery person
      .addCase(fetchDeliveryPersonAsync.pending, (state) => {
        state.loadingStates.isFetchingDeliveryPerson = true;
      })
      .addCase(fetchDeliveryPersonAsync.fulfilled, (state, action) => {
        state.loadingStates.isFetchingDeliveryPerson = false;
        state.currentDeliveryPerson = action.payload.deliveryPerson;
      })
      .addCase(fetchDeliveryPersonAsync.rejected, (state, action) => {
        state.loadingStates.isFetchingDeliveryPerson = false;
        // Ne pas considérer comme une erreur critique si le livreur n'est pas assigné
        if (!action.payload?.message?.includes("non assigné")) {
          state.error = action.payload?.message || "Erreur lors de la récupération du livreur";
        }
      })
      
      // Report issue
      .addCase(reportOrderIssueAsync.pending, (state) => {
        state.loadingStates.isReportingIssue = true;
        state.error = null;
      })
      .addCase(reportOrderIssueAsync.fulfilled, (state, action) => {
        state.loadingStates.isReportingIssue = false;
        // Optionnel : mettre à jour la commande avec le rapport d'incident
        if (state.currentOrder && action.payload.orderId === state.currentOrder.id) {
          state.currentOrder.hasReportedIssue = true;
        }
      })
      .addCase(reportOrderIssueAsync.rejected, (state, action) => {
        state.loadingStates.isReportingIssue = false;
        state.error = action.payload?.message || "Impossible de signaler le problème";
      })
      
      // Gestion de la mise à jour de statut
      .addCase(updateGasOrderStatusAsync.fulfilled, (state, action) => {
        const updatedOrder = action.payload;
        const index = state.userOrders.findIndex(o => o.id === updatedOrder.id);
        if (index !== -1) {
          state.userOrders[index] = updatedOrder;
        }
        if (state.currentOrder && state.currentOrder.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      });
  }
});

// ========================================
// ACTIONS EXPORTÉES
// ========================================

export const {
  updateOrderForm,
  resetOrderForm,
  setUserLocation,
  setSearchRadius,
  setSelectedVendor,
  setCurrentOrder,
  resetGasState
} = gasSlice.actions;

export default gasSlice.reducer;

// ========================================
// SÉLECTEURS
// ========================================

// Sélecteurs de base
export const selectGasVendors = (state) => state.gas.vendors;
export const selectNearbyVendors = (state) => state.gas.nearbyVendors;
export const selectSelectedVendor = (state) => state.gas.selectedVendor;
export const selectUserGasOrders = (state) => state.gas.userOrders;
export const selectCurrentOrder = (state) => state.gas.currentOrder;
export const selectOrderForm = (state) => state.gas.orderForm;
export const selectUserLocation = (state) => state.gas.userLocation;
export const selectGasStatus = (state) => state.gas.status;
export const selectGasError = (state) => state.gas.error;


export const selectOrderTrackingState = (state) => state.gas.orderTracking;
export const selectLoadingStates = (state) => state.gas.loadingStates;
export const selectCurrentDeliveryPerson = (state) => state.gas.currentDeliveryPerson;

// Sélecteurs calculés
export const selectOrdersNeedingReview = (state) => {
  return state.gas.userOrders.filter(order => 
    order.status === 'LIVREE' && !order.review
  );
};

export const selectCompletedOrders = (state) => {
  return state.gas.userOrders.filter(order => order.status === 'LIVREE');
};

export const selectPendingOrders = (state) => {
  return state.gas.userOrders.filter(order => 
    ['EN_ATTENTE', 'VALIDER', 'EN_COURS', 'LIVREE', 'ANNULEE', 'REMBOURSE'].includes(order.status)
  );
};

export const selectOrderFormTotal = (state) => {
  const form = state.gas.orderForm;
  const selectedVendor = state.gas.selectedVendor;
  
  if (!form.orderType || !selectedVendor) return 0;
  
  const basePrice = GAS_ORDER_TYPES[form.orderType]?.price || 0;
  const subtotal = basePrice * form.quantity;
  const deliveryPrice = selectedVendor.deliveryPrice || 0;
  
  return {
    basePrice,
    subtotal,
    deliveryPrice,
    total: subtotal + deliveryPrice
  };
};