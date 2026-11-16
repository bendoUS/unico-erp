"use client";

import { BanknoteIcon, FuelIcon, LandmarkIcon, ShieldIcon, WrenchIcon, type LucideIcon } from "lucide-react";

import { STAT_COLOR_STYLES } from "@/components/dashboard/stat-colors";
import type { Expense, ExpenseCategory, Trip } from "@/lib/data";
import { cn, formatNumber } from "@/lib/utils";

// Icônes des catégories de dépenses et aperçu d'un reçu, partagés entre
// les voyages et la page Dépenses & reçus.

export const CATEGORY: Record<ExpenseCategory, { icon: LucideIcon; color: keyof typeof STAT_COLOR_STYLES }> = {
  Carburant: { icon: FuelIcon, color: "blue" },
  "Frais de Douane": { icon: LandmarkIcon, color: "violet" },
  Péage: { icon: BanknoteIcon, color: "emerald" },
  Entretien: { icon: WrenchIcon, color: "amber" },
  "Frais de route": { icon: ShieldIcon, color: "rose" },
};

export function ReceiptPreview({ expense, trip }: { expense: Expense; trip: Trip }) {
  if (expense.status === "sans reçu") {
    return (
      <p className="rounded-lg bg-amber-500/5 px-3 py-2.5 text-sm text-amber-700">
        Aucun justificatif transmis. Dépense déclarée par le chauffeur depuis l&apos;application mobile.
      </p>
    );
  }
  return (
    <div className="flex gap-4">
      <div className="w-40 shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-[10px] leading-relaxed text-slate-600">
        <div className="text-center font-semibold uppercase">{expense.location}</div>
        <div className="my-1 border-t border-dashed border-slate-300" />
        <div>{expense.date}</div>
        <div className="truncate">{expense.label}</div>
        <div>Véh. {trip.plate}</div>
        <div className="my-1 border-t border-dashed border-slate-300" />
        <div className="flex justify-between font-semibold text-slate-900">
          <span>TOTAL</span>
          <span>{formatNumber(expense.amount)}</span>
        </div>
      </div>
      <dl className="flex flex-col gap-1.5 text-xs">
        <div>
          <dt className="text-slate-400">Envoyé par</dt>
          <dd className="font-medium text-slate-700">{trip.driver}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Géolocalisation</dt>
          <dd className="font-medium text-slate-700">{expense.status === "anomalie" ? "Écart de 3,2 km" : "Conforme au trajet"}</dd>
        </div>
        <div>
          <dt className="text-slate-400">Référence</dt>
          <dd className="font-medium text-slate-700">{expense.id}</dd>
        </div>
        {expense.note && <dd className="pt-1 font-medium text-rose-600">{expense.note}</dd>}
      </dl>
    </div>
  );
}


export function CategoryIcon({ category, className }: { category: ExpenseCategory; className?: string }) {
  const cat = CATEGORY[category];
  return (
    <span className={cn("grid size-8 shrink-0 place-items-center rounded-md", STAT_COLOR_STYLES[cat.color].iconBox, className)}>
      <cat.icon className="size-4" />
    </span>
  );
}
