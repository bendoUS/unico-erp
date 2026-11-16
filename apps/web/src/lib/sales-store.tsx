"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { DraftDoc } from "@/components/facturation/document-preview";
import { CONTRACTS, QUOTES, buildInvoices, lineTotal, type Contract, type Invoice, type Quote } from "@/lib/billing";

/**
 * Ventes : devis, contrats et factures, partagés par toutes les pages
 * (module Ventes, fiche client, fiche voyage).
 */
type SalesState = {
  invoices: Invoice[];
  quotes: Quote[];
  contracts: Contract[];
  nextInvoiceNumber: string;
  nextQuoteNumber: string;
  sendDocument: (doc: DraftDoc) => void;
  markPaid: (invoiceId: string) => void;
  acceptQuote: (quoteId: string) => void;
  signContract: (contractId: string) => void;
};

const SalesContext = createContext<SalesState | null>(null);

export function SalesProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>(buildInvoices);
  const [quotes, setQuotes] = useState<Quote[]>(QUOTES);
  const [contracts, setContracts] = useState<Contract[]>(CONTRACTS);

  const nextInvoiceNumber = `FAC-2026-${String(313 + invoices.length - buildInvoices().length).padStart(4, "0")}`;
  const nextQuoteNumber = `DEV-2026-${String(89 + quotes.length - QUOTES.length).padStart(4, "0")}`;

  const sendDocument = useCallback((doc: DraftDoc) => {
    if (doc.kind === "facture") {
      const amount = lineTotal(doc.lines);
      setInvoices((prev) => {
        const sent = { status: "Envoyée" as const, issued: "15 nov", due: doc.dueLabel, client: doc.client, amount };
        if (prev.some((i) => i.id === doc.number)) {
          return prev.map((i) => (i.id === doc.number && i.status === "À émettre" ? { ...i, ...sent } : i));
        }
        // Facture libre (sans voyage à facturer), créée depuis une fiche client ou un devis.
        return [{ id: doc.number, tripId: doc.tripId ?? "Hors voyage", route: doc.route, cargo: doc.cargo, paid: 0, ...sent }, ...prev];
      });
    } else {
      setQuotes((prev) => {
        const q: Quote = { id: doc.number, client: doc.client, route: doc.route, cargo: doc.cargo, date: "15 nov", validUntil: doc.dueLabel, status: "Envoyé", lines: doc.lines };
        return prev.some((x) => x.id === doc.number)
          ? prev.map((x) => (x.id === doc.number ? { ...q, status: x.status === "Brouillon" ? "Envoyé" : x.status } : x))
          : [q, ...prev];
      });
    }
  }, []);

  const markPaid = useCallback(
    (id: string) => setInvoices((prev) => prev.map((i) => (i.id === id ? { ...i, status: "Payée", paid: i.amount, lateDays: undefined } : i))),
    [],
  );
  const acceptQuote = useCallback((id: string) => setQuotes((prev) => prev.map((q) => (q.id === id ? { ...q, status: "Accepté" } : q))), []);
  const signContract = useCallback((id: string) => setContracts((prev) => prev.map((c) => (c.id === id ? { ...c, status: "Actif" } : c))), []);

  const value = useMemo(
    () => ({ invoices, quotes, contracts, nextInvoiceNumber, nextQuoteNumber, sendDocument, markPaid, acceptQuote, signContract }),
    [invoices, quotes, contracts, nextInvoiceNumber, nextQuoteNumber, sendDocument, markPaid, acceptQuote, signContract],
  );
  return <SalesContext.Provider value={value}>{children}</SalesContext.Provider>;
}

export function useSales() {
  const ctx = useContext(SalesContext);
  if (!ctx) throw new Error("useSales doit être utilisé dans SalesProvider");
  return ctx;
}
