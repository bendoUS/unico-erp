"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronRightIcon, FileWarningIcon, FuelIcon, MapIcon, MapPinIcon, PlusIcon, SearchIcon, TableIcon, TimerIcon, TruckIcon, WrenchIcon, XIcon, type LucideIcon } from "lucide-react";

import { toast } from "sonner";

import { FleetMap } from "@/components/flotte/fleet-map";
import { TruckSheet } from "@/components/flotte/truck-sheet";
import { TruckStateBadge } from "@/components/trip-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SERVICE_INTERVAL_KM, type TruckState } from "@/lib/data";
import { truckKey, useFleet } from "@/lib/fleet-store";
import { useTeam } from "@/lib/team-store";
import { TruckForm } from "@/components/flotte/truck-form";
import { useTms } from "@/lib/store";
import { documentState } from "@/lib/truck-history";
import { cn, decimal, formatNumber, fuelDeviation } from "@/lib/utils";

type Filter = "Tous" | TruckState;
type View = "carte" | "tableau";

type Alert = { key: string; icon: LucideIcon; label: string; plates: string[]; tone: "rose" | "amber" };

const ALERT_TONES = {
  rose: "border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100",
  amber: "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
};
const FILTERS: Filter[] = ["Tous", "En mission", "Disponible", "Atelier"];

export function FleetClient() {
  const { trucks: TRUCKS, addTruck } = useFleet();
  const { can } = useTeam();
  const [adding, setAdding] = useState(false);
  const { trips } = useTms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>("Tous");
  const [query, setQuery] = useState("");
  const [alertKey, setAlertKey] = useState<string | null>(null);

  // Vue affichée (Carte ou Tableau), gardée dans l'adresse : ?vue=tableau
  const view: View = params.get("vue") === "tableau" ? "tableau" : "carte";
  const setView = (v: View) => {
    const next = new URLSearchParams(params.toString());
    if (v === "tableau") next.set("vue", "tableau");
    else next.delete("vue");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const selected = TRUCKS.find((t) => truckKey(t) === params.get("truck") || t.plate === params.get("truck")) ?? null;
  const openTruck = (plate: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (plate) next.set("truck", plate);
    else next.delete("truck");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // Ce qui demande une action, plutôt que des compteurs.
  const alerts: Alert[] = useMemo(() => {
    const border = trips.filter((t) => t.status === "Frontière").map((t) => t.plate);
    const list: Alert[] = [
      {
        key: "carburant",
        icon: FuelIcon,
        label: "surconsomment",
        plates: TRUCKS.filter((t) => fuelDeviation(t.consumption, t.reference) > 5).map((t) => t.plate),
        tone: "rose",
      },
      {
        key: "vidange",
        icon: WrenchIcon,
        label: "vidanges à prévoir",
        plates: TRUCKS.filter((t) => t.lastServiceKm + SERVICE_INTERVAL_KM - t.odometerKm < 2_000).map((t) => t.plate),
        tone: "amber",
      },
      {
        key: "documents",
        icon: FileWarningIcon,
        label: "documents à renouveler",
        plates: TRUCKS.filter((t) => documentState(t.insuranceUntil) !== "valide" || documentState(t.inspectionUntil) !== "valide").map((t) => t.plate),
        tone: "amber",
      },
      { key: "frontiere", icon: TimerIcon, label: "bloqués à Cinkassé", plates: border, tone: "rose" },
    ];
    return list.filter((a) => a.plates.length > 0);
  }, [trips, TRUCKS]);
  const activeAlert = alerts.find((a) => a.key === alertKey) ?? null;

  const pickAlert = (key: string) => {
    setAlertKey(key);
    setFilter("Tous");
    setView("tableau");
  };

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return TRUCKS.filter((t) => {
      if (activeAlert && !activeAlert.plates.includes(t.plate)) return false;
      if (filter !== "Tous" && t.state !== filter) return false;
      if (!q) return true;
      return [t.plate, t.model, t.driver, t.location].some((v) => v.toLowerCase().includes(q));
    });
  }, [filter, query, activeAlert, TRUCKS]);

  const count = (s: TruckState) => TRUCKS.filter((t) => t.state === s).length;

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Flotte & GPS</h1>
          <p className="mt-1 text-sm text-slate-500">
            <span className="font-semibold text-slate-900">{String(TRUCKS.length)}</span> camions ·{" "}
            <span className="font-semibold text-slate-900">{String(count("En mission"))}</span> en mission ·{" "}
            <span className="font-semibold text-slate-900">{String(count("Disponible"))}</span> disponibles ·{" "}
            <span className="font-semibold text-slate-900">{String(count("Atelier"))}</span> à l&apos;atelier
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={view} onValueChange={(v) => setView(v as View)}>
            <TabsList>
              <TabsTrigger value="carte" className="gap-1.5">
                <MapIcon className="size-4" />
                Carte
              </TabsTrigger>
              <TabsTrigger value="tableau" className="gap-1.5">
                <TableIcon className="size-4" />
                Tableau
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" disabled={!can("flotte.edit")} onClick={() => setAdding(true)}>
            <PlusIcon className="size-4" />
            Ajouter un camion
          </Button>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-slate-500">À traiter :</span>
          {alerts.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => pickAlert(a.key)}
              title={a.plates.join(", ")}
              className={cn(
                "inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                alertKey === a.key ? "border-blue-300 bg-blue-50 text-blue-700" : ALERT_TONES[a.tone],
              )}
            >
              <a.icon className="size-3.5" />
              <span className="font-bold tabular-nums">{String(a.plates.length)}</span>
              {a.plates.length > 1 ? a.label : a.label.replace("surconsomment", "surconsomme").replace("vidanges", "vidange").replace("documents", "document").replace("bloqués", "bloqué")}
            </button>
          ))}
        </div>
      )}

      {/* La carte reste montée quand on passe au tableau : les camions gardent leur position. */}
      <div className={cn(view !== "carte" && "hidden")}>
        <FleetMap trucks={TRUCKS} trips={trips} onPick={openTruck} visible={view === "carte"} />
      </div>

      <div className={cn("flex flex-col gap-6", view !== "tableau" && "hidden")}>
        <div className="flex flex-col gap-4 @3xl/main:flex-row @3xl/main:items-center">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              {FILTERS.map((f) => (
                <TabsTrigger key={f} value={f} className="gap-1.5">
                  {f}
                  <span className="text-xs text-muted-foreground tabular-nums">{String(f === "Tous" ? TRUCKS.length : count(f))}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une plaque, un modèle, un chauffeur…" className="border-slate-200 bg-white pl-9" />
          </div>
        </div>

        {activeAlert && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm text-blue-900">
            <activeAlert.icon className="size-4 text-blue-600" />
            <span>
              Filtre : <span className="font-semibold">{activeAlert.plates.length} camion{activeAlert.plates.length > 1 ? "s" : ""} {activeAlert.label}</span>
            </span>
            <Button variant="ghost" size="sm" className="ml-auto gap-1 text-blue-800" onClick={() => setAlertKey(null)}>
              <XIcon className="size-4" />
              Retirer le filtre
            </Button>
          </div>
        )}

        <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Camion</th>
                  <th className="hidden px-6 py-4 @3xl:table-cell">Chauffeur</th>
                  <th className="hidden px-6 py-4 @4xl:table-cell">Position</th>
                  <th className="px-6 py-4">Consommation</th>
                  <th className="hidden px-6 py-4 @5xl:table-cell">Prochaine vidange</th>
                  <th className="px-6 py-4">État</th>
                  <th className="hidden w-12 px-6 py-4 @6xl:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.map((t) => {
                  const d = fuelDeviation(t.consumption, t.reference);
                  const remaining = t.lastServiceKm + SERVICE_INTERVAL_KM - t.odometerKm;
                  return (
                    <tr key={t.plate} onClick={() => router.push(`/flotte/${truckKey(t)}`)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                            <TruckIcon className="size-4" />
                          </span>
                          <div className="flex flex-col">
                            <span className="font-semibold whitespace-nowrap text-slate-900">{t.plate}</span>
                            <span className="text-xs whitespace-nowrap text-slate-500">
                              {t.model} · {t.year}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 whitespace-nowrap text-slate-900 @3xl:table-cell">{t.driver}</td>
                      <td className="hidden px-6 py-4 @4xl:table-cell">
                        <span className="flex max-w-56 items-center gap-1 text-slate-700">
                          <MapPinIcon className="size-3.5 shrink-0 text-slate-400" />
                          <span className="truncate">{t.location}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold whitespace-nowrap text-slate-900 tabular-nums">{decimal(t.consumption)} L/100</span>
                          <span className={cn("text-xs whitespace-nowrap", d > 8 ? "text-rose-600" : d > 3 ? "text-amber-600" : "text-slate-500")}>
                            {d >= 0 ? "+" : ""}
                            {decimal(d)} % vs référence
                          </span>
                        </div>
                      </td>
                      <td className="hidden px-6 py-4 whitespace-nowrap @5xl:table-cell">
                        <span className={cn(remaining < 2_000 ? "font-medium text-rose-600" : "text-slate-700")}>
                          {remaining > 0 ? `dans ${formatNumber(remaining)} km` : "dépassée"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <TruckStateBadge state={t.state} />
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
                      Aucun camion ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <TruckSheet truck={selected} onClose={() => openTruck(null)} />
      <TruckForm
        open={adding}
        truck={null}
        takenPlates={TRUCKS.map((t) => t.plate)}
        onClose={() => setAdding(false)}
        onSave={(patch) => {
          addTruck({
            model: "",
            year: 2024,
            driver: "Non attribué",
            state: "Disponible",
            location: "Port de Lomé, parking Unico",
            corridorKm: 0,
            odometerKm: 0,
            lastServiceKm: 0,
            lastServiceDate: "15 nov. 2026",
            insuranceUntil: "15 nov. 2027",
            inspectionUntil: "15 mai 2027",
            consumption: patch.reference ?? 40,
            reference: 40,
            history: [],
            fuelMonthL: 0,
            ...patch,
          });
          toast.success("Camion ajouté", { description: `${patch.plate} · ${patch.model}` });
          setAdding(false);
          router.push(`/flotte/${patch.plate}`);
        }}
      />
    </div>
  );
}
