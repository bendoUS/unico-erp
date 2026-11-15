"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircleIcon, ChevronRightIcon, DownloadIcon, MapPinIcon, PlusIcon, ReceiptIcon, RouteIcon, SearchIcon, WalletIcon } from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/dashboard/stat-card";
import { TripStatusBadge } from "@/components/trip-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Trip, TripStatus } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, flaggedExpenses, formatNumber, shortCity, tripExpenses } from "@/lib/utils";
import { TripSheet } from "./trip-sheet";

type Filter = "Tous" | TripStatus;
const FILTERS: Filter[] = ["Tous", "En chargement", "En route", "Frontière", "Terminé"];
const isFilter = (v: string | null): v is Filter => !!v && (FILTERS as string[]).includes(v);

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("");
}

function ExpenseCell({ trip, flash }: { trip: Trip; flash: boolean }) {
  const spent = tripExpenses(trip);
  const ratio = spent / trip.budget;
  const over = ratio > 1;
  return (
    <div className={cn("flex flex-col items-end gap-1.5 rounded-md px-1 transition-colors duration-1000", flash && "bg-blue-50")}>
      <span className={cn("font-semibold tabular-nums", over ? "text-rose-600" : "text-slate-900")}>{formatNumber(spent)}</span>
      <div className="flex w-full max-w-40 items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full transition-all duration-700", over ? "bg-rose-500" : ratio > 0.85 ? "bg-amber-500" : "bg-blue-500")}
            style={{ width: `${Math.min(100, ratio * 100)}%` }}
          />
        </div>
        <span className="w-9 text-right text-xs text-slate-500 tabular-nums">{Math.round(ratio * 100)}%</span>
      </div>
    </div>
  );
}

export function TripsClient() {
  const { trips, lastTick } = useTms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>(() => (isFilter(params.get("status")) ? (params.get("status") as Filter) : "Tous"));
  const [query, setQuery] = useState("");
  const [flashId, setFlashId] = useState<string | null>(null);

  const selected = trips.find((t) => t.id === params.get("trip")) ?? null;

  useEffect(() => {
    const s = params.get("status");
    if (isFilter(s)) setFilter(s);
  }, [params]);

  // Surligne brièvement la ligne qui vient de recevoir un reçu.
  useEffect(() => {
    if (!lastTick) return;
    setFlashId(lastTick.tripId);
    const t = window.setTimeout(() => setFlashId(null), 1600);
    return () => window.clearTimeout(t);
  }, [lastTick]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { Tous: trips.length };
    for (const t of trips) c[t.status] = (c[t.status] ?? 0) + 1;
    return c;
  }, [trips]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return trips.filter((t) => {
      if (filter !== "Tous" && t.status !== filter) return false;
      if (!q) return true;
      return [t.id, t.destination, t.plate, t.driver, t.client].some((v) => v.toLowerCase().includes(q));
    });
  }, [trips, filter, query]);

  const active = trips.filter((t) => t.status !== "Terminé");
  const billed = active.reduce((s, t) => s + t.billed, 0);
  const spent = active.reduce((s, t) => s + tripExpenses(t), 0);
  const flagged = active.flatMap(flaggedExpenses);

  const openTrip = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("trip", id);
    else next.delete("trip");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestion des voyages</h1>
          <p className="mt-1 text-sm text-slate-500">Suivez chaque mission, ses dépenses en temps réel et les reçus de vos chauffeurs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 border-slate-200 bg-white shadow-none" onClick={() => toast.success("Export prêt", { description: `${rows.length} voyages exportés en CSV.` })}>
            <DownloadIcon className="size-4" />
            Exporter
          </Button>
          <Button className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700">
            <PlusIcon className="size-4" />
            Nouveau voyage
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        <StatCard icon={RouteIcon} title="Facturé · en cours" value={formatNumber(billed)} unit="FCFA" color="blue" footer={`${active.length} missions ouvertes`} />
        <StatCard icon={WalletIcon} title="Dépenses engagées" value={formatNumber(spent)} unit="FCFA" color="violet" footer="Reçus envoyés en temps réel" />
        <StatCard
          icon={ReceiptIcon}
          title="Reçus à contrôler"
          value={flagged.length}
          color="rose"
          badge={{ icon: AlertCircleIcon, label: `${formatNumber(flagged.reduce((s, x) => s + x.amount, 0))} FCFA`, description: "anomalies ou dépenses sans reçu" }}
        />
      </div>

      <div className="flex flex-col gap-4 @3xl/main:flex-row @3xl/main:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f} value={f} className="gap-1.5">
                {f}
                <span className="text-xs text-muted-foreground tabular-nums">{counts[f] ?? 0}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un voyage, une ville, une plaque, un chauffeur…"
            className="border-slate-200 bg-white pl-9"
          />
        </div>
      </div>

      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">ID voyage</th>
                <th className="px-6 py-4">Trajet</th>
                <th className="hidden px-6 py-4 @4xl:table-cell">Camion & chauffeur</th>
                <th className="hidden px-6 py-4 text-right @5xl:table-cell">Montant facturé</th>
                <th className="px-6 py-4 text-right">Dépenses accumulées</th>
                <th className="px-6 py-4">Statut</th>
                <th className="hidden w-12 px-6 py-4 @6xl:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map((t) => {
                const flags = flaggedExpenses(t).length;
                return (
                  <tr key={t.id} onClick={() => openTrip(t.id)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold whitespace-nowrap text-slate-900">{t.id}</div>
                      <div className="text-xs whitespace-nowrap text-slate-500">{t.client}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium whitespace-nowrap text-slate-900">
                        {shortCity(t.origin)} → {t.destination}
                      </div>
                      <div className="mt-0.5 flex max-w-64 items-center gap-1 text-xs text-slate-500">
                        <MapPinIcon className="size-3 shrink-0" />
                        <span className="truncate">{t.position}</span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 @4xl:table-cell">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-slate-100 font-medium text-slate-600">{initials(t.driver)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-semibold whitespace-nowrap text-slate-900">{t.plate}</span>
                          <span className="text-xs whitespace-nowrap text-slate-500">{t.driver}</span>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-right @5xl:table-cell">
                      <span className="font-semibold text-slate-900 tabular-nums">{formatNumber(t.billed)}</span>
                      <span className="block text-xs text-slate-500">FCFA</span>
                    </td>
                    <td className="px-6 py-4">
                      <ExpenseCell trip={t} flash={flashId === t.id} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <TripStatusBadge status={t.status} />
                        {flags > 0 && (
                          <span className="text-xs whitespace-nowrap text-rose-600">
                            {flags} reçu{flags > 1 ? "s" : ""} à contrôler
                          </span>
                        )}
                      </div>
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
                    Aucun voyage ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TripSheet trip={selected} onClose={() => openTrip(null)} />
    </div>
  );
}
