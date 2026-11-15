// Historique simulé d'un camion : voyages des mois précédents, carnet
// d'entretien et documents. Tout est calculé à partir de la plaque, donc
// identique à chaque chargement de la démo.

import { SERVICE_INTERVAL_KM, TRIPS, type ExpenseCategory, type Truck } from "./data";
import { formatNumber, tripExpenses } from "./utils";

export const TODAY = new Date(2026, 10, 15);
const FUEL_PRICE = 680; // FCFA le litre de gasoil

// ---------------------------------------------------------------------------
// Dates au format court français (« 30 nov. 2026 »)
// ---------------------------------------------------------------------------

const MONTHS: Record<string, number> = {
  janv: 0, févr: 1, mars: 2, avr: 3, mai: 4, juin: 5, juil: 6, août: 7, sept: 8, oct: 9, nov: 10, déc: 11,
};
const MONTH_LABELS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export function parseFrDate(label: string): Date {
  const [day, month, year] = label.replace(".", "").split(" ");
  return new Date(Number(year ?? 2026), MONTHS[month] ?? 0, Number(day));
}

export function frDate(d: Date, withYear = true): string {
  return `${d.getDate()} ${MONTH_LABELS[d.getMonth()]}${withYear ? ` ${d.getFullYear()}` : ""}`;
}

export function daysUntil(label: string): number {
  return Math.round((parseFrDate(label).getTime() - TODAY.getTime()) / 86_400_000);
}

// Générateur pseudo-aléatoire stable, initialisé par la plaque.
function seeded(plate: string) {
  let h = 2166136261;
  for (const c of plate) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// Voyages
// ---------------------------------------------------------------------------

export interface TruckTrip {
  id: string;
  date: Date;
  destination: string;
  driver: string;
  billed: number;
  expenses: number;
  byCategory: Partial<Record<ExpenseCategory, number>>;
  km: number; // aller-retour
  consumption: number; // L/100 km
  status: "Terminé" | "En cours";
  live: boolean; // voyage présent dans la page Voyages
}

const ROUTES = [
  { destination: "Ouagadougou", billed: 2_250_000, km: 1_914, customs: 180_000, road: 50_000, tolls: 24_000 },
  { destination: "Bamako", billed: 3_400_000, km: 3_780, customs: 325_000, road: 90_000, tolls: 68_000 },
  { destination: "Niamey", billed: 2_950_000, km: 2_480, customs: 395_000, road: 120_000, tolls: 48_000 },
  { destination: "Dapaong", billed: 950_000, km: 1_260, customs: 0, road: 10_000, tolls: 24_000 },
  { destination: "Cinkassé", billed: 1_050_000, km: 1_338, customs: 0, road: 20_000, tolls: 24_000 },
];

export function truckTrips(truck: Truck): TruckTrip[] {
  const rand = seeded(truck.plate);

  // Voyages de novembre, issus de la page Voyages.
  const current: TruckTrip[] = TRIPS.filter((t) => t.plate === truck.plate).map((t) => {
    const byCategory: TruckTrip["byCategory"] = {};
    for (const x of t.expenses) byCategory[x.category] = (byCategory[x.category] ?? 0) + x.amount;
    const day = Number(t.departure.split(" ")[0]);
    const month = t.departure.includes("oct") ? 9 : 10;
    return {
      id: t.id,
      date: new Date(2026, month, day),
      destination: t.destination,
      driver: t.driver,
      billed: t.billed,
      expenses: tripExpenses(t),
      byCategory,
      km: Math.round((t.distanceKm * 2 * t.progress) / 100),
      consumption: truck.consumption,
      status: t.status === "Terminé" ? "Terminé" : "En cours",
      live: true,
    };
  });

  // Voyages de septembre et octobre (clôturés).
  const past: TruckTrip[] = [];
  const count = truck.state === "Atelier" ? 4 : 6;
  // Les voyages archivés s'arrêtent avant le premier voyage de la page Voyages.
  const firstLive = current.reduce((min, t) => (t.date < min ? t.date : min), new Date(2026, 10, 5));
  const cursor = new Date(firstLive);
  cursor.setDate(cursor.getDate() - 9);
  const start = new Date(2026, 8, 1); // l'historique commence en septembre
  for (let i = 0; i < count && cursor >= start; i++) {
    const route = ROUTES[Math.floor(rand() * (truck.year >= 2021 ? 5 : 3))];
    const consumption = truck.history[Math.max(0, truck.history.length - 2 - i)] ?? truck.reference;
    const liters = (route.km * consumption) / 100;
    const fuel = Math.round((liters * FUEL_PRICE) / 100) * 100;
    const maintenance = rand() < 0.25 ? Math.round((40_000 + rand() * 160_000) / 1000) * 1000 : 0;
    const byCategory: TruckTrip["byCategory"] = {
      Carburant: fuel,
      "Frais de Douane": route.customs,
      Péage: route.tolls,
      "Frais de route": Math.round((route.road * (0.8 + rand() * 0.8)) / 1000) * 1000,
      ...(maintenance ? { Entretien: maintenance } : {}),
    };
    const expenses = Object.values(byCategory).reduce((s, v) => s + (v ?? 0), 0);
    past.push({
      id: `${truck.plate}-archive-${i}`,
      date: new Date(cursor),
      destination: route.destination,
      driver: truck.driver,
      billed: route.billed,
      expenses,
      byCategory,
      km: route.km,
      consumption,
      status: "Terminé",
      live: false,
    });
    cursor.setDate(cursor.getDate() - Math.round(route.km / 220 + 2 + rand() * 3));
  }

  return [...current, ...past].sort((a, b) => b.date.getTime() - a.date.getTime());
}

// ---------------------------------------------------------------------------
// Entretien
// ---------------------------------------------------------------------------

export interface MaintenanceEntry {
  date: string;
  type: string;
  detail: string;
  garage: string;
  km: number | null;
  cost: number | null;
  status: "Fait" | "En cours" | "Prévu";
  alert?: string;
}

const SPECIFIC: Record<string, MaintenanceEntry[]> = {
  "TG-5521-A": [
    {
      date: "18 nov. 2026",
      type: "Contrôle",
      detail: "Contrôle des injecteurs et du filtre à gasoil (surconsommation de 15 %)",
      garage: "Garage central, Lomé",
      km: null,
      cost: null,
      status: "Prévu",
      alert: "Recommandé par l'assistant",
    },
  ],
  "TG-2045-A": [
    {
      date: "6 nov. 2026",
      type: "Pneus",
      detail: "Remplacement de 2 pneus avant",
      garage: "Garage Kara",
      km: 495_120,
      cost: 420_000,
      status: "Fait",
      alert: "Même remplacement 3 semaines plus tôt",
    },
    { date: "16 oct. 2026", type: "Pneus", detail: "Remplacement de 2 pneus avant", garage: "Garage central, Lomé", km: 486_900, cost: 410_000, status: "Fait" },
  ],
  "TG-7220-A": [
    { date: "12 nov. 2026", type: "Réparation", detail: "Réparation de la boîte de vitesses, retour prévu le 19 nov.", garage: "Garage central, Lomé", km: 702_300, cost: 1_350_000, status: "En cours" },
  ],
  "TG-3964-B": [
    { date: "14 nov. 2026", type: "Révision", detail: "Vidange, freins et 4 pneus arrière", garage: "Garage central, Lomé", km: 389_760, cost: 1_120_000, status: "En cours" },
  ],
  "TG-1234-A": [
    { date: "22 août 2026", type: "Réparation", detail: "Remplacement de l'embrayage", garage: "Garage central, Lomé", km: 584_300, cost: 760_000, status: "Fait" },
  ],
};

export function maintenanceLog(truck: Truck): MaintenanceEntry[] {
  const rand = seeded(`${truck.plate}-entretien`);
  const last = parseFrDate(truck.lastServiceDate);
  const before = new Date(last);
  before.setDate(before.getDate() - 70 - Math.round(rand() * 20));
  const remaining = truck.lastServiceKm + SERVICE_INTERVAL_KM - truck.odometerKm;
  const next = new Date(TODAY);
  next.setDate(next.getDate() + Math.max(3, Math.round(remaining / 160)));

  const entries: MaintenanceEntry[] = [
    {
      date: frDate(next),
      type: "Vidange",
      detail: `Vidange à ${formatNumber(truck.lastServiceKm + SERVICE_INTERVAL_KM)} km`,
      garage: "Garage central, Lomé",
      km: truck.lastServiceKm + SERVICE_INTERVAL_KM,
      cost: null,
      status: "Prévu",
      alert: remaining < 2_000 ? "Dans moins de 2 000 km" : undefined,
    },
    ...(SPECIFIC[truck.plate] ?? []),
    { date: truck.lastServiceDate, type: "Vidange", detail: "Vidange moteur, filtres à huile et à air", garage: "Garage central, Lomé", km: truck.lastServiceKm, cost: 85_000, status: "Fait" },
    {
      date: frDate(new Date(last.getTime() - 35 * 86_400_000)),
      type: "Freins",
      detail: "Contrôle et remplacement des plaquettes",
      garage: "Garage Kara",
      km: truck.lastServiceKm - 6_200,
      cost: 145_000,
      status: "Fait",
    },
    { date: frDate(before), type: "Vidange", detail: "Vidange moteur et filtre à huile", garage: "Garage central, Lomé", km: truck.lastServiceKm - SERVICE_INTERVAL_KM, cost: 78_000, status: "Fait" },
  ];
  return entries.sort((a, b) => parseFrDate(b.date).getTime() - parseFrDate(a.date).getTime());
}

// ---------------------------------------------------------------------------
// Documents
// ---------------------------------------------------------------------------

export interface TruckDocument {
  name: string;
  reference: string;
  until: string | null;
}

export function truckDocuments(truck: Truck): TruckDocument[] {
  const n = truck.plate.replace(/\D/g, "");
  return [
    { name: "Carte grise", reference: `CG-${n}-${truck.year}`, until: null },
    { name: "Assurance", reference: `Police n° ${n}77`, until: truck.insuranceUntil },
    { name: "Visite technique", reference: `CCT Lomé n° ${n}2`, until: truck.inspectionUntil },
    { name: "Licence de transport", reference: `LT-${n}`, until: "30 juin 2027" },
    { name: "Carnet TRIE (transit)", reference: `TRIE-TG-${n}`, until: "31 mars 2027" },
  ];
}

/** « expiré », « bientôt » (moins de 45 jours) ou « valide ». */
export function documentState(until: string | null): "expiré" | "bientôt" | "valide" {
  if (!until) return "valide";
  const d = daysUntil(until);
  return d < 0 ? "expiré" : d <= 45 ? "bientôt" : "valide";
}
