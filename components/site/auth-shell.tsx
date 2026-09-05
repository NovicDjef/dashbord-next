import Link from "next/link";
import { IconArrowLeft } from "@tabler/icons-react";
import { Brand } from "./brand";

/**
 * Gabarit des pages de connexion et d'inscription :
 * panneau de marque à gauche (bleu nuit de la charte), formulaire à droite.
 */
export function AuthShell({ title, subtitle, aside, children, wide = false }: { title: string; subtitle: string; aside?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(20rem,0.85fr)_1.15fr]">
      <aside className="pattern-on-dark relative hidden overflow-hidden bg-brand-ink p-10 text-white lg:flex lg:flex-col">
        <Brand light />
        <div className="relative my-auto max-w-sm">
          <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Espace partenaires</p>
          <h2 className="mt-3 font-display text-3xl font-bold leading-tight">Vos commandes, vos livreurs, votre menu. Au même endroit.</h2>
          <p className="mt-4 text-white/70">Le tableau des commandes s’actualise tout seul, une sonnerie prévient la cuisine, et le livreur le plus proche est déjà prévenu quand la commande est prête.</p>
          {aside}
        </div>
        <svg className="pointer-events-none absolute -bottom-10 -right-10 h-[22rem] w-[22rem] opacity-20" viewBox="0 0 200 200" aria-hidden="true">
          <path d="M20 150 C 60 40, 110 190, 150 90 S 190 40, 200 70" fill="none" stroke="#29a066" strokeWidth="10" strokeLinecap="round" />
          <circle cx="20" cy="150" r="12" fill="#fbb344" />
          <circle cx="190" cy="66" r="12" fill="#29a066" />
        </svg>
        <p className="relative text-xs text-white/50">© {new Date().getFullYear()} Koursier · Douala</p>
      </aside>
      <main className="flex flex-col px-5 py-6 sm:px-10">
        <div className="flex items-center justify-between">
          <Brand className="lg:hidden" />
          <Link href="/" className="ml-auto inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><IconArrowLeft className="h-4 w-4" />Retour au site</Link>
        </div>
        <div className={`mx-auto flex w-full flex-1 flex-col justify-center py-10 ${wide ? "max-w-2xl" : "max-w-md"}`}>
          <h1 className="font-display text-3xl font-bold text-brand-ink dark:text-foreground">{title}</h1>
          <p className="mt-2 text-muted-foreground">{subtitle}</p>
          <div className="mt-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
