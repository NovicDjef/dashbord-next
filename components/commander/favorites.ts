"use client"

// Plats enregistrés : conservés dans le navigateur, comme l'onglet « Enregistrés » de l'application mobile.
import { useCallback, useEffect, useState } from "react";

export type FavoritePlat = {
  id: number; name: string; image?: string | null; prix: number; description?: string | null;
  restaurant: { id: number; name: string };
  savedAt: string;
};

const KEY = "koursier_favorites";
const EVENT = "koursier:favorites";

const read = (): FavoritePlat[] => {
  try { const raw = localStorage.getItem(KEY); return raw ? (JSON.parse(raw) as FavoritePlat[]) : []; } catch { return []; }
};

export function useFavorites() {
  const [items, setItems] = useState<FavoritePlat[]>([]);

  useEffect(() => {
    setItems(read());
    const sync = () => setItems(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => { window.removeEventListener(EVENT, sync); window.removeEventListener("storage", sync); };
  }, []);

  const write = (next: FavoritePlat[]) => {
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ }
    setItems(next);
    window.dispatchEvent(new Event(EVENT));
  };

  const isFavorite = useCallback((id: number) => items.some((f) => f.id === id), [items]);

  const toggle = useCallback((p: Omit<FavoritePlat, "savedAt">) => {
    const cur = read();
    const exists = cur.some((f) => f.id === p.id);
    write(exists ? cur.filter((f) => f.id !== p.id) : [{ ...p, savedAt: new Date().toISOString() }, ...cur]);
    return !exists;
  }, []);

  const remove = useCallback((id: number) => write(read().filter((f) => f.id !== id)), []);

  return { items, isFavorite, toggle, remove };
}
