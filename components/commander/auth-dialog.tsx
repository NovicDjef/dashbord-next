"use client"

// Connexion, création de compte et mot de passe oublié (téléphone + mot de passe, même compte que l'application mobile).
import { useState } from "react";
import { toast } from "sonner";
import { IconEye, IconEyeOff, IconPhone } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, apiError } from "@/lib/client-api";
import { useClientAuth } from "./providers";

type Mode = "login" | "signup" | "reset";

/** Numéro camerounais : 9 chiffres, sans indicatif (règle de l'application mobile). */
export const cleanPhone = (v: string) => {
  let p = v.replace(/\D/g, "");
  if (p.startsWith("237") && p.length > 9) p = p.slice(3);
  return p;
};
export const isValidPhone = (v: string) => /^\d{9}$/.test(cleanPhone(v));

function PhoneField({ id, value, onChange, autoFocus }: { id: string; value: string; onChange: (v: string) => void; autoFocus?: boolean }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Numéro de téléphone</Label>
      <div className="flex h-11 items-center rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/50">
        <span className="flex h-full items-center gap-1.5 border-r px-3 text-sm font-medium text-muted-foreground"><IconPhone className="h-4 w-4" />+237</span>
        <input id={id} type="tel" inputMode="numeric" autoComplete="tel-national" autoFocus={autoFocus} placeholder="6XX XXX XXX" value={value} onChange={(e) => onChange(e.target.value)} className="h-full flex-1 bg-transparent px-3 text-sm outline-none" />
      </div>
    </div>
  );
}

function PasswordField({ id, label, value, onChange, autoComplete }: { id: string; label: string; value: string; onChange: (v: string) => void; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} className="h-11 pr-11" value={value} onChange={(e) => onChange(e.target.value)} />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground hover:text-foreground" aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
          {show ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function AuthForms({ onDone, initialMode = "login" }: { onDone?: () => void; initialMode?: Mode }) {
  const auth = useClientAuth();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [confirm, setConfirm] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) { toast.error("Le numéro doit contenir 9 chiffres, sans l'indicatif."); return; }
    if (password.length < 6) { toast.error("Le mot de passe doit faire au moins 6 caractères."); return; }
    if (mode === "signup" && username.trim().length < 2) { toast.error("Indiquez votre nom."); return; }
    if (mode !== "login" && password !== confirm) { toast.error("Les deux mots de passe ne sont pas identiques."); return; }
    setLoading(true);
    try {
      const p = cleanPhone(phone);
      if (mode === "login") {
        const u = await auth.login(p, password);
        toast.success(`Bonjour ${u.username} !`);
      } else if (mode === "signup") {
        const u = await auth.signup(username, p, password);
        toast.success(`Bienvenue ${u.username} ! Votre compte est prêt.`);
      } else {
        const r = await api.resetPassword(p, password);
        localStorage.setItem("userToken", r.token);
        localStorage.setItem("userData", JSON.stringify(r.user));
        await auth.login(p, password);
        toast.success("Mot de passe modifié. Vous êtes connecté.");
      }
      onDone?.();
    } catch (err) {
      toast.error(apiError(err, mode === "login" ? "Connexion impossible. Vérifiez le numéro et le mot de passe." : "L'opération a échoué. Réessayez."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {mode !== "reset" && (
        <div className="grid grid-cols-2 rounded-full bg-muted p-1 text-sm font-semibold" role="tablist">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button key={m} type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={`rounded-full py-2 transition-colors ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {m === "login" ? "Se connecter" : "Créer un compte"}
            </button>
          ))}
        </div>
      )}
      {mode === "signup" && (
        <div className="space-y-2">
          <Label htmlFor="auth-name">Nom et prénom</Label>
          <Input id="auth-name" className="h-11" autoComplete="name" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
      )}
      <PhoneField id="auth-phone" value={phone} onChange={setPhone} autoFocus />
      <PasswordField id="auth-password" label={mode === "reset" ? "Nouveau mot de passe" : "Mot de passe"} value={password} onChange={setPassword} autoComplete={mode === "login" ? "current-password" : "new-password"} />
      {mode !== "login" && <PasswordField id="auth-confirm" label="Confirmer le mot de passe" value={confirm} onChange={setConfirm} autoComplete="new-password" />}
      <Button type="submit" className="h-11 w-full rounded-full font-semibold" disabled={loading}>
        {loading ? "Un instant…" : mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Changer le mot de passe"}
      </Button>
      <div className="text-center text-sm text-muted-foreground">
        {mode === "login" && <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => setMode("reset")}>Mot de passe oublié ?</button>}
        {mode === "reset" && <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={() => setMode("login")}>Retour à la connexion</button>}
        {mode === "signup" && <span>Même compte que l’application Koursier : vos commandes vous suivent partout.</span>}
      </div>
    </form>
  );
}

export function AuthDialog() {
  const auth = useClientAuth();
  return (
    <Dialog open={auth.authOpen} onOpenChange={auth.setAuthOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Votre compte Koursier</DialogTitle>
          <DialogDescription>Connectez-vous pour commander et suivre vos livraisons. Le compte de l’application mobile fonctionne ici aussi.</DialogDescription>
        </DialogHeader>
        <AuthForms onDone={() => auth.setAuthOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
