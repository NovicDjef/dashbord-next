/**
 * Icônes du motif Koursier (repère 48×48, tracés au trait) et leur disposition sur une tuile de 640×640.
 * Source unique pour la couche animée (pattern-layer.tsx) et pour les SVG statiques (scripts/make-pattern.mjs).
 */
export const PATTERN_TILE = 640;

export const PATTERN_SYMBOLS: Record<string, string> = {
  scooter: `<path d="M4 20h10v8H4zM14 24h8l6-10h7a2 2 0 0 1 0 4h-4l-4 8h8a5 5 0 0 1 5 5v3H14z"/><circle cx="14" cy="36" r="5"/><circle cx="35" cy="36" r="5"/><circle cx="29" cy="7" r="3"/><path d="M26 10h6l3 6-2 2-3-3h-2l-2 4"/>`,
  cloche: `<path d="M6 34h36M9 34a15 15 0 0 1 30 0M24 19v-4"/><circle cx="24" cy="12" r="2.5"/><path d="M14 30c1-5 4-8 8-9"/>`,
  couverts: `<path d="M14 6v36M10 6v8a4 4 0 0 0 8 0V6M34 6c-4 5-6 11-3 18h3V6zM34 24v18"/>`,
  marmite: `<path d="M8 20h32M11 20l2 16a4 4 0 0 0 4 4h14a4 4 0 0 0 4-4l2-16M4 23h7M37 23h7M17 8c-2 3 2 4 0 7M24 5c-2 3 2 4 0 7M31 8c-2 3 2 4 0 7"/>`,
  poisson: `<path d="M6 24c7-9 19-11 29-3l5 3-5 3c-10 8-22 6-29-3zM40 24l5-7v14zM21 18c2 3 2 9 0 12"/><circle cx="14" cy="22" r="1.5"/>`,
  plantain: `<path d="M10 36c9 2 21-4 27-15M8 31c10 3 23-4 28-15M12 41c9 2 23-5 29-17M39 14l4-4M37 21l4-3"/>`,
  piment: `<path d="M31 9c-4 0-6 3-6 6-9 0-14 8-14 14 0 8 4 13 8 13 8 0 18-12 18-24 0-4-2-7-6-9zM25 15c2-3 5-4 8-4M31 9c2-2 4-3 7-3"/>`,
  soya: `<path d="M6 42 42 6"/><rect x="12" y="28" width="8" height="8" transform="rotate(-45 16 32)"/><rect x="20" y="20" width="8" height="8" transform="rotate(-45 24 24)"/><rect x="28" y="12" width="8" height="8" transform="rotate(-45 32 16)"/>`,
  bouteille: `<path d="M20 4h8v6l4 6v25a3 3 0 0 1-3 3H19a3 3 0 0 1-3-3V16l4-6zM16 24h16M16 32h16"/>`,
  gaz: `<path d="M14 14h20v26a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4zM20 14v-4h8v4M24 10V6M19 6h10M14 22h20"/>`,
  colis: `<path d="M8 16l16-8 16 8v18l-16 8-16-8zM8 16l16 8 16-8M24 24v18M16 12l16 8"/>`,
  epingle: `<path d="M24 44S10 32 10 20a14 14 0 0 1 28 0c0 12-14 24-14 24z"/><circle cx="24" cy="20" r="5"/>`,
  casque: `<path d="M8 28a16 16 0 0 1 32 0v6H8zM8 28h32M14 34v4h20v-4M26 22h10"/>`,
  assiette: `<path d="M6 34h36M10 34a14 8 0 0 1 28 0M18 12c-2 3 2 4 0 7M24 10c-2 3 2 4 0 7M30 12c-2 3 2 4 0 7"/>`,
  tasse: `<path d="M8 16h26v14a10 10 0 0 1-10 10h-6A10 10 0 0 1 8 30zM34 20h4a5 5 0 0 1 0 10h-4M6 42h30M17 6c-2 3 2 4 0 7M25 6c-2 3 2 4 0 7"/>`,
  bol: `<path d="M6 24h36a18 12 0 0 1-36 0zM10 20l24-12M14 20l24-14"/>`,
  cuillere: `<path d="M24 22v20M24 22c-6 0-8-6-8-10a8 8 0 0 1 16 0c0 4-2 10-8 10z"/>`,
  toque: `<path d="M14 28v10h20V28M12 28c-6 0-8-8-2-10-2-8 10-10 14-4 6-6 18 0 12 8 4 2 2 6-2 6H12z"/>`,
};

export type PatternPlace = { x: number; y: number; id: string; scale: number; rotate: number; tone: "g" | "o" };

// Disposition espacée sur la tuile : x, y, icône, échelle, rotation, teinte (g = vert, o = orange)
export const PATTERN_PLACES: PatternPlace[] = [
  { x: 30, y: 36, id: "scooter", scale: 1.2, rotate: -6, tone: "g" }, { x: 250, y: 24, id: "piment", scale: 1, rotate: 18, tone: "o" }, { x: 430, y: 44, id: "cloche", scale: 1.1, rotate: 0, tone: "g" }, { x: 576, y: 22, id: "tasse", scale: 0.95, rotate: -10, tone: "g" },
  { x: 110, y: 170, id: "plantain", scale: 1.1, rotate: 8, tone: "o" }, { x: 318, y: 160, id: "epingle", scale: 1, rotate: 0, tone: "g" }, { x: 548, y: 180, id: "poisson", scale: 1.2, rotate: -8, tone: "g" },
  { x: 40, y: 330, id: "marmite", scale: 1.15, rotate: 0, tone: "g" }, { x: 222, y: 300, id: "soya", scale: 1.05, rotate: 0, tone: "o" }, { x: 420, y: 312, id: "gaz", scale: 1, rotate: -5, tone: "g" }, { x: 580, y: 330, id: "cuillere", scale: 0.9, rotate: 25, tone: "g" },
  { x: 130, y: 470, id: "bouteille", scale: 1, rotate: -8, tone: "g" }, { x: 300, y: 460, id: "colis", scale: 1.1, rotate: 0, tone: "g" }, { x: 470, y: 500, id: "assiette", scale: 1.1, rotate: 0, tone: "o" },
  { x: 36, y: 560, id: "casque", scale: 1, rotate: 6, tone: "g" }, { x: 240, y: 580, id: "couverts", scale: 0.95, rotate: 12, tone: "g" }, { x: 400, y: 580, id: "bol", scale: 1, rotate: -6, tone: "g" }, { x: 570, y: 560, id: "toque", scale: 1, rotate: 8, tone: "o" },
];
