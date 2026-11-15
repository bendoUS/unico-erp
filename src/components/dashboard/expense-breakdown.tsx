import { PieChartIcon } from "lucide-react";

import { WIDGET_CARD, WidgetHeader } from "@/components/dashboard/widget";
import { EXPENSE_BREAKDOWN, MONTHLY } from "@/lib/data";
import { fcfa, formatNumber, percent } from "@/lib/utils";

const BAR_COLORS = ["bg-blue-500", "bg-violet-500", "bg-amber-500", "bg-emerald-500", "bg-slate-400"];

export function ExpenseBreakdown() {
  const total = EXPENSE_BREAKDOWN.reduce((s, x) => s + x.amount, 0);
  return (
    <div className={WIDGET_CARD}>
      <WidgetHeader
        icon={<PieChartIcon className="size-6" />}
        title="Répartition des dépenses"
        subtitle="Mois en cours, par catégorie"
        color="violet"
      />
      <p className="text-2xl font-semibold tracking-tight tabular-nums text-slate-800">{fcfa(total)}</p>
      <div className="flex h-2.5 w-full overflow-hidden rounded-full">
        {EXPENSE_BREAKDOWN.map((x, i) => (
          <div key={x.category} className={BAR_COLORS[i]} style={{ width: `${(x.amount / total) * 100}%` }} />
        ))}
      </div>
      <ul className="flex flex-col gap-1.5">
        {EXPENSE_BREAKDOWN.map((x, i) => (
          <li key={x.category} className="flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm odd:bg-slate-50">
            <span className={`size-2 shrink-0 rounded-full ${BAR_COLORS[i]}`} />
            <span className="flex-1 text-muted-foreground">{x.category}</span>
            <span className="font-semibold tabular-nums">{formatNumber(x.amount)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
              {percent((x.amount / total) * 100, 0)}
            </span>
          </li>
        ))}
      </ul>
      <p className="flex items-center justify-between rounded-lg bg-amber-500/5 px-3 py-2.5 text-sm text-amber-700">
        <span>Dont frais sans justificatif</span>
        <span className="font-semibold tabular-nums">{fcfa(MONTHLY.unjustified)}</span>
      </p>
    </div>
  );
}
