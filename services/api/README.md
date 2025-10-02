# Services API Documentation

## 📡 Architecture

Ce projet utilise une **architecture API externe** avec l'endpoint : `https://api.novic.dev`

Tout le backend a été externalisé. Ce dashboard est un **frontend pur** qui communique avec l'API backend via des services TypeScript modulaires.

## 🗂️ Structure des Services

```
services/
├── apiClient.ts              # Client HTTP centralisé avec intercepteurs
├── urlApp.js                 # Configuration des URLs
└── api/
    ├── index.ts              # Export centralisé
    ├── auth.service.ts       # Authentification
    ├── users.service.ts      # Gestion des utilisateurs
    ├── restaurants.service.ts # Restaurants, menus, plats
    ├── commandes.service.ts  # Commandes repas
    ├── colis.service.ts      # Livraison colis
    ├── livreurs.service.ts   # Gestion des livreurs
    ├── wallet.service.ts     # Wallets admin & livreurs
    ├── config.service.ts     # Configuration générale
    └── stock.service.ts      # Gestion de stock
```

## 🚀 Utilisation

### Import des services

```typescript
import { authService, usersService, walletService } from '@/services/api';
```

### Exemples d'utilisation

#### Authentification
```typescript
// Connexion admin
const response = await authService.loginAdmin({
  email: 'admin@example.com',
  password: 'password123'
});

// Le token est automatiquement stocké
console.log(response.user);
```

#### Récupérer des données
```typescript
// Liste des utilisateurs avec filtres
const users = await usersService.getAll({
  page: 1,
  limit: 20,
  search: 'john'
});

// Statistiques du wallet
const stats = await walletService.getAdminStats();
```

#### Créer une ressource
```typescript
// Créer un restaurant
const restaurant = await restaurantsService.create({
  name: 'Mon Restaurant',
  adresse: '123 Rue Example',
  latitude: 3.848,
  longitude: 11.502
});
```

#### Mettre à jour
```typescript
// Mettre à jour le statut d'une commande
await commandesService.updateStatus(123, 'LIVREE');

// Assigner un livreur
await colisService.assignLivreur(456, 789);
```

## 🔐 Gestion de l'authentification

Le client API gère automatiquement :
- ✅ Ajout du token Bearer dans les headers
- ✅ Refresh token automatique en cas d'expiration
- ✅ Redirection vers /login si non authentifié
- ✅ File d'attente pour les requêtes pendant le refresh

### Stockage des tokens

```typescript
// Le service auth stocke automatiquement les tokens
apiClient.setAuthTokens({
  token: 'jwt-token',
  refreshToken: 'refresh-token'
});

// Pour nettoyer
apiClient.clearAuthTokens();
```

## 📊 Services disponibles

### 1. **authService**
- `loginAdmin()` - Connexion admin
- `loginUser()` - Connexion utilisateur
- `logout()` - Déconnexion
- `resetPassword()` - Réinitialisation mot de passe
- `verifyToken()` - Vérification token

### 2. **usersService**
- `getAll()` - Liste utilisateurs
- `getById()` - Utilisateur par ID
- `create()` - Créer utilisateur
- `update()` - Modifier utilisateur
- `delete()` - Supprimer utilisateur

### 3. **restaurantsService**
- `getAll()` - Liste restaurants
- `getMenus()` - Menus d'un restaurant
- `getCategories()` - Catégories
- `getPlats()` - Liste des plats
- `createPlat()` - Créer un plat

### 4. **commandesService**
- `getAll()` - Liste commandes avec filtres
- `getById()` - Détails commande
- `updateStatus()` - Changer statut
- `assignLivreur()` - Assigner livreur
- `getStats()` - Statistiques

### 5. **colisService**
- `getAll()` - Liste colis
- `calculatePrice()` - Calculer prix
- `assignLivreur()` - Assigner livreur
- `getStats()` - Statistiques

### 6. **livreursService**
- `getAll()` - Liste livreurs
- `updateStatus()` - Changer statut
- `updateLocation()` - MAJ position
- `getStats()` - Stats livreur
- `findNearby()` - Livreurs à proximité

### 7. **walletService**
- `getAdminBalance()` - Solde admin
- `getAdminStats()` - Stats admin
- `getAdminTransactions()` - Historique transactions
- `getLivreurBalance()` - Solde livreur
- `createWithdrawal()` - Demande retrait
- `exportTransactions()` - Export CSV

### 8. **configService**
- `getAll()` - Toutes les configs
- `updateCommission()` - Modifier commissions
- `updateTarif()` - Modifier tarifs
- `getClientSettings()` - Paramètres app client
- `getLivreurSettings()` - Paramètres app livreur

### 9. **stockService**
- `getAll()` - Inventaire complet
- `addStock()` - Ajouter stock
- `removeStock()` - Retirer stock
- `getAlerts()` - Alertes stock bas
- `getForecast()` - Prévisions
- `exportInventory()` - Export CSV

## 🔧 Configuration

Modifier l'URL de base dans `services/urlApp.js` :

```javascript
// Production
export const BASE_URL = 'https://api.novic.dev';

// Développement local
// export const BASE_URL = 'http://localhost:3001';
```

## 📝 Types TypeScript

Tous les services sont **fully typed** avec TypeScript :
- Autocomplétion complète
- Validation des types
- Interfaces exportées

```typescript
import type { User, Restaurant, Commande } from '@/services/api';
```

## 🛠️ Gestion des erreurs

```typescript
try {
  const data = await usersService.getAll();
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Ressource non trouvée');
  } else if (error.response?.status === 401) {
    // Redirection automatique vers /login
  } else {
    console.error('Erreur:', error.message);
  }
}
```

## 🎯 Bonnes pratiques

1. **Toujours utiliser les services** au lieu d'appeler axios directement
2. **Gérer les erreurs** avec try/catch
3. **Utiliser les types** TypeScript fournis
4. **Ne jamais stocker les tokens** manuellement (le client le fait)
5. **Utiliser les filtres** pour la pagination et la recherche

## 📦 Dépendances

- `axios` - Client HTTP
- TypeScript - Typage statique

Aucune dépendance backend (Prisma, bcrypt, pg, etc.)
