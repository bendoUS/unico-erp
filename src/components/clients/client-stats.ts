import type { Client, Contract, Invoice } from "@/lib/billing";
import type { Trip } from "@/lib/data";

export type ClientStats = {
  trips: Trip[];
  active: Trip[];
  invoices: Invoice[];
  billed: number;
  unpaid: number;
  late: Invoice[];
  contract?: Contract;
};

export function clientStats(client: Client, trips: Trip[], allInvoices: Invoice[], contracts: Contract[]): ClientStats {
  const own = trips.filter((t) => t.client === client.name);
  const invoices = allInvoices.filter((i) => i.client === client.name);
  const open = invoices.filter((i) => i.status === "Envoyée" || i.status === "En retard");
  return {
    trips: own,
    active: own.filter((t) => t.status !== "Terminé"),
    invoices,
    billed: own.reduce((s, t) => s + t.billed, 0),
    unpaid: open.reduce((s, i) => s + i.amount - i.paid, 0),
    late: invoices.filter((i) => i.status === "En retard"),
    contract: contracts.find((c) => c.client === client.name),
  };
}
