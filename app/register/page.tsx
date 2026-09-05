"use client"

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { IconUpload, IconCheck } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Toaster } from "@/components/ui/sonner";
import { MapPicker, DEFAULT_POSITION } from "@/components/map-picker";
import { AuthShell } from "@/components/site/auth-shell";
import { restaurateurService, apiErrorMessage } from "@/services/api/restaurateur.service";
import { setSession } from "@/redux/adminAuthSlice";

type Ville = { id: number; name: string };

const STEPS = ["Votre compte", "Votre restaurant"];

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [villes, setVilles] = useState<Ville[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [account, setAccount] = useState({ username: "", email: "", phone: "", password: "", confirm: "" });
  const [resto, setResto] = useState({
    name: "", adresse: "", description: "", phone: "", villeId: "", delaiPreparationMin: "20",
    latitude: DEFAULT_POSITION.lat, longitude: DEFAULT_POSITION.lng,
  });

  useEffect(() => {
    restaurateurService.villes()
      .then((r: any) => setVilles(Array.isArray(r) ? r : r?.villes || []))
      .catch(() => setVilles([]));
  }, []);

  const onImage = (f: File | null) => {
    setImage(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const validStep1 = () => {
    if (account.username.trim().length < 2) return "Indiquez le nom du responsable.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(account.email)) return "Cette adresse email n'est pas valide.";
    if (account.phone.replace(/\D/g, "").length < 8) return "Ce numéro de téléphone est trop court.";
    if (account.password.length < 8) return "Le mot de passe doit faire au moins 8 caractères.";
    if (account.password !== account.confirm) return "Les deux mots de passe ne sont pas identiques.";
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (resto.name.trim().length < 2 || resto.adresse.trim().length < 3) {
      toast.error("Indiquez le nom et l'adresse du restaurant.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        username: account.username.trim(), email: account.email.trim().toLowerCase(), phone: account.phone.trim(), password: account.password,
        restaurant: {
          name: resto.name.trim(), adresse: resto.adresse.trim(), description: resto.description.trim(),
          phone: resto.phone.trim() || account.phone.trim(),
          latitude: resto.latitude, longitude: resto.longitude,
          villeId: resto.villeId ? Number(resto.villeId) : undefined,
          delaiPreparationMin: Number(resto.delaiPreparationMin) || 20,
        },
      };
      const res: any = await restaurateurService.signup(payload, image);
      dispatch(setSession({ admin: res.admin, token: res.token, restaurants: [res.restaurant] }));
      toast.success("Compte créé. Votre restaurant est en attente de validation.");
      router.replace("/restaurant");
    } catch (err) {
      toast.error(apiErrorMessage(err, "L'inscription a échoué. Vérifiez les informations et réessayez."));
    } finally {
      setLoading(false);
    }
  };

  const aside = (
    <ul className="mt-8 space-y-3 text-sm text-white/80">
      {["Inscription gratuite, en deux étapes", "Position exacte sur la carte pour être vu des clients proches", "Validation par l'équipe Koursier avant la mise en ligne"].map((t) => (
        <li key={t} className="flex gap-3"><span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white"><IconCheck className="h-3 w-3" /></span>{t}</li>
      ))}
    </ul>
  );

  return (
    <AuthShell wide title="Inscrire mon restaurant" subtitle="Votre compte, puis votre restaurant. Il sera visible dans l'application après validation." aside={aside}>
      <Toaster position="top-center" richColors />
      <ol className="mb-8 grid grid-cols-2 gap-3" aria-label="Étapes">
        {STEPS.map((label, i) => {
          const n = (i + 1) as 1 | 2;
          const done = step > n; const active = step === n;
          return (
            <li key={label} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm ${active ? "border-primary bg-secondary text-secondary-foreground" : "text-muted-foreground"}`}>
              <span className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-bold ${done || active ? "bg-primary text-primary-foreground" : "bg-muted"}`}>{done ? <IconCheck className="h-4 w-4" /> : n}</span>
              <span className="font-medium">{label}</span>
            </li>
          );
        })}
      </ol>

      <form onSubmit={submit} noValidate>
        {step === 1 && (
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="sr-only">Responsable du restaurant</legend>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="username">Nom et prénom du responsable</Label>
              <Input id="username" className="h-11" value={account.username} onChange={(e) => setAccount({ ...account, username: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" className="h-11" autoComplete="email" value={account.email} onChange={(e) => setAccount({ ...account, email: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone</Label>
              <Input id="phone" type="tel" className="h-11" placeholder="6XX XXX XXX" value={account.phone} onChange={(e) => setAccount({ ...account, phone: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" className="h-11" autoComplete="new-password" value={account.password} onChange={(e) => setAccount({ ...account, password: e.target.value })} required />
              <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input id="confirm" type="password" className="h-11" autoComplete="new-password" value={account.confirm} onChange={(e) => setAccount({ ...account, confirm: e.target.value })} required />
            </div>
            <div className="flex justify-end sm:col-span-2">
              <Button type="button" size="lg" className="h-11 rounded-full px-6" onClick={() => { const err = validStep1(); if (err) toast.error(err); else setStep(2); }}>Continuer</Button>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="grid gap-5 sm:grid-cols-2">
            <legend className="sr-only">Votre restaurant</legend>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="rname">Nom du restaurant</Label>
              <Input id="rname" className="h-11" value={resto.name} onChange={(e) => setResto({ ...resto, name: e.target.value })} required />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="adresse">Adresse (quartier, repère)</Label>
              <Input id="adresse" className="h-11" placeholder="Ex. Akwa, face pharmacie du Wouri" value={resto.adresse} onChange={(e) => setResto({ ...resto, adresse: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ville">Ville</Label>
              <select id="ville" className="h-11 w-full rounded-md border border-input bg-transparent px-3 text-sm" value={resto.villeId} onChange={(e) => setResto({ ...resto, villeId: e.target.value })}>
                <option value="">Choisir…</option>
                {villes.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="rphone">Téléphone du restaurant</Label>
              <Input id="rphone" type="tel" className="h-11" value={resto.phone} onChange={(e) => setResto({ ...resto, phone: e.target.value })} placeholder="Identique au vôtre si vide" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delai">Temps de préparation moyen (min)</Label>
              <Input id="delai" type="number" className="h-11" min={5} max={180} value={resto.delaiPreparationMin} onChange={(e) => setResto({ ...resto, delaiPreparationMin: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Photo (jpeg, png, webp · 5 Mo max)</Label>
              <div className="flex items-center gap-3">
                {preview ? <img src={preview} alt="" className="h-11 w-11 rounded-lg object-cover" /> : <span className="h-11 w-11 rounded-lg bg-muted" />}
                <label className="flex h-11 flex-1 cursor-pointer items-center gap-2 truncate rounded-md border px-3 text-sm hover:bg-muted">
                  <IconUpload className="h-4 w-4 shrink-0" /> <span className="truncate">{image ? image.name : "Choisir une image"}</span>
                  <input id="image" type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onImage(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} value={resto.description} onChange={(e) => setResto({ ...resto, description: e.target.value })} placeholder="Spécialités, ambiance…" />
            </div>
            <div className="sm:col-span-2">
              <Label className="mb-1 block">Position sur la carte</Label>
              <p className="mb-2 text-xs text-muted-foreground">Elle détermine les clients qui vous voient et les frais de livraison. Déplacez le repère sur l’entrée du restaurant.</p>
              <div className="overflow-hidden rounded-xl border">
                <MapPicker lat={resto.latitude} lng={resto.longitude} onChange={(lat, lng) => setResto({ ...resto, latitude: lat, longitude: lng })} />
              </div>
            </div>
            <div className="flex justify-between sm:col-span-2">
              <Button type="button" variant="outline" size="lg" className="h-11 rounded-full" onClick={() => setStep(1)}>Retour</Button>
              <Button type="submit" size="lg" className="h-11 rounded-full px-6" disabled={loading}>{loading ? "Création du compte…" : "Créer mon compte"}</Button>
            </div>
          </fieldset>
        )}
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà un compte ? <Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Se connecter</Link>
      </p>
    </AuthShell>
  );
}
