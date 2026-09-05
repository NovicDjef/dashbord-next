"use client"

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster } from "@/components/ui/sonner";
import { tarifService, apiErrorMessage, type TarifConfig } from "@/services/api/restaurateur.service";
import { formatFcfa } from "@/lib/order-status";

const TYPES: TarifConfig["typeLivraison"][] = ["REPAS", "COLIS", "GAZ"];
const DEFAULTS: Record<string, TarifConfig> = {
  REPAS: { typeLivraison: "REPAS", prixBase: 500, franchiseKm: 2, prixParKm: 50, multiplicateurWeekend: 1, multiplicateurNuit: 1, actif: true },
  COLIS: { typeLivraison: "COLIS", prixBase: 800, franchiseKm: 2, prixParKm: 100, multiplicateurWeekend: 1, multiplicateurNuit: 1, actif: true },
  GAZ: { typeLivraison: "GAZ", prixBase: 500, franchiseKm: 2, prixParKm: 50, multiplicateurWeekend: 1, multiplicateurNuit: 1, actif: true },
};

// Même formule que services/deliveryPricing.js côté backend (aperçu local, hors majorations)
const preview = (t: TarifConfig, km: number) => Math.round(t.prixBase + Math.max(0, Math.ceil(km - t.franchiseKm)) * t.prixParKm);

export default function TarificationPage() {
  const [tarifs, setTarifs] = useState<Record<string, TarifConfig>>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [simKm, setSimKm] = useState("5");
  const [sim, setSim] = useState<{ fraisLivraison: number } | null>(null);

  useEffect(() => {
    tarifService.config().then((r) => {
      const next = { ...DEFAULTS };
      (r.tarifs || []).forEach((t) => { next[t.typeLivraison] = { ...DEFAULTS[t.typeLivraison], ...t }; });
      setTarifs(next);
    }).catch((e) => toast.error(apiErrorMessage(e))).finally(() => setLoading(false));
  }, []);

  const set = (type: string, field: keyof TarifConfig, value: any) => setTarifs((t) => ({ ...t, [type]: { ...t[type], [field]: value } }));

  const save = async (type: string) => {
    const t = tarifs[type];
    for (const f of ["prixBase", "franchiseKm", "prixParKm", "multiplicateurWeekend", "multiplicateurNuit"] as const) {
      if (!Number.isFinite(Number(t[f])) || Number(t[f]) < 0) { toast.error(`Valeur invalide : ${f}`); return; }
    }
    setSaving(type);
    try {
      await tarifService.save(type, { prixBase: Number(t.prixBase), franchiseKm: Number(t.franchiseKm), prixParKm: Number(t.prixParKm), multiplicateurWeekend: Number(t.multiplicateurWeekend), multiplicateurNuit: Number(t.multiplicateurNuit), actif: t.actif });
      toast.success(`Tarif ${type} enregistré (pris en compte sous 60 s)`);
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSaving(null);
    }
  };

  const simulate = async () => {
    try {
      const r = await tarifService.estimation({ distanceKm: Number(simKm) || 0, type: "REPAS" });
      setSim(r);
    } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <Toaster position="top-right" richColors />
      <div>
        <h2 className="text-xl font-semibold">Tarification des livraisons</h2>
        <p className="text-sm text-muted-foreground">Règle : prix de base jusqu'à la distance incluse, puis supplément par kilomètre entamé. Les majorations valent 1,00 quand elles sont désactivées.</p>
      </div>

      {loading ? <div className="h-64 animate-pulse rounded-lg bg-muted" /> : (
        <div className="grid gap-4 lg:grid-cols-3">
          {TYPES.map((type) => {
            const t = tarifs[type];
            return (
              <Card key={type}>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div><CardTitle>{type}</CardTitle><CardDescription>Distance restaurant → client</CardDescription></div>
                  <label className="flex items-center gap-2 text-sm"><Switch checked={t.actif} onCheckedChange={(v) => set(type, "actif", v)} />Actif</label>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1"><Label className="text-xs">Base (F)</Label><Input type="number" min={0} step={50} value={t.prixBase} onChange={(e) => set(type, "prixBase", e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">Km inclus</Label><Input type="number" min={0} step={0.5} value={t.franchiseKm} onChange={(e) => set(type, "franchiseKm", e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">F / km</Label><Input type="number" min={0} step={10} value={t.prixParKm} onChange={(e) => set(type, "prixParKm", e.target.value)} /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><Label className="text-xs">× week-end</Label><Input type="number" min={0.5} max={3} step={0.05} value={t.multiplicateurWeekend} onChange={(e) => set(type, "multiplicateurWeekend", e.target.value)} /></div>
                    <div className="space-y-1"><Label className="text-xs">× nuit (20h–6h)</Label><Input type="number" min={0.5} max={3} step={0.05} value={t.multiplicateurNuit} onChange={(e) => set(type, "multiplicateurNuit", e.target.value)} /></div>
                  </div>
                  <table className="w-full text-xs text-muted-foreground">
                    <tbody>
                      {[1, 3, 5, 10].map((km) => <tr key={km}><td>{km} km</td><td className="text-right tabular-nums text-foreground">{formatFcfa(preview({ ...t, prixBase: Number(t.prixBase), franchiseKm: Number(t.franchiseKm), prixParKm: Number(t.prixParKm) }, km))}</td></tr>)}
                    </tbody>
                  </table>
                  <Button className="w-full" disabled={saving === type} onClick={() => save(type)}>{saving === type ? "Enregistrement…" : "Enregistrer"}</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="max-w-md">
        <CardHeader><CardTitle>Simulateur (règle active côté serveur)</CardTitle></CardHeader>
        <CardContent className="flex items-end gap-3">
          <div className="space-y-1"><Label>Distance (km)</Label><Input type="number" min={0} step={0.1} value={simKm} onChange={(e) => setSimKm(e.target.value)} className="w-32" /></div>
          <Button variant="outline" onClick={simulate}>Calculer</Button>
          {sim && <div className="text-lg font-semibold tabular-nums">{formatFcfa(sim.fraisLivraison)}</div>}
        </CardContent>
      </Card>
    </div>
  );
}
