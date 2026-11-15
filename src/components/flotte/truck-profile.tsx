"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BanknoteIcon,
  ChevronRightIcon,
  FileTextIcon,
  FuelIcon,
  GaugeIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  PencilIcon,
  PiggyBankIcon,
  ReceiptIcon,
  RouteIcon,
  UserIcon,
  WrenchIcon,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { StatCard } from "@/components/dashboard/stat-card";
import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import { WIDGET_CARD, WidgetHeader } from "@/components/dashboard/widget";
import { CategoryIcon } from "@/components/expense-ui";
import { ReceiptBadge, TruckStateBadge } from "@/components/trip-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, SERVICE_INTERVAL_KM, type Truck } from "@/lib/data";
import { useTms } from "@/lib/store";
import { documentState, frDate, maintenanceLog, parseFrDate, truckTrips } from "@/lib/truck-history";
import { PeriodPicker, inPeriod, periodLabel, presetPeriod, type Period } from "@/components/flotte/period-picker";
import { TruckDocuments } from "@/components/flotte/truck-documents";
import { TruckExpenses } from "@/components/flotte/truck-expenses";
import { TruckForm } from "@/components/flotte/truck-form";
import { truckKey, useFleet } from "@/lib/fleet-store";
import { useTeam } from "@/lib/team-store";
import { cn, compactFcfa, decimal, fcfa, formatNumber, fuelDeviation, percent } from "@/lib/utils";

const TAB_TRIGGER =
  "relative rounded-none border-0 border-b-2 border-transparent px-4 pb-3 pt-2 -mb-[1px] font-semibold text-muted-foreground hover:text-foreground data-active:border-b-blue-600 data-active:text-blue-600 data-active:shadow-none data-active:bg-transparent";

const TABS = [
  { value: "apercu", label: "Vue d'ensemble", icon: LayoutDashboardIcon },
  { value: "voyages", label: "Voyages", icon: RouteIcon },
  { value: "depenses", label: "Dépenses", icon: ReceiptIcon },
  { value: "carburant", label: "Carburant", icon: FuelIcon },
  { value: "entretien", label: "Entretien", icon: WrenchIcon },
  { value: "documents", label: "Documents", icon: FileTextIcon },
];

const MONTHS = [
  { month: 8, label: "Septembre" },
  { month: 9, label: "Octobre" },
  { month: 10, label: "Novembre" },
];

const TABLE = "@container overflow-hidden rounded-xl border border-slate-200 bg-white";
const THEAD = "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500";

const MAINTENANCE_STYLES = {
  Prévu: "border-blue-200 bg-blue-50 text-blue-700",
  "En cours": "border-amber-200 bg-amber-50 text-amber-700",
  Fait: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

const DOCUMENT_STYLES = {
  valide: { label: "Valide", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  bientôt: { label: "Expire bientôt", className: "border-amber-200 bg-amber-50 text-amber-700" },
  expiré: { label: "Expiré", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

export function TruckProfile({ plate }: { plate: string }) {
  const { getTruck } = useFleet();
  const truck = getTruck(plate);
  if (!truck) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="text-lg font-semibold text-slate-900">Camion introuvable</p>
        <Link href="/flotte?vue=tableau" className="text-sm font-medium text-blue-600 hover:underline">
          Retour à la flotte
        </Link>
      </div>
    );
  }
  return <TruckProfileBody truck={truck} dataKey={truckKey(truck)} />;
}

function TruckProfileBody({ truck, dataKey }: { truck: Truck; dataKey: string }) {
  const { trucks, updateTruck, documentsOf } = useFleet();
  const { can } = useTeam();
  const [period, setPeriod] = useState<Period>(() => presetPeriod("3-mois"));
  const [editing, setEditing] = useState(false);
  // Les historiques sont rattachés à la plaque d'origine du camion.
  const dataTruck = useMemo(() => ({ ...truck, plate: dataKey }), [truck, dataKey]);
  const { trips } = useTms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const tab = TABS.some((t) => t.value === params.get("onglet")) ? params.get("onglet")! : "apercu";
  const setTab = (v: string) => router.replace(v === "apercu" ? pathname : `${pathname}?onglet=${v}`, { scroll: false });

  const allHistory = useMemo(() => truckTrips(dataTruck), [dataTruck]);
  const history = allHistory.filter((t) => inPeriod(t.date, period));
  const maintenance = useMemo(() => maintenanceLog(dataTruck), [dataTruck]).filter((m) => m.status !== "Fait" || inPeriod(parseFrDate(m.date), period));
  const documents = documentsOf(dataKey);
  const current = trips.find((t) => t.id === truck.tripId);
  const allReceipts = trips.filter((t) => t.plate === dataKey).flatMap((t) => t.expenses.map((x) => ({ x, trip: t })));

  const revenue = history.reduce((s, t) => s + t.billed, 0);
  const costs = history.reduce((s, t) => s + t.expenses, 0);
  const km = history.reduce((s, t) => s + t.km, 0);
  const margin = revenue - costs;
  const deviation = fuelDeviation(truck.consumption, truck.reference);
  const remaining = truck.lastServiceKm + SERVICE_INTERVAL_KM - truck.odometerKm;

  const monthly = MONTHS.filter(({ month }) => month >= period.from.getMonth() && month <= period.to.getMonth()).map(({ month, label }) => {
    const list = history.filter((t) => t.date.getMonth() === month);
    return { label, revenus: list.reduce((s, t) => s + t.billed, 0), depenses: list.reduce((s, t) => s + t.expenses, 0) };
  });

  const byCategory = CATEGORIES.map((c) => ({ c, v: history.reduce((s, t) => s + (t.byCategory[c] ?? 0), 0) })).filter((x) => x.v > 0);
  const maxCategory = Math.max(...byCategory.map((x) => x.v));

  const fuelSeries = [...history].reverse().map((t) => ({ label: frDate(t.date, false), conso: Number(t.consumption.toFixed(1)) }));

  const alerts = [
    deviation > 5 && { icon: FuelIcon, text: `Consomme ${decimal(deviation)} % de plus que sa référence`, tab: "carburant" },
    remaining < 2_000 && { icon: WrenchIcon, text: `Vidange à faire dans ${formatNumber(remaining)} km`, tab: "entretien" },
    ...maintenance.filter((m) => m.alert && m.status !== "Prévu").map((m) => ({ icon: AlertTriangleIcon, text: `${m.detail} : ${m.alert!.toLowerCase()}`, tab: "entretien" })),
    ...documents
      .filter((d) => documentState(d.until) !== "valide")
      .map((d) => ({ icon: FileTextIcon, text: `${d.name} : expire le ${d.until}`, tab: "documents" })),
  ].filter(Boolean) as { icon: React.ElementType; text: string; tab: string }[];

  return (
    <div className="flex flex-1 flex-col">
      <Tabs value={tab} onValueChange={(v) => v && setTab(String(v))} className="flex min-h-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex flex-col gap-4 bg-background/95 px-4 pt-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 flex-col items-start">
              <Link href="/flotte?vue=tableau" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                <ArrowLeftIcon className="size-4" />
                Retour à la flotte
              </Link>
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{truck.plate}</h1>
                <span className="text-lg font-medium text-muted-foreground">
                  {truck.model} · {truck.year}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <TruckStateBadge state={truck.state} />
                <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
                  <UserIcon className="size-3" />
                  Chauffeur : <span className="ml-1 font-semibold text-foreground">{truck.driver}</span>
                </Badge>
                <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
                  <MapPinIcon className="size-3" />
                  {truck.location}
                </Badge>
                {alerts.length > 0 && (
                  <Badge variant="outline" className="border-rose-200 bg-rose-50 font-semibold text-rose-700">
                    <AlertTriangleIcon className="size-3" />
                    {alerts.length} point{alerts.length > 1 ? "s" : ""} à surveiller
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2 border-slate-200 bg-white shadow-none" disabled={!can("flotte.edit")} onClick={() => setEditing(true)}>
                <PencilIcon className="size-4" />
                Modifier
              </Button>
              <Button variant="outline" size="sm" className="gap-2 border-slate-200 bg-white shadow-none" render={<Link href={`/flotte?truck=${dataKey}`} />}>
                <MapPinIcon className="size-4" />
                Voir sur la carte
              </Button>
              <Button
                size="sm"
                className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
                onClick={() => toast.success("Entretien planifié", { description: `${truck.plate} passera au garage central.` })}
              >
                <WrenchIcon className="size-4" />
                Planifier un entretien
              </Button>
            </div>
          </div>
          {tab !== "documents" && <PeriodPicker value={period} onChange={setPeriod} />}
          <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className={TAB_TRIGGER}>
                <t.icon className="mr-2 size-4" />
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="@container/main flex flex-1 flex-col p-4 lg:p-6">
          {/* Vue d'ensemble */}
          <TabsContent value="apercu" className="mt-0 flex flex-col gap-6">
            <div className={KPI_GRID}>
              <KpiCard icon={BanknoteIcon} title="Chiffre d'affaires" value={formatNumber(revenue)} unit="FCFA" color="emerald" footer={`${history.length} voyages ${periodLabel(period)}`} />
              <KpiCard icon={PiggyBankIcon} title="Marge" value={formatNumber(margin)} unit="FCFA" color="blue" footer={revenue ? `Il reste ${Math.round((margin / revenue) * 100)} FCFA sur 100 FCFA facturés` : "Aucun voyage sur la période"} />
              <KpiCard icon={ReceiptIcon} title="Coût au kilomètre" value={km ? formatNumber(Math.round(costs / km)) : "0"} unit="FCFA/km" color="rose" footer={`${formatNumber(costs)} FCFA de charges`} />
              <KpiCard icon={GaugeIcon} title="Kilomètres" value={formatNumber(km)} unit="km" color="amber" footer={`Compteur : ${formatNumber(truck.odometerKm)} km`} />
            </div>

            <div className="grid grid-cols-1 gap-4 @5xl/main:grid-cols-3">
              <div className={cn(WIDGET_CARD, "@5xl/main:col-span-2")}>
                <WidgetHeader icon={<BanknoteIcon className="size-6" />} title="Rentabilité par mois" subtitle="Revenus et charges de ce camion" color="emerald" />
                <div className="h-60">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthly} barGap={4} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                      <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                      <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={compactFcfa} width={56} />
                      <Tooltip formatter={(v) => fcfa(Number(v))} cursor={{ fill: "#f1f5f9" }} contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
                      <Bar dataKey="revenus" name="Revenus" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={40} />
                      <Bar dataKey="depenses" name="Charges" fill="#fb7185" radius={[6, 6, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className={WIDGET_CARD}>
                <WidgetHeader
                  icon={<AlertTriangleIcon className="size-6" />}
                  title="À surveiller"
                  subtitle={alerts.length ? `${alerts.length} point${alerts.length > 1 ? "s" : ""} relevé${alerts.length > 1 ? "s" : ""}` : "Tout est en ordre"}
                  color={alerts.length ? "rose" : "emerald"}
                />
                {alerts.length === 0 ? (
                  <p className="rounded-lg bg-emerald-500/5 px-3 py-2.5 text-sm text-emerald-700">Consommation, entretien et documents sont à jour.</p>
                ) : (
                  <ul className="grid gap-2">
                    {alerts.map((a) => (
                      <li key={a.text}>
                        <button type="button" onClick={() => setTab(a.tab)} className="flex w-full cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm hover:bg-muted/50">
                          <a.icon className="size-4 shrink-0 text-rose-500" />
                          <span className="min-w-0 flex-1">{a.text}</span>
                          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                {current && (
                  <Link href={`/voyages?trip=${current.id}`} className="mt-auto flex items-center gap-3 rounded-lg bg-blue-500/5 px-3 py-2.5 text-sm hover:bg-blue-500/10">
                    <RouteIcon className="size-4 shrink-0 text-blue-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-muted-foreground">Voyage en cours · {current.id}</span>
                      <span className="block font-medium text-slate-900">
                        Lomé → {current.destination} · {current.status}
                      </span>
                    </span>
                    <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
                  </Link>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Voyages */}
          <TabsContent value="voyages" className="mt-0">
            <div className={TABLE}>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className={THEAD}>
                    <tr>
                      <th className="px-6 py-4">Départ</th>
                      <th className="px-6 py-4">Trajet</th>
                      <th className="hidden px-6 py-4 @3xl:table-cell">Chauffeur</th>
                      <th className="hidden px-6 py-4 text-right @4xl:table-cell">Km</th>
                      <th className="hidden px-6 py-4 text-right @3xl:table-cell">Facturé</th>
                      <th className="hidden px-6 py-4 text-right @4xl:table-cell">Charges</th>
                      <th className="px-6 py-4 text-right">Marge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {history.map((t) => {
                      const m = t.billed - t.expenses;
                      return (
                        <tr
                          key={t.id}
                          onClick={() => t.live && router.push(`/voyages?trip=${t.id}`)}
                          className={cn("transition-colors", t.live && "cursor-pointer hover:bg-slate-50/50")}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-slate-900">{frDate(t.date)}</div>
                            <div className="text-xs text-slate-500">{t.live ? t.id : "Clôturé"}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-medium whitespace-nowrap text-slate-900">Lomé → {t.destination}</div>
                            {t.status === "En cours" && (
                              <Badge variant="outline" className="mt-1 border-blue-200 bg-blue-50 font-medium text-blue-700">
                                En cours
                              </Badge>
                            )}
                          </td>
                          <td className="hidden px-6 py-4 whitespace-nowrap @3xl:table-cell">{t.driver}</td>
                          <td className="hidden px-6 py-4 text-right tabular-nums @4xl:table-cell">{formatNumber(t.km)}</td>
                          <td className="hidden px-6 py-4 text-right tabular-nums @3xl:table-cell">{formatNumber(t.billed)}</td>
                          <td className="hidden px-6 py-4 text-right tabular-nums @4xl:table-cell">{formatNumber(t.expenses)}</td>
                          <td className="px-6 py-4 text-right tabular-nums">
                            <div className={cn("font-semibold", m >= 0 ? "text-emerald-700" : "text-rose-600")}>
                              {m >= 0 ? "+" : ""}
                              {formatNumber(m)}
                            </div>
                            <div className="text-xs text-slate-400">{percent((m / t.billed) * 100, 0)}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm">
                <span className="text-slate-500">{history.length} voyages {periodLabel(period)}</span>
                <span className={cn("font-semibold tabular-nums", margin >= 0 ? "text-emerald-700" : "text-rose-600")}>Marge totale : {fcfa(margin)}</span>
              </div>
            </div>
          </TabsContent>

          {/* Dépenses */}
          <TabsContent value="depenses" className="mt-0">
            <TruckExpenses history={allHistory} receipts={allReceipts} period={period} />
          </TabsContent>

          {/* Carburant */}
          <TabsContent value="carburant" className="mt-0 flex flex-col gap-6">
            <div className={KPI_GRID}>
              <KpiCard icon={FuelIcon} title="Consommation" value={decimal(truck.consumption)} unit="L/100 km" alert={deviation > 5} footer={`${deviation >= 0 ? "+" : ""}${decimal(deviation)} % par rapport à la référence`} />
              <KpiCard icon={GaugeIcon} title="Référence" value={decimal(truck.reference)} unit="L/100 km" color="blue" footer="Moyenne historique de ce camion" />
              <KpiCard icon={FuelIcon} title="Gasoil ce mois" value={formatNumber(truck.fuelMonthL)} unit="litres" color="amber" footer={`Environ ${formatNumber(truck.fuelMonthL * 680)} FCFA`} />
              <KpiCard icon={ReceiptIcon} title="Carburant sur la période" value={formatNumber(byCategory.find((x) => x.c === "Carburant")?.v ?? 0)} unit="FCFA" color="violet" footer={costs ? `${percent(((byCategory.find((x) => x.c === "Carburant")?.v ?? 0) / costs) * 100, 0)} des charges du camion` : "Aucune charge sur la période"} />
            </div>
            <div className={WIDGET_CARD}>
              <WidgetHeader icon={<FuelIcon className="size-6" />} title="Consommation par voyage" subtitle="L/100 km, la ligne pointillée est la référence du camion" color={deviation > 5 ? "rose" : "blue"} />
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={fuelSeries} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => decimal(Number(v), 0)} />
                    <Tooltip formatter={(v) => `${decimal(Number(v))} L/100 km`} contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }} />
                    <ReferenceLine y={truck.reference} stroke="#94a3b8" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="conso" name="Consommation" stroke={deviation > 5 ? "#f43f5e" : "#2563eb"} strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Entretien */}
          <TabsContent value="entretien" className="mt-0 flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
              <StatCard icon={WrenchIcon} title="Prochaine vidange" value={remaining > 0 ? formatNumber(remaining) : "Dépassée"} unit={remaining > 0 ? "km restants" : undefined} color={remaining < 2_000 ? "rose" : "emerald"} footer={`Dernière le ${truck.lastServiceDate}`} />
              <StatCard
                icon={ReceiptIcon}
                title="Coût d'entretien"
                value={formatNumber(maintenance.reduce((s, m) => s + (m.cost ?? 0), 0))}
                unit="FCFA"
                color="amber"
                footer="Interventions de ce carnet"
              />
              <StatCard icon={GaugeIcon} title="Compteur" value={formatNumber(truck.odometerKm)} unit="km" color="blue" footer={`Mis en circulation en ${truck.year}`} />
            </div>
            <div className={TABLE}>
              <ul className="divide-y divide-slate-200">
                {maintenance.map((m, i) => (
                  <li key={`${m.date}-${i}`} className="flex flex-col gap-2 px-6 py-4 @3xl:flex-row @3xl:items-center @3xl:gap-6">
                    <div className="w-32 shrink-0">
                      <div className="font-medium whitespace-nowrap text-slate-900">{m.date}</div>
                      <div className="text-xs text-slate-500">{m.type}</div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-900">{m.detail}</div>
                      <div className="text-xs text-slate-500">
                        {m.garage}
                        {m.km !== null && ` · ${formatNumber(m.km)} km`}
                      </div>
                      {m.alert && (
                        <div className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-600">
                          <AlertTriangleIcon className="size-3.5" />
                          {m.alert}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 @3xl:flex-col @3xl:items-end @3xl:gap-1">
                      <span className="font-semibold whitespace-nowrap text-slate-900 tabular-nums">{m.cost !== null ? fcfa(m.cost) : "À chiffrer"}</span>
                      <Badge variant="outline" className={cn("font-medium", MAINTENANCE_STYLES[m.status])}>
                        {m.status}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Documents */}
          <TabsContent value="documents" className="mt-0">
            <TruckDocuments truck={truck} truckKey={dataKey} />
          </TabsContent>
        </div>
      </Tabs>

      <TruckForm
        open={editing}
        truck={truck}
        takenPlates={trucks.map((t) => t.plate)}
        onClose={() => setEditing(false)}
        onSave={(patch) => {
          updateTruck(dataKey, patch);
          toast.success("Camion modifié", { description: patch.plate !== truck.plate ? `Plaque ${truck.plate} remplacée par ${patch.plate}` : patch.plate });
          setEditing(false);
        }}
      />
    </div>
  );
}
