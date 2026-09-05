// Configuration centralisée des URLs
// Basculez entre développement local et production en commentant/décommentant les lignes appropriées

// === CONFIGURATION PRODUCTION ===
export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.novic.dev').replace(/\/+$/, '');
export const PAYMENT_API_URL = 'https://api.notchpay.co';

// === CONFIGURATION DÉVELOPPEMENT LOCAL ===
// export const BASE_URL = 'http://192.168.1.86:3001';
// export const PAYMENT_API_URL = 'https://api.notchpay.co'; // API de paiement reste en production

// === CONFIGURATION ALTERNATIVE ===
// export const BASE_URL = 'http://api.koursier.com';
// export const BASE_URL = 'https://nguetioofa.dev:4040';

// === URLs SPÉCIFIQUES ===
export const API_ENDPOINTS = {
  // API principale
  base: BASE_URL,
  
  // Images
  images: `${BASE_URL}/images`,
  
  // Endpoints spécifiques
  tarifs: `${BASE_URL}/tarifs`,
  restaurants: `${BASE_URL}/restaurants`,
  categories: `${BASE_URL}/categories`,
  repas: `${BASE_URL}/repas`,
  
  // Paiements
  payment: {
    initialize: `${PAYMENT_API_URL}/payments/initialize`,
    callback: 'https://votre-site.com/callback',
    returnUrl: 'https://votre-site.com/return'
  },
  
  // URLs locales
  local: {
    frontend: 'http://localhost:3000',
    dev: 'http://127.0.0.1:5173'
  }
};

// === HELPERS POUR LES IMAGES ===
export const baseImage = (path) => {
  if (!path) return null;

  return path.startsWith('images/')
    ? `${BASE_URL}/${path}`
    : `${BASE_URL}/images/${path}`;
};

// Helper pour construire une URL d'image complète
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;

  // Si c'est déjà une URL complète, la retourner telle quelle
  if (imagePath.startsWith('http')) return imagePath;

  // Si le chemin commence par '/', le concaténer directement
  if (imagePath.startsWith('/')) return `${BASE_URL}${imagePath}`;

  // Sinon, ajouter '/images/' avant le nom de fichier
  return `${BASE_URL}/images/${imagePath}`;
};

// Helper pour les URLs de callback/return de paiement
export const getPaymentUrls = (baseUrl = 'https://votre-site.com') => ({
  callback: `${baseUrl}/callback`,
  return_url: `${baseUrl}/return`
});

// Export par défaut de BASE_URL pour la compatibilité
export default BASE_URL;