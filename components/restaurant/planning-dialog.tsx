"use client"

// Menus programmés : un plat ou une catégorie n'est proposé que certains jours
// de la semaine, à des dates précises ou sur une période, avec au besoin une
// plage horaire. Sans règle active, l'article reste au menu en permanence.
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconCalendarClock, IconPencil, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  restaurateurService, apiErrorMessage, apiFieldErrors, jourApi, jourLisible,
  JOURS_SEMAINE, JOUR_LABEL, type JourSemaine, type PlanningItem, type PlanningPayload, type PlanningRegle,
} from "@/services/api/restaurateur.service";

/** Cible d'une programmation : un plat ou une catégorie du restaurant. */
export type PlanningCible = { kind: "plat" | "categorie"; id: number; name: string };

type Mode = "jours" | "dates" | "periode";
type RegleForm = {
  id?: number;
  mode: Mode;
  libelle: string;
  jours: JourSemaine[];
  dates: string[];
  dateDebut: string;
  dateFin: string;
  heureDebut: string;
  heureFin: string;
};

const formVide = (): RegleForm => ({ mode: "jours", libelle: "", jours: [], dates: [], dateDebut: "", dateFin: "", heureDebut: "", heureFin: "" });

/** La règle telle qu'elle revient de l'API → formulaire (le mode se déduit du contenu). */
const formDepuisRegle = (r: PlanningRegle): RegleForm => ({
  id: r.id,
  mode: (r.dates || []).length > 0 ? "dates" : (r.jours || []).length > 0 ? "jours" : "periode",
  libelle: r.libelle || "",
  jours: r.jours || [],
  dates: (r.dates || []).map((d) => jourApi(d)).filter(Boolean).sort(),
  dateDebut: jourApi(r.dateDebut),
  dateFin: jourApi(r.dateFin),
  heureDebut: r.heureDebut || "",
  heureFin: r.heureFin || "",
});

/**
 * Corps envoyé à l'API. Tous les champs du formulaire sont transmis : en
 * modification le backend ne touche qu'aux champs présents, on lui donne donc
 * l'état complet de la règle éditée (la suspension, elle, n'envoie que `actif`).
 */
const payloadDepuisForm = (f: RegleForm): PlanningPayload => ({
  libelle: f.libelle.trim() || null,
  jours: f.mode === "jours" ? f.jours : [],
  dates: f.mode === "dates" ? f.dates : [],
  dateDebut: f.mode === "dates" ? null : f.dateDebut || null,
  dateFin: f.mode === "dates" ? null : f.dateFin || null,
  heureDebut: f.heureDebut || null,
  heureFin: f.heureFin || null,
});

const MODES: { value: Mode; titre: string; aide: string }[] = [
  { value: "jours", titre: "Jours de la semaine", aide: "Ex. le ndolé tous les mercredis et samedis." },
  { value: "dates", titre: "Dates précises", aide: "Ex. le menu des fêtes les 24 et 31 décembre." },
  { value: "periode", titre: "Période", aide: "Ex. la carte d’été, du 1er juillet au 31 août." },
];

/* ------------------------------------------------------------------ */
/* Badge « au menu aujourd'hui » / « programmé »                        */
/* ------------------------------------------------------------------ */

/** Rien pour un article permanent (sans règle active) : seul le programmé se signale. */
export function PlanningBadge({ item, className = "" }: { item?: PlanningItem | null; className?: string }) {
  if (!item?.programme) return null;
  const base = `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${className}`;
  if (item.proposeAujourdhui) {
    return <span className={`${base} bg-secondary text-secondary-foreground`}><IconCalendarClock className="h-3 w-3" />Au menu aujourd’hui</span>;
  }
  const retour = jourLisible(item.planning?.prochaineDate);
  return (
    <span className={`${base} bg-brand-cream text-brand-ink dark:text-brand-yellow`} title={item.planning?.message || undefined}>
      <IconCalendarClock className="h-3 w-3" />{retour ? `Programmé — de retour ${retour}` : "Programmé — pas aujourd’hui"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Éditeur des règles d'un plat ou d'une catégorie                      */
/* ------------------------------------------------------------------ */

export function PlanningDialog({ cible, open, onOpenChange, onChanged }: {
  cible: PlanningCible | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Appelé après toute création / modification / suppression, pour rafraîchir la page menu. */
  onChanged?: () => void;
}) {
  const [regles, setRegles] = useState<PlanningRegle[] | null>(null);
  const [resume, setResume] = useState<string | null>(null);
  const [form, setForm] = useState<RegleForm | null>(null);
  const [champs, setChamps] = useState<Record<string, string>>({});
  const [nouvelleDate, setNouvelleDate] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!cible) return;
    try {
      const r = cible.kind === "plat" ? await restaurateurService.planningPlat(cible.id) : await restaurateurService.planningCategorie(cible.id);
      setRegles(r.plannings || []);
      setResume(r.resume?.programme ? r.resume.message : null);
    } catch (e) {
      toast.error(apiErrorMessage(e, "Programmation illisible"));
      setRegles([]);
    }
  }, [cible]);

  useEffect(() => {
    if (!open || !cible) return;
    setRegles(null); setForm(null); setChamps({}); setNouvelleDate("");
    void load();
  }, [open, cible, load]);

  const save = async () => {
    if (!form || !cible) return;
    setChamps({});
    setSaving(true);
    try {
      const body = payloadDepuisForm(form);
      if (form.id) await restaurateurService.updatePlanning(form.id, body);
      else if (cible.kind === "plat") await restaurateurService.createPlanningPlat(cible.id, body);
      else await restaurateurService.createPlanningCategorie(cible.id, body);
      toast.success(form.id ? "Programmation modifiée" : "Programmation ajoutée");
      setForm(null);
      await load();
      onChanged?.();
    } catch (e) {
      setChamps(apiFieldErrors(e));
      toast.error(apiErrorMessage(e, "Programmation invalide"));
    } finally {
      setSaving(false);
    }
  };

  // Suspendre une règle : on n'envoie que le champ modifié, le backend ne
  // touche pas au reste (les jours ne sont pas effacés).
  const toggleActif = async (r: PlanningRegle) => {
    setRegles((rs) => (rs || []).map((x) => (x.id === r.id ? { ...x, actif: !r.actif } : x)));
    try {
      await restaurateurService.updatePlanning(r.id, { actif: !r.actif });
      await load();
      onChanged?.();
    } catch (e) {
      toast.error(apiErrorMessage(e));
      await load();
    }
  };

  const supprimer = async (r: PlanningRegle) => {
    try {
      await restaurateurService.deletePlanning(r.id);
      toast.success("Programmation supprimée");
      await load();
      onChanged?.();
    } catch (e) { toast.error(apiErrorMessage(e)); }
  };

  const ajouterDate = () => {
    if (!form || !/^\d{4}-\d{2}-\d{2}$/.test(nouvelleDate)) return;
    if (form.dates.includes(nouvelleDate)) { setNouvelleDate(""); return; }
    setForm({ ...form, dates: [...form.dates, nouvelleDate].sort() });
    setNouvelleDate("");
  };

  return (
    <Dialog open={open && !!cible} onOpenChange={(o) => { if (!o) setForm(null); onOpenChange(o); }}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Programmer « {cible?.name} »</DialogTitle>
          <DialogDescription>
            {cible?.kind === "plat" ? "Ce plat" : "Cette catégorie"} n’apparaîtra chez les clients que pendant les créneaux ci-dessous. Sans aucune règle active, {cible?.kind === "plat" ? "il reste" : "elle reste"} au menu en permanence.
          </DialogDescription>
        </DialogHeader>

        {/* --- Règles existantes --- */}
        {regles === null ? <div className="h-24 animate-pulse rounded bg-muted" /> : (
          <div className="space-y-2">
            {resume && <p className="rounded-lg bg-brand-cream px-3 py-2 text-sm text-brand-ink dark:text-foreground">{resume}</p>}
            {regles.length === 0 && <p className="rounded border border-dashed p-4 text-sm text-muted-foreground">Aucune programmation : {cible?.kind === "plat" ? "ce plat est proposé" : "cette catégorie est proposée"} tous les jours.</p>}
            {regles.map((r) => (
              <div key={r.id} className={`flex flex-wrap items-center gap-2 rounded-lg border bg-card px-3 py-2 ${r.actif ? "" : "opacity-60"}`}>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{r.description || r.libelle || "Règle sans critère"}</div>
                  <label className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch checked={r.actif} onCheckedChange={() => toggleActif(r)} />{r.actif ? "Active" : "Suspendue"}
                  </label>
                </div>
                <Button variant="ghost" size="icon" aria-label="Modifier la règle" onClick={() => { setChamps({}); setForm(formDepuisRegle(r)); }}><IconPencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Supprimer la règle" onClick={() => supprimer(r)}><IconTrash className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            {!form && <Button type="button" variant="outline" className="w-full" onClick={() => { setChamps({}); setForm(formVide()); }}><IconPlus className="mr-2 h-4 w-4" />Nouvelle programmation</Button>}
          </div>
        )}

        {/* --- Formulaire --- */}
        {form && (
          <div className="space-y-4 rounded-lg border bg-muted/30 p-3">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {MODES.map((m) => (
                <button key={m.value} type="button" onClick={() => setForm({ ...form, mode: m.value })}
                  className={`rounded-lg border px-3 py-2 text-left text-sm transition-colors ${form.mode === m.value ? "border-primary bg-secondary text-secondary-foreground" : "bg-card hover:bg-muted"}`}>
                  <span className="block font-medium">{m.titre}</span>
                  <span className="block text-[11px] opacity-70">{m.aide}</span>
                </button>
              ))}
            </div>

            {form.mode === "jours" && (
              <div className="space-y-1">
                <Label>Jours de service</Label>
                <div className="flex flex-wrap gap-2">
                  {JOURS_SEMAINE.map((j) => {
                    const on = form.jours.includes(j);
                    return (
                      <label key={j} className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${on ? "border-primary bg-secondary text-secondary-foreground" : "hover:bg-muted"}`}>
                        <input type="checkbox" className="sr-only" checked={on} onChange={() => setForm({ ...form, jours: on ? form.jours.filter((x) => x !== j) : [...form.jours, j] })} />
                        {JOUR_LABEL[j]}
                      </label>
                    );
                  })}
                </div>
                {champs.jours && <p className="text-xs text-destructive">{champs.jours}</p>}
                <p className="pt-1 text-[11px] text-muted-foreground">Vous pouvez en plus limiter ces jours à une période (facultatif).</p>
              </div>
            )}

            {form.mode === "dates" && (
              <div className="space-y-1">
                <Label>Dates précises</Label>
                <div className="flex flex-wrap gap-2">
                  <Input type="date" value={nouvelleDate} onChange={(e) => setNouvelleDate(e.target.value)} className="w-44" />
                  <Button type="button" variant="outline" disabled={!nouvelleDate} onClick={ajouterDate}><IconPlus className="mr-1 h-4 w-4" />Ajouter</Button>
                </div>
                {form.dates.length > 0 && (
                  <ul className="flex flex-wrap gap-2 pt-2">
                    {form.dates.map((d) => (
                      <li key={d}>
                        <button type="button" onClick={() => setForm({ ...form, dates: form.dates.filter((x) => x !== d) })}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`Retirer le ${jourLisible(d, true)}`}>
                          {jourLisible(d, true)}<IconX className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {champs.dates && <p className="text-xs text-destructive">{champs.dates}</p>}
              </div>
            )}

            {form.mode !== "dates" && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>{form.mode === "periode" ? "Début de la période" : "À partir du (facultatif)"}</Label>
                  <Input type="date" value={form.dateDebut} onChange={(e) => setForm({ ...form, dateDebut: e.target.value })} />
                  {champs.dateDebut && <p className="text-xs text-destructive">{champs.dateDebut}</p>}
                </div>
                <div className="space-y-1">
                  <Label>{form.mode === "periode" ? "Fin de la période" : "Jusqu’au (facultatif)"}</Label>
                  <Input type="date" value={form.dateFin} onChange={(e) => setForm({ ...form, dateFin: e.target.value })} />
                  {champs.dateFin && <p className="text-xs text-destructive">{champs.dateFin}</p>}
                </div>
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Servi à partir de (facultatif)</Label>
                <Input type="time" value={form.heureDebut} onChange={(e) => setForm({ ...form, heureDebut: e.target.value })} />
                {champs.heureDebut && <p className="text-xs text-destructive">{champs.heureDebut}</p>}
              </div>
              <div className="space-y-1">
                <Label>Jusqu’à (facultatif)</Label>
                <Input type="time" value={form.heureFin} onChange={(e) => setForm({ ...form, heureFin: e.target.value })} />
                {champs.heureFin && <p className="text-xs text-destructive">{champs.heureFin}</p>}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Nom de la programmation (facultatif)</Label>
              <Input value={form.libelle} onChange={(e) => setForm({ ...form, libelle: e.target.value })} placeholder="Ex. Formule déjeuner, Menu des fêtes" />
              {champs.libelle && <p className="text-xs text-destructive">{champs.libelle}</p>}
            </div>

            {champs[""] && <p className="text-xs text-destructive">{champs[""]}</p>}

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setForm(null)}>Annuler</Button>
              <Button type="button" disabled={saving} onClick={save}>{saving ? "Enregistrement…" : form.id ? "Modifier la règle" : "Ajouter la règle"}</Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fermer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
