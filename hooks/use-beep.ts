"use client"
import { useCallback, useRef } from 'react';

/** Signal sonore court (Web Audio, aucun fichier requis) pour signaler une nouvelle commande. */
export function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback((times = 2) => {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      if (!ctxRef.current) ctxRef.current = new Ctx();
      const ctx = ctxRef.current!;
      if (ctx.state === 'suspended') void ctx.resume();
      for (let i = 0; i < times; i++) {
        const t = ctx.currentTime + i * 0.35;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, t);
        osc.frequency.setValueAtTime(1175, t + 0.12);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.32);
      }
    } catch { /* silencieux */ }
  }, []);
}
