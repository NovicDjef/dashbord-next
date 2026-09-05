import Link from "next/link";
import Image from "next/image";
import {
  IconArrowRight, IconBellRinging, IconBuildingStore, IconClock, IconDeviceMobile, IconFlame, IconMapPin,
  IconMotorbike, IconPackage, IconPhone, IconShieldCheck, IconToolsKitchen2, IconWallet, IconPlus, IconChefHat,
} from "@tabler/icons-react";
import { SiteNav } from "@/components/site/site-nav";
import { SiteFooter } from "@/components/site/site-footer";
import { FareEstimator } from "@/components/site/fare-estimator";
import { FARE, computeFare } from "@/lib/fare";
import { AppBadges, ScooterIcon, CONTACT_PHONE, CONTACT_PHONE_HREF } from "@/components/site/brand";
import { formatFcfa } from "@/lib/order-status";

/* ------------------------------------------------------------------ */
/* Contenu                                                            */
/* ------------------------------------------------------------------ */

const AUDIENCES = [
  {
    key: "client",
    eyebrow: "Je commande",
    title: "Sur le site ou dans l'app",
    text: "Les restaurants ouverts autour de vous, triés par distance. Panier, paiement mobile et suivi du livreur sur la carte, ici même ou dans l'application Koursier.",
    cta: { label: "Commander en ligne", href: "/commander", ext: false },
    tone: "bg-brand-mint",
    icon: IconDeviceMobile,
    iconTone: "bg-primary text-primary-foreground",
  },
  {
    key: "restaurant",
    eyebrow: "Je suis restaurateur",
    title: "L'espace restaurant",
    text: "Recevez les commandes sur votre écran avec une sonnerie, gérez menu, prix, photos et horaires. Inscription gratuite.",
    cta: { label: "Inscrire mon restaurant", href: "/register", ext: false },
    tone: "bg-brand-cream",
    icon: IconBuildingStore,
    iconTone: "bg-brand-orange text-brand-ink",
  },
  {
    key: "livreur",
    eyebrow: "Je livre",
    title: "Koursier Go",
    text: "Les courses proches de vous arrivent sur votre téléphone. Acceptez en un geste, encaissez vos gains sur Mobile Money.",
    cta: { label: "Télécharger Koursier Go", href: "#applications", ext: false },
    tone: "bg-brand-ink text-white",
    icon: IconMotorbike,
    iconTone: "bg-white text-brand-ink",
  },
];

const STEPS = [
  { title: "Vous commandez", text: "Un restaurant ouvert près de vous, votre panier, puis le paiement en Mobile Money ou à la livraison." },
  { title: "Le restaurant confirme", text: "Il accepte la commande, la prépare et signale quand elle est prête." },
  { title: "Le livreur le plus proche accepte", text: "La course est proposée aux livreurs en ligne autour du restaurant. Le premier qui accepte part la chercher." },
  { title: "Vous suivez en direct", text: "Position du livreur sur la carte et notification à chaque étape." },
  { title: "Remise avec votre code", text: "Le livreur saisit votre code de livraison : la commande est clôturée, sans confusion possible." },
];

const SERVICES = [
  { icon: IconToolsKitchen2, title: "Repas", text: "Vos restaurants de quartier, leurs menus et leurs prix, livrés chauds.", tone: "text-primary bg-brand-mint" },
  { icon: IconPackage, title: "Colis", text: "Un document, un colis, un oubli à faire passer d'un bout à l'autre de la ville.", tone: "text-brand-ink bg-brand-cream" },
  { icon: IconFlame, title: "Gaz domestique", text: "Bouteille de gaz livrée à domicile par les vendeurs proches, toutes marques.", tone: "text-brand-orange bg-brand-ink/5" },
];

const FARE_EXAMPLES = [1.5, 3.2, 6, 9.4];

const RESTO_POINTS = [
  { icon: IconBellRinging, title: "Sonnerie à chaque commande", text: "Le tableau se met à jour tout seul. Vous acceptez, préparez, marquez prête." },
  { icon: IconChefHat, title: "Menu à votre image", text: "Catégories, plats, compléments, photos et disponibilité en un clic." },
  { icon: IconClock, title: "Horaires respectés", text: "Fermé le lundi ? Les clients ne peuvent pas commander. Ouvert jusqu'à 23 h ? Ils le voient." },
  { icon: IconMapPin, title: "Visible par les clients proches", text: "Votre position exacte sur la carte détermine qui vous voit et les frais de livraison." },
];

const LIVREUR_POINTS = [
  { icon: IconBellRinging, title: "Courses proposées près de vous", text: "Chaque course est envoyée aux livreurs en ligne les plus proches du restaurant." },
  { icon: IconShieldCheck, title: "Une course à la fois", text: "Vous acceptez, vous livrez, vous validez avec le code du client." },
  { icon: IconWallet, title: "Gains retirés en Mobile Money", text: "Solde disponible dans l'app, retrait vers Orange Money ou MTN MoMo." },
];

const FAQ = [
  { q: "Dans quelles villes Koursier livre-t-il ?", a: "À Douala aujourd'hui. Les restaurants et les livreurs sont affichés en fonction de votre position, quartier par quartier." },
  { q: "Comment payer ma commande ?", a: "Orange Money, MTN Mobile Money ou en espèces à la livraison. Le montant total, frais de livraison compris, est affiché avant de confirmer." },
  { q: "Combien coûte la livraison ?", a: `${formatFcfa(FARE.base)} CFA jusqu'à ${FARE.franchiseKm} km entre le restaurant et vous, puis ${formatFcfa(FARE.perKm)} CFA par kilomètre supplémentaire entamé. Le tarif est calculé et affiché avant chaque commande.` },
  { q: "Comment inscrire mon restaurant ?", a: "Créez votre compte en deux étapes sur cette page, placez votre restaurant sur la carte, préparez votre menu. L'équipe Koursier valide votre restaurant, puis il apparaît dans l'application." },
  { q: "Comment devenir livreur ?", a: "Installez Koursier Go sur Android ou iPhone, créez votre compte, passez en ligne. Les courses proches de vous arrivent directement sur votre téléphone." },
];

/* ------------------------------------------------------------------ */
/* Maquettes d'écran (HTML/CSS, données d'exemple)                     */
/* ------------------------------------------------------------------ */

function RestaurantBoardMock() {
  const cols = [
    { title: "Nouvelles", n: 2, tone: "bg-brand-orange/25 text-brand-ink", cards: [{ id: 184, who: "Aïcha", items: "2× Ndolé riz · 1× Jus", total: 7500, when: "à l'instant" }, { id: 183, who: "Brice", items: "1× Poulet DG", total: 5000, when: "il y a 2 min" }] },
    { title: "En préparation", n: 1, tone: "bg-brand-mint text-secondary-foreground", cards: [{ id: 182, who: "Merveille", items: "3× Eru · 3× Water-fufu", total: 9000, when: "il y a 9 min" }] },
    { title: "Prêtes", n: 1, tone: "bg-secondary text-secondary-foreground", cards: [{ id: 181, who: "Kevin", items: "1× Poisson braisé", total: 6000, when: "livreur en route" }] },
  ];
  return (
    <div className="rounded-[1.5rem] border bg-card p-3 shadow-[0_30px_80px_-40px_rgba(51,53,78,.5)] sm:p-4" aria-label="Aperçu du tableau des commandes (exemple)">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground"><IconChefHat className="h-4 w-4" /></span>
          <span className="font-display text-sm font-bold">Chez Mama Nguéa</span>
          <span className="rounded-full bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground">Validé</span>
        </div>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground"><span className="h-2 w-2 rounded-full bg-primary" />Actualisé il y a 3 s</span>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {cols.map((c) => (
          <div key={c.title} className="min-w-0 rounded-xl bg-muted/70 p-2">
            <div className="mb-2 flex items-center justify-between px-1 text-[11px] font-semibold"><span>{c.title}</span><span className={`rounded-full px-1.5 ${c.tone}`}>{c.n}</span></div>
            <div className="space-y-2">
              {c.cards.map((k) => (
                <div key={k.id} className="rounded-lg border bg-card p-2 text-[11px] leading-snug">
                  <div className="flex justify-between font-semibold"><span>#{k.id}</span><span className="text-muted-foreground font-normal">{k.when}</span></div>
                  <div className="truncate text-muted-foreground">{k.who} · {k.items}</div>
                  <div className="mt-1 flex items-center justify-between"><b className="tabular-nums">{formatFcfa(k.total)}</b>{c.title === "Nouvelles" && <span className="rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">Accepter</span>}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProposalPhoneMock() {
  return (
    <div className="relative mx-auto w-[280px] rounded-[2.4rem] border-[6px] border-[#1c1e30] bg-[#0f1120] p-2 shadow-[0_40px_90px_-40px_rgba(0,0,0,.8)]" aria-label="Aperçu d'une proposition de course dans Koursier Go (exemple)">
      <div className="mx-auto mb-2 h-5 w-24 rounded-full bg-black" />
      <div className="overflow-hidden rounded-[1.8rem] bg-white text-brand-ink">
        <div className="bg-primary px-4 pb-4 pt-5 text-white">
          <div className="flex items-center justify-between text-[11px] font-medium opacity-90"><span>Koursier Go</span><span className="rounded-full bg-white/20 px-2 py-0.5">En ligne</span></div>
          <p className="mt-3 font-display text-lg font-bold leading-tight">Nouvelle course</p>
          <p className="text-xs opacity-90">à 1,3 km de vous</p>
        </div>
        <div className="space-y-3 px-4 py-4 text-[12px]">
          <div className="flex items-start gap-2"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-brand-orange" /><div><div className="font-semibold">Chez Mama Nguéa</div><div className="text-muted-foreground">Bonapriso, rue Njo-Njo</div></div></div>
          <div className="ml-2 h-4 border-l-2 border-dashed border-border" />
          <div className="flex items-start gap-2"><span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary" /><div><div className="font-semibold">Aïcha · 4,1 km</div><div className="text-muted-foreground">Akwa, face pharmacie du Wouri</div></div></div>
          <div className="flex items-center justify-between rounded-xl bg-muted px-3 py-2"><span className="text-muted-foreground">Frais de course</span><b className="font-display text-base tabular-nums">{formatFcfa(computeFare(4.1))} CFA</b></div>
          <div className="grid grid-cols-[1fr_2fr] gap-2 pt-1">
            <span className="rounded-full border py-2 text-center font-semibold">Refuser</span>
            <span className="rounded-full bg-primary py-2 text-center font-semibold text-white">Accepter · 27 s</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                               */
/* ------------------------------------------------------------------ */

export default function HomePage() {
  return (
    <>
      <a href="#contenu" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground">Aller au contenu</a>
      <SiteNav />

      <main id="contenu">
        {/* ---------------- Hero ---------------- */}
        <section className="relative isolate overflow-hidden">
          <div className="pointer-events-none absolute -right-40 -top-40 -z-10 hidden h-[34rem] w-[34rem] rounded-full bg-brand-mint blur-3xl sm:block dark:bg-primary/10" aria-hidden="true" />
          <div className="site-container grid items-center gap-12 py-14 lg:grid-cols-[1.05fr_.95fr] lg:py-20">
            <div className="max-w-xl">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold">
                <span className="h-2 w-2 rounded-full bg-primary" /> Douala, Cameroun
              </p>
              <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-brand-ink sm:text-6xl dark:text-foreground">
                Commandez près de chez vous. Livré par <span className="mark-orange">le livreur le plus proche</span>.
              </h1>
              <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Repas de vos restaurants préférés, colis et gaz domestique, livrés en moins d’une heure et payés en Orange Money ou MTN Mobile Money.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href="/commander" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_rgba(41,160,102,.9)] transition-transform hover:-translate-y-0.5">
                  Commander en ligne <IconArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full border-2 border-brand-ink/15 px-5 py-3 font-semibold transition-colors hover:border-primary hover:text-primary">
                  Je suis restaurateur
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="text-sm text-muted-foreground">Ou avec l’application :</span>
                <AppBadges app="client" />
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><IconDeviceMobile className="h-4 w-4 text-primary" />Android et iOS</li>
                <li className="flex items-center gap-2"><IconShieldCheck className="h-4 w-4 text-primary" />Frais dès {formatFcfa(FARE.base)} CFA</li>
                <li className="flex items-center gap-2"><IconMapPin className="h-4 w-4 text-primary" />Suivi du livreur en direct</li>
                <li className="flex items-center gap-2"><IconPhone className="h-4 w-4 text-primary" />Code de remise en main propre</li>
              </ul>
            </div>
            <div className="lg:justify-self-end lg:w-full lg:max-w-[30rem]">
              <FareEstimator />
            </div>
          </div>
        </section>

        {/* ---------------- Trois publics ---------------- */}
        <section className="site-container pb-6 pt-4 lg:pt-8">
          <div className="grid gap-4 md:grid-cols-3">
            {AUDIENCES.map((a) => (
              <article key={a.key} className={`group relative flex flex-col overflow-hidden rounded-[1.5rem] p-6 sm:p-7 ${a.tone}`}>
                <a.icon className="pointer-events-none absolute -bottom-8 -right-8 h-40 w-40 rotate-[-12deg] opacity-[.07]" aria-hidden="true" />
                <span className={`mb-8 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${a.iconTone}`}><a.icon className="h-6 w-6" /></span>
                <p className="text-[11px] font-semibold uppercase tracking-[.14em] opacity-70">{a.eyebrow}</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{a.title}</h2>
                <p className={`mt-2 flex-1 text-[15px] leading-relaxed ${a.key === "livreur" ? "text-white/75" : "text-muted-foreground"}`}>{a.text}</p>
                {a.cta.ext ? (
                  <a href={a.cta.href} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">{a.cta.label} <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></a>
                ) : (
                  <Link href={a.cta.href} className="mt-6 inline-flex items-center gap-2 font-semibold underline-offset-4 hover:underline">{a.cta.label} <IconArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ---------------- Comment ça marche ---------------- */}
        <section id="comment-ca-marche" className="site-container scroll-mt-20 py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary">Comment ça marche</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-ink sm:text-4xl dark:text-foreground">De la commande à votre porte, en cinq étapes</h2>
          </div>
          <ol className="relative mt-12 grid gap-8 md:grid-cols-5 md:gap-5">
            <div className="absolute left-5 top-0 h-full w-px bg-border md:left-0 md:top-5 md:h-px md:w-full" aria-hidden="true" />
            {STEPS.map((s, i) => (
              <li key={s.title} className="relative pl-14 md:pl-0 md:pt-14">
                <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary bg-background font-display text-sm font-bold text-primary md:left-0">{i + 1}</span>
                <h3 className="font-display text-lg font-bold leading-snug">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------------- Services ---------------- */}
        <section className="bg-muted/50">
          <div className="site-container py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary">Trois services, une app</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-brand-ink sm:text-4xl dark:text-foreground">Tout ce qui doit traverser la ville</h2>
                <p className="mt-4 text-lg text-muted-foreground">Le même livreur, la même carte et le même suivi, que ce soit pour un plat, un colis ou une bouteille de gaz.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                {SERVICES.map((s) => (
                  <div key={s.title} className="rounded-[1.25rem] border bg-card p-5">
                    <span className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${s.tone}`}><s.icon className="h-5 w-5" /></span>
                    <h3 className="mt-4 font-display text-xl font-bold">{s.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Restaurants ---------------- */}
        <section id="restaurants" className="site-container scroll-mt-20 py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1"><RestaurantBoardMock /></div>
            <div className="order-1 lg:order-2">
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-orange">Pour les restaurants</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-brand-ink sm:text-4xl dark:text-foreground">Vos commandes arrivent sur votre écran, vos livreurs aussi</h2>
              <p className="mt-4 text-lg text-muted-foreground">Un espace gratuit pour recevoir, préparer et suivre les commandes, sans téléphone qui sonne dans tous les sens.</p>
              <ul className="mt-8 space-y-5">
                {RESTO_POINTS.map((p) => (
                  <li key={p.title} className="flex gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-cream text-brand-ink"><p.icon className="h-5 w-5" /></span>
                    <div><h3 className="font-semibold">{p.title}</h3><p className="text-[15px] text-muted-foreground">{p.text}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground shadow-[0_10px_24px_-12px_rgba(41,160,102,.9)] transition-transform hover:-translate-y-0.5"><IconPlus className="h-4 w-4" />Inscrire mon restaurant</Link>
                <Link href="/login" className="inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold hover:bg-muted">Déjà partenaire ? Se connecter</Link>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Tarifs ---------------- */}
        <section id="tarifs" className="pattern-on-tint scroll-mt-20 bg-brand-mint/80 dark:bg-secondary/40">
          <div className="site-container py-20 lg:py-24">
            <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary">Tarifs de livraison</p>
                <h2 className="mt-2 font-display text-3xl font-bold text-brand-ink sm:text-4xl dark:text-foreground">Un prix connu avant de commander</h2>
                <p className="mt-4 text-lg text-muted-foreground">Les frais dépendent seulement de la distance entre le restaurant et vous. Ils sont les mêmes pour tous les restaurants.</p>
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-card p-5">
                    <p className="font-display text-4xl font-extrabold tabular-nums text-brand-ink dark:text-foreground">{formatFcfa(FARE.base)}<span className="text-base font-semibold text-muted-foreground"> CFA</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">jusqu’à {FARE.franchiseKm} km</p>
                  </div>
                  <div className="rounded-2xl bg-card p-5">
                    <p className="font-display text-4xl font-extrabold tabular-nums text-brand-ink dark:text-foreground">+{formatFcfa(FARE.perKm)}<span className="text-base font-semibold text-muted-foreground"> CFA</span></p>
                    <p className="mt-1 text-sm text-muted-foreground">par km supplémentaire entamé</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Paiement Orange Money, MTN Mobile Money ou espèces à la livraison.</p>
              </div>
              <div className="overflow-x-auto rounded-2xl border bg-card">
                <table className="w-full text-left text-sm">
                  <caption className="px-5 pt-5 text-left font-display text-lg font-bold">Exemples de trajets</caption>
                  <thead>
                    <tr className="text-xs uppercase tracking-[.12em] text-muted-foreground"><th className="px-5 pb-2 pt-4 font-semibold">Distance</th><th className="px-5 pb-2 pt-4 font-semibold">Calcul</th><th className="px-5 pb-2 pt-4 text-right font-semibold">Frais</th></tr>
                  </thead>
                  <tbody>
                    {FARE_EXAMPLES.map((km) => {
                      const extra = Math.max(0, Math.ceil(km - FARE.franchiseKm));
                      return (
                        <tr key={km} className="border-t">
                          <td className="px-5 py-3 font-semibold tabular-nums">{km.toLocaleString("fr-FR")} km</td>
                          <td className="px-5 py-3 text-muted-foreground">{extra === 0 ? "forfait de base" : `${formatFcfa(FARE.base)} + ${extra} × ${formatFcfa(FARE.perKm)}`}</td>
                          <td className="px-5 py-3 text-right font-display text-base font-bold tabular-nums">{formatFcfa(computeFare(km))} CFA</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------- Livreurs ---------------- */}
        <section id="livreurs" className="pattern-on-dark scroll-mt-20 bg-brand-ink text-white">
          <div className="site-container grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-brand-yellow">Pour les livreurs</p>
              <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">Des courses près de vous, payées sur votre Mobile Money</h2>
              <p className="mt-4 text-lg text-white/70">Koursier Go tourne en arrière-plan. Quand une course se libère à côté de vous, elle s’affiche : vous avez 30 secondes pour l’accepter.</p>
              <ul className="mt-8 space-y-5">
                {LIVREUR_POINTS.map((p) => (
                  <li key={p.title} className="flex gap-4">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-brand-yellow"><p.icon className="h-5 w-5" /></span>
                    <div><h3 className="font-semibold">{p.title}</h3><p className="text-[15px] text-white/65">{p.text}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <AppBadges app="livreur" tone="light" />
                <Image src="/brand/koursier-go.png" alt="Icône de l'application Koursier Go" width={56} height={56} className="rounded-xl" />
              </div>
            </div>
            <div className="relative isolate">
              <div className="pointer-events-none absolute inset-0 -z-10 m-auto h-64 w-64 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
              <div className="relative"><ProposalPhoneMock /></div>
            </div>
          </div>
        </section>

        {/* ---------------- Applications ---------------- */}
        <section id="applications" className="site-container scroll-mt-20 py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary">Deux applications, Android et iOS</p>
            <h2 className="mt-2 font-display text-3xl font-bold text-brand-ink sm:text-4xl dark:text-foreground">Une app pour commander, une app pour livrer</h2>
            <p className="mt-4 text-lg text-muted-foreground">Disponibles sur Google Play et sur l’App Store.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <article className="flex flex-col rounded-[1.5rem] border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <Image src="/brand/koursier-mark.png" alt="" width={56} height={56} className="rounded-2xl border bg-white" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Pour les clients</p>
                  <h3 className="font-display text-2xl font-bold">Koursier</h3>
                </div>
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-[15px] text-muted-foreground">
                <li>Restaurants ouverts autour de vous, triés par distance</li>
                <li>Repas, colis et gaz domestique dans une seule app</li>
                <li>Paiement Orange Money, MTN MoMo ou espèces</li>
                <li>Suivi du livreur en direct et code de remise</li>
              </ul>
              <AppBadges app="client" className="mt-6" />
            </article>
            <article className="flex flex-col rounded-[1.5rem] border bg-card p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <Image src="/brand/koursier-go.png" alt="" width={56} height={56} className="rounded-2xl" />
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Pour les livreurs</p>
                  <h3 className="font-display text-2xl font-bold">Koursier Go</h3>
                </div>
              </div>
              <ul className="mt-5 flex-1 space-y-2 text-[15px] text-muted-foreground">
                <li>Courses proposées près de vous, 30 secondes pour accepter</li>
                <li>Itinéraire vers le restaurant puis vers le client</li>
                <li>Validation de la livraison par le code du client</li>
                <li>Gains visibles et retirés en Mobile Money</li>
              </ul>
              <AppBadges app="livreur" className="mt-6" />
            </article>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section id="faq" className="site-container scroll-mt-20 py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[.7fr_1.3fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[.14em] text-primary">Questions fréquentes</p>
              <h2 className="mt-2 font-display text-3xl font-bold text-brand-ink sm:text-4xl dark:text-foreground">Ce qu’on nous demande le plus</h2>
              <p className="mt-4 text-muted-foreground">Une autre question ? Appelez-nous au <a href={CONTACT_PHONE_HREF} className="font-semibold text-foreground underline-offset-4 hover:underline">{CONTACT_PHONE}</a>.</p>
            </div>
            <div className="divide-y rounded-2xl border bg-card">
              {FAQ.map((f) => (
                <details key={f.q} className="faq group px-5">
                  <summary className="flex items-center justify-between gap-4 py-4 font-semibold">
                    {f.q}
                    <span className="faq-plus inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted"><IconPlus className="h-4 w-4" /></span>
                  </summary>
                  <p className="pb-5 text-[15px] leading-relaxed text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------- CTA final ---------------- */}
        <section className="site-container pb-20">
          <div className="pattern-on-dark relative overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-primary-foreground sm:px-12 lg:py-16">
            <ScooterIcon className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-80 text-white opacity-15" />
            <div className="relative max-w-2xl">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">Votre quartier a faim. Vos clients aussi.</h2>
              <p className="mt-3 text-lg text-white/85">Rejoignez les restaurants qui livrent avec Koursier. L’inscription prend cinq minutes.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-semibold text-brand-ink transition-transform hover:-translate-y-0.5">Inscrire mon restaurant <IconArrowRight className="h-4 w-4" /></Link>
                <AppBadges app="client" tone="light" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
