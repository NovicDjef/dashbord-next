// Outils géographiques côté client : distance, horaires d'ouverture, temps estimé.
// Miroir de utils/geoFilter.js et utils/openingHours.js du backend.

export type LatLng = { lat: number; lng: number };

/** Douala, centre-ville : position par défaut tant que le client n'a pas indiqué la sienne. */
export const DOUALA: LatLng = { lat: 4.0511, lng: 9.7679 };

const toRad = (d: number) => (d * Math.PI) / 180;

/** Distance Haversine en km. */
export function haversineKm(a: LatLng, b: LatLng) {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const formatKm = (km: number | null | undefined) =>
  km == null || !Number.isFinite(km) ? '—' : `${km < 10 ? km.toFixed(1).replace('.', ',') : Math.round(km)} km`;

/** Temps de trajet moto estimé (~25 km/h en ville) + préparation. */
export const estimateMinutes = (km: number | null | undefined, prepMin = 20) => {
  const ride = Number.isFinite(km as number) ? Math.round(((km as number) / 25) * 60) : 15;
  const total = prepMin + ride;
  return { min: Math.max(10, total - 5), max: total + 10 };
};

/* ---------------- Horaires ---------------- */

const JOURS = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
const normalize = (s: string) => String(s || '').trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const HHMM = /^(\d{1,2})(?:[:h](\d{2})?)?$/;
const RANGE = /^(\d{1,2}(?:[:h]\d{0,2})?)\s*[-–à]\s*(\d{1,2}(?:[:h]\d{0,2})?)$/;

const toMinutes = (hhmm: string) => {
  const m = HHMM.exec(hhmm.trim());
  if (!m) return null;
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  if (h > 24 || min > 59) return null;
  return h * 60 + min;
};

export function parseHeures(heures: string): { open: number; close: number } | null | undefined {
  const raw = String(heures || '').trim();
  if (!raw) return undefined;
  if (/^ferm/i.test(raw)) return null;
  if (/^(24h|24\/24|ouvert)/i.test(raw)) return { open: 0, close: 1440 };
  const m = RANGE.exec(raw);
  if (!m) return undefined;
  const open = toMinutes(m[1]);
  const close = toMinutes(m[2]);
  if (open === null || close === null) return undefined;
  return { open, close };
}

export function getOpeningStatus(horaires: { jour: string; heures: string }[] = [], at = new Date()) {
  if (!Array.isArray(horaires) || horaires.length === 0) return { isOpen: true, known: false, today: null as string | null };
  const dayName = JOURS[at.getDay()];
  const prevName = JOURS[(at.getDay() + 6) % 7];
  const nowMin = at.getHours() * 60 + at.getMinutes();
  const findDay = (name: string) => horaires.find((h) => normalize(h.jour) === normalize(name));
  const today = findDay(dayName);
  const yesterday = findDay(prevName);
  if (yesterday) {
    const y = parseHeures(yesterday.heures);
    if (y && y.close < y.open && nowMin < y.close) return { isOpen: true, known: true, today: today?.heures ?? null };
  }
  if (!today) return { isOpen: true, known: false, today: null };
  const t = parseHeures(today.heures);
  if (t === undefined) return { isOpen: true, known: false, today: today.heures };
  if (t === null) return { isOpen: false, known: true, today: 'Fermé' };
  const isOpen = t.close < t.open ? nowMin >= t.open || nowMin < t.close : nowMin >= t.open && nowMin < t.close;
  return { isOpen, known: true, today: today.heures };
}

/** Ordre d'affichage des jours (lundi en premier). */
export const JOURS_SEMAINE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

/** Libellé court d'une adresse renvoyée par Nominatim. */
export async function reverseGeocode(p: LatLng): Promise<string | null> {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${p.lat}&lon=${p.lng}&accept-language=fr`, { headers: { Accept: 'application/json' } });
    if (!r.ok) return null;
    const j = await r.json();
    const a = j?.address || {};
    const parts = [a.road || a.pedestrian || a.neighbourhood, a.suburb || a.quarter || a.neighbourhood, a.city || a.town || a.village].filter(Boolean);
    const uniq = parts.filter((v, i) => parts.indexOf(v) === i);
    return uniq.length ? uniq.join(', ') : j?.display_name || null;
  } catch {
    return null;
  }
}
