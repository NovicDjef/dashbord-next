import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getSomeHoraireAsync, 
  getHorairesByRestaurant, 
  addHorairesBulk, 
  updateHoraire, 
  deleteHoraire 
} from '../services/routeApi';

// GET /heures et GET /restaurants/:id/heures renvoient 200 avec un tableau
// (vide quand aucun horaire n'est enregistré) ; POST .../heures/bulk renvoie
// { message, heures }. `toArray` absorbe ces deux formes.
const toArray = (data) => (Array.isArray(data) ? data : data?.heures || data?.heuresOuverture || []);




// Récupérer tous les horaires
export const fetchAllHoraires = createAsyncThunk(
  'horaires/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getSomeHoraireAsync();
      return toArray(response.data);
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchHorairesByRestaurant = createAsyncThunk(
  'horaires/fetchByRestaurant',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await getHorairesByRestaurant(restaurantId);
      return { restaurantId, horaires: toArray(response.data) };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createHorairesForRestaurant = createAsyncThunk(
  'horaires/createBulk',
  async ({ restaurantId, horaires }, { rejectWithValue }) => {
    try {
      const response = await addHorairesBulk(restaurantId, horaires);
      return { restaurantId, horaires: toArray(response.data) };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateHoraireById = createAsyncThunk(
  'horaires/updateById',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateHoraire(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteHoraireById = createAsyncThunk(
  'horaires/deleteById',
  async (id, { rejectWithValue }) => {
    try {
      await deleteHoraire(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const horaireSlice = createSlice({
  name: 'horaires',
  initialState: {
    data: [], // Tous les horaires
    byRestaurant: {}, // Horaires groupés par restaurant
    status: 'idle',
    error: null,
    restaurantStatus: {}
  },
  reducers: {
    clearHoraires: (state) => {
      state.data = [];
      state.byRestaurant = {};
      state.status = 'idle';
      state.error = null;
      state.restaurantStatus = {};
    },
    clearHorairesForRestaurant: (state, action) => {
      const restaurantId = action.payload;
      delete state.byRestaurant[restaurantId];
      delete state.restaurantStatus[restaurantId];
    },
    setRestaurantStatus: (state, action) => {
      const { restaurantId, status } = action.payload;
      state.restaurantStatus[restaurantId] = status;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch all horaires
      .addCase(fetchAllHoraires.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAllHoraires.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;
        
        // Grouper par restaurant
        const grouped = {};
        action.payload.forEach(horaire => {
          if (!grouped[horaire.restaurantId]) {
            grouped[horaire.restaurantId] = [];
          }
          grouped[horaire.restaurantId].push(horaire);
        });
        state.byRestaurant = grouped;
        state.error = null;
      })
      .addCase(fetchAllHoraires.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Fetch horaires by restaurant
      .addCase(fetchHorairesByRestaurant.pending, (state, action) => {
        const restaurantId = action.meta.arg;
        state.status = 'loading';
        state.restaurantStatus[restaurantId] = 'loading';
        state.error = null;
      })
      .addCase(fetchHorairesByRestaurant.fulfilled, (state, action) => {
        const { restaurantId, horaires } = action.payload;
        state.status = 'succeeded';
        state.restaurantStatus[restaurantId] = 'succeeded';
        state.byRestaurant[restaurantId] = horaires;
        state.error = null;
      })
      .addCase(fetchHorairesByRestaurant.rejected, (state, action) => {
        const restaurantId = action.meta.arg;
        state.status = 'failed';
        state.restaurantStatus[restaurantId] = 'failed';
        state.error = action.payload;
      })

      // Create horaires bulk
      .addCase(createHorairesForRestaurant.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createHorairesForRestaurant.fulfilled, (state, action) => {
        const { restaurantId, horaires } = action.payload;
        state.status = 'succeeded';
        state.restaurantStatus[restaurantId] = 'succeeded';
        state.byRestaurant[restaurantId] = horaires;
        state.error = null;
      })
      .addCase(createHorairesForRestaurant.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Update horaire
      .addCase(updateHoraireById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateHoraireById.fulfilled, (state, action) => {
        const updatedHoraire = action.payload;
        const restaurantId = updatedHoraire.restaurantId;
        
        if (state.byRestaurant[restaurantId]) {
          const index = state.byRestaurant[restaurantId].findIndex(h => h.id === updatedHoraire.id);
          if (index !== -1) {
            state.byRestaurant[restaurantId][index] = updatedHoraire;
          }
        }
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(updateHoraireById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Delete horaire
      .addCase(deleteHoraireById.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteHoraireById.fulfilled, (state, action) => {
        const deletedId = action.payload;
        
        // Supprimer de tous les restaurants
        Object.keys(state.byRestaurant).forEach(restaurantId => {
          state.byRestaurant[restaurantId] = state.byRestaurant[restaurantId].filter(
            h => h.id !== deletedId
          );
        });
        
        state.status = 'succeeded';
        state.error = null;
      })
      .addCase(deleteHoraireById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  clearHoraires, 
  clearHorairesForRestaurant, 
  setRestaurantStatus 
} = horaireSlice.actions;

export const { reducer } = horaireSlice;