"use client"

import { AdminAuthGuard, type AdminRole } from "./admin-auth-guard";
import { useTokenExpiry } from "@/hooks/use-token-expiry";

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  requiredRole?: AdminRole;
}

function Expiry() { useTokenExpiry(); return null; }

/** Garde d'authentification de l'administration ; l'en-tête et la barre latérale sont rendus par app/dashboard/layout.tsx. */
export function AdminDashboardLayout({ children, requiredRole }: AdminDashboardLayoutProps) {
  return (
    <AdminAuthGuard requiredRole={requiredRole}>
      <Expiry />
      {children}
    </AdminAuthGuard>
  );
}
