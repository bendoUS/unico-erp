"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheckIcon, CalendarIcon, ChevronRightIcon, HistoryIcon, HomeIcon, LockIcon, PhoneIcon, SparklesIcon, TruckIcon, UnlockIcon } from "lucide-react";
import { toast } from "sonner";

import { driverStats, rateTone } from "@/components/chauffeurs/driver-stats";
import { STAT_COLOR_STYLES } from "@/components/dashboard/stat-colors";
import { CategoryIcon } from "@/components/expense-ui";
import { DriverStatusBadge, ReceiptBadge, TripStatusBadge } from "@/components/trip-badges";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Driver } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, fcfa, formatNumber, initials, shortCity } from "@/lib/utils";

export function DriverSheet({ driver, onClose }: { driver: Driver | null; onClose: () => void }) {
  const [shown, setShown] = useState<Driver | null>(driver);
  if (driver && driver !== shown) setShown(driver);

  return (
    <Sheet open={!!driver} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">{shown && <DriverBody driver={shown} />}</SheetContent>
    </Sheet>
  );
}

function DriverBody({ driver }: { driver: Driver }) {
  const { trips, blockedAdvances, blockAdvance, unblockAdvance } = useTms();
  const stats = driverStats(driver, trips);
  const blocked = blockedAdvances.includes(driver.plate);
  const tone = STAT_COLOR_STYLES[rateTone(stats.rate)];
  const licenceSoon = driver.licenceUntil.endsWith("2026");

  return (
    <>
      <SheetHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-4">
          <Avatar className="size-14">
            <AvatarFallback className="bg-slate-100 text-lg font-semibold text-slate-600">{initials(driver.name)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex items-center gap-2">
              <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900">{driver.name}</SheetTitle>
            </div>
            <SheetDescription className="flex items-center gap-2">
              <DriverStatusBadge status={driver.status} />
              <span>Chauffeur depuis {driver.hired}</span>
            </SheetDescription>
          </div>
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            { icon: PhoneIcon, k: "Téléphone", v: driver.phone },
            { icon: TruckIcon, k: "Camion attitré", v: driver.plate },
            { icon: BadgeCheckIcon, k: `Permis ${driver.licence}`, v: `valide jusqu'en ${driver.licenceUntil}`, alert: licenceSoon },
            { icon: HomeIcon, k: "Ville d'origine", v: driver.hometown },
          ].map((i) => (
            <div key={i.k} className={cn("flex items-start gap-2.5 rounded-lg border px-3 py-2.5", i.alert ? "border-rose-200 bg-rose-50/60" : "border-slate-200")}>
              <i.icon className={cn("mt-0.5 size-4 shrink-0", i.alert ? "text-rose-500" : "text-slate-400")} />
              <div className="min-w-0">
                <dt className="truncate text-xs text-muted-foreground">{i.k}</dt>
                <dd className={cn("truncate font-medium", i.alert ? "text-rose-700" : "text-slate-900")}>{i.v}</dd>
              </div>
            </div>
          ))}
        </dl>

        <dl className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg bg-blue-500/5 px-3 py-2">
            <dt className="text-xs text-muted-foreground">Km ce mois</dt>
            <dd className="font-semibold tabular-nums text-blue-700">{formatNumber(driver.kmMonth)}</dd>
          </div>
          <div className="rounded-lg bg-violet-500/5 px-3 py-2">
            <dt className="text-xs text-muted-foreground">Voyages</dt>
            <dd className="font-semibold tabular-nums text-violet-700">{stats.trips.length}</dd>
          </div>
          <div className={cn("rounded-lg px-3 py-2", stats.margin >= 0 ? "bg-emerald-500/5" : "bg-rose-500/5")}>
            <dt className="text-xs text-muted-foreground">Marge générée</dt>
            <dd className={cn("font-semibold tabular-nums", stats.margin >= 0 ? "text-emerald-700" : "text-rose-700")}>{formatNumber(stats.margin)}</dd>
          </div>
        </dl>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Reçus justifiés</h3>
            <span className={cn("text-sm font-semibold", tone.text)}>{Math.round(stats.rate * 100)} %</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className={cn("h-full rounded-full", tone.dot)} style={{ width: `${stats.rate * 100}%` }} />
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.justified} reçus justifiés sur {stats.receipts.length} · {stats.flagged.length} à contrôler pour {fcfa(stats.flagged.reduce((s, x) => s + x.amount, 0))}
          </p>
        </section>

        <section className="flex flex-col gap-2 rounded-2xl border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Avance sur frais de route en cours</p>
              <p className="text-xl font-bold tabular-nums">{fcfa(driver.advance)}</p>
            </div>
            {blocked && (
              <Badge variant="outline" className="border-rose-200 bg-rose-50 font-medium text-rose-700">
                Prochaine avance bloquée
              </Badge>
            )}
          </div>
          {driver.name === "Koffi Mensah" && !blocked && (
            <p className="flex items-start gap-1.5 text-sm text-blue-700">
              <SparklesIcon className="mt-0.5 size-4 shrink-0" />
              L&apos;assistant recommande de bloquer la prochaine avance : 2 compléments carburant non justifiés.
            </p>
          )}
        </section>

        {stats.flagged.length > 0 && (
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-slate-900">Reçus à contrôler</h3>
            <ul className="flex flex-col gap-2">
              {stats.flagged.map((x) => (
                <li key={x.id}>
                  <Link href={`/depenses?receipt=${x.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-muted/50">
                    <CategoryIcon category={x.category} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-slate-900">{x.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {x.location} · {x.date}
                      </span>
                    </span>
                    <span className="flex flex-col items-end gap-1">
                      <span className="font-semibold tabular-nums">{formatNumber(x.amount)}</span>
                      <ReceiptBadge status={x.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-slate-900">
            <CalendarIcon className="size-4 text-slate-400" />
            Voyages
          </h3>
          {stats.trips.length === 0 ? (
            <p className="rounded-lg bg-slate-50 px-3 py-2.5 text-sm text-muted-foreground">Aucun voyage ce mois-ci.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {stats.trips.map((t) => (
                <li key={t.id}>
                  <Link href={`/voyages?trip=${t.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-muted/50">
                    <span className="min-w-0 flex-1">
                      <span className="block font-medium text-slate-900">
                        {shortCity(t.origin)} → {t.destination}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {t.id} · départ le {t.departure}
                      </span>
                    </span>
                    <TripStatusBadge status={t.status} />
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <SheetFooter className="flex-col gap-2 border-t border-slate-200 p-4">
        <Button variant="outline" className="w-full gap-2 border-slate-200 bg-white shadow-none" render={<Link href={`/chauffeurs/${driver.plate}`} />}>
          <HistoryIcon className="size-4" />
          Voir l&apos;historique complet
        </Button>
        <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
          onClick={() => toast.success("Appel en cours", { description: `${driver.name} · ${driver.phone}` })}
        >
          <PhoneIcon className="size-4" />
          Appeler
        </Button>
        {blocked ? (
          <Button
            className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            onClick={() => {
              unblockAdvance(driver.plate);
              toast.success("Avance débloquée", { description: driver.name });
            }}
          >
            <UnlockIcon className="size-4" />
            Débloquer l&apos;avance
          </Button>
        ) : (
          <Button
            className="flex-1 gap-2 bg-rose-600 text-white shadow-none hover:bg-rose-700"
            onClick={() => {
              blockAdvance(driver.plate);
              toast.success("Prochaine avance bloquée", { description: driver.name });
            }}
          >
            <LockIcon className="size-4" />
            Bloquer la prochaine avance
          </Button>
        )}
        </div>
      </SheetFooter>
    </>
  );
}
