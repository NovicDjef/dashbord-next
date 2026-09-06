"use client"

// Suivi temps réel d'une commande (lib/socket.js du backend).
// Le jeton client passe par `auth.token` du handshake ; on rejoint la room
// `commande:<id>` via `commande:subscribe`, puis on écoute `commande:statut`
// et `livreur:position`. Le polling reste le filet de sécurité : si la
// connexion échoue, rien ne casse.
import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';
import { BASE_URL } from '@/services/urlApp';
import { USER_TOKEN_KEY } from '@/lib/client-api';

export type StatutEvent = { commandeId: number; status: string; livreurId?: number | null; updatedAt?: string };
export type PositionEvent = { commandeId: number; livreurId?: number; latitude: number; longitude: number; heading?: number; at?: string };

export function useCommandeSocket(
  commandeId: number | null,
  handlers: { onStatut?: (e: StatutEvent) => void; onPosition?: (e: PositionEvent) => void },
  enabled = true,
) {
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (!enabled || !commandeId || !Number.isFinite(commandeId) || typeof window === 'undefined') return;
    const token = localStorage.getItem(USER_TOKEN_KEY);
    if (!token) return;

    let socket: Socket | null = null;
    try {
      socket = io(BASE_URL, { auth: { token }, transports: ['websocket', 'polling'], reconnectionDelay: 2000 });
    } catch {
      return; // pas de temps réel : le polling suffit
    }

    const onStatut = (e: StatutEvent) => { if (Number(e?.commandeId) === commandeId) ref.current.onStatut?.(e); };
    const onPosition = (e: PositionEvent) => { if (Number(e?.commandeId) === commandeId) ref.current.onPosition?.(e); };

    socket.on('connect', () => socket?.emit('commande:subscribe', { commandeId }));
    socket.on('commande:statut', onStatut);
    socket.on('livreur:position', onPosition);
    // Une erreur de connexion ou d'authentification n'est pas bloquante.
    socket.on('connect_error', () => {});

    return () => {
      socket?.emit('commande:unsubscribe', { commandeId });
      socket?.off('commande:statut', onStatut);
      socket?.off('livreur:position', onPosition);
      socket?.disconnect();
    };
  }, [commandeId, enabled]);
}
