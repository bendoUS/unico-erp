"use client";

import { useState } from "react";
import {
  Building2Icon,
  CheckCheckIcon,
  ChevronDownIcon,
  PackageIcon,
  PhoneIcon,
  SendIcon,
  SparklesIcon,
  TruckIcon,
} from "lucide-react";
import { toast } from "sonner";

import { CategoryIcon, ReceiptPreview } from "@/components/expense-ui";
import { ReceiptBadge, TripStatusBadge } from "@/components/trip-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { CATEGORIES, type Expense, type Trip } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, fcfa, flaggedExpenses, formatNumber, percent, shortCity, tripExpenses } from "@/lib/utils";

function ExpenseRow({ expense, trip }: { expense: Expense; trip: Trip }) {
  const [open, setOpen] = useState(false);
  return (
    <li className={cn("rounded-lg border", expense.status === "anomalie" ? "border-rose-200" : "border-slate-200")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50">
        <CategoryIcon category={expense.category} />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5 font-medium text-slate-900">
            <span className="truncate">{expense.label}</span>
            {expense.live && (
              <Badge variant="secondary" className="h-4 rounded-full bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-600">
                NOUVEAU
              </Badge>
            )}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {expense.location} · {expense.date}
          </span>
        </span>
        <span className="flex flex-col items-end gap-1">
          <span className="font-semibold tabular-nums">{formatNumber(expense.amount)}</span>
          <ReceiptBadge status={expense.status} />
        </span>
        <ChevronDownIcon className={cn("size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="border-t border-slate-200 p-3">
          <ReceiptPreview expense={expense} trip={trip} />
        </div>
      )}
    </li>
  );
}

export function TripSheet({ trip, onClose }: { trip: Trip | null; onClose: () => void }) {
  // Garde le dernier voyage affiché pendant l'animation de fermeture.
  const [shown, setShown] = useState<Trip | null>(trip);
  if (trip && trip !== shown) setShown(trip);

  return (
    <Sheet open={!!trip} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-xl">
        {shown && <SheetBody trip={shown} />}
      </SheetContent>
    </Sheet>
  );
}

function SheetBody({ trip }: { trip: Trip }) {
  const { validateReceipts, blockedAdvances } = useTms();
  const spent = tripExpenses(trip);
  const finished = trip.status === "Terminé";
  const margin = finished ? trip.billed - spent : trip.billed - Math.max(spent, trip.budget);
  const flags = flaggedExpenses(trip);
  const pending = trip.expenses.filter((x) => x.status === "en attente").length;
  const blocked = blockedAdvances.includes(trip.plate);
  const byCat = CATEGORIES.map((c) => ({ c, v: trip.expenses.filter((x) => x.category === c).reduce((s, x) => s + x.amount, 0) })).filter((x) => x.v > 0);

  return (
    <>
      <SheetHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-slate-500">{trip.id}</span>
          <TripStatusBadge status={trip.status} />
        </div>
        <SheetTitle className="text-2xl font-bold tracking-tight text-slate-900">
          {shortCity(trip.origin)} → {trip.destination}
        </SheetTitle>
        <SheetDescription>
          {trip.position} · {formatNumber(trip.distanceKm)} km
        </SheetDescription>
        <div className="mt-3 flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-600 transition-all duration-700" style={{ width: `${trip.progress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Départ {trip.departure}</span>
            <span className="font-medium text-slate-700">{trip.progress} %</span>
            <span>
              {finished ? "Arrivée" : "Arrivée prévue"} {trip.eta}
            </span>
          </div>
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        <dl className="grid grid-cols-2 gap-2 text-sm">
          {[
            { icon: TruckIcon, k: "Camion", v: trip.plate },
            { icon: PhoneIcon, k: trip.driver, v: trip.driverPhone },
            { icon: Building2Icon, k: "Client", v: trip.client },
            { icon: PackageIcon, k: "Marchandise", v: trip.cargo },
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

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Rentabilité</h3>
          <dl className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg bg-blue-500/5 px-3 py-2">
              <dt className="truncate text-xs text-muted-foreground">Facturé</dt>
              <dd className="font-semibold tabular-nums text-blue-700">{formatNumber(trip.billed)}</dd>
            </div>
            <div className="rounded-lg bg-rose-500/5 px-3 py-2">
              <dt className="truncate text-xs text-muted-foreground">Dépenses</dt>
              <dd className="font-semibold tabular-nums text-rose-700">{formatNumber(spent)}</dd>
            </div>
            <div className={cn("rounded-lg px-3 py-2", margin >= 0 ? "bg-emerald-500/5" : "bg-rose-500/5")}>
              <dt className="truncate text-xs text-muted-foreground">{finished ? "Marge finale" : "Marge projetée"}</dt>
              <dd className={cn("font-semibold tabular-nums", margin >= 0 ? "text-emerald-700" : "text-rose-700")}>
                {margin >= 0 ? "+" : ""}
                {formatNumber(margin)} <span className="text-xs font-normal">({percent((margin / trip.billed) * 100, 0)})</span>
              </dd>
            </div>
          </dl>
          <div className="flex flex-col gap-1.5">
            {byCat.map(({ c, v }) => (
              <div key={c} className="flex items-center justify-between rounded-lg bg-slate-50 px-2.5 py-2 text-sm">
                <span className="text-muted-foreground">{c}</span>
                <span className="font-semibold tabular-nums">{formatNumber(v)}</span>
              </div>
            ))}
            <div className="flex items-center justify-between px-2.5 pt-1 text-xs text-muted-foreground">
              <span>Budget prévu</span>
              <span className="tabular-nums">{fcfa(trip.budget)}</span>
            </div>
          </div>
        </section>

        {flags.length > 0 && (
          <section className="flex flex-col gap-2 rounded-2xl border border-blue-500/15 bg-gradient-to-br from-blue-50 to-white p-4">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-700">
              <SparklesIcon className="size-4" />
              Analyse de l&apos;assistant
            </p>
            <p className="text-sm text-slate-700">
              <span className="font-semibold text-slate-900">
                {flags.length} dépense{flags.length > 1 ? "s" : ""}
              </span>{" "}
              à contrôler pour <span className="font-semibold text-slate-900">{fcfa(flags.reduce((s, x) => s + x.amount, 0))}</span>.
              {trip.plate === "TG-5521-A" && " La consommation de carburant dépasse de 15 % la moyenne de ce camion sur ce trajet."}
            </p>
            {blocked && (
              <Badge variant="outline" className="border-rose-200 bg-rose-50 font-medium text-rose-700">
                Prochaine avance sur frais bloquée
              </Badge>
            )}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Reçus envoyés par le chauffeur <span className="font-normal text-muted-foreground">({trip.expenses.length})</span>
          </h3>
          <ul className="flex flex-col gap-2">
            {[...trip.expenses].reverse().map((x) => (
              <ExpenseRow key={x.id} expense={x} trip={trip} />
            ))}
          </ul>
        </section>
      </div>

      <SheetFooter className="flex-row border-t border-slate-200 p-4">
        <Button
          variant="outline"
          className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
          disabled={flags.length === 0}
          onClick={() => toast.success("Demande envoyée", { description: `${trip.driver} doit justifier ${flags.length} dépense(s).` })}
        >
          <SendIcon className="size-4" />
          Demander les justificatifs
        </Button>
        <Button
          className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
          disabled={pending === 0}
          onClick={() => {
            validateReceipts(trip.id);
            toast.success(`${pending} reçu(s) validé(s)`, { description: trip.id });
          }}
        >
          <CheckCheckIcon className="size-4" />
          Valider {pending > 0 ? `(${pending})` : "les reçus"}
        </Button>
      </SheetFooter>
    </>
  );
}
