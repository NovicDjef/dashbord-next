"use client"

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconPlus, IconPencil, IconTrash, IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useMyRestaurant } from "@/components/restaurant/restaurant-shell";
import { restaurateurService, apiErrorMessage, type Categorie, type Plat, type Complement } from "@/services/api/restaurateur.service";
import { formatFcfa } from "@/lib/order-status";
import { getImageUrl } from "@/services/urlApp";

type PlatForm = { id?: number; name: string; prix: string; description: string; categorieId: string; disponible: boolean; stock: string };
const stockLabel = (p: Plat) => (p.stock === null || p.stock === undefined ? null : p.stock <= 0 ? "Épuisé" : `Reste ${p.stock}`);
type CatForm = { id?: number; name: string; description: string };
type CompForm = { id?: number; name: string; price: string };

function ImageInput({ file, current, onChange }: { file: File | null; current?: string | null; onChange: (f: File | null) => void }) {
  const src = file ? URL.createObjectURL(file) : getImageUrl(current || "") || null;
  return (
    <div className="flex items-center gap-3">
      {src ? <img src={src} alt="" className="h-14 w-14 rounded border object-cover" /> : <div className="h-14 w-14 rounded border bg-muted" />}
      <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
        <IconUpload className="h-4 w-4" /> {file ? file.name : "Choisir une image"}
        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onChange(e.target.files?.[0] || null)} />
      </label>
    </div>
  );
}

export default function MenuPage() {
  const mine = useMyRestaurant();
  const restaurantId = mine?.id;
  const [cats, setCats] = useState<Categorie[]>([]);
  const [plats, setPlats] = useState<Plat[]>([]);
  const [comps, setComps] = useState<Complement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [platForm, setPlatForm] = useState<PlatForm | null>(null);
  const [catForm, setCatForm] = useState<CatForm | null>(null);
  const [compForm, setCompForm] = useState<CompForm | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [toDelete, setToDelete] = useState<{ kind: "plat" | "cat" | "comp"; id: number; name: string } | null>(null);
  const [filterCat, setFilterCat] = useState<string>("all");

  const load = useCallback(async () => {
    if (!restaurantId) return;
    try {
      const [c, p, k] = await Promise.all([restaurateurService.categories(), restaurateurService.plats(), restaurateurService.complements()]);
      const myCats = (Array.isArray(c) ? c : (c as any)?.categories || []).filter((x: Categorie) => x.restaurantId === restaurantId);
      const catIds = new Set(myCats.map((x: Categorie) => x.id));
      const allPlats: Plat[] = Array.isArray(p) ? p : (p as any)?.plats || [];
      const allComps: Complement[] = Array.isArray(k) ? k : (k as any)?.complements || [];
      setCats(myCats);
      setPlats(allPlats.filter((x) => x.categorieId != null && catIds.has(x.categorieId)));
      setComps(allComps.filter((x) => x.restaurantId === restaurantId));
    } catch (e) {
      toast.error(apiErrorMessage(e, "Chargement du menu impossible"));
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => { void load(); }, [load]);

  const catName = useMemo(() => Object.fromEntries(cats.map((c) => [c.id, c.name])), [cats]);
  const visiblePlats = filterCat === "all" ? plats : plats.filter((p) => String(p.categorieId) === filterCat);

  // --- Plats
  const savePlat = async () => {
    if (!platForm) return;
    const prix = Number(platForm.prix);
    if (!platForm.name.trim() || !Number.isFinite(prix) || prix < 0 || !platForm.categorieId) { toast.error("Nom, prix et catégorie requis"); return; }
    setSaving(true);
    try {
      const stockTrim = platForm.stock.trim();
      if (stockTrim !== "" && (!/^\d+$/.test(stockTrim))) { toast.error("La quantité du jour doit être un nombre entier, ou vide pour illimité."); setSaving(false); return; }
      const data = { name: platForm.name.trim(), prix, description: platForm.description.trim(), categorieId: Number(platForm.categorieId), disponible: platForm.disponible, stock: stockTrim === "" ? "" : Number(stockTrim) };
      if (platForm.id) await restaurateurService.updatePlat(platForm.id, data, file);
      else await restaurateurService.createPlat(data, file);
      toast.success(platForm.id ? "Plat modifié" : "Plat ajouté");
      setPlatForm(null); setFile(null); await load();
    } catch (e) { toast.error(apiErrorMessage(e)); } finally { setSaving(false); }
  };
  const toggleDispo = async (p: Plat) => {
    setPlats((ps) => ps.map((x) => x.id === p.id ? { ...x, disponible: !p.disponible } : x));
    try { await restaurateurService.setPlatDisponible(p.id, !p.disponible); }
    catch (e) { toast.error(apiErrorMessage(e)); await load(); }
  };

  // --- Catégories
  const saveCat = async () => {
    if (!catForm || !restaurantId) return;
    if (!catForm.name.trim()) { toast.error("Nom requis"); return; }
    setSaving(true);
    try {
      if (catForm.id) await restaurateurService.updateCategorie(catForm.id, { name: catForm.name.trim(), description: catForm.description.trim() }, file);
      else await restaurateurService.createCategorie({ name: catForm.name.trim(), description: catForm.description.trim(), restaurantId }, file);
      toast.success(catForm.id ? "Catégorie modifiée" : "Catégorie ajoutée");
      setCatForm(null); setFile(null); await load();
    } catch (e) { toast.error(apiErrorMessage(e)); } finally { setSaving(false); }
  };

  // --- Compléments
  const saveComp = async () => {
    if (!compForm || !restaurantId) return;
    const price = Number(compForm.price);
    if (!compForm.name.trim() || !Number.isFinite(price) || price < 0) { toast.error("Nom et prix requis"); return; }
    setSaving(true);
    try {
      if (compForm.id) await restaurateurService.updateComplement(compForm.id, { name: compForm.name.trim(), price });
      else await restaurateurService.createComplement({ name: compForm.name.trim(), price, restaurantId });
      toast.success(compForm.id ? "Complément modifié" : "Complément ajouté");
      setCompForm(null); await load();
    } catch (e) { toast.error(apiErrorMessage(e)); } finally { setSaving(false); }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      if (toDelete.kind === "plat") await restaurateurService.deletePlat(toDelete.id);
      else if (toDelete.kind === "cat") await restaurateurService.deleteCategorie(toDelete.id);
      else await restaurateurService.deleteComplement(toDelete.id);
      toast.success("Supprimé");
      await load();
    } catch (e) { toast.error(apiErrorMessage(e)); } finally { setToDelete(null); }
  };

  if (!restaurantId) return <div className="text-muted-foreground">Aucun restaurant associé à ce compte.</div>;

  return (
    <Tabs defaultValue="plats" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="plats">Plats <Badge variant="secondary" className="ml-2">{plats.length}</Badge></TabsTrigger>
          <TabsTrigger value="categories">Catégories <Badge variant="secondary" className="ml-2">{cats.length}</Badge></TabsTrigger>
          <TabsTrigger value="complements">Compléments <Badge variant="secondary" className="ml-2">{comps.length}</Badge></TabsTrigger>
        </TabsList>
      </div>

      {/* ---------------- Plats ---------------- */}
      <TabsContent value="plats" className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <select className="h-9 rounded-md border border-input bg-transparent px-3 text-sm" value={filterCat} onChange={(e) => setFilterCat(e.target.value)}>
            <option value="all">Toutes les catégories</option>
            {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <Button className="" disabled={cats.length === 0} onClick={() => { setFile(null); setPlatForm({ name: "", prix: "", description: "", categorieId: filterCat !== "all" ? filterCat : String(cats[0]?.id || ""), disponible: true, stock: "" }); }}>
            <IconPlus className="mr-2 h-4 w-4" />Nouveau plat
          </Button>
        </div>
        {cats.length === 0 && !loading && <p className="rounded border border-dashed p-4 text-sm text-muted-foreground">Créez d’abord une catégorie (ex. Plats, Boissons, Desserts) dans l’onglet Catégories.</p>}
        {loading ? <div className="h-48 animate-pulse rounded bg-muted" /> : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {visiblePlats.map((p) => (
              <article key={p.id} className={`relative flex gap-3 rounded-lg border bg-card p-3 ${p.disponible && !(p.stock !== null && p.stock !== undefined && p.stock <= 0) ? "" : "opacity-60 grayscale"}`}>
                {stockLabel(p) && <span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[11px] font-semibold ${(p.stock ?? 1) <= 0 ? "bg-destructive/10 text-destructive" : (p.stock ?? 0) <= 3 ? "bg-brand-cream text-brand-ink" : "bg-secondary text-secondary-foreground"}`}>{stockLabel(p)}</span>}
                {p.image ? <img src={getImageUrl(p.image) || ""} alt="" className="h-20 w-20 shrink-0 rounded object-cover" /> : <div className="h-20 w-20 shrink-0 rounded bg-muted" />}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-muted-foreground">{p.categorieId != null ? catName[p.categorieId] : "Sans catégorie"}</div>
                    </div>
                    <b className={`tabular-nums ${stockLabel(p) ? "mr-16" : ""}`}>{formatFcfa(p.prix)}</b>
                  </div>
                  {p.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{p.description}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs"><Switch checked={!!p.disponible} onCheckedChange={() => toggleDispo(p)} />{p.disponible ? "Disponible" : "Rupture"}</label>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => { setFile(null); setPlatForm({ id: p.id, name: p.name, prix: String(p.prix), description: p.description || "", categorieId: String(p.categorieId ?? ""), disponible: !!p.disponible, stock: p.stock === null || p.stock === undefined ? "" : String(p.stock) }); }}><IconPencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => setToDelete({ kind: "plat", id: p.id, name: p.name })}><IconTrash className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
            {visiblePlats.length === 0 && cats.length > 0 && <p className="text-sm text-muted-foreground">Aucun plat dans cette catégorie.</p>}
          </div>
        )}
      </TabsContent>

      {/* ---------------- Catégories ---------------- */}
      <TabsContent value="categories" className="space-y-3">
        <div className="flex justify-end">
          <Button className="" onClick={() => { setFile(null); setCatForm({ name: "", description: "" }); }}><IconPlus className="mr-2 h-4 w-4" />Nouvelle catégorie</Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {cats.map((c) => (
            <article key={c.id} className="flex items-center gap-3 rounded-lg border bg-card p-3">
              {c.image ? <img src={getImageUrl(c.image) || ""} alt="" className="h-14 w-14 rounded object-cover" /> : <div className="h-14 w-14 rounded bg-muted" />}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{c.name}</div>
                <div className="text-xs text-muted-foreground">{plats.filter((p) => p.categorieId === c.id).length} plat(s)</div>
              </div>
              <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => { setFile(null); setCatForm({ id: c.id, name: c.name, description: c.description || "" }); }}><IconPencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => setToDelete({ kind: "cat", id: c.id, name: c.name })}><IconTrash className="h-4 w-4 text-destructive" /></Button>
            </article>
          ))}
          {cats.length === 0 && !loading && <p className="text-sm text-muted-foreground">Aucune catégorie.</p>}
        </div>
      </TabsContent>

      {/* ---------------- Compléments ---------------- */}
      <TabsContent value="complements" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-muted-foreground">Suppléments proposés avec les plats (sauce, boisson, portion…).</p>
          <Button className="" onClick={() => setCompForm({ name: "", price: "" })}><IconPlus className="mr-2 h-4 w-4" />Nouveau complément</Button>
        </div>
        <div className="divide-y rounded-lg border bg-card">
          {comps.map((k) => (
            <div key={k.id} className="flex items-center gap-3 px-3 py-2">
              <span className="flex-1 font-medium">{k.name}</span>
              <span className="tabular-nums">{formatFcfa(k.price)}</span>
              <Button variant="ghost" size="icon" aria-label="Modifier" onClick={() => setCompForm({ id: k.id, name: k.name, price: String(k.price) })}><IconPencil className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" aria-label="Supprimer" onClick={() => setToDelete({ kind: "comp", id: k.id, name: k.name })}><IconTrash className="h-4 w-4 text-destructive" /></Button>
            </div>
          ))}
          {comps.length === 0 && <p className="p-3 text-sm text-muted-foreground">Aucun complément.</p>}
        </div>
      </TabsContent>

      {/* ---------------- Dialogs ---------------- */}
      <Dialog open={!!platForm} onOpenChange={(o) => !o && setPlatForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{platForm?.id ? "Modifier le plat" : "Nouveau plat"}</DialogTitle></DialogHeader>
          {platForm && (
            <div className="space-y-3">
              <ImageInput file={file} current={plats.find((p) => p.id === platForm.id)?.image} onChange={setFile} />
              <div className="space-y-1"><Label>Nom</Label><Input value={platForm.name} onChange={(e) => setPlatForm({ ...platForm, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>Prix (FCFA)</Label><Input type="number" min={0} step={50} value={platForm.prix} onChange={(e) => setPlatForm({ ...platForm, prix: e.target.value })} /></div>
                <div className="space-y-1"><Label>Catégorie</Label>
                  <select className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={platForm.categorieId} onChange={(e) => setPlatForm({ ...platForm, categorieId: e.target.value })}>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1"><Label>Description</Label><Textarea rows={3} value={platForm.description} onChange={(e) => setPlatForm({ ...platForm, description: e.target.value })} /></div>
              <div className="grid grid-cols-2 items-end gap-3">
                <div className="space-y-1">
                  <Label>Quantité du jour</Label>
                  <Input type="number" min={0} step={1} inputMode="numeric" placeholder="Illimité" value={platForm.stock} onChange={(e) => setPlatForm({ ...platForm, stock: e.target.value })} />
                  <p className="text-[11px] text-muted-foreground">Vide = illimité. À 0, le plat se grise automatiquement chez les clients.</p>
                </div>
                <label className="flex items-center gap-2 pb-5 text-sm"><Switch checked={platForm.disponible} onCheckedChange={(v) => setPlatForm({ ...platForm, disponible: v })} />Disponible à la commande</label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPlatForm(null)}>Annuler</Button>
            <Button className="" disabled={saving} onClick={savePlat}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!catForm} onOpenChange={(o) => !o && setCatForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{catForm?.id ? "Modifier la catégorie" : "Nouvelle catégorie"}</DialogTitle></DialogHeader>
          {catForm && (
            <div className="space-y-3">
              <ImageInput file={file} current={cats.find((c) => c.id === catForm.id)?.image} onChange={setFile} />
              <div className="space-y-1"><Label>Nom</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} placeholder="Ex. Plats, Boissons, Desserts" /></div>
              <div className="space-y-1"><Label>Description</Label><Textarea rows={2} value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatForm(null)}>Annuler</Button>
            <Button className="" disabled={saving} onClick={saveCat}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!compForm} onOpenChange={(o) => !o && setCompForm(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>{compForm?.id ? "Modifier le complément" : "Nouveau complément"}</DialogTitle></DialogHeader>
          {compForm && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1"><Label>Nom</Label><Input value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} /></div>
              <div className="space-y-1"><Label>Prix (FCFA)</Label><Input type="number" min={0} step={50} value={compForm.price} onChange={(e) => setCompForm({ ...compForm, price: e.target.value })} /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCompForm(null)}>Annuler</Button>
            <Button className="" disabled={saving} onClick={saveComp}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {toDelete?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete?.kind === "cat" ? "Les plats de cette catégorie seront aussi supprimés." : "Cette action est définitive."}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-white hover:bg-destructive/90" onClick={confirmDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Tabs>
  );
}
