"use client"

// Accueil de l'espace client : recherche, adresse, catégories, restaurants proches, plats populaires.
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconArrowRight, IconChevronLeft, IconChevronRight, IconCurrentLocation, IconMapPin, IconMoodEmpty, IconSparkles } from "@tabler/icons-react";
import { api, imageUrl, type Commande, type Complement, type PlatNearby, type RestaurantNearby } from "@/lib/client-api";
import { formatFcfa, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { formatKm, getOpeningStatus } from "@/lib/geo";
import { useClientAuth, useLocation } from "@/components/commander/providers";
import { RestaurantCard, RestaurantCardSkeleton } from "@/components/commander/restaurant-card";
import { PlatCard, PlatDialog, type PlatLite } from "@/components/commander/plat-dialog";
import { TERMINAL } from "@/components/commander/order-timeline";
import { AppBadges } from "@/components/site/brand";

const greeting = () => { const h = new Date().getHours(); return h < 12 ? "Bonjour" : h < 18 ? "Bon après-midi" : "Bonsoir"; };

function Scroller({ children, label }: { children: React.ReactNode; label: string }) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const by = (d: number) => el?.scrollBy({ left: d * (el.clientWidth * 0.8), behavior: "smooth" });
  return (
    <div className="relative">
      <div ref={setEl} className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6" aria-label={label}>{children}</div>
      <div className="pointer-events-none absolute -top-12 right-0 hidden gap-2 md:flex">
        <button type="button" onClick={() => by(-1)} className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card hover:bg-muted" aria-label="Précédent"><IconChevronLeft className="h-4 w-4" /></button>
        <button type="button" onClick={() => by(1)} className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border bg-card hover:bg-muted" aria-label="Suivant"><IconChevronRight className="h-4 w-4" /></button>
      </div>
    </div>
  );
}

function SectionTitle({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-bold text-brand-ink sm:text-2xl dark:text-foreground">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

function HomeInner() {
  const params = useSearchParams();
  const q = (params.get("q") || "").trim();
  const loc = useLocation();
  const auth = useClientAuth();

  const [restaurants, setRestaurants] = useState<RestaurantNearby[] | null>(null);
  const [plats, setPlats] = useState<PlatNearby[] | null>(null);
  const [slides, setSlides] = useState<{ id: number; name: string; image: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [cat, setCat] = useState<string | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [active, setActive] = useState<Commande[]>([]);
  const [dialogPlat, setDialogPlat] = useState<PlatNearby | null>(null);
  const [complementsByResto, setComplementsByResto] = useState<Record<number, Complement[]>>({});

  // Compléments du restaurant du plat ouvert (chargés à la demande, une fois par restaurant)
  useEffect(() => {
    const rid = dialogPlat?.restaurant.id;
    if (!rid || complementsByResto[rid]) return;
    api.restaurant(rid).then((r) => setComplementsByResto((m) => ({ ...m, [rid]: r.complements || [] }))).catch(() => setComplementsByResto((m) => ({ ...m, [rid]: [] })));
  }, [dialogPlat, complementsByResto]);

  useEffect(() => { api.slides().then((s) => setSlides(Array.isArray(s) ? s : [])); }, []);

  useEffect(() => {
    if (!loc.ready) return;
    let cancelled = false;
    setError(null);
    const radius = loc.source === "default" ? 30 : 15;
    Promise.all([
      api.restaurantsNearby({ lat: loc.pos.lat, lng: loc.pos.lng, radius, q, limit: 80 }),
      api.platsNearby({ lat: loc.pos.lat, lng: loc.pos.lng, radius, q, limit: 160 }),
    ]).then(([r, p]) => {
      if (cancelled) return;
      // L'état « ouvert » est recalculé avec l'heure du client (le serveur peut être dans un autre fuseau).
      const restos = (r.restaurants || []).map((x) => ({ ...x, isOpen: getOpeningStatus(x.horaires || []).isOpen }));
      const openById = new Map(restos.map((x) => [x.id, x.isOpen]));
      setRestaurants(restos);
      setPlats((p.plats || []).map((x) => ({ ...x, restaurant: { ...x.restaurant, isOpen: openById.get(x.restaurant.id) ?? x.restaurant.isOpen } })));
    }).catch(() => { if (!cancelled) { setError("Impossible de charger les restaurants. Vérifiez votre connexion puis réessayez."); setRestaurants([]); setPlats([]); } });
    return () => { cancelled = true; };
  }, [loc.ready, loc.pos.lat, loc.pos.lng, loc.source, q]);

  useEffect(() => {
    if (!auth.user) { setActive([]); return; }
    api.mesCommandes(auth.user.id).then((list) => setActive((list || []).filter((c) => !TERMINAL.includes(c.status)).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)))).catch(() => setActive([]));
  }, [auth.user]);

  const categories = useMemo(() => {
    const m = new Map<string, { name: string; image?: string | null; n: number }>();
    (restaurants || []).forEach((r) => (r.categories || []).forEach((c) => { const k = c.name.trim(); if (!k) return; const cur = m.get(k.toLowerCase()); m.set(k.toLowerCase(), { name: k, image: cur?.image || c.image, n: (cur?.n || 0) + 1 }); }));
    return [...m.values()].sort((a, b) => b.n - a.n).slice(0, 14);
  }, [restaurants]);

  const shownRestaurants = useMemo(() => (restaurants || []).filter((r) => (!openOnly || r.isOpen) && (!cat || (r.categories || []).some((c) => c.name.toLowerCase() === cat.toLowerCase()))), [restaurants, openOnly, cat]);
  const shownPlats = useMemo(() => (plats || []).filter((p) => (!openOnly || p.restaurant.isOpen) && (!cat || p.categorie.name.toLowerCase() === cat.toLowerCase())), [plats, openOnly, cat]);
  const popular = useMemo(() => [...shownPlats].sort((a, b) => (b.ratings || 0) - (a.ratings || 0) || a.distanceKm - b.distanceKm).slice(0, 12), [shownPlats]);
  const loading = restaurants === null;

  const restaurantOf = (p: PlatNearby) => ({ id: p.restaurant.id, name: p.restaurant.name, image: p.restaurant.image, delaiPreparationMin: p.restaurant.delaiPreparationMin });

  return (
    <div className="space-y-10">
      {/* En-tête : salutation + adresse */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-brand-ink sm:text-3xl dark:text-foreground">
            {q ? <>Résultats pour « {q} »</> : <>{greeting()}{auth.user ? `, ${auth.user.username.split(" ")[0]}` : ""}. On vous livre quoi ?</>}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {loc.source === "default"
              ? <>Restaurants autour de Douala. <button type="button" onClick={() => loc.setOpen(true)} className="font-semibold text-primary underline-offset-4 hover:underline">Indiquez votre adresse</button> pour voir les plus proches et le prix exact de la livraison.</>
              : <>Livraison à <b className="text-foreground">{loc.label}</b> · <button type="button" onClick={() => loc.setOpen(true)} className="font-semibold text-primary underline-offset-4 hover:underline">modifier</button></>}
          </p>
        </div>
        {loc.source === "default" && (
          <button type="button" onClick={() => loc.locate().then((ok) => !ok && loc.setOpen(true))} disabled={loc.locating} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full bg-brand-ink px-5 text-sm font-semibold text-white hover:bg-brand-ink/90 disabled:opacity-60">
            <IconCurrentLocation className="h-4 w-4 text-brand-yellow" />{loc.locating ? "Localisation…" : "Me localiser"}
          </button>
        )}
      </section>

      {/* Commandes en cours */}
      {active.length > 0 && (
        <section aria-label="Commandes en cours" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {active.slice(0, 3).map((c) => (
            <Link key={c.id} href={`/commander/commandes/${c.id}`} className="flex items-center gap-3 rounded-2xl border border-primary/30 bg-brand-mint/60 p-3 transition-colors hover:border-primary dark:bg-secondary/40">
              <span className="relative flex h-3 w-3 shrink-0"><span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-primary" /><span className="relative inline-flex h-3 w-3 rounded-full bg-primary" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">Commande n°{c.id} · {c.plat?.name || `${c.quantity} article${c.quantity > 1 ? "s" : ""}`}</p>
                <p className="text-xs text-muted-foreground">{ORDER_STATUS_LABEL[c.status]} · suivre en direct</p>
              </div>
              <IconArrowRight className="h-4 w-4 shrink-0 text-primary" />
            </Link>
          ))}
        </section>
      )}

      {/* Catégories */}
      {categories.length > 0 && (
        <section aria-label="Catégories">
          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
            <button type="button" onClick={() => setOpenOnly((o) => !o)} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors ${openOnly ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/60"}`} aria-pressed={openOnly}>
              <span className={`h-2 w-2 rounded-full ${openOnly ? "bg-white" : "bg-primary"}`} />Ouverts maintenant
            </button>
            {categories.map((c) => {
              const on = cat?.toLowerCase() === c.name.toLowerCase();
              const img = imageUrl(c.image);
              return (
                <button key={c.name} type="button" onClick={() => setCat(on ? null : c.name)} className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-full border pl-1.5 pr-4 text-sm font-semibold transition-colors ${on ? "border-primary bg-brand-mint text-primary dark:bg-secondary" : "bg-card hover:border-primary/60"}`} aria-pressed={on}>
                  <span className="h-7 w-7 overflow-hidden rounded-full bg-brand-cream">{img && <img src={img} alt="" className="h-full w-full object-cover" />}</span>{c.name}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {error && <p className="rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</p>}

      {/* Bannières (slides de l'app) */}
      {!q && slides.length > 0 && (
        <section aria-label="À la une">
          <Scroller label="À la une">
            {slides.map((s) => { const img = imageUrl(s.image); return img ? <img key={s.id} src={img} alt={s.name} className="h-40 w-[85%] shrink-0 snap-start rounded-[1.25rem] object-cover sm:h-48 sm:w-[48%] lg:w-[32%]" loading="lazy" /> : null; })}
          </Scroller>
        </section>
      )}

      {/* Plats populaires */}
      {(loading || popular.length > 0) && (
        <section>
          <SectionTitle title={q ? "Plats correspondants" : "Plats populaires autour de vous"} sub={q ? undefined : "Les mieux notés, du plus proche au plus loin"} />
          {loading ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-32 animate-pulse rounded-[1.25rem] bg-muted" />)}</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {popular.map((p) => (
                <div key={p.id} className="relative">
                  <PlatCard plat={p} onOpen={() => setDialogPlat(p)} restaurant={{ id: p.restaurant.id, name: p.restaurant.name }} meta={`${p.restaurant.name} · ${formatKm(p.distanceKm)} · ${formatFcfa(p.fraisLivraison)} livraison`} disabled={!p.restaurant.isOpen} disabledLabel="Restaurant fermé" />
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Restaurants */}
      <section id="restaurants">
        <SectionTitle
          title={q ? "Restaurants correspondants" : cat ? `Restaurants · ${cat}` : "Restaurants près de vous"}
          sub={loading ? undefined : `${shownRestaurants.length} restaurant${shownRestaurants.length > 1 ? "s" : ""} ${openOnly ? "ouvert" + (shownRestaurants.length > 1 ? "s" : "") : ""} triés par distance`}
        />
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}</div>
        ) : shownRestaurants.length === 0 ? (
          <div className="rounded-[1.5rem] border bg-card px-6 py-12 text-center">
            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-cream text-brand-ink"><IconMoodEmpty className="h-7 w-7" /></span>
            <p className="mt-4 font-display text-lg font-bold">{q ? "Rien ne correspond à votre recherche" : "Aucun restaurant dans ce rayon"}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{q ? "Essayez un autre mot, ou parcourez les restaurants proches." : "Koursier livre à Douala. Déplacez votre adresse ou élargissez la recherche."}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {q && <Link href="/commander" className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Tous les restaurants</Link>}
              <button type="button" onClick={() => loc.setOpen(true)} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold"><IconMapPin className="h-4 w-4" />Changer d’adresse</button>
              {(openOnly || cat) && <button type="button" onClick={() => { setOpenOnly(false); setCat(null); }} className="rounded-full border px-5 py-2.5 text-sm font-semibold">Retirer les filtres</button>}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{shownRestaurants.map((r) => <RestaurantCard key={r.id} r={r} />)}</div>
        )}
      </section>

      {/* Colis + app */}
      {!q && (
        <section className="grid gap-4 md:grid-cols-2">
          <Link href="/commander/colis" className="group relative overflow-hidden rounded-[1.5rem] bg-brand-cream p-6 transition-transform hover:-translate-y-0.5 dark:text-foreground">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-ink/70 dark:text-foreground/70">Autre chose à livrer ?</p>
            <h3 className="mt-1 font-display text-2xl font-bold text-brand-ink dark:text-foreground">Envoyer un colis</h3>
            <p className="mt-2 max-w-sm text-sm text-brand-ink/75 dark:text-foreground/75">Un document, un paquet, un oubli : un livreur proche le récupère et le remet contre votre code.</p>
            <span className="mt-4 inline-flex items-center gap-2 font-semibold text-brand-ink dark:text-foreground">Préparer l’envoi <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            <IconSparkles className="pointer-events-none absolute -bottom-6 -right-6 h-32 w-32 rotate-12 text-brand-orange opacity-30" aria-hidden="true" />
          </Link>
          <div className="pattern-on-dark relative overflow-hidden rounded-[1.5rem] bg-brand-ink p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">L’application Koursier</p>
            <h3 className="mt-1 font-display text-2xl font-bold">Notifications à chaque étape</h3>
            <p className="mt-2 max-w-sm text-sm text-white/70">Même compte, mêmes commandes. Recevez une alerte quand le livreur approche.</p>
            <AppBadges app="client" tone="light" className="mt-4" />
          </div>
        </section>
      )}

      <PlatDialog
        plat={dialogPlat as PlatLite | null}
        restaurant={dialogPlat ? restaurantOf(dialogPlat) : null}
        complements={dialogPlat ? complementsByResto[dialogPlat.restaurant.id] || [] : []}
        open={!!dialogPlat}
        onOpenChange={(o) => !o && setDialogPlat(null)}
        closed={dialogPlat ? !dialogPlat.restaurant.isOpen : false}
      />
    </div>
  );
}

export default function CommanderHome() {
  return <Suspense fallback={<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <RestaurantCardSkeleton key={i} />)}</div>}><HomeInner /></Suspense>;
}
