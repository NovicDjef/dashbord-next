"use client"

// Choix de l'adresse de livraison : position GPS ou repère déplacé sur la carte + libellé (quartier, repère).
import { useEffect, useState } from "react";
import { IconCurrentLocation, IconMapPin } from "@tabler/icons-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPicker } from "@/components/map-picker";
import { reverseGeocode } from "@/lib/geo";
import { useLocation } from "./providers";

export function AddressDialog() {
  const loc = useLocation();
  const [pos, setPos] = useState(loc.pos);
  const [label, setLabel] = useState(loc.label);
  const [geocoding, setGeocoding] = useState(false);

  useEffect(() => {
    if (loc.open) { setPos(loc.pos); setLabel(loc.source === "default" ? "" : loc.label); }
  }, [loc.open, loc.pos, loc.label, loc.source]);

  const onMap = async (lat: number, lng: number) => {
    const p = { lat, lng };
    setPos(p);
    setGeocoding(true);
    const l = await reverseGeocode(p);
    setGeocoding(false);
    if (l) setLabel(l);
  };

  const useGps = async () => {
    const ok = await loc.locate();
    if (ok) loc.setOpen(false);
  };

  const save = () => {
    loc.setManual(pos, label.trim() || "Position choisie sur la carte");
    loc.setOpen(false);
  };

  return (
    <Dialog open={loc.open} onOpenChange={loc.setOpen}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Où livrer ?</DialogTitle>
          <DialogDescription>Votre position détermine les restaurants affichés et les frais de livraison. Placez le repère sur votre porte.</DialogDescription>
        </DialogHeader>
        <Button type="button" variant="outline" className="h-11 w-full justify-start gap-2 rounded-xl" onClick={useGps} disabled={loc.locating}>
          <IconCurrentLocation className="h-4 w-4 text-primary" />
          {loc.locating ? "Localisation en cours…" : "Utiliser ma position actuelle"}
        </Button>
        <div className="overflow-hidden rounded-xl border">
          <MapPicker lat={pos.lat} lng={pos.lng} onChange={onMap} height={280} hint="Cliquez sur la carte ou déplacez le repère jusqu'à votre adresse de livraison." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="addr-label">Quartier et repère</Label>
          <div className="relative">
            <IconMapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="addr-label" className="h-11 pl-9" placeholder={geocoding ? "Recherche de l'adresse…" : "Ex. Makepe, carrefour Bloc L, immeuble bleu"} value={label} onChange={(e) => setLabel(e.target.value)} />
          </div>
          <p className="text-xs text-muted-foreground">Ce texte est transmis au livreur avec la position exacte.</p>
        </div>
        <Button type="button" className="h-11 w-full rounded-full font-semibold" onClick={save}>Livrer ici</Button>
      </DialogContent>
    </Dialog>
  );
}
