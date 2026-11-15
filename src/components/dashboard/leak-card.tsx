"use client";

import Link from "next/link";
import { ChevronRightIcon, ShieldAlertIcon } from "lucide-react";

import { STAT_COLOR_STYLES } from "@/components/dashboard/stat-colors";
import { WIDGET_CARD, WidgetHeader } from "@/components/dashboard/widget";
import { Button } from "@/components/ui/button";
import { useTms } from "@/lib/store";
import { cn, fcfa, formatNumber } from "@/lib/utils";

const LEAKS = [
  {
    key: "fuel",
    label: "Surconsommation carburant",
    hint: "TG-5521-A · +15 % sur Lomé → Ouagadougou",
    amount: 204_000,
    tone: "rose" as const,
    href: "/voyages?trip=VOY-2026-042",
  },
  {
    key: "border",
    label: "Camions bloqués à la frontière",
    hint: "3 camions à Cinkassé depuis plus de 24 h",
    amount: 450_000,
    tone: "amber" as const,
    href: "/voyages?status=Frontière",
  },
  {
    key: "receipts",
    label: "Frais de route sans reçu",
    hint: "17 dépenses non justifiées ce mois",
    amount: 685_000,
    tone: "amber" as const,
    href: "/depenses?status=sans reçu",
  },
];

/** Fuites de trésorerie relevées par l'assistant. */
export function LeakCard() {
  const { setAssistantOpen } = useTms();
  const total = LEAKS.reduce((s, l) => s + l.amount, 0);

  return (
    <div className={WIDGET_CARD}>
      <WidgetHeader
        icon={<ShieldAlertIcon className="size-6" />}
        title="Fuites détectées"
        subtitle="Relevées par l'assistant cette semaine"
        color="rose"
      />
      <p className="text-2xl font-semibold tracking-tight tabular-nums text-rose-600">{fcfa(total)}</p>
      <ul className="grid gap-2">
        {LEAKS.map((item) => {
          const styles = STAT_COLOR_STYLES[item.tone];
          return (
            <li key={item.key} className="min-w-0">
              <Link href={item.href} className="flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm hover:bg-muted/50">
                <span className={cn("size-2 shrink-0 rounded-full", styles.dot)} />
                <span className="min-w-0 flex-1">
                  <span className="block font-medium">{item.label}</span>
                  <span className="block truncate text-xs text-muted-foreground">{item.hint}</span>
                </span>
                <span className="font-semibold tabular-nums">{formatNumber(item.amount)}</span>
                <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
              </Link>
            </li>
          );
        })}
      </ul>
      <Button variant="outline" className="mt-auto border-blue-200 bg-blue-50 text-blue-700 shadow-none hover:bg-blue-100" onClick={() => setAssistantOpen(true)}>
        Voir l&apos;analyse de l&apos;assistant
      </Button>
    </div>
  );
}
