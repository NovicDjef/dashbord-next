# Services API

Le dashboard est un frontend pur qui parle à `Backend_foodtech` via `NEXT_PUBLIC_API_URL` (voir `services/urlApp.js`).

- `services/apiClient.ts` : client HTTP (token admin, intercepteur 401).
- `services/api/restaurateur.service.ts` : espace restaurateur (inscription, mon restaurant, menu, horaires, commandes) et validation/tarification côté super-admin.
- `services/routeApi.js` : helpers historiques encore utilisés par les slices Redux des pages admin.

Règle : avant d'ajouter un appel, vérifier que la route existe dans `Backend_foodtech/routes/*.js` (montée sur `/` et `/api`).
