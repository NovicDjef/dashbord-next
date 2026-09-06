"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconStar, IconAlertTriangle, IconTrophy, IconMessage, IconPhone, IconRefresh, IconLock, IconLockOpen } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Toaster } from "@/components/ui/sonner";
import { apiErrorMessage } from "@/services/api/restaurateur.service";
import { livreurPerformanceService, ISSUE_LABEL, type LivreurPerf, type AvisLivreur, type Niveau, type PerfResume } from "@/services/api/livreur-performance.service";
import { getImageUrl } from "@/services/urlApp";

const NIVEAU: Record<Niveau, { label: string; cls: string }> = {
  EXCELLENT: { label: "Excellent", cls: "bg-emerald-600 hover:bg-emerald-600" },
  CORRECT: { label: "Correct", cls: "bg-slate-500 hover:bg-slate-500" },
  A_RECADRER: { label: "À recadrer", cls: "bg-red-600 hover:bg-red-600" },
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" title={`${value.toFixed(1)} / 5`}>
      {[1, 2, 3, 4, 5].map((n) => <IconStar key={n} className={`h-3.5 w-3.5 ${n <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />)}
      <b className="ml-1 text-sm">{value.toFixed(1)}</b>
    </span>
  );
}

function Distribution({ d, total }: { d: LivreurPerf["distribution"]; total: number }) {
  if (!total) return <span className="text-xs text-muted-foreground">Aucun avis</span>;
  return (
    <div className="flex h-2 w-28 overflow-hidden rounded-full bg-muted" title={`5★ ${d["5"]} · 4★ ${d["4"]} · 3★ ${d["3"]} · 2★ ${d["2"]} · 1★ ${d["1"]}`}>
      {(["5", "4", "3", "2", "1"] as const).map((k) => (
        <span key={k} style={{ width: `${(d[k] / total) * 100}%` }} className={{ "5": "bg-emerald-500", "4": "bg-lime-400", "3": "bg-amber-400", "2": "bg-orange-500", "1": "bg-red-500" }[k]} />
      ))}
    </div>
  );
}

export default function LivreurPerformancePage() {
  const [jours, setJours] = useState(30);
  const [filtre, setFiltre] = useState<"TOUS" | Niveau>("TOUS");
  const [list, setList] = useState<LivreurPerf[]>([]);
  const [resume, setResume] = useState<PerfResume | null>(null);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<{ livreur: LivreurPerf; avis: AvisLivreur[] } | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await livreurPerformanceService.list(jours);
      setList(r.livreurs || []);
      setResume(r.resume || null);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [jours]);

  useEffect(() => { void load(); }, [load]);

  const rows = useMemo(() => (filtre === "TOUS" ? list : list.filter((l) => l.niveau === filtre)), [list, filtre]);

  const openAvis = async (l: LivreurPerf) => {
    try {
      const r = await livreurPerformanceService.avis(l.id);
      setDetail({ livreur: r.livreur, avis: r.avis || [] });
    } catch (e) {
      toast.error(apiErrorMessage(e));
    }
  };

  const toggleBlocage = async (l: LivreurPerf) => {
    if (!confirm(`${l.bloque ? "Débloquer" : "Bloquer"} ${l.prenom} ${l.nom ?? l.username} ?`)) return;
    setBusy(l.id);
    try {
      await livreurPerformanceService.bloquer(l.id, !l.bloque);
      toast.success(l.bloque ? "Livreur débloqué" : "Livreur bloqué");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Toaster position="top-right" richColors />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Performance des livreurs</h2>
          <p className="text-sm text-muted-foreground">Notes des clients après livraison, acceptation des courses et signalements. Les mieux notés sont sollicités en priorité par le dispatch.</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={String(jours)} onValueChange={(v) => setJours(Number(v))}>
            <TabsList>
              {[7, 30, 90].map((j) => <TabsTrigger key={j} value={String(j)}>{j} j</TabsTrigger>)}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="icon" onClick={() => load()} title="Actualiser"><IconRefresh className="h-4 w-4" /></Button>
        </div>
      </div>

      {resume && (
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Livreurs</p><p className="text-2xl font-bold">{resume.total}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="text-xs text-muted-foreground">Note moyenne</p><p className="text-2xl font-bold">{resume.noteMoyenne ?? "–"} <span className="text-base text-amber-500">★</span></p></div>
          <div className="rounded-lg border bg-card p-4"><p className="flex items-center gap-1 text-xs text-muted-foreground"><IconTrophy className="h-3.5 w-3.5 text-emerald-600" />Excellents</p><p className="text-2xl font-bold text-emerald-600">{resume.excellents}</p></div>
          <div className="rounded-lg border bg-card p-4"><p className="flex items-center gap-1 text-xs text-muted-foreground"><IconAlertTriangle className="h-3.5 w-3.5 text-red-600" />À recadrer</p><p className="text-2xl font-bold text-red-600">{resume.aRecadrer}</p></div>
        </div>
      )}

      <Tabs value={filtre} onValueChange={(v) => setFiltre(v as typeof filtre)}>
        <TabsList>
          <TabsTrigger value="TOUS">Tous <Badge variant="secondary" className="ml-2">{list.length}</Badge></TabsTrigger>
          {(Object.keys(NIVEAU) as Niveau[]).map((n) => (
            <TabsTrigger key={n} value={n}>{NIVEAU[n].label} <Badge variant="secondary" className="ml-2">{list.filter((l) => l.niveau === n).length}</Badge></TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? <div className="h-48 animate-pulse rounded-lg bg-muted" /> : rows.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">Aucun livreur dans cette catégorie.</div>
      ) : (
        <div className="overflow-x-auto rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Livreur</TableHead>
                <TableHead>Note</TableHead>
                <TableHead>Répartition</TableHead>
                <TableHead className="text-right">Avis</TableHead>
                <TableHead className="text-right">Signalements</TableHead>
                <TableHead className="text-right">Acceptation</TableHead>
                <TableHead className="text-right">Livrées {jours} j</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((l, i) => (
                <TableRow key={l.id} className={l.niveau === "A_RECADRER" ? "bg-red-50/60 dark:bg-red-950/20" : undefined}>
                  <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {l.image ? <img src={getImageUrl(l.image) || ""} alt="" className="h-8 w-8 rounded-full object-cover" /> : <div className="h-8 w-8 rounded-full bg-muted" />}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{l.prenom} <span className="uppercase">{l.nom ?? ""}</span> {l.bloque && <Badge variant="destructive" className="ml-1">bloqué</Badge>}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground"><IconPhone className="h-3 w-3" />{l.telephone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Stars value={l.note} /></TableCell>
                  <TableCell><Distribution d={l.distribution} total={l.nbAvis} /></TableCell>
                  <TableCell className="text-right">{l.nbAvis}{l.nbAvisBas > 0 && <span className="ml-1 text-xs text-red-600">({l.nbAvisBas} ≤ 2★)</span>}</TableCell>
                  <TableCell className="text-right">{l.nbSignalements > 0 ? <Badge variant="destructive">{l.nbSignalements}</Badge> : <span className="text-muted-foreground">0</span>}</TableCell>
                  <TableCell className="text-right">{l.tauxAcceptation === null ? <span className="text-muted-foreground">–</span> : <span className={l.tauxAcceptation < 50 ? "text-red-600 font-semibold" : ""}>{l.tauxAcceptation} %</span>}<span className="block text-[11px] text-muted-foreground">{l.acceptees} acc. · {l.refusees} ref. · {l.expirees} exp.</span></TableCell>
                  <TableCell className="text-right">{l.livrees30j}</TableCell>
                  <TableCell>
                    <Badge className={NIVEAU[l.niveau].cls}>{NIVEAU[l.niveau].label}</Badge>
                    {l.alertes.length > 0 && <ul className="mt-1 space-y-0.5 text-[11px] text-red-700 dark:text-red-400">{l.alertes.map((a) => <li key={a}>• {a}</li>)}</ul>}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openAvis(l)}><IconMessage className="mr-1 h-4 w-4" />Avis</Button>
                      <Button size="sm" variant={l.bloque ? "outline" : "ghost"} disabled={busy === l.id} onClick={() => toggleBlocage(l)} title={l.bloque ? "Débloquer" : "Bloquer"}>
                        {l.bloque ? <IconLockOpen className="h-4 w-4" /> : <IconLock className="h-4 w-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Sheet open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
          {detail && (
            <>
              <SheetHeader>
                <SheetTitle>{detail.livreur.prenom} <span className="uppercase">{detail.livreur.nom ?? detail.livreur.username}</span></SheetTitle>
                <SheetDescription className="flex flex-wrap items-center gap-3">
                  <Stars value={detail.livreur.note} /> · {detail.livreur.nbAvis} avis · {detail.livreur.nbSignalements} signalement(s)
                  {detail.livreur.tauxAcceptation !== null && <> · acceptation {detail.livreur.tauxAcceptation} %</>}
                </SheetDescription>
              </SheetHeader>
              {detail.livreur.alertes.length > 0 && (
                <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                  <b>Points à recadrer :</b>
                  <ul className="mt-1 list-disc pl-5">{detail.livreur.alertes.map((a) => <li key={a}>{a}</li>)}</ul>
                </div>
              )}
              <div className="mt-4 space-y-3">
                {detail.avis.length === 0 && <p className="text-sm text-muted-foreground">Aucun avis reçu pour le moment.</p>}
                {detail.avis.map((a) => (
                  <article key={a.id} className={`rounded-md border p-3 ${a.hasIssue ? "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20" : "bg-card"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Stars value={a.overallRating} />
                      <span className="text-xs text-muted-foreground">{new Date(a.createdAt).toLocaleString("fr-FR")}{a.livraison?.commandeId ? ` · commande #${a.livraison.commandeId}` : ""}</span>
                    </div>
                    {a.hasIssue && <Badge variant="destructive" className="mt-2">{ISSUE_LABEL[a.issueType || "AUTRE"] || a.issueType}</Badge>}
                    {a.comment && <p className="mt-2 text-sm">« {a.comment} »</p>}
                    <p className="mt-1 text-xs text-muted-foreground">Client : {a.user?.username ?? "—"}{a.user?.phone ? ` · ${a.user.phone}` : ""}{a.wouldRecommend ? "" : " · ne recommande pas"}</p>
                  </article>
                ))}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
