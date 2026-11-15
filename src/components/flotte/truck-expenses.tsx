"use client";

import { useMemo, useState } from "react";

import { ExpenseSheet, type ExpenseRow } from "@/components/depenses/expense-sheet";
import { CategoryIcon } from "@/components/expense-ui";
import { inPeriod, periodLabel, receiptDate, type Period } from "@/components/flotte/period-picker";
import { ReceiptBadge } from "@/components/trip-badges";
import { CATEGORIES, type Expense, type ExpenseCategory, type ReceiptStatus, type Trip } from "@/lib/data";
import type { TruckTrip } from "@/lib/truck-history";
import { frDate } from "@/lib/truck-history";
import { cn, formatNumber } from "@/lib/utils";

type Row = {
  id: string;
  date: Date;
  dateLabel: string;
  trip: string;
  category: ExpenseCategory;
  label: string;
  place: string;
  amount: number;
  status: ReceiptStatus | "archivé";
  source?: ExpenseRow;
};

type StatusFilter = "Tous" | "À vérifier" | "Validés";

export function TruckExpenses({ history, receipts, period }: { history: TruckTrip[]; receipts: { x: Expense; trip: Trip }[]; period: Period }) {
  const [category, setCategory] = useState<ExpenseCategory | "Toutes">("Toutes");
  const [status, setStatus] = useState<StatusFilter>("Tous");
  const [open, setOpen] = useState<ExpenseRow | null>(null);

  const all = useMemo<Row[]>(() => {
    const live: Row[] = receipts.map(({ x, trip }) => ({
      id: x.id,
      date: receiptDate(x.date),
      dateLabel: x.date,
      trip: trip.id,
      category: x.category,
      label: x.label,
      place: x.location,
      amount: x.amount,
      status: x.status,
      source: { expense: x, trip },
    }));
    // Voyages clôturés : charges regroupées par catégorie (reçus archivés).
    const archived: Row[] = history
      .filter((t) => !t.live)
      .flatMap((t) =>
        (Object.entries(t.byCategory) as [ExpenseCategory, number][]).map(([c, v]) => ({
          id: `${t.id}-${c}`,
          date: t.date,
          dateLabel: frDate(t.date),
          trip: `Lomé → ${t.destination}`,
          category: c,
          label: `${c}, voyage complet`,
          place: "Reçus archivés",
          amount: v,
          status: "archivé" as const,
        })),
      );
    return [...live, ...archived].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [history, receipts]);

  const inRange = all.filter((r) => inPeriod(r.date, period));
  const totals = CATEGORIES.map((c) => ({ c, v: inRange.filter((r) => r.category === c).reduce((s, r) => s + r.amount, 0) }));
  const total = totals.reduce((s, t) => s + t.v, 0);
  const rows = inRange.filter(
    (r) =>
      (category === "Toutes" || r.category === category) &&
      (status === "Tous" ||
        (status === "À vérifier" ? r.status === "en attente" || r.status === "anomalie" || r.status === "sans reçu" : r.status === "validé" || r.status === "archivé")),
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white @3xl/main:grid-cols-6">
        <button
          type="button"
          onClick={() => setCategory("Toutes")}
          className={cn("flex flex-col gap-1 border-slate-200 p-4 text-left transition-colors hover:bg-slate-50", category === "Toutes" && "bg-blue-50/60")}
        >
          <span className="text-xs font-medium text-slate-500">Total {periodLabel(period)}</span>
          <span className="text-lg font-semibold tabular-nums text-slate-900">{formatNumber(total)}</span>
        </button>
        {totals.map(({ c, v }) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(category === c ? "Toutes" : c)}
            className={cn("flex flex-col gap-1 border-l border-slate-200 p-4 text-left transition-colors hover:bg-slate-50", category === c && "bg-blue-50/60")}
          >
            <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <CategoryIcon category={c} className="size-5 [&_svg]:size-3" />
              {c}
            </span>
            <span className="text-lg font-semibold tabular-nums text-slate-800">{formatNumber(v)}</span>
            <span className="text-xs text-slate-400 tabular-nums">{total ? Math.round((v / total) * 100) : 0} %</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-lg bg-muted p-[3px]">
          {(["Tous", "À vérifier", "Validés"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn("rounded-md px-3 py-1 text-sm font-medium text-muted-foreground", status === s && "bg-background text-foreground")}
            >
              {s}
            </button>
          ))}
        </div>
        <span className="text-sm text-slate-500">
          {rows.length} ligne{rows.length > 1 ? "s" : ""}
          {category !== "Toutes" && ` · ${category}`}
        </span>
      </div>

      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Dépense</th>
                <th className="hidden px-4 py-3 @2xl:table-cell">Date</th>
                <th className="hidden px-4 py-3 @3xl:table-cell">Voyage</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                    Aucune dépense sur cette période.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} onClick={() => r.source && setOpen(r.source)} className={cn("transition-colors", r.source && "cursor-pointer hover:bg-slate-50/50")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={r.category} />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-slate-900">{r.label}</div>
                        <div className="truncate text-xs text-slate-500">{r.place}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 whitespace-nowrap @2xl:table-cell">{r.dateLabel}</td>
                  <td className="hidden px-4 py-3 whitespace-nowrap @3xl:table-cell">{r.trip}</td>
                  <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums text-slate-800">{formatNumber(r.amount)}</td>
                  <td className="px-4 py-3">
                    {r.status === "archivé" ? <span className="text-xs text-slate-400">Archivé</span> : <ReceiptBadge status={r.status} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseSheet row={open} onClose={() => setOpen(null)} />
    </div>
  );
}
