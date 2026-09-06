"use client"

import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { IconRefresh, IconPhone, IconMapPin, IconMotorbike, IconVolume, IconVolumeOff, IconBellRinging } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePolling } from "@/hooks/use-polling";
import { useBeep } from "@/hooks/use-beep";
import { restaurateurService, apiErrorMessage, type Commande } from "@/services/api/restaurateur.service";
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS, ACTIVE_RESTAURANT_STATUSES, formatFcfa, type OrderStatus } from "@/lib/order-status";
import { useMyRestaurant } from "@/components/restaurant/restaurant-shell";

const COLUMNS: { key: string; title: string; statuses: OrderStatus[] }[] = [
  { key: "new", title: "Nouvelles", statuses: ["EN_ATTENTE"] },
  { key: "accepted", title: "Acceptées", statuses: ["ACCEPTEE_RESTAURANT"] },
  { key: "cooking", title: "En préparation", statuses: ["EN_PREPARATION"] },
  { key: "ready", title: "Prêtes", statuses: ["PRETE", "VALIDER", "ASSIGNEE"] },
  { key: "delivery", title: "En livraison", statuses: ["RECUPEREE", "EN_COURS"] },
];

const timeAgo = (iso: string) => {
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (m < 1) return "à l'instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  return `il y a ${h} h ${m % 60} min`;
};

function OrderCard({ c, onAction, busy }: { c: Commande; onAction: (action: "accepter" | "preparer" | "prete" | "refuser", c: Commande) => void; busy: boolean }) {
  const items = c.items && c.items.length ? c.items : [];
  const total = (c.prix || 0) + (c.deliveryPrice || 0);
  return (
    <article className="rounded-lg border bg-card p-3 shadow-sm">
      <header className="mb-2 flex items-start justify-between gap-2">
        <div>
          <div className="font-semibold">#{c.id} <span className="font-normal text-muted-foreground">· {timeAgo(c.createdAt)}</span></div>
          <div className="text-sm text-muted-foreground">{c.user?.username || "Client"}</div>
        </div>
        <span className={`rounded px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[c.status] || ""}`}>{ORDER_STATUS_LABEL[c.status] || c.status}</span>
      </header>
      <ul className="mb-2 space-y-1 text-sm">
        {items.map((it) => (
          <li key={it.id} className="flex justify-between gap-2">
            <span><b>{it.quantity}×</b> {it.nom}{it.complements?.length ? <span className="text-muted-foreground"> + {it.complements.map((x) => x.name).join(", ")}</span> : null}</span>
            <span className="tabular-nums">{formatFcfa(it.prixUnitaire * it.quantity)}</span>
          </li>
        ))}
      </ul>
      {c.recommandation ? <p className="mb-2 rounded bg-muted px-2 py-1 text-xs">📝 {c.recommandation}</p> : null}
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1"><IconPhone className="h-3 w-3" /><a href={`tel:${c.telephone}`} className="hover:underline">{c.telephone}</a></span>
        <span className="flex items-center gap-1"><IconMapPin className="h-3 w-3" />{c.position || "adresse non précisée"}{c.distanceKm != null ? ` · ${c.distanceKm} km` : ""}</span>
        {c.livreur && !c.arrivedAtRestaurantAt && <span className="flex items-center gap-1"><IconMotorbike className="h-3 w-3" />{c.livreur.prenom} {c.livreur.username} · {c.livreur.telephone}</span>}
      </div>
      {c.arrivedAtRestaurantAt && c.status !== "RECUPEREE" && c.status !== "EN_COURS" && (
        <div className="mb-2 flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs font-semibold text-secondary-foreground">
          <IconMotorbike className="h-4 w-4" />
          <span>Livreur sur place{c.livreur ? ` · ${c.livreur.prenom} ${c.livreur.username}` : ""} · {timeAgo(c.arrivedAtRestaurantAt)}</span>
        </div>
      )}
      <div className="flex items-center justify-between border-t pt-2 text-sm">
        <span>Plats <b className="tabular-nums">{formatFcfa(c.prix)}</b> <span className="text-muted-foreground">+ livraison {formatFcfa(c.deliveryPrice)}</span></span>
        <b className="tabular-nums">{formatFcfa(total)}</b>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {c.status === "EN_ATTENTE" && (<>
          <Button size="sm" className="" disabled={busy} onClick={() => onAction("accepter", c)}>Accepter</Button>
          <Button size="sm" variant="outline" className="text-destructive" disabled={busy} onClick={() => onAction("refuser", c)}>Refuser</Button>
        </>)}
        {c.status === "ACCEPTEE_RESTAURANT" && (<>
          <Button size="sm" disabled={busy} onClick={() => onAction("preparer", c)}>Lancer la préparation</Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onAction("prete", c)}>Déjà prête</Button>
        </>)}
        {c.status === "EN_PREPARATION" && <Button size="sm" className="" disabled={busy} onClick={() => onAction("prete", c)}>Commande prête</Button>}
        {(c.status === "PRETE") && <span className="text-xs text-muted-foreground">En attente d’un livreur…</span>}
        {(c.status === "VALIDER" || c.status === "ASSIGNEE") && c.validationCode && <span className="text-xs text-muted-foreground">{c.arrivedAtRestaurantAt ? "Remettez la commande au livreur" : "Livreur en route vers vous"}</span>}
      </div>
    </article>
  );
}

export default function RestaurantOrdersPage() {
  const resto = useMyRestaurant();
  const [orders, setOrders] = useState<Commande[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [sound, setSound] = useState(true);
  const [refuse, setRefuse] = useState<{ c: Commande; raison: string } | null>(null);
  const knownIds = useRef<Set<number> | null>(null);
  const arrivedIds = useRef<Set<number>>(new Set());
  const beep = useBeep();

  const load = useCallback(async () => {
    try {
      const r = await restaurateurService.commandes({ status: ACTIVE_RESTAURANT_STATUSES.join(","), limit: 200 });
      const list = r.commandes || [];
      const newOnes = list.filter((c) => c.status === "EN_ATTENTE" && knownIds.current && !knownIds.current.has(c.id));
      if (knownIds.current && newOnes.length > 0) {
        if (sound) beep(3);
        toast.info(`${newOnes.length} nouvelle${newOnes.length > 1 ? "s" : ""} commande${newOnes.length > 1 ? "s" : ""}`);
      }
      const arrivedNow = list.filter((c) => c.arrivedAtRestaurantAt && !arrivedIds.current.has(c.id) && !["RECUPEREE", "EN_COURS"].includes(c.status));
      if (knownIds.current && arrivedNow.length > 0) {
        if (sound) beep(1);
        for (const c of arrivedNow) toast.success(`Livreur arrivé pour la commande #${c.id}${c.livreur ? ` (${c.livreur.prenom})` : ""}`);
      }
      for (const c of list) if (c.arrivedAtRestaurantAt) arrivedIds.current.add(c.id);
      knownIds.current = new Set(list.map((c) => c.id));
      setOrders(list);
    } catch (e) {
      if (loading) toast.error(apiErrorMessage(e, "Impossible de charger les commandes"));
    } finally {
      setLoading(false);
    }
  }, [sound, beep, loading]);

  usePolling(load, 10000, true);

  const act = async (action: "accepter" | "preparer" | "prete" | "refuser", c: Commande, raison?: string) => {
    setBusyId(c.id);
    try {
      if (action === "refuser") await restaurateurService.refuser(c.id, raison || "Indisponible");
      else await restaurateurService[action](c.id);
      toast.success(`Commande #${c.id} : ${action === "accepter" ? "acceptée" : action === "preparer" ? "en préparation" : action === "prete" ? "prête" : "refusée"}`);
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusyId(null);
    }
  };

  const onAction = (action: "accepter" | "preparer" | "prete" | "refuser", c: Commande) => {
    if (action === "refuser") { setRefuse({ c, raison: "" }); return; }
    void act(action, c);
  };

  const byColumn = useMemo(() => COLUMNS.map((col) => ({ ...col, orders: orders.filter((o) => col.statuses.includes(o.status)) })), [orders]);
  const pending = orders.filter((o) => o.status === "EN_ATTENTE").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Commandes en cours</h2>
          <p className="text-sm text-muted-foreground">{resto?.name} · actualisation automatique toutes les 10 s{pending > 0 ? ` · ${pending} à traiter` : ""}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setSound((s) => !s)}>{sound ? <IconVolume className="mr-2 h-4 w-4" /> : <IconVolumeOff className="mr-2 h-4 w-4" />}{sound ? "Son activé" : "Son coupé"}</Button>
          <Button variant="outline" size="sm" onClick={() => void load()}><IconRefresh className="mr-2 h-4 w-4" />Actualiser</Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{COLUMNS.map((c) => <div key={c.key} className="h-40 animate-pulse rounded-lg bg-muted" />)}</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed px-6 py-14 text-center">
          <span className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground"><IconBellRinging className="h-7 w-7" /></span>
          <h3 className="font-display text-lg font-bold">Aucune commande en cours</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Les nouvelles commandes apparaissent ici en temps réel, avec une sonnerie. Gardez cette page ouverte pendant le service.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {byColumn.map((col) => (
            <section key={col.key} className="min-w-0">
              <h3 className="mb-2 flex items-center justify-between text-sm font-semibold">
                {col.title} <Badge variant="secondary">{col.orders.length}</Badge>
              </h3>
              <div className="space-y-3">
                {col.orders.map((c) => <OrderCard key={c.id} c={c} onAction={onAction} busy={busyId === c.id} />)}
                {col.orders.length === 0 && <div className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">—</div>}
              </div>
            </section>
          ))}
        </div>
      )}

      <Dialog open={!!refuse} onOpenChange={(o) => !o && setRefuse(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser la commande #{refuse?.c.id}</DialogTitle>
            <DialogDescription>Le client sera prévenu immédiatement. Indiquez un motif.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} placeholder="Ex. plat épuisé, cuisine fermée…" value={refuse?.raison || ""} onChange={(e) => refuse && setRefuse({ ...refuse, raison: e.target.value })} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRefuse(null)}>Annuler</Button>
            <Button variant="destructive" disabled={!refuse?.raison.trim()} onClick={() => { if (refuse) { void act("refuser", refuse.c, refuse.raison.trim()); setRefuse(null); } }}>Refuser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
