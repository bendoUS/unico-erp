"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlarmClockIcon,
  ArrowLeftIcon,
  BanknoteIcon,
  BellRingIcon,
  CheckIcon,
  FileSignatureIcon,
  FileTextIcon,
  MailIcon,
  MapIcon,
  MapPinIcon,
  RouteIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { clientStats } from "@/components/clients/client-stats";
import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import type { DraftDoc } from "@/components/facturation/document-preview";
import { ContractSheet, DocumentSheet } from "@/components/facturation/document-sheet";
import { blankQuote, invoiceDraft, invoiceFromQuote, quoteDraft } from "@/components/facturation/drafts";
import { FleetMap } from "@/components/flotte/fleet-map";
import { TripStatusBadge } from "@/components/trip-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { clientBySlug, lineTotal, type Contract, type Invoice, type InvoiceStatus, type Quote, type QuoteStatus } from "@/lib/billing";
import { useSales } from "@/lib/sales-store";
import { TRUCKS } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, formatNumber, shortCity } from "@/lib/utils";

const TAB_TRIGGER =
  "relative rounded-none border-0 border-b-2 border-transparent px-4 pb-3 pt-2 -mb-[1px] font-semibold text-muted-foreground hover:text-foreground data-active:border-b-blue-600 data-active:text-blue-600 data-active:shadow-none data-active:bg-transparent";
const TABLE = "@container overflow-hidden rounded-xl border border-slate-200 bg-white";
const THEAD = "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500";

const INVOICE_STYLE: Record<InvoiceStatus, string> = {
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

const ROW_BTN = "gap-1.5 border-slate-200 bg-white shadow-none";

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", className)}>{children}</span>;
}

export function ClientProfile({ slug }: { slug: string }) {
  const client = clientBySlug(slug)!;
  const { trips } = useTms();
  const { invoices, quotes: allQuotes, contracts, nextInvoiceNumber, nextQuoteNumber, sendDocument, markPaid, acceptQuote, signContract } = useSales();
  const router = useRouter();
  const [tab, setTab] = useState("carte");
  const [openContract, setOpenContract] = useState<Contract | null>(null);
  const [draft, setDraft] = useState<{ doc: DraftDoc; readOnly: boolean } | null>(null);
  const openQuote = (q: Quote) => setDraft({ doc: quoteDraft(q), readOnly: q.status !== "Brouillon" });
  const openInvoice = (i: Invoice) => setDraft({ doc: invoiceDraft(i), readOnly: i.status !== "À émettre" });
  const stats = clientStats(client, trips, invoices, contracts);
  const quotes = allQuotes.filter((q) => q.client === client.name);
  const activeTrucks = TRUCKS.filter((t) => stats.active.some((trip) => trip.plate === t.plate));
  const c = stats.contract;

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col items-start">
          <Link href="/clients" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Retour aux clients
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{client.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <MapPinIcon className="size-3" />
              {client.address}
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <UserIcon className="size-3" />
              {client.contact}
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <MailIcon className="size-3" />
              {client.email}
            </Badge>
            {stats.late.length > 0 && (
              <Badge variant="outline" className="border-rose-200 bg-rose-50 font-semibold text-rose-700">
                <AlarmClockIcon className="size-3" />
                {stats.late.length} facture{stats.late.length > 1 ? "s" : ""} en retard
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          {stats.late.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-slate-200 bg-white text-rose-700 shadow-none hover:bg-rose-50"
              onClick={() => toast.success("Relance envoyée", { description: `${client.contact} · ${client.email}` })}
            >
              <BellRingIcon className="size-4" />
              Relancer les impayés
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 bg-white shadow-none"
            onClick={() => setDraft({ readOnly: false, doc: blankQuote(nextQuoteNumber, client.name) })}
          >
            <FileSignatureIcon className="size-4" />
            Nouveau devis
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            onClick={() => {
              const pending = stats.invoices.find((i) => i.status === "À émettre");
              setDraft({
                readOnly: false,
                doc: pending ? invoiceDraft(pending) : { ...blankQuote(nextInvoiceNumber, client.name), kind: "facture" },
              });
            }}
          >
            <FileTextIcon className="size-4" />
            Nouvelle facture
          </Button>
        </div>
      </div>

      <div className={KPI_GRID}>
        <KpiCard icon={TruckIcon} title="Camions en cours" value={stats.active.length} color="amber" footer={activeTrucks.map((t) => t.plate).join(" · ") || "Aucun voyage en cours"} />
        <KpiCard icon={BanknoteIcon} title="Facturé ce mois" value={formatNumber(stats.billed)} unit="FCFA" color="emerald" footer={`${stats.trips.length} voyages en novembre`} />
        <KpiCard
          icon={AlarmClockIcon}
          title="Impayés"
          value={formatNumber(stats.unpaid)}
          unit="FCFA"
          alert={stats.late.length > 0}
          footer={stats.late.length ? `Dont ${formatNumber(stats.late.reduce((s, i) => s + i.amount - i.paid, 0))} FCFA en retard` : "Aucun retard de paiement"}
        />
        <KpiCard
          icon={FileSignatureIcon}
          title="Contrat"
          value={c ? c.status : "Aucun"}
          color="blue"
          footer={c ? `${c.tripsDone} voyages sur ${c.minTrips} · paiement à ${c.paymentDays} jours` : "Voyages facturés au devis"}
        />
      </div>


      <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="carte" className={TAB_TRIGGER}>
            <MapIcon className="mr-2 size-4" />
            Carte <span className="ml-1.5 text-xs font-normal text-muted-foreground">{activeTrucks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="voyages" className={TAB_TRIGGER}>
            <RouteIcon className="mr-2 size-4" />
            Voyages <span className="ml-1.5 text-xs font-normal text-muted-foreground">{stats.trips.length}</span>
          </TabsTrigger>
          <TabsTrigger value="factures" className={TAB_TRIGGER}>
            <FileTextIcon className="mr-2 size-4" />
            Factures <span className="ml-1.5 text-xs font-normal text-muted-foreground">{stats.invoices.length}</span>
          </TabsTrigger>
          <TabsTrigger value="contrat" className={TAB_TRIGGER}>
            <FileSignatureIcon className="mr-2 size-4" />
            Contrat
          </TabsTrigger>
          <TabsTrigger value="devis" className={TAB_TRIGGER}>
            <FileTextIcon className="mr-2 size-4" />
            Devis <span className="ml-1.5 text-xs font-normal text-muted-foreground">{quotes.length}</span>
          </TabsTrigger>
        </TabsList>

        {/* La carte reste montée quand on change d'onglet : les camions gardent leur position. */}
        <div className={cn(tab !== "carte" && "hidden")}>
          {activeTrucks.length > 0 ? (
            <FleetMap trucks={activeTrucks} trips={trips} onPick={(plate) => router.push(`/flotte/${plate}`)} visible={tab === "carte"} />
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Aucun camion en route pour ce client en ce moment.</div>
          )}
        </div>

        <TabsContent value="voyages" className="mt-0">
          <div className={TABLE}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className={THEAD}>
                  <tr>
                    <th className="px-4 py-3">Voyage</th>
                    <th className="hidden px-4 py-3 @2xl:table-cell">Marchandise</th>
                    <th className="hidden px-4 py-3 @3xl:table-cell">Camion</th>
                    <th className="px-4 py-3 text-right">Facturé</th>
                    <th className="px-4 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stats.trips.map((t) => (
                    <tr key={t.id} onClick={() => router.push(`/voyages?trip=${t.id}`)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold whitespace-nowrap text-slate-900">{t.id}</div>
                        <div className="text-xs whitespace-nowrap text-slate-500">
                          {shortCity(t.origin)} → {t.destination} · {t.departure}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 @2xl:table-cell">{t.cargo}</td>
                      <td className="hidden px-4 py-3 @3xl:table-cell">
                        <div className="font-medium whitespace-nowrap text-slate-700">{t.plate}</div>
                        <div className="text-xs whitespace-nowrap text-slate-500">{t.driver}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">{formatNumber(t.billed)}</td>
                      <td className="px-4 py-3">
                        <TripStatusBadge status={t.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="factures" className="mt-0">
          <div className={TABLE}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className={THEAD}>
                  <tr>
                    <th className="px-4 py-3">Facture</th>
                    <th className="px-4 py-3 text-right">Montant</th>
                    <th className="hidden px-4 py-3 @2xl:table-cell">Échéance</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="hidden px-4 py-3 @3xl:table-cell" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {stats.invoices.map((i) => (
                    <tr key={i.id} onClick={() => openInvoice(i)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold whitespace-nowrap text-slate-900">{i.status === "À émettre" ? "Brouillon" : i.id}</div>
                        <div className="text-xs whitespace-nowrap text-slate-500">
                          {i.tripId} · {i.route}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <div className="font-semibold whitespace-nowrap text-slate-800">{formatNumber(i.amount)}</div>
                        {i.paid > 0 && i.paid < i.amount && <div className="text-xs whitespace-nowrap text-emerald-700">{formatNumber(i.paid)} reçus</div>}
                      </td>
                      <td className="hidden px-4 py-3 whitespace-nowrap @2xl:table-cell">
                        {i.due ? (
                          <span className={cn(i.lateDays && "font-medium text-rose-600")}>
                            {i.due}
                            {i.lateDays ? ` · ${i.lateDays} jours de retard` : ""}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">À la livraison</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Chip className={INVOICE_STYLE[i.status]}>{i.status}</Chip>
                      </td>
                      <td className="hidden px-4 py-3 text-right @3xl:table-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          {i.status === "À émettre" && (
                            <Button variant="outline" size="sm" className={ROW_BTN} onClick={() => openInvoice(i)}>
                              Préparer la facture
                            </Button>
                          )}
                          {i.status === "En retard" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={cn(ROW_BTN, "text-rose-700 hover:bg-rose-50")}
                              onClick={() => toast.success("Relance envoyée", { description: `${i.id} · ${client.email}` })}
                            >
                              <BellRingIcon className="size-3.5" />
                              Relancer
                            </Button>
                          )}
                          {(i.status === "Envoyée" || i.status === "En retard") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className={ROW_BTN}
                              onClick={() => {
                                markPaid(i.id);
                                toast.success("Paiement enregistré", { description: `${i.id} · ${formatNumber(i.amount)} FCFA` });
                              }}
                            >
                              <CheckIcon className="size-3.5" />
                              Marquer payée
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contrat" className="mt-0 flex flex-col gap-3">
          <p className="text-sm text-slate-500">Le contrat fixe à l&apos;avance les prix de ce client pour l&apos;année. Chaque voyage est facturé à ces tarifs, sans devis.</p>
          {c ? (
            <button
              type="button"
              onClick={() => setOpenContract(c)}
              className="rounded-xl border border-slate-200 bg-white p-4 text-left transition-colors hover:bg-slate-50/50"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="font-semibold text-slate-900">Contrat {c.id}</div>
                  <div className="text-sm text-slate-500">
                    du {c.start} au {c.end} · paiement à {c.paymentDays} jours
                  </div>
                </div>
                <Chip className="bg-blue-500/10 text-blue-700">{c.status}</Chip>
              </div>
              <ul className="mt-3 divide-y divide-slate-100 text-sm">
                {c.rates.map((r) => (
                  <li key={r.route + r.unit} className="flex justify-between gap-4 py-2">
                    <span>
                      {r.route} <span className="text-slate-400">· {r.unit}</span>
                    </span>
                    <span className="font-semibold whitespace-nowrap tabular-nums text-slate-800">{formatNumber(r.price)} FCFA</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-blue-600">
                <FileTextIcon className="size-4" />
                Voir le contrat complet, le télécharger ou l&apos;envoyer
              </div>
            </button>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
              Pas de contrat : chaque transport de ce client passe par un devis.
            </div>
          )}
        </TabsContent>

        <TabsContent value="devis" className="mt-0 flex flex-col gap-3">
          <p className="text-sm text-slate-500">
            Un devis donne un prix pour une demande ponctuelle {c ? "hors des tarifs du contrat (nouveau trajet, gros volume)" : ""}. Une fois accepté, il devient une facture.
          </p>
          {quotes.length > 0 ? (
            <div className={TABLE}>
              <table className="w-full text-left text-sm text-slate-600">
                <thead className={THEAD}>
                  <tr>
                    <th className="px-4 py-3">Devis</th>
                    <th className="px-4 py-3 text-right">Montant HT</th>
                    <th className="px-4 py-3">Statut</th>
                    <th className="hidden px-4 py-3 @3xl:table-cell" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {quotes.map((q) => (
                    <tr key={q.id} onClick={() => openQuote(q)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{q.id}</div>
                        <div className="text-xs text-slate-500">
                          {q.route} · {q.cargo}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-slate-800">{formatNumber(lineTotal(q.lines))}</td>
                      <td className="px-4 py-3">
                        <Chip className={QUOTE_STYLE[q.status]}>{q.status}</Chip>
                      </td>
                      <td className="hidden px-4 py-3 text-right @3xl:table-cell" onClick={(e) => e.stopPropagation()}>
                        {q.status === "Envoyé" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={ROW_BTN}
                            onClick={() => {
                              acceptQuote(q.id);
                              toast.success("Devis accepté", { description: `${q.id} · vous pouvez maintenant le facturer.` });
                            }}
                          >
                            <CheckIcon className="size-3.5" />
                            Marquer accepté
                          </Button>
                        )}
                        {q.status === "Accepté" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className={ROW_BTN}
                            onClick={() =>
                              setDraft({
                                readOnly: false,
                                doc: invoiceFromQuote(q, stats.invoices.find((i) => i.status === "À émettre"), nextInvoiceNumber),
                              })
                            }
                          >
                            <FileTextIcon className="size-3.5" />
                            Facturer
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">Aucun devis pour ce client.</div>
          )}
        </TabsContent>
      </Tabs>

      <ContractSheet
        contract={openContract}
        onClose={() => setOpenContract(null)}
        onRenew={(ct, email) => {
          if (ct.status !== "Actif") signContract(ct.id);
          toast.success(ct.status === "Actif" ? "Avenant envoyé" : "Contrat envoyé pour signature", { description: `${ct.id} · ${email}` });
          setOpenContract(null);
        }}
      />
      <DocumentSheet
        draft={draft?.doc ?? null}
        readOnly={draft?.readOnly}
        onClose={() => setDraft(null)}
        onSend={(doc) => {
          if (!draft?.readOnly) sendDocument(doc);
          setDraft(null);
        }}
      />
    </div>
  );
}
