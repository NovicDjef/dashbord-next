"use client"

// Suivi d'un envoi de colis.
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IconArrowLeft, IconCheck, IconPackage, IconPhone } from "@tabler/icons-react";
import { api, apiError, imageUrl, type Colis } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { formatKm } from "@/lib/geo";
import { useClientAuth } from "@/components/commander/providers";
import { AuthForms } from "@/components/commander/auth-dialog";
import { RouteProgress } from "@/components/commander/route-line";
import { usePolling } from "@/hooks/use-polling";

const STEPS: { label: string; detail: string; statuses: Colis["status"][] }[] = [
  { label: "Envoi enregistré", detail: "Les livreurs proches du point de départ sont prévenus.", statuses: ["EN_ATTENTE"] },
  { label: "Livreur en route vers le départ", detail: "Il récupère le colis et vous appelle si besoin.", statuses: ["VALIDER", "ASSIGNEE"] },
  { label: "En livraison", detail: "Le colis est en route vers le destinataire.", statuses: ["EN_COURS"] },
  { label: "Remis au destinataire", detail: "Validé avec votre code.", statuses: ["LIVREE"] },
];
const PROGRESS: Record<Colis["status"], number> = { EN_ATTENTE: 0, VALIDER: 0.15, ASSIGNEE: 0.15, EN_COURS: 0.6, LIVREE: 1, ANNULEE: 0 };
const fmtDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

export default function ColisDetailPage() {
  const { id } = useParams<{ id: string }>();
  const cid = Number(id);
  const auth = useClientAuth();
  const [colis, setColis] = useState<Colis | null>(null);
  const [error, setError] = useState<string | null>(null);

  usePolling(async () => {
    if (!auth.user || !Number.isFinite(cid)) return;
    try { setColis(await api.colis(cid)); setError(null); } catch (e) { setError(apiError(e, "Colis introuvable.")); }
  }, colis?.status === "LIVREE" || colis?.status === "ANNULEE" ? 60000 : 10000, !!auth.user);

  if (auth.ready && !auth.user) {
    return <div className="mx-auto max-w-md"><h1 className="font-display text-2xl font-extrabold text-brand-ink dark:text-foreground">Suivre mon colis</h1><p className="mb-6 mt-1 text-sm text-muted-foreground">Connectez-vous pour voir cet envoi.</p><div className="rounded-[1.5rem] border bg-card p-5"><AuthForms /></div></div>;
  }
  if (error) {
    return <div className="mx-auto max-w-lg rounded-[1.5rem] border bg-card px-6 py-14 text-center"><p className="font-display text-xl font-bold">{error}</p><Link href="/commander/commandes?tab=colis" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><IconArrowLeft className="h-4 w-4" />Mes colis</Link></div>;
  }
  if (!colis) return <div className="mx-auto max-w-3xl space-y-4"><div className="h-8 w-1/3 animate-pulse rounded bg-muted" /><div className="h-40 animate-pulse rounded-[1.5rem] bg-muted" /></div>;

  const cancelled = colis.status === "ANNULEE";
  const current = STEPS.findIndex((s) => s.statuses.includes(colis.status));
  const img = imageUrl(colis.imageColis);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/commander/commandes?tab=colis" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Mes colis</Link>
        <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Colis n°{colis.id}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Enregistré le {fmtDate(colis.createdAt)}</p>
      </div>

      {!cancelled && (
        <section className="rounded-[1.5rem] border bg-card p-5">
          <RouteProgress progress={PROGRESS[colis.status] ?? 0} from={colis.adresseDepart} to={colis.adresseArrivee} />
        </section>
      )}

      {colis.validationCode && colis.status !== "LIVREE" && !cancelled && (
        <section className="rounded-[1.5rem] bg-brand-ink p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Code de remise</p>
          <p className="mt-1 font-display text-4xl font-extrabold tracking-[.3em] tabular-nums">{colis.validationCode}</p>
          <p className="mt-2 text-sm text-white/70">Transmettez ce code au destinataire : le livreur le saisit à la remise.</p>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
        <section className="rounded-[1.5rem] border bg-card p-5">
          <h2 className="mb-4 font-display text-lg font-bold">Étapes</h2>
          {cancelled ? <p className="text-sm text-destructive">Cet envoi a été annulé.</p> : (
            <ol>
              {STEPS.map((s, i) => {
                const done = i < current || colis.status === "LIVREE";
                const active = i === current && colis.status !== "LIVREE";
                return (
                  <li key={s.label} className="relative flex gap-4 pb-6 last:pb-0">
                    {i < STEPS.length - 1 && <span className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${done ? "bg-primary" : "bg-border"}`} aria-hidden="true" />}
                    <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary bg-card text-primary" : "border-border bg-card"}`}>
                      {done ? <IconCheck className="h-4 w-4" /> : active ? <span className="relative flex h-2.5 w-2.5"><span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-primary" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" /></span> : <span className="h-2 w-2 rounded-full bg-border" />}
                    </span>
                    <div className={`pt-1 ${!done && !active ? "opacity-60" : ""}`}><p className={`font-semibold ${active ? "text-primary" : ""}`}>{s.label}</p>{(done || active) && <p className="text-sm text-muted-foreground">{s.detail}</p>}</div>
                  </li>
                );
              })}
            </ol>
          )}
        </section>

        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border bg-card p-5 text-sm">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-cream text-brand-ink">{img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <IconPackage className="h-6 w-6" />}</span>
              <div className="min-w-0"><p className="font-semibold">{colis.description}</p>{colis.poids ? <p className="text-xs text-muted-foreground">~{colis.poids} kg{colis.distance ? ` · ${formatKm(colis.distance)}` : ""}</p> : null}</div>
            </div>
            <dl className="mt-4 space-y-2">
              <div><dt className="text-xs uppercase tracking-[.12em] text-muted-foreground">Expéditeur</dt><dd className="font-medium">{colis.usernameSend}</dd></div>
              <div><dt className="text-xs uppercase tracking-[.12em] text-muted-foreground">Destinataire</dt><dd className="font-medium">{colis.usernamRecive} · <a href={`tel:+237${colis.phoneRecive}`} className="inline-flex items-center gap-1 text-primary"><IconPhone className="h-3.5 w-3.5" />{String(colis.phoneRecive)}</a></dd></div>
            </dl>
            {/* Le serveur calcule un montant unique (poids + distance) et le stocke
                dans `prix` comme dans `deliveryPrice` : ne l'afficher qu'une fois. */}
            <dl className="mt-4 space-y-1.5 border-t pt-3">
              <div className="flex items-baseline justify-between"><dt className="font-semibold">Course</dt><dd className="font-display text-xl font-extrabold tabular-nums">{formatFcfa(colis.deliveryPrice || colis.prix)}</dd></div>
              <p className="text-xs text-muted-foreground">Montant calculé par Koursier, à régler en espèces au livreur.</p>
            </dl>
          </section>
        </aside>
      </div>
    </div>
  );
}
