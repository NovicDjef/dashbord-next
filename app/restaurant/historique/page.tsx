"use client"

import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconChevronDown, IconChevronUp, IconSearch, IconTrendingUp, IconReceipt, IconBan, IconClockHour4 } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { restaurateurService, apiErrorMessage, type Commande, type RestaurantStats } from "@/services/api/restaurateur.service";
import { ORDER_STATUS_LABEL, ORDER_STATUS_CLASS, formatFcfa, type OrderStatus } from "@/lib/order-status";
import { useMyRestaurant } from "@/components/restaurant/restaurant-shell";

type PeriodKey = "today" | "7d" | "30d" | "custom";
const PERIODS: { key: PeriodKey; label: string }[] = [{ key: "today", label: "Aujourd’hui" }, { key: "7d", label: "7 jours" }, { key: "30d", label: "30 jours" }, { key: "custom", label: "Dates" }];
const STATUS_FILTERS: { key: string; label: string; statuses: OrderStatus[] }[] = [
  { key: "all", label: "Toutes", statuses: [] },
  { key: "livrees", label: "Livrées", statuses: ["LIVREE"] },
  { key: "refusees", label: "Refusées", statuses: ["REFUSEE_RESTAURANT"] },
  { key: "annulees", label: "Annulées", statuses: ["ANNULEE"] },
  { key: "encours", label: "En cours", statuses: ["EN_ATTENTE", "ACCEPTEE_RESTAURANT", "EN_PREPARATION", "PRETE", "VALIDER", "ASSIGNEE", "RECUPEREE", "EN_COURS"] },
];
const PAGE = 25;

const startOfDay = (d: Date) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const toInput = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fmtDate = (iso: string) => new Date(iso).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const fmtDay = (k: string) => { const [y, m, d] = k.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" }); };

function rangeFor(period: PeriodKey, custom: { from: string; to: string }) {
  const now = new Date();
  if (period === "today") return { from: startOfDay(now), to: now };
  if (period === "7d") return { from: startOfDay(new Date(now.getTime() - 6 * 86_400_000)), to: now };
  if (period === "30d") return { from: startOfDay(new Date(now.getTime() - 29 * 86_400_000)), to: now };
  const from = custom.from ? startOfDay(new Date(custom.from)) : startOfDay(new Date(now.getTime() - 29 * 86_400_000));
  const to = custom.to ? new Date(new Date(custom.to).setHours(23, 59, 59, 999)) : now;
  return { from, to };
}

function Kpi({ icon: Icon, label, value, hint, tone = "" }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; hint?: string; tone?: string }) {
  return (
    <div className={`rounded-2xl border bg-card p-4 ${tone}`}>
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[.12em] text-muted-foreground"><span>{label}</span><Icon className="h-4 w-4" /></div>
      <p className="mt-2 font-display text-2xl font-extrabold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Bars({ data }: { data: RestaurantStats["parJour"] }) {
  const max = Math.max(1, ...data.map((d) => d.ca));
  if (!data.length) return <p className="py-8 text-center text-sm text-muted-foreground">Aucune commande livrée sur la période.</p>;
  return (
    <div className="flex h-40 items-end gap-1.5 overflow-x-auto">
      {data.map((d) => (
        <div key={d.jour} className="flex min-w-[2.2rem] flex-1 flex-col items-center gap-1" title={`${fmtDay(d.jour)} · ${formatFcfa(d.ca)} · ${d.commandes} commande(s)`}>
          <span className="text-[10px] tabular-nums text-muted-foreground">{d.ca >= 1000 ? `${Math.round(d.ca / 1000)}k` : d.ca}</span>
          <div className="w-full rounded-t-md bg-primary/80" style={{ height: `${Math.max(4, (d.ca / max) * 110)}px` }} />
          <span className="text-[10px] text-muted-foreground">{d.jour.slice(8)}/{d.jour.slice(5, 7)}</span>
        </div>
      ))}
    </div>
  );
}

export default function HistoriquePage() {
  const resto = useMyRestaurant();
  const [period, setPeriod] = useState<PeriodKey>("7d");
  const [custom, setCustom] = useState({ from: toInput(new Date(Date.now() - 29 * 86_400_000)), to: toInput(new Date()) });
  const [statusKey, setStatusKey] = useState("all");
  const [q, setQ] = useState("");
  const [stats, setStats] = useState<RestaurantStats | null>(null);
  const [rows, setRows] = useState<Commande[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  const range = useMemo(() => rangeFor(period, custom), [period, custom]);
  const statuses = STATUS_FILTERS.find((s) => s.key === statusKey)?.statuses || [];

  const load = useCallback(async (off = 0) => {
    if (!resto?.id) return;
    setLoading(true);
    try {
      const [st, list] = await Promise.all([
        restaurateurService.stats({ from: range.from.toISOString(), to: range.to.toISOString() }),
        restaurateurService.commandes({ from: range.from.toISOString(), to: range.to.toISOString(), status: statuses.length ? statuses.join(",") : undefined, q: q.trim() || undefined, limit: PAGE, offset: off }),
      ]);
      setStats(st); setRows(list.commandes || []); setTotal(list.total || 0); setOffset(off);
    } catch (e) { toast.error(apiErrorMessage(e, "Chargement de l’historique impossible")); }
    finally { setLoading(false); }
  }, [resto?.id, range.from, range.to, statusKey, q]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void load(0); }, [load]);

  if (!resto) return <div className="text-muted-foreground">Aucun restaurant associé à ce compte.</div>;

  return (
    <div className="space-y-6">
      {/* Période */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="inline-flex rounded-full border bg-card p-1">
          {PERIODS.map((p) => (
            <button key={p.key} type="button" onClick={() => setPeriod(p.key)} className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${period === p.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>{p.label}</button>
          ))}
        </div>
        {period === "custom" && (
          <div className="flex items-center gap-2 text-sm">
            <Input type="date" className="h-9 w-40" value={custom.from} max={custom.to} onChange={(e) => setCustom({ ...custom, from: e.target.value })} />
            <span className="text-muted-foreground">au</span>
            <Input type="date" className="h-9 w-40" value={custom.to} min={custom.from} max={toInput(new Date())} onChange={(e) => setCustom({ ...custom, to: e.target.value })} />
          </div>
        )}
        <span className="ml-auto text-xs text-muted-foreground">{range.from.toLocaleDateString("fr-FR")} → {range.to.toLocaleDateString("fr-FR")}</span>
      </div>

      {/* Chiffres clés */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Kpi icon={IconTrendingUp} label="Chiffre d’affaires" value={`${formatFcfa(stats?.livrees.ca)} CFA`} hint="Plats des commandes livrées, hors frais de livraison" tone="border-primary/40 bg-secondary/40" />
        <Kpi icon={IconReceipt} label="Livrées" value={String(stats?.livrees.count ?? 0)} hint={stats ? `Panier moyen ${formatFcfa(stats.livrees.panierMoyen)}` : undefined} />
        <Kpi icon={IconClockHour4} label="En cours" value={String(stats?.enCours ?? 0)} hint="Pas encore livrées" />
        <Kpi icon={IconBan} label="Refusées" value={String(stats?.refusees ?? 0)} hint={stats?.tauxAcceptation != null ? `Taux d’acceptation ${stats.tauxAcceptation} %` : undefined} />
        <Kpi icon={IconBan} label="Annulées par le client" value={String(stats?.annulees ?? 0)} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Card>
          <CardHeader><CardTitle>Chiffre d’affaires par jour</CardTitle><CardDescription>Commandes livrées uniquement.</CardDescription></CardHeader>
          <CardContent><Bars data={stats?.parJour || []} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Plats les plus vendus</CardTitle><CardDescription>Sur la période, commandes livrées.</CardDescription></CardHeader>
          <CardContent>
            {stats?.topPlats.length ? (
              <ol className="space-y-2 text-sm">
                {stats.topPlats.map((p, i) => (
                  <li key={`${p.platsId}-${p.nom}`} className="flex items-center gap-3">
                    <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted font-display text-xs font-bold">{i + 1}</span>
                    <span className="flex-1 truncate">{p.nom}</span>
                    <span className="tabular-nums text-muted-foreground">{p.quantite} ×</span>
                    <b className="tabular-nums">{formatFcfa(p.ca)}</b>
                  </li>
                ))}
              </ol>
            ) : <p className="py-6 text-center text-sm text-muted-foreground">Aucune vente livrée sur la période.</p>}
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><CardTitle>Commandes</CardTitle><CardDescription>{total} commande{total > 1 ? "s" : ""} sur la période</CardDescription></div>
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="h-9 w-64 pl-9" placeholder="N°, client, téléphone, adresse" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((f) => (
              <button key={f.key} type="button" onClick={() => setStatusKey(f.key)} className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${statusKey === f.key ? "border-primary bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>{f.label}</button>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="m-4 h-48 animate-pulse rounded-lg bg-muted" /> : rows.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">Aucune commande ne correspond.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-left text-[11px] uppercase tracking-[.12em] text-muted-foreground">
                  <tr><th className="px-4 py-2">N°</th><th className="px-4 py-2">Date</th><th className="px-4 py-2">Client</th><th className="px-4 py-2">Contenu</th><th className="px-4 py-2 text-right">Plats</th><th className="px-4 py-2 text-right">Livraison</th><th className="px-4 py-2">Statut</th><th className="w-8" /></tr>
                </thead>
                <tbody>
                  {rows.map((c) => {
                    const isOpen = open === c.id;
                    const items = c.items || [];
                    return (
                      <Fragment key={c.id}>
                        <tr className="cursor-pointer border-t hover:bg-muted/40" onClick={() => setOpen(isOpen ? null : c.id)}>
                          <td className="px-4 py-2.5 font-semibold tabular-nums">#{c.id}</td>
                          <td className="px-4 py-2.5 whitespace-nowrap text-muted-foreground">{fmtDate(c.createdAt)}</td>
                          <td className="px-4 py-2.5">{c.user?.username || "Client"}<div className="text-xs text-muted-foreground">{c.telephone}</div></td>
                          <td className="max-w-[18rem] truncate px-4 py-2.5 text-muted-foreground">{items.map((it) => `${it.quantity}× ${it.nom}`).join(", ")}</td>
                          <td className="px-4 py-2.5 text-right font-semibold tabular-nums">{formatFcfa(c.prix)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-muted-foreground">{formatFcfa(c.deliveryPrice)}</td>
                          <td className="px-4 py-2.5"><span className={`rounded px-2 py-0.5 text-xs font-medium ${ORDER_STATUS_CLASS[c.status] || ""}`}>{ORDER_STATUS_LABEL[c.status] || c.status}</span></td>
                          <td className="px-2 text-muted-foreground">{isOpen ? <IconChevronUp className="h-4 w-4" /> : <IconChevronDown className="h-4 w-4" />}</td>
                        </tr>
                        {isOpen && (
                          <tr className="border-t bg-muted/30">
                            <td colSpan={8} className="px-4 py-3">
                              <div className="grid gap-4 text-sm md:grid-cols-3">
                                <div>
                                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Détail</div>
                                  <ul className="space-y-1">
                                    {items.map((it) => <li key={it.id} className="flex justify-between gap-2"><span>{it.quantity}× {it.nom}{it.complements?.length ? <span className="text-muted-foreground"> + {it.complements.map((x) => x.name).join(", ")}</span> : null}</span><span className="tabular-nums">{formatFcfa(it.prixUnitaire * it.quantity)}</span></li>)}
                                  </ul>
                                  {c.recommandation && <p className="mt-2 rounded bg-card px-2 py-1 text-xs">📝 {c.recommandation}</p>}
                                </div>
                                <div>
                                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Livraison</div>
                                  <p>{c.position || "adresse non précisée"}{c.distanceKm != null ? ` · ${c.distanceKm} km` : ""}</p>
                                  {c.livreur && <p className="text-muted-foreground">Livreur : {c.livreur.prenom} {c.livreur.username} · {c.livreur.telephone}</p>}
                                  {c.deliveredAt && <p className="text-muted-foreground">Livrée le {fmtDate(c.deliveredAt)}</p>}
                                  {c.payment && <p className="text-muted-foreground">Paiement : {c.payment.mode_payement} · {c.payment.status}</p>}
                                </div>
                                <div>
                                  <div className="mb-1 text-[11px] font-semibold uppercase tracking-[.12em] text-muted-foreground">Total</div>
                                  <p>Plats <b className="tabular-nums">{formatFcfa(c.prix)}</b> + livraison {formatFcfa(c.deliveryPrice)} = <b className="tabular-nums">{formatFcfa((c.prix || 0) + (c.deliveryPrice || 0))}</b></p>
                                  {c.cancelReason && <p className="mt-1 text-destructive">Motif : {c.cancelReason}</p>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {total > PAGE && (
            <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
              <span className="text-muted-foreground">{offset + 1}–{Math.min(offset + PAGE, total)} sur {total}</span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={offset === 0 || loading} onClick={() => load(Math.max(0, offset - PAGE))}>Précédent</Button>
                <Button variant="outline" size="sm" disabled={offset + PAGE >= total || loading} onClick={() => load(offset + PAGE)}>Suivant</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
