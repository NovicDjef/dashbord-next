"use client"

// Compte client : profil (nom, téléphone, photo), adresse, raccourcis, déconnexion.
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { IconCamera, IconChevronRight, IconHeart, IconHistory, IconLifebuoy, IconLogout, IconMapPin, IconPackage, IconReceipt } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiError, imageUrl, USER_DATA_KEY } from "@/lib/client-api";
import { useClientAuth, useLocation } from "@/components/commander/providers";
import { AuthForms, cleanPhone, isValidPhone } from "@/components/commander/auth-dialog";
import { AppBadges } from "@/components/site/brand";

const LINKS = [
  { href: "/commander/historique", label: "Mon activité", detail: "Tout l’historique, étape par étape, avec vos dépenses", icon: IconHistory },
  { href: "/commander/commandes", label: "Mes commandes", detail: "Repas en cours et passés", icon: IconReceipt },
  { href: "/commander/commandes?tab=colis", label: "Mes colis", detail: "Envois enregistrés et suivis", icon: IconPackage },
  { href: "/commander/enregistres", label: "Plats enregistrés", detail: "Vos envies mises de côté", icon: IconHeart },
  { href: "/commander/aide", label: "Aide et contact", detail: "Questions fréquentes, assistance", icon: IconLifebuoy },
];

export default function ComptePage() {
  const auth = useClientAuth();
  const loc = useLocation();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (auth.user) { setUsername(auth.user.username || ""); setPhone(cleanPhone(auth.user.phone || "")); } }, [auth.user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user) return;
    if (username.trim().length < 2) { toast.error("Indiquez votre nom."); return; }
    if (!isValidPhone(phone)) { toast.error("Le numéro doit contenir 9 chiffres."); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("username", username.trim());
      fd.append("phone", cleanPhone(phone));
      if (image) fd.append("image", image);
      const r = await api.updateProfile(auth.user.id, fd);
      const u = { ...auth.user, username: r.user?.username || username.trim(), phone: r.user?.phone || cleanPhone(phone), avatar: r.user?.image || auth.user.avatar, image: r.user?.image || auth.user.image };
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(u));
      toast.success("Profil mis à jour.");
      window.location.reload();
    } catch (err) {
      toast.error(apiError(err, "La mise à jour a échoué."));
    } finally { setSaving(false); }
  };

  if (auth.ready && !auth.user) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="font-display text-2xl font-extrabold text-brand-ink dark:text-foreground">Votre compte</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">Le même compte que l’application Koursier : commandes, colis et adresses vous suivent partout.</p>
        <div className="rounded-[1.5rem] border bg-card p-5"><AuthForms /></div>
      </div>
    );
  }
  if (!auth.user) return null;

  const avatar = preview || imageUrl(auth.user.avatar || auth.user.image);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <span className="inline-flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-brand-mint font-display text-2xl font-bold text-primary">{avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : auth.user.username?.[0]?.toUpperCase()}</span>
        <div className="min-w-0">
          <h1 className="truncate font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">{auth.user.username}</h1>
          <p className="text-sm text-muted-foreground">+237 {cleanPhone(auth.user.phone)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_18rem] md:items-start">
        <div className="space-y-4">
          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Vos informations</h2>
            <form onSubmit={save} noValidate className="mt-3 grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label htmlFor="pf-name">Nom et prénom</Label><Input id="pf-name" className="h-11" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
              <div className="space-y-2">
                <Label htmlFor="pf-phone">Téléphone</Label>
                <div className="flex h-11 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50"><span className="flex h-full items-center border-r px-3 text-sm font-medium text-muted-foreground">+237</span><input id="pf-phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} className="h-full flex-1 bg-transparent px-3 text-sm outline-none" /></div>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="pf-photo">Photo de profil</Label>
                <label className="flex h-11 w-full cursor-pointer items-center gap-2 rounded-md border px-3 text-sm hover:bg-muted sm:max-w-xs"><IconCamera className="h-4 w-4 shrink-0" /><span className="truncate">{image ? image.name : "Choisir une image"}</span><input id="pf-photo" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setImage(f); setPreview(f ? URL.createObjectURL(f) : null); }} /></label>
              </div>
              <div className="sm:col-span-2"><Button type="submit" disabled={saving} className="rounded-full px-6 font-semibold">{saving ? "Enregistrement…" : "Enregistrer"}</Button></div>
            </form>
          </section>

          <section className="rounded-[1.5rem] border bg-card p-5">
            <h2 className="font-display text-lg font-bold">Adresse de livraison</h2>
            <div className="mt-3 flex items-start justify-between gap-3">
              <p className="flex items-start gap-2 text-sm"><IconMapPin className={`mt-0.5 h-4 w-4 shrink-0 ${loc.source === "default" ? "text-brand-orange" : "text-primary"}`} />{loc.source === "default" ? "Aucune adresse enregistrée." : loc.label}</p>
              <button type="button" onClick={() => loc.setOpen(true)} className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold hover:border-primary/60">{loc.source === "default" ? "Ajouter" : "Modifier"}</button>
            </div>
          </section>

          <ul className="divide-y rounded-[1.5rem] border bg-card">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="flex items-center gap-3 px-5 py-3.5 hover:bg-muted/60">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint text-primary"><l.icon className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1"><span className="block font-semibold">{l.label}</span><span className="block text-xs text-muted-foreground">{l.detail}</span></span>
                  <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>

          <button type="button" onClick={() => { auth.logout(); toast("Vous êtes déconnecté."); }} className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/5"><IconLogout className="h-4 w-4" />Se déconnecter</button>
        </div>

        <aside className="pattern-on-dark rounded-[1.5rem] bg-brand-ink p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Application Koursier</p>
          <h3 className="mt-1 font-display text-xl font-bold">Le même compte, avec les notifications</h3>
          <p className="mt-2 text-sm text-white/70">Connectez-vous avec ce numéro dans l’application pour être prévenu à chaque étape.</p>
          <AppBadges app="client" tone="light" className="mt-4" />
        </aside>
      </div>
    </div>
  );
}
