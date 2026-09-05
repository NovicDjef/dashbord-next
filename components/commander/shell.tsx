"use client"

// Coque de l'espace « Commander » : barre haute (recherche, adresse, panier), rail latéral sur grand écran,
// barre d'onglets en bas sur mobile (les mêmes onglets que l'application Koursier).
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  IconArrowLeft, IconChevronDown, IconHeart, IconHome, IconMapPin, IconPackage, IconReceipt, IconSearch, IconShoppingBag, IconUserCircle, IconLifebuoy, IconX,
} from "@tabler/icons-react";
import { Toaster } from "@/components/ui/sonner";
import { APP_STORE_CLIENT, AppleIcon, Brand, PLAY_STORE_CLIENT, PlayIcon } from "@/components/site/brand";
import { cn } from "@/lib/utils";
import { useCart, useClientAuth, useLocation } from "./providers";
import { AddressDialog } from "./address-dialog";
import { AuthDialog } from "./auth-dialog";
import { CartSheet } from "./cart-sheet";

const NAV = [
  { href: "/commander", label: "Accueil", icon: IconHome, exact: true },
  { href: "/commander/colis", label: "Colis", icon: IconPackage },
  { href: "/commander/commandes", label: "Commandes", icon: IconReceipt },
  { href: "/commander/enregistres", label: "Enregistrés", icon: IconHeart },
  { href: "/commander/compte", label: "Compte", icon: IconUserCircle },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
}

function SearchBox({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") || "");
  useEffect(() => { setQ(params.get("q") || ""); }, [params]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = q.trim();
    router.push(v ? `/commander?q=${encodeURIComponent(v)}` : "/commander");
  };
  return (
    <form onSubmit={submit} role="search" className={cn("relative", className)}>
      <IconSearch className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Un plat, un restaurant…"
        aria-label="Rechercher un plat ou un restaurant"
        className="h-11 w-full rounded-full border-0 bg-muted pl-11 pr-10 text-[15px] outline-none ring-primary/40 transition-shadow placeholder:text-muted-foreground focus:bg-card focus:shadow-[0_0_0_2px_var(--primary)]"
      />
      {(q || (pathname === "/commander" && params.get("q"))) && (
        <button type="button" onClick={() => { setQ(""); router.push("/commander"); }} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-card hover:text-foreground" aria-label="Effacer la recherche"><IconX className="h-4 w-4" /></button>
      )}
    </form>
  );
}

function AddressButton({ className }: { className?: string }) {
  const loc = useLocation();
  return (
    <button type="button" onClick={() => loc.setOpen(true)} className={cn("inline-flex h-11 max-w-[16rem] items-center gap-2 rounded-full border bg-card px-3.5 text-left text-sm font-semibold hover:border-primary/60", className)} aria-label="Changer l'adresse de livraison">
      <IconMapPin className={cn("h-4 w-4 shrink-0", loc.source === "default" ? "text-brand-orange" : "text-primary")} />
      <span className="truncate">{loc.ready ? (loc.source === "default" ? "Indiquer mon adresse" : loc.label) : "…"}</span>
      <IconChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function CartButton() {
  const cart = useCart();
  return (
    <button type="button" onClick={() => cart.setOpen(true)} className="relative inline-flex h-11 items-center gap-2 rounded-full bg-primary px-4 font-semibold text-primary-foreground transition-colors hover:bg-[#238a57]" aria-label={`Panier, ${cart.count} article${cart.count > 1 ? "s" : ""}`}>
      <IconShoppingBag className="h-5 w-5" />
      <span className="font-display tabular-nums">{cart.count}</span>
    </button>
  );
}

function AccountButton() {
  const auth = useClientAuth();
  if (auth.user) {
    return (
      <Link href="/commander/compte" className="hidden h-11 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold hover:border-primary/60 md:inline-flex">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-brand-mint font-display text-xs font-bold text-primary">{auth.user.username?.[0]?.toUpperCase() || "K"}</span>
        <span className="max-w-[8rem] truncate">{auth.user.username}</span>
      </Link>
    );
  }
  return <button type="button" onClick={() => auth.setAuthOpen(true)} className="hidden h-11 items-center rounded-full border px-4 text-sm font-semibold hover:border-primary/60 md:inline-flex">Se connecter</button>;
}

export function CommanderShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const cart = useCart();
  const isHome = pathname === "/commander";

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <Toaster position="top-center" richColors />
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <Brand wordmark={false} size={30} className="lg:hidden" />
            <Brand className="hidden lg:inline-flex" />
          </div>
          <Suspense fallback={<div className="h-11 flex-1 rounded-full bg-muted" />}>
            <SearchBox className="hidden flex-1 md:block md:max-w-xl" />
          </Suspense>
          <div className="ml-auto flex items-center gap-2">
            <AddressButton className="hidden sm:inline-flex" />
            <AccountButton />
            <CartButton />
          </div>
        </div>
        <div className="mx-auto flex max-w-[90rem] items-center gap-2 px-4 pb-3 sm:px-6 md:hidden">
          <AddressButton className="max-w-none flex-1" />
        </div>
        {isHome && (
          <div className="mx-auto max-w-[90rem] px-4 pb-3 sm:px-6 md:hidden">
            <Suspense fallback={<div className="h-11 rounded-full bg-muted" />}><SearchBox /></Suspense>
          </div>
        )}
      </header>

      <div className="mx-auto flex max-w-[90rem] gap-8 px-4 sm:px-6">
        <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-56 shrink-0 flex-col py-6 lg:flex" aria-label="Navigation de l'espace client">
          <nav className="space-y-1">
            {NAV.map((n) => {
              const active = isActive(pathname, n.href, n.exact);
              return (
                <Link key={n.href} href={n.href} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium transition-colors", active ? "bg-brand-mint text-primary dark:bg-secondary" : "text-foreground/75 hover:bg-muted hover:text-foreground")} aria-current={active ? "page" : undefined}>
                  <n.icon className="h-5 w-5" />{n.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-4 border-t pt-4">
            <Link href="/commander/aide" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium", isActive(pathname, "/commander/aide") ? "bg-brand-mint text-primary dark:bg-secondary" : "text-foreground/75 hover:bg-muted")}><IconLifebuoy className="h-5 w-5" />Aide</Link>
            <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-foreground/75 hover:bg-muted"><IconArrowLeft className="h-5 w-5" />Retour au site</Link>
          </div>
          <div className="mt-auto rounded-2xl bg-brand-ink p-4 text-white">
            <p className="font-display font-bold leading-tight">La même chose, dans votre poche</p>
            <p className="mt-1 text-xs text-white/70">L’app Koursier vous prévient à chaque étape de la livraison.</p>
            <div className="mt-3 flex flex-col gap-2">
              <a href={PLAY_STORE_CLIENT} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"><PlayIcon className="h-4 w-4" />Koursier sur Google Play</a>
              <a href={APP_STORE_CLIENT} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/20"><AppleIcon className="h-4 w-4" />Koursier sur l’App Store</a>
            </div>
          </div>
        </aside>
        <main className="min-w-0 flex-1 py-6">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur-md lg:hidden" aria-label="Onglets" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <ul className="grid grid-cols-5">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href, n.exact);
            return (
              <li key={n.href}>
                <Link href={n.href} className={cn("flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium", active ? "text-primary" : "text-muted-foreground")} aria-current={active ? "page" : undefined}>
                  <n.icon className="h-5 w-5" />{n.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {cart.count > 0 && !pathname.startsWith("/commander/panier") && (
        <button type="button" onClick={() => cart.setOpen(true)} className="fixed bottom-20 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-brand-ink px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_36px_-14px_rgba(51,53,78,.7)] lg:hidden">
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-orange font-display text-xs font-bold text-brand-ink">{cart.count}</span>
          Voir le panier
        </button>
      )}

      <AddressDialog />
      <AuthDialog />
      <CartSheet />
    </div>
  );
}
