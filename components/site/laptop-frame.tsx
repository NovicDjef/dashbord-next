import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Cadre d'ordinateur portable (style MacBook) autour d'une vraie capture d'écran.
 * `ratio` = largeur / hauteur de la capture ; l'écran garde ce ratio, la coque s'adapte.
 */
export function LaptopFrame({ src, alt, ratio = 1456 / 815, className, priority = false, sizes = "(min-width: 1024px) 40vw, 92vw" }: { src: string; alt: string; ratio?: number; className?: string; priority?: boolean; sizes?: string }) {
  return (
    <div className={cn("relative w-full", className)}>
      {/* écran + bezel */}
      <div className="relative mx-auto w-[88%] rounded-t-[1.1rem] bg-[#0f1120] p-[1.6%] pb-[1.2%] shadow-[0_40px_90px_-35px_rgba(0,0,0,.7),inset_0_0_0_1px_#3a3d52]">
        <span className="absolute left-1/2 top-[0.55%] h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-[#2b2e44] shadow-[inset_0_0_0_1px_#1a1c2c]" aria-hidden="true" />
        <div className="relative overflow-hidden rounded-[0.45rem] bg-black" style={{ aspectRatio: String(ratio) }}>
          <Image src={src} alt={alt} fill sizes={sizes} className="object-cover object-top" priority={priority} />
        </div>
      </div>
      {/* base */}
      <div className="relative mx-auto h-[14px] w-full rounded-b-[0.6rem] bg-[linear-gradient(180deg,#e6e8ef,#b9bcc9)] shadow-[0_18px_40px_-20px_rgba(0,0,0,.6)]">
        <span className="absolute left-1/2 top-0 h-[5px] w-[14%] -translate-x-1/2 rounded-b-md bg-[#9a9db0]" aria-hidden="true" />
      </div>
      <div className="mx-auto h-[3px] w-[96%] rounded-b-full bg-[#8f92a5]" aria-hidden="true" />
    </div>
  );
}
