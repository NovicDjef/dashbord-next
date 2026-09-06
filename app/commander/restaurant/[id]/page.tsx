"use client"

// Page restaurant : en-tête, horaires, menu par catégories, compléments, panier en colonne.
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconArrowLeft, IconClock, IconInfoCircle, IconMapPin, IconPhone, IconStar, IconToolsKitchen2 } from "@tabler/icons-react";
import { api, imageUrl, type Estimation, type PlatNearby, type RestaurantFull } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { estimateMinutes, formatKm, getOpeningStatus, haversineKm, JOURS_SEMAINE } from "@/lib/geo";
import { useLocation } from "@/components/commander/providers";
import { PlatCard, PlatDialog, type PlatLite } from "@/components/commander/plat-dialog";
import { CartPanel } from "@/components/commander/cart-sheet";
import { RouteLine } from "@/components/commander/route-line";

type PlatRow = PlatLite & { categorieId?: number | null; categorie?: { id: number; name: string } };

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const rid = Number(id);
  const loc = useLocation();
  const [resto, setResto] = useState<RestaurantFull | null>(null);
  const [plats, setPlats] = useState<PlatRow[] | null>(null);
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [dialogPlat, setDialogPlat] = useState<PlatLite | null>(null);
  const [activeCat, setActiveCat] = useState<number | null>(null);
  const [showHours, setShowHours] = useState(false);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});

  useEffect(() => {
    if (!Number.isFinite(rid)) { setNotFound(true); return; }
    api.restaurant(rid).then(setResto).catch(() => setNotFound(true));
  }, [rid]);

  // Plats disponibles du restaurant (via /plats/nearby, qui ne renvoie que les plats disponibles),
  // repli sur les plats de chaque catégorie si la recherche par proximité ne renvoie rien.
  useEffect(() => {
    if (!resto || !loc.ready) return;
    let cancelled = false;
    api.platsNearby({ lat: loc.pos.lat, lng: loc.pos.lng, restaurantId: rid, radius: 60, limit: 200 })
      .then(async (r) => {
        let list: PlatRow[] = (r.plats || []).map((p: PlatNearby) => ({ ...p, categorieId: p.categorie?.id }));
        if (list.length === 0 && resto.categories?.length) {
          const all = await Promise.all(resto.categories.map((c) => api.platsByCategorie(c.id).then((ps) => (ps || []).map((p) => ({ ...p, categorieId: c.id, categorie: { id: c.id, name: c.name } }))).catch(() => [])));
          list = all.flat().filter((p) => p.disponible !== false);
        }
        if (!cancelled) setPlats(list);
      })
      .catch(() => { if (!cancelled) setPlats([]); });
    return () => { cancelled = true; };
  }, [resto, rid, loc.ready, loc.pos.lat, loc.pos.lng]);

  useEffect(() => {
    if (!resto) return;
    api.estimation({ restaurantId: rid, clientLatitude: loc.source === "default" ? undefined : loc.pos.lat, clientLongitude: loc.source === "default" ? undefined : loc.pos.lng }).then(setEstimation).catch(() => setEstimation(null));
  }, [resto, rid, loc.pos.lat, loc.pos.lng, loc.source]);

  const opening = useMemo(() => (resto ? getOpeningStatus(resto.heuresOuverture || []) : null), [resto]);
  const isOpen = opening?.isOpen ?? true;
  const distanceKm = resto ? haversineKm(loc.pos, { lat: resto.latitude, lng: resto.longitude }) : null;
  const eta = estimateMinutes(distanceKm, resto?.delaiPreparationMin || 20);

  const groups = useMemo(() => {
    if (!resto || !plats) return [];
    const byCat = new Map<number, PlatRow[]>();
    plats.forEach((p) => { const k = p.categorieId ?? p.categorie?.id ?? -1; byCat.set(k, [...(byCat.get(k) || []), p]); });
    // Menus programmés : une catégorie sans programmation (`programme` faux ou
    // absent) reste au menu en permanence. Sinon `proposeAujourdhui` tranche, et
    // `planning.message` explique quand elle revient.
    const ordered = (resto.categories || []).map((c) => ({
      id: c.id,
      name: c.name,
      plats: byCat.get(c.id) || [],
      horsPlanning: c.programme === true && c.proposeAujourdhui === false,
      planningMessage: c.planning?.message || null,
    })).filter((g) => g.plats.length > 0);
    const orphan = byCat.get(-1);
    if (orphan?.length) ordered.push({ id: -1, name: "Autres plats", plats: orphan, horsPlanning: false, planningMessage: null });
    return ordered;
  }, [resto, plats]);

  useEffect(() => { if (groups.length && activeCat === null) setActiveCat(groups[0].id); }, [groups, activeCat]);

  // Catégorie active suivant le défilement
  useEffect(() => {
    if (!groups.length) return;
    const obs = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActiveCat(Number(visible.target.getAttribute("data-cat")));
    }, { rootMargin: "-140px 0px -60% 0px" });
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [groups]);

  const scrollTo = (cid: number) => {
    const el = sectionRefs.current[cid];
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 130;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  if (notFound) {
    return (
      <div className="rounded-[1.5rem] border bg-card px-6 py-14 text-center">
        <p className="font-display text-xl font-bold">Ce restaurant n’est pas disponible</p>
        <p className="mt-1 text-sm text-muted-foreground">Il a peut-être été retiré ou n’est pas encore validé.</p>
        <Link href="/commander" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><IconArrowLeft className="h-4 w-4" />Retour aux restaurants</Link>
      </div>
    );
  }

  if (!resto) {
    return (
      <div className="space-y-6">
        <div className="aspect-[3/1] animate-pulse rounded-[1.5rem] bg-muted" />
        <div className="h-8 w-1/2 animate-pulse rounded bg-muted" />
        <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[1.25rem] bg-muted" />)}</div>
      </div>
    );
  }

  const img = imageUrl(resto.image);
  const cartResto = { id: resto.id, name: resto.name, image: resto.image, delaiPreparationMin: resto.delaiPreparationMin };

  return (
    <div className="grid gap-8 xl:grid-cols-[1fr_22rem]">
      <div className="min-w-0">
        <Link href="/commander" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Restaurants</Link>

        {/* En-tête */}
        <section className="overflow-hidden rounded-[1.5rem] border bg-card">
          <div className="relative aspect-[3/1] min-h-40 bg-muted">
            {img ? <img src={img} alt="" className={`h-full w-full object-cover ${isOpen ? "" : "grayscale"}`} /> : <div className="flex h-full items-center justify-center text-muted-foreground"><IconToolsKitchen2 className="h-10 w-10" /></div>}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
            <div className="absolute bottom-4 left-5 right-5 flex flex-wrap items-end justify-between gap-2 text-white">
              <h1 className="font-display text-2xl font-extrabold drop-shadow sm:text-3xl">{resto.name}</h1>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isOpen ? "bg-primary text-primary-foreground" : "bg-brand-ink text-white"}`}>{isOpen ? `Ouvert${opening?.today ? ` · ${opening.today}` : ""}` : `Fermé${opening?.today && opening.today !== "Fermé" ? ` · ${opening.today}` : ""}`}</span>
            </div>
          </div>
          <div className="grid gap-4 p-5 sm:grid-cols-[1fr_auto] sm:items-start">
            <div className="min-w-0">
              <p className="text-sm text-muted-foreground">{resto.description}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
                {resto.ratings > 0 && <span className="inline-flex items-center gap-1 font-semibold"><IconStar className="h-4 w-4 fill-brand-orange text-brand-orange" />{resto.ratings.toFixed(1).replace(".", ",")}</span>}
                <span className="inline-flex items-center gap-1 text-muted-foreground"><IconMapPin className="h-4 w-4" />{resto.adresse}</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground"><IconClock className="h-4 w-4" />Préparation ~{resto.delaiPreparationMin} min</span>
                {resto.phone && <a href={`tel:${resto.phone}`} className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary"><IconPhone className="h-4 w-4" />{resto.phone}</a>}
                <button type="button" onClick={() => setShowHours((s) => !s)} className="inline-flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline" aria-expanded={showHours}><IconInfoCircle className="h-4 w-4" />Horaires</button>
              </div>
              {showHours && (
                <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 rounded-xl bg-muted/60 p-3 text-sm sm:grid-cols-4">
                  {JOURS_SEMAINE.map((j) => { const h = (resto.heuresOuverture || []).find((x) => x.jour.toLowerCase() === j.toLowerCase()); return <div key={j} className="flex justify-between gap-2"><dt className="text-muted-foreground">{j.slice(0, 3)}</dt><dd className="font-medium tabular-nums">{h?.heures || "—"}</dd></div>; })}
                </dl>
              )}
            </div>
            <div className="rounded-2xl bg-brand-ink p-4 text-white sm:w-60">
              <RouteLine className="[&_span]:text-white/85 [&>span:nth-child(3)]:border-white/40" left={loc.source === "default" ? "Douala" : formatKm(estimation?.distanceKm ?? distanceKm)} right={`${eta.min}–${eta.max} min`} />
              <p className="mt-3 text-[11px] uppercase tracking-[.12em] text-white/60">Frais de livraison</p>
              <p className="font-display text-2xl font-extrabold tabular-nums">{estimation ? formatFcfa(estimation.fraisLivraison) : "…"}</p>
              <button type="button" onClick={() => loc.setOpen(true)} className="mt-1 text-xs text-brand-yellow underline-offset-4 hover:underline">{loc.source === "default" ? "Indiquer mon adresse pour le prix exact" : `Vers ${loc.label}`}</button>
            </div>
          </div>
        </section>

        {!isOpen && (
          <p className="mt-4 rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-ink dark:text-foreground">Ce restaurant est fermé en ce moment{opening?.today && opening.today !== "Fermé" ? ` (ouvert ${opening.today})` : ""}. Vous pouvez parcourir le menu ; la commande sera possible à la réouverture.</p>
        )}

        {/* Onglets de catégories */}
        {groups.length > 1 && (
          <div className="sticky top-16 z-30 -mx-4 mt-6 border-b bg-background/95 px-4 py-2 backdrop-blur-md sm:-mx-6 sm:px-6 md:top-16">
            <div className="no-scrollbar flex gap-2 overflow-x-auto">
              {groups.map((g) => (
                <button key={g.id} type="button" onClick={() => scrollTo(g.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${activeCat === g.id ? "bg-brand-ink text-white dark:bg-primary dark:text-primary-foreground" : "bg-muted hover:bg-muted/70"} ${g.horsPlanning ? "opacity-60" : ""}`}>{g.name} <span className="ml-1 text-xs opacity-70">{g.horsPlanning ? "pas aujourd’hui" : g.plats.length}</span></button>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="mt-6 space-y-10">
          {plats === null ? (
            <div className="grid gap-3 md:grid-cols-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[1.25rem] bg-muted" />)}</div>
          ) : groups.length === 0 ? (
            <div className="rounded-[1.5rem] border bg-card px-6 py-12 text-center">
              <p className="font-display text-lg font-bold">Le menu arrive bientôt</p>
              <p className="mt-1 text-sm text-muted-foreground">Ce restaurant n’a pas encore de plat disponible à la commande.</p>
            </div>
          ) : groups.map((g) => (
            <section key={g.id} ref={(el) => { sectionRefs.current[g.id] = el; }} data-cat={g.id} aria-labelledby={`cat-${g.id}`}>
              <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
                <h2 id={`cat-${g.id}`} className="font-display text-xl font-bold text-brand-ink dark:text-foreground">{g.name}</h2>
                {g.horsPlanning && <span className="rounded-full bg-brand-ink px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Pas au menu aujourd’hui</span>}
              </div>
              {g.horsPlanning && <p className="mb-3 rounded-2xl bg-brand-cream px-4 py-3 text-sm text-brand-ink dark:text-foreground">{g.planningMessage || "Ce menu n’est pas proposé aujourd’hui."}</p>}
              <div className="grid gap-3 md:grid-cols-2">
                {g.plats.map((p) => <PlatCard key={p.id} plat={p} onOpen={setDialogPlat} restaurant={{ id: resto.id, name: resto.name }} disabled={g.horsPlanning || p.disponible === false} disabledLabel={g.horsPlanning ? "Pas aujourd’hui" : "Indisponible"} />)}
              </div>
            </section>
          ))}
        </div>
      </div>

      <aside className="hidden xl:block">
        <div className="sticky top-24 rounded-[1.5rem] border bg-card p-4">
          <h2 className="mb-3 font-display text-lg font-bold">Votre panier</h2>
          <CartPanel sticky />
        </div>
      </aside>

      <PlatDialog plat={dialogPlat} restaurant={cartResto} complements={resto.complements || []} open={!!dialogPlat} onOpenChange={(o) => !o && setDialogPlat(null)} closed={!isOpen} />
    </div>
  );
}
