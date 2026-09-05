"use client"

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconCheck, IconX, IconMapPin, IconPhone, IconMail } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/sonner";
import { adminValidationService, apiErrorMessage, type Restaurant, type ValidationStatus } from "@/services/api/restaurateur.service";
import { getImageUrl } from "@/services/urlApp";

const LABEL: Record<ValidationStatus, string> = { PENDING: "En attente", APPROVED: "Validés", REJECTED: "Refusés" };

export default function ValidationPage() {
  const [status, setStatus] = useState<ValidationStatus>("PENDING");
  const [list, setList] = useState<Restaurant[]>([]);
  const [counts, setCounts] = useState<Partial<Record<ValidationStatus, number>>>({});
  const [loading, setLoading] = useState(true);
  const [reject, setReject] = useState<{ r: Restaurant; reason: string } | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await adminValidationService.list(status);
      setList(r.restaurants || []);
      setCounts(r.counts || {});
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const decide = async (r: Restaurant, next: ValidationStatus, reason?: string) => {
    setBusy(r.id);
    try {
      await adminValidationService.setValidation(r.id, next, reason);
      toast.success(`${r.name} : ${next === "APPROVED" ? "validé" : next === "REJECTED" ? "refusé" : "remis en attente"}`);
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
          <h2 className="text-xl font-semibold">Validation des restaurants</h2>
          <p className="text-sm text-muted-foreground">Un restaurant n'apparaît dans l'application client qu'une fois validé.</p>
        </div>
        <Tabs value={status} onValueChange={(v) => setStatus(v as ValidationStatus)}>
          <TabsList>
            {(["PENDING", "APPROVED", "REJECTED"] as ValidationStatus[]).map((s) => (
              <TabsTrigger key={s} value={s}>{LABEL[s]} <Badge variant="secondary" className="ml-2">{counts[s] ?? 0}</Badge></TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {loading ? <div className="h-48 animate-pulse rounded-lg bg-muted" /> : list.length === 0 ? (
        <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">Aucun restaurant {LABEL[status].toLowerCase()}.</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {list.map((r) => (
            <article key={r.id} className="flex flex-col rounded-lg border bg-card p-4 shadow-sm">
              <div className="flex gap-3">
                {r.image ? <img src={getImageUrl(r.image) || ""} alt="" className="h-16 w-16 rounded object-cover" /> : <div className="h-16 w-16 rounded bg-muted" />}
                <div className="min-w-0 flex-1">
                  <h3 className="truncate font-semibold">{r.name}</h3>
                  <p className="flex items-center gap-1 text-xs text-muted-foreground"><IconMapPin className="h-3 w-3" />{r.adresse}{r.ville ? ` · ` : ""}</p>
                  <p className="text-xs text-muted-foreground">Inscrit le {r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : "—"} · {r._count?.categories ?? 0} catégorie(s)</p>
                </div>
              </div>
              {r.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{r.description}</p>}
              {r.admin && (
                <div className="mt-3 rounded bg-muted/60 p-2 text-xs">
                  <div className="font-medium">{r.admin.username}</div>
                  <div className="flex flex-wrap gap-3 text-muted-foreground">
                    <span className="flex items-center gap-1"><IconMail className="h-3 w-3" />{r.admin.email}</span>
                    {r.admin.phone && <span className="flex items-center gap-1"><IconPhone className="h-3 w-3" />{r.admin.phone}</span>}
                  </div>
                </div>
              )}
              <a className="mt-2 text-xs text-primary underline-offset-4 hover:underline" target="_blank" rel="noreferrer" href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=17/${r.latitude}/${r.longitude}`}>Voir la position sur la carte</a>
              {r.rejectionReason && <p className="mt-2 text-xs text-destructive">Motif du refus : {r.rejectionReason}</p>}
              <div className="mt-auto flex gap-2 pt-4">
                {status !== "APPROVED" && <Button size="sm" className="" disabled={busy === r.id} onClick={() => decide(r, "APPROVED")}><IconCheck className="mr-1 h-4 w-4" />Valider</Button>}
                {status !== "REJECTED" && <Button size="sm" variant="outline" className="text-destructive" disabled={busy === r.id} onClick={() => setReject({ r, reason: "" })}><IconX className="mr-1 h-4 w-4" />Refuser</Button>}
                {status !== "PENDING" && <Button size="sm" variant="ghost" disabled={busy === r.id} onClick={() => decide(r, "PENDING")}>Remettre en attente</Button>}
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={!!reject} onOpenChange={(o) => !o && setReject(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Refuser « {reject?.r.name} »</DialogTitle>
            <DialogDescription>Le motif sera affiché au restaurateur dans son espace.</DialogDescription>
          </DialogHeader>
          <Textarea rows={3} value={reject?.reason || ""} onChange={(e) => reject && setReject({ ...reject, reason: e.target.value })} placeholder="Ex. adresse introuvable, documents manquants…" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReject(null)}>Annuler</Button>
            <Button variant="destructive" disabled={!reject?.reason.trim()} onClick={() => { if (reject) { void decide(reject.r, "REJECTED", reject.reason.trim()); setReject(null); } }}>Refuser</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
