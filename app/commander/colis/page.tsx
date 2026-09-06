"use client"

// Envoi d'un colis : expéditeur, destinataire, description, photo, départ et arrivée sur la carte, prix estimé.
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconArrowLeft, IconCamera, IconMapPin, IconPackage, IconPhone } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPicker } from "@/components/map-picker";
import { api, apiError } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { estimateMinutes, formatKm, haversineKm, reverseGeocode, type LatLng } from "@/lib/geo";
import { useClientAuth, useLocation } from "@/components/commander/providers";
import { AuthForms, cleanPhone, isValidPhone } from "@/components/commander/auth-dialog";
import { RouteLine } from "@/components/commander/route-line";

type Point = { pos: LatLng | null; label: string };

function PointField({ id, title, hint, value, onChange, tone }: { id: string; title: string; hint: string; value: Point; onChange: (p: Point) => void; tone: "orange" | "green" }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<LatLng>(value.pos || { lat: 4.0511, lng: 9.7679 });
  const [label, setLabel] = useState(value.label);
  useEffect(() => { if (open) { setPos(value.pos || { lat: 4.0511, lng: 9.7679 }); setLabel(value.label); } }, [open, value]);
  const onMap = async (lat: number, lng: number) => { setPos({ lat, lng }); const l = await reverseGeocode({ lat, lng }); if (l) setLabel(l); };
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${tone === "orange" ? "bg-brand-orange" : "bg-primary"}`} />{title}</Label>
      <div className="flex gap-2">
        <Input id={id} className="h-11" placeholder={hint} value={value.label} onChange={(e) => onChange({ ...value, label: e.target.value })} />
        <button type="button" onClick={() => setOpen(true)} className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-md border px-3 text-sm font-semibold hover:border-primary/60 ${value.pos ? "text-primary" : ""}`}><IconMapPin className="h-4 w-4" />{value.pos ? "Carte ✓" : "Carte"}</button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader><DialogTitle className="font-display text-xl">{title}</DialogTitle><DialogDescription>Placez le repère à l’endroit exact : la distance sert au calcul des frais.</DialogDescription></DialogHeader>
          <div className="overflow-hidden rounded-xl border"><MapPicker lat={pos.lat} lng={pos.lng} onChange={onMap} height={280} hint="Cliquez sur la carte ou déplacez le repère." /></div>
          <Input className="h-11" placeholder="Quartier, repère" value={label} onChange={(e) => setLabel(e.target.value)} />
          <Button type="button" className="h-11 rounded-full font-semibold" onClick={() => { onChange({ pos, label: label.trim() || value.label }); setOpen(false); }}>Valider ce point</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ColisPage() {
  const auth = useClientAuth();
  const loc = useLocation();
  const router = useRouter();

  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [description, setDescription] = useState("");
  const [poids, setPoids] = useState("1");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [from, setFrom] = useState<Point>({ pos: null, label: "" });
  const [to, setTo] = useState<Point>({ pos: null, label: "" });
  const [servicePrice, setServicePrice] = useState<number>(0);
  const [fee, setFee] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (auth.user?.username && !sender) setSender(auth.user.username); }, [auth.user, sender]);
  useEffect(() => { if (loc.source !== "default" && !from.pos) setFrom({ pos: loc.pos, label: loc.label }); }, [loc.source, loc.pos, loc.label, from.pos]);
  useEffect(() => { api.prixColis().then((rows) => { const r = (rows || []).find((x) => x.status === 1 || x.status === true) || rows?.[0]; setServicePrice(Number(r?.montant) || 0); }).catch(() => setServicePrice(0)); }, []);

  const distanceKm = useMemo(() => (from.pos && to.pos ? haversineKm(from.pos, to.pos) : null), [from.pos, to.pos]);

  useEffect(() => {
    let cancelled = false;
    api.estimation({ type: "COLIS", distanceKm: distanceKm ?? 0 }).then((e) => { if (!cancelled) setFee(e.fraisLivraison); }).catch(() => { if (!cancelled) setFee(null); });
    return () => { cancelled = true; };
  }, [distanceKm]);

  const eta = estimateMinutes(distanceKm, 10);
  const total = servicePrice + (fee || 0);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.requireAuth()) return;
    if (sender.trim().length < 2 || receiver.trim().length < 2) { toast.error("Indiquez le nom de l’expéditeur et du destinataire."); return; }
    if (!isValidPhone(receiverPhone)) { toast.error("Le téléphone du destinataire doit contenir 9 chiffres."); return; }
    if (description.trim().length < 3) { toast.error("Décrivez le colis en quelques mots."); return; }
    if (!from.label.trim() || !to.label.trim()) { toast.error("Indiquez l’adresse de départ et d’arrivée."); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("usernameSend", sender.trim());
      fd.append("usernamRecive", receiver.trim());
      fd.append("phoneRecive", cleanPhone(receiverPhone));
      fd.append("description", description.trim());
      fd.append("poids", String(Number(poids) || 1));
      fd.append("adresseDepart", from.label.trim());
      fd.append("adresseArrivee", to.label.trim());
      if (distanceKm != null) fd.append("distance", distanceKm.toFixed(2));
      // `prix` et `deliveryPrice` sont calculés par le serveur (poids + distance) :
      // tout montant envoyé par le client est ignoré.
      if (image) fd.append("imageColis", image);
      const r = await api.createColis(fd);
      const montant = Number(r?.colis?.deliveryPrice ?? r?.tarification?.total);
      toast.success(
        Number.isFinite(montant) && montant > 0
          ? `Colis enregistré · ${formatFcfa(montant)} à régler au livreur.`
          : "Colis enregistré. Un livreur proche va le prendre en charge."
      );
      router.replace(r?.colis?.id ? `/commander/colis/${r.colis.id}` : "/commander/commandes?tab=colis");
    } catch (err) {
      toast.error(apiError(err, "L’envoi n’a pas pu être enregistré. Réessayez."));
    } finally { setSubmitting(false); }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/commander" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Accueil</Link>
      <div className="flex items-start gap-4">
        <span className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-cream text-brand-ink sm:inline-flex"><IconPackage className="h-7 w-7" /></span>
        <div>
          <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Envoyer un colis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Un livreur proche récupère le colis au point de départ et le remet au destinataire contre votre code à 5 chiffres.</p>
        </div>
      </div>

      {auth.ready && !auth.user && (
        <section className="mt-6 rounded-[1.5rem] border border-primary/40 bg-card p-5 lg:max-w-[calc(100%-21.5rem)]">
          <h2 className="font-display text-lg font-bold">Votre compte</h2>
          <p className="mb-4 text-sm text-muted-foreground">Connectez-vous pour enregistrer l’envoi et le suivre. Vous pouvez déjà préparer le formulaire ci-dessous.</p>
          <AuthForms />
        </section>
      )}

      <form onSubmit={submit} noValidate className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="space-y-4">
          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Trajet</h2>
            <div className="mt-3 grid gap-4">
              <PointField id="from" title="Point de départ" hint="Où le livreur récupère le colis" value={from} onChange={setFrom} tone="orange" />
              <PointField id="to" title="Point d’arrivée" hint="Où le livreur le remet" value={to} onChange={setTo} tone="green" />
              {distanceKm != null && <RouteLine left={formatKm(distanceKm)} right={`~${eta.min}–${eta.max} min`} />}
            </div>
          </section>

          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Le colis</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" rows={2} placeholder="Ex. enveloppe de documents, sac de vêtements, petit carton…" value={description} onChange={(e) => setDescription(e.target.value)} maxLength={500} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="poids">Poids approximatif (kg)</Label>
                <Input id="poids" type="number" min={0.1} max={50} step={0.1} className="h-11" value={poids} onChange={(e) => setPoids(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="photo">Photo (facultatif)</Label>
                <div className="flex items-center gap-3">
                  {preview ? <img src={preview} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <span className="inline-flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-muted-foreground"><IconCamera className="h-5 w-5" /></span>}
                  <label className="flex h-11 flex-1 cursor-pointer items-center truncate rounded-md border px-3 text-sm hover:bg-muted">
                    <span className="truncate">{image ? image.name : "Choisir une image"}</span>
                    <input id="photo" type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setImage(f); setPreview(f ? URL.createObjectURL(f) : null); }} />
                  </label>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Expéditeur et destinataire</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="sender">Vous (expéditeur)</Label><Input id="sender" className="h-11" value={sender} onChange={(e) => setSender(e.target.value)} /></div>
              <div className="space-y-2"><Label htmlFor="receiver">Destinataire</Label><Input id="receiver" className="h-11" placeholder="Nom de la personne qui reçoit" value={receiver} onChange={(e) => setReceiver(e.target.value)} /></div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="rphone">Téléphone du destinataire</Label>
                <div className="flex h-11 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50 sm:max-w-xs">
                  <span className="flex h-full items-center gap-1.5 border-r px-3 text-sm font-medium text-muted-foreground"><IconPhone className="h-4 w-4" />+237</span>
                  <input id="rphone" type="tel" inputMode="numeric" placeholder="6XX XXX XXX" value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)} className="h-full flex-1 bg-transparent px-3 text-sm outline-none" />
                </div>
                <p className="text-xs text-muted-foreground">Le livreur l’appelle à l’arrivée.</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24">
          <div className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Prix</h2>
            <dl className="mt-3 space-y-1.5 text-sm">
              {servicePrice > 0 && <div className="flex justify-between"><dt className="text-muted-foreground">Service colis</dt><dd className="tabular-nums">{formatFcfa(servicePrice)}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Course{distanceKm != null ? ` · ${formatKm(distanceKm)}` : ""}</dt><dd className="tabular-nums">{fee != null ? formatFcfa(fee) : "…"}</dd></div>
              <div className="flex items-baseline justify-between border-t pt-2"><dt className="font-semibold">Total</dt><dd className="font-display text-2xl font-extrabold tabular-nums">{formatFcfa(total)}</dd></div>
            </dl>
            <p className="mt-2 text-xs text-muted-foreground">{distanceKm == null ? "Placez le départ et l’arrivée sur la carte pour le prix exact." : "Estimation : le montant définitif est calculé par le serveur à l’enregistrement, puis payé en espèces au livreur."}</p>
            <Button type="submit" disabled={submitting} className="mt-4 h-12 w-full rounded-full text-base font-semibold shadow-[0_10px_24px_-12px_rgba(41,160,102,.9)]">{submitting ? "Enregistrement…" : auth.user ? "Envoyer le colis" : "Se connecter pour envoyer"}</Button>
          </div>
        </aside>
      </form>
    </div>
  );
}
