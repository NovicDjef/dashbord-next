# 🏗️ Architecture du Dashboard

## Vue d'ensemble

Ce dashboard est un **frontend Next.js pur** qui communique avec une API backend externe hébergée sur `https://api.novic.dev`.

## 🎯 Choix d'architecture

### Séparation Frontend/Backend
- ✅ **Frontend**: Next.js 15 + React 19 (ce projet)
- ✅ **Backend**: API REST externe (`https://api.novic.dev`)
- ✅ **Avantages**:
  - Scalabilité indépendante
  - Déploiement séparé
  - Maintenance simplifiée
  - Réutilisation de l'API par les apps mobiles

## 📁 Structure du projet

```
dashbord-next/
├── app/                      # Next.js App Router
│   ├── dashboard/            # Pages du dashboard
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── layout.tsx        # Layout commun
│   │   ├── restaurant/       # Gestion restaurants
│   │   ├── categorie/        # Catégories
│   │   ├── repas/            # Repas & menus
│   │   ├── commande/         # Commandes
│   │   ├── colis/            # Colis
│   │   ├── gaz/              # Livraison gaz
│   │   ├── livreurs/         # Gestion livreurs
│   │   ├── tarifs/           # Configuration tarifs
│   │   ├── users/            # Utilisateurs
│   │   ├── wallet/           # Wallet admin
│   │   └── ...
│   └── ...
│
├── components/               # Composants React
│   ├── ui/                   # Composants UI de base (shadcn)
│   ├── admin-dashboard-layout.tsx
│   ├── app-sidebar.tsx
│   ├── wallet-dashboard.tsx
│   ├── commission-dashboard.tsx
│   └── ...
│
├── services/                 # Services API
│   ├── apiClient.ts          # Client HTTP centralisé
│   ├── urlApp.js             # Configuration URLs
│   ├── Api.js                # Service axios legacy
│   └── api/                  # Services modulaires
│       ├── auth.service.ts
│       ├── users.service.ts
│       ├── restaurants.service.ts
│       ├── commandes.service.ts
│       ├── colis.service.ts
│       ├── livreurs.service.ts
│       ├── wallet.service.ts
│       ├── config.service.ts
│       └── stock.service.ts
│
├── hooks/                    # Custom React Hooks
│   ├── use-wallet.ts
│   ├── use-toast.ts
│   └── ...
│
├── redux/                    # State management Redux
│   ├── store.ts
│   ├── authSlice.ts
│   └── ...
│
├── lib/                      # Utilitaires
│   ├── utils.ts
│   └── config.ts
│
└── public/                   # Assets statiques

```

## 🔄 Flux de données

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ↓
┌──────────────────────────┐
│  Next.js Frontend        │
│  (Dashboard)             │
│                          │
│  ┌────────────────────┐  │
│  │  React Components  │  │
│  └─────────┬──────────┘  │
│            │              │
│            ↓              │
│  ┌────────────────────┐  │
│  │   Redux Store      │  │
│  └─────────┬──────────┘  │
│            │              │
│            ↓              │
│  ┌────────────────────┐  │
│  │  API Services      │  │
│  │  (TypeScript)      │  │
│  └─────────┬──────────┘  │
│            │              │
│            ↓              │
│  ┌────────────────────┐  │
│  │   apiClient        │  │
│  │   (Axios)          │  │
│  └─────────┬──────────┘  │
└────────────┼─────────────┘
             │
             ↓ HTTPS
┌────────────────────────────┐
│  API Backend               │
│  https://api.novic.dev     │
│                            │
│  ┌──────────────────────┐  │
│  │   Routes & Controllers│ │
│  └───────────┬───────────┘  │
│              │              │
│              ↓              │
│  ┌──────────────────────┐  │
│  │   Business Logic     │  │
│  └───────────┬───────────┘  │
│              │              │
│              ↓              │
│  ┌──────────────────────┐  │
│  │   Database           │  │
│  │   (PostgreSQL)       │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

## 🔐 Authentification

### Flow d'authentification

1. **Login** → `authService.loginAdmin()`
2. **Stockage token** → `localStorage` (automatique)
3. **Requêtes** → Header `Authorization: Bearer <token>`
4. **Refresh** → Automatique si token expiré
5. **Logout** → Nettoyage localStorage + redirection

### Intercepteurs Axios

```typescript
// Requête : Ajout automatique du token
request.use((config) => {
  const token = localStorage.getItem('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Réponse : Gestion erreur 401
response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Tentative de refresh token
      // Ou redirection vers login
    }
  }
);
```

## 🎨 Stack Technique

### Frontend
- **Framework**: Next.js 15 (App Router)
- **React**: v19
- **TypeScript**: v5
- **Styling**: Tailwind CSS v4
- **UI Library**: Radix UI + shadcn/ui
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Icons**: Tabler Icons

### Backend (API externe)
- **URL**: `https://api.novic.dev`
- **Type**: REST API
- **Format**: JSON

## 📊 Fonctionnalités principales

### 1. Dashboard Principal
- Vue d'ensemble des statistiques
- Commissions par service (Repas, Colis, Gaz)
- Graphiques interactifs
- Tableau utilisateurs

### 2. Gestion
- **Restaurants**: CRUD complet
- **Catégories & Menus**: Organisation hiérarchique
- **Plats**: Gestion inventaire restaurant
- **Utilisateurs**: Liste et gestion

### 3. Commandes
- **Repas**: Suivi commandes restaurant
- **Colis**: Gestion expéditions
- **Gaz**: Livraison bouteilles gaz
- Statuts: EN_ATTENTE, VALIDEE, EN_COURS, LIVREE, ANNULEE

### 4. Livreurs
- Liste livreurs
- Statuts: DISPONIBLE, OCCUPE, OFFLINE
- Assignation automatique/manuelle
- Tracking position

### 5. Wallet & Finances
- **Wallet Admin**:
  - Solde total
  - Revenus par service
  - Historique transactions détaillé
  - Export CSV

- **Wallet Livreurs**:
  - Gains individuels
  - Demandes de retrait
  - Historique paiements
  - Commissions

### 6. Configuration
- **Tarifs**: Prix par service et distance
- **Commissions**: Taux par type de service
- **Paramètres App Client**: Config app mobile client
- **Paramètres App Livreur**: Config app mobile livreur
- **Notifications**: Gestion événements

### 7. Stock (À venir)
- Inventaire restaurants
- Mouvements stock
- Alertes stock bas
- Prévisions réapprovisionnement

## 🚀 Démarrage

### Installation
```bash
npm install
```

### Configuration
Créer `.env` à partir de `.env.example`:
```env
NEXT_PUBLIC_API_URL=https://api.novic.dev
```

### Développement
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📝 Conventions de code

### Composants
- **Client Components**: `"use client"` en haut du fichier
- **Server Components**: Par défaut
- **Naming**: PascalCase (ex: `WalletDashboard.tsx`)

### Services
- **Naming**: camelCase avec suffix `.service.ts`
- **Export**: Named exports
- **Async**: Toujours utiliser async/await

### Types
- **Location**: Dans le même fichier ou `/types`
- **Export**: `export interface`
- **Naming**: PascalCase

### Styling
- **Tailwind**: Classes utilitaires
- **Custom CSS**: Minimal, seulement si nécessaire
- **Components UI**: shadcn/ui

## 🔧 Variables d'environnement

```env
# API
NEXT_PUBLIC_API_URL=https://api.novic.dev

# Payment
PAYMENT_API_URL=https://api.notchpay.co

# App URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CLIENT_APP_URL=url-app-client
NEXT_PUBLIC_LIVREUR_APP_URL=url-app-livreur
```

## 📦 Dépendances principales

```json
{
  "dependencies": {
    "next": "15.3.2",
    "react": "^19.0.0",
    "axios": "^1.11.0",
    "@reduxjs/toolkit": "^2.8.2",
    "recharts": "^2.15.3",
    "@radix-ui/react-*": "Latest",
    "@tabler/icons-react": "^3.33.0"
  }
}
```

**Note**: Aucune dépendance backend (Prisma, bcrypt, pg supprimées)

## 🎯 Prochaines étapes

- [ ] Améliorer le système de gestion de stock
- [ ] Ajouter page configuration générale
- [ ] Implémenter wallet livreurs
- [ ] Créer rapports financiers avancés
- [ ] Ajouter notifications temps réel
- [ ] Implémenter chat support
- [ ] Optimiser performance (code splitting)
- [ ] Tests unitaires et E2E
- [ ] Documentation API complète
- [ ] PWA pour utilisation offline

## 📞 Support

Pour toute question sur l'architecture:
- Documentation API: `/services/api/README.md`
- Documentation services: Ce fichier
