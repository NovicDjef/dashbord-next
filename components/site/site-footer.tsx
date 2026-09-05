import Link from "next/link";
import { Brand, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF, PLAY_STORE_CLIENT, PLAY_STORE_LIVREUR, APP_STORE_CLIENT, APP_STORE_LIVREUR } from "./brand";

const COLS = [
  {
    title: "Applications",
    links: [
      { label: "Koursier sur Google Play", href: PLAY_STORE_CLIENT, ext: true },
      { label: "Koursier sur l’App Store", href: APP_STORE_CLIENT, ext: true },
      { label: "Koursier Go sur Google Play", href: PLAY_STORE_LIVREUR, ext: true },
      { label: "Koursier Go sur l’App Store", href: APP_STORE_LIVREUR, ext: true },
    ],
  },
  {
    title: "Partenaires",
    links: [
      { label: "Inscrire mon restaurant", href: "/register" },
      { label: "Espace restaurant", href: "/login" },
      { label: "Tarifs de livraison", href: "#tarifs" },
      { label: "Comment ça marche", href: "#comment-ca-marche" },
      { label: "Questions fréquentes", href: "#faq" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: CONTACT_PHONE, href: CONTACT_PHONE_HREF },
      { label: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
      { label: "Douala, Cameroun", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/60">
      <div className="site-container grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Brand />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Repas, colis et gaz domestique livrés à Douala par le livreur le plus proche. Paiement Orange Money, MTN Mobile Money ou espèces.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <h4 className="mb-3 text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">{c.title}</h4>
            <ul className="space-y-2.5 text-sm">
              {c.links.map((l) => (
                <li key={l.label}>
                  {"ext" in l && l.ext ? (
                    <a href={l.href} target="_blank" rel="noreferrer" className="hover:text-primary">{l.label}</a>
                  ) : (
                    <Link href={l.href} className="hover:text-primary">{l.label}</Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t">
        <div className="site-container flex flex-col gap-2 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Koursier. Tous droits réservés.</span>
          <span>Conçu et opéré à Douala.</span>
        </div>
      </div>
    </footer>
  );
}
