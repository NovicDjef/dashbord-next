// redux/gainSlice.js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../services/Api';
import { calculSomeGainsLivreur } from '../services/routeApi';


// ✅ Actions asynchrones

// Récupérer les gains d'un livreur
export const getGainsLivreurAsync = createAsyncThunk(
  'gains/getGainsLivreur',
  async ({ livreurId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      console.log(`📊 Récupération gains livreur ${livreurId}...`);
      
      const response = await apiService.get(`/livreur/${livreurId}/gains`);
      
      console.log('✅ Gains récupérés:', response.data);
      return {
        ...response.data,
        livreurId
      };
    } catch (error) {
      console.error('❌ Erreur récupération gains:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les gains" });
    }
  }
);

// Récupérer les statistiques des gains
export const getStatsGainsAsync = createAsyncThunk(
  'gains/getStatsGains',
  async (livreurId, { rejectWithValue }) => {
    try {
      console.log(`📈 Récupération stats gains livreur ${livreurId}...`);
      
      const response = await apiService.get(`/livreur/${livreurId}/gains/stats`);
      
      console.log('✅ Stats gains récupérées:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération stats gains:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les statistiques" });
    }
  }
);

// Calculer un gain de livraison
export const calculerGainLivraisonAsync = createAsyncThunk(
  'gains/calculerGain',
  async (gainData, { rejectWithValue }) => {
    try {
      console.log('💰 Calcul gain livraison:', gainData);
      
      const response = await calculSomeGainsLivreur(gainData);
      
      console.log('✅ Gain calculé:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur calcul gain:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de calculer le gain" });
    }
  }
);

// Retirer des gains
export const retirerGainsAsync = createAsyncThunk(
  'gains/retirerGains',
  async ({ livreurId, montant }, { rejectWithValue }) => {
    try {
      console.log(`💸 Retrait gains: ${montant} FCFA pour livreur ${livreurId}`);
      
      const response = await apiService.post(`/livreur/${livreurId}/gains/retirer`, { montant });
      
      console.log('✅ Retrait effectué:', response.data);
      return {
        ...response.data,
        montantRetire: montant
      };
    } catch (error) {
      console.error('❌ Erreur retrait gains:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de retirer les gains" });
    }
  }
);

// Mettre à jour les commissions
export const updateCommissionsAsync = createAsyncThunk(
  'gains/updateCommissions',
  async ({ livreurId, commissions }, { rejectWithValue }) => {
    try {
      console.log(`⚙️ Mise à jour commissions livreur ${livreurId}:`, commissions);
      
      const response = await apiService.patch(`/livreur/${livreurId}/commissions`, commissions);
      
      console.log('✅ Commissions mises à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour commissions:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de mettre à jour les commissions" });
    }
  }
);

// État initial
const initialState = {
  // Données des gains
  gains: [],
  currentPage: 1,
  totalPages: 1,
  limit: 20,
  
  // Informations du livreur
  livreurGains: {
    totalGains: 0,
    gainsDisponibles: 0,
    commissionRepas: 0.60,
    commissionColis: 0.65,
    commissionGaz: 0.55
  },
  
  // Statistiques
  statsParType: [],
  statsParMois: [],
  
  // États de chargement
  loading: false,
  loadingStats: false,
  loadingRetrait: false,
  loadingCommissions: false,
  
  // Erreurs
  error: null,
  errorStats: null,
  errorRetrait: null,
  errorCommissions: null,
  
  // Dernière mise à jour
  lastUpdated: null
};

// Slice
const gainSlice = createSlice({
  name: 'gains',
  initialState,
  reducers: {
    // Réinitialiser les erreurs
    clearErrors: (state) => {
      state.error = null;
      state.errorStats = null;
      state.errorRetrait = null;
      state.errorCommissions = null;
    },
    
    // Réinitialiser les gains (utile lors de la déconnexion)
    resetGains: (state) => {
      return initialState;
    },
    
    // Ajouter un gain local (optimistic update)
    addGainOptimistic: (state, action) => {
      const newGain = {
        ...action.payload,
        id: Date.now(), // ID temporaire
        createdAt: new Date().toISOString(),
        status: 'EN_ATTENTE'
      };
      
      state.gains.unshift(newGain);
      state.livreurGains.totalGains += newGain.montantGagne;
      state.livreurGains.gainsDisponibles += newGain.montantGagne;
    },
    
    // Mettre à jour un gain existant
    updateGain: (state, action) => {
      const { id, updates } = action.payload;
      const gainIndex = state.gains.findIndex(gain => gain.id === id);
      
      if (gainIndex !== -1) {
        state.gains[gainIndex] = { ...state.gains[gainIndex], ...updates };
      }
    },
    
    // Changer de page
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // ✅ getGainsLivreurAsync
      .addCase(getGainsLivreurAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getGainsLivreurAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.gains = action.payload.gains;
        state.currentPage = action.payload.page;
        state.limit = action.payload.limit;
        state.livreurGains = { ...state.livreurGains, ...action.payload.livreur };
        state.lastUpdated = new Date().toISOString();
        
        console.log('📊 State gains mis à jour:', {
          nombreGains: state.gains.length,
          totalGains: state.livreurGains.totalGains,
          gainsDisponibles: state.livreurGains.gainsDisponibles
        });
      })
      .addCase(getGainsLivreurAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Erreur lors du chargement des gains';
        console.error('❌ Erreur chargement gains:', state.error);
      })
      
      // ✅ getStatsGainsAsync
      .addCase(getStatsGainsAsync.pending, (state) => {
        state.loadingStats = true;
        state.errorStats = null;
      })
      .addCase(getStatsGainsAsync.fulfilled, (state, action) => {
        state.loadingStats = false;
        state.statsParType = action.payload.statsParType;
        state.statsParMois = action.payload.statsParMois;
        
        console.log('📈 Stats gains mises à jour:', {
          typesStats: state.statsParType.length,
          moisStats: state.statsParMois.length
        });
      })
      .addCase(getStatsGainsAsync.rejected, (state, action) => {
        state.loadingStats = false;
        state.errorStats = action.payload?.message || 'Erreur lors du chargement des statistiques';
        console.error('❌ Erreur stats gains:', state.errorStats);
      })
      
      // ✅ calculerGainLivraisonAsync
      .addCase(calculerGainLivraisonAsync.pending, (state) => {
        // Pas de loading global pour ne pas bloquer l'interface
        console.log('💰 Calcul gain en cours...');
      })
      .addCase(calculerGainLivraisonAsync.fulfilled, (state, action) => {
        const newGain = action.payload.gain;
        
        // Ajouter le nouveau gain en tête de liste
        state.gains.unshift(newGain);
        
        // Mettre à jour les totaux
        state.livreurGains.totalGains += newGain.montantGagne;
        state.livreurGains.gainsDisponibles += newGain.montantGagne;
        
        console.log('✅ Nouveau gain ajouté:', {
          montant: newGain.montantGagne,
          nouveauTotal: state.livreurGains.totalGains
        });
      })
      .addCase(calculerGainLivraisonAsync.rejected, (state, action) => {
        // Log l'erreur mais ne pas bloquer l'interface
        console.error('❌ Erreur calcul gain:', action.payload?.message);
      })
      
      // ✅ retirerGainsAsync
      .addCase(retirerGainsAsync.pending, (state) => {
        state.loadingRetrait = true;
        state.errorRetrait = null;
      })
      .addCase(retirerGainsAsync.fulfilled, (state, action) => {
        state.loadingRetrait = false;
        
        // Mettre à jour les gains disponibles
        state.livreurGains.gainsDisponibles = action.payload.nouveauSolde;
        
        // Marquer les gains comme retirés (logique simplifiée)
        state.gains = state.gains.map(gain => 
          gain.status === 'DISPONIBLE' 
            ? { ...gain, status: 'RETIRE', dateRetrait: new Date().toISOString() }
            : gain
        );
        
        console.log('💸 Retrait effectué:', {
          montantRetire: action.payload.montantRetire,
          nouveauSolde: action.payload.nouveauSolde
        });
      })
      .addCase(retirerGainsAsync.rejected, (state, action) => {
        state.loadingRetrait = false;
        state.errorRetrait = action.payload?.message || 'Erreur lors du retrait';
        console.error('❌ Erreur retrait:', state.errorRetrait);
      })
      
      // ✅ updateCommissionsAsync
      .addCase(updateCommissionsAsync.pending, (state) => {
        state.loadingCommissions = true;
        state.errorCommissions = null;
      })
      .addCase(updateCommissionsAsync.fulfilled, (state, action) => {
        state.loadingCommissions = false;
        
        // Mettre à jour les commissions
        const { livreur } = action.payload;
        state.livreurGains.commissionRepas = livreur.commissionRepas;
        state.livreurGains.commissionColis = livreur.commissionColis;
        state.livreurGains.commissionGaz = livreur.commissionGaz;
        
        console.log('⚙️ Commissions mises à jour:', {
          repas: livreur.commissionRepas,
          colis: livreur.commissionColis,
          gaz: livreur.commissionGaz
        });
      })
      .addCase(updateCommissionsAsync.rejected, (state, action) => {
        state.loadingCommissions = false;
        state.errorCommissions = action.payload?.message || 'Erreur lors de la mise à jour des commissions';
        console.error('❌ Erreur commissions:', state.errorCommissions);
      });
  }
});

// Actions
export const { 
  clearErrors, 
  resetGains, 
  addGainOptimistic, 
  updateGain, 
  setCurrentPage 
} = gainSlice.actions;

// Sélecteurs
export const selectGains = (state) => state.gains.gains;
export const selectLivreurGains = (state) => state.gains.livreurGains;
export const selectStatsGains = (state) => ({
  statsParType: state.gains.statsParType,
  statsParMois: state.gains.statsParMois
});
export const selectGainsLoading = (state) => ({
  loading: state.gains.loading,
  loadingStats: state.gains.loadingStats,
  loadingRetrait: state.gains.loadingRetrait,
  loadingCommissions: state.gains.loadingCommissions
});
export const selectGainsErrors = (state) => ({
  error: state.gains.error,
  errorStats: state.gains.errorStats,
  errorRetrait: state.gains.errorRetrait,
  errorCommissions: state.gains.errorCommissions
});

// Sélecteurs calculés
export const selectGainsDisponibles = (state) => 
  state.gains.gains.filter(gain => gain.status === 'DISPONIBLE');

export const selectGainsParType = (state) => {
  const gains = state.gains.gains;
  return {
    REPAS: gains.filter(g => g.typeLivraison === 'REPAS'),
    COLIS: gains.filter(g => g.typeLivraison === 'COLIS'),
    GAZ: gains.filter(g => g.typeLivraison === 'GAZ')
  };
};

export const selectTotalGainsMois = (state) => {
  const maintenant = new Date();
  const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
  
  return state.gains.gains
    .filter(gain => new Date(gain.createdAt) >= debutMois)
    .reduce((total, gain) => total + gain.montantGagne, 0);
};

export default gainSlice.reducer;