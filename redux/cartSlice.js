import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    status: 'idle',
    error: null,
    totalPrice: 0,
    totalQuantity: 0
  },
  reducers: {
    addToCart: (state, action) => {
      const newItem = action.payload;
      console.debug("🛒 CartSlice - Ajout d'un nouvel item:", {
        nom: newItem.name,
        prix: newItem.prix || newItem.price,
        restaurantData: newItem.restaurantData ? {
          nom: newItem.restaurantData.name,
          latitude: newItem.restaurantData.latitude,
          longitude: newItem.restaurantData.longitude
        } : 'Absent'
      });
      
      const existingItem = state.items.find(item => item.id === newItem.id);
      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.prix += existingItem.perPrice;
        // 🚀 Préserver restaurantData lors de l'ajout d'un item existant
        if (newItem.restaurantData && !existingItem.restaurantData) {
          existingItem.restaurantData = newItem.restaurantData;
        }
      } else {
        state.items.push({ 
          ...newItem, 
          quantity: 1, 
          perPrice: newItem.prix || newItem.price,
          // 🚀 S'assurer que restaurantData est préservé
          restaurantData: newItem.restaurantData
        });
      }
      state.totalPrice += (newItem.prix || newItem.price);
      state.totalQuantity += 1;
    },
    updateCartItemQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item) {
        const quantityDiff = quantity - item.quantity;
        item.quantity = quantity;
        item.prix = quantity * item.perPrice;
        state.totalPrice += quantityDiff * item.perPrice;
        state.totalQuantity += quantityDiff;
      }
    },
    removeFromCart: (state, action) => {
      const itemId = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        state.totalPrice -= item.prix;
        state.totalQuantity -= item.quantity;
        state.items = state.items.filter(item => item.id !== itemId);
      }
    },
    clearCart: (state) => {
      state.items = [];
      state.totalPrice = 0;
      state.totalQuantity = 0;
    },
    addComplement: (state, action) => {
      const { itemId, complement } = action.payload;
      const item = state.items.find(item => item.id === itemId);
      if (item) {
        if (!item.complements) {
          item.complements = [];
        }
        item.complements.push(complement);
        item.prix += complement.price;
        state.totalPrice += complement.price;
      }
    }
  },});

export const { 
  addToCart, 
  updateCartItemQuantity, 
  removeFromCart, 
  clearCart,
  addComplement 
} = cartSlice.actions;

// Sélecteurs
export const selectCartItems = state => state.cart.items;
export const selectCartTotalPrice = state => state.cart.totalPrice;
export const selectCartTotalQuantity = state => state.cart.totalQuantity;
export const selectCartStatus = state => state.cart.status;
export const selectCartError = state => state.cart.error;

export default cartSlice.reducer;