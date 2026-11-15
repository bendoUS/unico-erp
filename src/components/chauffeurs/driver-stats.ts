import type { Driver, Expense, Trip } from "@/lib/data";
import { tripMargin } from "@/lib/utils";

export interface DriverStats {
  trips: Trip[];
  receipts: Expense[];
  justified: number; // reçus avec justificatif (validés ou à vérifier)
  rate: number; // part des reçus justifiés (0 → 1)
  flagged: Expense[]; // anomalies et dépenses sans reçu
  margin: number; // marge des voyages terminés
}

/** Chiffres d'un chauffeur calculés à partir de ses voyages. */
export function driverStats(driver: Driver, trips: Trip[]): DriverStats {
  const own = trips.filter((t) => t.driver === driver.name);
  const receipts = own.flatMap((t) => t.expenses);
  const flagged = receipts.filter((x) => x.status === "anomalie" || x.status === "sans reçu");
  const justified = receipts.length - flagged.length;
  return {
    trips: own,
    receipts,
    justified,
    rate: receipts.length ? justified / receipts.length : 1,
    flagged,
    margin: own.filter((t) => t.status === "Terminé").reduce((s, t) => s + tripMargin(t), 0),
  };
}

/** Couleur du taux de reçus justifiés. */
export function rateTone(rate: number) {
  return rate >= 0.85 ? "emerald" : rate >= 0.7 ? "amber" : "rose";
}
