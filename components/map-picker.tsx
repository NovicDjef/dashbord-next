"use client"
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { IconCurrentLocation } from '@tabler/icons-react';

const MapPickerInner = dynamic(() => import('./map-picker-inner'), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse rounded-lg bg-muted" />,
});

// Douala par défaut
export const DEFAULT_POSITION = { lat: 4.0511, lng: 9.7679 };

interface Props {
  lat: number | null | undefined;
  lng: number | null | undefined;
  onChange: (lat: number, lng: number) => void;
  height?: number;
  /** Texte d'aide sous la carte (par défaut : formulation pour un restaurant). */
  hint?: string;
}

/**
 * Sélecteur de position : carte OpenStreetMap avec marqueur déplaçable, clic pour placer,
 * bouton « ma position » et champs latitude / longitude éditables.
 */
export function MapPicker({ lat, lng, onChange, height = 320, hint }: Props) {
  const [locating, setLocating] = useState(false);
  const cur = { lat: Number.isFinite(Number(lat)) ? Number(lat) : DEFAULT_POSITION.lat, lng: Number.isFinite(Number(lng)) ? Number(lng) : DEFAULT_POSITION.lng };

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { onChange(p.coords.latitude, p.coords.longitude); setLocating(false); },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-3">
      <MapPickerInner lat={cur.lat} lng={cur.lng} onChange={onChange} height={height} />
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid flex-1 grid-cols-2 gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Latitude</span>
            <Input type="number" step="0.000001" value={cur.lat} onChange={(e) => onChange(parseFloat(e.target.value) || 0, cur.lng)} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-muted-foreground">Longitude</span>
            <Input type="number" step="0.000001" value={cur.lng} onChange={(e) => onChange(cur.lat, parseFloat(e.target.value) || 0)} />
          </label>
        </div>
        <Button type="button" variant="outline" onClick={locate} disabled={locating}>
          <IconCurrentLocation className="mr-2 h-4 w-4" />
          {locating ? 'Localisation…' : 'Ma position'}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">{hint ?? "Cliquez sur la carte ou déplacez le marqueur pour positionner précisément le restaurant. Cette position sert au tri par distance dans l'application client et au calcul des frais de livraison."}</p>
    </div>
  );
}
