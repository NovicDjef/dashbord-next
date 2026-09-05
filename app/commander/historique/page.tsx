"use client"

// Activité du compte : chaque événement de chaque commande et de chaque colis, du plus récent au plus ancien,
// avec un résumé (dépenses, commandes livrées, restaurant favori). Même données que l'application mobile.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconCash, IconCheck, IconChefHat, IconMotorbike, IconPackage, IconReceipt, IconStar, IconX } from "@tabler/icons-react";
import { api, type Colis, type Commande } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { useClientAuth } from "@/components/commander/providers";
import { AuthForms } from "@/components/commander/auth-dialog";

type Ev = { at: string; kind: "repas" | "colis"; id: number; label: string; detail?: string; href: string; icon: React.ElementType; tone: string; amount?: number };

const dayKey = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function eventsFromCommande(c: Commande, restoName: string): Ev[] {
  const href = `/commander/commandes/${c.id}`;
  const what = c.items?.length ? c.items.map((i) => `${i.quantity}× ${i.nom}`).join(", ") : c.plat ? `${c.quantity}× ${c.plat.name}` : `${c.quantity} article${c.quantity > 1 ? "s" : ""}`;
  const base = { kind: "repas" as const, id: c.id, href };
  const evs: Ev[] = [{ ...base, at: c.createdAt, label: `Commande n°${c.id} envoyée${restoName ? ` à ${restoName}` : ""}`, detail: what, icon: IconReceipt, tone: "bg-brand-mint text-primary", amount: (c.prix || 0) + (c.deliveryPrice || 0) }];
  if (c.acceptedAt) evs.push({ ...base, at: c.acceptedAt, label: "Acceptée par le restaurant", icon: IconChefHat, tone: "bg-brand-cream text-brand-ink" });
  if (c.readyAt) evs.push({ ...base, at: c.readyAt, label: "Commande prête", icon: IconChefHat, tone: "bg-brand-cream text-brand-ink" });
  if (c.assignedAt) evs.push({ ...base, at: c.assignedAt, label: "Livreur en route", icon: IconMotorbike, tone: "bg-brand-mint text-primary" });
  if (c.pickedUpAt) evs.push({ ...base, at: c.pickedUpAt, label: "Récupérée au restaurant", icon: IconMotorbike, tone: "bg-brand-mint text-primary" });
  if (c.deliveredAt) evs.push({ ...base, at: c.deliveredAt, label: "Livrée", detail: c.payment?.mode_payement === "MOBILE_MONEY" ? "Payée en Mobile Money" : "Payée en espèces", icon: IconCheck, tone: "bg-primary text-primary-foreground" });
  if (c.cancelledAt || c.status === "ANNULEE" || c.status === "REFUSEE_RESTAURANT") evs.push({ ...base, at: c.cancelledAt || c.updatedAt, label: c.status === "REFUSEE_RESTAURANT" ? "Refusée par le restaurant" : "Annulée", detail: c.cancelReason || undefined, icon: IconX, tone: "bg-destructive/10 text-destructive" });
  if (c.payment?.status === "COMPLETE" && c.payment.mode_payement === "MOBILE_MONEY") evs.push({ ...base, at: c.updatedAt, label: "Paiement Mobile Money confirmé", detail: `Réf. ${c.payment.reference}`, icon: IconCash, tone: "bg-brand-yellow/40 text-brand-ink", amount: c.payment.amount });
  return evs;
}

function eventsFromColis(c: Colis): Ev[] {
  const href = `/commander/colis/${c.id}`;
  const base = { kind: "colis" as const, id: c.id, href };
  const evs: Ev[] = [{ ...base, at: c.createdAt, label: `Colis n°${c.id} enregistré`, detail: `${c.description} · pour ${c.usernamRecive}`, icon: IconPackage, tone: "bg-brand-cream text-brand-ink", amount: (c.prix || 0) + (c.deliveryPrice || 0) }];
  if (c.status === "LIVREE") evs.push({ ...base, at: (c as Colis & { updatedAt?: string }).updatedAt || c.createdAt, label: "Colis remis au destinataire", icon: IconCheck, tone: "bg-primary text-primary-foreground" });
  if (c.status === "ANNULEE") evs.push({ ...base, at: (c as Colis & { updatedAt?: string }).updatedAt || c.createdAt, label: "Envoi annulé", icon: IconX, tone: "bg-destructive/10 text-destructive" });
  return evs;
}

export default function HistoriquePage() {
  const auth = useClientAuth();
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [colis, setColis] = useState<Colis[] | null>(null);
  const [restoNames, setRestoNames] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState<"tout" | "repas" | "colis">("tout");

  useEffect(() => {
    if (!auth.user) return;
    const uid = auth.user.id;
    api.mesCommandes(uid).then(setCommandes).catch(() => setCommandes([]));
    api.mesColis(uid).then(setColis).catch(() => setColis([]));
    api.restaurantsNearby({ lat: 4.0511, lng: 9.7679, radius: 60, limit: 100 }).then((r) => setRestoNames(Object.fromEntries((r.restaurants || []).map((x) => [x.id, x.name])))).catch(() => {});
  }, [auth.user]);

  const events = useMemo(() => {
    const all = [
      ...(commandes || []).flatMap((c) => eventsFromCommande(c, c.restaurantId ? restoNames[c.restaurantId] || "" : "")),
      ...(colis || []).flatMap(eventsFromColis),
    ].filter((e) => filter === "tout" || e.kind === filter).sort((a, b) => +new Date(b.at) - +new Date(a.at));
    const groups = new Map<string, Ev[]>();
    all.forEach((e) => { const k = dayKey(e.at); groups.set(k, [...(groups.get(k) || []), e]); });
    return [...groups.entries()];
  }, [commandes, colis, restoNames, filter]);

  const stats = useMemo(() => {
    const cs = commandes || [];
    const livrees = cs.filter((c) => c.status === "LIVREE");
    const depenses = livrees.reduce((s, c) => s + (c.prix || 0) + (c.deliveryPrice || 0), 0) + (colis || []).filter((c) => c.status === "LIVREE").reduce((s, c) => s + (c.prix || 0) + (c.deliveryPrice || 0), 0);
    const count = new Map<number, number>();
    cs.forEach((c) => { if (c.restaurantId) count.set(c.restaurantId, (count.get(c.restaurantId) || 0) + 1); });
    const fav = [...count.entries()].sort((a, b) => b[1] - a[1])[0];
    return { commandes: cs.length, livrees: livrees.length, colis: (colis || []).length, depenses, fav: fav ? { id: fav[0], name: restoNames[fav[0]] || `Restaurant n°${fav[0]}`, n: fav[1] } : null };
  }, [commandes, colis, restoNames]);

  if (auth.ready && !auth.user) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-extrabold text-brand-ink dark:text-foreground">Votre activité</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Connectez-vous pour retrouver l’historique complet de vos commandes et envois, y compris ceux faits depuis l’application.</p>
        <div className="rounded-[1.5rem] border bg-card p-5"><AuthForms /></div>
      </div>
    );
  }

  const loading = commandes === null || colis === null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/commander/compte" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Mon compte</Link>
        <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Votre activité</h1>
        <p className="mt-1 text-sm text-muted-foreground">Chaque étape de chaque commande et de chaque colis, depuis le site ou l’application.</p>
      </div>

      {/* Résumé */}
      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Dépensé (livré)</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{loading ? "…" : formatFcfa(stats.depenses)}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Commandes · colis</p>
          <p className="mt-1 font-display text-2xl font-extrabold tabular-nums">{loading ? "…" : `${stats.commandes} · ${stats.colis}`}</p>
          {!loading && <p className="text-xs text-muted-foreground">{stats.livrees} livrée{stats.livrees > 1 ? "s" : ""}</p>}
        </div>
        <div className="rounded-2xl bg-brand-ink p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Restaurant favori</p>
          {stats.fav ? (
            <Link href={`/commander/restaurant/${stats.fav.id}`} className="mt-1 block truncate font-display text-lg font-bold underline-offset-4 hover:underline">{stats.fav.name}</Link>
          ) : <p className="mt-1 font-display text-lg font-bold">—</p>}
          {stats.fav && <p className="inline-flex items-center gap-1 text-xs text-white/70"><IconStar className="h-3 w-3 text-brand-orange" />{stats.fav.n} commande{stats.fav.n > 1 ? "s" : ""}</p>}
        </div>
      </section>

      {/* Filtre */}
      <div className="grid w-fit grid-cols-3 rounded-full bg-muted p-1 text-sm font-semibold" role="tablist">
        {(["tout", "repas", "colis"] as const).map((f) => (
          <button key={f} type="button" role="tab" aria-selected={filter === f} onClick={() => setFilter(f)} className={`rounded-full px-4 py-2 capitalize transition-colors ${filter === f ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
        ))}
      </div>

      {/* Chronologie */}
      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />)}</div>
      ) : events.length === 0 ? (
        <div className="rounded-[1.5rem] border bg-card px-6 py-12 text-center">
          <p className="font-display text-lg font-bold">Aucune activité pour l’instant</p>
          <p className="mt-1 text-sm text-muted-foreground">Votre première commande apparaîtra ici, étape par étape.</p>
          <Link href="/commander" className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Voir les restaurants</Link>
        </div>
      ) : (
        <div className="space-y-8">
          {events.map(([day, evs]) => (
            <section key={day}>
              <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground first-letter:uppercase">{day}</h2>
              <ol className="relative space-y-2 before:absolute before:bottom-4 before:left-[19px] before:top-4 before:w-px before:bg-border">
                {evs.map((e, i) => (
                  <li key={`${e.kind}-${e.id}-${e.at}-${i}`}>
                    <Link href={e.href} className="relative flex items-start gap-3 rounded-2xl border bg-card p-3 transition-colors hover:border-primary/50">
                      <span className={`relative z-10 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${e.tone}`}><e.icon className="h-4 w-4" /></span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold leading-tight">{e.label}</span>
                        {e.detail && <span className="block truncate text-xs text-muted-foreground">{e.detail}</span>}
                      </span>
                      <span className="shrink-0 text-right">
                        {e.amount != null && <span className="block font-display text-sm font-bold tabular-nums">{formatFcfa(e.amount)}</span>}
                        <span className="block text-xs text-muted-foreground tabular-nums">{time(e.at)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
