"use client"

import { useMemo, useState } from "react";
import { ScooterIcon } from "./brand";
import { formatFcfa } from "@/lib/order-status";

import { FARE, computeFare } from "@/lib/fare";

const PRESETS = [
  { km: 1.2, label: "Même quartier" },
  { km: 3.4, label: "Quartier voisin" },
  { km: 7.5, label: "Autre bout de la ville" },
];

export function FareEstimator() {
  const [km, setKm] = useState(3.4);
  const fare = useMemo(() => computeFare(km), [km]);
  const extraKm = Math.max(0, Math.ceil(km - FARE.franchiseKm));
  const fill = `${((km - 0.5) / (12 - 0.5)) * 100}%`;
  const minutes = Math.round(6 + km * 3.2);

  return (
    <div className="relative rounded-[1.75rem] border bg-card p-5 shadow-[0_30px_80px_-40px_rgba(51,53,78,.45)] sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary">Estimez une course</p>
          <h3 className="font-display text-xl font-bold leading-tight">Du restaurant jusqu’à vous</h3>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
          <span className="relative flex h-2 w-2"><span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-primary" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
          Douala
        </span>
      </div>

      {/* Itinéraire stylisé : restaurant → domicile, scooter animé */}
      <div className="relative h-[200px] overflow-hidden rounded-2xl bg-[linear-gradient(180deg,#f2f7f3,#e7f1ea)] dark:bg-[linear-gradient(180deg,#1b2a22,#162019)]">
        <svg viewBox="0 0 420 200" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(41,160,102,.14)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="420" height="200" fill="url(#grid)" />
          {/* rues */}
          <path d="M0 150 H420 M0 62 H420 M120 0 V200 M300 0 V200" stroke="rgba(51,53,78,.10)" strokeWidth="10" strokeLinecap="round" />
          {/* trajet */}
          <path d="M 44 118 C 100 40, 160 176, 214 96 S 320 30, 376 88" fill="none" stroke="rgba(41,160,102,.25)" strokeWidth="8" strokeLinecap="round" />
          <path className="route-dash" d="M 44 118 C 100 40, 160 176, 214 96 S 320 30, 376 88" fill="none" stroke="#29a066" strokeWidth="3" strokeLinecap="round" />
          {/* restaurant */}
          <g transform="translate(44 118)">
            <circle r="15" fill="#fbb344" />
            <path d="M-8 3 a8 8 0 0 1 16 0 z M-9 5 h18 M0 -6 v1" stroke="#33354e" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
          {/* domicile */}
          <g transform="translate(376 88)">
            <circle r="15" fill="#29a066" />
            <path d="M-7 1 L0 -6 L7 1 M-5 0 v6 h10 v-6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
        <div className="route-rider absolute left-0 top-0 -translate-x-1/2 -translate-y-[62%] text-brand-ink drop-shadow-[0_6px_10px_rgba(51,53,78,.35)] dark:text-white">
          <ScooterIcon className="h-9 w-14" />
        </div>
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-ink shadow-sm backdrop-blur dark:bg-black/40 dark:text-white">Restaurant</div>
        <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-brand-ink shadow-sm backdrop-blur dark:bg-black/40 dark:text-white">Chez vous</div>
      </div>

      {/* Distance */}
      <div className="mt-5">
        <div className="mb-2 flex items-baseline justify-between">
          <label htmlFor="fare-km" className="text-sm font-medium">Distance restaurant → vous</label>
          <span className="font-display text-lg font-bold tabular-nums">{km.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km</span>
        </div>
        <input id="fare-km" type="range" min={0.5} max={12} step={0.1} value={km} onChange={(e) => setKm(Number(e.target.value))} className="fare-range" style={{ "--fill": fill } as React.CSSProperties} aria-valuetext={`${km} kilomètres`} />
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p.km} type="button" onClick={() => setKm(p.km)} className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${Math.abs(p.km - km) < 0.05 ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/60 hover:text-primary"}`}>
              {p.label} · {p.km.toLocaleString("fr-FR")} km
            </button>
          ))}
        </div>
      </div>

      {/* Résultat */}
      <div className="mt-5 grid gap-4 rounded-2xl bg-brand-ink p-4 text-white sm:grid-cols-[1fr_auto] sm:items-end dark:bg-black/40">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[.12em] text-white/60">Frais de livraison</p>
          <p className="whitespace-nowrap font-display text-4xl font-extrabold leading-none tabular-nums">{formatFcfa(fare)}<span className="ml-1 text-base font-semibold text-white/70">CFA</span></p>
          <p className="mt-2 text-xs text-white/70">
            {formatFcfa(FARE.base)} jusqu’à {FARE.franchiseKm} km{extraKm > 0 ? ` + ${extraKm} km × ${formatFcfa(FARE.perKm)}` : " · aucun supplément"}
          </p>
        </div>
        <div className="border-t border-white/15 pt-3 sm:border-0 sm:pt-0 sm:text-right">
          <p className="text-[11px] font-medium uppercase tracking-[.12em] text-white/60">Arrivée estimée</p>
          <p className="font-display text-2xl font-bold tabular-nums">~{minutes} min</p>
          <p className="mt-1 text-[11px] text-white/60">hors préparation</p>
        </div>
      </div>
      <p className="mt-3 text-center text-[11px] text-muted-foreground">Tarif affiché avant chaque commande. Proposée aux 3 livreurs les plus proches, dans un rayon de 8 km.</p>
    </div>
  );
}
