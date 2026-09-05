"use client"
import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const pinIcon = L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="44" viewBox="0 0 34 44"><path d="M17 1C8.2 1 1 8.1 1 16.9 1 28.6 17 43 17 43S33 28.6 33 16.9C33 8.1 25.8 1 17 1z" fill="#29A066" stroke="#1E2130" stroke-width="2"/><circle cx="17" cy="17" r="6" fill="#fff"/></svg>`,
  iconSize: [34, 44],
  iconAnchor: [17, 43],
});

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng], map.getZoom(), { animate: true }); }, [lat, lng, map]);
  return null;
}

function ClickHandler({ onChange }: { onChange: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onChange(e.latlng.lat, e.latlng.lng) });
  return null;
}

export default function MapPickerInner({ lat, lng, onChange, height = 320 }: { lat: number; lng: number; onChange: (lat: number, lng: number) => void; height?: number }) {
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);
  return (
    <MapContainer center={center} zoom={15} style={{ height, width: '100%', borderRadius: 8, zIndex: 0 }} scrollWheelZoom>
      <TileLayer attribution='&copy; OpenStreetMap' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={center}
        icon={pinIcon}
        draggable
        eventHandlers={{ dragend: (e) => { const p = (e.target as L.Marker).getLatLng(); onChange(p.lat, p.lng); } }}
      />
      <ClickHandler onChange={onChange} />
      <Recenter lat={lat} lng={lng} />
    </MapContainer>
  );
}
