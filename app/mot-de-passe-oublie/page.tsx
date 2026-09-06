"use client"

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { IconMailForward, IconEye, IconEyeOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/sonner";
import { AuthShell } from "@/components/site/auth-shell";
import { restaurateurService, apiErrorMessage } from "@/services/api/restaurateur.service";

export default function MotDePasseOubliePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { toast.error("Cette adresse email n’est pas valide."); return; }
    setLoading(true);
    try {
      const r = await restaurateurService.forgotPassword(email.trim().toLowerCase());
      if (r.devCode) setDevCode(r.devCode);
      toast.success("Si un compte existe pour cette adresse, un code vient d’être envoyé.");
      setStep(2);
    } catch (err) { toast.error(apiErrorMessage(err, "Envoi du code impossible. Réessayez dans une minute.")); }
    finally { setLoading(false); }
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(code.trim())) { toast.error("Le code fait 6 chiffres."); return; }
    if (password.length < 8) { toast.error("Le mot de passe doit faire au moins 8 caractères."); return; }
    if (password !== confirm) { toast.error("Les deux mots de passe ne sont pas identiques."); return; }
    setLoading(true);
    try {
      await restaurateurService.resetPassword(email.trim().toLowerCase(), code.trim(), password);
      toast.success("Mot de passe modifié. Connectez-vous avec le nouveau.");
      router.replace("/login");
    } catch (err) { toast.error(apiErrorMessage(err, "Code invalide ou expiré.")); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Mot de passe oublié" subtitle={step === 1 ? "Entrez l’adresse email de votre compte, nous vous envoyons un code de réinitialisation." : `Code envoyé à ${email}. Il reste valable 15 minutes.`}>
      <Toaster position="top-center" richColors />
      {step === 1 ? (
        <form onSubmit={sendCode} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input id="email" type="email" autoComplete="email" className="h-11" placeholder="vous@restaurant.cm" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="h-11 w-full rounded-full text-base" disabled={loading}><IconMailForward className="mr-2 h-4 w-4" />{loading ? "Envoi…" : "Recevoir le code"}</Button>
        </form>
      ) : (
        <form onSubmit={reset} className="space-y-5" noValidate>
          {devCode && <p className="rounded-xl border border-dashed bg-muted px-3 py-2 text-xs text-muted-foreground">Environnement de développement : le code est <b className="font-mono text-foreground">{devCode}</b>.</p>}
          <div className="space-y-2">
            <Label htmlFor="code">Code reçu par email</Label>
            <Input id="code" inputMode="numeric" maxLength={6} className="h-11 font-mono text-lg tracking-[.4em]" placeholder="000000" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Nouveau mot de passe</Label>
            <div className="relative">
              <Input id="password" type={show ? "text" : "password"} autoComplete="new-password" className="h-11 pr-11" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button type="button" className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer" : "Afficher"}>{show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}</button>
            </div>
            <p className="text-xs text-muted-foreground">8 caractères minimum.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirmer le mot de passe</Label>
            <Input id="confirm" type={show ? "text" : "password"} autoComplete="new-password" className="h-11" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </div>
          <Button type="submit" size="lg" className="h-11 w-full rounded-full text-base" disabled={loading}>{loading ? "Enregistrement…" : "Changer le mot de passe"}</Button>
          <button type="button" className="w-full text-center text-sm text-muted-foreground hover:text-foreground" onClick={() => setStep(1)}>Renvoyer un code</button>
        </form>
      )}
      <p className="mt-8 text-center text-sm text-muted-foreground"><Link href="/login" className="font-semibold text-primary underline-offset-4 hover:underline">Retour à la connexion</Link></p>
    </AuthShell>
  );
}
