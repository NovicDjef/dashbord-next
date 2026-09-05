"use client"

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";
import { IconUpload } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPicker } from "@/components/map-picker";
import { useMyRestaurant } from "@/components/restaurant/restaurant-shell";
import { restaurateurService, apiErrorMessage, type Restaurant } from "@/services/api/restaurateur.service";
import { setRestaurants } from "@/redux/adminAuthSlice";
import { getImageUrl } from "@/services/urlApp";

export default function RestaurantProfilPage() {
  const dispatch = useDispatch();
  const mine = useMyRestaurant();
  const [resto, setResto] = useState<Restaurant | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", adresse: "", description: "", delaiPreparationMin: 20, latitude: 0, longitude: 0 });
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!mine?.id) return;
    restaurateurService.getRestaurant(mine.id).then((r) => {
      setResto(r);
      setForm({ name: r.name || "", phone: r.phone || "", adresse: r.adresse || "", description: r.description || "", delaiPreparationMin: r.delaiPreparationMin ?? 20, latitude: r.latitude, longitude: r.longitude });
    }).catch((e) => toast.error(apiErrorMessage(e)));
  }, [mine?.id]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resto) return;
    setSaving(true);
    try {
      await restaurateurService.updateRestaurant(resto.id, form, image);
      const fresh = await restaurateurService.me();
      dispatch(setRestaurants(fresh.restaurants));
      toast.success("Restaurant mis à jour");
      setImage(null); setPreview(null);
    } catch (err) {
      toast.error(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (!mine) return <div className="text-muted-foreground">Aucun restaurant associé à ce compte.</div>;
  if (!resto) return <div className="h-64 animate-pulse rounded-lg bg-muted" />;

  const imgSrc = preview || (resto.image ? getImageUrl(resto.image) : null);

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Informations</CardTitle><CardDescription>Visibles par les clients dans l'application.</CardDescription></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            {imgSrc ? <img src={imgSrc} alt="" className="h-20 w-20 rounded-lg border object-cover" /> : <div className="h-20 w-20 rounded-lg border bg-muted" />}
            <label className="flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-muted">
              <IconUpload className="h-4 w-4" /> Changer la photo
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setImage(f); setPreview(f ? URL.createObjectURL(f) : null); }} />
            </label>
          </div>
          <div className="space-y-2"><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} required /></div>
          <div className="space-y-2"><Label>Temps de préparation moyen (min)</Label><Input type="number" min={5} max={180} value={form.delaiPreparationMin} onChange={(e) => setForm({ ...form, delaiPreparationMin: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>Description</Label><Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <dl className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
            <dt>Statut</dt><dd className="font-medium text-foreground">{resto.validationStatus === "APPROVED" ? "Validé" : resto.validationStatus === "PENDING" ? "En attente de validation" : "Refusé"}</dd>
            <dt>Note</dt><dd className="text-foreground">{resto.ratings ?? 0} / 5</dd>
          </dl>
        </CardContent>
      </Card>
      <Card className="lg:col-span-3">
        <CardHeader><CardTitle>Position</CardTitle><CardDescription>Détermine votre visibilité auprès des clients proches et les frais de livraison calculés.</CardDescription></CardHeader>
        <CardContent>
          <MapPicker lat={form.latitude} lng={form.longitude} onChange={(lat, lng) => setForm({ ...form, latitude: lat, longitude: lng })} height={380} />
          <div className="mt-4 flex justify-end">
            <Button type="submit" className="" disabled={saving}>{saving ? "Enregistrement…" : "Enregistrer"}</Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
