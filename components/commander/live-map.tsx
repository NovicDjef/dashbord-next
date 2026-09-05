"use client"

import dynamic from "next/dynamic";
import type { LatLng } from "@/lib/geo";

const Inner = dynamic(() => import("./live-map-inner"), {
  ssr: false,
  loading: () => <div className="h-80 w-full animate-pulse bg-muted" />,
});

export function LiveMap(props: { restaurant?: LatLng | null; client?: LatLng | null; livreur?: LatLng | null; height?: number }) {
  return <Inner {...props} />;
}
