/**
 * Règle tarifaire Koursier (services/deliveryPricing.js côté backend) :
 * 500 F jusqu'à 2 km, puis 50 F par km entamé au-delà.
 * Les valeurs réelles viennent de la table tarifs_livraison ; celles-ci sont les valeurs par défaut affichées sur le site.
 */
export const FARE = { base: 500, franchiseKm: 2, perKm: 50 };

export const computeFare = (km: number) => FARE.base + Math.max(0, Math.ceil(km - FARE.franchiseKm)) * FARE.perKm;
