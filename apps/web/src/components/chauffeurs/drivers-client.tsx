"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircleIcon, BadgeCheckIcon, ChevronRightIcon, HandCoinsIcon, PlusIcon, SearchIcon, UsersIcon } from "lucide-react";

import { driverStats, rateTone } from "@/components/chauffeurs/driver-stats";
import { DriverSheet } from "@/components/chauffeurs/driver-sheet";
import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import { STAT_COLOR_STYLES } from "@/components/dashboard/stat-colors";
import { DriverStatusBadge } from "@/components/trip-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DRIVERS, type DriverStatus } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, formatNumber, initials } from "@/lib/utils";

type Filter = "Tous" | DriverStatus;
const FILTERS: Filter[] = ["Tous", "En mission", "Disponible", "Repos"];

export function DriversClient() {
  const { trips, blockedAdvances } = useTms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>("Tous");
  const [query, setQuery] = useState("");

  const selected = DRIVERS.find((d) => d.plate === params.get("driver")) ?? null;
  const openDriver = (plate: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (plate) next.set("driver", plate);
    else next.delete("driver");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const all = useMemo(() => DRIVERS.map((d) => ({ driver: d, stats: driverStats(d, trips) })), [trips]);
  const rows = all.filter(({ driver: d }) => {
    if (filter !== "Tous" && d.status !== filter) return false;
    const q = query.trim().toLowerCase();
    return !q || [d.name, d.phone, d.plate, d.hometown].some((v) => v.toLowerCase().includes(q));
  });

  const receipts = all.flatMap((r) => r.stats.receipts);
  const globalRate = receipts.filter((x) => x.status !== "anomalie" && x.status !== "sans reçu").length / receipts.length;
  const advances = DRIVERS.reduce((s, d) => s + d.advance, 0);
  const watch = all.filter((r) => r.stats.rate < 0.7 || blockedAdvances.includes(r.driver.plate));
  const count = (s: DriverStatus) => DRIVERS.filter((d) => d.status === s).length;

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Chauffeurs</h1>
          <p className="mt-1 text-sm text-slate-500">Missions, avances sur frais et fiabilité des reçus de vos chauffeurs.</p>
        </div>
        <Button className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700">
          <PlusIcon className="size-4" />
          Ajouter un chauffeur
        </Button>
      </div>

      <div className={KPI_GRID}>
        <KpiCard icon={UsersIcon} title="Chauffeurs" value={DRIVERS.length} color="blue" footer={`${count("En mission")} en mission · ${count("Disponible")} disponibles`} />
        <KpiCard icon={BadgeCheckIcon} title="Reçus justifiés" value={`${Math.round(globalRate * 100)} %`} color="emerald" footer={`Sur ${receipts.length} reçus envoyés ce mois`} />
        <KpiCard icon={HandCoinsIcon} title="Avances en cours" value={formatNumber(advances)} unit="FCFA" color="violet" footer="Frais de route remis aux chauffeurs" />
        <KpiCard
          icon={AlertCircleIcon}
          title="À surveiller"
          value={watch.length}
          color="rose"
          badge={watch.length > 0 ? { icon: AlertCircleIcon, label: watch.map((w) => w.driver.name.split(" ")[0]).join(", "), description: "reçus peu justifiés ou avance bloquée" } : undefined}
        />
      </div>

      <div className="flex flex-col gap-4 @3xl/main:flex-row @3xl/main:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f} className="gap-1.5">
                {f}
                <span className="text-xs text-muted-foreground tabular-nums">{f === "Tous" ? DRIVERS.length : count(f)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un nom, un téléphone, une plaque…" className="border-slate-200 bg-white pl-9" />
        </div>
      </div>

      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Chauffeur</th>
                <th className="hidden px-6 py-4 @3xl:table-cell">Camion</th>
                <th className="hidden px-6 py-4 text-right @4xl:table-cell">Voyages</th>
                <th className="px-6 py-4">Reçus justifiés</th>
                <th className="hidden px-6 py-4 text-right @5xl:table-cell">Avance en cours</th>
                <th className="px-6 py-4">Statut</th>
                <th className="hidden w-12 px-6 py-4 @6xl:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map(({ driver: d, stats }) => {
                const tone = STAT_COLOR_STYLES[rateTone(stats.rate)];
                const blocked = blockedAdvances.includes(d.plate);
                return (
                  <tr key={d.plate} onClick={() => openDriver(d.plate)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-slate-100 font-medium text-slate-600">{initials(d.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold whitespace-nowrap text-slate-900">{d.name}</span>
                          <span className="text-xs whitespace-nowrap text-slate-500">{d.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 font-medium whitespace-nowrap text-slate-700 @3xl:table-cell">{d.plate}</td>
                    <td className="hidden px-6 py-4 text-right tabular-nums @4xl:table-cell">{stats.trips.length}</td>
                    <td className="px-6 py-4">
                      <div className="flex w-36 items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div className={cn("h-full rounded-full", tone.dot)} style={{ width: `${stats.rate * 100}%` }} />
                        </div>
                        <span className={cn("w-10 text-right text-xs font-semibold tabular-nums", tone.text)}>{Math.round(stats.rate * 100)} %</span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-right @5xl:table-cell">
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-semibold whitespace-nowrap text-slate-900 tabular-nums">{d.advance ? formatNumber(d.advance) : "Aucune"}</span>
                        {blocked && (
                          <Badge variant="outline" className="border-rose-200 bg-rose-50 text-[10px] font-medium text-rose-700">
                            Avance bloquée
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <DriverStatusBadge status={d.status} />
                    </td>
                    <td className="hidden px-6 py-4 @6xl:table-cell">
                      <ChevronRightIcon className="size-4 text-slate-400" />
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-16 text-center text-slate-500">
                    Aucun chauffeur ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DriverSheet driver={selected} onClose={() => openDriver(null)} />
    </div>
  );
}
