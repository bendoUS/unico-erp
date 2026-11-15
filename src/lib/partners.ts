export type Partner = {
  id: string;
  name: string;
  city: string;
  phone: string;
  trucks: number;
  available: number;
  onTime: number;
  contact: string;
  email: string;
  address: string;
  since: string;
  paymentDays: number;
  insuranceUntil: string;
  licenceUntil: string;
};

export type FreightStatus = "En route" | "Frontière" | "Livré" | "Chargement";

export type DelegatedFreight = {
  id: string;
  cargo: string;
  origin: string;
  destination: string;
  partnerId: string;
  plate: string;
  driver: string;
  clientPrice: number;
  partnerCost: number;
  status: FreightStatus;
  progress: number;
  lastPing: string;
};

export const partnerHref = (id: string) => `/partenaires/${id.toLowerCase()}`;
export const partnerById = (id: string) => PARTNERS.find((p) => p.id.toLowerCase() === id.toLowerCase());

export const PARTNERS: Partner[] = [
  { id: "P01", name: "Koffi Logistique", city: "Lomé", phone: "+228 90 12 45 78", trucks: 9, available: 2, onTime: 98, contact: "Koffi Amegah", email: "exploitation@koffi-logistique.tg", address: "Zone portuaire, Lomé", since: "mars 2023", paymentDays: 15, insuranceUntil: "30 juin 2027", licenceUntil: "31 déc 2026" },
  { id: "P02", name: "Transport Express 228", city: "Lomé", phone: "+228 91 33 08 21", trucks: 14, available: 1, onTime: 94, contact: "Mawuli Dossou", email: "contact@te228.tg", address: "Agoè Nyivé, Lomé", since: "janvier 2024", paymentDays: 30, insuranceUntil: "15 févr. 2027", licenceUntil: "30 sept. 2027" },
  { id: "P03", name: "Sahel Fret SARL", city: "Ouagadougou", phone: "+226 70 41 22 90", trucks: 11, available: 0, onTime: 91, contact: "Adama Sawadogo", email: "fret@sahelfret.bf", address: "Zone industrielle de Kossodo, Ouagadougou", since: "juillet 2024", paymentDays: 30, insuranceUntil: "10 déc. 2026", licenceUntil: "31 mars 2027" },
  { id: "P04", name: "Agbodjan & Fils", city: "Kara", phone: "+228 99 87 60 15", trucks: 6, available: 1, onTime: 89, contact: "Essowè Agbodjan", email: "agbodjan.fils@gmail.com", address: "Quartier Tomdè, Kara", since: "octobre 2024", paymentDays: 15, insuranceUntil: "28 nov. 2026", licenceUntil: "30 juin 2027" },
  { id: "P05", name: "Niger Trans Rapide", city: "Niamey", phone: "+227 96 55 13 40", trucks: 8, available: 1, onTime: 86, contact: "Ibrahim Moussa", email: "ntr.niamey@yahoo.fr", address: "Route de Tillabéri, Niamey", since: "mai 2025", paymentDays: 30, insuranceUntil: "31 mai 2027", licenceUntil: "31 janv. 2027" },
];

export const DELEGATED: DelegatedFreight[] = [
  { id: "FRT-118", cargo: "Ciment, 30 t", origin: "Port de Lomé", destination: "Niamey", partnerId: "P01", plate: "TG-8812-B", driver: "Yao Mensah", clientPrice: 1_500_000, partnerCost: 1_200_000, status: "En route", progress: 0.46, lastPing: "il y a 2 min" },
  { id: "FRT-117", cargo: "Riz en sacs, 28 t", origin: "Port de Lomé", destination: "Ouagadougou", partnerId: "P02", plate: "TG-4470-C", driver: "Issa Traoré", clientPrice: 1_250_000, partnerCost: 1_020_000, status: "Frontière", progress: 0.7, lastPing: "il y a 6 min" },
  { id: "FRT-116", cargo: "Conteneur 40 pieds", origin: "Port de Lomé", destination: "Bamako", partnerId: "P03", plate: "BF-1123-AA", driver: "Salif Ouédraogo", clientPrice: 2_400_000, partnerCost: 1_980_000, status: "En route", progress: 0.32, lastPing: "il y a 1 min" },
  { id: "FRT-115", cargo: "Engrais, 25 t", origin: "Port de Lomé", destination: "Dapaong", partnerId: "P04", plate: "TG-2290-D", driver: "Kodjo Agbodjan", clientPrice: 780_000, partnerCost: 640_000, status: "Chargement", progress: 0, lastPing: "au port" },
  { id: "FRT-114", cargo: "Huile végétale, 24 t", origin: "Port de Lomé", destination: "Niamey", partnerId: "P05", plate: "NG-7781-RB", driver: "Moussa Hamani", clientPrice: 1_480_000, partnerCost: 1_210_000, status: "Livré", progress: 1, lastPing: "livré le 13 nov" },
  { id: "FRT-113", cargo: "Fer à béton, 30 t", origin: "Port de Lomé", destination: "Ouagadougou", partnerId: "P01", plate: "TG-8815-B", driver: "Komlan Adjo", clientPrice: 1_300_000, partnerCost: 1_050_000, status: "Livré", progress: 1, lastPing: "livré le 11 nov" },
];

/** Marchandises en attente au port, que la flotte propre ne peut pas absorber. */
export const PENDING_LOADS = [
  { id: "LOT-221", label: "Clinker, 32 t · Port de Lomé → Ouagadougou", price: 1_350_000 },
  { id: "LOT-222", label: "Sucre en sacs, 26 t · Port de Lomé → Niamey", price: 1_520_000 },
  { id: "LOT-223", label: "Conteneur 20 pieds · Port de Lomé → Bamako", price: 2_100_000 },
  { id: "LOT-224", label: "Farine, 22 t · Port de Lomé → Kara", price: 560_000 },
];

export const MONTH_DELEGATED = 12;
export const MONTH_COMMISSIONS = 1_250_000;

// ---------------------------------------------------------------------------
// Camions des partenaires
// ---------------------------------------------------------------------------

export type PartnerTruckStatus = "Disponible" | "Mission Unico" | "Autre client" | "Atelier";

export type PartnerTruck = {
  plate: string;
  partnerId: string;
  model: string;
  body: string;
  capacityT: number;
  driver: string;
  status: PartnerTruckStatus;
  location: string;
  freeOn: string | null; // date de retour prévue si occupé
  gps: string; // dernière position reçue
  freightId?: string;
  docsOk: boolean;
};

const MODELS = ["Mercedes Actros 3341", "Renault Kerax 440", "MAN TGS 33.400", "Sinotruk Howo A7", "DAF CF 85", "Volvo FH 440"];
const BODIES = [
  { body: "Porte-conteneur 40'", cap: 30 },
  { body: "Plateau", cap: 32 },
  { body: "Benne", cap: 30 },
  { body: "Porte-conteneur 20'", cap: 24 },
  { body: "Citerne", cap: 28 },
];
const DRIVER_NAMES = ["Kodjo A.", "Yao M.", "Issa T.", "Salif O.", "Moussa H.", "Komlan A.", "Akim B.", "Edem K.", "Sami D.", "Ali N.", "Kossi G.", "Fofana S."];
const ELSEWHERE = ["Ouagadougou, retour à vide", "Kara, RN1", "Niamey, déchargement", "Bamako, en attente de fret", "Atakpamé, RN1", "Sokodé, RN1"];
const FREE_ON = ["17 nov", "18 nov", "19 nov", "20 nov", "22 nov", "24 nov"];
const AT_PORT = ["Port de Lomé, parc PAL", "Port de Lomé, zone franche", "Parking Agoè, Lomé"];

function seeded(seed: number) {
  let s = seed;
  return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
}

export const PARTNER_TRUCKS: PartnerTruck[] = PARTNERS.flatMap((p, pi) => {
  const rand = seeded(pi + 7);
  const own = DELEGATED.filter((f) => f.partnerId === p.id && f.status !== "Livré" && f.plate.includes("-"));
  const prefix = p.city === "Ouagadougou" ? "BF" : p.city === "Niamey" ? "NG" : "TG";
  return Array.from({ length: p.trucks }, (_, i) => {
    const b = BODIES[Math.floor(rand() * BODIES.length)];
    const mission = own[i];
    const status: PartnerTruckStatus = mission ? "Mission Unico" : i < own.length + p.available ? "Disponible" : rand() < 0.18 ? "Atelier" : "Autre client";
    const plate = mission ? mission.plate : `${prefix}-${String(1000 + Math.floor(rand() * 8999))}-${String.fromCharCode(65 + (i % 4))}`;
    return {
      plate,
      partnerId: p.id,
      model: MODELS[Math.floor(rand() * MODELS.length)],
      body: b.body,
      capacityT: b.cap,
      driver: mission ? mission.driver : DRIVER_NAMES[Math.floor(rand() * DRIVER_NAMES.length)],
      status,
      location:
        status === "Disponible"
          ? AT_PORT[i % AT_PORT.length]
          : status === "Mission Unico"
            ? `Vers ${mission!.destination}`
            : status === "Atelier"
              ? `Garage, ${p.city}`
              : ELSEWHERE[Math.floor(rand() * ELSEWHERE.length)],
      freeOn: status === "Disponible" ? null : FREE_ON[Math.floor(rand() * FREE_ON.length)],
      gps: status === "Atelier" ? "GPS en veille" : `il y a ${1 + Math.floor(rand() * 14)} min`,
      freightId: mission?.id,
      docsOk: rand() > 0.12,
    };
  });
});

// ---------------------------------------------------------------------------
// Historique des missions confiées à chaque partenaire
// ---------------------------------------------------------------------------

export type Settlement = "Réglé" | "À régler" | "En retard";

export type PartnerMission = {
  id: string;
  partnerId: string;
  date: string;
  month: string;
  cargo: string;
  origin: string;
  destination: string;
  plate: string;
  driver: string;
  clientPrice: number;
  partnerCost: number;
  onTime: boolean;
  delayH: number;
  incident: string | null;
  settlement: Settlement;
};

const ROUTES = [
  { cargo: "Ciment, 30 t", destination: "Niamey", price: 1_500_000 },
  { cargo: "Riz en sacs, 28 t", destination: "Ouagadougou", price: 1_250_000 },
  { cargo: "Conteneur 40 pieds", destination: "Bamako", price: 2_400_000 },
  { cargo: "Engrais, 25 t", destination: "Dapaong", price: 780_000 },
  { cargo: "Clinker, 32 t", destination: "Ouagadougou", price: 1_350_000 },
  { cargo: "Sucre en sacs, 26 t", destination: "Niamey", price: 1_520_000 },
  { cargo: "Farine, 22 t", destination: "Kara", price: 560_000 },
  { cargo: "Fer à béton, 30 t", destination: "Ouagadougou", price: 1_300_000 },
];
const INCIDENTS = ["Attente de 2 jours à Cinkassé", "Panne pneumatique sur la RN1", "Bâche déchirée, 3 sacs mouillés", "Document de transit manquant à la frontière"];
const MONTHS = [
  { month: "Novembre", days: [3, 6, 9], label: "nov" },
  { month: "Octobre", days: [4, 11, 18, 25], label: "oct" },
  { month: "Septembre", days: [5, 14, 22], label: "sept" },
  { month: "Août", days: [8, 19, 27], label: "août" },
  { month: "Juillet", days: [10, 24], label: "juil" },
];

const FR_MONTHS = ["janv", "févr", "mars", "avr", "mai", "juin", "juil", "août", "sept", "oct", "nov", "déc"];

let missionSeq = 112;
const DELIVERED: PartnerMission[] = DELEGATED.filter((f) => f.status === "Livré").map((f) => ({
  id: f.id,
  partnerId: f.partnerId,
  date: f.lastPing.replace("livré le ", ""),
  month: "Novembre",
  cargo: f.cargo,
  origin: f.origin,
  destination: f.destination,
  plate: f.plate,
  driver: f.driver,
  clientPrice: f.clientPrice,
  partnerCost: f.partnerCost,
  onTime: true,
  delayH: 0,
  incident: null,
  settlement: "À régler",
}));

const GENERATED: PartnerMission[] = PARTNERS.flatMap((p, pi) => {
  const rand = seeded(pi + 31);
  const plates = PARTNER_TRUCKS.filter((t) => t.partnerId === p.id);
  const out: PartnerMission[] = [];
  MONTHS.forEach((m, mi) => {
    m.days.forEach((d) => {
      if (rand() < 0.35) return;
      const r = ROUTES[Math.floor(rand() * ROUTES.length)];
      const t = plates[Math.floor(rand() * plates.length)];
      const late = rand() * 100 > p.onTime + 2;
      const cost = Math.round((r.price * (0.78 + rand() * 0.06)) / 5000) * 5000;
      out.push({
        id: "",
        partnerId: p.id,
        date: `${d} ${m.label}`,
        month: m.month,
        cargo: r.cargo,
        origin: "Port de Lomé",
        destination: r.destination,
        plate: t.plate,
        driver: t.driver,
        clientPrice: r.price,
        partnerCost: cost,
        onTime: !late,
        delayH: late ? 6 + Math.floor(rand() * 40) : 0,
        incident: late && rand() < 0.6 ? INCIDENTS[Math.floor(rand() * INCIDENTS.length)] : null,
        settlement: mi === 0 ? (rand() < 0.5 ? "À régler" : "Réglé") : mi === 1 && rand() < 0.3 ? "En retard" : "Réglé",
      });
    });
  });
  return out;
});

/** Toutes les missions terminées, de la plus récente à la plus ancienne, numérotées dans l'ordre. */
export const PARTNER_HISTORY: PartnerMission[] = DELIVERED.concat(
  GENERATED.sort((a, b) => missionDay(b.date) - missionDay(a.date)).map((m) => ({ ...m, id: `FRT-${missionSeq--}` })),
).sort((a, b) => missionDay(b.date) - missionDay(a.date));


/** Jour de l'année d'une date de mission « 11 nov ». */
export function missionDay(label: string) {
  return daysUntil(`${label} 2026`);
}

/** Jours restants avant une échéance écrite « 28 nov. 2026 » (aujourd'hui : 15 nov. 2026). */
export function daysUntil(label: string) {
  const [d, m, y] = label.replace(".", "").split(" ");
  const month = FR_MONTHS.findIndex((x) => m.startsWith(x));
  const due = Date.UTC(Number(y), month, Number(d));
  return Math.round((due - Date.UTC(2026, 10, 15)) / 86_400_000);
}
