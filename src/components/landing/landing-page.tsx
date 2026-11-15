import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BellRingIcon,
  CameraIcon,
  CheckIcon,
  ChevronRightIcon,
  FileTextIcon,
  FuelIcon,
  HandshakeIcon,
  MapPinIcon,
  PlusIcon,
  RadioIcon,
  RouteIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  TimerIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";

import { FeatureSteps, type FeatureStep } from "@/components/landing/feature-steps";
import { cn } from "@/lib/utils";

/** Contact : WhatsApp, avec un message prérempli. */
const WHATSAPP_NUMBER = "22897972840";
const DEMO_HREF = "/app";
const CONTACT_HREF = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour, je souhaite une présentation d'Unico.")}`;

const FRAME = "mx-auto w-full max-w-[1280px] border-x border-slate-200";
const EYEBROW = "text-sm font-medium text-blue-600";
const H2 = "text-4xl font-semibold tracking-[-0.035em] text-balance sm:text-5xl";
const BTN_DARK = "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white transition-colors hover:bg-slate-700";
const BTN_LIGHT = "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-50";

// Fonds dégradés « ciel » : doux, sans photo.
const SKY = "bg-[radial-gradient(120%_90%_at_0%_0%,#f9c9d4_0%,transparent_55%),radial-gradient(110%_90%_at_100%_10%,#b9cdf5_0%,transparent_60%),radial-gradient(90%_80%_at_50%_100%,#d9d1f2_0%,transparent_70%)] bg-[#e4e8f6]";
const SAND = "bg-[radial-gradient(100%_80%_at_0%_0%,#f3e7d6_0%,transparent_60%),radial-gradient(100%_90%_at_100%_100%,#e7ddd0_0%,transparent_65%)] bg-[#efeae3]";
const MINT = "bg-[radial-gradient(100%_80%_at_10%_10%,#d3f1e4_0%,transparent_60%),radial-gradient(90%_90%_at_100%_90%,#cfe3f7_0%,transparent_65%)] bg-[#e6f0f0]";
const PRISM = "bg-[radial-gradient(70%_60%_at_15%_20%,#ffd6c9_0%,transparent_65%),radial-gradient(60%_60%_at_60%_35%,#d6f5dd_0%,transparent_65%),radial-gradient(70%_70%_at_85%_80%,#cfdcff_0%,transparent_65%)] bg-[#f1f4f9]";

const STEPS: FeatureStep[] = [
  {
    id: "voyages",
    label: "Voyages et marge",
    title: "Chaque voyage a son compte de résultat.",
    rest: "Prix facturé, gasoil, frais de douane et de route : vous savez ce que rapporte chaque trajet avant même le retour du camion.",
    image: "/landing/trips.png",
    alt: "Liste des voyages avec leur marge",
    bg: SKY,
  },
  {
    id: "flotte",
    label: "Flotte et GPS",
    title: "Vos camions sur une seule carte.",
    rest: "Position, vitesse, attente à la frontière, vidanges et documents à renouveler, camion par camion.",
    image: "/landing/fleet.png",
    alt: "Carte de la flotte avec les camions en route",
    bg: SAND,
  },
  {
    id: "depenses",
    label: "Dépenses et reçus",
    title: "Plus de frais de route sans justificatif.",
    rest: "Les chauffeurs envoient leurs reçus, vous validez ou signalez une anomalie. Les fuites de trésorerie remontent toutes seules.",
    image: "/landing/expenses.png",
    alt: "Dépenses de route et reçus à valider",
    bg: MINT,
  },
  {
    id: "ventes",
    label: "Clients et ventes",
    title: "Du devis à l'encaissement.",
    rest: "Devis, contrats et factures avec aperçu avant envoi, impayés suivis client par client.",
    image: "/landing/sales.png",
    alt: "Devis, contrats et factures",
    bg: SKY,
  },
  {
    id: "partenaires",
    label: "Réseau partenaires",
    title: "Sous-traitez sans perdre la main.",
    rest: "Confiez vos surplus à des transporteurs de confiance, suivez leurs camions et gardez votre marge.",
    image: "/landing/partner.png",
    alt: "Fiche d'un transporteur partenaire",
    bg: SAND,
  },
];

const CORRIDOR = ["Port de Lomé", "Atakpamé", "Sokodé", "Kara", "Dapaong", "Cinkassé", "Ouagadougou", "Niamey", "Bamako"];

const MODULES = [
  { icon: RouteIcon, title: "Voyages", text: "Planification, suivi et marge de chaque trajet." },
  { icon: TruckIcon, title: "Flotte", text: "Fiche camion, entretien, carburant et documents." },
  { icon: UsersIcon, title: "Chauffeurs", text: "Missions, avances sur frais, fiabilité des reçus." },
  { icon: WalletIcon, title: "Dépenses", text: "Reçus photo, validation, détection d'anomalies." },
  { icon: FileTextIcon, title: "Ventes", text: "Devis, contrats, factures en FCFA avec TVA." },
  { icon: HandshakeIcon, title: "Partenaires", text: "Délégation de frets et suivi des sous-traitants." },
  { icon: ShieldCheckIcon, title: "Équipe et accès", text: "Rôles, permissions, données sensibles protégées." },
  { icon: BellRingIcon, title: "Assistant", text: "Alertes et analyses, posez vos questions." },
];

const FAQ = [
  {
    q: "Faut-il installer un logiciel ?",
    a: "Non. Unico s'utilise dans le navigateur, sur ordinateur comme sur tablette. Les applications mobiles viendront compléter l'outil web.",
  },
  {
    q: "Le GPS est-il obligatoire ?",
    a: "Non, c'est une option. Sans boîtier, vous suivez vos voyages par étapes déclarées. Avec l'option GPS, chaque camion remonte sa position en direct.",
  },
  {
    q: "Quand sortent les applications mobiles ?",
    a: "Elles sont en préparation : une pour la direction, une pour les chauffeurs et transporteurs. Demandez une présentation pour être prévenu à leur sortie.",
  },
  {
    q: "Peut-on travailler avec des sous-traitants ?",
    a: "Oui. Le module Réseau Partenaires permet de déléguer un fret à un transporteur, de suivre ses camions et de garder votre marge.",
  },
  {
    q: "Qui voit quoi dans l'entreprise ?",
    a: "Chaque collaborateur a un rôle : direction, gestion de flotte, exploitation, comptabilité, lecture seule. Les actions sensibles, comme modifier une plaque, sont réservées.",
  },
  {
    q: "Comment reprendre nos données existantes ?",
    a: "Nous vous accompagnons pour reprendre vos camions, chauffeurs et clients au démarrage.",
  },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
              <TruckIcon className="size-4.5" />
            </span>
            <span className="text-lg font-semibold tracking-tight">Unico</span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-700 md:flex">
            <a href="#fonctions" className="hover:text-slate-950">Fonctionnalités</a>
            <a href="#mobile" className="hover:text-slate-950">Applications mobiles</a>
            <a href="#gps" className="hover:text-slate-950">Option GPS</a>
            <a href="#offres" className="hover:text-slate-950">Offres</a>
            <a href="#questions" className="hover:text-slate-950">Questions</a>
          </nav>
          <div className="flex items-center gap-4">
            <a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" className="hidden text-sm font-medium text-slate-700 hover:text-slate-950 sm:block">
              Nous contacter
            </a>
            <Link href={DEMO_HREF} className={BTN_DARK}>
              Voir la démo
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Accroche */}
        <section className={cn(FRAME, "px-5 pt-20 pb-10 text-center sm:pt-24")}>
          <a href="#mobile" className="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white py-1 pr-3 pl-1 text-sm text-slate-700 hover:bg-slate-50">
            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">Bientôt</span>
            Applications mobiles pour la direction et les chauffeurs
            <ChevronRightIcon className="size-3.5 text-slate-400" />
          </a>
          <h1 className="mx-auto mt-6 max-w-4xl text-5xl leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-7xl">
            Le transport routier, enfin sous contrôle.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 text-pretty">
            Voyages, camions, chauffeurs, dépenses de route et factures dans un seul outil, pensé pour les transporteurs du corridor Lomé-Sahel.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" className={BTN_LIGHT}>
              Demander une présentation
            </a>
            <Link href={DEMO_HREF} className={BTN_DARK}>
              Voir la démo
              <ArrowRightIcon className="size-4" />
            </Link>
          </div>
          <p className="mt-5 text-sm text-slate-500">Montants en FCFA · Accès par rôle · GPS en option</p>
        </section>

        <section className={cn(FRAME, "px-3 pb-3 sm:px-0 sm:pb-0")}>
          <div className={cn("overflow-hidden rounded-3xl px-4 pt-10 sm:mx-0 sm:rounded-[2rem] sm:px-16 sm:pt-20", SKY)}>
            <div className="overflow-hidden rounded-t-xl border border-b-0 border-white/70 bg-white/60 p-1.5 pb-0 backdrop-blur">
              <div className="flex items-center gap-1.5 px-2 py-1.5">
                <span className="size-2.5 rounded-full bg-slate-300" />
                <span className="size-2.5 rounded-full bg-slate-300" />
                <span className="size-2.5 rounded-full bg-slate-300" />
                <span className="mx-auto text-xs text-slate-500">unico.app / Tableau de bord</span>
              </div>
              <Image
                src="/landing/dashboard.png"
                alt="Tableau de bord Unico : chiffre d'affaires, dépenses, marge et camions en mission"
                width={2880}
                height={1800}
                priority
                sizes="(min-width: 1280px) 1150px, 100vw"
                className="h-auto w-full rounded-t-lg"
              />
            </div>
          </div>
        </section>

        {/* Corridor */}
        <section className={cn(FRAME, "overflow-hidden border-b px-5 py-14 text-center")}>
          <p className="text-sm text-slate-500">Conçu pour les routes que vos camions empruntent chaque semaine</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-lg font-medium tracking-tight text-slate-400">
            {CORRIDOR.map((c, i) => (
              <span key={c} className="flex items-center gap-6">
                {i > 0 && <span className="size-1 rounded-full bg-slate-300" />}
                {c}
              </span>
            ))}
          </div>
        </section>

        {/* Fonctions */}
        <section id="fonctions" className={cn(FRAME, "scroll-mt-16")}>
          <div className="border-b border-slate-200 px-5 py-20 sm:px-16">
            <p className={EYEBROW}>Comment ça marche</p>
            <h2 className={cn(H2, "mt-4 max-w-4xl")}>
              Un seul outil pour toute l&apos;exploitation. <span className="text-slate-400">Fini les cahiers, les fichiers Excel et les appels pour savoir où est le camion.</span>
            </h2>
          </div>
          <FeatureSteps steps={STEPS} />
        </section>

        {/* Modules */}
        <section className={cn(FRAME, "border-t")}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {MODULES.map((m, i) => (
              <div
                key={m.title}
                className={cn(
                  "flex flex-col gap-3 border-slate-200 p-8",
                  "border-b",
                  i % 2 === 0 && "sm:border-r",
                  i % 4 !== 3 && "lg:border-r",
                  i >= 4 && "lg:border-b-0",
                )}
              >
                <span className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
                  <m.icon className="size-4" />
                </span>
                <h3 className="font-semibold tracking-tight">{m.title}</h3>
                <p className="text-sm leading-relaxed text-slate-500">{m.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Applications mobiles */}
        <section id="mobile" className={cn(FRAME, "grid scroll-mt-16 border-t lg:grid-cols-2")}>
          <div className="flex flex-col justify-center px-5 py-20 sm:px-16">
            <p className={EYEBROW}>Bientôt disponible</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-balance sm:text-4xl">
              Deux applications mobiles. <span className="text-slate-400">Une pour piloter depuis n&apos;importe où, une pour ceux qui sont sur la route.</span>
            </h2>
            <ul className="mt-10 flex flex-col gap-7">
              <MobilePoint icon={BellRingIcon} title="Pour la direction">
                Chiffre d&apos;affaires, marge et alertes du jour. Validez les dépenses et suivez les camions bloqués, depuis votre téléphone.
              </MobilePoint>
              <MobilePoint icon={CameraIcon} title="Pour les chauffeurs">
                La mission du jour, l&apos;itinéraire, et l&apos;envoi des reçus en photo au moment de la dépense.
              </MobilePoint>
              <MobilePoint icon={HandshakeIcon} title="Pour les transporteurs partenaires">
                Ils reçoivent vos frets, partagent leur position pendant la mission et déclarent la livraison.
              </MobilePoint>
            </ul>
          </div>
          <div className={cn("relative flex items-center justify-center gap-5 overflow-hidden px-5 py-16 lg:border-l lg:border-slate-200", PRISM)}>
            <DirectionPhone />
            <DriverPhone className="hidden sm:flex" />
          </div>
        </section>

        {/* Option GPS */}
        <section id="gps" className={cn(FRAME, "scroll-mt-16 border-t px-5 py-20 sm:px-16")}>
          <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <div>
              <p className={EYEBROW}>Option GPS</p>
              <h2 className={cn(H2, "mt-4")}>
                Le suivi en direct, <span className="text-slate-400">quand vous en avez besoin.</span>
              </h2>
              <p className="mt-6 max-w-lg leading-relaxed text-slate-500">
                L&apos;option GPS s&apos;ajoute à votre abonnement, camion par camion. Nous fournissons et installons le boîtier, la position remonte toute seule dans Unico.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" className={BTN_DARK}>
                  Équiper ma flotte
                </a>
                <Link href="/flotte" className={BTN_LIGHT}>
                  Voir la carte en démo
                </Link>
              </div>
            </div>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 sm:grid-cols-2">
              {[
                { icon: MapPinIcon, title: "Position en direct", text: "Chaque camion sur la carte, avec sa vitesse et le kilomètre parcouru." },
                { icon: TimerIcon, title: "Attente à la frontière", text: "Alerte quand un camion reste à l'arrêt à Cinkassé ou ailleurs." },
                { icon: FuelIcon, title: "Surconsommation", text: "Le gasoil comparé aux kilomètres réels, trajet par trajet." },
                { icon: RadioIcon, title: "Partage aux clients", text: "Montrez à un client où est sa marchandise, sans appel." },
              ].map((f) => (
                <div key={f.title} className="flex flex-col gap-2 bg-white p-6">
                  <f.icon className="size-4.5 text-slate-500" />
                  <h3 className="mt-1 font-semibold tracking-tight">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Offres */}
        <section id="offres" className={cn(FRAME, "scroll-mt-16 border-t px-5 py-20 sm:px-16")}>
          <p className={EYEBROW}>Offres</p>
          <h2 className={cn(H2, "mt-4 max-w-3xl")}>
            Un abonnement, des options. <span className="text-slate-400">Vous payez pour ce que votre flotte utilise.</span>
          </h2>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            <Offer
              name="Unico ERP"
              price="Sur devis"
              unit="abonnement mensuel, selon la taille de la flotte"
              items={["Voyages, flotte, chauffeurs", "Dépenses et reçus", "Devis, contrats, factures", "Réseau partenaires", "Rôles et accès de l'équipe", "Assistant et alertes"]}
              cta="Demander une présentation"
              featured
            />
            <Offer
              name="Option GPS"
              price="Sur devis"
              unit="par camion équipé"
              items={["Boîtier GPS fourni", "Installation sur le camion", "Position en direct dans Unico", "Alertes frontière et carburant", "Partage de position aux clients"]}
              cta="Équiper ma flotte"
            />
            <Offer
              name="Applications mobiles"
              price="Bientôt"
              unit="direction, chauffeurs et partenaires"
              items={["Tableau de bord sur téléphone", "Validation des dépenses", "Reçus envoyés en photo", "Missions des chauffeurs", "Suivi des frets délégués"]}
              cta="Être prévenu de la sortie"
              soon
            />
          </div>
        </section>

        {/* Questions */}
        <section id="questions" className={cn(FRAME, "grid scroll-mt-16 gap-12 border-t px-5 py-20 sm:px-16 lg:grid-cols-[1fr_1.6fr]")}>
          <div>
            <p className={EYEBROW}>Questions</p>
            <h2 className={cn(H2, "mt-4")}>Les réponses avant de demander.</h2>
            <p className="mt-5 max-w-xs leading-relaxed text-slate-500">Une autre question ? Écrivez-nous directement sur WhatsApp.</p>
            <a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" className={cn(BTN_LIGHT, "mt-6")}>
              Nous écrire sur WhatsApp
            </a>
          </div>
          <div className="border-t border-slate-200">
            {FAQ.map((f) => (
              <details key={f.q} className="group border-b border-slate-200">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-medium tracking-tight [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid size-7 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition-transform group-open:rotate-45">
                    <PlusIcon className="size-3.5" />
                  </span>
                </summary>
                <p className="-mt-2 max-w-2xl pb-6 leading-relaxed text-slate-500">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Appel final */}
        <section className={cn(FRAME, "border-t p-3 sm:p-6")}>
          <div className={cn("rounded-[2rem] px-6 py-20 text-center sm:py-28", SKY)}>
            <h2 className="text-5xl font-semibold tracking-[-0.045em] text-balance sm:text-6xl">Moins d&apos;appels. Plus de marge.</h2>
            <p className="mx-auto mt-5 max-w-xl text-lg text-slate-700">Découvrez Unico avec les données d&apos;une vraie journée d&apos;exploitation à Lomé.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" className={BTN_LIGHT}>
                Demander une présentation
              </a>
              <Link href={DEMO_HREF} className={BTN_DARK}>
                Voir la démo
                <ArrowRightIcon className="size-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Pied de page */}
      <footer className={cn(FRAME, "overflow-hidden border-t")}>
        <div className="grid gap-10 px-5 pt-16 sm:px-16 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="grid size-8 place-items-center rounded-lg bg-blue-600 text-white">
                <TruckIcon className="size-4.5" />
              </span>
              <span className="text-lg font-semibold tracking-tight">Unico</span>
            </div>
            <p className="mt-4 max-w-sm leading-relaxed text-slate-500">L&apos;ERP des transporteurs et transitaires d&apos;Afrique de l&apos;Ouest. Conçu à Lomé.</p>
          </div>
          <FooterCol title="Produit" links={[["Fonctionnalités", "#fonctions"], ["Applications mobiles", "#mobile"], ["Option GPS", "#gps"], ["Offres", "#offres"]]} />
          <FooterCol title="Entreprise" links={[["Voir la démo", DEMO_HREF], ["Demander une présentation", CONTACT_HREF], ["Questions", "#questions"]]} />
        </div>
        <div className="mt-10 px-5 text-sm text-slate-400 sm:px-16">© 2026 Unico. Tous droits réservés.</div>
        <div aria-hidden className="-mb-[0.22em] mt-6 text-center text-[24vw] leading-none font-semibold tracking-[-0.06em] text-slate-100 select-none lg:text-[300px]">
          Unico
        </div>
      </footer>
    </div>
  );
}

function MobilePoint({ icon: Icon, title, children }: { icon: typeof BellRingIcon; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600">
        <Icon className="size-4" />
      </span>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="mt-1 leading-relaxed text-slate-500">{children}</p>
      </div>
    </li>
  );
}

function Phone({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("flex h-[520px] w-[250px] shrink-0 flex-col overflow-hidden rounded-[2.4rem] border-[7px] border-slate-900 bg-white", className)}>
      <div className="flex items-center justify-between px-6 pt-3 pb-1 text-[10px] font-semibold text-slate-900">
        <span>9:41</span>
        <span className="h-4 w-16 rounded-full bg-slate-900" />
        <span>100 %</span>
      </div>
      <div className="flex flex-1 flex-col gap-3 px-4 pt-3 pb-4">{children}</div>
    </div>
  );
}

function DirectionPhone() {
  return (
    <Phone className="translate-y-4">
      <div>
        <p className="text-[10px] font-medium text-slate-400">Dimanche 15 novembre</p>
        <p className="text-base font-semibold tracking-tight">Bonjour, Madame la Directrice</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[
          ["Chiffre d'affaires", "18,5 M"],
          ["Marge nette", "6,3 M"],
          ["En mission", "8 sur 12"],
          ["À valider", "5 reçus"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-xl border border-slate-200 p-2.5">
            <p className="text-[9px] text-slate-500">{k}</p>
            <p className="text-sm font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5">
        <p className="flex items-center gap-1 text-[10px] font-semibold text-rose-700">
          <AlertTriangleIcon className="size-3" />3 camions bloqués à Cinkassé
        </p>
        <p className="mt-0.5 text-[9px] text-rose-600">Attente en douane depuis plus de 24 h</p>
      </div>
      <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200">
        {[
          ["Gasoil, Kara", "245 000"],
          ["Péage, Atakpamé", "12 000"],
          ["Douane, Cinkassé", "180 000"],
        ].map(([k, v]) => (
          <div key={k} className="flex items-center justify-between px-2.5 py-2 text-[10px]">
            <span className="text-slate-700">{k}</span>
            <span className="flex items-center gap-1.5 font-semibold tabular-nums">
              {v}
              <span className="grid size-4 place-items-center rounded-full bg-emerald-500 text-white">
                <CheckIcon className="size-2.5" />
              </span>
            </span>
          </div>
        ))}
      </div>
      <div className="mt-auto rounded-xl bg-slate-900 py-2.5 text-center text-[11px] font-medium text-white">Valider les 5 dépenses</div>
    </Phone>
  );
}

function DriverPhone({ className }: { className?: string }) {
  return (
    <Phone className={cn("-translate-y-4", className)}>
      <div>
        <p className="text-[10px] font-medium text-slate-400">Mission en cours</p>
        <p className="text-base font-semibold tracking-tight">Lomé → Ouagadougou</p>
      </div>
      <div className="rounded-xl border border-slate-200 p-3">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold">VOY-2026-049</span>
          <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-medium text-blue-700">En route</span>
        </div>
        <p className="mt-1 text-[10px] text-slate-500">Ciment, 30 t · TG-4452-A</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-[44%] rounded-full bg-blue-600" />
        </div>
        <div className="mt-1.5 flex justify-between text-[9px] text-slate-500">
          <span>Kara, km 420</span>
          <span>encore 537 km</span>
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 p-3">
        <p className="text-[9px] text-slate-500">Avance sur frais restante</p>
        <p className="text-lg font-semibold tabular-nums">
          85 000 <span className="text-[10px] font-medium text-slate-400">FCFA</span>
        </p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">
        <span className="grid size-10 place-items-center rounded-full bg-white text-slate-700 ring-1 ring-slate-200">
          <CameraIcon className="size-5" />
        </span>
        <p className="text-[10px] font-medium text-slate-700">Photographier un reçu</p>
        <p className="px-4 text-[9px] text-slate-400">Envoyé tout de suite au bureau</p>
      </div>
      <div className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 text-[11px] font-medium text-white">
        <SmartphoneIcon className="size-3.5" />
        Signaler une étape
      </div>
    </Phone>
  );
}

function Offer({
  name,
  price,
  unit,
  items,
  cta,
  featured = false,
  soon = false,
}: {
  name: string;
  price: string;
  unit: string;
  items: string[];
  cta: string;
  featured?: boolean;
  soon?: boolean;
}) {
  return (
    <div className={cn("flex flex-col rounded-2xl border p-7", featured ? "border-slate-900" : "border-slate-200")}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold tracking-tight">{name}</h3>
        {featured && <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white">Base</span>}
        {soon && <span className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs font-medium text-slate-600">En préparation</span>}
      </div>
      <p className="mt-6 text-4xl font-semibold tracking-[-0.03em]">{price}</p>
      <p className="mt-1 text-sm text-slate-500">{unit}</p>
      <a href={CONTACT_HREF} target="_blank" rel="noopener noreferrer" className={cn(featured ? BTN_DARK : BTN_LIGHT, "mt-6 w-full")}>
        {cta}
      </a>
      <ul className="mt-7 flex flex-col gap-3 text-sm text-slate-600">
        {items.map((i) => (
          <li key={i} className="flex items-center gap-2.5">
            <CheckIcon className="size-4 shrink-0 text-slate-400" />
            {i}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <ul className="mt-4 flex flex-col gap-3 text-slate-500">
        {links.map(([label, href]) => (
          <li key={label}>
            <a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="hover:text-slate-900">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
