# Changelog - Migration vers API Externe

## 🔄 Version 2.0.0 - Migration Backend → API Externe

**Date**: Octobre 2025

### 🎯 Changements majeurs

#### ❌ Supprimé
- **Backend local complet**:
  - ✅ Dossier `app/api/` (routes et controllers)
  - ✅ Dossier `prisma/` (schéma de base de données)
  - ✅ Fichier `lib/db.ts` (configuration Prisma)

- **Dépendances backend**:
  - ✅ `@prisma/client`
  - ✅ `prisma`
  - ✅ `bcrypt`
  - ✅ `@types/bcrypt`
  - ✅ `jsonwebtoken`
  - ✅ `@types/jsonwebtoken`
  - ✅ `pg`
  - ✅ `@types/pg`
  - ✅ `expo-server-sdk`

#### ✅ Ajouté

**Services API centralisés** (`services/api/`):
- ✅ `apiClient.ts` - Client HTTP avec intercepteurs et auto-refresh token
- ✅ `auth.service.ts` - Service d'authentification
- ✅ `users.service.ts` - Gestion utilisateurs
- ✅ `restaurants.service.ts` - Restaurants, menus, catégories, plats
- ✅ `commandes.service.ts` - Commandes repas
- ✅ `colis.service.ts` - Livraison colis
- ✅ `livreurs.service.ts` - Gestion livreurs
- ✅ `wallet.service.ts` - Wallets admin & livreurs
- ✅ `config.service.ts` - Configuration système
- ✅ `stock.service.ts` - Gestion de stock (nouveau)

**Documentation**:
- ✅ `services/api/README.md` - Documentation complète des services
- ✅ `ARCHITECTURE.md` - Architecture du projet
- ✅ `CHANGELOG.md` - Ce fichier

#### 🔧 Modifié
- ✅ `.env.example` - Mise à jour avec API externe
- ✅ `package.json` - Nettoyage dépendances backend
- ✅ `services/urlApp.js` - Déjà configuré pour `https://api.novic.dev`
- ✅ `services/Api.js` - Conservé pour compatibilité legacy

## 📊 Architecture avant/après

### ❌ Avant (Backend local)
```
Dashboard Next.js
├── Frontend (React/Next.js)
├── Backend (API Routes)
├── Prisma (ORM)
└── PostgreSQL (Database)
```

### ✅ Après (API externe)
```
Dashboard Next.js (Frontend pur)
├── React Components
├── Redux Store
├── API Services (TypeScript)
└── Axios Client
      ↓ HTTPS
API Backend (https://api.novic.dev)
└── PostgreSQL Database
```

## 🚀 Avantages de la migration

### Performance
- ✅ Bundle plus léger (-131 packages)
- ✅ Pas de traitement backend côté Next.js
- ✅ Déploiement plus rapide

### Maintenance
- ✅ Séparation des responsabilités
- ✅ Code plus propre et modulaire
- ✅ Tests plus faciles

### Scalabilité
- ✅ Frontend et backend scalent indépendamment
- ✅ Réutilisation API par apps mobiles
- ✅ Déploiements séparés

### Développement
- ✅ Types TypeScript complets
- ✅ Autocomplétion VSCode
- ✅ Services modulaires réutilisables

## 📝 Migration guide

### Pour les développeurs

#### Avant (Backend local)
```typescript
// Appel direct à Prisma
const users = await prisma.user.findMany();
```

#### Après (API externe)
```typescript
// Utilisation du service
import { usersService } from '@/services/api';

const users = await usersService.getAll();
```

### Nouveaux patterns

#### Récupération de données
```typescript
// ✅ Bon
const data = await usersService.getAll({
  page: 1,
  limit: 20
});

// ❌ Éviter
const data = await fetch('/api/users');
```

#### Authentification
```typescript
// ✅ Bon - Token géré automatiquement
const response = await authService.loginAdmin(credentials);
// Token stocké et ajouté aux futures requêtes

// ❌ Éviter - Gestion manuelle
localStorage.setItem('token', token);
```

## 🔐 Sécurité

### Gestion des tokens
- ✅ Stockage automatique dans localStorage
- ✅ Ajout automatique dans headers
- ✅ Refresh token automatique
- ✅ Redirection auto si non authentifié

### Intercepteurs
```typescript
// Auto-ajout du token
request → Add Bearer token

// Gestion erreurs 401
response → Try refresh → Success/Redirect login
```

## 📦 Installation

```bash
# Nettoyer les anciens modules
rm -rf node_modules package-lock.json

# Installer les nouvelles dépendances
npm install
```

## 🎯 Prochaines fonctionnalités

### En développement
- [ ] Page de configuration générale
- [ ] Wallet livreurs complet
- [ ] Gestion de stock avancée
- [ ] Rapports financiers
- [ ] Notifications temps réel

### Planifié
- [ ] Export de données (CSV, Excel)
- [ ] Tableau de bord personnalisable
- [ ] Analytics avancés
- [ ] Chat support intégré
- [ ] Mode PWA

## 🐛 Breaking Changes

### Suppression des routes API locales
Les routes suivantes n'existent plus en local:
- `/api/admin/*`
- `/api/users/*`
- `/api/restaurant/*`
- `/api/commande/*`
- `/api/colis/*`
- `/api/menu/*`
- `/api/categorie/*`
- `/api/repas/*`

**Solution**: Utiliser les services dans `services/api/`

### Suppression de Prisma
Plus de `prisma.*` disponible

**Solution**: Toutes les requêtes passent par l'API externe

## 📚 Documentation

- **Services API**: `services/api/README.md`
- **Architecture**: `ARCHITECTURE.md`
- **Configuration**: `.env.example`

## 🔗 Liens utiles

- **API Backend**: https://api.novic.dev
- **API Paiement**: https://api.notchpay.co
- **Documentation API**: (À venir)

## 👥 Contributeurs

- Migration vers API externe - 2025
- Nettoyage backend
- Documentation complète

---

**Version**: 2.0.0
**API Endpoint**: https://api.novic.dev
**Date**: Octobre 2025
