"use client"

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { IconUserPlus, IconTrash, IconCrown, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { restaurateurService, apiErrorMessage, ROLE_LABEL, type Membre } from "@/services/api/restaurateur.service";
import { useMyRestaurant, useMyRole } from "@/components/restaurant/restaurant-shell";

type Form = { username: string; email: string; phone: string; password: string; role: "GERANT" | "CAISSE" };
const EMPTY: Form = { username: "", email: "", phone: "", password: "", role: "CAISSE" };

const ROLE_HELP: Record<"GERANT" | "CAISSE", string> = {
  GERANT: "Tout comme vous, sauf la gestion de l’équipe : commandes, menu, horaires, fiche du restaurant, pause.",
  CAISSE: "Commandes uniquement : accepter, préparer, marquer prête, refuser, mettre en pause. Pas d’accès au menu ni aux horaires.",
};

export default function EquipePage() {
  const resto = useMyRestaurant();
  const role = useMyRole();
  const [proprietaire, setProprietaire] = useState<{ id: number; username: string; email: string; phone?: string } | null>(null);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [show, setShow] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toRemove, setToRemove] = useState<Membre | null>(null);

  const load = useCallback(async () => {
    if (!resto?.id) return;
    try { const r = await restaurateurService.equipe(resto.id); setProprietaire(r.proprietaire); setMembres(r.membres || []); }
    catch (e) { toast.error(apiErrorMessage(e, "Chargement de l’équipe impossible")); }
    finally { setLoading(false); }
  }, [resto?.id]);
  useEffect(() => { void load(); }, [load]);

  const save = async () => {
    if (!form || !resto?.id) return;
    if (form.username.trim().length < 2) { toast.error("Indiquez le nom de la personne."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { toast.error("Adresse email invalide."); return; }
    if (form.phone.replace(/\D/g, "").length < 8) { toast.error("Téléphone trop court."); return; }
    if (form.password.length < 8) { toast.error("Mot de passe : 8 caractères minimum."); return; }
    setSaving(true);
    try {
      const r = await restaurateurService.ajouterMembre(resto.id, { ...form, username: form.username.trim(), email: form.email.trim().toLowerCase(), phone: form.phone.trim() });
      toast.success(r.compteExistant ? "Ce compte existait déjà : il est maintenant rattaché à votre restaurant." : `Compte créé pour ${form.username}. Transmettez-lui son email et son mot de passe.`);
      setForm(null); await load();
    } catch (e) { toast.error(apiErrorMessage(e)); } finally { setSaving(false); }
  };

  const changeRole = async (m: Membre, r: "GERANT" | "CAISSE") => {
    if (!resto?.id) return;
    setMembres((ms) => ms.map((x) => x.id === m.id ? { ...x, role: r } : x));
    try { await restaurateurService.modifierMembre(resto.id, m.id, r); toast.success(`${m.username} est maintenant ${ROLE_LABEL[r].toLowerCase()}`); }
    catch (e) { toast.error(apiErrorMessage(e)); await load(); }
  };

  const remove = async () => {
    if (!toRemove || !resto?.id) return;
    try { await restaurateurService.retirerMembre(resto.id, toRemove.id); toast.success(`Accès retiré à ${toRemove.username}`); await load(); }
    catch (e) { toast.error(apiErrorMessage(e)); } finally { setToRemove(null); }
  };

  if (!resto) return <div className="text-muted-foreground">Aucun restaurant associé à ce compte.</div>;
  if (role !== "PROPRIETAIRE") return <div className="text-muted-foreground">Seul le propriétaire du restaurant gère l’équipe.</div>;

  return (
    <div className="grid max-w-5xl gap-6 lg:grid-cols-[1fr_20rem]">
      <Card>
        <CardHeader className="flex-row items-start justify-between gap-3">
          <div><CardTitle>Équipe de {resto.name}</CardTitle><CardDescription>Chaque personne se connecte avec son propre email et voit uniquement ce que son rôle permet.</CardDescription></div>
          <Button className="rounded-full" onClick={() => { setForm(EMPTY); setShow(false); }}><IconUserPlus className="mr-2 h-4 w-4" />Ajouter un compte</Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? <div className="m-4 h-32 animate-pulse rounded-lg bg-muted" /> : (
            <ul className="divide-y">
              {proprietaire && (
                <li className="flex items-center gap-3 px-5 py-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-cream text-brand-ink"><IconCrown className="h-4 w-4" /></span>
                  <div className="min-w-0 flex-1"><div className="truncate font-medium">{proprietaire.username}</div><div className="truncate text-xs text-muted-foreground">{proprietaire.email}{proprietaire.phone ? ` · ${proprietaire.phone}` : ""}</div></div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">Propriétaire</span>
                </li>
              )}
              {membres.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-muted font-display text-xs font-bold">{m.username.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()}</span>
                  <div className="min-w-0 flex-1"><div className="truncate font-medium">{m.username}</div><div className="truncate text-xs text-muted-foreground">{m.email}{m.phone ? ` · ${m.phone}` : ""}</div></div>
                  <select className="h-9 rounded-md border border-input bg-transparent px-2 text-sm" value={m.role} onChange={(e) => changeRole(m, e.target.value as "GERANT" | "CAISSE")}>
                    <option value="GERANT">Gérant</option>
                    <option value="CAISSE">Caisse</option>
                  </select>
                  <Button variant="ghost" size="icon" aria-label="Retirer" onClick={() => setToRemove(m)}><IconTrash className="h-4 w-4 text-destructive" /></Button>
                </li>
              ))}
              {membres.length === 0 && <li className="px-5 py-8 text-center text-sm text-muted-foreground">Vous êtes seul sur ce restaurant. Ajoutez un gérant ou un compte caisse pour partager le travail.</li>}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader><CardTitle>Les rôles</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div><b>Propriétaire</b><p className="text-muted-foreground">Vous. Tout, y compris cette page.</p></div>
          <div><b>Gérant</b><p className="text-muted-foreground">{ROLE_HELP.GERANT}</p></div>
          <div><b>Caisse</b><p className="text-muted-foreground">{ROLE_HELP.CAISSE}</p></div>
          <p className="text-xs text-muted-foreground">Retirer un accès ne supprime pas le compte de la personne, elle ne voit simplement plus votre restaurant.</p>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={(o) => !o && setForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Ajouter un compte</DialogTitle><DialogDescription>Un compte existant (même email) sera simplement rattaché à votre restaurant.</DialogDescription></DialogHeader>
          {form && (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1 sm:col-span-2"><Label>Nom et prénom</Label><Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
              <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
              <div className="space-y-1"><Label>Téléphone</Label><Input type="tel" placeholder="6XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
              <div className="space-y-1 sm:col-span-2"><Label>Mot de passe provisoire</Label>
                <div className="relative"><Input type={show ? "text" : "password"} className="pr-11" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /><button type="button" className="absolute right-1 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => setShow((s) => !s)} aria-label="Afficher">{show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}</button></div>
                <p className="text-[11px] text-muted-foreground">8 caractères minimum. La personne pourra le changer via « Mot de passe oublié ».</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Rôle</Label>
                <div className="grid grid-cols-2 gap-2">
                  {(["GERANT", "CAISSE"] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })} className={`rounded-xl border p-3 text-left text-sm transition-colors ${form.role === r ? "border-primary bg-secondary" : "hover:bg-muted"}`}>
                      <b>{ROLE_LABEL[r]}</b><p className="mt-1 text-xs text-muted-foreground">{ROLE_HELP[r]}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setForm(null)}>Annuler</Button>
            <Button disabled={saving} onClick={save}>{saving ? "Création…" : "Créer le compte"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toRemove} onOpenChange={(o) => !o && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Retirer l’accès de {toRemove?.username} ?</AlertDialogTitle><AlertDialogDescription>La personne ne pourra plus se connecter à votre restaurant. Son compte n’est pas supprimé.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Annuler</AlertDialogCancel><AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={remove}>Retirer</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
