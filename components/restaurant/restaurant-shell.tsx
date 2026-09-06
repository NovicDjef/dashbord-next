"use client"

import { useSelector, useDispatch } from "react-redux";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { IconClipboardList, IconToolsKitchen2, IconClock, IconBuildingStore, IconLogout, IconAlertTriangle, IconHourglass, IconCircleCheck, IconExternalLink, IconChartBar, IconUsers } from "@tabler/icons-react";
import { ROLE_LABEL, type RestaurantRole } from "@/services/api/restaurateur.service";
import { signOutAdmin } from "@/redux/adminAuthSlice";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ErrorBoundary } from "@/components/error-boundary";
import { getImageUrl } from "@/services/urlApp";
import { AvailabilityBar } from "./availability-bar";

// Pages accessibles par rôle : CAISSE = commandes + historique ; GERANT = tout sauf l'équipe ; PROPRIETAIRE = tout
const NAV: { title: string; description: string; url: string; icon: typeof IconClipboardList; roles: RestaurantRole[] }[] = [
  { title: "Commandes", description: "Tableau en temps réel", url: "/restaurant", icon: IconClipboardList, roles: ["PROPRIETAIRE", "GERANT", "CAISSE"] },
  { title: "Historique & chiffres", description: "Livrées, refusées, chiffre d’affaires", url: "/restaurant/historique", icon: IconChartBar, roles: ["PROPRIETAIRE", "GERANT", "CAISSE"] },
  { title: "Menu", description: "Plats, catégories, compléments", url: "/restaurant/menu", icon: IconToolsKitchen2, roles: ["PROPRIETAIRE", "GERANT"] },
  { title: "Horaires", description: "Jours et heures d'ouverture", url: "/restaurant/horaires", icon: IconClock, roles: ["PROPRIETAIRE", "GERANT"] },
  { title: "Mon restaurant", description: "Photo, adresse, position", url: "/restaurant/profil", icon: IconBuildingStore, roles: ["PROPRIETAIRE", "GERANT"] },
  { title: "Équipe", description: "Comptes gérant et caisse", url: "/restaurant/equipe", icon: IconUsers, roles: ["PROPRIETAIRE"] },
];

export function useMyRole(): RestaurantRole {
  const resto = useMyRestaurant();
  return (resto?.monRole as RestaurantRole) || "PROPRIETAIRE";
}

export function useMyRestaurant() {
  const { restaurants } = useSelector((s: any) => s.adminAuth);
  return (restaurants && restaurants[0]) || null;
}

function StatusPill({ status }: { status?: string }) {
  if (status === "APPROVED") return <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground"><IconCircleCheck className="h-3 w-3" />En ligne</span>;
  if (status === "REJECTED") return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-semibold text-destructive"><IconAlertTriangle className="h-3 w-3" />Refusé</span>;
  return <span className="inline-flex items-center gap-1 rounded-full bg-brand-cream px-2 py-0.5 text-[11px] font-semibold text-brand-ink dark:text-brand-yellow"><IconHourglass className="h-3 w-3" />En attente</span>;
}

function StatusBanner() {
  const resto = useMyRestaurant();
  if (!resto || resto.validationStatus === "APPROVED") return null;
  if (resto.validationStatus === "REJECTED") {
    return (
      <div role="status" className="flex items-start gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-3 text-sm lg:px-6">
        <IconAlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div><b>Inscription refusée.</b> {resto.rejectionReason ? `Motif : ${resto.rejectionReason}.` : ""} Corrigez les informations dans <Link href="/restaurant/profil" className="font-semibold underline underline-offset-4">Mon restaurant</Link>, puis contactez Koursier.</div>
      </div>
    );
  }
  return (
    <div role="status" className="flex items-start gap-3 border-b bg-brand-cream px-4 py-3 text-sm text-brand-ink lg:px-6 dark:text-foreground">
      <IconHourglass className="mt-0.5 h-4 w-4 shrink-0" />
      <div><b>Restaurant en attente de validation.</b> Préparez dès maintenant votre menu et vos horaires : les clients vous verront dès la validation par Koursier.</div>
    </div>
  );
}

export function RestaurantShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { admin } = useSelector((s: any) => s.adminAuth);
  const resto = useMyRestaurant();
  const role = useMyRole();
  const nav = NAV.filter((n) => n.roles.includes(role));
  const current = NAV.find((n) => n.url === pathname);
  // Une page interdite pour ce rôle renvoie vers les commandes
  useEffect(() => { if (current && !current.roles.includes(role)) router.replace("/restaurant"); }, [current, role, router]);
  const initials = (resto?.name || "R").split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase();
  const img = resto?.image ? getImageUrl(resto.image) : null;

  const logout = async () => {
    await dispatch(signOutAdmin() as any);
    router.replace("/login");
  };

  return (
    <SidebarProvider style={{ "--sidebar-width": "17rem", "--header-height": "3.5rem" } as React.CSSProperties}>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader className="p-3">
          <Link href="/" className="mb-1 flex items-center gap-2 px-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
            <Image src="/brand/koursier-mark.png" alt="" width={20} height={20} /> Koursier <span className="font-normal">· espace restaurant</span>
          </Link>
          <div className="flex items-center gap-3 rounded-xl border bg-card p-2.5">
            {img ? <img src={img} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">{initials}</span>}
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-bold leading-tight">{resto?.name || "Mon restaurant"}</div>
              <div className="mt-0.5 flex flex-wrap items-center gap-1"><StatusPill status={resto?.validationStatus} />{role !== "PROPRIETAIRE" && <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">{ROLE_LABEL[role]}</span>}</div>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Gestion</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {nav.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={item.title} className="h-auto py-2 data-[active=true]:bg-secondary data-[active=true]:text-secondary-foreground">
                      <Link href={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex flex-col leading-tight"><span className="font-medium">{item.title}</span><span className="text-[11px] text-muted-foreground">{item.description}</span></span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="p-3">
          <div className="flex items-center justify-between gap-2 rounded-xl border bg-card px-2.5 py-2 text-sm">
            <div className="min-w-0">
              <div className="truncate font-medium">{admin?.username}</div>
              <div className="truncate text-xs text-muted-foreground">{admin?.email}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Se déconnecter" title="Se déconnecter"><IconLogout className="h-4 w-4" /></Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 lg:px-6">
          <SidebarTrigger className="-ml-1" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-base font-bold leading-tight">{current?.title ?? "Espace restaurant"}</h1>
            {current?.description && <p className="hidden text-xs text-muted-foreground sm:block">{current.description}</p>}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link href="/" target="_blank" className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex">Voir le site <IconExternalLink className="h-3.5 w-3.5" /></Link>
            <ModeToggle />
          </div>
        </header>
        <StatusBanner />
        <AvailabilityBar />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <ErrorBoundary>{children}</ErrorBoundary>
        </div>
        <Toaster position="bottom-right" richColors />
      </SidebarInset>
    </SidebarProvider>
  );
}
