// Signature visuelle de l'espace client : le trajet restaurant (orange) → chez vous (vert),
// déjà utilisé par l'estimateur de la page d'accueil. Ici en version compacte pour les cartes,
// et en version « progression » pour le suivi de commande.
import { cn } from "@/lib/utils";

/** Ligne compacte : ● ─ ─ ─ ● avec deux libellés (distance, frais ou durée). */
export function RouteLine({ left, right, className }: { left: string; right: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)} aria-label={`${left}, ${right}`}>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-brand-orange" />
      <span className="whitespace-nowrap font-medium text-foreground/80">{left}</span>
      <span className="h-px min-w-4 flex-1 border-t border-dashed border-foreground/25" />
      <span className="whitespace-nowrap font-medium text-foreground/80">{right}</span>
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
    </div>
  );
}

/**
 * Trajet avec progression (0 → 1) : le scooter avance du restaurant vers la maison.
 * `progress` est dérivé du statut de la commande.
 */
export function RouteProgress({ progress, from, to, className }: { progress: number; from: string; to: string; className?: string }) {
  const p = Math.max(0, Math.min(1, progress));
  return (
    <div className={cn("relative", className)}>
      <div className="flex items-center gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-orange text-brand-ink">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 11a8 8 0 0 1 16 0z" /><path d="M3 13h18" /><path d="M12 3v1" /></svg>
        </span>
        <div className="relative h-2 flex-1 overflow-visible rounded-full bg-muted">
          <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-700 ease-out" style={{ width: `${p * 100}%` }} />
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 transition-[left] duration-700 ease-out" style={{ left: `${p * 100}%` }} aria-hidden="true">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-card shadow-[0_2px_10px_rgba(51,53,78,.25)] ring-2 ring-primary">
              <svg viewBox="0 0 64 44" className="h-3.5 w-5 text-brand-ink dark:text-foreground" fill="currentColor" aria-hidden="true"><path d="M17 26h16l6-12h7a2 2 0 0 1 0 4h-4.6l-4 8H52a6 6 0 0 1 6 6v2H17z" /><circle cx="34" cy="7.5" r="4.5" /><path d="M29 12h9l4 8-3 3-4-4h-3l-2 5h-5z" /><circle cx="16" cy="36" r="6.5" fill="none" stroke="currentColor" strokeWidth="3.5" /><circle cx="52" cy="36" r="6.5" fill="none" stroke="currentColor" strokeWidth="3.5" /></svg>
            </span>
          </div>
        </div>
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>
        </span>
      </div>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        <span className="max-w-[45%] truncate">{from}</span>
        <span className="max-w-[45%] truncate text-right">{to}</span>
      </div>
    </div>
  );
}
