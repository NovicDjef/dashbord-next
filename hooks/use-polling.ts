"use client"
import { useEffect, useRef } from 'react';

/** Appelle `fn` immédiatement puis toutes les `intervalMs` tant que l'onglet est visible. */
export function usePolling(fn: () => void | Promise<void>, intervalMs: number, enabled = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setInterval> | null = null;
    // Premier appel inconditionnel (un onglet peut être signalé « hidden » au montage), puis seulement si l'onglet est visible
    void ref.current();
    const tick = () => { if (document.visibilityState === 'visible') void ref.current(); };
    timer = setInterval(tick, intervalMs);
    const onVisible = () => { if (document.visibilityState === 'visible') void ref.current(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => { if (timer) clearInterval(timer); document.removeEventListener('visibilitychange', onVisible); };
  }, [intervalMs, enabled]);
}
