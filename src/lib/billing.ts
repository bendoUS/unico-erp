/** Clients, devis et contrats (données de démonstration). */

import { TRIPS } from "@/lib/data";
import { shortCity } from "@/lib/utils";

export type Client = {
  slug: string;
  name: string;
  city: string;
  address: string;
  nif: string;
  contact: string;
  email: string;
};

export const COMPANY = {
  name: "Unico Transport & Transit SARL",
  address: "Zone portuaire, Port autonome de Lomé",
  city: "Lomé, Togo",
  nif: "NIF 1000 4521 87",
  rccm: "RCCM TG-LOM 2014 B 1187",
  phone: "+228 22 27 45 10",
  email: "facturation@unico.tg",
  bank: "Orabank Togo, Lomé Port",
};

export const VAT_RATE = 0.18;

export const CLIENTS: Client[] = [
  { slug: "faso-distribution-plus", name: "Faso Distribution Plus", city: "Ouagadougou", address: "Avenue Kwame Nkrumah, Ouagadougou", nif: "IFU 00045218 K", contact: "Mme Aminata Sawadogo", email: "achats@fasodistribution.bf" },
  { slug: "bamako-materiaux", name: "Bamako Matériaux SA", city: "Bamako", address: "Zone industrielle de Sotuba, Bamako", nif: "NIF 084 112 457 M", contact: "M. Boubacar Keïta", email: "logistique@bamakomateriaux.ml" },
  { slug: "niamey-agro-industries", name: "Niamey Agro-Industries", city: "Niamey", address: "Route de Tillabéri, Niamey", nif: "NIF 22 718 R", contact: "M. Ousmane Mahamadou", email: "appro@niameyagro.ne" },
  { slug: "sahel-negoce", name: "Sahel Négoce SARL", city: "Ouagadougou", address: "Quartier Gounghin, Ouagadougou", nif: "IFU 00071936 B", contact: "M. Hamidou Zongo", email: "contact@sahelnegoce.bf" },
  { slug: "comptoir-du-golfe", name: "Comptoir du Golfe", city: "Lomé", address: "Boulevard du 13 janvier, Lomé", nif: "NIF 1000 3378 12", contact: "Mme Akossiwa Amouzou", email: "compta@comptoirdugolfe.tg" },
];

export const clientBySlug = (slug: string) => CLIENTS.find((c) => c.slug === slug);

export const clientByName = (name: string) => CLIENTS.find((c) => c.name === name) ?? CLIENTS[0];

export type DocLine = { label: string; qty: number; unit: number };

export const lineTotal = (lines: DocLine[]) => lines.reduce((s, l) => s + l.qty * l.unit, 0);

export type QuoteStatus = "Brouillon" | "Envoyé" | "Accepté" | "Refusé";

export type Quote = {
  id: string;
  client: string;
  route: string;
  cargo: string;
  date: string;
  validUntil: string;
  status: QuoteStatus;
  lines: DocLine[];
};

export const QUOTES: Quote[] = [
  {
    id: "DEV-2026-0087",
    client: "Faso Distribution Plus",
    route: "Port de Lomé → Ouagadougou",
    cargo: "4 conteneurs 40', riz (110 t)",
    date: "14 nov",
    validUntil: "14 déc",
    status: "Envoyé",
    lines: [
      { label: "Transport conteneur 40', Lomé → Ouagadougou", qty: 4, unit: 1_250_000 },
      { label: "Frais de transit et dédouanement", qty: 4, unit: 85_000 },
    ],
  },
  {
    id: "DEV-2026-0086",
    client: "Bamako Matériaux SA",
    route: "Port de Lomé → Bamako",
    cargo: "Ciment CPJ 42,5 (96 t)",
    date: "12 nov",
    validUntil: "12 déc",
    status: "Accepté",
    lines: [
      { label: "Transport ciment en sacs, Lomé → Bamako (32 t)", qty: 3, unit: 2_150_000 },
      { label: "Escorte et frais de corridor", qty: 3, unit: 120_000 },
    ],
  },
  {
    id: "DEV-2026-0085",
    client: "Niamey Agro-Industries",
    route: "Port de Lomé → Niamey",
    cargo: "Engrais NPK (60 t)",
    date: "8 nov",
    validUntil: "8 déc",
    status: "Refusé",
    lines: [{ label: "Transport engrais, Lomé → Niamey (30 t)", qty: 2, unit: 1_650_000 }],
  },
  {
    id: "DEV-2026-0088",
    client: "Comptoir du Golfe",
    route: "Port de Lomé → Dapaong",
    cargo: "Produits alimentaires (18 t)",
    date: "15 nov",
    validUntil: "15 déc",
    status: "Brouillon",
    lines: [{ label: "Transport produits alimentaires, Lomé → Dapaong", qty: 1, unit: 780_000 }],
  },
];

export type ContractStatus = "Actif" | "À renouveler" | "En négociation";

export type Contract = {
  id: string;
  client: string;
  start: string;
  end: string;
  paymentDays: number;
  minTrips: number;
  tripsDone: number;
  status: ContractStatus;
  rates: { route: string; unit: string; price: number }[];
};

export const CONTRACTS: Contract[] = [
  {
    id: "CTR-2026-014",
    client: "Faso Distribution Plus",
    start: "1 janv. 2026",
    end: "31 déc. 2026",
    paymentDays: 30,
    minTrips: 60,
    tripsDone: 52,
    status: "À renouveler",
    rates: [
      { route: "Port de Lomé → Ouagadougou", unit: "conteneur 40'", price: 1_250_000 },
      { route: "Port de Lomé → Ouagadougou", unit: "conteneur 20'", price: 820_000 },
      { route: "Port de Lomé → Bobo-Dioulasso", unit: "conteneur 40'", price: 1_480_000 },
    ],
  },
  {
    id: "CTR-2026-009",
    client: "Bamako Matériaux SA",
    start: "1 mars 2026",
    end: "28 févr. 2027",
    paymentDays: 45,
    minTrips: 40,
    tripsDone: 27,
    status: "Actif",
    rates: [
      { route: "Port de Lomé → Bamako", unit: "camion 32 t", price: 2_150_000 },
      { route: "Port de Lomé → Sikasso", unit: "camion 32 t", price: 1_900_000 },
    ],
  },
  {
    id: "CTR-2026-011",
    client: "Sahel Négoce SARL",
    start: "1 juin 2026",
    end: "31 mai 2027",
    paymentDays: 30,
    minTrips: 24,
    tripsDone: 13,
    status: "Actif",
    rates: [{ route: "Port de Lomé → Ouagadougou", unit: "camion plateau", price: 1_150_000 }],
  },
  {
    id: "CTR-2026-017",
    client: "Niamey Agro-Industries",
    start: "1 janv. 2027",
    end: "31 déc. 2027",
    paymentDays: 60,
    minTrips: 30,
    tripsDone: 0,
    status: "En négociation",
    rates: [{ route: "Port de Lomé → Niamey", unit: "camion 30 t", price: 1_650_000 }],
  },
];

// ---------------------------------------------------------------------------
// Factures
// ---------------------------------------------------------------------------

export type InvoiceStatus = "À émettre" | "Envoyée" | "En retard" | "Payée";

export type Invoice = {
  id: string;
  tripId: string;
  client: string;
  route: string;
  cargo: string;
  amount: number;
  paid: number;
  issued: string;
  due: string;
  status: InvoiceStatus;
  lateDays?: number;
};

// Statuts figés pour la démo : les voyages terminés sont facturés, les autres attendent la livraison.
const DONE_STATES: Pick<
  Invoice,
  "status" | "paid" | "issued" | "due" | "lateDays"
>[] = [
  { status: "Envoyée", paid: 0, issued: "9 nov", due: "9 déc" },
  { status: "En retard", paid: 0, issued: "8 oct", due: "7 nov", lateDays: 8 },
  { status: "Payée", paid: 1, issued: "4 nov", due: "4 déc" },
  {
    status: "En retard",
    paid: 0.5,
    issued: "2 oct",
    due: "1 nov",
    lateDays: 14,
  },
  { status: "Payée", paid: 1, issued: "30 oct", due: "29 nov" },
  { status: "Envoyée", paid: 0.3, issued: "28 oct", due: "27 nov" },
];

export function buildInvoices(): Invoice[] {
  let done = 0;
  return TRIPS.map((t, i) => {
    const base = {
      id: `FAC-2026-${String(312 - i).padStart(4, "0")}`,
      tripId: t.id,
      client: t.client,
      route: `${shortCity(t.origin)} → ${t.destination}`,
      cargo: t.cargo,
      amount: t.billed,
    };
    if (t.status !== "Terminé")
      return {
        ...base,
        paid: 0,
        issued: "",
        due: "",
        status: "À émettre" as const,
      };
    const s = DONE_STATES[done++ % DONE_STATES.length];
    return { ...base, ...s, paid: Math.round(t.billed * s.paid) };
  });
}
