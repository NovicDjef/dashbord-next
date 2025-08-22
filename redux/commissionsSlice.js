import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import commissionsApi, { gainsRealTimeManager } from '@/services/commissionsApi';
import logger from '../app/utils/logger';

// Actions asynchrones pour récupérer les commissions
export const fetchAllCommissions = createAsyncThunk(
  'commissions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await commissionsApi.getAllCommissions();
      return response.configs || response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Erreur récupération commissions');
    }
  }
);

export const fetchCommissionsByType = createAsyncThunk(
  'commissions/fetchByType',
  async (serviceType, { rejectWithValue }) => {
    try {
      const response = await commissionsApi.getCommissionsByType(serviceType);
      return { serviceType, data: response.config || response };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || `Erreur récupération commissions ${serviceType}`);
    }
  }
);

// ===== NOUVELLES ACTIONS POUR GAINS TEMPS RÉEL =====

/**
 * Récupérer les gains complets d'un livreur (gains + stats)
 */
export const fetchGainsComplets = createAsyncThunk(
  'commissions/fetchGainsComplets',
  async ({ livreurId, page = 1, limit = 20 }, { rejectWithValue }) => {
    try {
      logger.redux('fetchGainsComplets', { livreurId, page, limit });
      
      const data = await commissionsApi.getGainsComplets(livreurId, page, limit);
      
      return {
        ...data,
        livreurId
      };
    } catch (error) {
      logger.error('Erreur récupération gains complets:', error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Retirer des gains
 */
export const retirerGains = createAsyncThunk(
  'commissions/retirerGains',
  async ({ livreurId, montant }, { rejectWithValue }) => {
    try {
      logger.redux('retirerGains', { livreurId, montant });
      
      const data = await commissionsApi.retirerGains(livreurId, montant);
      
      return {
        ...data,
        livreurId,
        montantRetire: montant
      };
    } catch (error) {
      logger.error('Erreur retrait gains:', error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

/**
 * Mettre à jour les commissions d'un livreur
 */
export const updateLivreurCommissions = createAsyncThunk(
  'commissions/updateLivreurCommissions',
  async ({ livreurId, commissions }, { rejectWithValue }) => {
    try {
      logger.redux('updateLivreurCommissions', { livreurId, commissions });
      
      const data = await commissionsApi.updateLivreurCommissions(livreurId, commissions);
      
      return {
        ...data,
        livreurId
      };
    } catch (error) {
      logger.error('Erreur mise à jour commissions:', error.message);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Slice Redux
const commissionsSlice = createSlice({
  name: 'commissions',
  initialState: {
    // Commissions existantes
    configs: [],
    repasCommission: null,
    colisCommission: null,
    gazCommission: null,
    loading: false,
    error: null,
    lastUpdated: null,
    
    // ===== NOUVELLES DONNÉES POUR GAINS TEMPS RÉEL =====
    // Données par livreur - structure: { [livreurId]: { data, loading, error } }
    livreurs: {},
    
    // Gestion temps réel
    realTime: {
      isActive: false,
      subscribers: {},
      lastUpdate: null,
      updateInterval: 30000 // 30 secondes par défaut
    },
    
    // Pagination
    currentPage: 1,
    limit: 20,
    
    // Dernière mise à jour globale des gains
    lastGlobalUpdate: null
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Sélecteur rapide pour obtenir un pourcentage par type
    getCommissionByType: (state, action) => {
      const { serviceType } = action.payload;
      const config = state.configs.find(
        (config) => config.serviceType === serviceType && config.isActive
      );
      return config?.livreurPercent || 0;
    },
    
    // ===== NOUVEAUX REDUCERS POUR GAINS TEMPS RÉEL =====
    
    /**
     * Démarrer le suivi temps réel pour un livreur
     */
    startRealTimeTracking: (state, action) => {
      const { livreurId, interval = 30000 } = action.payload;
      logger.redux('startRealTimeTracking', { livreurId, interval });
      
      state.realTime.isActive = true;
      state.realTime.subscribers[livreurId] = {
        interval,
        startTime: new Date().toISOString()
      };
      
      // Initialiser les données du livreur si inexistantes
      if (!state.livreurs[livreurId]) {
        state.livreurs[livreurId] = {
          data: null,
          loading: false,
          error: null,
          lastUpdate: null
        };
      }
    },
    
    /**
     * Arrêter le suivi temps réel pour un livreur
     */
    stopRealTimeTracking: (state, action) => {
      const { livreurId } = action.payload;
      logger.redux('stopRealTimeTracking', { livreurId });
      
      delete state.realTime.subscribers[livreurId];
      
      // Désactiver complètement si plus d'abonnés
      if (Object.keys(state.realTime.subscribers).length === 0) {
        state.realTime.isActive = false;
      }
    },
    
    /**
     * Mise à jour des données temps réel
     */
    updateRealTimeData: (state, action) => {
      const { livreurId, data, timestamp } = action.payload;
      
      if (!state.livreurs[livreurId]) {
        state.livreurs[livreurId] = {
          data: null,
          loading: false,
          error: null,
          lastUpdate: null
        };
      }
      
      state.livreurs[livreurId].data = data;
      state.livreurs[livreurId].lastUpdate = timestamp;
      state.livreurs[livreurId].error = null;
      state.realTime.lastUpdate = timestamp;
      
      logger.debug(`Données temps réel mises à jour livreur ${livreurId}`, {
        gains: data.gains?.length || 0,
        totalGains: data.livreur?.totalGains || 0
      });
    },
    
    /**
     * Signaler une erreur temps réel
     */
    setRealTimeError: (state, action) => {
      const { livreurId, error, timestamp } = action.payload;
      
      if (!state.livreurs[livreurId]) {
        state.livreurs[livreurId] = {
          data: null,
          loading: false,
          error: null,
          lastUpdate: null
        };
      }
      
      state.livreurs[livreurId].error = error;
      state.livreurs[livreurId].lastUpdate = timestamp;
      
      logger.error(`Erreur temps réel livreur ${livreurId}:`, error);
    },
    
    /**
     * Réinitialiser les données d'un livreur spécifique
     */
    resetLivreur: (state, action) => {
      const { livreurId } = action.payload;
      delete state.livreurs[livreurId];
      delete state.realTime.subscribers[livreurId];
    },
    
    /**
     * Mise à jour optimiste d'un gain
     */
    addGainOptimistic: (state, action) => {
      const { livreurId, gain } = action.payload;
      
      if (state.livreurs[livreurId]?.data) {
        const livreurData = state.livreurs[livreurId].data;
        
        // Ajouter le gain en tête de liste
        livreurData.gains = livreurData.gains || [];
        livreurData.gains.unshift({
          ...gain,
          id: `temp_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: 'EN_ATTENTE'
        });
        
        // Mettre à jour les totaux
        if (livreurData.livreur) {
          livreurData.livreur.totalGains += gain.montantGagne;
          livreurData.livreur.gainsDisponibles += gain.montantGagne;
          livreurData.livreur.totalLivraisons += 1;
        }
      }
    },
    
    /**
     * Changer la page de pagination
     */
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    
    /**
     * Changer la limite de pagination
     */
    setLimit: (state, action) => {
      state.limit = action.payload;
    },
    
    /**
     * Nettoyer les erreurs des gains
     */
    clearGainsErrors: (state) => {
      Object.keys(state.livreurs).forEach(livreurId => {
        state.livreurs[livreurId].error = null;
      });
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all commissions
      .addCase(fetchAllCommissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllCommissions.fulfilled, (state, action) => {
        state.loading = false;
        state.configs = action.payload;
        state.lastUpdated = new Date().toISOString();
        
        // Organiser par type pour un accès rapide
        state.repasCommission = action.payload.find(c => c.serviceType === 'REPAS');
        state.colisCommission = action.payload.find(c => c.serviceType === 'COLIS');
        state.gazCommission = action.payload.find(c => c.serviceType === 'GAZ');
        
        logger.success('Commissions stockées dans Redux:', {
          total: action.payload.length,
          repas: state.repasCommission?.livreurPercent,
          colis: state.colisCommission?.livreurPercent,
          gaz: state.gazCommission?.livreurPercent
        });
      })
      .addCase(fetchAllCommissions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        logger.error('Erreur chargement commissions:', action.payload);
      })
      
      // Fetch by type
      .addCase(fetchCommissionsByType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommissionsByType.fulfilled, (state, action) => {
        state.loading = false;
        const { serviceType, data } = action.payload;
        
        // Mettre à jour la commission spécifique
        switch (serviceType) {
          case 'REPAS':
            state.repasCommission = data;
            break;
          case 'COLIS':
            state.colisCommission = data;
            break;
          case 'GAZ':
            state.gazCommission = data;
            break;
        }
        
        // Mettre à jour aussi dans configs si nécessaire
        const existingIndex = state.configs.findIndex(c => c.serviceType === serviceType);
        if (existingIndex >= 0) {
          state.configs[existingIndex] = data;
        } else {
          state.configs.push(data);
        }
      })
      .addCase(fetchCommissionsByType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ===== NOUVEAUX EXTRA REDUCERS POUR GAINS =====
      
      // fetchGainsComplets
      .addCase(fetchGainsComplets.pending, (state, action) => {
        const { livreurId } = action.meta.arg;
        
        if (!state.livreurs[livreurId]) {
          state.livreurs[livreurId] = {
            data: null,
            loading: false,
            error: null,
            lastUpdate: null
          };
        }
        
        state.livreurs[livreurId].loading = true;
        state.livreurs[livreurId].error = null;
      })
      .addCase(fetchGainsComplets.fulfilled, (state, action) => {
        const { livreurId, ...data } = action.payload;
        
        state.livreurs[livreurId].loading = false;
        state.livreurs[livreurId].data = data;
        state.livreurs[livreurId].lastUpdate = data.timestamp;
        state.lastGlobalUpdate = data.timestamp;
        
        logger.success('Gains complets récupérés:', {
          livreurId,
          gains: data.gains?.length || 0,
          totalGains: data.livreur?.totalGains || 0
        });
      })
      .addCase(fetchGainsComplets.rejected, (state, action) => {
        const { livreurId } = action.meta.arg;
        const error = action.payload?.message || 'Erreur lors du chargement des gains';
        
        state.livreurs[livreurId].loading = false;
        state.livreurs[livreurId].error = error;
        
        logger.error('Erreur gains complets:', error);
      })
      
      // retirerGains
      .addCase(retirerGains.pending, (state, action) => {
        const { livreurId } = action.meta.arg;
        if (state.livreurs[livreurId]) {
          state.livreurs[livreurId].loading = true;
          state.livreurs[livreurId].error = null;
        }
      })
      .addCase(retirerGains.fulfilled, (state, action) => {
        const { livreurId, montantRetire, ...data } = action.payload;
        
        if (state.livreurs[livreurId]) {
          state.livreurs[livreurId].loading = false;
          
          // Mettre à jour les gains disponibles
          if (state.livreurs[livreurId].data?.livreur) {
            state.livreurs[livreurId].data.livreur.gainsDisponibles = data.nouveauSolde || 0;
          }
          
          // Marquer les gains comme retirés
          if (state.livreurs[livreurId].data?.gains) {
            state.livreurs[livreurId].data.gains = state.livreurs[livreurId].data.gains.map(gain =>
              gain.status === 'DISPONIBLE'
                ? { ...gain, status: 'RETIRE', dateRetrait: new Date().toISOString() }
                : gain
            );
          }
        }
        
        logger.success('Retrait effectué:', {
          livreurId,
          montantRetire,
          nouveauSolde: data.nouveauSolde
        });
      })
      .addCase(retirerGains.rejected, (state, action) => {
        const { livreurId } = action.meta.arg;
        const error = action.payload?.message || 'Erreur lors du retrait';
        
        if (state.livreurs[livreurId]) {
          state.livreurs[livreurId].loading = false;
          state.livreurs[livreurId].error = error;
        }
        
        logger.error('Erreur retrait:', error);
      })
      
      // updateLivreurCommissions
      .addCase(updateLivreurCommissions.pending, (state, action) => {
        const { livreurId } = action.meta.arg;
        if (state.livreurs[livreurId]) {
          state.livreurs[livreurId].loading = true;
          state.livreurs[livreurId].error = null;
        }
      })
      .addCase(updateLivreurCommissions.fulfilled, (state, action) => {
        const { livreurId, ...data } = action.payload;
        
        if (state.livreurs[livreurId]) {
          state.livreurs[livreurId].loading = false;
          
          // Mettre à jour les commissions dans les données du livreur
          if (state.livreurs[livreurId].data?.livreur && data.livreur) {
            Object.assign(state.livreurs[livreurId].data.livreur, {
              commissionRepas: data.livreur.commissionRepas,
              commissionColis: data.livreur.commissionColis,
              commissionGaz: data.livreur.commissionGaz
            });
          }
        }
        
        logger.success('Commissions mises à jour:', {
          livreurId,
          commissions: data.livreur
        });
      })
      .addCase(updateLivreurCommissions.rejected, (state, action) => {
        const { livreurId } = action.meta.arg;
        const error = action.payload?.message || 'Erreur lors de la mise à jour des commissions';
        
        if (state.livreurs[livreurId]) {
          state.livreurs[livreurId].loading = false;
          state.livreurs[livreurId].error = error;
        }
        
        logger.error('Erreur commissions:', error);
      });
  }
});

// Sélecteurs
export const selectAllCommissions = (state) => state.commissions.configs;
export const selectCommissionsLoading = (state) => state.commissions.loading;
export const selectCommissionsError = (state) => state.commissions.error;

export const selectCommissionByType = (state, serviceType) => {
  const config = state.commissions.configs.find(
    (config) => config.serviceType === serviceType && config.isActive
  );
  return config?.livreurPercent || 0;
};

export const selectRepasCommission = (state) => state.commissions.repasCommission;
export const selectColisCommission = (state) => state.commissions.colisCommission;
export const selectGazCommission = (state) => state.commissions.gazCommission;

// ===== NOUVEAUX SÉLECTEURS POUR GAINS TEMPS RÉEL =====

/**
 * Sélecteur pour les données d'un livreur spécifique
 */
export const selectLivreurData = (state, livreurId) => 
  state.commissions.livreurs[livreurId] || {
    data: null,
    loading: false,
    error: null,
    lastUpdate: null
  };

/**
 * Sélecteur pour les gains d'un livreur
 */
export const selectLivreurGains = (state, livreurId) => {
  const livreurData = selectLivreurData(state, livreurId);
  return livreurData.data?.gains || [];
};

/**
 * Sélecteur pour les stats d'un livreur
 */
export const selectLivreurStats = (state, livreurId) => {
  const livreurData = selectLivreurData(state, livreurId);
  return livreurData.data?.stats || {
    statsParType: [],
    statsParMois: [],
    periode: 'N/A'
  };
};

/**
 * Sélecteur pour les informations générales d'un livreur
 */
export const selectLivreurInfo = (state, livreurId) => {
  const livreurData = selectLivreurData(state, livreurId);
  return livreurData.data?.livreur || {
    totalGains: 0,
    gainsDisponibles: 0,
    totalLivraisons: 0,
    commissionRepas: 0.60,
    commissionColis: 0.65,
    commissionGaz: 0.55
  };
};

/**
 * Sélecteur pour l'état de chargement d'un livreur
 */
export const selectLivreurLoading = (state, livreurId) =>
  state.commissions.livreurs[livreurId]?.loading || false;

/**
 * Sélecteur pour les erreurs d'un livreur
 */
export const selectLivreurError = (state, livreurId) =>
  state.commissions.livreurs[livreurId]?.error || null;

/**
 * Sélecteur pour l'état du temps réel
 */
export const selectRealTimeState = (state) => state.commissions.realTime;

/**
 * Sélecteur pour vérifier si un livreur est suivi en temps réel
 */
export const selectIsRealTimeActive = (state, livreurId) =>
  !!state.commissions.realTime.subscribers[livreurId];

/**
 * Sélecteur pour les gains disponibles d'un livreur
 */
export const selectLivreurGainsDisponibles = (state, livreurId) => {
  const gains = selectLivreurGains(state, livreurId);
  return gains.filter(gain => gain.status === 'DISPONIBLE');
};

/**
 * Sélecteur pour les gains par type d'un livreur
 */
export const selectLivreurGainsParType = (state, livreurId) => {
  const gains = selectLivreurGains(state, livreurId);
  return {
    REPAS: gains.filter(g => g.typeLivraison === 'REPAS'),
    COLIS: gains.filter(g => g.typeLivraison === 'COLIS'),
    GAZ: gains.filter(g => g.typeLivraison === 'GAZ')
  };
};

/**
 * Sélecteur pour l'état global des gains
 */
export const selectGainsGlobalState = (state) => ({
  loading: state.commissions.loading,
  error: state.commissions.error,
  lastUpdate: state.commissions.lastGlobalUpdate,
  currentPage: state.commissions.currentPage,
  limit: state.commissions.limit
});

/**
 * Sélecteur pour tous les livreurs suivis
 */
export const selectAllTrackedLivreurs = (state) => {
  const livreurs = [];
  Object.keys(state.commissions.livreurs).forEach(livreurId => {
    const data = selectLivreurData(state, parseInt(livreurId));
    if (data.data) {
      livreurs.push({
        id: parseInt(livreurId),
        ...data
      });
    }
  });
  return livreurs;
};

// Actions
export const { 
  clearError,
  // Nouvelles actions
  startRealTimeTracking,
  stopRealTimeTracking,
  updateRealTimeData,
  setRealTimeError,
  resetLivreur,
  addGainOptimistic,
  setCurrentPage,
  setLimit,
  clearGainsErrors
} = commissionsSlice.actions;

export default commissionsSlice.reducer;