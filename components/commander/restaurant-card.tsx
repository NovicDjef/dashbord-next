"use client"

import Link from "next/link";
import { IconClock, IconStar, IconToolsKitchen2 } from "@tabler/icons-react";
import { imageUrl, type RestaurantNearby } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { estimateMinutes, formatKm } from "@/lib/geo";
import { RouteLine } from "./route-line";

export function RestaurantCard({ r, compact = false }: { r: RestaurantNearby; compact?: boolean }) {
  const img = imageUrl(r.image);
  const eta = estimateMinutes(r.distanceKm, r.delaiPreparationMin);
  const cats = (r.categories || []).map((c) => c.name).filter(Boolean).slice(0, 3);
  return (
    <Link href={`/commander/restaurant/${r.id}`} className={`group flex flex-col overflow-hidden rounded-[1.25rem] border bg-card transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(51,53,78,.45)] focus-visible:outline-2 ${compact ? "w-64 shrink-0" : ""}`}>
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {img ? (
          <img src={img} alt="" className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] ${r.isOpen ? "" : "grayscale"}`} loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground"><IconToolsKitchen2 className="h-8 w-8" /></div>
        )}
        <div className="absolute left-3 top-3 flex gap-1.5">
          {r.isOpen ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-primary-foreground">Ouvert</span>
          ) : (
            <span className="rounded-full bg-brand-ink/85 px-2 py-0.5 text-[11px] font-semibold text-white">Fermé{r.horairesAujourdhui && r.horairesAujourdhui !== "Fermé" ? ` · ${r.horairesAujourdhui}` : ""}</span>
          )}
        </div>
        <span className="absolute bottom-3 right-3 rounded-full bg-white/95 px-2.5 py-1 font-display text-xs font-bold text-brand-ink shadow-sm backdrop-blur">
          {formatFcfa(r.fraisLivraison)} livraison
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-bold leading-tight">{r.name}</h3>
          {r.ratings > 0 && <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold"><IconStar className="h-3.5 w-3.5 fill-brand-orange text-brand-orange" />{r.ratings.toFixed(1).replace(".", ",")}</span>}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{cats.length ? cats.join(" · ") : r.adresse}</p>
        <RouteLine className="mt-3" left={formatKm(r.distanceKm)} right={`${eta.min}–${eta.max} min`} />
        {!compact && (
          <p className="mt-2 inline-flex items-center gap-1 text-[11px] text-muted-foreground"><IconClock className="h-3 w-3" />Préparation ~{r.delaiPreparationMin} min · {r.adresse}</p>
        )}
      </div>
    </Link>
  );
}

export function RestaurantCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[1.25rem] border bg-card">
      <div className="aspect-[16/10] animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}
