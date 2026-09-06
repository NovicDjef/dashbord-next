import { getSomeGasOrdersAsync, updateSomeGazSatus } from '@/services/routeApi';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

// Récupérer toutes les commandes de gaz
export const getGasOrdersAsync = createAsyncThunk(
  'gas/fetchGasOrders',
  async (_, { rejectWithValue }) => {
    try {
      // Récupérer les commandes de gaz avec les relations client et livreur
      const response = await getSomeGasOrdersAsync();
      // GET /orders (staff) renvoie { orders, pagination }.
      const orders = response.data?.orders || [];
      return orders;
    } catch (error) {
      console.error("Erreur lors de la récupération des commandes de gaz:", error);
      return rejectWithValue(error.message || "Impossible de récupérer les commandes de gaz");
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