// Données mockées de Unico (prototype front-end, aucune base de données)

export type TripStatus = "En chargement" | "En route" | "Frontière" | "Terminé";

export type ExpenseCategory =
  | "Carburant"
  | "Frais de Douane"
  | "Péage"
  | "Entretien"
  | "Frais de route";

export type ReceiptStatus = "validé" | "en attente" | "sans reçu" | "anomalie";

export interface Expense {
  id: string;
  category: ExpenseCategory;
  label: string;
  location: string;
  amount: number;
  date: string; // affichage, ex. "14 nov · 08:42"
  status: ReceiptStatus;
  note?: string;
  live?: boolean; // ajoutée en direct pendant la démo
}

export interface Trip {
  id: string;
  origin: string;
  destination: string;
  plate: string;
  driver: string;
  driverPhone: string;
  client: string;
  cargo: string;
  billed: number;
  budget: number; // dépenses prévues pour le trajet
  status: TripStatus;
  departure: string;
  eta: string;
  distanceKm: number;
  progress: number; // 0 → 100
  position: string; // dernière position connue
  expenses: Expense[];
}

export type TruckState = "En mission" | "Disponible" | "Atelier";

export interface Truck {
  plate: string;
  model: string;
  year: number;
  driver: string;
  state: TruckState;
  location: string; // dernière position GPS
  corridorKm: number | null; // distance par la route depuis le Port de Lomé (km), null hors corridor
  tripId?: string;
  odometerKm: number;
  lastServiceKm: number;
  lastServiceDate: string;
  insuranceUntil: string;
  inspectionUntil: string; // visite technique
  consumption: number; // L/100 km sur 30 jours
  reference: number; // consommation de référence du camion
  history: number[]; // L/100 km sur les 6 derniers voyages
  fuelMonthL: number; // litres consommés ce mois
  workshopReason?: string;
}

export const SERVICE_INTERVAL_KM = 20_000;

export const CATEGORIES: ExpenseCategory[] = [
  "Carburant",
  "Frais de Douane",
  "Péage",
  "Entretien",
  "Frais de route",
];

// ---------------------------------------------------------------------------
// Flotte (12 camions)
// ---------------------------------------------------------------------------

export const TRUCKS: Truck[] = [
  {
    plate: "TG-5521-A", model: "Mercedes Actros 3341", year: 2019, driver: "Koffi Mensah", state: "En mission",
    location: "Kara, RN1 km 418", corridorKm: 418, tripId: "VOY-2026-042",
    odometerKm: 412_350, lastServiceKm: 396_800, lastServiceDate: "12 oct. 2026", insuranceUntil: "31 mars 2027", inspectionUntil: "14 févr. 2027",
    consumption: 46.3, reference: 40.2, history: [40.5, 41.0, 44.8, 47.1, 45.9, 46.3], fuelMonthL: 2_140,
  },
  {
    plate: "TG-8899-B", model: "Renault Kerax 440", year: 2018, driver: "Abdoulaye Traoré", state: "En mission",
    location: "Frontière de Cinkassé", corridorKm: 669, tripId: "VOY-2026-043",
    odometerKm: 538_900, lastServiceKm: 521_000, lastServiceDate: "28 sept. 2026", insuranceUntil: "30 nov. 2026", inspectionUntil: "8 janv. 2027",
    consumption: 41.2, reference: 41.0, history: [41.5, 40.8, 41.1, 40.6, 41.4, 41.2], fuelMonthL: 1_980,
  },
  {
    plate: "TG-3307-C", model: "MAN TGS 33.400", year: 2020, driver: "Kossi Agbeko", state: "En mission",
    location: "Frontière de Cinkassé", corridorKm: 669, tripId: "VOY-2026-044",
    odometerKm: 301_420, lastServiceKm: 289_500, lastServiceDate: "20 oct. 2026", insuranceUntil: "15 juin 2027", inspectionUntil: "2 mai 2027",
    consumption: 38.9, reference: 39.0, history: [39.2, 38.7, 39.0, 38.5, 39.1, 38.9], fuelMonthL: 1_760,
  },
  {
    plate: "TG-1234-A", model: "Mercedes Actros 3340", year: 2017, driver: "Messan Adjovi", state: "En mission",
    location: "Frontière de Cinkassé", corridorKm: 669, tripId: "VOY-2026-045",
    odometerKm: 611_080, lastServiceKm: 593_200, lastServiceDate: "1 oct. 2026", insuranceUntil: "28 févr. 2027", inspectionUntil: "19 déc. 2026",
    consumption: 40.6, reference: 40.0, history: [40.1, 40.4, 39.8, 40.9, 40.2, 40.6], fuelMonthL: 1_690,
  },
  {
    plate: "TG-6610-B", model: "Sinotruk Howo A7", year: 2021, driver: "Yao Kpodar", state: "En mission",
    location: "Mango, RN1 km 552", corridorKm: 552, tripId: "VOY-2026-046",
    odometerKm: 214_760, lastServiceKm: 199_900, lastServiceDate: "5 oct. 2026", insuranceUntil: "10 août 2027", inspectionUntil: "30 juil. 2027",
    consumption: 37.8, reference: 38.0, history: [38.1, 37.6, 38.3, 37.9, 37.7, 37.8], fuelMonthL: 1_120,
  },
  {
    plate: "TG-2045-A", model: "Renault Kerax 440", year: 2018, driver: "Komlan Akakpo", state: "En mission",
    location: "Atakpamé, RN1 km 162", corridorKm: 162, tripId: "VOY-2026-047",
    odometerKm: 497_310, lastServiceKm: 478_400, lastServiceDate: "18 sept. 2026", insuranceUntil: "31 janv. 2027", inspectionUntil: "11 mars 2027",
    consumption: 41.9, reference: 39.5, history: [39.8, 40.2, 40.9, 41.5, 42.2, 41.9], fuelMonthL: 1_540,
  },
  {
    plate: "TG-7781-C", model: "MAN TGS 33.440", year: 2022, driver: "Ibrahim Ouédraogo", state: "En mission",
    location: "Port de Lomé, quai n°3", corridorKm: 0, tripId: "VOY-2026-048",
    odometerKm: 156_900, lastServiceKm: 150_100, lastServiceDate: "2 nov. 2026", insuranceUntil: "20 sept. 2027", inspectionUntil: "6 sept. 2027",
    consumption: 39.4, reference: 39.5, history: [39.6, 39.2, 39.8, 39.1, 39.5, 39.4], fuelMonthL: 1_880,
  },
  {
    plate: "TG-4452-A", model: "Mercedes Actros 3341", year: 2020, driver: "Edem Amegah", state: "En mission",
    location: "Port de Lomé, terminal à conteneurs", corridorKm: 0, tripId: "VOY-2026-049",
    odometerKm: 288_150, lastServiceKm: 270_600, lastServiceDate: "24 sept. 2026", insuranceUntil: "12 avr. 2027", inspectionUntil: "27 févr. 2027",
    consumption: 40.1, reference: 40.2, history: [40.4, 39.9, 40.2, 40.0, 40.3, 40.1], fuelMonthL: 1_410,
  },
  {
    plate: "TG-9013-B", model: "Volvo FMX 440", year: 2021, driver: "Séna Dossou", state: "Disponible",
    location: "Parc d'Adakpamé, Lomé", corridorKm: null,
    odometerKm: 233_470, lastServiceKm: 230_000, lastServiceDate: "4 nov. 2026", insuranceUntil: "5 juil. 2027", inspectionUntil: "22 juin 2027",
    consumption: 38.2, reference: 38.5, history: [38.6, 38.1, 38.4, 38.0, 38.3, 38.2], fuelMonthL: 1_250,
  },
  {
    plate: "TG-1588-C", model: "Sinotruk Howo A7", year: 2021, driver: "Kodjo Lawson", state: "Disponible",
    location: "Parc d'Adakpamé, Lomé", corridorKm: null,
    odometerKm: 198_640, lastServiceKm: 181_200, lastServiceDate: "29 sept. 2026", insuranceUntil: "14 mai 2027", inspectionUntil: "3 avr. 2027",
    consumption: 38.4, reference: 38.0, history: [38.0, 38.2, 38.6, 38.1, 38.5, 38.4], fuelMonthL: 980,
  },
  {
    plate: "TG-7220-A", model: "Renault Kerax 380", year: 2016, driver: "Moussa Diallo", state: "Atelier",
    location: "Garage central, Lomé", corridorKm: null,
    odometerKm: 702_300, lastServiceKm: 684_000, lastServiceDate: "8 sept. 2026", insuranceUntil: "31 déc. 2026", inspectionUntil: "2 déc. 2026",
    consumption: 43.1, reference: 41.5, history: [41.8, 42.0, 42.6, 43.0, 43.4, 43.1], fuelMonthL: 420,
    workshopReason: "Réparation de la boîte de vitesses, retour prévu le 19 nov.",
  },
  {
    plate: "TG-3964-B", model: "MAN TGS 33.400", year: 2019, driver: "Afetsi Kudawoo", state: "Atelier",
    location: "Garage central, Lomé", corridorKm: null,
    odometerKm: 389_760, lastServiceKm: 369_500, lastServiceDate: "14 août 2026", insuranceUntil: "18 mars 2027", inspectionUntil: "9 févr. 2027",
    consumption: 39.6, reference: 39.0, history: [39.1, 39.4, 39.0, 39.8, 39.5, 39.6], fuelMonthL: 610,
    workshopReason: "Vidange, freins et 4 pneus arrière, retour prévu demain.",
  },
];

// ---------------------------------------------------------------------------
// Chauffeurs
// ---------------------------------------------------------------------------

export type DriverStatus = "En mission" | "Disponible" | "Repos";

export interface Driver {
  name: string;
  phone: string;
  plate: string;
  status: DriverStatus;
  hired: number; // année d'embauche
  licence: string;
  licenceUntil: string;
  hometown: string;
  advance: number; // avance sur frais en cours (FCFA)
  kmMonth: number;
}

export const DRIVERS: Driver[] = [
  { name: "Koffi Mensah", phone: "+228 90 12 45 78", plate: "TG-5521-A", status: "En mission", hired: 2016, licence: "C, CE", licenceUntil: "mars 2029", hometown: "Tsévié", advance: 250_000, kmMonth: 4_620 },
  { name: "Abdoulaye Traoré", phone: "+228 91 77 03 22", plate: "TG-8899-B", status: "En mission", hired: 2014, licence: "C, CE", licenceUntil: "juin 2027", hometown: "Dapaong", advance: 400_000, kmMonth: 4_810 },
  { name: "Kossi Agbeko", phone: "+228 99 41 60 15", plate: "TG-3307-C", status: "En mission", hired: 2019, licence: "C, CE", licenceUntil: "janv. 2030", hometown: "Kpalimé", advance: 300_000, kmMonth: 4_480 },
  { name: "Messan Adjovi", phone: "+228 90 88 12 04", plate: "TG-1234-A", status: "En mission", hired: 2012, licence: "C, CE", licenceUntil: "oct. 2028", hometown: "Aného", advance: 250_000, kmMonth: 4_210 },
  { name: "Yao Kpodar", phone: "+228 92 30 51 89", plate: "TG-6610-B", status: "En mission", hired: 2021, licence: "C, CE", licenceUntil: "févr. 2031", hometown: "Atakpamé", advance: 150_000, kmMonth: 2_960 },
  { name: "Komlan Akakpo", phone: "+228 93 14 77 60", plate: "TG-2045-A", status: "En mission", hired: 2017, licence: "C, CE", licenceUntil: "déc. 2026", hometown: "Notsé", advance: 150_000, kmMonth: 3_870 },
  { name: "Ibrahim Ouédraogo", phone: "+228 96 02 38 41", plate: "TG-7781-C", status: "En mission", hired: 2020, licence: "C, CE", licenceUntil: "mai 2030", hometown: "Ouagadougou", advance: 0, kmMonth: 4_950 },
  { name: "Edem Amegah", phone: "+228 97 55 20 13", plate: "TG-4452-A", status: "En mission", hired: 2022, licence: "C, CE", licenceUntil: "août 2032", hometown: "Lomé", advance: 0, kmMonth: 3_510 },
  { name: "Séna Dossou", phone: "+228 98 63 11 72", plate: "TG-9013-B", status: "Disponible", hired: 2018, licence: "C, CE", licenceUntil: "avr. 2028", hometown: "Lomé", advance: 0, kmMonth: 3_240 },
  { name: "Kodjo Lawson", phone: "+228 90 47 82 36", plate: "TG-1588-C", status: "Disponible", hired: 2023, licence: "C, CE", licenceUntil: "sept. 2033", hometown: "Aného", advance: 0, kmMonth: 2_580 },
  { name: "Moussa Diallo", phone: "+228 91 26 09 54", plate: "TG-7220-A", status: "Repos", hired: 2011, licence: "C, CE", licenceUntil: "nov. 2027", hometown: "Sokodé", advance: 0, kmMonth: 1_020 },
  { name: "Afetsi Kudawoo", phone: "+228 99 83 15 27", plate: "TG-3964-B", status: "Repos", hired: 2015, licence: "C, CE", licenceUntil: "juil. 2029", hometown: "Kpalimé", advance: 0, kmMonth: 1_560 },
];

// ---------------------------------------------------------------------------
// Helpers de construction
// ---------------------------------------------------------------------------

let seq = 0;
function e(
  category: ExpenseCategory,
  label: string,
  location: string,
  amount: number,
  date: string,
  status: ReceiptStatus = "validé",
  note?: string,
): Expense {
  seq += 1;
  return { id: `REC-${String(seq).padStart(4, "0")}`, category, label, location, amount, date, status, note };
}

// ---------------------------------------------------------------------------
// Voyages
// ---------------------------------------------------------------------------

export const TRIPS: Trip[] = [
  // ----------------------------- En cours ---------------------------------
  {
    id: "VOY-2026-042",
    origin: "Port de Lomé",
    destination: "Ouagadougou",
    plate: "TG-5521-A",
    driver: "Koffi Mensah",
    driverPhone: "+228 90 12 45 78",
    client: "Faso Distribution Plus",
    cargo: "Conteneur 40', riz brisé (28 t)",
    billed: 2_250_000,
    budget: 1_180_000,
    status: "En route",
    departure: "13 nov · 06:10",
    eta: "16 nov · 18:00",
    distanceKm: 957,
    progress: 58,
    position: "Kara, RN1 km 418",
    expenses: [
      e("Carburant", "Plein départ (420 L gasoil)", "Station Port de Lomé", 285_600, "13 nov · 05:48"),
      e("Péage", "Péage de Davié", "Davié", 4_000, "13 nov · 07:02"),
      e("Frais de route", "Contrôle police", "Notsé", 5_000, "13 nov · 08:30", "sans reçu"),
      e("Péage", "Péage d'Aléhéridè", "Aléhéridè", 4_000, "13 nov · 13:15"),
      e(
        "Carburant",
        "Complément (190 L gasoil)",
        "Sokodé",
        129_200,
        "13 nov · 16:40",
        "anomalie",
        "Plein non prévu : +15 % vs moyenne historique du trajet",
      ),
      e("Frais de route", "Escorte gendarmerie", "Défilé d'Alédjo", 15_000, "13 nov · 18:05", "en attente"),
      e(
        "Carburant",
        "Complément (110 L gasoil)",
        "Kara",
        74_800,
        "14 nov · 07:20",
        "anomalie",
        "Second complément en 15 h, reçu manuscrit",
      ),
      e("Péage", "Péage de Kara", "Kara", 4_000, "14 nov · 07:45"),
    ],
  },
  {
    id: "VOY-2026-043",
    origin: "Port de Lomé",
    destination: "Bamako",
    plate: "TG-8899-B",
    driver: "Abdoulaye Traoré",
    driverPhone: "+228 91 77 03 22",
    client: "Bamako Matériaux SA",
    cargo: "Ciment CPJ 42,5 (32 t)",
    billed: 3_400_000,
    budget: 1_820_000,
    status: "Frontière",
    departure: "12 nov · 05:30",
    eta: "18 nov · 12:00",
    distanceKm: 1_857,
    progress: 41,
    position: "Frontière de Cinkassé, en attente depuis 31 h",
    expenses: [
      e("Carburant", "Plein départ (450 L gasoil)", "Station Port de Lomé", 306_000, "12 nov · 05:05"),
      e("Péage", "Péage de Davié", "Davié", 4_000, "12 nov · 06:20"),
      e("Péage", "Péage d'Aléhéridè", "Aléhéridè", 4_000, "12 nov · 12:10"),
      e("Frais de route", "Contrôle police", "Atakpamé", 5_000, "12 nov · 09:40", "sans reçu"),
      e("Carburant", "Complément (160 L gasoil)", "Kara", 108_800, "12 nov · 19:30"),
      e("Péage", "Péage de Kara", "Kara", 4_000, "12 nov · 19:50"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 185_000, "13 nov · 10:15"),
      e("Frais de route", "Gardiennage parking frontière", "Cinkassé", 10_000, "14 nov · 08:00", "en attente"),
    ],
  },
  {
    id: "VOY-2026-044",
    origin: "Port de Lomé",
    destination: "Niamey",
    plate: "TG-3307-C",
    driver: "Kossi Agbeko",
    driverPhone: "+228 99 41 60 15",
    client: "Niamey Agro-Industries",
    cargo: "Engrais NPK 15-15-15 (30 t)",
    billed: 2_950_000,
    budget: 1_560_000,
    status: "Frontière",
    departure: "12 nov · 07:00",
    eta: "17 nov · 16:00",
    distanceKm: 1_192,
    progress: 52,
    position: "Frontière de Cinkassé, en attente depuis 27 h",
    expenses: [
      e("Carburant", "Plein départ (430 L gasoil)", "Station Port de Lomé", 292_400, "12 nov · 06:30"),
      e("Péage", "Péage de Davié", "Davié", 4_000, "12 nov · 07:50"),
      e("Péage", "Péage d'Aléhéridè", "Aléhéridè", 4_000, "12 nov · 13:30"),
      e("Carburant", "Complément (150 L gasoil)", "Kara", 102_000, "12 nov · 21:00"),
      e("Péage", "Péage de Kara", "Kara", 4_000, "12 nov · 21:15"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 175_000, "13 nov · 14:20"),
      e("Frais de route", "Frais de stationnement", "Cinkassé", 8_000, "14 nov · 09:10", "sans reçu"),
    ],
  },
  {
    id: "VOY-2026-045",
    origin: "Port de Lomé",
    destination: "Ouagadougou",
    plate: "TG-1234-A",
    driver: "Messan Adjovi",
    driverPhone: "+228 90 88 12 04",
    client: "Sahel Négoce SARL",
    cargo: "Huile végétale (24 palettes)",
    billed: 2_180_000,
    budget: 1_150_000,
    status: "Frontière",
    departure: "13 nov · 04:45",
    eta: "16 nov · 10:00",
    distanceKm: 957,
    progress: 66,
    position: "Frontière de Cinkassé, en attente depuis 25 h",
    expenses: [
      e("Carburant", "Plein départ (400 L gasoil)", "Station Port de Lomé", 272_000, "13 nov · 04:20"),
      e("Péage", "Péage de Davié", "Davié", 4_000, "13 nov · 05:40"),
      e("Péage", "Péage d'Aléhéridè", "Aléhéridè", 4_000, "13 nov · 11:00"),
      e("Frais de route", "Contrôle police", "Blitta", 5_000, "13 nov · 09:05", "sans reçu"),
      e("Carburant", "Complément (140 L gasoil)", "Kara", 95_200, "13 nov · 17:30"),
      e("Péage", "Péage de Kara", "Kara", 4_000, "13 nov · 17:45"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 180_000, "14 nov · 11:40", "en attente"),
    ],
  },
  {
    id: "VOY-2026-046",
    origin: "Port de Lomé",
    destination: "Dapaong",
    plate: "TG-6610-B",
    driver: "Yao Kpodar",
    driverPhone: "+228 92 30 51 89",
    client: "Comptoir du Golfe",
    cargo: "Produits alimentaires (18 t)",
    billed: 950_000,
    budget: 520_000,
    status: "En route",
    departure: "14 nov · 05:15",
    eta: "15 nov · 20:00",
    distanceKm: 630,
    progress: 74,
    position: "Mango, RN1 km 552",
    expenses: [
      e("Carburant", "Plein départ (300 L gasoil)", "Station Port de Lomé", 204_000, "14 nov · 04:55"),
      e("Péage", "Péage de Davié", "Davié", 4_000, "14 nov · 06:10"),
      e("Péage", "Péage d'Aléhéridè", "Aléhéridè", 4_000, "14 nov · 11:35"),
      e("Carburant", "Complément (80 L gasoil)", "Kara", 54_400, "14 nov · 19:10"),
      e("Péage", "Péage de Kara", "Kara", 4_000, "14 nov · 19:25"),
    ],
  },
  {
    id: "VOY-2026-047",
    origin: "Port de Lomé",
    destination: "Cinkassé",
    plate: "TG-2045-A",
    driver: "Komlan Akakpo",
    driverPhone: "+228 93 14 77 60",
    client: "Comptoir du Golfe",
    cargo: "Clinker vrac (34 t)",
    billed: 1_050_000,
    budget: 560_000,
    status: "En route",
    departure: "14 nov · 09:00",
    eta: "16 nov · 08:00",
    distanceKm: 669,
    progress: 35,
    position: "Atakpamé, RN1 km 162",
    expenses: [
      e("Carburant", "Plein départ (320 L gasoil)", "Station Port de Lomé", 217_600, "14 nov · 08:35"),
      e("Péage", "Péage de Davié", "Davié", 4_000, "14 nov · 10:05"),
      e("Frais de route", "Contrôle police", "Notsé", 10_000, "14 nov · 12:20", "sans reçu"),
    ],
  },
  {
    id: "VOY-2026-048",
    origin: "Port de Lomé",
    destination: "Bamako",
    plate: "TG-7781-C",
    driver: "Ibrahim Ouédraogo",
    driverPhone: "+228 96 02 38 41",
    client: "Bamako Matériaux SA",
    cargo: "Fers à béton HA (30 t)",
    billed: 3_350_000,
    budget: 1_800_000,
    status: "En chargement",
    departure: "15 nov · 14:00",
    eta: "21 nov · 12:00",
    distanceKm: 1_857,
    progress: 4,
    position: "Port de Lomé, quai n°3",
    expenses: [
      e("Frais de Douane", "Frais de manutention portuaire", "Port de Lomé", 95_000, "15 nov · 08:30"),
    ],
  },
  {
    id: "VOY-2026-049",
    origin: "Port de Lomé",
    destination: "Ouagadougou",
    plate: "TG-4452-A",
    driver: "Edem Amegah",
    driverPhone: "+228 97 55 20 13",
    client: "Faso Distribution Plus",
    cargo: "Conteneur 40', sucre (27 t)",
    billed: 2_250_000,
    budget: 1_180_000,
    status: "En chargement",
    departure: "15 nov · 16:30",
    eta: "18 nov · 20:00",
    distanceKm: 957,
    progress: 2,
    position: "Port de Lomé, terminal à conteneurs",
    expenses: [
      e("Frais de Douane", "Frais de manutention portuaire", "Port de Lomé", 88_000, "15 nov · 09:15", "en attente"),
    ],
  },

  // ----------------------------- Terminés ---------------------------------
  {
    id: "VOY-2026-041",
    origin: "Port de Lomé",
    destination: "Ouagadougou",
    plate: "TG-3307-C",
    driver: "Kossi Agbeko",
    driverPhone: "+228 99 41 60 15",
    client: "Sahel Négoce SARL",
    cargo: "Conteneur 40', farine (26 t)",
    billed: 2_200_000,
    budget: 1_180_000,
    status: "Terminé",
    departure: "6 nov · 05:00",
    eta: "11 nov · 17:40",
    distanceKm: 957,
    progress: 100,
    position: "Retour Port de Lomé",
    expenses: [
      e("Carburant", "Plein départ (410 L gasoil)", "Station Port de Lomé", 278_800, "6 nov · 04:40"),
      e("Péage", "Péages Togo (aller)", "Davié · Aléhéridè · Kara", 12_000, "6 nov · 19:00"),
      e("Carburant", "Complément (140 L gasoil)", "Kara", 95_200, "6 nov · 18:20"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 180_000, "7 nov · 10:00"),
      e("Frais de route", "Escorte douanière", "Cinkassé → Ouagadougou", 45_000, "7 nov · 15:30"),
      e("Péage", "Péages Burkina Faso", "Koupéla · Ouagadougou", 12_000, "8 nov · 09:00"),
      e("Carburant", "Plein retour (330 L gasoil)", "Ouagadougou", 280_500, "9 nov · 07:15"),
      e("Péage", "Péages Togo (retour)", "Kara · Aléhéridè · Davié", 12_000, "11 nov · 15:00"),
    ],
  },
  {
    id: "VOY-2026-040",
    origin: "Port de Lomé",
    destination: "Cinkassé",
    plate: "TG-2045-A",
    driver: "Komlan Akakpo",
    driverPhone: "+228 93 14 77 60",
    client: "Comptoir du Golfe",
    cargo: "Clinker vrac (34 t)",
    billed: 1_000_000,
    budget: 560_000,
    status: "Terminé",
    departure: "5 nov · 08:00",
    eta: "10 nov · 19:20",
    distanceKm: 669,
    progress: 100,
    position: "Retour Port de Lomé",
    expenses: [
      e("Carburant", "Plein départ (320 L gasoil)", "Station Port de Lomé", 217_600, "5 nov · 07:40"),
      e("Péage", "Péages Togo (aller)", "Davié · Aléhéridè · Kara", 12_000, "5 nov · 20:00"),
      e("Frais de route", "Contrôles police (×6)", "RN1", 60_000, "5 nov · 22:00", "sans reçu"),
      e("Entretien", "Remplacement 2 pneus avant", "Garage Kara", 420_000, "6 nov · 10:30", "anomalie", "Pneus remplacés il y a 3 semaines"),
      e("Carburant", "Plein retour (300 L gasoil)", "Dapaong", 204_000, "8 nov · 06:00"),
      e("Frais de route", "Gardiennage + escorte", "Cinkassé", 85_000, "8 nov · 11:00", "sans reçu"),
      e("Péage", "Péages Togo (retour)", "Kara · Aléhéridè · Davié", 12_000, "10 nov · 17:00"),
    ],
  },
  {
    id: "VOY-2026-039",
    origin: "Port de Lomé",
    destination: "Bamako",
    plate: "TG-8899-B",
    driver: "Abdoulaye Traoré",
    driverPhone: "+228 91 77 03 22",
    client: "Bamako Matériaux SA",
    cargo: "Ciment CPJ 42,5 (32 t)",
    billed: 3_400_000,
    budget: 1_820_000,
    status: "Terminé",
    departure: "1 nov · 05:30",
    eta: "10 nov · 21:00",
    distanceKm: 1_857,
    progress: 100,
    position: "Retour Port de Lomé",
    expenses: [
      e("Carburant", "Plein départ (450 L gasoil)", "Station Port de Lomé", 306_000, "1 nov · 05:00"),
      e("Péage", "Péages Togo (aller)", "Davié · Aléhéridè · Kara", 12_000, "1 nov · 20:00"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 185_000, "2 nov · 09:30"),
      e("Carburant", "Complément (300 L gasoil)", "Ouagadougou", 255_000, "3 nov · 08:10"),
      e("Frais de route", "Escorte + contrôles", "Burkina Faso", 70_000, "3 nov · 18:00"),
      e("Péage", "Péages Burkina · Mali", "Corridor Ouaga-Bamako", 28_000, "4 nov · 16:00"),
      e("Frais de Douane", "Frontière Hérémakono", "Hérémakono", 140_000, "4 nov · 11:20"),
      e("Carburant", "Plein retour (480 L gasoil)", "Bamako", 403_200, "6 nov · 06:30"),
      e("Entretien", "Vidange + filtres", "Garage Bamako", 85_000, "6 nov · 09:00"),
      e("Péage", "Péages retour", "Corridor Bamako-Lomé", 40_000, "10 nov · 17:00"),
    ],
  },
  {
    id: "VOY-2026-038",
    origin: "Port de Lomé",
    destination: "Dapaong",
    plate: "TG-6610-B",
    driver: "Yao Kpodar",
    driverPhone: "+228 92 30 51 89",
    client: "Comptoir du Golfe",
    cargo: "Produits alimentaires (18 t)",
    billed: 950_000,
    budget: 520_000,
    status: "Terminé",
    departure: "4 nov · 06:00",
    eta: "8 nov · 16:30",
    distanceKm: 630,
    progress: 100,
    position: "Retour Port de Lomé",
    expenses: [
      e("Carburant", "Plein départ (300 L gasoil)", "Station Port de Lomé", 204_000, "4 nov · 05:40"),
      e("Péage", "Péages Togo (aller)", "Davié · Aléhéridè · Kara", 12_000, "4 nov · 19:00"),
      e("Frais de route", "Contrôle police", "Sokodé", 5_000, "4 nov · 14:00", "sans reçu"),
      e("Carburant", "Plein retour (250 L gasoil)", "Dapaong", 170_000, "6 nov · 07:00"),
      e("Péage", "Péages Togo (retour)", "Kara · Aléhéridè · Davié", 12_000, "8 nov · 14:00"),
    ],
  },
  {
    id: "VOY-2026-037",
    origin: "Port de Lomé",
    destination: "Niamey",
    plate: "TG-5521-A",
    driver: "Koffi Mensah",
    driverPhone: "+228 90 12 45 78",
    client: "Niamey Agro-Industries",
    cargo: "Engrais urée (30 t)",
    billed: 2_900_000,
    budget: 1_560_000,
    status: "Terminé",
    departure: "29 oct · 06:00",
    eta: "7 nov · 22:10",
    distanceKm: 1_192,
    progress: 100,
    position: "Retour Port de Lomé",
    expenses: [
      e("Carburant", "Plein départ (430 L gasoil)", "Station Port de Lomé", 292_400, "29 oct · 05:30"),
      e("Carburant", "Complément (260 L gasoil)", "Sokodé", 176_800, "29 oct · 17:00", "anomalie", "+22 % vs consommation de référence"),
      e("Péage", "Péages Togo (aller)", "Davié · Aléhéridè · Kara", 12_000, "29 oct · 21:00"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 175_000, "30 oct · 13:00"),
      e("Frais de route", "Escortes + contrôles", "Burkina · Niger", 185_000, "1 nov · 18:00", "sans reçu"),
      e("Carburant", "Plein (420 L gasoil)", "Fada N'Gourma", 357_000, "1 nov · 07:00", "anomalie", "Reçu illisible"),
      e("Frais de Douane", "Frontière Kantchari", "Kantchari", 220_000, "2 nov · 11:00"),
      e("Carburant", "Plein retour (520 L gasoil)", "Niamey", 468_000, "4 nov · 06:00"),
      e("Entretien", "Réparation embrayage", "Garage Niamey", 820_000, "4 nov · 15:00", "en attente"),
      e("Frais de Douane", "Pénalité de surestaries", "Entrepôt Niamey", 140_000, "5 nov · 10:00"),
      e("Frais de route", "Contrôles retour", "Corridor Niamey-Lomé", 120_000, "6 nov · 20:00", "sans reçu"),
      e("Péage", "Péages retour", "Corridor Niamey-Lomé", 36_000, "7 nov · 18:00"),
    ],
  },
  {
    id: "VOY-2026-036",
    origin: "Port de Lomé",
    destination: "Ouagadougou",
    plate: "TG-9013-B",
    driver: "Séna Dossou",
    driverPhone: "+228 98 63 11 72",
    client: "Faso Distribution Plus",
    cargo: "Conteneur 40', riz (28 t)",
    billed: 2_250_000,
    budget: 1_180_000,
    status: "Terminé",
    departure: "28 oct · 05:00",
    eta: "2 nov · 18:00",
    distanceKm: 957,
    progress: 100,
    position: "Retour Port de Lomé",
    expenses: [
      e("Carburant", "Plein départ (400 L gasoil)", "Station Port de Lomé", 272_000, "28 oct · 04:40"),
      e("Péage", "Péages Togo (aller)", "Davié · Aléhéridè · Kara", 12_000, "28 oct · 19:00"),
      e("Carburant", "Complément (130 L gasoil)", "Kara", 88_400, "28 oct · 18:30"),
      e("Frais de Douane", "Déclaration transit TRIE", "Bureau de Cinkassé", 180_000, "29 oct · 09:40"),
      e("Frais de route", "Escorte douanière", "Cinkassé → Ouagadougou", 45_000, "29 oct · 14:00"),
      e("Péage", "Péages Burkina Faso", "Koupéla · Ouagadougou", 12_000, "30 oct · 08:00"),
      e("Carburant", "Plein retour (320 L gasoil)", "Ouagadougou", 272_000, "31 oct · 07:00"),
      e("Péage", "Péages Togo (retour)", "Kara · Aléhéridè · Davié", 12_000, "2 nov · 16:00"),
    ],
  },
];

// ---------------------------------------------------------------------------
// Agrégats mensuels (novembre 2026), chiffres de la direction financière
// ---------------------------------------------------------------------------

export const MONTH_LABEL = "Novembre 2026";

export const MONTHLY = {
  revenue: 18_500_000,
  expenses: 12_200_000,
  revenuePrev: 16_900_000,
  expensesPrev: 11_850_000,
  unjustified: 685_000, // frais sans justificatif ce mois
};

export const WEEKLY = [
  { week: "19 au 25 oct", revenus: 4_150_000, depenses: 2_980_000 },
  { week: "26 oct au 1er nov", revenus: 4_600_000, depenses: 3_420_000 },
  { week: "2 au 8 nov", revenus: 4_350_000, depenses: 3_050_000 },
  { week: "9 au 15 nov", revenus: 5_400_000, depenses: 3_150_000 },
];

export const EXPENSE_BREAKDOWN: { category: ExpenseCategory; amount: number }[] = [
  { category: "Carburant", amount: 6_100_000 },
  { category: "Frais de Douane", amount: 2_700_000 },
  { category: "Frais de route", amount: 1_450_000 },
  { category: "Entretien", amount: 1_100_000 },
  { category: "Péage", amount: 850_000 },
];

// Dépenses pouvant « tomber » en direct pendant la démo
export const LIVE_EXPENSE_POOL: Omit<Expense, "id" | "date">[] = [
  { category: "Frais de route", label: "Contrôle gendarmerie", location: "RN1", amount: 5_000, status: "sans reçu" },
  { category: "Péage", label: "Péage de Kara", location: "Kara", amount: 4_000, status: "validé" },
  { category: "Frais de route", label: "Contrôle police", location: "Sokodé", amount: 5_000, status: "sans reçu" },
  { category: "Carburant", label: "Complément (60 L gasoil)", location: "Station Total, Kara", amount: 40_800, status: "en attente" },
  { category: "Frais de route", label: "Pesage essieux", location: "Poste de Kpessi", amount: 10_000, status: "validé" },
  { category: "Péage", label: "Péage d'Aléhéridè", location: "Aléhéridè", amount: 4_000, status: "validé" },
  { category: "Entretien", label: "Réparation crevaison", location: "Vulcanisateur, Mango", amount: 7_500, status: "en attente" },
];
