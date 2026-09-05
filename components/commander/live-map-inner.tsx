"use client"

// Carte de suivi : restaurant (orange), client (vert), livreur (scooter) et trajet en pointillés.
import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLng } from "@/lib/geo";

const pin = (fill: string, inner: string) => L.divIcon({
  className: "",
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 1C8.2 1 1 8.1 1 16.9 1 28.6 17 43 17 43S33 28.6 33 16.9C33 8.1 25.8 1 17 1z" fill="${fill}" stroke="#33354e" stroke-width="2"/>${inner}</svg>`,
  iconSize: [34, 44], iconAnchor: [17, 43],
});
const restaurantIcon = pin("#fbb344", `<path d="M10 20a7 7 0 0 1 14 0z M9 22h16" fill="none" stroke="#33354e" stroke-width="2" stroke-linecap="round"/>`);
const homeIcon = pin("#29a066", `<path d="M10 17l7-6 7 6M12 16v7h10v-7" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`);
const riderIcon = L.divIcon({
  className: "",
  html: `<div style="width:44px;height:44px;border-radius:50%;background:#fff;box-shadow:0 6px 16px rgba(51,53,78,.35);display:flex;align-items:center;justify-content:center;border:3px solid #29a066"><svg viewBox="0 0 64 44" width="28" height="20" fill="#33354e"><path d="M17 26h16l6-12h7a2 2 0 0 1 0 4h-4.6l-4 8H52a6 6 0 0 1 6 6v2H17z"/><circle cx="34" cy="7.5" r="4.5"/><path d="M29 12h9l4 8-3 3-4-4h-3l-2 5h-5z"/><circle cx="16" cy="36" r="6.5" fill="none" stroke="#33354e" stroke-width="3.5"/><circle cx="52" cy="36" r="6.5" fill="none" stroke="#33354e" stroke-width="3.5"/></svg></div>`,
  iconSize: [44, 44], iconAnchor: [22, 22],
});

function Fit({ points }: { points: LatLng[] }) {
  const map = useMap();
  const key = points.map((p) => `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`).join("|");
  useEffect(() => {
    if (points.length === 0) return;
    if (points.length === 1) { map.setView([points[0].lat, points[0].lng], 15); return; }
    map.fitBounds(L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40], maxZoom: 16 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

export default function LiveMapInner({ restaurant, client, livreur, height = 320 }: { restaurant?: LatLng | null; client?: LatLng | null; livreur?: LatLng | null; height?: number }) {
  const points = useMemo(() => [restaurant, client, livreur].filter((p): p is LatLng => !!p && Number.isFinite(p.lat) && Number.isFinite(p.lng)), [restaurant, client, livreur]);
  const center: [number, number] = points.length ? [points[0].lat, points[0].lng] : [4.0511, 9.7679];
  const route = useMemo(() => {
    const seq = [restaurant, livreur, client].filter((p): p is LatLng => !!p);
    return seq.map((p) => [p.lat, p.lng] as [number, number]);
  }, [restaurant, livreur, client]);

  return (
    <MapContainer center={center} zoom={14} style={{ height, width: "100%", zIndex: 0 }} scrollWheelZoom={false}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {route.length >= 2 && <Polyline positions={route} pathOptions={{ color: "#29a066", weight: 4, dashArray: "8 10", opacity: 0.85 }} />}
      {restaurant && <Marker position={[restaurant.lat, restaurant.lng]} icon={restaurantIcon} />}
      {client && <Marker position={[client.lat, client.lng]} icon={homeIcon} />}
      {livreur && <Marker position={[livreur.lat, livreur.lng]} icon={riderIcon} zIndexOffset={1000} />}
      <Fit points={points} />
    </MapContainer>
  );
}
