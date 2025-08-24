import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import cartReducer from './cartSlice';
import commandeSlice from './commandeSlice';
import { reducer as menuReducer } from './menuSlice';
import { reducer as repasReducer } from './repasSlice';
import { restaurantReducer } from './restaurantSlice';
import userSlice from './userSlice';
import colisSlice from './colisSlice';
import { reducer as categoriesSlice } from "./categoriesSlice";
import favoritesSlice from './favoritesSlice';
import ordersSlice from './ordersSlice';
import { reducer as menusRapideSlice } from "./menusRapideSlice";
import searchReducer from "./searchSlice";
import priceSlice from "./priceSlice";
import { reducer as notificationsSlice } from "./notificationSlice";
import complementsSlice from "./complementsSlice";
import {reducer as  slideSlice } from "./slideSlice";
import {reducer as horaireSlice} from "./horaireSlice";
import livreurSlice from "./livreurSlice";
import usersSlice from "./usersSlice";
import gazSlice from "./gazSlice";
import gainSlice from "./gainSlice";
import commissionsSlice from "./commissionsSlice";

export const store = configureStore({
  reducer: {
    orders: ordersSlice,
    user: userSlice,
    slide: slideSlice,
    repas: repasReducer,
    restaurants: restaurantReducer,
    menus: menuReducer,
    cart: cartReducer,
    auth: authReducer, // Changé de "Auth" à "auth" pour cohérence
    commande: commandeSlice,
    colis: colisSlice,
    categories: categoriesSlice,
    favorites: favoritesSlice,
    menusRapide: menusRapideSlice,
    search: searchReducer,
    price: priceSlice,
    notification: notificationsSlice,
    complements: complementsSlice,
    horaires: horaireSlice,
    livreur: livreurSlice,
    users: usersSlice,
    gas: gazSlice,
    gains: gainSlice,
    commissions: commissionsSlice,

 },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Désactiver le middleware SerializableStateInvariantMiddleware
    }),
  // middleware: (getDefaultMiddleware) =>
  //   getDefaultMiddleware({
  //     serializableCheck: {
  //       // Ignorez les actions ou les chemins d'état qui peuvent contenir des données non sérialisables
  //       ignoredActions: ['some/action'], // Remplacez par les actions spécifiques à ignorer si nécessaire
  //       ignoredPaths: ['some.path'], // Remplacez par les chemins spécifiques à ignorer si nécessaire
        
  //       // Augmentez le seuil d'avertissement (en millisecondes)
  //       warnAfter: 128,
  //     },
  //     immutableCheck: { warnAfter: 128 },
  //   }),
  // devTools: process.env.NODE_ENV !== 'production',
});

