# Dashboard Koursier (dashbord-next)

Next.js 15 (App Router). Deux espaces :

- **Restaurateurs** — `/register` (inscription avec position sur carte), `/login`, puis `/restaurant` : commandes en direct (signal sonore, accepter / préparation / prête / refuser), menu (catégories, plats avec disponibilité, compléments), horaires, profil.
- **Administration Koursier** — `/dashboard` : validation des restaurants (`/dashboard/validation`), tarification des livraisons (`/dashboard/tarification`), restaurants, livreurs, utilisateurs, commandes, commissions.

## Démarrer

```bash
npm install
cp .env.example .env.local    # NEXT_PUBLIC_API_URL=http://localhost:3001 en local
npm run dev                   # http://localhost:3000
npm run build && npm start    # production
```

Connexion commune sur `POST /admin/login` de l'API : la réponse porte `admin.role` (`SUPER_ADMIN` ou `RESTAURATEUR`) et la redirection se fait automatiquement.

## Structure

- `app/restaurant/*` espace restaurateur, `app/dashboard/*` administration, `app/login`, `app/register`
- `services/api/restaurateur.service.ts` appels typés (menu, commandes, validation, tarifs) ; `services/apiClient.ts` client HTTP (token `adminToken`)
- `components/restaurant/restaurant-shell.tsx` barre latérale et bandeau de validation ; `components/map-picker.tsx` carte OpenStreetMap
- `lib/order-status.ts` libellés et couleurs des statuts de commande
- `redux/adminAuthSlice.js` session (admin, rôle, restaurants)

Le contrat d'API est documenté dans le dépôt backend (`docs/PHASE-1-CONTRAT.md`, `docs/PHASE-2-RESTAURATEUR.md`).
