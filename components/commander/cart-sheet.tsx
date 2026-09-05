"use client"

// Panier : panneau latéral (mobile / accueil) et colonne fixe (page restaurant).
import Link from "next/link";
import { useRouter } from "next/navigation";
import { IconMinus, IconPlus, IconShoppingBag, IconTrash } from "@tabler/icons-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatFcfa } from "@/lib/order-status";
import { imageUrl } from "@/lib/client-api";
import { useCart, type CartItem } from "./providers";

export function QtyStepper({ value, onChange, min = 0, size = "sm" }: { value: number; onChange: (v: number) => void; min?: number; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-8" : "h-11";
  const w = size === "sm" ? "w-8" : "w-11";
  return (
    <div className={`inline-flex ${h} items-center rounded-full border bg-card`} role="group" aria-label="Quantité">
      <button type="button" className={`${h} ${w} inline-flex items-center justify-center rounded-full text-foreground/70 hover:bg-muted disabled:opacity-40`} onClick={() => onChange(value - 1)} disabled={value <= min} aria-label={value <= 1 ? "Retirer" : "Diminuer"}>
        {value <= 1 && min === 0 ? <IconTrash className="h-3.5 w-3.5" /> : <IconMinus className="h-3.5 w-3.5" />}
      </button>
      <span className="min-w-6 text-center font-display text-sm font-bold tabular-nums">{value}</span>
      <button type="button" className={`${h} ${w} inline-flex items-center justify-center rounded-full text-foreground/70 hover:bg-muted disabled:opacity-40`} onClick={() => onChange(value + 1)} disabled={value >= 50} aria-label="Augmenter">
        <IconPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CartLine({ item }: { item: CartItem }) {
  const cart = useCart();
  const img = imageUrl(item.image);
  return (
    <li className="flex gap-3 py-3">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
        {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><IconShoppingBag className="h-5 w-5" /></div>}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold leading-tight">{item.name}</p>
          <p className="shrink-0 font-display font-bold tabular-nums">{formatFcfa(cart.itemTotal(item))}</p>
        </div>
        {item.complements.length > 0 && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{item.complements.map((c) => `${c.quantity > 1 ? `${c.quantity}× ` : ""}${c.name}`).join(", ")}</p>
        )}
        <div className="mt-2 flex items-center justify-between">
          <QtyStepper value={item.quantity} onChange={(v) => cart.updateQty(item.key, v)} />
          <span className="text-xs text-muted-foreground tabular-nums">{formatFcfa(item.prix)} l’unité</span>
        </div>
      </div>
    </li>
  );
}

/** Contenu du panier, réutilisé dans le panneau latéral et la colonne fixe. */
export function CartPanel({ onCheckout, sticky = false }: { onCheckout?: () => void; sticky?: boolean }) {
  const cart = useCart();
  const router = useRouter();
  const go = () => { cart.setOpen(false); onCheckout?.(); router.push("/commander/panier"); };

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center px-4 py-10 text-center">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-brand-mint text-primary"><IconShoppingBag className="h-7 w-7" /></span>
        <p className="mt-4 font-display text-lg font-bold">Votre panier est vide</p>
        <p className="mt-1 text-sm text-muted-foreground">Choisissez un restaurant ouvert près de vous et ajoutez vos plats.</p>
        <Link href="/commander" onClick={() => cart.setOpen(false)} className="mt-5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">Voir les restaurants</Link>
      </div>
    );
  }

  return (
    <div className={sticky ? "flex max-h-[calc(100vh-7rem)] flex-col" : "flex h-full flex-col"}>
      {cart.restaurant && (
        <Link href={`/commander/restaurant/${cart.restaurant.id}`} onClick={() => cart.setOpen(false)} className="flex items-center gap-3 rounded-xl bg-muted/70 px-3 py-2.5 hover:bg-muted">
          <span className="h-9 w-9 shrink-0 overflow-hidden rounded-lg bg-card">
            {imageUrl(cart.restaurant.image) && <img src={imageUrl(cart.restaurant.image)!} alt="" className="h-full w-full object-cover" />}
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold leading-tight">{cart.restaurant.name}</span>
            <span className="block text-xs text-muted-foreground">{cart.count} article{cart.count > 1 ? "s" : ""} · ajouter d’autres plats</span>
          </span>
        </Link>
      )}
      <ul className="mt-2 flex-1 divide-y overflow-y-auto">{cart.items.map((it) => <CartLine key={it.key} item={it} />)}</ul>
      <div className="border-t pt-4">
        <div className="flex items-baseline justify-between text-sm"><span className="text-muted-foreground">Sous-total</span><span className="font-display text-lg font-bold tabular-nums">{formatFcfa(cart.subtotal)}</span></div>
        <p className="mt-1 text-xs text-muted-foreground">Frais de livraison calculés à l’étape suivante selon votre adresse.</p>
        <Button type="button" className="mt-4 h-12 w-full rounded-full text-base font-semibold shadow-[0_10px_24px_-12px_rgba(41,160,102,.9)]" onClick={go}>
          Passer la commande <span className="ml-auto tabular-nums">{formatFcfa(cart.subtotal)}</span>
        </Button>
        <button type="button" className="mt-2 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline" onClick={cart.clear}>Vider le panier</button>
      </div>
    </div>
  );
}

export function CartSheet() {
  const cart = useCart();
  return (
    <Sheet open={cart.open} onOpenChange={cart.setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b px-5 py-4 text-left">
          <SheetTitle className="font-display text-xl">Votre panier</SheetTitle>
          <SheetDescription>Un restaurant par commande. Le prix des plats est relu au moment de la commande.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden px-5 pb-5 pt-3"><CartPanel /></div>
      </SheetContent>
    </Sheet>
  );
}
