"use client"

// Contextes de l'espace « Commander » : position de livraison, panier, compte client.
// Tout est persisté dans localStorage, comme l'application mobile le fait avec AsyncStorage.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, USER_DATA_KEY, USER_TOKEN_KEY, type ClientUser } from "@/lib/client-api";
import { DOUALA, reverseGeocode, type LatLng } from "@/lib/geo";

/* ------------------------------------------------------------------ */
/* Position de livraison                                               */
/* ------------------------------------------------------------------ */

type LocationSource = "default" | "gps" | "manual";
type LocationState = { pos: LatLng; label: string; source: LocationSource };
type LocationCtx = LocationState & {
  ready: boolean;
  locating: boolean;
  setManual: (pos: LatLng, label: string) => void;
  locate: () => Promise<boolean>;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const LOCATION_KEY = "koursier_location";
const LocationContext = createContext<LocationCtx | null>(null);

function LocationProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<LocationState>({ pos: DOUALA, label: "Douala", source: "default" });
  const [ready, setReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCATION_KEY);
      if (raw) {
        const s = JSON.parse(raw) as LocationState;
        if (s?.pos && Number.isFinite(s.pos.lat) && Number.isFinite(s.pos.lng)) setState(s);
      }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  const persist = (s: LocationState) => {
    setState(s);
    try { localStorage.setItem(LOCATION_KEY, JSON.stringify(s)); } catch { /* ignore */ }
  };

  const setManual = useCallback((pos: LatLng, label: string) => persist({ pos, label: label || "Position choisie sur la carte", source: "manual" }), []);

  const locate = useCallback(() => new Promise<boolean>((resolve) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return resolve(false);
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const pos = { lat: p.coords.latitude, lng: p.coords.longitude };
        const label = (await reverseGeocode(pos)) || "Ma position actuelle";
        persist({ pos, label, source: "gps" });
        setLocating(false);
        resolve(true);
      },
      () => { setLocating(false); resolve(false); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  }), []);

  const value = useMemo(() => ({ ...state, ready, locating, setManual, locate, open, setOpen }), [state, ready, locating, setManual, locate, open]);
  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
}

export const useLocation = () => {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocation hors de CommanderProviders");
  return ctx;
};

/* ------------------------------------------------------------------ */
/* Panier (un seul restaurant à la fois, règle du backend)             */
/* ------------------------------------------------------------------ */

export type CartComplement = { id: number; name: string; price: number; quantity: number };
export type CartItem = {
  key: string; platsId: number; name: string; image?: string | null; prix: number; quantity: number; complements: CartComplement[];
};
export type CartRestaurant = { id: number; name: string; image?: string | null; delaiPreparationMin?: number };
export type AddToCartInput = {
  plat: { id: number; name: string; image?: string | null; prix: number };
  quantity: number;
  complements: CartComplement[];
  restaurant: CartRestaurant;
};

type CartState = { restaurant: CartRestaurant | null; items: CartItem[] };
type CartCtx = CartState & {
  count: number;
  subtotal: number;
  itemTotal: (it: CartItem) => number;
  add: (input: AddToCartInput) => "ADDED" | "CONFLICT";
  replaceWith: (input: AddToCartInput) => void;
  updateQty: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
};

const CART_KEY = "koursier_cart";
const CartContext = createContext<CartCtx | null>(null);

const complementsKey = (c: CartComplement[]) => c.filter((x) => x.quantity > 0).map((x) => `${x.id}x${x.quantity}`).sort().join("|");
const lineTotal = (it: CartItem) => (it.prix + it.complements.reduce((s, c) => s + c.price * c.quantity, 0)) * it.quantity;

function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<CartState>({ restaurant: null, items: [] });
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      if (raw) {
        const s = JSON.parse(raw) as CartState;
        if (Array.isArray(s?.items)) setState({ restaurant: s.restaurant || null, items: s.items });
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(CART_KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state, loaded]);

  const buildItem = (input: AddToCartInput): CartItem => {
    const complements = input.complements.filter((c) => c.quantity > 0);
    return {
      key: `${input.plat.id}:${complementsKey(complements)}`,
      platsId: input.plat.id, name: input.plat.name, image: input.plat.image, prix: Number(input.plat.prix) || 0,
      quantity: Math.max(1, input.quantity), complements,
    };
  };

  const mergeItem = (items: CartItem[], item: CartItem) => {
    const idx = items.findIndex((i) => i.key === item.key);
    if (idx === -1) return [...items, item];
    const next = [...items];
    next[idx] = { ...next[idx], quantity: Math.min(50, next[idx].quantity + item.quantity) };
    return next;
  };

  const replaceWith = useCallback((input: AddToCartInput) => {
    setState({ restaurant: input.restaurant, items: [buildItem(input)] });
  }, []);

  const add = useCallback((input: AddToCartInput): "ADDED" | "CONFLICT" => {
    if (state.restaurant && state.items.length > 0 && state.restaurant.id !== input.restaurant.id) return "CONFLICT";
    setState((s) => ({ restaurant: input.restaurant, items: mergeItem(s.items, buildItem(input)) }));
    return "ADDED";
  }, [state.restaurant, state.items.length]);

  const updateQty = useCallback((key: string, quantity: number) => {
    setState((s) => {
      const items = quantity <= 0 ? s.items.filter((i) => i.key !== key) : s.items.map((i) => (i.key === key ? { ...i, quantity: Math.min(50, quantity) } : i));
      return { restaurant: items.length ? s.restaurant : null, items };
    });
  }, []);

  const remove = useCallback((key: string) => updateQty(key, 0), [updateQty]);
  const clear = useCallback(() => setState({ restaurant: null, items: [] }), []);

  const count = state.items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = state.items.reduce((s, i) => s + lineTotal(i), 0);

  const value = useMemo(() => ({ ...state, count, subtotal, itemTotal: lineTotal, add, replaceWith, updateQty, remove, clear, open, setOpen }), [state, count, subtotal, add, replaceWith, updateQty, remove, clear, open]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart hors de CommanderProviders");
  return ctx;
};

/* ------------------------------------------------------------------ */
/* Compte client (téléphone + mot de passe, comme l'app mobile)        */
/* ------------------------------------------------------------------ */

type AuthCtx = {
  user: ClientUser | null;
  token: string | null;
  ready: boolean;
  login: (phone: string, password: string) => Promise<ClientUser>;
  signup: (username: string, phone: string, password: string) => Promise<ClientUser>;
  logout: () => void;
  authOpen: boolean;
  setAuthOpen: (o: boolean) => void;
  /** Ouvre la fenêtre de connexion si besoin ; renvoie true si le client est déjà connecté. */
  requireAuth: () => boolean;
};

const AuthContext = createContext<AuthCtx | null>(null);

function ClientAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    try {
      const t = localStorage.getItem(USER_TOKEN_KEY);
      const u = localStorage.getItem(USER_DATA_KEY);
      if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    } catch { /* ignore */ }
    setReady(true);
  }, []);

  // Vérifie le jeton au démarrage ; s'il est expiré, on déconnecte sans bruit.
  useEffect(() => {
    if (!ready || !token) return;
    api.verify().then((r) => { if (r?.user) { setUser((u) => ({ ...(u || {} as ClientUser), ...r.user })); } }).catch((e) => {
      if (e?.response?.status === 401) { localStorage.removeItem(USER_TOKEN_KEY); localStorage.removeItem(USER_DATA_KEY); setUser(null); setToken(null); }
    });
  }, [ready, token]);

  const save = (u: ClientUser, t: string) => {
    localStorage.setItem(USER_TOKEN_KEY, t);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(u));
    setUser(u); setToken(t);
  };

  const login = useCallback(async (phone: string, password: string) => {
    const r = await api.login(phone.trim(), password);
    save(r.user, r.token);
    return r.user;
  }, []);

  const signup = useCallback(async (username: string, phone: string, password: string) => {
    const r = await api.signup(username.trim(), phone.trim(), password);
    save(r.user, r.token);
    return r.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_TOKEN_KEY);
    localStorage.removeItem(USER_DATA_KEY);
    setUser(null); setToken(null);
  }, []);

  const requireAuth = useCallback(() => {
    if (user && token) return true;
    setAuthOpen(true);
    return false;
  }, [user, token]);

  const value = useMemo(() => ({ user, token, ready, login, signup, logout, authOpen, setAuthOpen, requireAuth }), [user, token, ready, login, signup, logout, authOpen, requireAuth]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useClientAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useClientAuth hors de CommanderProviders");
  return ctx;
};

/* ------------------------------------------------------------------ */

export function CommanderProviders({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthProvider>
      <LocationProvider>
        <CartProvider>{children}</CartProvider>
      </LocationProvider>
    </ClientAuthProvider>
  );
}
