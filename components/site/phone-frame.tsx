import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cadre de téléphone réaliste (proportions iPhone 15, écran 1179×2556) autour d'une vraie capture d'écran.
 * `width` pilote toute la géométrie ; la capture remplit l'écran sans déformation.
 */
export function PhoneFrame({ src, alt, width = 300, className, priority = false }: { src: string; alt: string; width?: number; className?: string; priority?: boolean }) {
  const height = Math.round(width * 2.16);
  return (
    <div className={cn("relative shrink-0", className)} style={{ width, height }}>
      {/* boutons latéraux */}
      <span className="absolute -left-[3px] top-[18%] h-[7%] w-[3px] rounded-l-sm bg-[#2a2c3d]" aria-hidden="true" />
      <span className="absolute -left-[3px] top-[28%] h-[11%] w-[3px] rounded-l-sm bg-[#2a2c3d]" aria-hidden="true" />
      <span className="absolute -right-[3px] top-[24%] h-[14%] w-[3px] rounded-r-sm bg-[#2a2c3d]" aria-hidden="true" />
      {/* coque */}
      <div className="absolute inset-0 rounded-[13%/6%] bg-[#111321] shadow-[0_40px_90px_-30px_rgba(0,0,0,.75),inset_0_0_0_2px_#3a3d52]" />
      {/* écran */}
      <div className="absolute inset-[2.6%] overflow-hidden rounded-[11.5%/5.3%] bg-black">
        <Image src={src} alt={alt} fill sizes={`${width}px`} className="object-cover" priority={priority} />
        {/* dynamic island */}
        <span className="absolute left-1/2 top-[1.6%] h-[3.4%] w-[32%] -translate-x-1/2 rounded-full bg-black" aria-hidden="true" />
        {/* reflet léger */}
        <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,.10),transparent_38%)]" aria-hidden="true" />
      </div>
    </div>
  );
}
