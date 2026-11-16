"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlarmClockIcon,
  BanknoteIcon,
  BellRingIcon,
  CheckIcon,
  FilePenIcon,
  FileTextIcon,
  HourglassIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { toast } from "sonner";

import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import type { DraftDoc } from "@/components/facturation/document-preview";
import { ContractSheet, DocumentSheet } from "@/components/facturation/document-sheet";
import { blankQuote, invoiceDraft, invoiceFromQuote, quoteDraft } from "@/components/facturation/drafts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  lineTotal,
  type Contract,
  type ContractStatus,
  type Quote,
  type Invoice,
  type InvoiceStatus,
  type QuoteStatus,
} from "@/lib/billing";
import { useSales } from "@/lib/sales-store";
import { cn, formatNumber } from "@/lib/utils";

const STATUS_STYLE: Record<InvoiceStatus, string> = {
  "À émettre": "bg-slate-500/10 text-slate-600",
  Envoyée: "bg-blue-500/10 text-blue-700",
  "En retard": "bg-rose-500/10 text-rose-700",
  Payée: "bg-emerald-500/10 text-emerald-700",
};


const QUOTE_STYLE: Record<QuoteStatus, string> = {
  Brouillon: "bg-slate-500/10 text-slate-600",
  Envoyé: "bg-blue-500/10 text-blue-700",
  Accepté: "bg-emerald-500/10 text-emerald-700",
  Refusé: "bg-rose-500/10 text-rose-700",
};

const CONTRACT_STYLE: Record<ContractStatus, string> = {
  Actif: "bg-emerald-500/10 text-emerald-700",
  "À renouveler": "bg-amber-500/10 text-amber-700",
  "En négociation": "bg-blue-500/10 text-blue-700",
};




function Chip({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

const TABLE =
  "@container overflow-hidden rounded-xl border border-slate-200 bg-white";
const THEAD =
  "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500";

type View = "factures" | "devis" | "contrats";

type Filter = "Toutes" | InvoiceStatus;
const FILTERS: Filter[] = [
  "Toutes",
  "En retard",
  "Envoyée",
  "Payée",
  "À émettre",
];

export function BillingClient() {
  const { invoices, quotes, contracts, nextInvoiceNumber, nextQuoteNumber, sendDocument, markPaid, acceptQuote, signContract } = useSales();
  const [filter, setFilter] = useState<Filter>("En retard");
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>("factures");
  const [draft, setDraft] = useState<{
    doc: DraftDoc;
    readOnly: boolean;
  } | null>(null);
  const [contract, setContract] = useState<Contract | null>(null);

  const openInvoice = (i: Invoice) =>
    setDraft({ doc: invoiceDraft(i), readOnly: i.status !== "À émettre" });
  const newQuote = () => setDraft({ readOnly: false, doc: blankQuote(nextQuoteNumber, "Comptoir du Golfe") });

  const handleSend = (doc: DraftDoc) => {
    sendDocument(doc);
    setDraft(null);
  };

  const quoteToInvoice = (q: Quote) =>
    setDraft({
      readOnly: false,
      doc: invoiceFromQuote(q, invoices.find((i) => i.status === "À émettre" && i.client === q.client), nextInvoiceNumber),
    });

  const issued = invoices.filter((i) => i.status !== "À émettre");
  const billed = issued.reduce((s, i) => s + i.amount, 0);
  const cashed = issued.reduce((s, i) => s + i.paid, 0);
  const late = invoices.filter((i) => i.status === "En retard");
  const lateAmount = late.reduce((s, i) => s + i.amount - i.paid, 0);
  const toIssue = invoices.filter((i) => i.status === "À émettre");

  const count = (f: Filter) =>
    f === "Toutes"
      ? invoices.length
      : invoices.filter((i) => i.status === f).length;
  const q = query.trim().toLowerCase();
  const rows = invoices.filter(
    (i) =>
      (filter === "Toutes" || i.status === filter) &&
      (!q ||
        [i.id, i.client, i.tripId].some((v) => v.toLowerCase().includes(q))),
  );

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Ventes
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Devis, contrats et factures de vos clients : préparez,
            prévisualisez, puis envoyez.
          </p>
        </div>
        <Button
          className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
          onClick={() => {
            if (view === "devis") return newQuote();
            if (view === "contrats")
              return setContract(
                contracts.find((c) => c.status === "En négociation") ??
                  contracts[0],
              );
            const next = invoices.find((i) => i.status === "À émettre");
            if (next) openInvoice(next);
          }}
        >
          <PlusIcon className="size-4" />
          {view === "devis"
            ? "Nouveau devis"
            : view === "contrats"
              ? "Nouveau contrat"
              : "Nouvelle facture"}
        </Button>
      </div>

      <div className={KPI_GRID}>
        <KpiCard
          icon={FileTextIcon}
          title="Facturé"
          value={formatNumber(billed)}
          unit="FCFA"
          color="blue"
          footer={`${issued.length} factures émises`}
        />
        <KpiCard
          icon={BanknoteIcon}
          title="Encaissé"
          value={formatNumber(cashed)}
          unit="FCFA"
          color="emerald"
          footer={`${Math.round((cashed / billed) * 100)} % du montant facturé`}
        />
        <KpiCard
          icon={AlarmClockIcon}
          title="En retard de paiement"
          value={formatNumber(lateAmount)}
          unit="FCFA"
          alert={late.length > 0}
          footer={`${late.length} facture${late.length > 1 ? "s" : ""} à relancer`}
        />
        <KpiCard
          icon={HourglassIcon}
          title="À facturer"
          value={toIssue.length}
          color="amber"
          footer="Voyages en cours, facture à la livraison"
        />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList>
          <TabsTrigger value="devis" className="gap-1.5">
            Devis
            <span className="text-xs text-muted-foreground tabular-nums">
              {quotes.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="contrats" className="gap-1.5">
            Contrats
            <span className="text-xs text-muted-foreground tabular-nums">
              {contracts.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="factures" className="gap-1.5">
            Factures
            <span className="text-xs text-muted-foreground tabular-nums">
              {invoices.length}
            </span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "factures" && (
        <>
          <div className="flex flex-col gap-4 @3xl/main:flex-row @3xl/main:items-center">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
              <TabsList>
                {FILTERS.map((f) => (
                  <TabsTrigger key={f} value={f} className="gap-1.5">
                    {f}
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {count(f)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative flex-1">
              <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un client, une facture, un voyage…"
                className="border-slate-200 bg-white pl-9"
              />
            </div>
          </div>

          <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Facture</th>
                    <th className="hidden px-4 py-3 @2xl:table-cell">Voyage</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                    <th className="hidden px-4 py-3 @4xl:table-cell">
                      Échéance
                    </th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="hidden px-4 py-3 text-right @3xl:table-cell" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-4 py-10 text-center text-sm text-slate-500"
                      >
                        Aucune facture dans cette liste.
                      </td>
                    </tr>
                  )}
                  {rows.map((i) => (
                    <tr
                      key={i.id}
                      onClick={() => openInvoice(i)}
                      className="cursor-pointer transition-colors hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold whitespace-nowrap text-slate-900">
                          {i.client}
                        </div>
                        <div className="text-xs whitespace-nowrap text-slate-500">
                          {i.status === "À émettre" ? "Brouillon" : i.id}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 @2xl:table-cell">
                        <Link
                          href={`/voyages?trip=${i.tripId}`}
                          onClick={(e) => e.stopPropagation()}
                          className="font-medium whitespace-nowrap text-slate-700 hover:underline"
                        >
                          {i.tripId}
                        </Link>
                        <div className="text-xs whitespace-nowrap text-slate-500">
                          {i.route}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <div className="font-semibold whitespace-nowrap text-slate-800">
                          {formatNumber(i.amount)}
                        </div>
                        {i.paid > 0 && i.paid < i.amount && (
                          <div className="text-xs whitespace-nowrap text-emerald-700">
                            {formatNumber(i.paid)} reçus
                          </div>
                        )}
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap @4xl:table-cell">
                        {i.due ? (
                          <>
                            <div className="text-slate-700">{i.due}</div>
                            <div
                              className={cn(
                                "text-xs",
                                i.lateDays
                                  ? "font-medium text-rose-600"
                                  : "text-slate-500",
                              )}
                            >
                              {i.lateDays
                                ? `${i.lateDays} jours de retard`
                                : `émise le ${i.issued}`}
                            </div>
                          </>
                        ) : (
                          <span className="text-xs text-slate-400">
                            À la livraison
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            "rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap",
                            STATUS_STYLE[i.status],
                          )}
                        >
                          {i.status}
                        </span>
                      </td>
                      <td
                        className="hidden px-4 py-3 text-right @3xl:table-cell"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <InvoiceAction
                          onPrepare={() => openInvoice(i)}
                          invoice={i}
                          onPaid={() => {
                            markPaid(i.id);
                            toast.success("Paiement enregistré", {
                              description: `${i.client} · ${formatNumber(i.amount)} FCFA`,
                            });
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === "devis" && (
        <div className={TABLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className={THEAD}>
                <tr>
                  <th className="px-4 py-3">Devis</th>
                  <th className="hidden px-4 py-3 @2xl:table-cell">Trajet</th>
                  <th className="px-4 py-3 text-right">Montant HT</th>
                  <th className="hidden px-4 py-3 @4xl:table-cell">Validité</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="hidden px-4 py-3 @3xl:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {quotes.map((q) => (
                  <tr
                    key={q.id}
                    onClick={() =>
                      setDraft({
                        doc: quoteDraft(q),
                        readOnly: q.status !== "Brouillon",
                      })
                    }
                    className="cursor-pointer transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold whitespace-nowrap text-slate-900">
                        {q.client}
                      </div>
                      <div className="text-xs whitespace-nowrap text-slate-500">
                        {q.id} · {q.date}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 @2xl:table-cell">
                      <div className="whitespace-nowrap text-slate-700">
                        {q.route}
                      </div>
                      <div className="text-xs whitespace-nowrap text-slate-500">
                        {q.cargo}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums text-slate-800">
                      {formatNumber(lineTotal(q.lines))}
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap @4xl:table-cell">
                      jusqu&apos;au {q.validUntil}
                    </td>
                    <td className="px-4 py-3">
                      <Chip className={QUOTE_STYLE[q.status]}>{q.status}</Chip>
                    </td>
                    <td
                      className="hidden px-4 py-3 text-right @3xl:table-cell"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {q.status === "Accepté" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-slate-200 bg-white shadow-none"
                          onClick={() => quoteToInvoice(q)}
                        >
                          <FileTextIcon className="size-3.5" />
                          Facturer
                        </Button>
                      )}
                      {q.status === "Brouillon" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-slate-200 bg-white shadow-none"
                          onClick={() =>
                            setDraft({ doc: quoteDraft(q), readOnly: false })
                          }
                        >
                          <FilePenIcon className="size-3.5" />
                          Terminer
                        </Button>
                      )}
                      {q.status === "Envoyé" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5 border-slate-200 bg-white shadow-none"
                          onClick={() => {
                            acceptQuote(q.id);
                            toast.success("Devis accepté", {
                              description: `${q.client} · vous pouvez maintenant le facturer.`,
                            });
                          }}
                        >
                          <CheckIcon className="size-3.5" />
                          Marquer accepté
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "contrats" && (
        <div className={TABLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className={THEAD}>
                <tr>
                  <th className="px-4 py-3">Client</th>
                  <th className="hidden px-4 py-3 @3xl:table-cell">Tarifs</th>
                  <th className="hidden px-4 py-3 @2xl:table-cell">Paiement</th>
                  <th className="px-4 py-3">Volume</th>
                  <th className="px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contracts.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => setContract(c)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold whitespace-nowrap text-slate-900">
                        {c.client}
                      </div>
                      <div className="text-xs whitespace-nowrap text-slate-500">
                        {c.id} · {c.start} au {c.end}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 @3xl:table-cell">
                      <div className="whitespace-nowrap text-slate-700">
                        {c.rates[0].route}
                      </div>
                      <div className="text-xs whitespace-nowrap text-slate-500">
                        {formatNumber(c.rates[0].price)} FCFA /{" "}
                        {c.rates[0].unit}
                        {c.rates.length > 1 &&
                          ` · +${c.rates.length - 1} tarif${c.rates.length > 2 ? "s" : ""}`}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap @2xl:table-cell">
                      à {c.paymentDays} jours
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex w-32 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min(100, (c.tripsDone / c.minTrips) * 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs whitespace-nowrap tabular-nums text-slate-500">
                          {c.tripsDone}/{c.minTrips}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Chip className={CONTRACT_STYLE[c.status]}>
                        {c.status}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DocumentSheet
        draft={draft?.doc ?? null}
        readOnly={draft?.readOnly}
        onClose={() => setDraft(null)}
        onSend={handleSend}
      />
      <ContractSheet
        contract={contract}
        onClose={() => setContract(null)}
        onRenew={(c, email) => {
          if (c.status !== "Actif")
            signContract(c.id);
          toast.success(
            c.status === "Actif"
              ? "Avenant préparé"
              : "Contrat envoyé pour signature",
            { description: `${c.id} · ${email}` },
          );
          setContract(null);
        }}
      />
    </div>
  );
}

function InvoiceAction({
  invoice: i,
  onPaid,
  onPrepare,
}: {
  invoice: Invoice;
  onPaid: () => void;
  onPrepare: () => void;
}) {
  const base = "gap-1.5 border-slate-200 bg-white shadow-none";
  if (i.status === "Payée") return null;
  if (i.status === "À émettre")
    return (
      <Button variant="outline" size="sm" className={base} onClick={onPrepare}>
        <FilePenIcon className="size-3.5" />
        Préparer la facture
      </Button>
    );
  return (
    <div className="flex justify-end gap-2">
      {i.status === "En retard" && (
        <Button
          variant="outline"
          size="sm"
          className={cn(base, "text-rose-700 hover:bg-rose-50")}
          onClick={() =>
            toast.success("Relance envoyée", {
              description: `${i.client} a reçu un rappel par SMS et e-mail.`,
            })
          }
        >
          <BellRingIcon className="size-3.5" />
          Relancer
        </Button>
      )}
      <Button variant="outline" size="sm" className={base} onClick={onPaid}>
        <CheckIcon className="size-3.5" />
        Marquer payée
      </Button>
    </div>
  );
}
