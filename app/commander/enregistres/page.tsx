"use client"

// Plats enregistrés (favoris), conservés dans ce navigateur.
import Link from "next/link";
import { IconHeart, IconHeartFilled, IconToolsKitchen2 } from "@tabler/icons-react";
import { imageUrl } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { useFavorites } from "@/components/commander/favorites";

export default function EnregistresPage() {
  const fav = useFavorites();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Plats enregistrés</h1>
      <p className="mt-1 text-sm text-muted-foreground">Vos envies mises de côté. Touchez un plat pour retrouver son restaurant.</p>

      {fav.items.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border bg-card px-6 py-12 text-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-red"><IconHeart className="h-7 w-7" /></span>
          <p className="mt-4 font-display text-lg font-bold">Rien d’enregistré pour l’instant</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">Touchez le cœur sur un plat pour le garder ici.</p>
          <Link href="/commander" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Parcourir les restaurants</Link>
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {fav.items.map((p) => {
            const img = imageUrl(p.image);
            const href = p.restaurant.id ? `/commander/restaurant/${p.restaurant.id}` : `/commander?q=${encodeURIComponent(p.name)}`;
            return (
              <li key={p.id} className="relative flex gap-3 rounded-[1.25rem] border bg-card p-3">
                <Link href={href} className="flex min-w-0 flex-1 flex-col">
                  <span className="font-display text-[15px] font-bold leading-tight">{p.name}</span>
                  {p.restaurant.name && <span className="mt-0.5 truncate text-xs text-muted-foreground">{p.restaurant.name}</span>}
                  {p.description && <span className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</span>}
                  <span className="mt-auto pt-2 font-display font-bold tabular-nums">{formatFcfa(p.prix)}</span>
                </Link>
                <Link href={href} className="h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted">{img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-muted-foreground"><IconToolsKitchen2 className="h-6 w-6" /></span>}</Link>
                <button type="button" onClick={() => fav.remove(p.id)} className="absolute left-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-card/90 text-brand-red shadow-sm" aria-label={`Retirer ${p.name}`}><IconHeartFilled className="h-4 w-4" /></button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
