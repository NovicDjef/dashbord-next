"use client"

// Étapes d'une commande repas, côté client. Alignées sur la machine à états du backend.
import { IconCheck, IconX } from "@tabler/icons-react";
import type { Commande, CommandeStatus } from "@/lib/client-api";
import { ORDER_STATUS_CLASS, ORDER_STATUS_LABEL } from "@/lib/order-status";

export const STEPS: { key: string; label: string; detail: string; statuses: CommandeStatus[] }[] = [
  { key: "envoyee", label: "Commande envoyée", detail: "Le restaurant a reçu votre commande.", statuses: ["EN_ATTENTE"] },
  { key: "acceptee", label: "Acceptée par le restaurant", detail: "La cuisine se prépare.", statuses: ["ACCEPTEE_RESTAURANT"] },
  { key: "preparation", label: "En préparation", detail: "Vos plats sont en cours de préparation.", statuses: ["EN_PREPARATION"] },
  { key: "prete", label: "Prête", detail: "Un livreur proche est prévenu.", statuses: ["PRETE"] },
  { key: "livreur", label: "Livreur en route vers le restaurant", detail: "Votre code de remise est disponible.", statuses: ["VALIDER", "ASSIGNEE"] },
  { key: "recuperee", label: "Commande récupérée", detail: "Le livreur a votre commande.", statuses: ["RECUPEREE"] },
  { key: "en_cours", label: "En livraison", detail: "Suivez le livreur sur la carte.", statuses: ["EN_COURS"] },
  { key: "livree", label: "Livrée", detail: "Bon appétit !", statuses: ["LIVREE"] },
];

export const TERMINAL: CommandeStatus[] = ["LIVREE", "ANNULEE", "REFUSEE_RESTAURANT"];
export const CANCELLABLE: CommandeStatus[] = ["EN_ATTENTE", "ACCEPTEE_RESTAURANT"];
export const WITH_LIVREUR: CommandeStatus[] = ["VALIDER", "ASSIGNEE", "RECUPEREE", "EN_COURS"];

export const stepIndex = (status: CommandeStatus) => STEPS.findIndex((s) => s.statuses.includes(status));

/** Progression 0 → 1 du scooter sur le trajet, selon le statut. */
export const routeProgress = (status: CommandeStatus) => {
  const map: Partial<Record<CommandeStatus, number>> = { EN_ATTENTE: 0, ACCEPTEE_RESTAURANT: 0, EN_PREPARATION: 0.04, PRETE: 0.08, VALIDER: 0.15, ASSIGNEE: 0.15, RECUPEREE: 0.3, EN_COURS: 0.65, LIVREE: 1 };
  return map[status] ?? 0;
};

const at = (c: Commande, key: string) => {
  const m: Record<string, string | null | undefined> = { envoyee: c.createdAt, acceptee: c.acceptedAt, prete: c.readyAt, livreur: c.assignedAt, recuperee: c.pickedUpAt, livree: c.deliveredAt };
  return m[key] || null;
};

const fmtTime = (iso: string | null) => (iso ? new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : "");

export function StatusBadge({ status, className = "" }: { status: CommandeStatus; className?: string }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${ORDER_STATUS_CLASS[status] || "bg-muted"} ${className}`}>{ORDER_STATUS_LABEL[status] || status}</span>;
}

export function OrderTimeline({ commande }: { commande: Commande }) {
  const status = commande.status;
  const cancelled = status === "ANNULEE" || status === "REFUSEE_RESTAURANT";
  const current = stepIndex(status);

  return (
    <ol className="relative space-y-0">
      {STEPS.map((s, i) => {
        const done = !cancelled && (i < current || status === "LIVREE");
        const active = !cancelled && i === current && status !== "LIVREE";
        const upcoming = !done && !active;
        const isLast = i === STEPS.length - 1;
        return (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && <span className={`absolute left-[15px] top-8 h-[calc(100%-1.5rem)] w-0.5 ${done ? "bg-primary" : "bg-border"}`} aria-hidden="true" />}
            <span className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${done ? "border-primary bg-primary text-primary-foreground" : active ? "border-primary bg-card text-primary" : "border-border bg-card text-muted-foreground"}`}>
              {done ? <IconCheck className="h-4 w-4" /> : active ? <span className="relative flex h-2.5 w-2.5"><span className="ping-soft absolute inline-flex h-full w-full rounded-full bg-primary" /><span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" /></span> : <span className="h-2 w-2 rounded-full bg-border" />}
            </span>
            <div className={`min-w-0 flex-1 pt-1 ${upcoming ? "opacity-60" : ""}`}>
              <div className="flex items-baseline justify-between gap-3">
                <p className={`font-semibold leading-tight ${active ? "text-primary" : ""}`}>{s.label}</p>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{fmtTime(at(commande, s.key))}</span>
              </div>
              {(active || done) && <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>}
            </div>
          </li>
        );
      })}
      {cancelled && (
        <li className="relative flex gap-4 pt-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive"><IconX className="h-4 w-4" /></span>
          <div className="pt-1">
            <p className="font-semibold text-destructive">{status === "ANNULEE" ? "Commande annulée" : "Refusée par le restaurant"}</p>
            {commande.cancelReason && <p className="text-sm text-muted-foreground">{commande.cancelReason}</p>}
            <span className="text-xs text-muted-foreground">{fmtTime(commande.cancelledAt || commande.updatedAt)}</span>
          </div>
        </li>
      )}
    </ol>
  );
}
