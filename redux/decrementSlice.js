import { createSlice } from '@reduxjs/toolkit';

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    // autres états...
  },
  reducers: {
    // autres actions...
    decrementComplementQuantity: (state, action) => {
      const { productId, complementId } = action.payload;
      const product = state.items.find(item => item.uniqueKey === productId);

      if (product && product.complements) {
        const complement = product.complements.find(c => c.id === complementId);

        if (complement) {
          complement.quantity -= 1;

          // Si la quantité est zéro, retirer le complément
          if (complement.quantity <= 0) {
            product.complements = product.complements.filter(c => c.id !== complementId);
          }

          // Recalculer le prix du produit
          const complementsTotalPrice = product.complements.reduce((sum, c) => sum + (c.price * c.quantity), 0);
          product.perPrice = product.basePrice + complementsTotalPrice;
          product.prix = product.perPrice * product.quantity;

          // Recalculer le prix total du panier
          state.totalPrice = state.items.reduce((total, item) => total + item.prix, 0);
        }
      }
    },
  },
});

export const { decrementComplementQuantity } = cartSlice.actions;
export default cartSlice.reducer;
