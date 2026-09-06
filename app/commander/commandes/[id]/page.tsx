"use client"

// Suivi d'une commande : trajet, timeline, carte en direct, livreur, code de remise, paiement, annulation, avis, reçu.
import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { IconArrowLeft, IconMapPin, IconPhone, IconPrinter, IconStar, IconStarFilled, IconToolsKitchen2 } from "@tabler/icons-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, apiError, imageUrl, type Commande, type Tracking } from "@/lib/client-api";
import { formatFcfa, ORDER_STATUS_LABEL } from "@/lib/order-status";
import { formatKm } from "@/lib/geo";
import { useClientAuth } from "@/components/commander/providers";
import { AuthForms } from "@/components/commander/auth-dialog";
import { CANCELLABLE, OrderTimeline, StatusBadge, TERMINAL, WITH_LIVREUR, routeProgress } from "@/components/commander/order-timeline";
import { RouteProgress } from "@/components/commander/route-line";
import { LiveMap } from "@/components/commander/live-map";
import { usePolling } from "@/hooks/use-polling";
import { useCommandeSocket } from "@/hooks/use-commande-socket";

const fmtDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });

function Stars({ value, onChange, label }: { value: number; onChange: (v: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} onClick={() => onChange(n)} className={`rounded-md p-0.5 transition-transform hover:scale-110 ${n <= value ? "text-brand-orange" : "text-border"}`} aria-label={`${n} étoile${n > 1 ? "s" : ""}`}>
          {n <= value ? <IconStarFilled className="h-7 w-7" /> : <IconStar className="h-7 w-7" />}
        </button>
      ))}
    </div>
  );
}

function Inner() {
  const { id } = useParams<{ id: string }>();
  const cid = Number(id);
  const params = useSearchParams();
  const isNew = params.get("nouvelle") === "1";
  const auth = useClientAuth();

  const [commande, setCommande] = useState<Commande | null>(null);
  const [tracking, setTracking] = useState<Tracking | null>(null);
  // Le suivi peut échouer sans que la commande soit perdue : on le signale discrètement.
  const [trackingFailed, setTrackingFailed] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [paiement, setPaiement] = useState<{ mode: string; status: string; payee: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [noteR, setNoteR] = useState(0);
  const [noteL, setNoteL] = useState(0);
  const [comment, setComment] = useState("");
  const [avisDone, setAvisDone] = useState(false);
  const [sendingAvis, setSendingAvis] = useState(false);

  const status = commande?.status;
  const terminal = status ? TERMINAL.includes(status) : false;

  const refresh = async () => {
    if (!auth.user || !Number.isFinite(cid)) return;
    try {
      const c = await api.commande(cid);
      setCommande(c);
      setError(null);
      if (WITH_LIVREUR.includes(c.status)) {
        api.tracking(cid)
          .then((t) => { setTracking(t); setTrackingFailed(false); if (t.commande?.validationCode) setCode(t.commande.validationCode); })
          .catch(() => setTrackingFailed(true));
        if (!code) api.validationCode(cid).then((r: unknown) => { const v = (r as { commande?: { validationCode?: string } })?.commande?.validationCode; if (v) setCode(v); }).catch(() => {});
      }
      if (c.status === "LIVREE" && !code) api.validationCode(cid).then((r: unknown) => { const v = (r as { commande?: { validationCode?: string } })?.commande?.validationCode; if (v) setCode(v); }).catch(() => {});
      api.paiementStatut(cid).then(setPaiement).catch(() => {});
    } catch (e) {
      setError((e as { response?: { status?: number } })?.response?.status === 403 ? "Cette commande ne vous appartient pas." : apiError(e, "Commande introuvable."));
    }
  };
  usePolling(refresh, terminal ? 60000 : 8000, !!auth.user);

  // Temps réel : le backend pousse `commande:statut` et `livreur:position` dans
  // la room `commande:<id>`. Le polling ci-dessus reste le repli.
  useCommandeSocket(
    Number.isFinite(cid) ? cid : null,
    {
      onStatut: (e) => {
        setCommande((c) => (c && e.status ? { ...c, status: e.status as typeof c.status } : c));
        refresh();
      },
      onPosition: (e) => {
        setTracking((t) => (t && t.livreur ? { ...t, livreur: { ...t.livreur, position: { latitude: e.latitude, longitude: e.longitude } } } : t));
      },
    },
    !!auth.user && !terminal,
  );

  useEffect(() => {
    if (status === "LIVREE" && auth.user) api.avis(cid).then((a) => { if (a?.restaurant || a?.livreur) { setAvisDone(true); setNoteR(a.restaurant?.overallRating || 0); setNoteL(a.livreur?.overallRating || 0); } }).catch(() => {});
  }, [status, cid, auth.user]);

  const total = (commande?.prix || 0) + (commande?.deliveryPrice || 0);
  // Le suivi est la source la plus fraîche ; à défaut on retombe sur les
  // relations incluses dans GET /commandes/:id.
  const resto = tracking?.restaurant || commande?.restaurant || null;
  const livreur = tracking?.livreur || commande?.livreur || null;
  const restoPos = resto && Number.isFinite(Number(resto.latitude)) ? { lat: Number(resto.latitude), lng: Number(resto.longitude) } : null;
  const clientPos = commande?.clientLatitude != null && commande?.clientLongitude != null ? { lat: Number(commande.clientLatitude), lng: Number(commande.clientLongitude) } : null;
  const livreurPos = useMemo(() => {
    const p = tracking?.livreur?.position;
    return p && Number.isFinite(Number(p.latitude)) ? { lat: Number(p.latitude), lng: Number(p.longitude) } : null;
  }, [tracking]);
  const livreurName = livreur ? [livreur.prenom, livreur.username].filter(Boolean).join(" ") : null;
  const etaMin = tracking?.etaMin ?? null;

  const cancel = async () => {
    setCancelling(true);
    try {
      await api.annuler(cid, cancelReason.trim() || "Annulée par le client");
      toast.success("Commande annulée.");
      setCancelOpen(false);
      refresh();
    } catch (e) {
      const c = (e as { response?: { data?: { code?: string } } })?.response?.data?.code;
      toast.error(c === "TOO_LATE" ? "Trop tard : un livreur a déjà pris la commande en charge." : apiError(e, "Annulation impossible."));
    } finally { setCancelling(false); }
  };

  const sendAvis = async () => {
    if (!noteR && !noteL) { toast.error("Choisissez au moins une note."); return; }
    setSendingAvis(true);
    try {
      await api.noter(cid, { noteRestaurant: noteR || undefined, noteLivreur: noteL || undefined, commentaireRestaurant: comment.trim() || undefined });
      setAvisDone(true);
      toast.success("Merci pour votre avis !");
    } catch (e) { toast.error(apiError(e, "L'avis n'a pas pu être enregistré.")); } finally { setSendingAvis(false); }
  };

  if (auth.ready && !auth.user) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-extrabold text-brand-ink dark:text-foreground">Suivre ma commande</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Connectez-vous pour voir cette commande.</p>
        <div className="rounded-[1.5rem] border bg-card p-5"><AuthForms /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-[1.5rem] border bg-card px-6 py-14 text-center">
        <p className="font-display text-xl font-bold">{error}</p>
        <Link href="/commander/commandes" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><IconArrowLeft className="h-4 w-4" />Mes commandes</Link>
      </div>
    );
  }

  if (!commande) return <div className="mx-auto max-w-4xl space-y-4"><div className="h-8 w-1/3 animate-pulse rounded bg-muted" /><div className="h-40 animate-pulse rounded-[1.5rem] bg-muted" /><div className="h-80 animate-pulse rounded-[1.5rem] bg-muted" /></div>;

  const items = commande.items?.length ? commande.items.map((i) => ({ nom: i.nom || i.plat?.name || "Plat", q: i.quantity, pu: i.prixUnitaire, comp: (i.complements || []).map((c) => `${c.quantity > 1 ? `${c.quantity}× ` : ""}${c.name}`) }))
    : [{ nom: commande.plat?.name || "Plat", q: commande.quantity, pu: commande.plat?.prix || 0, comp: (commande.complements || []).map((c) => `${c.quantity > 1 ? `${c.quantity}× ` : ""}${c.name}`) }];
  const showMap = WITH_LIVREUR.includes(commande.status) || commande.status === "LIVREE";

  return (
    <div className="mx-auto max-w-4xl space-y-6 print:max-w-none">
      <div className="flex flex-wrap items-start justify-between gap-3 print:hidden">
        <div>
          <Link href="/commander/commandes" className="mb-2 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Mes commandes</Link>
          <h1 className="flex flex-wrap items-center gap-3 font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Commande n°{commande.id} <StatusBadge status={commande.status} className="text-sm" /></h1>
          <p className="mt-1 text-sm text-muted-foreground">Passée le {fmtDate(commande.createdAt)}{resto?.name ? ` · ${resto.name}` : ""}</p>
        </div>
        <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold hover:border-primary/60"><IconPrinter className="h-4 w-4" />Reçu</button>
      </div>

      {isNew && !terminal && (
        <div className="rounded-[1.5rem] border border-primary/40 bg-brand-mint/60 p-5 dark:bg-secondary/40 print:hidden">
          <p className="font-display text-lg font-bold text-primary">Commande envoyée au restaurant</p>
          <p className="mt-1 text-sm text-muted-foreground">Cette page se met à jour toute seule. Gardez votre téléphone à portée : le livreur vous appelle à l’arrivée.</p>
        </div>
      )}

      {/* Trajet */}
      {!(commande.status === "ANNULEE" || commande.status === "REFUSEE_RESTAURANT") && (
        <section className="rounded-[1.5rem] border bg-card p-5 print:hidden">
          <RouteProgress progress={routeProgress(commande.status)} from={resto?.name || "Restaurant"} to={commande.position || "Chez vous"} />
          <p className="mt-3 text-sm"><b>{ORDER_STATUS_LABEL[commande.status]}</b>{etaMin ? <span className="text-muted-foreground"> · arrivée estimée dans ~{Math.round(etaMin)} min</span> : commande.distanceKm ? <span className="text-muted-foreground"> · {formatKm(commande.distanceKm)} entre le restaurant et vous</span> : null}</p>
        </section>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-6">
          {/* Carte + livreur */}
          {showMap && (
            <section className="overflow-hidden rounded-[1.5rem] border bg-card print:hidden">
              <LiveMap restaurant={restoPos} client={clientPos} livreur={livreurPos} height={300} />
              {livreur && (
                <div className="flex items-center gap-3 p-4">
                  <span className="inline-flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-brand-mint font-display font-bold text-primary">
                    {imageUrl(livreur.image) ? <img src={imageUrl(livreur.image)!} alt="" className="h-full w-full object-cover" /> : (livreurName?.[0] || "L")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{livreurName || "Votre livreur"}</p>
                    <p className="text-xs text-muted-foreground">{livreurPos ? "Position mise à jour en direct" : "En attente de sa position"}</p>
                  </div>
                  {livreur.telephone && <a href={`tel:${livreur.telephone}`} className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"><IconPhone className="h-4 w-4" />Appeler</a>}
                </div>
              )}
              {trackingFailed && !livreur && (
                <p className="px-4 py-3 text-xs text-muted-foreground">
                  La position en direct n’est pas disponible pour le moment. Les étapes ci-dessous restent à jour.
                </p>
              )}
            </section>
          )}

          {/* Code de remise */}
          {code && commande.status !== "LIVREE" && (
            <section className="rounded-[1.5rem] bg-brand-ink p-5 text-white print:hidden">
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Code de remise</p>
              <p className="mt-1 font-display text-4xl font-extrabold tracking-[.3em] tabular-nums">{code}</p>
              <p className="mt-2 text-sm text-white/70">Donnez ce code au livreur à la réception : il clôture la commande. Ne le communiquez à personne d’autre.</p>
            </section>
          )}

          {/* Timeline */}
          <section className="rounded-[1.5rem] border bg-card p-5 print:hidden">
            <h2 className="mb-4 font-display text-lg font-bold">Étapes</h2>
            <OrderTimeline commande={commande} />
          </section>

          {/* Avis */}
          {commande.status === "LIVREE" && (
            <section className="rounded-[1.5rem] border bg-card p-5 print:hidden">
              <h2 className="font-display text-lg font-bold">{avisDone ? "Votre avis" : "Comment c’était ?"}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{avisDone ? "Merci, votre note aide les autres clients et nos livreurs." : "Notez le restaurant et le livreur. Cela prend dix secondes."}</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div><p className="mb-1 text-sm font-medium">Le restaurant</p><Stars value={noteR} onChange={(v) => !avisDone && setNoteR(v)} label="Note du restaurant" /></div>
                <div><p className="mb-1 text-sm font-medium">Le livreur</p><Stars value={noteL} onChange={(v) => !avisDone && setNoteL(v)} label="Note du livreur" /></div>
              </div>
              {!avisDone && (
                <>
                  <Textarea className="mt-4" rows={2} placeholder="Un mot sur les plats ou la livraison (facultatif)" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} />
                  <Button type="button" onClick={sendAvis} disabled={sendingAvis} className="mt-3 rounded-full font-semibold">{sendingAvis ? "Envoi…" : "Envoyer mon avis"}</Button>
                </>
              )}
            </section>
          )}
        </div>

        {/* Reçu */}
        <aside className="space-y-4">
          <section className="rounded-[1.5rem] border bg-card p-5">
            <div className="hidden print:block">
              <p className="font-display text-xl font-bold">Koursier · Reçu</p>
              <p className="text-sm">Commande n°{commande.id} · {fmtDate(commande.createdAt)}</p>
            </div>
            <h2 className="font-display text-lg font-bold print:hidden">Détail</h2>
            {resto?.name && <p className="mt-0.5 text-sm text-muted-foreground">{resto.name}{resto.adresse ? ` · ${resto.adresse}` : ""}</p>}
            <ul className="mt-3 divide-y text-sm">
              {items.map((it, i) => (
                <li key={i} className="flex justify-between gap-3 py-2">
                  <div className="min-w-0"><p className="font-medium">{it.q}× {it.nom}</p>{it.comp.length > 0 && <p className="truncate text-xs text-muted-foreground">{it.comp.join(", ")}</p>}</div>
                  <span className="shrink-0 tabular-nums">{formatFcfa(it.pu * it.q)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-2 space-y-1.5 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Plats</dt><dd className="tabular-nums">{formatFcfa(commande.prix)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Livraison{commande.distanceKm ? ` · ${formatKm(commande.distanceKm)}` : ""}</dt><dd className="tabular-nums">{formatFcfa(commande.deliveryPrice)}</dd></div>
              <div className="flex items-baseline justify-between border-t pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-2xl font-extrabold tabular-nums">{formatFcfa(total)}</dd></div>
            </dl>
            <div className="mt-4 space-y-2 text-sm">
              <p className="flex items-start gap-2 text-muted-foreground"><IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{commande.position}</p>
              <p className="flex items-start gap-2 text-muted-foreground"><IconPhone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />+237 {commande.telephone}</p>
              {commande.recommandation && <p className="flex items-start gap-2 text-muted-foreground"><IconToolsKitchen2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{commande.recommandation}</p>}
            </div>
            <div className="mt-4 rounded-xl bg-muted/70 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Paiement · </span>
              <b>{paiement?.mode === "MOBILE_MONEY" ? (paiement.payee ? "Mobile Money, payé" : paiement.status === "ECHOUE" ? "Mobile Money, échoué · payez à la livraison" : "Mobile Money, en attente de validation") : "Espèces à la livraison"}</b>
            </div>
            {paiement?.mode === "MOBILE_MONEY" && !paiement.payee && commande.payment?.authorization_url && !terminal && (
              <a href={commande.payment.authorization_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-full bg-brand-orange text-sm font-semibold text-brand-ink print:hidden">Reprendre le paiement</a>
            )}
          </section>

          {CANCELLABLE.includes(commande.status) && (
            <button type="button" onClick={() => setCancelOpen(true)} className="w-full rounded-full border border-destructive/40 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5 print:hidden">Annuler la commande</button>
          )}
          {commande.status === "LIVREE" && (
            <Link href="/commander" className="inline-flex w-full items-center justify-center rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground print:hidden">Commander à nouveau</Link>
          )}
        </aside>
      </div>

      <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Annuler la commande n°{commande.id} ?</AlertDialogTitle>
            <AlertDialogDescription>Possible tant qu’aucun livreur ne l’a prise en charge. Le restaurant en sera informé.</AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea rows={2} placeholder="Raison (facultatif)" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} maxLength={500} />
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Garder la commande</AlertDialogCancel>
            <AlertDialogAction className="rounded-full bg-destructive text-white hover:bg-destructive/90" onClick={(e) => { e.preventDefault(); cancel(); }} disabled={cancelling}>{cancelling ? "Annulation…" : "Annuler la commande"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default function CommandeDetailPage() {
  return <Suspense fallback={<div className="h-40 animate-pulse rounded-[1.5rem] bg-muted" />}><Inner /></Suspense>;
}
