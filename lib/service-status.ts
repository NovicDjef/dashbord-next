// Statuts des services colis et gaz, alignés sur les enums Prisma du backend
// (prisma/schema.prisma : `ColisStatus` et `GasOrderStatus`).

export const COLIS_STATUSES = ['EN_ATTENTE', 'VALIDER', 'ASSIGNEE', 'EN_COURS', 'LIVREE', 'ANNULEE'] as const;
export type ColisStatus = (typeof COLIS_STATUSES)[number];

export const GAS_ORDER_STATUSES = ['EN_ATTENTE', 'VALIDER', 'ASSIGNEE', 'EN_COURS', 'LIVREE', 'ANNULEE', 'REMBOURSE'] as const;
export type GasOrderStatus = (typeof GAS_ORDER_STATUSES)[number];
