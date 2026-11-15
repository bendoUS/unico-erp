import type { DraftDoc } from "@/components/facturation/document-preview";
import { DUE_OPTIONS } from "@/components/facturation/document-sheet";
import type { Invoice, Quote } from "@/lib/billing";

export const TODAY_LABEL = "15 nov. 2026";

export function invoiceDraft(i: Invoice): DraftDoc {
  return {
    kind: "facture",
    number: i.id,
    client: i.client,
    route: i.route,
    cargo: i.cargo,
    tripId: i.tripId,
    date: i.issued ? `${i.issued} 2026` : TODAY_LABEL,
    dueLabel: i.due || DUE_OPTIONS[1].label,
    lines: [{ label: `Transport ${i.route}`, qty: 1, unit: i.amount }],
    note: "",
  };
}

export function quoteDraft(q: Quote): DraftDoc {
  return { kind: "devis", number: q.id, client: q.client, route: q.route, cargo: q.cargo, date: `${q.date} 2026`, dueLabel: q.validUntil, lines: q.lines, note: "" };
}

export function blankQuote(number: string, client: string): DraftDoc {
  return {
    kind: "devis",
    number,
    client,
    route: "Port de Lomé → ",
    cargo: "",
    date: TODAY_LABEL,
    dueLabel: DUE_OPTIONS[1].label,
    lines: [{ label: "Transport", qty: 1, unit: 0 }],
    note: "",
  };
}

/** Facture à partir d'un devis accepté : on reprend ses lignes. */
export function invoiceFromQuote(q: Quote, base: Invoice | undefined, number: string): DraftDoc {
  const doc = base ? invoiceDraft(base) : { ...blankQuote(number, q.client), kind: "facture" as const };
  return { ...doc, client: q.client, route: q.route, cargo: q.cargo, lines: q.lines, note: `Selon devis ${q.id} accepté.` };
}
