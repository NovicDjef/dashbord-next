import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addSomeCommande } from '../services/routeApi'; // Assurez-vous que le chemin d'importation est correct
import apiService from '../services/Api';


export const getCommandesAsync = createAsyncThunk(
  'commande/fetchCommandes',
  async (_, { rejectWithValue }) => {
    try {
      // Appel API pour récupérer la liste des commandes avec les relations client, restaurant et livreur
      const response = await apiService.get('/commandes');
      console.log("Commandes récupérées avec relations:", response.data);
      return response.data;
    } catch (error) {
      // Gestion des erreurs avec rejectWithValue
      console.error("Erreur lors de la récupération des commandes:", error.response?.data);
      return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les commandes" });
    }
  }
);

export const createCommandeAsync = createAsyncThunk(
    'commande/addSomeCommande',
    async (commandeData, { rejectWithValue }) => {
      try {
        console.log("Données envoyées à l'API:", commandeData);
        const response = await addSomeCommande(commandeData);
        return response.data;
      } catch (error) {
        // Log complet pour debug
        if (error.response) {
          console.error("Erreur API (status):", error.response.status);
          console.error("Erreur API (data):", error.response.data);
        } else {
          console.error("Erreur Axios:", error.message);
        }
        return rejectWithValue(error.response?.data || { message: "Une erreur est survenue" });
      }
    }
  );

  // `status` est un statut de l'enum backend (CommandeStatus) : la machine à
  // états de services/orderStateMachine.js refuse tout ce qu'elle n'autorise pas
  // au rôle admin (409). `raison` sert aux annulations et refus.
  export const updateCommandeStatusAsync = createAsyncThunk(
    'commande/updateStatus',
    async ({ id, status, raison }, { rejectWithValue }) => {
      try {
        const body = { status: String(status).toUpperCase() };
        if (raison) body.raison = raison;
        const response = await apiService.patch(`/commande/${id}`, body);
        return response.data.commande;
      } catch (error) {
        console.error("Erreur lors de la mise à jour du statut de la commande:", error.response?.data);
        return rejectWithValue(error.response?.data || { message: "Impossible de mettre à jour le statut de la commande" });
      }
    }
  );

  // Livreurs disponibles pour une affectation manuelle (GET /livreurs/available,
  // réponse { success, livreurs, count }).
  export const fetchLivreursDisponiblesAsync = createAsyncThunk(
    'commande/fetchLivreursDisponibles',
    async (_, { rejectWithValue }) => {
      try {
        const response = await apiService.get('/livreurs/available');
        return response.data?.livreurs || [];
      } catch (error) {
        console.error("Erreur lors de la récupération des livreurs disponibles:", error.response?.data);
        return rejectWithValue(error.response?.data || { message: "Impossible de récupérer les livreurs disponibles" });
      }
    }
  );

  // Affectation manuelle : seul l'admin peut passer une commande en ASSIGNEE, et
  // le backend exige alors un `livreurId`.
  export const assignLivreurAsync = createAsyncThunk(
    'commande/assignLivreur',
    async ({ id, livreurId }, { rejectWithValue }) => {
      try {
        const response = await apiService.patch(`/commande/${id}`, { status: 'ASSIGNEE', livreurId: Number(livreurId) });
        return response.data.commande;
      } catch (error) {
        console.error("Erreur lors de l'affectation du livreur:", error.response?.data);
        return rejectWithValue(error.response?.data || { message: "Impossible d'affecter ce livreur" });
      }
    }
  );

  const commandeSlice = createSlice({
    name: 'commande',
    initialState: {
      currentCommande: null,
      commandes: [], // On ajoute un état pour stocker les commandes
      livreursDisponibles: [],
      status: 'idle',
      error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
      builder
        // Gestion de la création de commande
        .addCase(createCommandeAsync.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(createCommandeAsync.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.currentCommande = action.payload;
        })
        .addCase(createCommandeAsync.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || "Une erreur est survenue";
        })
  
        // Gestion de la récupération des commandes
        .addCase(getCommandesAsync.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(getCommandesAsync.fulfilled, (state, action) => {
          state.status = 'succeeded';
          state.commandes = action.payload; // Mettre à jour la liste des commandes
        })
        .addCase(getCommandesAsync.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || "Impossible de récupérer les commandes";
        })

        .addCase(updateCommandeStatusAsync.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(updateCommandeStatusAsync.fulfilled, (state, action) => {
          state.status = 'succeeded';
          // Mettre à jour le statut de la commande dans la liste des commandes
          const index = state.commandes.findIndex(commande => commande.id === action.payload.id);
          if (index !== -1) {
            state.commandes[index] = action.payload;
          }
          // Si c'est la commande courante, mettre à jour currentCommande aussi
          if (state.currentCommande && state.currentCommande.id === action.payload.id) {
            state.currentCommande = action.payload;
          }
        })
        .addCase(updateCommandeStatusAsync.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || "Impossible de mettre à jour le statut de la commande";
        })

        .addCase(fetchLivreursDisponiblesAsync.fulfilled, (state, action) => {
          state.livreursDisponibles = action.payload;
        })
        .addCase(fetchLivreursDisponiblesAsync.rejected, (state) => {
          state.livreursDisponibles = [];
        })

        .addCase(assignLivreurAsync.pending, (state) => {
          state.status = 'loading';
        })
        .addCase(assignLivreurAsync.fulfilled, (state, action) => {
          state.status = 'succeeded';
          const index = state.commandes.findIndex(commande => commande.id === action.payload?.id);
          if (index !== -1) {
            state.commandes[index] = action.payload;
          }
          if (state.currentCommande && state.currentCommande.id === action.payload?.id) {
            state.currentCommande = action.payload;
          }
        })
        .addCase(assignLivreurAsync.rejected, (state, action) => {
          state.status = 'failed';
          state.error = action.payload?.message || "Impossible d'affecter ce livreur";
        });
    },
  });
  
  export const { resetCommandeState } = commandeSlice.actions;
  export default commandeSlice.reducer;