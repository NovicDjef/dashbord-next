import { createSlice } from '@reduxjs/toolkit';

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState: [],
  reducers: {
    addFavorite: (state, action) => {
      if (!state.includes(action.payload)) {
        state.push(action.payload);
      }
    },
    removeFavorite: (state, action) => {
      return state.filter(id => id !== action.payload);
    },
    setFavorites: (state, action) => {
      return Array.from(new Set(action.payload)); // Élimine les doublons
    },
    toggleFavorite: (state, action) => {
      const index = state.indexOf(action.payload);
      if (index !== -1) {
        state.splice(index, 1);
      } else {
        state.push(action.payload);
      }
    },
  },
});

export const { addFavorite, removeFavorite, setFavorites, toggleFavorite } = favoritesSlice.actions;
export default favoritesSlice.reducer;