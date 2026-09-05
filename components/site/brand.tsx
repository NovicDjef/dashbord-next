import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** Marque Koursier : scooter de la charte + mot-symbole. */
export function Brand({ href = "/", className, size = 32, wordmark = true, light = false }: { href?: string; className?: string; size?: number; wordmark?: boolean; light?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="Koursier, accueil">
      <span className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-[0_0_0_1px_var(--border)]" style={{ width: size + 8, height: size + 8 }}>
        <Image src="/brand/koursier-mark.png" alt="" width={size} height={size} priority />
      </span>
      {wordmark && (
        <span className={cn("font-display text-[1.35rem] font-bold leading-none tracking-tight", light ? "text-white" : "text-brand-ink dark:text-foreground")}>
          Koursier
        </span>
      )}
    </Link>
  );
}

export const PLAY_STORE_CLIENT = "https://play.google.com/store/apps/details?id=com.novic.koursier";
export const PLAY_STORE_LIVREUR = "https://play.google.com/store/apps/details?id=com.Lkoursier.app";
export const CONTACT_PHONE = "+237 690 089 951";
export const CONTACT_PHONE_HREF = "tel:+237690089951";
export const CONTACT_EMAIL = "contact@koursier.com";

/** Icône Google Play (formes officielles simplifiées). */
export function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#34A853" d="M3.6 2.4 13.2 12 3.6 21.6c-.4-.3-.6-.8-.6-1.4V3.8c0-.6.2-1.1.6-1.4Z" />
      <path fill="#FBBC04" d="m16.5 8.7 3.4 2c1.1.6 1.1 2 0 2.6l-3.4 2L13.2 12l3.3-3.3Z" />
      <path fill="#4285F4" d="M3.6 2.4c.5-.4 1.2-.4 1.8 0L16.5 8.7 13.2 12 3.6 2.4Z" />
      <path fill="#EA4335" d="M13.2 12l3.3 3.3L5.4 21.6c-.6.4-1.3.4-1.8 0L13.2 12Z" />
    </svg>
  );
}

export function PlayBadge({ href, label = "Télécharger sur", app = "Google Play", className, tone = "dark" }: { href: string; label?: string; app?: string; className?: string; tone?: "dark" | "light" }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-2",
        tone === "dark" ? "bg-brand-ink text-white shadow-[0_8px_24px_-12px_rgba(51,53,78,.7)]" : "bg-white text-brand-ink shadow-[0_8px_24px_-12px_rgba(0,0,0,.35)]",
        className,
      )}
    >
      <PlayIcon className="h-6 w-6" />
      <span className="leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-[.12em] opacity-75">{label}</span>
        <span className="block font-display text-base font-semibold">{app}</span>
      </span>
    </a>
  );
}

/** Scooter stylisé de la charte (silhouette vectorielle, couleur héritée via currentColor). */
export function ScooterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 44" className={className} aria-hidden="true" fill="currentColor">
      {/* colis */}
      <rect x="2" y="14" width="14" height="12" rx="2.5" />
      <path d="M0 18h-6M-1 22h-7M0 26h-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity=".55" transform="translate(2 0)" />
      {/* corps */}
      <path d="M17 26h16l6-12h7a2 2 0 0 1 0 4h-4.6l-4 8H52a6 6 0 0 1 6 6v2H17z" />
      {/* pilote */}
      <circle cx="34" cy="7.5" r="4.5" />
      <path d="M29 12h9l4 8-3 3-4-4h-3l-2 5h-5z" />
      {/* roues */}
      <circle cx="16" cy="36" r="6.5" fill="none" stroke="currentColor" strokeWidth="3.5" />
      <circle cx="52" cy="36" r="6.5" fill="none" stroke="currentColor" strokeWidth="3.5" />
    </svg>
  );
}

// Liens App Store : à remplacer par les URL définitives des fiches (apps.apple.com/app/id…) dès leur publication.
export const APP_STORE_CLIENT = "https://apps.apple.com/search?term=koursier";
export const APP_STORE_LIVREUR = "https://apps.apple.com/search?term=koursier%20go";

export function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="currentColor">
      <path d="M16.4 12.7c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8 0 0-2.6-1-2.6-3.8zM14 5.5c.7-.8 1.1-2 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z" />
    </svg>
  );
}

/** Badge de téléchargement Google Play ou App Store. */
export function StoreBadge({ store, href, className, tone = "dark" }: { store: "play" | "apple"; href: string; className?: string; tone?: "dark" | "light" }) {
  const isPlay = store === "play";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "inline-flex items-center gap-3 rounded-full px-4 py-2.5 text-left transition-transform hover:-translate-y-0.5 focus-visible:outline-2",
        tone === "dark" ? "bg-brand-ink text-white shadow-[0_8px_24px_-12px_rgba(51,53,78,.7)]" : "bg-white text-brand-ink shadow-[0_8px_24px_-12px_rgba(0,0,0,.35)]",
        className,
      )}
    >
      {isPlay ? <PlayIcon className="h-6 w-6" /> : <AppleIcon className="h-6 w-6" />}
      <span className="leading-tight">
        <span className="block text-[10px] font-medium uppercase tracking-[.12em] opacity-75">{isPlay ? "Disponible sur" : "Télécharger sur"}</span>
        <span className="block font-display text-base font-semibold">{isPlay ? "Google Play" : "App Store"}</span>
      </span>
    </a>
  );
}

/** Les deux badges (Android + iOS) pour l'app client ou l'app livreur. */
export function AppBadges({ app, tone = "dark", className }: { app: "client" | "livreur"; tone?: "dark" | "light"; className?: string }) {
  const play = app === "client" ? PLAY_STORE_CLIENT : PLAY_STORE_LIVREUR;
  const apple = app === "client" ? APP_STORE_CLIENT : APP_STORE_LIVREUR;
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <StoreBadge store="play" href={play} tone={tone} />
      <StoreBadge store="apple" href={apple} tone={tone} />
    </div>
  );
}
