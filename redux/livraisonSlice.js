// redux/livraisonSlice.js - Version propre et corrigée
import { getSomeActiveLivraisons, getSomeCommande, getSomeDetailsLivraison, getSomeHistoriqueLivraisons, getSomeStatsLivreur, updateSomeCommandeLivred, updateSomeLivreurLocation, updateSomeUpdateLivraisonStatus } from '@/services/routeApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import apiService from '../services/api';



export const updateLivreurGainsAsync = createAsyncThunk(
  'livreur/updateGains',
  async ({ livreurId, gainsData }, { rejectWithValue }) => {
    try {
      console.log(`💰 Mise à jour gains livreur ${livreurId}:`, gainsData);
      
      const response = await apiService.patch(`/livreur/${livreurId}`, gainsData);
      
      console.log('✅ Gains livreur mis à jour:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur mise à jour gains livreur:', error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de mettre à jour les gains" });
    }
  }
);

export const postLivraison = createAsyncThunk(
  'livraison/postLivraison',
  async (livraisonData, { rejectWithValue }) => {
    try {
      if (!livraisonData?.livreurId || !livraisonData?.userId) {
        return rejectWithValue('livreurId et userId sont requis');
      }

      console.log('🚚 Envoi de la livraison...', livraisonData);
      const response = await apiService.post('/livraison', livraisonData); // ✅ await ajouté

      console.log('🚚 Récupération de la livraison...', response?.data);
      if (!response?.data) {
        return rejectWithValue('Réponse serveur invalide');
      }

      console.log('✅ Livraison postée avec succès:', response.data);
      return response.data;

    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Erreur lors de la création de la livraison';

      console.error('❌ Erreur création livraison:', message);
      return rejectWithValue(message);
    }
  }
);



export const fetchDisponiblesCommandes = createAsyncThunk(
  'livraison/fetchDisponiblesCommandes',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSomeCommande();
     
     return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération commandes disponibles:', error.response?.data);
      return rejectWithValue(
        error.response.data || 'Erreur lors de la récupération des commandes'
      );
    }
  }
);

// ✅ Accepter une commande


// ✅ Récupérer les livraisons actives du livreur
export const fetchActiveLivraisons = createAsyncThunk(
  'livraison/fetchActiveLivraisons',
  async (livreurId, { rejectWithValue }) => {
    try {
      console.log(`🚴 Récupération livraisons actives pour livreur ${livreurId}...`);
      
      const response = await getSomeActiveLivraisons(livreurId);
      
      if (response.data && response.data.success) {
        console.log(`✅ ${response.data.livraisons?.length || 0} livraisons actives trouvées`);
        return response.data.livraisons || [];
      } else {
        console.log('⚠️ Aucune livraison active');
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur récupération livraisons actives:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération des livraisons'
      );
    }
  }
);

// ✅ Récupérer les détails d'une livraison
export const fetchLivraisonDetails = createAsyncThunk(
  'livraison/fetchLivraisonDetails',
  async (livraisonId, { rejectWithValue }) => {
    try {
      console.log(`📋 Récupération détails livraison ${livraisonId}...`);
      
      const response = await getSomeDetailsLivraison(livraisonId);
      
      if (response.data && response.data.success) {
        console.log('✅ Détails livraison récupérés');
        return response.data.livraison;
      } else {
        return rejectWithValue(response.data?.message || 'Livraison non trouvée');
      }
    } catch (error) {
      console.error('❌ Erreur récupération détails livraison:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Impossible de récupérer les détails'
      );
    }
  }
);

// ✅ Mettre à jour le statut d'une livraison
export const updateLivraisonStatus = createAsyncThunk(
  'livraison/updateLivraisonStatus',
  async ({ livraisonId, status, position }, { rejectWithValue }) => {
    try {
      console.log(`🔄 Mise à jour statut livraison ${livraisonId} vers ${status}...`);
      
      const response = await updateSomeUpdateLivraisonStatus(livraisonId, status, position);
      
      if (response.data && response.data.success) {
        console.log('✅ Statut livraison mis à jour');
        return {
          livraisonId,
          updatedLivraison: response.data.livraison
        };
      } else {
        return rejectWithValue(response.data?.message || 'Erreur mise à jour statut');
      }
    } catch (error) {
      console.error('❌ Erreur mise à jour statut livraison:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Impossible de mettre à jour le statut'
      );
    }
  }
);

// ✅ Marquer une livraison comme terminée
export const markAsDelivered = createAsyncThunk(
  'livraison/markAsDelivered',
  async ({ livraisonId, livreurId }, { rejectWithValue }) => {
    try {
      console.log(`✅ Marquage livraison ${livraisonId} comme livrée...`);
      
      const response = await updateSomeCommandeLivred(livraisonId, livreurId)
      
      if (response.data && response.data.success) {
        console.log('✅ Livraison marquée comme terminée');
        
        // Nettoyer les données locales
        await AsyncStorage.removeItem('currentLivraison');
        
        return response.data.livraison;
      } else {
        return rejectWithValue(response.data?.message || 'Erreur confirmation livraison');
      }
    } catch (error) {
      console.error('❌ Erreur confirmation livraison:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur confirmation livraison'
      );
    }
  }
);

// ✅ Mettre à jour la position du livreur
export const updateLivreurLocation = createAsyncThunk(
  'livraison/updateLivreurLocation',
  async ({ livreurId, latitude, longitude }, { rejectWithValue }) => {
    try {
      const response = await updateSomeLivreurLocation(livreurId, latitude, longitude)
      
      return response.data.livreur
    } catch (error) {
      // Ne pas faire échouer pour éviter de spammer les erreurs
      console.warn('⚠️ Erreur mise à jour position:', error.message);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur confirmation livraison'
      );
    }
  }
);

// ✅ Récupérer les statistiques du livreur
export const fetchLivreurStats = createAsyncThunk(
  'livraison/fetchLivreurStats',
  async (livreurId, { rejectWithValue }) => {
    try {
      console.log(`📊 Récupération stats livreur ${livreurId}...`);
      
      const response = await getSomeStatsLivreur(livreurId)
      
      if (response.data && response.data.success) {
        console.log('✅ Stats livreur récupérées');
        return response.data.stats;
      } else {
        // Retourner des stats par défaut si erreur
        return {
          totalLivraisons: 0,
          note: 5.0,
          livraisonsToday: 0,
          livraisonsThisWeek: 0
        };
      }
    } catch (error) {
      console.warn('⚠️ Erreur stats livreur:', error.response?.data);
      // Retourner des stats par défaut
      return {
        totalLivraisons: 0,
        note: 5.0,
        livraisonsToday: 0,
        livraisonsThisWeek: 0
      };
    }
  }
);

export const fetchRegisterPushToken = createAsyncThunk(
  'livraison/fetchRegisterPushToken',
  async ({ livreurId, pushToken }, { rejectWithValue }) => {
    try {
      const response = await fetchSomeRegisterPushToken(livreurId, pushToken)
      return response.data;
    } catch (error) {
      console.error('❌ Erreur récupération push token:', error.response?.data);
      return rejectWithValue(
        error.response?.data?.message || 'Erreur lors de la récupération du push token'
      );
    }
  }
);

// ✅ Récupérer l'historique des livraisons
// export const fetchHistoriqueLivraisons = createAsyncThunk(
//   'livraison/fetchHistoriqueLivraisons',
//   async ({ livreurId, period = 'all' }, { rejectWithValue }) => {
//     try {
//       console.log(`📜 Récupération historique livraisons pour livreur ${livreurId}, période: ${period}`);
      
//       // ✅ Conversion des périodes en jours
//       let periodDays;
//       switch (period) {
//         case 'week': periodDays = '7'; break;
//         case 'month': periodDays = '30'; break;
//         case 'all': periodDays = 'all'; break;
//         default: periodDays = period;
//       }
      
//       const response = await getSomeHistoriqueLivraisons(livreurId, period);
      
//       console.log("📡 Réponse API historique:", response.data);
      
//       if (response && response.success) {
//         console.log(`✅ ${response.data.livraisons?.length || 0} livraisons dans l'historique`);
//         return response.data.livraisons || [];
//       } else {
//         console.log("⚠️ Réponse API sans succès:", response.data);
//         return [];
//       }
//     } catch (error) {
//       console.error("❌ Erreur fetchHistoriqueLivraisons:", error);
//       console.error("❌ Error response:", error.response?.data);
//       return rejectWithValue(
//         error.response?.data?.message || 'Erreur lors de la récupération de l\'historique'
//       );
//     }
//   }
// );

// ✅ VERSION ULTRA-SIMPLE (test rapide)
export const fetchHistoriqueLivraisons = createAsyncThunk(
  'livraison/fetchHistoriqueLivraisons',
  async ({ livreurId, period = 'all' }, { rejectWithValue }) => {
    try {
      let periodDays;
            switch (period) {
              case 'week': periodDays = '7'; break;
              case 'month': periodDays = '30'; break;
              case 'all': periodDays = 'all'; break;
              default: periodDays = period;
            }
      const response = await getSomeHistoriqueLivraisons(livreurId, period);
      
      // ✅ DIRECT: Pas de vérification de success, juste récupérer les livraisons
      const livraisons = response.data?.livraisons || [];
      console.log("✅ Livraisons directement extraites:", livraisons);
      return livraisons;
      
    } catch (error) {
      return rejectWithValue('Erreur API');
    }
  }
);

// ✅ Valider le code de validation pour terminer une livraison
export const validateDeliveryCode = createAsyncThunk(
  'livraison/validateDeliveryCode',
  async ({ commandeId, validationCode, type }, { rejectWithValue }) => {
    try {
      console.log(`🔐 Validation du code ${validationCode} pour ${type} #${commandeId}...`);
      
      // Déterminer l'endpoint selon le type de livraison
      let endpoint;
      switch (type) {
        case 'REPAS':
          endpoint = `/commandes/${commandeId}/validate-code`;
          break;
        case 'COLIS':
          endpoint = `/colis/${commandeId}/validate-code`;
          break;
        case 'GAZ':
          endpoint = `/orders/${commandeId}/validate-code`;
          break;
        default:
          return rejectWithValue('Type de livraison non reconnu');
      }
      
      console.log(`📡 Appel API: ${endpoint}`);
      
      // Appel API pour valider le code côté serveur avec l'endpoint approprié
      const response = await apiService.post(endpoint, {
        validationCode
      });

      if (response.data && response.data.success) {
        console.log('✅ Code de validation vérifié avec succès');
        return {
          commandeId,
          type,
          isValid: true,
          message: response.data.message || 'Code validé avec succès'
        };
      } else {
        console.log('❌ Code de validation incorrect');
        return rejectWithValue(response.data?.message || 'Code de validation incorrect');
      }
    } catch (error) {
      console.error('❌ Erreur validation code:', error.response?.data);
      
      // Gérer les différents types d'erreurs
      if (error.response?.status === 400) {
        return rejectWithValue(error.response?.data?.message || 'Code de validation invalide');
      } else if (error.response?.status === 404) {
        return rejectWithValue('Commande introuvable');
      } else if (error.response?.status === 410) {
        return rejectWithValue('Code de validation expiré');
      } else {
        return rejectWithValue(
          error.response?.data?.message || 'Erreur lors de la validation du code'
        );
      }
    }
  }
);

// ===== SLICE REDUX =====

const livraisonSlice = createSlice({
  name: 'livraison',
  initialState: {

    // Livraisons
    postLivraisonLoading: false,
    postLivraisonError: null,
    livraisons: [],

    // Commandes disponibles
    commandesDisponibles: [],
    commandesDisponiblesLoading: false,
    commandesDisponiblesError: null,
    
    // Livraisons actives
    activeLivraisons: [],
    activeLivraisonsLoading: false,
    activeLivraisonsError: null,
    
    // Historique des livraisons
    historiqueLivraisons: [],
    historiqueLoading: false,
    historiqueError: null,
    historiqueSummary: null,
    historiqueStatsParType: [],
    historiquePagination: null,

    
    // Détails d'une livraison
    currentLivraison: null,
    currentLivraisonLoading: false,
    currentLivraisonError: null,
    // ✅ NOUVELLES propriétés pour les gains
  gainsResume: {
    totalGains: 0,
    gainsDisponibles: 0,
    totalLivraisons: 0,
    moyenneParLivraison: 0,
    dernierGain: null
  },
  
  commissions: {
    repas: 0.60,
    colis: 0.65,
    gaz: 0.55
  },
   
    // Statistiques du livreur
    stats: {
      totalLivraisons: 0,
      note: 5.0,
      livraisonsToday: 0,
      livraisonsThisWeek: 0,

// ✅ NOUVELLES propriétés pour les gains
      livraisonsAujourdhui: 0,
      gainsDuJour: 0,
      livraisonsCeMois: 0,
      gainsCeMois: 0,
      noteMovenne: 5.0
    },
    statsLoading: false,
    
    // Position du livreur
    currentLocation: null,
    
    // États généraux
    loading: false,
    error: null,
    
    // Actions en cours
    acceptingCommande: null,
    updatingStatus: null,
    
    // Modal de notification (pour les nouvelles commandes)
    showNotificationModal: false,
    pendingCommande: null,
    
    // Validation de code de livraison
    validatingCode: false,
    validationError: null,
  },
  
  reducers: {

// ✅ NOUVEAUX reducers pour les gains
    updateGainsResume: (state, action) => {
      state.gainsResume = { ...state.gainsResume, ...action.payload };
    },
    
    updateCommissions: (state, action) => {
      state.commissions = { ...state.commissions, ...action.payload };
    },
    
    updateStats: (state, action) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    
    // Incrémenter les gains après une livraison terminée
    incrementGainsApresLivraison: (state, action) => {
      const { montantGagne, typeLivraison } = action.payload;
      
      state.gainsResume.totalGains += montantGagne;
      state.gainsResume.gainsDisponibles += montantGagne;
      state.gainsResume.totalLivraisons += 1;
      state.gainsResume.moyenneParLivraison = 
        state.gainsResume.totalGains / state.gainsResume.totalLivraisons;
      state.gainsResume.dernierGain = {
        montant: montantGagne,
        type: typeLivraison,
        date: new Date().toISOString()
      };
      
      // Mettre à jour les stats du jour
      state.stats.livraisonsAujourdui += 1;
      state.stats.gainsDuJour += montantGagne;
    },
    
    // Décrémenter après un retrait
    decrementGainsApresRetrait: (state, action) => {
      const montantRetire = action.payload;
      state.gainsResume.gainsDisponibles -= montantRetire;
    },
    
    // Réinitialiser les stats quotidiennes (à appeler chaque jour)
    resetStatsQuotidiennes: (state) => {
      state.stats.livraisonsAujourdui = 0;
      state.stats.gainsDuJour = 0;
  },


    // ✅ Actions synchrones
    clearErrors: (state) => {
      state.error = null;
      state.commandesDisponiblesError = null;
      state.activeLivraisonsError = null;
      state.currentLivraisonError = null;
      state.historiqueError = null;
    },
    
    clearCurrentLivraison: (state) => {
      state.currentLivraison = null;
      state.currentLivraisonError = null;
    },
    
    setCurrentLivraison: (state, action) => {
      state.currentLivraison = action.payload;
    },
    
    // ✅ Gestion de la modal de notification
    showCommandeModal: (state, action) => {
      state.showNotificationModal = true;
      state.pendingCommande = action.payload;
    },
    
    hideCommandeModal: (state) => {
      state.showNotificationModal = false;
      state.pendingCommande = null;
    },
    
    // ✅ Mise à jour en temps réel (pour les notifications)
    addNewCommandeDisponible: (state, action) => {
      const newCommande = action.payload;
      // Vérifier que la commande n'existe pas déjà
      const exists = state.commandesDisponibles.find(c => c.id === newCommande.id);
      if (!exists) {
        state.commandesDisponibles.unshift(newCommande); // Ajouter au début
      }
    },
    
    removeCommandeDisponible: (state, action) => {
      const commandeId = action.payload;
      state.commandesDisponibles = state.commandesDisponibles.filter(
        c => c.id !== commandeId
      );
    },
    
    // ✅ Mise à jour d'une livraison en temps réel
    updateLivraisonInList: (state, action) => {
      const updatedLivraison = action.payload;
      const index = state.activeLivraisons.findIndex(l => l.id === updatedLivraison.id);
      if (index !== -1) {
        state.activeLivraisons[index] = updatedLivraison;
      }
    },
    
    // ✅ Mise à jour de la position locale
    updateLocalPosition: (state, action) => {
      state.currentLocation = action.payload;
    },
    
    // ✅ Charger l'état depuis le stockage local
    loadPersistedState: (state, action) => {
      const { currentLivraison } = action.payload;
      if (currentLivraison) {
        state.currentLivraison = currentLivraison;
      }
    },
  },
  
  extraReducers: (builder) => {
    builder
      // ✅ Récupération des commandes disponibles
      .addCase(fetchDisponiblesCommandes.pending, (state) => {
        state.commandesDisponiblesLoading = true;
        state.commandesDisponiblesError = null;
        state.loading = true;
      })
      .addCase(fetchDisponiblesCommandes.fulfilled, (state, action) => {
        state.commandesDisponiblesLoading = false;
        state.commandesDisponibles = action.payload;
        state.loading = false;
      })
      .addCase(fetchDisponiblesCommandes.rejected, (state, action) => {
        state.commandesDisponiblesLoading = false;
        state.commandesDisponiblesError = action.payload;
        state.loading = false;
      })

       // 🚚 Création d'une livraison
       .addCase(postLivraison.pending, (state) => {
        state.postLivraisonLoading = true;
        state.postLivraisonError = null;
      })
      .addCase(postLivraison.fulfilled, (state, action) => {
        state.postLivraisonLoading = false;
        state.livraisons.push(action.payload);
      })
      .addCase(postLivraison.rejected, (state, action) => {
        state.postLivraisonLoading = false;
        state.postLivraisonError = action.payload;
      })
      
      
    
      
      // ✅ Récupération des livraisons actives
      .addCase(fetchActiveLivraisons.pending, (state) => {
        state.activeLivraisonsLoading = true;
        state.activeLivraisonsError = null;
        state.loading = true;
      })
      .addCase(fetchActiveLivraisons.fulfilled, (state, action) => {
        state.activeLivraisonsLoading = false;
        state.activeLivraisons = action.payload;
        state.loading = false;
      })
      .addCase(fetchActiveLivraisons.rejected, (state, action) => {
        state.activeLivraisonsLoading = false;
        state.activeLivraisonsError = action.payload;
        state.loading = false;
      })
      
      // ✅ Récupération des détails d'une livraison
      .addCase(fetchLivraisonDetails.pending, (state) => {
        state.currentLivraisonLoading = true;
        state.currentLivraisonError = null;
      })
      .addCase(fetchLivraisonDetails.fulfilled, (state, action) => {
        state.currentLivraisonLoading = false;
        state.currentLivraison = action.payload;
      })
      .addCase(fetchLivraisonDetails.rejected, (state, action) => {
        state.currentLivraisonLoading = false;
        state.currentLivraisonError = action.payload;
      })


// ✅ NOUVEAUX extraReducers pour les gains
      .addCase(updateLivreurGainsAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLivreurGainsAsync.fulfilled, (state, action) => {
        state.loading = false;
        
        // Mettre à jour les informations du livreur incluant les gains
        if (action.payload.livreur) {
          state.user = { ...state.user, ...action.payload.livreur };
          
          // Extraire les informations de gains
          const livreur = action.payload.livreur;
          state.gainsResume.totalGains = livreur.totalGains || 0;
          state.gainsResume.gainsDisponibles = livreur.gainsDisponibles || 0;
          state.gainsResume.totalLivraisons = livreur.totalLivraisons || 0;
          
          state.commissions.repas = livreur.commissionRepas || 0.60;
          state.commissions.colis = livreur.commissionColis || 0.65;
          state.commissions.gaz = livreur.commissionGaz || 0.55;
        }
        
        console.log('✅ Livreur gains mis à jour dans le state:', {
          totalGains: state.gainsResume.totalGains,
          gainsDisponibles: state.gainsResume.gainsDisponibles,
          commissions: state.commissions
        });
      })
      .addCase(updateLivreurGainsAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Erreur lors de la mise à jour des gains';
        console.error('❌ Erreur mise à jour gains livreur:', state.error);
      })      
    


      
      // ✅ Mise à jour du statut d'une livraison
      .addCase(updateLivraisonStatus.pending, (state, action) => {
        state.updatingStatus = action.meta.arg.livraisonId;
        state.error = null;
      })
      .addCase(updateLivraisonStatus.fulfilled, (state, action) => {
        state.updatingStatus = null;
        
        const { livraisonId, updatedLivraison } = action.payload;
        
        // Mettre à jour dans la liste des livraisons actives
        const index = state.activeLivraisons.findIndex(l => l.id === livraisonId);
        if (index !== -1) {
          state.activeLivraisons[index] = updatedLivraison;
        }
        
        // Mettre à jour la livraison courante si c'est la même
        if (state.currentLivraison?.id === livraisonId) {
          state.currentLivraison = updatedLivraison;
        }
      })
      .addCase(updateLivraisonStatus.rejected, (state, action) => {
        state.updatingStatus = null;
        state.error = action.payload;
      })
      
      // ✅ Marquer comme livrée
      .addCase(markAsDelivered.pending, (state) => {
        state.loading = true;
      })
      .addCase(markAsDelivered.fulfilled, (state, action) => {
        state.loading = false;
        const deliveredLivraison = action.payload;
        
        // Supprimer de la liste active
        state.activeLivraisons = state.activeLivraisons.filter(
          l => l.id !== deliveredLivraison.id
        );
        
        // Ajouter à l'historique
        state.historiqueLivraisons.unshift(deliveredLivraison);
        
        // Nettoyer la livraison courante
        if (state.currentLivraison?.id === deliveredLivraison.id) {
          state.currentLivraison = null;
        }
      })
      .addCase(markAsDelivered.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // ✅ Position livreur
      .addCase(updateLivreurLocation.fulfilled, (state, action) => {
        state.currentLocation = action.payload;
      })
      
      // ✅ Statistiques
      .addCase(fetchLivreurStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(fetchLivreurStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload;
      })
      .addCase(fetchLivreurStats.rejected, (state) => {
        state.statsLoading = false;
      })
      
      // ✅ Historique
      .addCase(fetchHistoriqueLivraisons.pending, (state) => {
        console.log("🔄 Reducer: fetchHistoriqueLivraisons.pending");
        state.historiqueLoading = true;
        state.historiqueError = null;
      })
      .addCase(fetchHistoriqueLivraisons.fulfilled, (state, action) => {
        console.log("✅ Reducer: fetchHistoriqueLivraisons.fulfilled");
        console.log("✅ Payload reçu dans reducer:", action.payload);
        state.historiqueLoading = false;
        
        // Stocker toutes les données de la réponse API
        if (action.payload && Array.isArray(action.payload)) {
          // Si c'est directement un tableau (ancienne version)
          state.historiqueLivraisons = action.payload;
        } else if (action.payload && action.payload.livraisons) {
          // Si c'est la nouvelle structure avec summary
          state.historiqueLivraisons = action.payload.livraisons || [];
          state.historiqueSummary = action.payload.summary || null;
          state.historiqueStatsParType = action.payload.statsParType || [];
          state.historiquePagination = action.payload.pagination || null;
        } else {
          state.historiqueLivraisons = [];
        }
        
        state.historiqueError = null;
      })
      .addCase(fetchHistoriqueLivraisons.rejected, (state, action) => {
        console.log("❌ Reducer: fetchHistoriqueLivraisons.rejected");
        console.error("❌ Erreur dans reducer:", action.payload);
        state.historiqueLoading = false;
        state.historiqueError = action.payload;
        state.historiqueLivraisons = []; // ✅ Reset en cas d'erreur
      })
      
      // ✅ Validation du code de livraison
      .addCase(validateDeliveryCode.pending, (state) => {
        state.validatingCode = true;
        state.validationError = null;
      })
      .addCase(validateDeliveryCode.fulfilled, (state, action) => {
        state.validatingCode = false;
        state.validationError = null;
        console.log('✅ Code validé avec succès:', action.payload);
      })
      .addCase(validateDeliveryCode.rejected, (state, action) => {
        state.validatingCode = false;
        state.validationError = action.payload;
        console.log('❌ Échec validation code:', action.payload);
      });
  },
});

// ✅ Export des actions
export const {
  clearErrors,
  clearCurrentLivraison,
  setCurrentLivraison,
  showCommandeModal,
  hideCommandeModal,
  addNewCommandeDisponible,
  removeCommandeDisponible,
  updateLivraisonInList,
  updateLocalPosition,
  loadPersistedState,

  updateGainsResume,
  updateCommissions,
  updateStats,
  incrementGainsApresLivraison,
  decrementGainsApresRetrait,
  resetStatsQuotidiennes
} = livraisonSlice.actions;

// ✅ NOUVEAUX sélecteurs pour les gains
export const selectLivreurGainsResume = (state) => state.auth.gainsResume;
export const selectLivreurCommissions = (state) => state.auth.commissions;
export const selectLivreurStats = (state) => state.auth.stats;

export const selectCanWithdraw = (state) => 
  state.auth.gainsResume.gainsDisponibles > 0;


export const selectCommissionForType = (type) => (state) => {
  switch (type) {
    case 'REPAS': return state.auth.commissions.repas;
    case 'COLIS': return state.auth.commissions.colis;
    case 'GAZ': return state.auth.commissions.gaz;
    default: return 0;
  }
};

export default livraisonSlice.reducer;