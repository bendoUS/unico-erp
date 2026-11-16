"use client";

import { useRouter } from "next/navigation";
import { FlagIcon } from "lucide-react";

import { WIDGET_CARD, WidgetHeader } from "@/components/dashboard/widget";
import { ProfitBadge } from "@/components/trip-badges";
import { useTms } from "@/lib/store";
import { cn, formatNumber, percent, shortCity, tripExpenses, tripMargin } from "@/lib/utils";

export function RecentTrips() {
  const { trips } = useTms();
  const router = useRouter();
  const done = trips.filter((t) => t.status === "Terminé");

  return (
    <div className={cn(WIDGET_CARD, "rounded-none border-0 bg-transparent p-0")}>
      <WidgetHeader
        icon={<FlagIcon className="size-6" />}
        title="Derniers voyages terminés"
        subtitle="Rentabilité après déduction de toutes les charges"
        href="/voyages?status=Terminé"
        color="blue"
      />
      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Voyage</th>
                <th className="hidden px-4 py-3 @2xl:table-cell">Trajet</th>
                <th className="hidden px-4 py-3 text-right @3xl:table-cell">Facturé</th>
                <th className="hidden px-4 py-3 text-right @3xl:table-cell">Charges</th>
                <th className="px-4 py-3 text-right">Marge</th>
                <th className="px-4 py-3 text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {done.map((t) => {
                const margin = tripMargin(t);
                return (
                  <tr
                    key={t.id}
                    onClick={() => router.push(`/voyages?trip=${t.id}`)}
                    className="cursor-pointer transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold whitespace-nowrap text-slate-900">{t.id}</div>
                      <div className="text-xs text-slate-500">
                        {t.plate} • {t.driver}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 @2xl:table-cell">
                      {shortCity(t.origin)} → {t.destination}
                    </td>
                    <td className="hidden px-4 py-3 text-right tabular-nums @3xl:table-cell">{formatNumber(t.billed)}</td>
                    <td className="hidden px-4 py-3 text-right tabular-nums @3xl:table-cell">{formatNumber(tripExpenses(t))}</td>
                    <td className="px-4 py-3 text-right tabular-nums">
                      <div className={cn("font-semibold", margin >= 0 ? "text-emerald-700" : "text-rose-600")}>
                        {margin >= 0 ? "+" : ""}
                        {formatNumber(margin)}
                      </div>
                      <div className="text-xs text-slate-400">{percent((margin / t.billed) * 100)}</div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ProfitBadge margin={margin} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
