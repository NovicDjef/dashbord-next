"use client"

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { setRestaurants } from "@/redux/adminAuthSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyRestaurant } from "@/components/restaurant/restaurant-shell";
import { restaurateurService, apiErrorMessage } from "@/services/api/restaurateur.service";

const JOURS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const DELAIS = [0, 15, 30, 45, 60, 90, 120];
type Row = { jour: string; ouvert: boolean; debut: string; fin: string };

// Format stocké côté backend : "09:00-22:00" ou "Fermé"
const parse = (heures: string): { ouvert: boolean; debut: string; fin: string } => {
  const m = /^(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})$/.exec((heures || "").trim());
  return m ? { ouvert: true, debut: m[1].padStart(5, "0"), fin: m[2].padStart(5, "0") } : { ouvert: false, debut: "09:00", fin: "22:00" };
};

export default function HorairesPage() {
  const mine = useMyRestaurant();
  const [rows, setRows] = useState<Row[]>(JOURS.map((jour) => ({ jour, ouvert: true, debut: "09:00", fin: "22:00" })));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();
  const [delai, setDelai] = useState<number>(mine?.delaiFermetureCommandeMin ?? 0);
  useEffect(() => { setDelai(mine?.delaiFermetureCommandeMin ?? 0); }, [mine?.delaiFermetureCommandeMin]);

  useEffect(() => {
    if (!mine?.id) return;
    restaurateurService.horaires(mine.id).then((list) => {
      if (Array.isArray(list) && list.length) {
        setRows(JOURS.map((jour) => {
          const h = list.find((x) => (x.jour || "").toLowerCase() === jour.toLowerCase());
          return { jour, ...(h ? parse(h.heures) : { ouvert: false, debut: "09:00", fin: "22:00" }) };
        }));
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [mine?.id]);

  const save = async () => {
    if (!mine?.id) return;
    setSaving(true);
    try {
      await restaurateurService.saveHoraires(mine.id, rows.map((r) => ({ jour: r.jour, heures: r.ouvert ? `${r.debut}-${r.fin}` : "Fermé" })));
      if (delai !== (mine.delaiFermetureCommandeMin ?? 0)) {
        await restaurateurService.updateRestaurant(mine.id, { delaiFermetureCommandeMin: delai });
        const fresh = await restaurateurService.me();
        dispatch(setRestaurants(fresh.restaurants));
      }
      toast.success("Horaires enregistrés");
    } catch (e) {
      toast.error(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  const applyToAll = () => setRows((rs) => rs.map((r) => ({ ...r, ouvert: rs[0].ouvert, debut: rs[0].debut, fin: rs[0].fin })));

  // Aperçu de la règle de fermeture des commandes sur le premier jour ouvert
  const sample = rows.find((r) => r.ouvert);
  const cutoff = (() => { if (!sample) return null; const [h, m] = sample.fin.split(":").map(Number); const t = h * 60 + m - delai; const hh = Math.floor(((t % 1440) + 1440) % 1440 / 60), mm = ((t % 60) + 60) % 60; return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`; })();

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
    <Card>
      <CardHeader>
        <CardTitle>Horaires d’ouverture</CardTitle>
        <CardDescription>Les clients ne peuvent commander que pendant vos heures d’ouverture.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? <div className="h-64 animate-pulse rounded bg-muted" /> : (
          <div className="space-y-2">
            {rows.map((r, i) => (
              <div key={r.jour} className="grid grid-cols-[7rem_auto_1fr] items-center gap-3 rounded border px-3 py-2">
                <span className="font-medium">{r.jour}</span>
                <label className="flex items-center gap-2 text-sm"><Switch checked={r.ouvert} onCheckedChange={(v) => setRows(rows.map((x, j) => j === i ? { ...x, ouvert: v } : x))} />{r.ouvert ? "Ouvert" : "Fermé"}</label>
                <div className={`flex items-center gap-2 ${r.ouvert ? "" : "opacity-40"}`}>
                  <Input type="time" value={r.debut} disabled={!r.ouvert} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, debut: e.target.value } : x))} className="w-32" />
                  <span className="text-muted-foreground">à</span>
                  <Input type="time" value={r.fin} disabled={!r.ouvert} onChange={(e) => setRows(rows.map((x, j) => j === i ? { ...x, fin: e.target.value } : x))} className="w-32" />
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-2">
              <Button type="button" variant="outline" onClick={applyToAll}>Appliquer le lundi à tous les jours</Button>
              <Button type="button" className="" disabled={saving} onClick={save}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Fin des commandes</CardTitle>
        <CardDescription>Arrêtez de recevoir des commandes un peu avant la fermeture, le temps de finir le service. Les clients voient un compte à rebours, puis le restaurant se grise automatiquement.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {DELAIS.map((d) => (
            <button key={d} type="button" onClick={() => setDelai(d)} className={`rounded-lg border px-2 py-2 text-sm font-medium transition-colors ${delai === d ? "border-primary bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>{d === 0 ? "Aucun" : `${d} min`}</button>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          {delai === 0 ? "Les commandes restent possibles jusqu’à l’heure de fermeture." : sample ? `Exemple : ${sample.jour}, fermeture à ${sample.fin} → dernières commandes à ${cutoff}.` : "Aucun jour ouvert pour l’instant."}
        </p>
        <p className="text-xs text-muted-foreground">Enregistré avec les horaires via le bouton « Enregistrer ».</p>
      </CardContent>
    </Card>
    </div>
  );
}
