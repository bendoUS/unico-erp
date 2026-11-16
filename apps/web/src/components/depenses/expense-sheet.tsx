"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckIcon, ChevronRightIcon, SendIcon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { CategoryIcon, ReceiptPreview } from "@/components/expense-ui";
import { ReceiptBadge } from "@/components/trip-badges";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Expense, Trip } from "@/lib/data";
import { useTms } from "@/lib/store";
import { fcfa, shortCity } from "@/lib/utils";

export type ExpenseRow = { expense: Expense; trip: Trip };

export function ExpenseSheet({ row, onClose }: { row: ExpenseRow | null; onClose: () => void }) {
  const [shown, setShown] = useState<ExpenseRow | null>(row);
  if (row && (row.expense !== shown?.expense || row.trip !== shown?.trip)) setShown(row);

  return (
    <Sheet open={!!row} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-lg">{shown && <ExpenseBody row={shown} onClose={onClose} />}</SheetContent>
    </Sheet>
  );
}

function ExpenseBody({ row, onClose }: { row: ExpenseRow; onClose: () => void }) {
  const { setExpenseStatus } = useTms();
  const { expense: x, trip } = row;

  return (
    <>
      <SheetHeader className="border-b border-slate-200 p-6">
        <div className="flex items-center gap-3">
          <CategoryIcon category={x.category} className="size-10" />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-sm font-semibold text-slate-500">
              {x.category} · {x.id}
            </span>
            <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">{x.label}</SheetTitle>
          </div>
        </div>
        <SheetDescription>
          {x.location} · {x.date}
        </SheetDescription>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-2xl font-semibold tracking-tight tabular-nums text-slate-800">{fcfa(x.amount)}</span>
          <ReceiptBadge status={x.status} />
        </div>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto p-6">
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Justificatif</h3>
          <ReceiptPreview expense={x} trip={trip} />
        </section>

        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-slate-900">Voyage</h3>
          <Link href={`/voyages?trip=${trip.id}`} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm hover:bg-muted/50">
            <span className="min-w-0 flex-1">
              <span className="block font-medium text-slate-900">
                {shortCity(trip.origin)} → {trip.destination}
              </span>
              <span className="block text-xs text-muted-foreground">
                {trip.id} · {trip.plate} · {trip.driver}
              </span>
            </span>
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
        </section>
      </div>

      <SheetFooter className="flex-row border-t border-slate-200 p-4">
        {x.status === "sans reçu" ? (
          <Button
            variant="outline"
            className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
            onClick={() => toast.success("Reçu demandé", { description: `${trip.driver} a reçu une notification.` })}
          >
            <SendIcon className="size-4" />
            Demander le reçu
          </Button>
        ) : (
          <Button
            variant="outline"
            className="flex-1 gap-2 border-rose-200 bg-white text-rose-700 shadow-none hover:bg-rose-50"
            disabled={x.status === "anomalie"}
            onClick={() => {
              setExpenseStatus(x.id, "anomalie");
              toast.success("Anomalie signalée", { description: `${x.label} · ${trip.driver}` });
            }}
          >
            <ShieldAlertIcon className="size-4" />
            Signaler une anomalie
          </Button>
        )}
        <Button
          className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
          disabled={x.status === "validé"}
          onClick={() => {
            setExpenseStatus(x.id, "validé");
            toast.success("Dépense validée", { description: `${x.label} · ${fcfa(x.amount)}` });
            onClose();
          }}
        >
          <CheckIcon className="size-4" />
          Valider la dépense
        </Button>
      </SheetFooter>
    </>
  );
}
