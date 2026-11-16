"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheckIcon, ChevronRightIcon, FileTextIcon, FuelIcon, GaugeIcon, MapPinIcon, ShieldCheckIcon, UserIcon, WrenchIcon } from "lucide-react";
import { toast } from "sonner";

import { TruckStateBadge } from "@/components/trip-badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SERVICE_INTERVAL_KM, type Truck } from "@/lib/data";
import { useTms } from "@/lib/store";
import { truckKey } from "@/lib/fleet-store";
import { cn, decimal, formatNumber, fuelDeviation, shortCity } from "@/lib/utils";

export function TruckSheet({ truck, onClose }: { truck: Truck | null; onClose: () => void }) {
  // Garde le dernier camion affiché pendant l'animation de fermeture.
  const [shown, setShown] = useState<Truck | null>(truck);
  if (truck && truck !== shown) setShown(truck);

  return (
    <Sheet open={!!truck} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">{shown && <TruckBody truck={shown} />}</SheetContent>
    </Sheet>
  );
}

function TruckBody({ truck }: { truck: Truck }) {
  const { trips } = useTms();
  const trip = trips.find((t) => t.id === truck.tripId);
  const deviation = fuelDeviation(truck.consumption, truck.reference);
  const nextService = truck.lastServiceKm + SERVICE_INTERVAL_KM;
  const remaining = nextService - truck.odometerKm;
  const serviceRatio = Math.min(1, (truck.odometerKm - truck.lastServiceKm) / SERVICE_INTERVAL_KM);
  const max = Math.max(...truck.history, truck.reference);
  const min = Math.min(...truck.history, truck.reference) - 3;
  const past = trips.filter((t) => t.plate === truck.plate && t.status === "Terminé");

  return (
    <>
      <SheetHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">
            {truck.model} · {truck.year}
          </span>
          <TruckStateBadge state={truck.state} />
        </div>
        <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900">{truck.plate}</SheetTitle>
        <SheetDescription className="flex items-center gap-1.5">
          <MapPinIcon className="size-3.5" />
          {truck.location}
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        {truck.workshopReason && (
          <p className="flex items-start gap-2 rounded-lg bg-amber-500/5 px-3 py-2.5 text-sm text-amber-700">
            <WrenchIcon className="mt-0.5 size-4 shrink-0" />
            {truck.workshopReason}
          </p>
        )}

        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            { icon: UserIcon, k: "Chauffeur", v: truck.driver },
            { icon: GaugeIcon, k: "Compteur", v: `${formatNumber(truck.odometerKm)} km` },
            { icon: ShieldCheckIcon, k: "Assurance jusqu'au", v: truck.insuranceUntil },
            { icon: CalendarCheckIcon, k: "Visite technique jusqu'au", v: truck.inspectionUntil },
          ].map((i) => (
            <div key={i.k} className="flex items-start gap-2.5 rounded-lg border border-slate-200 px-3 py-2.5">
              <i.icon className="mt-0.5 size-4 shrink-0 text-slate-400" />
              <div className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground">{i.k}</dt>
                <dd className="truncate font-medium text-slate-900">{i.v}</dd>
              </div>
            </div>
          ))}
        </dl>

        {trip && (
          <Link
            href={`/voyages?trip=${trip.id}`}
            className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-muted/50"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-muted-foreground">Voyage en cours · {trip.id}</span>
              <span className="block font-medium text-slate-900">
                {shortCity(trip.origin)} → {trip.destination} · {trip.status}
              </span>
            </span>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
        )}

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
              <FuelIcon className="size-4 text-slate-400" />
              Consommation
            </h3>
            <span className={cn("text-xs font-semibold", deviation > 8 ? "text-rose-600" : deviation > 3 ? "text-amber-600" : "text-emerald-600")}>
              {deviation >= 0 ? "+" : ""}
              {decimal(deviation)} % vs référence
            </span>
          </div>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-xs text-muted-foreground">30 derniers jours</dt>
              <dd className="font-semibold tabular-nums">{decimal(truck.consumption)} L/100</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Référence</dt>
              <dd className="font-semibold tabular-nums">{decimal(truck.reference)} L/100</dd>
            </div>
            <div className="rounded-lg bg-slate-50 px-3 py-2">
              <dt className="text-xs text-muted-foreground">Ce mois</dt>
              <dd className="font-semibold tabular-nums">{formatNumber(truck.fuelMonthL)} L</dd>
            </div>
          </dl>
          <div className="flex h-28 items-end gap-2 rounded-lg border border-slate-200 px-3 pt-3 pb-2">
            {truck.history.map((v, i) => {
              const d = fuelDeviation(v, truck.reference);
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-500 tabular-nums">{decimal(v)}</span>
                  <div
                    className={cn("w-full rounded-t-md", d > 8 ? "bg-rose-400" : d > 3 ? "bg-amber-400" : "bg-blue-500")}
                    style={{ height: `${12 + ((v - min) / (max - min)) * 52}px` }}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground">L/100 km sur les 6 derniers voyages, du plus ancien au plus récent.</p>
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <WrenchIcon className="size-4 text-slate-400" />
            Entretien
          </h3>
          <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Dernière vidange</span>
              <span className="font-medium">
                {truck.lastServiceDate} · {formatNumber(truck.lastServiceKm)} km
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Prochaine vidange</span>
              <span className={cn("font-medium", remaining < 2_000 && "text-rose-600")}>
                {remaining > 0 ? `dans ${formatNumber(remaining)} km` : `dépassée de ${formatNumber(-remaining)} km`}
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className={cn("h-full rounded-full", serviceRatio > 0.9 ? "bg-rose-500" : serviceRatio > 0.75 ? "bg-amber-500" : "bg-emerald-500")}
                style={{ width: `${serviceRatio * 100}%` }}
              />
            </div>
          </div>
        </section>

        {past.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Voyages terminés ce mois</h3>
            <ul className="flex flex-col gap-2">
              {past.map((t) => (
                <li key={t.id}>
                  <Link href={`/voyages?trip=${t.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-muted/50">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-slate-900">
                        {shortCity(t.origin)} → {t.destination}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t.id} · arrivé le {t.eta}
                      </span>
                    </span>
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <SheetFooter className="flex-row border-t border-slate-200 p-4">
        <Button
          variant="outline"
          className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
          onClick={() => toast.success("Entretien planifié", { description: `${truck.plate} passera au garage central.` })}
        >
          <WrenchIcon className="size-4" />
          Planifier un entretien
        </Button>
        <Button className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" render={<Link href={`/flotte/${truckKey(truck)}`} />}>
          <FileTextIcon className="size-4" />
          Voir la fiche complète
        </Button>
      </SheetFooter>
    </>
  );
}
