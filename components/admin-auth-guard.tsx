"use client"

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { checkAdminAuth } from "@/redux/adminAuthSlice";
import { AdminLoginForm } from "./admin-login-form";

export type AdminRole = 'SUPER_ADMIN' | 'RESTAURATEUR';

interface AdminAuthGuardProps {
  children: React.ReactNode;
  /** Rôle exigé pour voir le contenu. Sans valeur : tout compte connecté. */
  requiredRole?: AdminRole;
}

export const homeForRole = (role?: string) => (role === 'RESTAURATEUR' ? '/restaurant' : '/dashboard');

export function AdminAuthGuard({ children, requiredRole }: AdminAuthGuardProps) {
  const dispatch = useDispatch();
  const router = useRouter();
  const { isAuthenticated, isLoading, isInitialized, admin } = useSelector((state: any) => state.adminAuth);
  const role: string | undefined = admin?.role;
  const wrongRole = isAuthenticated && requiredRole && role && role !== requiredRole;

  useEffect(() => {
    if (!isInitialized) dispatch(checkAdminAuth() as any);
  }, [dispatch, isInitialized]);

  useEffect(() => {
    if (wrongRole) router.replace(homeForRole(role));
  }, [wrongRole, role, router]);

  if (!isInitialized || isLoading || wrongRole) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="text-sm text-muted-foreground">Vérification de la session…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <AdminLoginForm />;

  return <>{children}</>;
}
