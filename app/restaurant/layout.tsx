"use client"
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { RestaurantShell } from "@/components/restaurant/restaurant-shell";
import { useTokenExpiry } from "@/hooks/use-token-expiry";

function Expiry() { useTokenExpiry(); return null; }

export default function RestaurantLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthGuard requiredRole="RESTAURATEUR">
      <Expiry />
      <RestaurantShell>{children}</RestaurantShell>
    </AdminAuthGuard>
  );
}
