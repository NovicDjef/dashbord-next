// Aide : questions fréquentes de l'application et contact de l'assistance.
import Link from "next/link";
import { IconBrandWhatsapp, IconMail, IconPhone, IconPlus } from "@tabler/icons-react";
import { AppBadges, CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/components/site/brand";
import { FARE } from "@/lib/fare";
import { formatFcfa } from "@/lib/order-status";

const FAQ = [
  { q: "Comment suivre ma commande ?", a: "Ouvrez « Commandes » : chaque commande affiche son étape en cours, la position du livreur sur la carte dès qu’il a accepté la course, et son numéro pour l’appeler." },
  { q: "À quoi sert le code à 5 chiffres ?", a: "C’est votre code de remise. Il apparaît dès qu’un livreur prend la commande. Donnez-le au livreur à la réception : il clôture la livraison. Ne le communiquez à personne d’autre." },
  { q: "Combien coûte la livraison ?", a: `${formatFcfa(FARE.base)} jusqu’à ${FARE.franchiseKm} km entre le restaurant et vous, puis ${formatFcfa(FARE.perKm)} par kilomètre supplémentaire entamé. Le montant exact est affiché avant de confirmer.` },
  { q: "Comment payer ?", a: "En espèces au livreur, ou en MTN Mobile Money / Orange Money : une demande de validation s’affiche sur votre téléphone juste après la commande. Si le paiement en ligne échoue, vous payez à la livraison." },
  { q: "Puis-je annuler ?", a: "Oui, tant qu’aucun livreur n’a pris la commande en charge, depuis la page de la commande. Ensuite, appelez l’assistance." },
  { q: "Pourquoi un restaurant est-il grisé ?", a: "Il est fermé selon ses horaires. Vous pouvez voir son menu et enregistrer des plats ; la commande sera possible à sa réouverture." },
  { q: "Mes commandes de l’application sont-elles ici ?", a: "Oui. Le site et l’application Koursier utilisent le même compte (numéro de téléphone et mot de passe). Tout ce que vous faites d’un côté apparaît de l’autre." },
  { q: "Comment envoyer un colis ?", a: "Depuis « Colis » : indiquez le point de départ, le point d’arrivée, le destinataire et une description. Un livreur proche le récupère et le remet contre le code de remise." },
];

export default function AidePage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-extrabold text-brand-ink sm:text-3xl dark:text-foreground">Aide</h1>
        <p className="mt-1 text-sm text-muted-foreground">Les réponses aux questions les plus fréquentes, et l’assistance si besoin.</p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <a href={CONTACT_PHONE_HREF} className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/60"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint text-primary"><IconPhone className="h-5 w-5" /></span><span><span className="block text-xs text-muted-foreground">Appeler</span><span className="block font-semibold">{CONTACT_PHONE}</span></span></a>
        <a href={`https://wa.me/${CONTACT_PHONE_HREF.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/60"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-mint text-primary"><IconBrandWhatsapp className="h-5 w-5" /></span><span><span className="block text-xs text-muted-foreground">WhatsApp</span><span className="block font-semibold">Écrire à l’assistance</span></span></a>
        <a href={`mailto:${CONTACT_EMAIL}`} className="flex items-center gap-3 rounded-2xl border bg-card p-4 hover:border-primary/60"><span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-cream text-brand-ink"><IconMail className="h-5 w-5" /></span><span><span className="block text-xs text-muted-foreground">Email</span><span className="block truncate font-semibold">{CONTACT_EMAIL}</span></span></a>
      </section>

      <section className="divide-y rounded-[1.5rem] border bg-card">
        {FAQ.map((f) => (
          <details key={f.q} className="faq group px-5">
            <summary className="flex items-center justify-between gap-4 py-4 font-semibold">{f.q}<span className="faq-plus inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted"><IconPlus className="h-4 w-4" /></span></summary>
            <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </section>

      <section className="pattern-on-dark rounded-[1.5rem] bg-brand-ink p-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Application Koursier pour les clients</p>
        <h2 className="mt-1 font-display text-xl font-bold">Les mêmes commandes, avec les notifications</h2>
        <p className="mt-2 text-sm text-white/70">Connectez-vous avec le même numéro dans l’application pour être prévenu à chaque étape de la livraison.</p>
        <AppBadges app="client" tone="light" className="mt-4" />
      </section>

      <p className="text-sm text-muted-foreground">Vous êtes restaurateur ? <Link href="/register" className="font-semibold text-primary underline-offset-4 hover:underline">Inscrivez votre restaurant</Link>.</p>
    </div>
  );
}
