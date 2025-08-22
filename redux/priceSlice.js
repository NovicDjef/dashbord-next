// Redux Slice corrigé pour les prix
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getchSomePriceCommande, 
  // getchSomePriceColis,
  // getAllTarifs,
  // calculatePriceColis,
  // calculatePriceRepas,
  // getTarifsSimple
} from '@/services/routeApi';

// Thunk pour récupérer les prix des commandes
export const fetchPriceCommandeData = createAsyncThunk(
  'price/fetchPriceCommande', // 👈 Changé pour cohérence
  async (_, { rejectWithValue }) => {
    try {
      const response = await getchSomePriceCommande();
      console.log("📊 Response Commande API:", response.data.tarifs.REPAS);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur Commande API:", error);
      // Gestion d'erreur plus robuste
      return rejectWithValue(
        error.response?.data || 
        error.message || 
        'Erreur lors du chargement des prix commande'
      );
    }
  }
);

// Thunk pour récupérer les prix des colis
// export const fetchPriceColisData = createAsyncThunk(
//   'price/fetchPriceColis', // 👈 Changé pour cohérence
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("Récupération des prix des colis...");
//       const response = await getchSomePriceColis();
//       console.log("📦 Response Colis API:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Erreur Colis API:", error);
//       // Gestion d'erreur plus robuste
//       return rejectWithValue(
//         error.response?.data || 
//         error.message || 
//         'Erreur lors du chargement des prix colis'
//       );
//     }
//   }
// );


// export const fetchPriceColisData = createAsyncThunk(
//   'price/fetchPriceColisWithRetry',
//   async (_, { rejectWithValue }) => {
//     const maxRetries = 3;
//     const timeout = 10000; // 10 secondes
    
//     for (let attempt = 1; attempt <= maxRetries; attempt++) {
//       try {
//         console.log(`🔄 Tentative ${attempt}/${maxRetries}`);
        
//         // Promise avec timeout
//         const response = await Promise.race([
//           apiService.get('/prixcolis'),
//           new Promise((_, reject) => 
//             setTimeout(() => reject(new Error('Timeout')), timeout)
//           )
//         ]);
        
//         console.log(`✅ Tentative ${attempt} réussie:`, response.data);
//         return response.data;
        
//       } catch (error) {
//         console.log(`❌ Tentative ${attempt} échouée:`, error.message);
        
//         if (attempt === maxRetries) {
//           return rejectWithValue(`Échec après ${maxRetries} tentatives: ${error.message}`);
//         }
        
//         // Attendre avant retry
//         await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
//       }
//     }
//   }
// );

// 🚀 NOUVEAUX THUNKS POUR LE GESTIONNAIRE DE TARIFS

// Récupérer tous les tarifs avec conditions actuelles
// export const fetchAllTarifs = createAsyncThunk(
//   'price/fetchAllTarifs',
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("📊 Récupération de tous les tarifs...");
//       const response = await getAllTarifs();
//       console.log("✅ Tarifs récupérés:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Erreur récupération tarifs:", error);
//       return rejectWithValue(
//         error.response?.data || 
//         error.message || 
//         'Erreur lors du chargement des tarifs'
//       );
//     }
//   }
// );

// Calculer le prix d'un colis en temps réel
// export const calculateColisPrice = createAsyncThunk(
//   'price/calculateColisPrice',
//   async (poids, { rejectWithValue }) => {
//     try {
//       console.log(`💰 Calcul prix colis pour ${poids}kg...`);
//       const response = await calculatePriceColis(poids);
//       console.log("✅ Prix calculé:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Erreur calcul prix colis:", error);
//       return rejectWithValue(
//         error.response?.data || 
//         error.message || 
//         'Erreur lors du calcul du prix'
//       );
//     }
//   }
// );

// Calculer le prix d'un repas en temps réel
// export const calculateRepasPrice = createAsyncThunk(
//   'price/calculateRepasPrice',
//   async (distance = 0, { rejectWithValue }) => {
//     try {
//       console.log(`🍽️ Calcul prix repas pour ${distance}km...`);
//       const response = await calculatePriceRepas(distance);
//       console.log("✅ Prix calculé:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Erreur calcul prix repas:", error);
//       return rejectWithValue(
//         error.response?.data || 
//         error.message || 
//         'Erreur lors du calcul du prix'
//       );
//     }
//   }
// );

// Récupérer les tarifs simplifiés
// export const fetchSimpleTarifs = createAsyncThunk(
//   'price/fetchSimpleTarifs',
//   async (_, { rejectWithValue }) => {
//     try {
//       console.log("📋 Récupération tarifs simplifiés...");
//       const response = await getTarifsSimple();
//       console.log("✅ Tarifs simplifiés récupérés:", response.data);
//       return response.data;
//     } catch (error) {
//       console.error("❌ Erreur tarifs simplifiés:", error);
//       return rejectWithValue(
//         error.response?.data || 
//         error.message || 
//         'Erreur lors du chargement des tarifs simplifiés'
//       );
//     }
//   }
// );


// Slice Redux corrigé
const priceSlice = createSlice({
  name: 'price', // 👈 Changé de 'prix' à 'price' pour cohérence
  initialState: {
    // Anciens états pour la compatibilité
    dataCommande: [],
    dataColis: [],
    statusCommande: 'idle',
    statusColis: 'idle',
    errorCommande: null,
    errorColis: null,
    
    // 🚀 NOUVEAUX ÉTATS POUR LE GESTIONNAIRE DE TARIFS
    tarifs: null, // Structure complète des tarifs
    calculatedPrice: null, // Prix calculé en temps réel
    statusTarifs: 'idle',
    statusCalculation: 'idle',
    errorTarifs: null,
    errorCalculation: null,
    conditions: null // Conditions actuelles (weekend, nuit, etc.)
  },
  reducers: {
    // Reducer pour réinitialiser les erreurs
    clearErrors: (state) => {
      state.errorCommande = null;
      state.errorColis = null;
      state.errorTarifs = null;
      state.errorCalculation = null;
    },
    // Reducer pour réinitialiser les données
    resetData: (state) => {
      state.dataCommande = [];
      state.dataColis = [];
      state.statusCommande = 'idle';
      state.statusColis = 'idle';
      state.calculatedPrice = null;
      state.statusCalculation = 'idle';
    },
    // 🚀 NOUVEAUX REDUCERS
    clearCalculatedPrice: (state) => {
      state.calculatedPrice = null;
      state.errorCalculation = null;
      state.statusCalculation = 'idle';
    },
    updateConditions: (state, action) => {
      state.conditions = action.payload;
    },
    // 🎯 Nouveau: stocker le calcul local
    setLocalCalculation: (state, action) => {
      state.calculatedPrice = action.payload;
      state.statusCalculation = 'succeeded';
      state.errorCalculation = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // === GESTION DES COMMANDES ===
      .addCase(fetchPriceCommandeData.pending, (state) => {
        state.statusCommande = 'loading';
        state.errorCommande = null;
      })
      .addCase(fetchPriceCommandeData.fulfilled, (state, action) => {
        state.statusCommande = 'succeeded';
        state.dataCommande = action.payload;
        state.errorCommande = null;
      })
      .addCase(fetchPriceCommandeData.rejected, (state, action) => {
        state.statusCommande = 'failed';
        state.errorCommande = action.payload;
        state.dataCommande = [];
      })
      
      // === GESTION DES COLIS ===
      // .addCase(fetchPriceColisData.pending, (state) => {
      //   state.statusColis = 'loading';
      //   state.errorColis = null;
      // })
      // .addCase(fetchPriceColisData.fulfilled, (state, action) => {
      //   state.statusColis = 'succeeded';
      //   state.dataColis = action.payload;
      //   state.errorColis = null;
      // })
      // .addCase(fetchPriceColisData.rejected, (state, action) => {
      //   state.statusColis = 'failed';
      //   state.errorColis = action.payload;
      //   state.dataColis = [];
      // })
      
      // 🚀 === GESTION DES NOUVEAUX TARIFS ===
      // .addCase(fetchAllTarifs.pending, (state) => {
      //   state.statusTarifs = 'loading';
      //   state.errorTarifs = null;
      // })
      // .addCase(fetchAllTarifs.fulfilled, (state, action) => {
      //   state.statusTarifs = 'succeeded';
      //   state.tarifs = action.payload?.tarifs || action.payload;
      //   state.conditions = action.payload?.conditionsActuelles || null;
      //   state.errorTarifs = null;
      // })
      // .addCase(fetchAllTarifs.rejected, (state, action) => {
      //   state.statusTarifs = 'failed';
      //   state.errorTarifs = action.payload;
      //   state.tarifs = null;
      // })
      
      // === GESTION DU CALCUL COLIS ===
      // .addCase(calculateColisPrice.pending, (state) => {
      //   state.statusCalculation = 'loading';
      //   state.errorCalculation = null;
      // })
      // .addCase(calculateColisPrice.fulfilled, (state, action) => {
      //   state.statusCalculation = 'succeeded';
      //   state.calculatedPrice = action.payload?.estimation || action.payload;
      //   state.conditions = action.payload?.estimation?.conditions || action.payload?.conditions || state.conditions;
      //   state.errorCalculation = null;
      // })
      // .addCase(calculateColisPrice.rejected, (state, action) => {
      //   state.statusCalculation = 'failed';
      //   state.errorCalculation = action.payload;
      //   state.calculatedPrice = null;
      // })
      
      // === GESTION DU CALCUL REPAS ===
      // .addCase(calculateRepasPrice.pending, (state) => {
      //   state.statusCalculation = 'loading';
      //   state.errorCalculation = null;
      // })
      // .addCase(calculateRepasPrice.fulfilled, (state, action) => {
      //   state.statusCalculation = 'succeeded';
      //   state.calculatedPrice = action.payload?.estimation || action.payload;
      //   state.conditions = action.payload?.estimation?.conditions || action.payload?.conditions || state.conditions;
      //   state.errorCalculation = null;
      // })
      // .addCase(calculateRepasPrice.rejected, (state, action) => {
      //   state.statusCalculation = 'failed';
      //   state.errorCalculation = action.payload;
      //   state.calculatedPrice = null;
      // });
  },
});

// Export des actions
export const { clearErrors, resetData, clearCalculatedPrice, updateConditions, setLocalCalculation } = priceSlice.actions;

// Export du reducer
export default priceSlice.reducer;