"use client"

// Historique : commandes repas et envois de colis du client connecté.
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { IconChevronRight, IconPackage, IconReceipt, IconToolsKitchen2 } from "@tabler/icons-react";
import { api, imageUrl, type Colis, type Commande } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { useClientAuth } from "@/components/commander/providers";
import { AuthForms } from "@/components/commander/auth-dialog";
import { StatusBadge, TERMINAL } from "@/components/commander/order-timeline";
import { usePolling } from "@/hooks/use-polling";

const COLIS_LABEL: Record<Colis["status"], string> = { EN_ATTENTE: "En attente d’un livreur", VALIDER: "Livreur en route", ASSIGNEE: "Livreur affecté", EN_COURS: "En livraison", LIVREE: "Livré", ANNULEE: "Annulé" };
const COLIS_CLASS: Record<Colis["status"], string> = { EN_ATTENTE: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100", VALIDER: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100", ASSIGNEE: "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-100", EN_COURS: "bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-100", LIVREE: "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100", ANNULEE: "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" };

const fmtDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

function Empty({ icon: Icon, title, text, href, cta }: { icon: React.ElementType; title: string; text: string; href: string; cta: string }) {
  return (
    <div className="rounded-[1.5rem] border bg-card px-6 py-12 text-center">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-mint text-primary"><Icon className="h-7 w-7" /></span>
      <p className="mt-4 font-display text-lg font-bold">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{text}</p>
      <Link href={href} className="mt-5 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{cta}</Link>
    </div>
  );
}

function CommandeRow({ c }: { c: Commande }) {
  const img = imageUrl(c.plat?.image);
  const live = !TERMINAL.includes(c.status);
  return (
    <Link href={`/commander/commandes/${c.id}`} className={`flex items-center gap-4 rounded-[1.25rem] border bg-card p-3 transition-colors hover:border-primary/50 ${live ? "border-primary/30" : ""}`}>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">{img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-muted-foreground"><IconToolsKitchen2 className="h-6 w-6" /></div>}</div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display font-bold">Commande n°{c.id}</p>
          <StatusBadge status={c.status} />
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.items?.length ? c.items.map((i) => `${i.quantity}× ${i.nom}`).join(", ") : c.plat ? `${c.quantity}× ${c.plat.name}` : `${c.quantity} article${c.quantity > 1 ? "s" : ""}`}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{fmtDate(c.createdAt)} · {c.position}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display font-bold tabular-nums">{formatFcfa((c.prix || 0) + (c.deliveryPrice || 0))}</p>
        <IconChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function ColisRow({ c }: { c: Colis }) {
  return (
    <Link href={`/commander/colis/${c.id}`} className="flex items-center gap-4 rounded-[1.25rem] border bg-card p-3 transition-colors hover:border-primary/50">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-ink"><IconPackage className="h-6 w-6" /></div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display font-bold">Colis n°{c.id}</p>
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${COLIS_CLASS[c.status] || "bg-muted"}`}>{COLIS_LABEL[c.status] || c.status}</span>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">{c.description} · pour {c.usernamRecive}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{fmtDate(c.createdAt)} · {c.adresseDepart} → {c.adresseArrivee}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-display font-bold tabular-nums">{formatFcfa((c.prix || 0) + (c.deliveryPrice || 0))}</p>
        <IconChevronRight className="ml-auto mt-1 h-4 w-4 text-muted-foreground" />
      </div>
    </Link>
  );
}

function Inner() {
  const auth = useClientAuth();
  const params = useSearchParams();
  const [tab, setTab] = useState<"repas" | "colis">(params.get("tab") === "colis" ? "colis" : "repas");
  const [commandes, setCommandes] = useState<Commande[] | null>(null);
  const [colis, setColis] = useState<Colis[] | null>(null);

  const load = async () => {
    if (!auth.user) return;
    const [a, b] = await Promise.allSettled([api.mesCommandes(auth.user.id), api.mesColis(auth.user.id)]);
    setCommandes(a.status === "fulfilled" ? [...(a.value || [])].sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)) : []);
    setColis(b.status === "fulfilled" ? [...(b.value || [])].sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)) : []);
  };
  usePolling(load, 20000, !!auth.user);
  useEffect(() => { if (!auth.user) { setCommandes(null); setColis(null); } }, [auth.user]);

  if (auth.ready && !auth.user) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-extrabold text-brand-ink dark:text-foreground">Vos commandes</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Connectez-vous pour retrouver vos commandes, en cours et passées, y compris celles faites depuis l’application.</p>
        <div className="rounded-[1.5rem] border bg-card p-5"><AuthForms /></div>
      </div>
    );
  }

  const live = (commandes || []).filter((c) => !TERMINAL.includes(c.status));
  const past = (commandes || []).filter((c) => TERMINAL.includes(c.status));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Vos commandes</h1>
          <p className="mt-1 text-sm text-muted-foreground">Actualisées automatiquement. Touchez une commande pour la suivre, ou consultez <Link href="/commander/historique" className="font-semibold text-primary underline-offset-4 hover:underline">toute votre activité</Link>.</p>
        </div>
        <div className="grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold" role="tablist">
          {(["repas", "colis"] as const).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-2 transition-colors ${tab === t ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{t === "repas" ? `Repas${commandes ? ` · ${commandes.length}` : ""}` : `Colis${colis ? ` · ${colis.length}` : ""}`}</button>
          ))}
        </div>
      </div>

      {tab === "repas" && (
        commandes === null ? <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-[1.25rem] bg-muted" />)}</div>
        : commandes.length === 0 ? <Empty icon={IconReceipt} title="Aucune commande pour l’instant" text="Votre première commande apparaîtra ici avec son suivi en direct." href="/commander" cta="Voir les restaurants" />
        : (
          <>
            {live.length > 0 && <section><h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-primary">En cours</h2><div className="space-y-3">{live.map((c) => <CommandeRow key={c.id} c={c} />)}</div></section>}
            {past.length > 0 && <section><h2 className="mb-2 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Passées</h2><div className="space-y-3">{past.map((c) => <CommandeRow key={c.id} c={c} />)}</div></section>}
          </>
        )
      )}

      {tab === "colis" && (
        colis === null ? <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 animate-pulse rounded-[1.25rem] bg-muted" />)}</div>
        : colis.length === 0 ? <Empty icon={IconPackage} title="Aucun colis envoyé" text="Un document, un paquet : un livreur proche le récupère et le remet contre votre code." href="/commander/colis" cta="Envoyer un colis" />
        : <div className="space-y-3">{colis.map((c) => <ColisRow key={c.id} c={c} />)}</div>
      )}
    </div>
  );
}

export default function CommandesPage() {
  return <Suspense fallback={<div className="h-24 animate-pulse rounded-[1.25rem] bg-muted" />}><Inner /></Suspense>;
}
