"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BadgeCheckIcon,
  CalendarIcon,
  GaugeIcon,
  HandCoinsIcon,
  HistoryIcon,
  LockIcon,
  PhoneIcon,
  ReceiptIcon,
  RouteIcon,
  TruckIcon,
  UnlockIcon,
} from "lucide-react";
import { toast } from "sonner";

import { driverStats } from "@/components/chauffeurs/driver-stats";
import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import { CategoryIcon } from "@/components/expense-ui";
import { DriverStatusBadge, ReceiptBadge } from "@/components/trip-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DRIVERS, TRUCKS } from "@/lib/data";
import { useTms } from "@/lib/store";
import { frDate, truckTrips } from "@/lib/truck-history";
import { cn, formatNumber } from "@/lib/utils";

const TAB_TRIGGER =
  "relative rounded-none border-0 border-b-2 border-transparent px-4 pb-3 pt-2 -mb-[1px] font-semibold text-muted-foreground hover:text-foreground data-active:border-b-blue-600 data-active:text-blue-600 data-active:shadow-none data-active:bg-transparent";
const TABLE = "@container overflow-hidden rounded-xl border border-slate-200 bg-white";
const THEAD = "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500";

type LogEntry = { date: string; sort: number; icon: React.ElementType; tone: string; title: string; detail: string };

/** "14 nov · 08:42" → clé de tri. */
function sortKey(label: string) {
  const [d, rest = ""] = label.split(" · ");
  const [day, month] = d.split(" ");
  const m = month?.startsWith("oct") ? 10 : month?.startsWith("sept") ? 9 : 11;
  const [h = "0", min = "0"] = rest.split(":");
  return m * 1e6 + Number(day) * 1e4 + Number(h) * 100 + Number(min);
}

export function DriverProfile({ plate }: { plate: string }) {
  const driver = DRIVERS.find((d) => d.plate === plate)!;
  const truck = TRUCKS.find((t) => t.plate === plate);
  const { trips, blockedAdvances, blockAdvance, unblockAdvance } = useTms();
  const router = useRouter();
  const [tab, setTab] = useState("voyages");

  const stats = driverStats(driver, trips);
  const history = useMemo(() => (truck ? truckTrips(truck).filter((t) => t.driver === driver.name) : []), [truck, driver.name]);
  const km = history.reduce((s, t) => s + t.km, 0);
  const blocked = blockedAdvances.includes(driver.plate);
  const receipts = stats.trips.flatMap((t) => t.expenses.map((x) => ({ x, trip: t })));

  // Journal : départs, arrivées, reçus et anomalies, du plus récent au plus ancien.
  const log: LogEntry[] = [
    ...stats.trips.map((t) => ({
      date: t.departure,
      sort: sortKey(t.departure),
      icon: TruckIcon,
      tone: "bg-blue-500/10 text-blue-600",
      title: `Départ ${t.id} vers ${t.destination}`,
      detail: `${t.cargo} · ${t.client}`,
    })),
    ...receipts.map(({ x, trip }) => ({
      date: x.date,
      sort: sortKey(x.date),
      icon: x.status === "anomalie" || x.status === "sans reçu" ? AlertTriangleIcon : ReceiptIcon,
      tone: x.status === "anomalie" || x.status === "sans reçu" ? "bg-rose-500/10 text-rose-600" : "bg-slate-500/10 text-slate-600",
      title: `${x.label} · ${formatNumber(x.amount)} FCFA`,
      detail: `${x.location} · ${trip.id} · ${x.status === "sans reçu" ? "aucun reçu envoyé" : x.status === "anomalie" ? "anomalie signalée" : `reçu ${x.status}`}`,
    })),
    ...(driver.advance
      ? [
          {
            date: stats.trips[0]?.departure ?? "",
            sort: sortKey(stats.trips[0]?.departure ?? "1 nov") - 1,
            icon: HandCoinsIcon,
            tone: "bg-violet-500/10 text-violet-600",
            title: `Avance sur frais remise · ${formatNumber(driver.advance)} FCFA`,
            detail: "À justifier par les reçus du voyage",
          },
        ]
      : []),
  ].sort((a, b) => b.sort - a.sort);

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col items-start">
          <Link href="/chauffeurs" className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeftIcon className="size-4" />
            Retour aux chauffeurs
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{driver.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DriverStatusBadge status={driver.status} />
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <TruckIcon className="size-3" />
              <Link href={`/flotte/${driver.plate}`} className="font-semibold text-foreground hover:underline">
                {driver.plate}
              </Link>
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <PhoneIcon className="size-3" />
              {driver.phone}
            </Badge>
            <Badge variant="secondary" className="bg-muted/50 font-normal text-muted-foreground">
              <CalendarIcon className="size-3" />
              Depuis {driver.hired} · permis {driver.licence} jusqu&apos;en {driver.licenceUntil}
            </Badge>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-slate-200 bg-white shadow-none"
            onClick={() => toast.success("Appel en cours", { description: `${driver.name} · ${driver.phone}` })}
          >
            <PhoneIcon className="size-4" />
            Appeler
          </Button>
          {blocked ? (
            <Button size="sm" className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" onClick={() => unblockAdvance(driver.plate)}>
              <UnlockIcon className="size-4" />
              Débloquer l&apos;avance
            </Button>
          ) : (
            <Button size="sm" className="gap-2 bg-rose-600 text-white shadow-none hover:bg-rose-700" onClick={() => blockAdvance(driver.plate)}>
              <LockIcon className="size-4" />
              Bloquer la prochaine avance
            </Button>
          )}
        </div>
      </div>

      <div className={KPI_GRID}>
        <KpiCard icon={RouteIcon} title="Voyages" value={history.length} color="blue" footer="Depuis septembre" />
        <KpiCard icon={GaugeIcon} title="Kilomètres" value={formatNumber(km)} unit="km" color="amber" footer={`${formatNumber(driver.kmMonth)} km ce mois`} />
        <KpiCard
          icon={BadgeCheckIcon}
          title="Reçus justifiés"
          value={`${Math.round(stats.rate * 100)} %`}
          alert={stats.rate < 0.7}
          footer={stats.flagged.length ? `${stats.flagged.length} dépense${stats.flagged.length > 1 ? "s" : ""} sans reçu ou en anomalie` : "Tous les reçus sont justifiés"}
        />
        <KpiCard
          icon={HandCoinsIcon}
          title="Avance en cours"
          value={driver.advance ? formatNumber(driver.advance) : "Aucune"}
          unit={driver.advance ? "FCFA" : undefined}
          alert={blocked}
          footer={blocked ? "Prochaine avance bloquée" : "Frais de route remis au départ"}
        />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(String(v))} className="flex flex-col gap-4">
        <TabsList className="h-auto w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <TabsTrigger value="voyages" className={TAB_TRIGGER}>
            <RouteIcon className="mr-2 size-4" />
            Voyages <span className="ml-1.5 text-xs font-normal text-muted-foreground">{history.length}</span>
          </TabsTrigger>
          <TabsTrigger value="recus" className={TAB_TRIGGER}>
            <ReceiptIcon className="mr-2 size-4" />
            Reçus <span className="ml-1.5 text-xs font-normal text-muted-foreground">{receipts.length}</span>
          </TabsTrigger>
          <TabsTrigger value="journal" className={TAB_TRIGGER}>
            <HistoryIcon className="mr-2 size-4" />
            Journal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voyages" className="mt-0">
          <div className={TABLE}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className={THEAD}>
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Destination</th>
                    <th className="hidden px-4 py-3 text-right @2xl:table-cell">Km</th>
                    <th className="hidden px-4 py-3 text-right @3xl:table-cell">Conso.</th>
                    <th className="hidden px-4 py-3 text-right @3xl:table-cell">Charges</th>
                    <th className="px-4 py-3 text-right">Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {history.map((t) => {
                    const margin = t.billed - t.expenses;
                    return (
                      <tr
                        key={t.id}
                        onClick={() => t.live && router.push(`/voyages?trip=${t.id}`)}
                        className={cn("transition-colors", t.live && "cursor-pointer hover:bg-slate-50/50")}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{frDate(t.date)}</div>
                          <div className="text-xs text-slate-500">{t.live ? t.id : "Archivé"}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="whitespace-nowrap text-slate-800">Lomé → {t.destination}</div>
                          <div className="text-xs text-slate-500">{t.status}</div>
                        </td>
                        <td className="hidden px-4 py-3 text-right tabular-nums @2xl:table-cell">{formatNumber(t.km)}</td>
                        <td className="hidden px-4 py-3 text-right tabular-nums @3xl:table-cell">{t.consumption.toFixed(1).replace(".", ",")} L</td>
                        <td className="hidden px-4 py-3 text-right tabular-nums @3xl:table-cell">{formatNumber(t.expenses)}</td>
                        <td className={cn("px-4 py-3 text-right font-semibold tabular-nums", margin >= 0 ? "text-emerald-700" : "text-rose-600")}>
                          {margin >= 0 ? "+" : ""}
                          {formatNumber(margin)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recus" className="mt-0">
          <div className={TABLE}>
            <ul className="divide-y divide-slate-200">
              {receipts.length === 0 && <li className="p-8 text-center text-sm text-slate-500">Aucun reçu ce mois.</li>}
              {receipts.map(({ x, trip }) => (
                <li key={x.id}>
                  <Link href={`/depenses?receipt=${x.id}`} className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50/50">
                    <CategoryIcon category={x.category} className="size-9" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{x.label}</span>
                      <span className="block truncate text-xs text-slate-500">
                        {x.location} · {x.date} · {trip.id}
                      </span>
                    </span>
                    <span className="font-semibold whitespace-nowrap tabular-nums text-slate-800">{formatNumber(x.amount)}</span>
                    <ReceiptBadge status={x.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </TabsContent>

        <TabsContent value="journal" className="mt-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <ol className="relative flex flex-col gap-4 before:absolute before:top-2 before:bottom-2 before:left-[17px] before:w-px before:bg-slate-200">
              {log.map((e, i) => (
                <li key={i} className="relative flex gap-3">
                  <span className={cn("z-10 flex size-9 shrink-0 items-center justify-center rounded-full ring-4 ring-white", e.tone)}>
                    <e.icon className="size-4" />
                  </span>
                  <div className="min-w-0 pt-0.5">
                    <div className="text-sm font-medium text-slate-900">{e.title}</div>
                    <div className="text-xs text-slate-500">
                      {e.date} · {e.detail}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
