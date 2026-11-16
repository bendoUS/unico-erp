"use client";

import { ArrowDownRightIcon, ArrowUpRightIcon, BanknoteIcon, PiggyBankIcon, ReceiptIcon, TruckIcon } from "lucide-react";

import { StatCard } from "@/components/dashboard/stat-card";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { MONTHLY, TRUCKS } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, percent } from "@/lib/utils";

/** Variation vs octobre : verte si c'est une bonne nouvelle, rouge sinon. */
function Trend({ value, good }: { value: number; good: boolean }) {
  const Icon = value >= 0 ? ArrowUpRightIcon : ArrowDownRightIcon;
  return (
    <span className="flex items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums",
          good ? "bg-emerald-500/10 text-emerald-700" : "bg-rose-500/10 text-rose-700",
        )}
      >
        <Icon className="size-3.5" />
        {percent(Math.abs(value))}
      </span>
      par rapport à octobre
    </span>
  );
}

export function KpiCards() {
  const { monthlyExpenses, trips } = useTms();
  const revenue = MONTHLY.revenue;
  const margin = revenue - monthlyExpenses;

  const revenueTrend = ((revenue - MONTHLY.revenuePrev) / MONTHLY.revenuePrev) * 100;
  const expenseTrend = ((monthlyExpenses - MONTHLY.expensesPrev) / MONTHLY.expensesPrev) * 100;

  const active = trips.filter((t) => t.status !== "Terminé");
  const count = (s: string) => active.filter((t) => t.status === s).length;

  return (
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <StatCard
        icon={BanknoteIcon}
        title="Chiffre d'affaires"
        value={<AnimatedNumber value={revenue} />}
        unit="FCFA"
        color="emerald"
        footer={<Trend value={revenueTrend} good={revenueTrend >= 0} />}
      />
      <StatCard
        icon={ReceiptIcon}
        title="Dépenses"
        value={<AnimatedNumber value={monthlyExpenses} />}
        unit="FCFA"
        color="rose"
        footer={<Trend value={expenseTrend} good={expenseTrend <= 0} />}
      />
      <StatCard
        icon={PiggyBankIcon}
        title="Marge nette"
        value={<AnimatedNumber value={margin} />}
        unit="FCFA"
        color="blue"
        footer={
          <>
            Il reste <span className="font-semibold text-foreground">{Math.round((margin / revenue) * 100)} FCFA</span> sur
            100 FCFA encaissés
          </>
        }
      />
      <StatCard
        icon={TruckIcon}
        title="Camions en mission"
        value={`${active.length} sur ${TRUCKS.length}`}
        color="amber"
        footer={`${count("En route")} en route · ${count("Frontière")} à la frontière · ${count("En chargement")} au port`}
      />
    </div>
  );
}
