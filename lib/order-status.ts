// Statuts de commande (alignés sur l'enum Prisma CommandeStatus du backend)
export type OrderStatus =
  | 'EN_ATTENTE' | 'ACCEPTEE_RESTAURANT' | 'EN_PREPARATION' | 'PRETE'
  | 'VALIDER' | 'ASSIGNEE' | 'RECUPEREE' | 'EN_COURS' | 'LIVREE' | 'ANNULEE' | 'REFUSEE_RESTAURANT';

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  EN_ATTENTE: 'Nouvelle',
  ACCEPTEE_RESTAURANT: 'Acceptée',
  EN_PREPARATION: 'En préparation',
  PRETE: 'Prête',
  VALIDER: 'Livreur affecté',
  ASSIGNEE: 'Livreur affecté',
  RECUPEREE: 'Récupérée',
  EN_COURS: 'En livraison',
  LIVREE: 'Livrée',
  ANNULEE: 'Annulée',
  REFUSEE_RESTAURANT: 'Refusée',
};

// Classes tailwind par statut (fond doux + texte)
export const ORDER_STATUS_CLASS: Record<OrderStatus, string> = {
  EN_ATTENTE: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
  ACCEPTEE_RESTAURANT: 'bg-sky-100 text-sky-900 dark:bg-sky-900/40 dark:text-sky-100',
  EN_PREPARATION: 'bg-orange-100 text-orange-900 dark:bg-orange-900/40 dark:text-orange-100',
  PRETE: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
  VALIDER: 'bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100',
  ASSIGNEE: 'bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100',
  RECUPEREE: 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-100',
  EN_COURS: 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100',
  LIVREE: 'bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100',
  ANNULEE: 'bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
  REFUSEE_RESTAURANT: 'bg-red-100 text-red-900 dark:bg-red-900/40 dark:text-red-100',
};

export const ACTIVE_RESTAURANT_STATUSES: OrderStatus[] = ['EN_ATTENTE', 'ACCEPTEE_RESTAURANT', 'EN_PREPARATION', 'PRETE', 'VALIDER', 'ASSIGNEE', 'RECUPEREE', 'EN_COURS'];

export const formatFcfa = (n: number | null | undefined) =>
  `${Math.round(Number(n) || 0).toLocaleString('fr-FR')} F`;
