"use client"

// Finalisation : adresse, téléphone, instructions, paiement, récapitulatif, création de la commande.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconArrowLeft, IconCash, IconCheck, IconDeviceMobile, IconMapPin, IconPencil, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, apiError, type Estimation } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { estimateMinutes, formatKm } from "@/lib/geo";
import { useCart, useClientAuth, useLocation } from "@/components/commander/providers";
import { AuthForms, cleanPhone, isValidPhone } from "@/components/commander/auth-dialog";
import { QtyStepper } from "@/components/commander/cart-sheet";
import { RouteLine } from "@/components/commander/route-line";

type Pay = "A_LA_LIVRAISON" | "MTN" | "ORANGE";

const PAY_OPTIONS: { key: Pay; label: string; detail: string; icon: React.ElementType; tone: string }[] = [
  { key: "A_LA_LIVRAISON", label: "Espèces à la livraison", detail: "Vous payez le livreur en main propre.", icon: IconCash, tone: "bg-brand-mint text-primary" },
  { key: "MTN", label: "MTN Mobile Money", detail: "Validation sur votre téléphone après la commande.", icon: IconDeviceMobile, tone: "bg-brand-yellow/40 text-brand-ink" },
  { key: "ORANGE", label: "Orange Money", detail: "Validation sur votre téléphone après la commande.", icon: IconDeviceMobile, tone: "bg-brand-orange/40 text-brand-ink" },
];

export default function PanierPage() {
  const cart = useCart();
  const auth = useClientAuth();
  const loc = useLocation();
  const router = useRouter();

  const [phone, setPhone] = useState("");
  const [momoPhone, setMomoPhone] = useState("");
  const [note, setNote] = useState("");
  const [pay, setPay] = useState<Pay>("A_LA_LIVRAISON");
  const [estimation, setEstimation] = useState<Estimation | null>(null);
  const [estimating, setEstimating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (auth.user?.phone && !phone) setPhone(cleanPhone(auth.user.phone)); }, [auth.user, phone]);
  useEffect(() => { try { const n = sessionStorage.getItem("koursier_note"); if (n && !note) setNote(n); } catch { /* ignore */ } }, [note]);

  // Frais calculés par le serveur (distance restaurant → adresse), comme dans l'application
  useEffect(() => {
    if (!cart.restaurant) { setEstimation(null); return; }
    let cancelled = false;
    setEstimating(true);
    api.estimation({ restaurantId: cart.restaurant.id, clientLatitude: loc.source === "default" ? undefined : loc.pos.lat, clientLongitude: loc.source === "default" ? undefined : loc.pos.lng })
      .then((e) => { if (!cancelled) setEstimation(e); })
      .catch(() => { if (!cancelled) setEstimation(null); })
      .finally(() => { if (!cancelled) setEstimating(false); });
    return () => { cancelled = true; };
  }, [cart.restaurant, loc.pos.lat, loc.pos.lng, loc.source]);

  const fee = estimation?.fraisLivraison ?? null;
  const total = cart.subtotal + (fee || 0);
  const eta = useMemo(() => estimateMinutes(estimation?.distanceKm ?? null, cart.restaurant?.delaiPreparationMin || 20), [estimation, cart.restaurant]);
  const addressMissing = loc.source === "default";

  const submit = async () => {
    if (!auth.requireAuth()) return;
    if (cart.items.length === 0) { toast.error("Votre panier est vide."); return; }
    if (addressMissing) { toast.error("Indiquez votre adresse de livraison."); loc.setOpen(true); return; }
    if (!isValidPhone(phone)) { toast.error("Le numéro de téléphone doit contenir 9 chiffres."); return; }
    const momo = cleanPhone(momoPhone || phone);
    if (pay !== "A_LA_LIVRAISON" && !/^\d{9}$/.test(momo)) { toast.error("Indiquez le numéro Mobile Money à débiter."); return; }

    setSubmitting(true);
    try {
      const res = await api.createCommande({
        items: cart.items.map((it) => ({ platsId: it.platsId, quantity: it.quantity, complements: it.complements.map((c) => ({ complementId: c.id, quantity: c.quantity })) })),
        position: loc.label,
        telephone: cleanPhone(phone),
        clientLatitude: loc.pos.lat,
        clientLongitude: loc.pos.lng,
        recommandation: note.trim() || undefined,
        modePaiement: pay === "A_LA_LIVRAISON" ? "A_LA_LIVRAISON" : "MOBILE_MONEY",
      });
      const created = res.commande;
      cart.clear();
      try { sessionStorage.removeItem("koursier_note"); } catch { /* ignore */ }

      if (pay !== "A_LA_LIVRAISON" && created?.id) {
        try {
          const p = await api.initierPaiement(created.id, pay, momo);
          if (p.authorization_url) window.open(p.authorization_url, "_blank", "noopener");
          toast.success("Commande envoyée. Validez le paiement sur votre téléphone.");
        } catch (e) {
          toast.warning(apiError(e, "Paiement en ligne indisponible : vous paierez à la livraison."));
        }
      } else {
        toast.success(`Commande n°${created.id} envoyée au restaurant.`);
      }
      router.replace(`/commander/commandes/${created.id}?nouvelle=1`);
    } catch (e) {
      const code = (e as { response?: { data?: { code?: string } } })?.response?.data?.code;
      // Menus programmés : le backend renvoie un 409 PLAT_HORS_PLANNING avec un
      // userMessage qui dit quand le plat revient — on l'affiche tel quel.
      const msg = code === "PLAT_INDISPONIBLE" ? "Un plat de votre panier n'est plus disponible. Retirez-le puis réessayez."
        : code === "PLAT_HORS_PLANNING" ? apiError(e, "Un plat de votre panier n'est pas au menu aujourd'hui. Retirez-le puis réessayez.")
        : code === "RESTAURANT_NON_VALIDE" ? "Ce restaurant n'accepte pas encore de commandes."
        : code === "MULTI_RESTAURANT" ? "Une commande ne peut venir que d'un seul restaurant."
        : apiError(e, "La commande n'a pas pu être envoyée. Réessayez dans un instant.");
      toast.error(msg, code === "PLAT_HORS_PLANNING" ? { duration: 10000 } : undefined);
    } finally {
      setSubmitting(false);
    }
  };

  if (cart.items.length === 0) {
    return (
      <div className="mx-auto max-w-lg rounded-[1.5rem] border bg-card px-6 py-14 text-center">
        <p className="font-display text-xl font-bold">Votre panier est vide</p>
        <p className="mt-1 text-sm text-muted-foreground">Choisissez un restaurant ouvert près de vous pour commencer.</p>
        <Link href="/commander" className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"><IconArrowLeft className="h-4 w-4" />Voir les restaurants</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl">
      <Link href={cart.restaurant ? `/commander/restaurant/${cart.restaurant.id}` : "/commander"} className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Continuer mes achats</Link>
      <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Finaliser la commande</h1>
      <p className="mt-1 text-sm text-muted-foreground">Chez <b className="text-foreground">{cart.restaurant?.name}</b>. Le total, frais de livraison compris, est affiché avant de confirmer.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_22rem] lg:items-start">
        <div className="space-y-4">
          {/* Compte */}
          {!auth.user && (
            <section className="rounded-[1.5rem] border border-primary/40 bg-card p-5">
              <h2 className="font-display text-lg font-bold">1 · Votre compte</h2>
              <p className="mb-4 text-sm text-muted-foreground">Connectez-vous pour envoyer la commande et la suivre en direct. Le compte de l’application Koursier fonctionne ici aussi.</p>
              <AuthForms />
            </section>
          )}

          {/* Adresse */}
          <section className="rounded-[1.5rem] border bg-card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold">{auth.user ? "1" : "2"} · Adresse de livraison</h2>
                {addressMissing ? (
                  <p className="mt-1 text-sm text-destructive">Indiquez où livrer : la position exacte sert au livreur et au calcul des frais.</p>
                ) : (
                  <p className="mt-1 flex items-start gap-1.5 text-sm"><IconMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{loc.label}</span></p>
                )}
              </div>
              <button type="button" onClick={() => loc.setOpen(true)} className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-semibold hover:border-primary/60"><IconPencil className="h-4 w-4" />{addressMissing ? "Choisir" : "Modifier"}</button>
            </div>
            {!addressMissing && estimation && (
              <RouteLine className="mt-4" left={estimation.distanceConnue ? formatKm(estimation.distanceKm) : "distance inconnue"} right={`${eta.min}–${eta.max} min`} />
            )}
          </section>

          {/* Téléphone + instructions */}
          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">{auth.user ? "2" : "3"} · Vous joindre</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ck-phone">Téléphone pour la livraison</Label>
                <div className="flex h-11 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50">
                  <span className="flex h-full items-center gap-1.5 border-r px-3 text-sm font-medium text-muted-foreground"><IconPhone className="h-4 w-4" />+237</span>
                  <input id="ck-phone" type="tel" inputMode="numeric" autoComplete="tel-national" placeholder="6XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-full flex-1 bg-transparent px-3 text-sm outline-none" />
                </div>
                <p className="text-xs text-muted-foreground">Le livreur vous appelle à ce numéro à son arrivée.</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ck-note">Instructions pour le restaurant ou le livreur</Label>
                <Textarea id="ck-note" rows={2} placeholder="Ex. sans piment · sonner au portail vert · appeler avant d’arriver" value={note} onChange={(e) => setNote(e.target.value)} maxLength={1000} />
              </div>
            </div>
          </section>

          {/* Paiement */}
          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">{auth.user ? "3" : "4"} · Paiement</h2>
            <div className="mt-3 grid gap-2">
              {PAY_OPTIONS.map((o) => {
                const on = pay === o.key;
                return (
                  <label key={o.key} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors ${on ? "border-primary bg-brand-mint/50 dark:bg-secondary/40" : "hover:border-primary/40"}`}>
                    <input type="radio" name="pay" className="sr-only" checked={on} onChange={() => setPay(o.key)} />
                    <span className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${o.tone}`}><o.icon className="h-5 w-5" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{o.label}</span>
                      <span className="block text-xs text-muted-foreground">{o.detail}</span>
                    </span>
                    <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border-2 ${on ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{on && <IconCheck className="h-3 w-3" />}</span>
                  </label>
                );
              })}
            </div>
            {pay !== "A_LA_LIVRAISON" && (
              <div className="mt-3 space-y-2">
                <Label htmlFor="ck-momo">Numéro {pay === "MTN" ? "MTN MoMo" : "Orange Money"} à débiter</Label>
                <div className="flex h-11 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50">
                  <span className="flex h-full items-center border-r px-3 text-sm font-medium text-muted-foreground">+237</span>
                  <input id="ck-momo" type="tel" inputMode="numeric" placeholder={phone || "6XX XXX XXX"} value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} className="h-full flex-1 bg-transparent px-3 text-sm outline-none" />
                </div>
                <p className="text-xs text-muted-foreground">Laissez vide pour utiliser le numéro de livraison. Une demande de validation s’affichera sur ce téléphone.</p>
              </div>
            )}
          </section>
        </div>

        {/* Récapitulatif */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Récapitulatif</h2>
            <ul className="mt-3 divide-y">
              {cart.items.map((it) => (
                <li key={it.key} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                  <div className="min-w-0">
                    <p className="font-medium leading-tight">{it.name}</p>
                    {it.complements.length > 0 && <p className="truncate text-xs text-muted-foreground">{it.complements.map((c) => `${c.quantity > 1 ? `${c.quantity}× ` : ""}${c.name}`).join(", ")}</p>}
                    <div className="mt-1.5"><QtyStepper value={it.quantity} onChange={(v) => cart.updateQty(it.key, v)} /></div>
                  </div>
                  <span className="shrink-0 font-display font-bold tabular-nums">{formatFcfa(cart.itemTotal(it))}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-3 space-y-1.5 border-t pt-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Sous-total</dt><dd className="tabular-nums">{formatFcfa(cart.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Livraison{estimation?.distanceConnue ? ` · ${formatKm(estimation.distanceKm)}` : ""}</dt><dd className="tabular-nums">{estimating ? "…" : fee != null ? formatFcfa(fee) : "—"}</dd></div>
              <div className="flex items-baseline justify-between border-t pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-2xl font-extrabold tabular-nums">{formatFcfa(total)}</dd></div>
            </dl>
            {addressMissing && <p className="mt-2 text-xs text-muted-foreground">Frais de base affichés. Ils seront recalculés dès que votre adresse sera connue.</p>}
            <Button type="button" onClick={submit} disabled={submitting || estimating} className="mt-4 h-12 w-full rounded-full text-base font-semibold shadow-[0_10px_24px_-12px_rgba(41,160,102,.9)]">
              {submitting ? "Envoi de la commande…" : auth.user ? `Confirmer · ${formatFcfa(total)}` : "Se connecter pour commander"}
            </Button>
            <p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">Le restaurant confirme, puis le livreur le plus proche est prévenu. Vous recevez un code à 5 chiffres à donner au livreur.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
