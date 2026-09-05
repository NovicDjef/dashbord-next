"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IconPlayerPause, IconPlayerPlay, IconClock, IconMoon, IconAlertTriangle } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { restaurateurService, apiErrorMessage, type Disponibilite, type Restaurant } from "@/services/api/restaurateur.service";
import { setRestaurants } from "@/redux/adminAuthSlice";
import { useMyRestaurant } from "./restaurant-shell";

// Heures affichées telles que formatées par le serveur (heure du Cameroun), sans dépendre du fuseau du navigateur
const fmtHM = (iso: string | null, hm?: string | null) => hm || (iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Douala" }) : "");
export const fmtCountdown = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h > 0 ? `${h} h ${String(m).padStart(2, "0")} min` : `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
};

/**
 * Bandeau d'état du restaurant : ouvert / fermé / en pause, compte à rebours avant la fin des commandes
 * et bouton de pause. Même règle que ce que voient les clients (GET /restaurants/:id/disponibilite).
 */
export function AvailabilityBar() {
  const dispatch = useDispatch();
  const resto = useMyRestaurant();
  const [dispo, setDispo] = useState<Disponibilite | null>(null);
  const [offset, setOffset] = useState(0); // décalage horloge serveur - navigateur
  const [now, setNow] = useState(() => Date.now());
  const [pauseDialog, setPauseDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!resto?.id) return;
    try {
      const r = await restaurateurService.disponibilite(resto.id);
      setDispo(r.disponibilite);
      setOffset(new Date(r.serverTime).getTime() - Date.now());
    } catch { /* on garde l'état précédent */ }
  }, [resto?.id]);

  useEffect(() => { void refresh(); const t = setInterval(refresh, 60_000); return () => clearInterval(t); }, [refresh]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  // Quand le compte à rebours atteint zéro, on redemande l'état au serveur (les commandes se ferment toutes seules)
  const serverNow = now + offset;
  const ordersUntilMs = dispo?.ordersUntil ? new Date(dispo.ordersUntil).getTime() - serverNow : null;
  const closesMs = dispo?.closesAt ? new Date(dispo.closesAt).getTime() - serverNow : null;
  useEffect(() => { if (ordersUntilMs !== null && ordersUntilMs <= 0 && dispo?.acceptsOrders) void refresh(); }, [ordersUntilMs, dispo?.acceptsOrders, refresh]);

  const togglePause = async (enPause: boolean) => {
    if (!resto?.id) return;
    setBusy(true);
    try {
      const r = await restaurateurService.setPause(resto.id, enPause, message.trim() || undefined);
      setDispo(r.disponibilite);
      const fresh = await restaurateurService.me();
      dispatch(setRestaurants(fresh.restaurants as Restaurant[]));
      toast.success(enPause ? "Commandes suspendues. Les clients voient votre restaurant en pause." : "Commandes réactivées.");
      setPauseDialog(false); setMessage("");
    } catch (e) { toast.error(apiErrorMessage(e)); } finally { setBusy(false); }
  };

  const view = useMemo(() => {
    if (!dispo) return null;
    if (dispo.reason === "NON_VALIDE") return null; // le bandeau de validation s'en charge
    if (dispo.enPause) return { tone: "bg-brand-cream text-brand-ink dark:text-foreground", icon: IconPlayerPause, title: "Commandes en pause", detail: dispo.message || "Les clients ne peuvent pas commander." };
    if (!dispo.isOpen) return { tone: "bg-muted text-muted-foreground", icon: IconMoon, title: "Fermé", detail: dispo.opensAt ? `Réouverture à ${fmtHM(dispo.opensAt, dispo.opensAtHM)}` : "Fermé aujourd’hui selon vos horaires" };
    if (!dispo.acceptsOrders) return { tone: "bg-brand-cream text-brand-ink dark:text-foreground", icon: IconAlertTriangle, title: "Commandes closes pour aujourd’hui", detail: `Fermeture à ${fmtHM(dispo.closesAt, dispo.closesAtHM)} · les commandes s’arrêtent ${dispo.delaiFermetureCommandeMin} min avant` };
    const soon = ordersUntilMs !== null && ordersUntilMs <= 60 * 60_000;
    return {
      tone: soon ? "bg-brand-cream text-brand-ink dark:text-foreground" : "bg-secondary text-secondary-foreground",
      icon: IconClock,
      title: soon && ordersUntilMs !== null ? `Dernières commandes dans ${fmtCountdown(ordersUntilMs)}` : "Ouvert · commandes acceptées",
      detail: `Fermeture à ${fmtHM(dispo.closesAt, dispo.closesAtHM)}${dispo.delaiFermetureCommandeMin ? ` · commandes jusqu’à ${fmtHM(dispo.ordersUntil, dispo.ordersUntilHM)}` : ""}${closesMs !== null && !soon ? ` · dans ${fmtCountdown(closesMs)}` : ""}`,
    };
  }, [dispo, ordersUntilMs, closesMs]);

  if (!resto || !view) return null;
  const Icon = view.icon;
  return (
    <>
      <div role="status" className={`flex flex-wrap items-center gap-3 border-b px-4 py-2.5 text-sm lg:px-6 ${view.tone}`}>
        <Icon className="h-4 w-4 shrink-0" />
        <div className="min-w-0 flex-1">
          <b className="font-display tabular-nums">{view.title}</b>
          <span className="ml-2 opacity-80">{view.detail}</span>
        </div>
        {dispo?.enPause ? (
          <Button size="sm" className="rounded-full" disabled={busy} onClick={() => togglePause(false)}><IconPlayerPlay className="mr-1.5 h-4 w-4" />Reprendre les commandes</Button>
        ) : (
          <Button size="sm" variant="outline" className="rounded-full" disabled={busy || !dispo?.isOpen} onClick={() => setPauseDialog(true)}><IconPlayerPause className="mr-1.5 h-4 w-4" />Mettre en pause</Button>
        )}
      </div>

      <Dialog open={pauseDialog} onOpenChange={(o) => !o && setPauseDialog(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspendre les commandes</DialogTitle>
            <DialogDescription>Votre restaurant reste visible, mais les clients ne peuvent plus commander tant que vous n’avez pas repris. Un message facultatif leur est affiché.</DialogDescription>
          </DialogHeader>
          <Textarea rows={2} maxLength={200} placeholder="Ex. Coupure d’électricité, retour vers 15 h" value={message} onChange={(e) => setMessage(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setPauseDialog(false)}>Annuler</Button>
            <Button disabled={busy} onClick={() => togglePause(true)}>{busy ? "…" : "Mettre en pause"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
