"use client"

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconCheck, IconX, IconPhone, IconMail, IconRefresh, IconFileAlert, IconIdBadge2, IconAlertTriangle, IconShieldCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { apiErrorMessage } from "@/services/api/restaurateur.service";
import {
  livreurVerificationService, STATUS_LABEL, PIECE_LABEL,
  type LivreurVerification, type LivreurVerificationStatus,
} from "@/services/api/livreur-verification.service";
import { getImageUrl } from "@/services/urlApp";

const ORDER: LivreurVerificationStatus[] = ["EN_ATTENTE_VALIDATION", "DOCUMENTS_REQUIS", "VALIDE", "REJETE"];

function NameCheck({ l }: { l: LivreurVerification }) {
  if (!l.pieceRecto) return <Badge variant="outline">Aucun document</Badge>;
  if (l.ocrStatut === "EN_COURS") return <Badge variant="secondary" className="gap-1"><IconRefresh className="h-3 w-3 animate-spin" />Lecture en cours</Badge>;
  if (l.ocrStatut === "ECHEC" || l.ocrNomCorrespond === null) return <Badge variant="outline" className="gap-1 border-amber-300 text-amber-700"><IconAlertTriangle className="h-3 w-3" />Texte illisible, vérifier à l'œil</Badge>;
  if (l.ocrNomCorrespond) return <Badge className="gap-1 bg-emerald-600 hover:bg-emerald-600"><IconShieldCheck className="h-3 w-3" />Nom retrouvé sur la pièce ({Math.round((l.ocrScore ?? 0) * 100)} %)</Badge>;
  return <Badge variant="destructive" className="gap-1"><IconAlertTriangle className="h-3 w-3" />Nom NON retrouvé ({Math.round((l.ocrScore ?? 0) * 100)} %)</Badge>;
}

export default function LivreurValidationPage() {
  const [status, setStatus] = useState<LivreurVerificationStatus>("EN_ATTENTE_VALIDATION");
  const [list, setList] = useState<LivreurVerification[]>([]);
  const [counts, setCounts] = useState<Partial<Record<LivreurVerificationStatus, number>>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [decision, setDecision] = useState<{ l: LivreurVerification; kind: "REJETE" | "DOCUMENTS_REQUIS"; motif: string } | null>(null);
  const [zoom, setZoom] = useState<{ src: string; title: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await livreurVerificationService.list(status);
      setList(r.livreurs || []);
      setCounts(r.counts || {});
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  // Rafraîchit tant qu'une lecture OCR est en cours
  useEffect(() => {
    if (!list.some((l) => l.ocrStatut === "EN_COURS")) return;
    const t = setTimeout(() => { void load(); }, 6000);
    return () => clearTimeout(t);
  }, [list, load]);

  const decide = async (l: LivreurVerification, next: "VALIDE" | "REJETE" | "DOCUMENTS_REQUIS", motif?: string) => {
    setBusy(l.id);
    try {
      await livreurVerificationService.decide(l.id, next, motif);
      toast.success(`${l.prenom} ${l.nom ?? l.username} : ${next === "VALIDE" ? "compte validé" : next === "REJETE" ? "dossier refusé" : "documents redemandés"}`);
      setDecision(null);
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const rerun = async (l: LivreurVerification) => {
    setBusy(l.id);
    try {
      await livreurVerificationService.rerunOcr(l.id);
      toast.success("Lecture de la pièce relancée");
      await load();
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setBusy(null);
    }
  };

  const Doc = ({ file, label, l }: { file: string | null; label: string; l: LivreurVerification }) => {
    const src = file ? getImageUrl(file) : null;
    return (
      <button
        type="button"
        disabled={!src}
        onClick={() => src && setZoom({ src, title: `${label} · ${l.prenom} ${l.nom ?? ""}` })}
        className="group relative aspect-[3/2] w-full overflow-hidden rounded-md border bg-muted text-left disabled:cursor-default"
      >
        {src ? <img src={src} alt={label} className="h-full w-full object-cover transition group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Non fourni</div>}
        <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold text-white">{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Toaster position="top-right" richColors />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Vérification d'identité des livreurs</h2>
          <p className="text-sm text-muted-foreground">Un livreur ne peut passer en ligne ni recevoir de course tant que son identité n'est pas validée ici. Comparez le nom saisi avec la pièce avant de valider.</p>
        </div>
        <Tabs value={status} onValueChange={(v) => setStatus(v as LivreurVerificationStatus)}>
          <TabsList>
            {ORDER.map((s) => (
              <TabsTrigger key={s} value={s}>{STATUS_LABEL[s]} <Badge variant="secondary" className="ml-2">{counts[s] ?? 0}</Badge></TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-lg bg-muted" /> : list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">Aucun livreur dans « {STATUS_LABEL[status]} ».</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((l) => {
            const details = l.ocrDetails || {};
            return (
              <article key={l.id} className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
                <div className="flex gap-3">
                  {l.image ? <img src={getImageUrl(l.image) || ""} alt="" className="h-14 w-14 rounded-full object-cover" /> : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted"><IconIdBadge2 className="h-6 w-6 text-muted-foreground" /></div>}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate font-semibold">{l.prenom} <span className="uppercase">{l.nom ?? ""}</span></h3>
                    <p className="truncate text-xs text-muted-foreground">@{l.username} · {l.pieceType ? PIECE_LABEL[l.pieceType] : "type non renseigné"}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground"><IconPhone className="h-3 w-3" />{l.telephone}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-muted-foreground"><IconMail className="h-3 w-3" />{l.email}</p>
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Doc file={l.pieceRecto} label="Recto" l={l} />
                  <Doc file={l.pieceVerso} label="Verso" l={l} />
                </div>

                <div className="mt-3 space-y-1.5">
                  <NameCheck l={l} />
                  {l.ocrStatut === "TERMINE" && (
                    <p className="text-xs text-muted-foreground">
                      Attendu : <b>{(details.attendus || []).join(" ")}</b>
                      {details.manquants?.length ? <> · manquant : <span className="text-destructive">{details.manquants.join(", ")}</span></> : null}
                    </p>
                  )}
                  {l.documentsSoumisAt && <p className="text-xs text-muted-foreground">Envoyé le {new Date(l.documentsSoumisAt).toLocaleString("fr-FR")}</p>}
                  {l.verificationMotif && status !== "VALIDE" && <p className="rounded bg-muted p-2 text-xs"><b>Motif :</b> {l.verificationMotif}</p>}
                  {l.verifiedAt && status === "VALIDE" && <p className="text-xs text-muted-foreground">Validé le {new Date(l.verifiedAt).toLocaleString("fr-FR")}</p>}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {status !== "VALIDE" && (
                    <Button size="sm" disabled={busy === l.id || !l.pieceRecto} onClick={() => decide(l, "VALIDE")} className="bg-emerald-600 hover:bg-emerald-700">
                      <IconCheck className="mr-1 h-4 w-4" />Valider
                    </Button>
                  )}
                  {status !== "REJETE" && (
                    <Button size="sm" variant="destructive" disabled={busy === l.id} onClick={() => setDecision({ l, kind: "REJETE", motif: "" })}>
                      <IconX className="mr-1 h-4 w-4" />Refuser
                    </Button>
                  )}
                  {status !== "DOCUMENTS_REQUIS" && (
                    <Button size="sm" variant="outline" disabled={busy === l.id} onClick={() => setDecision({ l, kind: "DOCUMENTS_REQUIS", motif: "" })}>
                      <IconFileAlert className="mr-1 h-4 w-4" />Redemander
                    </Button>
                  )}
                  {l.pieceRecto && (
                    <Button size="sm" variant="ghost" disabled={busy === l.id || l.ocrStatut === "EN_COURS"} onClick={() => rerun(l)} title="Relancer la lecture de la pièce">
                      <IconRefresh className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Motif de refus / nouvelle demande */}
      <Dialog open={!!decision} onOpenChange={(o) => !o && setDecision(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{decision?.kind === "REJETE" ? "Refuser le dossier" : "Redemander les documents"}</DialogTitle>
            <DialogDescription>
              {decision ? `${decision.l.prenom} ${decision.l.nom ?? decision.l.username} recevra ce motif dans l'application.` : ""}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={decision?.motif ?? ""}
            onChange={(e) => decision && setDecision({ ...decision, motif: e.target.value })}
            placeholder={decision?.kind === "REJETE" ? "Ex. : le nom sur la pièce ne correspond pas au compte." : "Ex. : photo floue, verso manquant, pièce expirée."}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setDecision(null)}>Annuler</Button>
            <Button
              variant={decision?.kind === "REJETE" ? "destructive" : "default"}
              disabled={!decision || decision.motif.trim().length < 5 || busy === decision.l.id}
              onClick={() => decision && decide(decision.l, decision.kind, decision.motif.trim())}
            >
              Confirmer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Zoom sur une pièce */}
      <Dialog open={!!zoom} onOpenChange={(o) => !o && setZoom(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader><DialogTitle>{zoom?.title}</DialogTitle></DialogHeader>
          {zoom && <img src={zoom.src} alt="" className="max-h-[75vh] w-full rounded object-contain" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
