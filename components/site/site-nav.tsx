"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconMenu2, IconShoppingBag, IconX } from "@tabler/icons-react";
import { Brand } from "./brand";
import { cn } from "@/lib/utils";

// L'essentiel seulement : les trois publics du site. Tarifs et questions restent accessibles depuis la page et le pied de page.
const LINKS = [
  { href: "#restaurants", label: "Restaurants" },
  { href: "#livreurs", label: "Livreurs" },
  { href: "#applications", label: "Applications" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-40 w-full border-b transition-colors", scrolled ? "border-border bg-background/85 backdrop-blur-md" : "border-transparent bg-background")}>
      <div className="site-container flex h-16 items-center justify-between gap-4">
        <Brand />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-[15px] font-medium text-foreground/80 transition-colors hover:text-primary">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/login" className="rounded-full px-4 py-2 text-[15px] font-semibold text-foreground/80 transition-colors hover:bg-muted hover:text-foreground">Espace restaurant</Link>
          <Link href="/commander" className="ml-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[15px] font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_rgba(41,160,102,.9)] transition-colors hover:bg-[#238a57]"><IconShoppingBag className="h-4 w-4" />Commander</Link>
        </div>
        <button type="button" onClick={() => setOpen((o) => !o)} className="inline-flex h-10 w-10 items-center justify-center rounded-full border md:hidden" aria-expanded={open} aria-controls="mobile-nav" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}>
          {open ? <IconX className="h-5 w-5" /> : <IconMenu2 className="h-5 w-5" />}
        </button>
      </div>
      <div id="mobile-nav" hidden={!open} className="border-t bg-background md:hidden">
        <nav className="site-container flex flex-col py-3" aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-lg px-2 py-3 text-base font-medium hover:bg-muted">{l.label}</a>
          ))}
          <div className="mt-2 grid gap-2 border-t pt-3">
            <Link href="/commander" onClick={() => setOpen(false)} className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-center font-semibold text-primary-foreground"><IconShoppingBag className="h-4 w-4" />Commander en ligne</Link>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/login" className="rounded-full border px-4 py-2.5 text-center font-semibold">Espace restaurant</Link>
              <Link href="/register" className="rounded-full border px-4 py-2.5 text-center font-semibold">Inscrire mon restaurant</Link>
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
}
