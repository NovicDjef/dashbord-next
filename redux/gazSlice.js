import { getSomeGasOrdersAsync, updateSomeGazSatus } from '@/services/routeApi';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Récupérer toutes les commandes de gaz
export const getGasOrdersAsync = createAsyncThunk(
  'gas/fetchGasOrders',
  async (_, { rejectWithValue }) => {
    try {
      // ✅ Remplacez par votre vraie API endpoint pour récupérer les commandes de gaz
      const response = await getSomeGasOrdersAsync();
    
      return response.data; 
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes de gaz:", error);
      return rejectWithValue(error.message || "Impossible de récupérer les commandes de gaz");
    }
  }
);

// Récupérer les commandes de gaz d'un utilisateur spécifique
export const fetchUserGasOrdersAsync = createAsyncThunk(
  'gas/fetchUserGasOrders',
  async (userId, { rejectWithValue }) => {
    try {
      // ✅ Endpoint pour récupérer les commandes de gaz d'un utilisateur
      const response = await fetch(`/api/gas-orders/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des commandes utilisateur');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes utilisateur:", error);
      return rejectWithValue(error.message || "Impossible de récupérer les commandes utilisateur");
    }
  }
);



// Accepter une commande de gaz (pour les livreurs)
export const acceptGasOrderAsync = createAsyncThunk(
  'gas/acceptGasOrder',
  async ({ gasOrderId, livreurId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/gas-orders/${gasOrderId}/accept`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ livreurId }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'acceptation de la commande');
      }
      
      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Commande de gaz acceptée avec succès');
        
        // Sauvegarder la livraison courante dans localStorage (navigateur)
        if (data.gasOrder && typeof window !== 'undefined') {
          localStorage.setItem('currentGasLivraison', JSON.stringify(data.gasOrder));
        }
        
        return {
          gasOrderId,
          gasOrder: data.gasOrder
        };
      } else {
        return rejectWithValue(data.message || 'Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('❌ Erreur acceptation commande de gaz:', error);
      return rejectWithValue(error.message || 'Impossible d\'accepter la commande de gaz');
    }
  }
);

// Mettre à jour le statut d'une commande de gaz
export const updateGasOrderStatusAsync = createAsyncThunk(
  'gas/updateGasOrderStatus',
  async ({ gasOrderId, status, livreurId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/gas-orders/${gasOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, livreurId }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour du statut');
      }
      
      const data = await response.json();
      console.log('✅ Statut de la commande de gaz mis à jour:', data);
      return data.gasOrder;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la commande de gaz:", error);
      return rejectWithValue(error.message || "Impossible de mettre à jour le statut de la commande de gaz");
    }
  }
);

// Récupérer une commande de gaz spécifique
export const getGasOrderByIdAsync = createAsyncThunk(
  'gas/fetchGasOrderById',
  async (gasOrderId, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/gas-orders/${gasOrderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la commande');
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération de la commande de gaz:", error);
      return rejectWithValue(error.message || "Impossible de récupérer la commande de gaz");
    }
  }
);

// Annuler une commande de gaz
export const cancelGasOrderAsync = createAsyncThunk(
  'gas/cancelGasOrder',
  async ({ gasOrderId, cancellationReason }, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/gas-orders/${gasOrderId}/cancel`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cancellationReason }),
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de l\'annulation de la commande');
      }
      
      const data = await response.json();
      console.log('✅ Commande de gaz annulée:', data);
      return data.gasOrder;
    } catch (error) {
      console.error("Erreur lors de l'annulation de la commande de gaz:", error);
      return rejectWithValue(error.message || "Impossible d'annuler la commande de gaz");
    }
  }
);

export const updateGasStatusAsync = createAsyncThunk(
  'gas/updateStatus',
  async ({ id, status, livreurId }, { rejectWithValue }) => {
    try {
      const response = await updateSomeGazSatus(id, status, livreurId)
      return response.data;
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut de la commande:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de mettre à jour le statut de la commande" });
    }
  }
);
// ===== SLICE REDUX POUR LES COMMANDES DE GAZ =====

const gasSlice = createSlice({
  name: 'gas',
  initialState: {
    // Commande de gaz actuelle
    currentGasOrder: null,
    
    // Liste de toutes les commandes de gaz
    gasOrders: [],
    
    // Commandes de gaz de l'utilisateur connecté
    userOrders: [],
    
    // États de chargement et d'erreur
    loading: false,
    status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
    
    // Métadonnées
    lastUpdated: null,
    totalOrders: 0,
  },
  reducers: {
    // ✅ Actions synchrones
    resetGasState: (state) => {
      state.currentGasOrder = null;
      state.error = null;
      state.status = 'idle';
    },
    
    setCurrentGasOrder: (state, action) => {
      state.currentGasOrder = action.payload;
    },
    
    clearGasError: (state) => {
      state.error = null;
    },
    
    // ✅ Action pour mettre à jour une commande localement
    updateGasOrderLocally: (state, action) => {
      const updatedOrder = action.payload;
      
      // Mettre à jour dans gasOrders
      const orderIndex = state.gasOrders.findIndex(order => order.id === updatedOrder.id);
      if (orderIndex !== -1) {
        state.gasOrders[orderIndex] = updatedOrder;
      }
      
      // Mettre à jour dans userOrders
      const userOrderIndex = state.userOrders.findIndex(order => order.id === updatedOrder.id);
      if (userOrderIndex !== -1) {
        state.userOrders[userOrderIndex] = updatedOrder;
      }
      
      // Mettre à jour currentGasOrder si c'est la même
      if (state.currentGasOrder && state.currentGasOrder.id === updatedOrder.id) {
        state.currentGasOrder = updatedOrder;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // ===== RÉCUPÉRATION DES COMMANDES DE GAZ =====
      .addCase(getGasOrdersAsync.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(getGasOrdersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.gasOrders = action.payload;
        state.totalOrders = action.payload.length;
        state.lastUpdated = Date.now();
        state.error = null;
      })
      .addCase(getGasOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || "Impossible de récupérer les commandes de gaz";
      })

      // ===== RÉCUPÉRATION DES COMMANDES UTILISATEUR =====
      .addCase(fetchUserGasOrdersAsync.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(fetchUserGasOrdersAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.userOrders = action.payload;
        state.error = null;
      })
      .addCase(fetchUserGasOrdersAsync.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || "Impossible de récupérer les commandes utilisateur";
      })


      // ===== ACCEPTATION D'UNE COMMANDE DE GAZ =====
      .addCase(acceptGasOrderAsync.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(acceptGasOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.currentGasOrder = action.payload.gasOrder;
        
        // Mettre à jour la commande dans les listes
        const updatedOrder = action.payload.gasOrder;
        const orderIndex = state.gasOrders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          state.gasOrders[orderIndex] = updatedOrder;
        }
        
        state.error = null;
      })
      .addCase(acceptGasOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || "Impossible d'accepter la commande de gaz";
      })

      // ===== MISE À JOUR DU STATUT =====
      .addCase(updateGasOrderStatusAsync.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(updateGasOrderStatusAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        
        const updatedOrder = action.payload;
        
        // Mettre à jour dans gasOrders
        const orderIndex = state.gasOrders.findIndex(order => order.id === updatedOrder.id);
        if (orderIndex !== -1) {
          console.log(`✅ Mise à jour commande gaz #${updatedOrder.id} dans l'état local`);
          state.gasOrders[orderIndex] = updatedOrder;
        }
        
        // Mettre à jour dans userOrders
        const userOrderIndex = state.userOrders.findIndex(order => order.id === updatedOrder.id);
        if (userOrderIndex !== -1) {
          state.userOrders[userOrderIndex] = updatedOrder;
        }
        
        // Mettre à jour currentGasOrder si c'est la même
        if (state.currentGasOrder && state.currentGasOrder.id === updatedOrder.id) {
          state.currentGasOrder = updatedOrder;
        }
        
        state.error = null;
      })
      .addCase(updateGasOrderStatusAsync.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || "Impossible de mettre à jour le statut de la commande de gaz";
      })

      // ===== RÉCUPÉRATION PAR ID =====
      .addCase(getGasOrderByIdAsync.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(getGasOrderByIdAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        state.currentGasOrder = action.payload;
        state.error = null;
      })
      .addCase(getGasOrderByIdAsync.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || "Impossible de récupérer la commande de gaz";
      })

      // ===== ANNULATION D'UNE COMMANDE =====
      .addCase(cancelGasOrderAsync.pending, (state) => {
        state.loading = true;
        state.status = 'loading';
      })
      .addCase(cancelGasOrderAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'succeeded';
        
        const cancelledOrder = action.payload;
        
        // Mettre à jour dans toutes les listes
        const orderIndex = state.gasOrders.findIndex(order => order.id === cancelledOrder.id);
        if (orderIndex !== -1) {
          state.gasOrders[orderIndex] = cancelledOrder;
        }
        
        const userOrderIndex = state.userOrders.findIndex(order => order.id === cancelledOrder.id);
        if (userOrderIndex !== -1) {
          state.userOrders[userOrderIndex] = cancelledOrder;
        }
        
        if (state.currentGasOrder && state.currentGasOrder.id === cancelledOrder.id) {
          state.currentGasOrder = cancelledOrder;
        }
        
        state.error = null;
      })
      .addCase(cancelGasOrderAsync.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload || "Impossible d'annuler la commande de gaz";
      });
  },
});

// ===== EXPORT DES ACTIONS ET DU REDUCER =====
export const { 
  resetGasState, 
  setCurrentGasOrder, 
  clearGasError, 
  updateGasOrderLocally 
} = gasSlice.actions;

export default gasSlice.reducer;