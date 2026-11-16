"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BanknoteIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  FileCheckIcon,
  HandshakeIcon,
  HistoryIcon,
  MailIcon,
  MapPinIcon,
  NavigationIcon,
  PhoneIcon,
  SendIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";
import { toast } from "sonner";

import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import { DelegateDialog } from "@/components/partenaires/delegate-dialog";
import { PartnerTrucks, TRUCK_STATUS_STYLE } from "@/components/partenaires/partner-trucks";
import { GpsLive, reliabilityTone, STATUS_STYLE } from "@/components/partenaires/partner-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { daysUntil, partnerById, type PartnerMission, type PartnerTruck, type Settlement } from "@/lib/partners";
import { usePartners } from "@/lib/partners-store";
import { cn, fcfa, formatNumber } from "@/lib/utils";

const TAB_TRIGGER =
  "relative rounded-none border-0 border-b-2 border-transparent px-4 pb-3 pt-2 -mb-[1px] font-semibold text-muted-foreground hover:text-foreground data-active:border-b-blue-600 data-active:text-blue-600 data-active:shadow-none data-active:bg-transparent";
const TABLE = "@container overflow-hidden rounded-xl border border-slate-200 bg-white";
const THEAD = "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500";

const SETTLEMENT_STYLE: Record<Settlement, string> = {
  Réglé: "bg-emerald-500/10 text-emerald-700",
  "À régler": "bg-blue-500/10 text-blue-700",
  "En retard": "bg-rose-500/10 text-rose-700",
};

type HistoryFilter = "Toutes" | "Retards" | "Incidents" | "À régler";
const HISTORY_FILTERS: HistoryFilter[] = ["Toutes", "Retards", "Incidents", "À régler"];

function Chip({ className, children }: { className: string; children: React.ReactNode }) {
  return <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", className)}>{children}</span>;
}

export function PartnerProfile({ id }: { id: string }) {
  const partner = partnerById(id)!;
  const { freights: allFreights, trucks: allTrucks, history: allHistory, settle } = usePartners();
  const [tab, setTab] = useState("circulation");
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState<PartnerTruck | null>(null);
  const [filter, setFilter] = useState<HistoryFilter>("Toutes");

  const trucks = allTrucks.filter((t) => t.partnerId === partner.id);
  const active = allFreights.filter((f) => f.partnerId === partner.id && f.status !== "Livré");
  const history = allHistory.filter((m) => m.partnerId === partner.id);
  const free = trucks.filter((t) => t.status === "Disponible");
  const late = history.filter((m) => !m.onTime);
  const incidents = history.filter((m) => m.incident);
  const unpaid = history.filter((m) => m.settlement !== "Réglé");
  const overdue = unpaid.filter((m) => m.settlement === "En retard");
  const punctuality = history.length ? Math.round(((history.length - late.length) / history.length) * 100) : 100;
  const margin = [...history, ...active].reduce((s, m) => s + m.clientPrice - m.partnerCost, 0);
  const billed = [...history, ...active].reduce((s, m) => s + m.clientPrice, 0);
  const novCount = history.filter((m) => m.month === "Novembre").length + active.length;

  const months = Array.from(new Set(history.map((m) => m.month))).map((month) => {
    const ms = history.filter((m) => m.month === month);
    return {
      month,
      count: ms.length,
      late: ms.filter((m) => !m.onTime).length,
      margin: ms.reduce((s, m) => s + m.clientPrice - m.partnerCost, 0),
    };
  });
  const maxMargin = Math.max(...months.map((m) => m.margin), 1);

  const rows = history.filter((m) =>
    filter === "Retards" ? !m.onTime : filter === "Incidents" ? !!m.incident : filter === "À régler" ? m.settlement !== "Réglé" : true,
  );
  const filterCount = (f: HistoryFilter) =>
    f === "Retards" ? late.length : f === "Incidents" ? incidents.length : f === "À régler" ? unpaid.length : history.length;

  const reserve = (t: PartnerTruck | null) => {
    setPreset(t);
    setOpen(true);
  };

  const docs = [
    { label: "Contrat de sous-traitance", ref: `CST-${partner.id}-2026`, due: "31 déc. 2026" },
    { label: "Assurance marchandises transportées", ref: `ASS-${partner.id}-${partner.since.slice(-4)}`, due: partner.insuranceUntil },
    { label: "Licence de transport routier", ref: `LTR-${partner.id}`, due: partner.licenceUntil },
    { label: "RCCM et attestation fiscale", ref: `RCCM-${partner.id}`, due: "31 mars 2027" },
  ];
  const expiring = docs.filter((d) => daysUntil(d.due) <= 30);

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col items-start">
          <Link href="/partenaires" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Retour au réseau
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{partner.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <MapPinIcon className="size-3" />
              {partner.address}
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <UserIcon className="size-3" />
              {partner.contact}
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <PhoneIcon className="size-3" />
              {partner.phone}
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <HandshakeIcon className="size-3" />
              Partenaire depuis {partner.since}
            </Badge>
            {expiring.length > 0 && (
              <Badge variant="outline" className="border-amber-200 bg-amber-50 font-semibold text-amber-700">
                <AlertTriangleIcon className="size-3" />
                {expiring.length} document{expiring.length > 1 ? "s" : ""} à renouveler
              </Badge>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 bg-white shadow-none"
            onClick={() => toast.success(`Appel vers ${partner.contact}`, { description: partner.phone })}
          >
            <PhoneIcon className="size-4" />
            Appeler
          </Button>
          <Button size="sm" className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" disabled={free.length === 0} onClick={() => reserve(null)}>
            <SendIcon className="size-4" />
            Déléguer un fret
          </Button>
        </div>
      </div>

      <div className={KPI_GRID}>
        <KpiCard
          icon={TruckIcon}
          title="Roulent pour vous"
          value={`${active.length} camion${active.length > 1 ? "s" : ""}`}
          footer={`${free.length} libre${free.length > 1 ? "s" : ""} · ${trucks.length} au total`}
        />
        <KpiCard
          icon={HandshakeIcon}
          title="Marge générée"
          value={formatNumber(margin)}
          unit="FCFA"
          footer={`${history.length + active.length} missions · ${novCount} en novembre`}
        />
        <KpiCard
          icon={ClockIcon}
          title="Ponctualité constatée"
          value={`${punctuality} %`}
          footer={`${late.length} retard${late.length > 1 ? "s" : ""} · ${incidents.length} incident${incidents.length > 1 ? "s" : ""} sur ${history.length}`}
        />
        <KpiCard
          icon={BanknoteIcon}
          title="À régler au partenaire"
          value={formatNumber(unpaid.reduce((s, m) => s + m.partnerCost, 0))}
          unit="FCFA"
          footer={overdue.length ? `Dont ${formatNumber(overdue.reduce((s, m) => s + m.partnerCost, 0))} en retard` : `Paiement à ${partner.paymentDays} jours`}
          alert={overdue.length > 0}
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="circulation" className={TAB_TRIGGER}>
            <NavigationIcon className="mr-2 size-4" />
            En circulation <span className="ml-1.5 text-xs font-normal text-muted-foreground">{active.length}</span>
          </TabsTrigger>
          <TabsTrigger value="camions" className={TAB_TRIGGER}>
            <TruckIcon className="mr-2 size-4" />
            Camions <span className="ml-1.5 text-xs font-normal text-muted-foreground">{trucks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="historique" className={TAB_TRIGGER}>
            <HistoryIcon className="mr-2 size-4" />
            Historique <span className="ml-1.5 text-xs font-normal text-muted-foreground">{history.length}</span>
          </TabsTrigger>
          <TabsTrigger value="dossier" className={TAB_TRIGGER}>
            <FileCheckIcon className="mr-2 size-4" />
            Dossier
          </TabsTrigger>
        </TabsList>

        <TabsContent value="circulation" className="mt-0 flex flex-col gap-4">
          {active.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-500">
              Aucun camion de {partner.name} ne roule pour vous en ce moment.
              {free.length > 0 && (
                <div className="mt-3">
                  <Button size="sm" variant="outline" className="gap-1.5 border-slate-200 bg-white shadow-none" onClick={() => reserve(null)}>
                    <SendIcon className="size-3.5" />
                    Confier un fret ({free.length} camion{free.length > 1 ? "s" : ""} libre{free.length > 1 ? "s" : ""})
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 @3xl/main:grid-cols-2">
              {active.map((f) => {
                const truck = trucks.find((t) => t.plate === f.plate);
                return (
                  <div key={f.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{f.id}</span>
                          <Chip className={STATUS_STYLE[f.status]}>{f.status}</Chip>
                        </div>
                        <div className="mt-0.5 text-sm text-slate-500">{f.cargo}</div>
                      </div>
                      <GpsLive freight={f} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-slate-700">{f.origin}</span>
                        <span className="font-medium text-slate-700">{f.destination}</span>
                      </div>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.max(f.progress, 0.02) * 100}%` }} />
                      </div>
                      <div className="mt-1.5 text-xs text-slate-500">
                        {f.status === "Chargement" ? "Au port, chargement en cours" : `${Math.round(f.progress * 100)} % du trajet · ${truck?.location ?? "position inconnue"}`}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
                      <div className="min-w-0">
                        <div className="text-slate-500">Camion</div>
                        <div className="truncate font-semibold text-slate-800">{f.plate}</div>
                        <div className="truncate text-slate-500">{truck ? `${truck.body}, ${truck.capacityT} t` : ""}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-500">Chauffeur</div>
                        <div className="truncate font-semibold text-slate-800">{f.driver}</div>
                        <div className="truncate text-slate-500">Retour prévu {truck?.freeOn ?? "à confirmer"}</div>
                      </div>
                      <div className="min-w-0">
                        <div className="text-slate-500">Votre marge</div>
                        <div className="font-semibold tabular-nums text-emerald-700">+{formatNumber(f.clientPrice - f.partnerCost)}</div>
                        <div className="text-slate-500 tabular-nums">sur {formatNumber(f.clientPrice)}</div>
                      </div>
                    </div>
                    {truck && !truck.docsOk && (
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-700">
                        <AlertTriangleIcon className="size-3.5" />
                        Assurance de ce camion à vérifier
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          <div className={TABLE}>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 text-sm">
              <span className="font-semibold text-slate-900">Le reste de sa flotte</span>
              {(["Disponible", "Autre client", "Atelier"] as const).map((s) => (
                <span key={s} className="flex items-center gap-2">
                  <Chip className={TRUCK_STATUS_STYLE[s]}>{s}</Chip>
                  <span className="font-semibold tabular-nums text-slate-800">{trucks.filter((t) => t.status === s).length}</span>
                </span>
              ))}
              <Button variant="link" size="sm" className="ml-auto h-auto p-0 text-blue-700" onClick={() => setTab("camions")}>
                Voir les {trucks.length} camions
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="camions" className="mt-0">
          <PartnerTrucks trucks={allTrucks} partnerId={partner.id} onReserve={reserve} locked />
        </TabsContent>

        <TabsContent value="historique" className="mt-0 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 @3xl/main:grid-cols-5">
            {months.map((m) => (
              <div key={m.month} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4">
                <span className="text-xs font-semibold text-slate-500 uppercase">{m.month}</span>
                <span className="text-lg font-semibold tabular-nums text-slate-900">
                  {m.count} mission{m.count > 1 ? "s" : ""}
                </span>
                <div className="h-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(m.margin / maxMargin) * 100}%` }} />
                </div>
                <span className="text-xs text-slate-500">
                  <span className="font-medium text-emerald-700 tabular-nums">+{formatNumber(m.margin)}</span>
                  {m.late > 0 && <span className="text-amber-700"> · {m.late} retard{m.late > 1 ? "s" : ""}</span>}
                </span>
              </div>
            ))}
          </div>

          <div className="inline-flex w-fit flex-wrap rounded-lg bg-muted p-[3px]">
            {HISTORY_FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground", filter === f && "bg-background text-foreground")}
              >
                {f}
                <span className="text-xs text-muted-foreground tabular-nums">{filterCount(f)}</span>
              </button>
            ))}
          </div>

          <div className={TABLE}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className={THEAD}>
                  <tr>
                    <th className="px-4 py-3">Mission</th>
                    <th className="hidden px-4 py-3 @3xl:table-cell">Camion</th>
                    <th className="hidden px-4 py-3 @2xl:table-cell">Livraison</th>
                    <th className="hidden px-4 py-3 text-right @4xl:table-cell">Coût partenaire</th>
                    <th className="px-4 py-3 text-right">Marge</th>
                    <th className="px-4 py-3">Règlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                        Aucune mission dans cette liste.
                      </td>
                    </tr>
                  )}
                  {rows.map((m) => (
                    <MissionRow key={m.id} m={m} onSettle={() => {
                      settle(m.id);
                      toast.success("Règlement enregistré", { description: `${m.id} · ${fcfa(m.partnerCost)} versés à ${partner.name}` });
                    }} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dossier" className="mt-0">
          <div className="grid grid-cols-1 gap-4 @4xl/main:grid-cols-[1fr_1.4fr]">
            <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-900">Conditions de collaboration</h3>
              <dl className="grid gap-3 text-sm">
                {[
                  ["Interlocuteur", partner.contact],
                  ["Téléphone", partner.phone],
                  ["E-mail", partner.email],
                  ["Siège", partner.address],
                  ["Partenaire depuis", partner.since],
                  ["Paiement", `À ${partner.paymentDays} jours après livraison`],
                  ["Rémunération", "Environ 82 % du prix client, marge Unico conservée"],
                  ["Suivi GPS", "Partagé pendant les missions Unico"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                    <dt className="text-slate-500">{k}</dt>
                    <dd className="text-right font-medium text-slate-800">{k === "E-mail" ? <a href={`mailto:${v}`} className="inline-flex items-center gap-1 hover:text-blue-700"><MailIcon className="size-3.5" />{v}</a> : v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-sm">
                <span className="text-slate-500">Ponctualité annoncée</span>
                <span className={cn("font-semibold tabular-nums", reliabilityTone(partner.onTime))}>{partner.onTime} %</span>
              </div>
            </div>

            <div className={TABLE}>
              <div className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">Documents du partenaire</div>
              <ul className="divide-y divide-slate-200">
                {docs.map((d) => {
                  const days = daysUntil(d.due);
                  return (
                    <li key={d.label} className="flex items-center gap-3 px-4 py-3 text-sm">
                      <FileCheckIcon className="size-4 shrink-0 text-slate-400" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-slate-800">{d.label}</div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          {d.ref} · <CalendarIcon className="size-3" /> valable jusqu&apos;au {d.due}
                        </div>
                      </div>
                      {days <= 30 ? (
                        <Chip className="bg-amber-500/10 text-amber-700">Expire dans {days} j</Chip>
                      ) : (
                        <Chip className="bg-emerald-500/10 text-emerald-700">À jour</Chip>
                      )}
                      {days <= 30 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="hidden gap-1.5 border-slate-200 bg-white shadow-none @xl:inline-flex"
                          onClick={() => toast.success("Relance envoyée", { description: `${d.label} demandé à ${partner.contact}` })}
                        >
                          <SendIcon className="size-3.5" />
                          Relancer
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DelegateDialog
        open={open}
        preset={preset}
        partnerOnly={partner.id}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setPreset(null);
        }}
      />
    </div>
  );
}

function MissionRow({ m, onSettle }: { m: PartnerMission; onSettle: () => void }) {
  const margin = m.clientPrice - m.partnerCost;
  return (
    <tr className="transition-colors hover:bg-slate-50/50">
      <td className="px-4 py-3">
        <div className="font-semibold whitespace-nowrap text-slate-900">{m.id}</div>
        <div className="text-xs whitespace-nowrap text-slate-500">
          {m.cargo} · {m.destination}
        </div>
      </td>
      <td className="hidden px-4 py-3 @3xl:table-cell">
        <div className="font-medium whitespace-nowrap text-slate-700">{m.plate}</div>
        <div className="text-xs whitespace-nowrap text-slate-500">{m.driver}</div>
      </td>
      <td className="hidden px-4 py-3 @2xl:table-cell">
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-slate-700">{m.date}</span>
          {m.onTime ? <Chip className="bg-emerald-500/10 text-emerald-700">À l&apos;heure</Chip> : <Chip className="bg-amber-500/10 text-amber-700">+{m.delayH} h</Chip>}
        </div>
        {m.incident && (
          <div className="mt-1 flex items-center gap-1 text-xs text-rose-700">
            <AlertTriangleIcon className="size-3" />
            {m.incident}
          </div>
        )}
      </td>
      <td className="hidden px-4 py-3 text-right tabular-nums @4xl:table-cell">{formatNumber(m.partnerCost)}</td>
      <td className="px-4 py-3 text-right">
        <div className="font-semibold whitespace-nowrap tabular-nums text-emerald-700">+{formatNumber(margin)}</div>
        <div className="text-xs text-slate-400 tabular-nums">{Math.round((margin / m.clientPrice) * 100)} %</div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Chip className={SETTLEMENT_STYLE[m.settlement]}>{m.settlement}</Chip>
          {m.settlement !== "Réglé" && (
            <Button size="sm" variant="outline" className="h-7 gap-1 border-slate-200 bg-white px-2 shadow-none" onClick={onSettle}>
              <CheckIcon className="size-3.5" />
              <span className="hidden @xl:inline">Régler</span>
            </Button>
          )}
        </div>
      </td>
    </tr>
  );
}
