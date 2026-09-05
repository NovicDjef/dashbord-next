"use client"

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInAdmin, clearError } from "@/redux/adminAuthSlice";
import { homeForRole } from "./admin-auth-guard";
import { AuthShell } from "./site/auth-shell";

export function AdminLoginForm() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoading, error, isAuthenticated, admin } = useSelector((state: any) => state.adminAuth);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});

  // Redirection selon le rôle une fois connecté
  useEffect(() => {
    if (isAuthenticated && admin) router.replace(homeForRole(admin.role));
  }, [isAuthenticated, admin, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
    if (error) dispatch(clearError());
  };

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!formData.email.trim()) e.email = "Entrez votre adresse email.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = "Cette adresse email n'est pas valide.";
    if (!formData.password) e.password = "Entrez votre mot de passe.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validateForm()) return;
    dispatch((signInAdmin as any)({ email: formData.email.trim(), password: formData.password }));
  };

  return (
    <AuthShell title="Connexion" subtitle="Restaurateur ou administrateur Koursier.">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="email">Adresse email</Label>
          <Input id="email" type="email" autoComplete="email" placeholder="vous@restaurant.cm" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} aria-invalid={!!errors.email} className="h-11" disabled={isLoading} />
          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} aria-invalid={!!errors.password} className="h-11 pr-11" disabled={isLoading} />
            <button type="button" className="absolute right-1 top-1/2 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"} disabled={isLoading}>
              {showPassword ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>
        {error && <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        <Button type="submit" size="lg" className="h-11 w-full rounded-full text-base" disabled={isLoading}>{isLoading ? "Connexion…" : "Se connecter"}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Pas encore de compte restaurant ? <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">Inscrire mon restaurant</Link>
      </p>
    </AuthShell>
  );
}
