"use client";

import { TrendingUpIcon } from "lucide-react";
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { WIDGET_CARD, WidgetHeader } from "@/components/dashboard/widget";
import { WEEKLY } from "@/lib/data";
import { compactFcfa, fcfa } from "@/lib/utils";

const COLORS = { revenus: "#10b981", depenses: "#fb7185", marge: "#2563eb" };
const data = WEEKLY.map((w) => ({ ...w, marge: w.revenus - w.depenses }));

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const get = (k: string) => payload.find((p) => p.dataKey === k)?.value ?? 0;
  return (
    <div className="min-w-52 rounded-lg border bg-white p-3 text-sm shadow-sm">
      <p className="mb-1.5 text-xs font-medium text-muted-foreground">Semaine du {label}</p>
      {[
        { k: "revenus", label: "Revenus" },
        { k: "depenses", label: "Dépenses" },
        { k: "marge", label: "Marge" },
      ].map((r) => (
        <div key={r.k} className="flex items-center justify-between gap-4 py-0.5">
          <span className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2 rounded-full" style={{ background: COLORS[r.k as keyof typeof COLORS] }} />
            {r.label}
          </span>
          <span className="font-semibold tabular-nums">{fcfa(get(r.k))}</span>
        </div>
      ))}
    </div>
  );
}

export function RevenueChart() {
  const totalRev = data.reduce((s, d) => s + d.revenus, 0);
  const totalExp = data.reduce((s, d) => s + d.depenses, 0);

  return (
    <div className={WIDGET_CARD}>
      <WidgetHeader
        icon={<TrendingUpIcon className="size-6" />}
        title="Revenus vs Dépenses"
        subtitle="4 dernières semaines"
        color="emerald"
      />
      <dl className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg bg-emerald-500/5 px-3 py-2">
          <dt className="truncate text-xs text-muted-foreground">Revenus</dt>
          <dd className="font-semibold tabular-nums text-emerald-700">{fcfa(totalRev)}</dd>
        </div>
        <div className="rounded-lg bg-rose-500/5 px-3 py-2">
          <dt className="truncate text-xs text-muted-foreground">Dépenses</dt>
          <dd className="font-semibold tabular-nums text-rose-700">{fcfa(totalExp)}</dd>
        </div>
        <div className="rounded-lg bg-blue-500/5 px-3 py-2">
          <dt className="truncate text-xs text-muted-foreground">Marge</dt>
          <dd className="font-semibold tabular-nums text-blue-700">{fcfa(totalRev - totalExp)}</dd>
        </div>
      </dl>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} barGap={4} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
            <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#64748b" }} dy={6} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#94a3b8" }} tickFormatter={compactFcfa} width={56} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "#f1f5f9" }} />
            <Bar dataKey="revenus" fill={COLORS.revenus} radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Bar dataKey="depenses" fill={COLORS.depenses} radius={[6, 6, 0, 0]} maxBarSize={32} />
            <Line type="monotone" dataKey="marge" stroke={COLORS.marge} strokeWidth={2} dot={{ r: 3, fill: COLORS.marge }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-emerald-500" /> Revenus
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-rose-400" /> Dépenses
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded bg-blue-600" /> Marge
        </span>
      </div>
    </div>
  );
}
