"use client"

// Carte d'un plat + fenêtre d'ajout au panier (quantité, compléments, favori).
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { IconHeart, IconHeartFilled, IconPlus, IconToolsKitchen2 } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { imageUrl, type Complement } from "@/lib/client-api";
import { formatFcfa } from "@/lib/order-status";
import { useCart, type AddToCartInput, type CartComplement, type CartRestaurant } from "./providers";
import { useFavorites } from "./favorites";
import { QtyStepper } from "./cart-sheet";

export type PlatLite = { id: number; name: string; image?: string | null; description?: string | null; prix: number; disponible?: boolean; ratings?: number };

export function PlatCard({ plat, onOpen, restaurant, meta, disabled = false, disabledLabel = "Indisponible" }: { plat: PlatLite; onOpen: (p: PlatLite) => void; restaurant?: { id: number; name: string }; meta?: string; disabled?: boolean; disabledLabel?: string }) {
  const img = imageUrl(plat.image);
  const fav = useFavorites();
  const isFav = fav.isFavorite(plat.id);
  const restaurantName = meta;
  const favRestaurant = { id: restaurant?.id || 0, name: restaurant?.name || "" };
  return (
    <div className={`group relative flex gap-3 rounded-[1.25rem] border bg-card p-3 transition-shadow hover:shadow-[0_18px_36px_-24px_rgba(51,53,78,.45)] ${disabled ? "opacity-60" : ""}`}>
      <button type="button" onClick={() => !disabled && onOpen(plat)} className="flex min-w-0 flex-1 flex-col text-left" disabled={disabled}>
        <span className="font-display text-[15px] font-bold leading-tight">{plat.name}</span>
        {plat.description && <span className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{plat.description}</span>}
        {restaurantName && <span className="mt-1 truncate text-xs text-muted-foreground">{restaurantName}</span>}
        <span className="mt-auto pt-2 font-display font-bold tabular-nums">{formatFcfa(plat.prix)}</span>
      </button>
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
        {img ? <img src={img} alt="" className="h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><IconToolsKitchen2 className="h-6 w-6" /></div>}
        {!disabled && (
          <button type="button" onClick={() => onOpen(plat)} className="absolute bottom-1.5 right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-ink shadow-md transition-transform hover:scale-105" aria-label={`Ajouter ${plat.name}`}>
            <IconPlus className="h-4 w-4" />
          </button>
        )}
        {disabled && <span className="absolute inset-x-0 bottom-0 bg-brand-ink/80 py-0.5 text-center text-[10px] font-semibold text-white">{disabledLabel}</span>}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); const added = fav.toggle({ id: plat.id, name: plat.name, image: plat.image, prix: plat.prix, description: plat.description, restaurant: favRestaurant }); toast(added ? "Ajouté à vos plats enregistrés" : "Retiré de vos plats enregistrés"); }}
          className={`absolute left-1.5 top-1.5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors ${isFav ? "text-brand-red" : "text-brand-ink/50 hover:text-brand-red"}`}
          aria-pressed={isFav}
          aria-label={isFav ? "Retirer des enregistrés" : "Enregistrer ce plat"}
        >
          {isFav ? <IconHeartFilled className="h-4 w-4" /> : <IconHeart className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function PlatDialog({ plat, restaurant, complements, open, onOpenChange, closed = false }: {
  plat: PlatLite | null; restaurant: CartRestaurant | null; complements: Complement[]; open: boolean; onOpenChange: (o: boolean) => void; closed?: boolean;
}) {
  const cart = useCart();
  const fav = useFavorites();
  const [qty, setQty] = useState(1);
  const [sel, setSel] = useState<Record<number, number>>({});
  const [note, setNote] = useState("");
  const [conflict, setConflict] = useState<AddToCartInput | null>(null);

  useEffect(() => { if (open) { setQty(1); setSel({}); setNote(""); } }, [open, plat?.id]);

  const chosen: CartComplement[] = useMemo(() => complements.filter((c) => (sel[c.id] || 0) > 0).map((c) => ({ id: c.id, name: c.name, price: Number(c.price) || 0, quantity: sel[c.id] })), [complements, sel]);
  const unit = (Number(plat?.prix) || 0) + chosen.reduce((s, c) => s + c.price * c.quantity, 0);
  const total = unit * qty;

  const submit = () => {
    if (!plat || !restaurant) return;
    const input: AddToCartInput = { plat: { id: plat.id, name: plat.name, image: plat.image, prix: Number(plat.prix) || 0 }, quantity: qty, complements: chosen, restaurant };
    const r = cart.add(input);
    if (r === "CONFLICT") { setConflict(input); return; }
    toast.success(`${qty}× ${plat.name} ajouté au panier`, { action: { label: "Voir le panier", onClick: () => cart.setOpen(true) } });
    onOpenChange(false);
  };

  const img = imageUrl(plat?.image);
  const isFav = plat ? fav.isFavorite(plat.id) : false;

  return (
    <>
      <Dialog open={open && !!plat} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[92vh] overflow-y-auto p-0 sm:max-w-lg">
          {plat && (
            <>
              <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
                {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center text-muted-foreground"><IconToolsKitchen2 className="h-10 w-10" /></div>}
                <button
                  type="button"
                  onClick={() => { const added = fav.toggle({ id: plat.id, name: plat.name, image: plat.image, prix: plat.prix, description: plat.description, restaurant: { id: restaurant?.id || 0, name: restaurant?.name || "" } }); toast(added ? "Ajouté à vos plats enregistrés" : "Retiré de vos plats enregistrés"); }}
                  className={`absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow ${isFav ? "text-brand-red" : "text-brand-ink"}`}
                  aria-pressed={isFav} aria-label="Enregistrer ce plat"
                >
                  {isFav ? <IconHeartFilled className="h-5 w-5" /> : <IconHeart className="h-5 w-5" />}
                </button>
              </div>
              <div className="space-y-5 p-5">
                <DialogHeader className="text-left">
                  <DialogTitle className="font-display text-2xl leading-tight">{plat.name}</DialogTitle>
                  <DialogDescription className="text-sm">{plat.description || `Chez ${restaurant?.name || "ce restaurant"}`}</DialogDescription>
                  <p className="font-display text-xl font-bold tabular-nums">{formatFcfa(plat.prix)}</p>
                </DialogHeader>

                {complements.length > 0 && (
                  <section>
                    <div className="mb-2 flex items-baseline justify-between">
                      <h4 className="font-display font-bold">Compléments</h4>
                      <span className="text-xs text-muted-foreground">Facultatif</span>
                    </div>
                    <ul className="divide-y rounded-xl border">
                      {complements.map((c) => {
                        const q = sel[c.id] || 0;
                        return (
                          <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{c.name}</p>
                              <p className="text-xs text-muted-foreground tabular-nums">+{formatFcfa(c.price)}</p>
                            </div>
                            {q === 0 ? (
                              <button type="button" onClick={() => setSel({ ...sel, [c.id]: 1 })} className="inline-flex h-8 items-center gap-1 rounded-full border px-3 text-xs font-semibold hover:border-primary hover:text-primary"><IconPlus className="h-3.5 w-3.5" />Ajouter</button>
                            ) : (
                              <QtyStepper value={q} onChange={(v) => setSel({ ...sel, [c.id]: Math.max(0, v) })} />
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                )}

                <section>
                  <label htmlFor="plat-note" className="mb-2 block font-display font-bold">Une précision pour la cuisine ?</label>
                  <Textarea id="plat-note" rows={2} placeholder="Ex. sans piment, bien cuit…" value={note} onChange={(e) => setNote(e.target.value)} />
                  <p className="mt-1 text-xs text-muted-foreground">Elle sera reprise dans les instructions de la commande.</p>
                </section>

                {closed ? (
                  <p className="rounded-xl bg-brand-cream px-4 py-3 text-sm text-brand-ink dark:text-foreground">Ce restaurant est fermé pour le moment. Vous pourrez commander à sa réouverture.</p>
                ) : (
                  <div className="flex items-center gap-3">
                    <QtyStepper value={qty} onChange={(v) => setQty(Math.max(1, v))} min={1} size="md" />
                    <Button type="button" className="h-11 flex-1 rounded-full text-base font-semibold" onClick={() => { if (note.trim()) sessionStorage.setItem("koursier_note", [sessionStorage.getItem("koursier_note"), `${plat.name} : ${note.trim()}`].filter(Boolean).join(" · ")); submit(); }}>
                      Ajouter <span className="ml-auto tabular-nums">{formatFcfa(total)}</span>
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!conflict} onOpenChange={(o) => !o && setConflict(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Commencer un nouveau panier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Votre panier contient déjà des plats de <b>{cart.restaurant?.name}</b>. Une commande ne peut venir que d’un seul restaurant : voulez-vous le remplacer par <b>{conflict?.restaurant.name}</b> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full">Garder mon panier</AlertDialogCancel>
            <AlertDialogAction className="rounded-full" onClick={() => { if (conflict) { cart.replaceWith(conflict); toast.success("Nouveau panier commencé"); } setConflict(null); onOpenChange(false); }}>Remplacer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
