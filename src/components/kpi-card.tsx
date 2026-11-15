import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * Carte KPI sobre, pour les pages autres que le tableau de bord : carte blanche,
 * icône neutre, valeur et une ligne de détail. La couleur est réservée aux alertes.
 */
export function KpiCard({
  icon: Icon,
  title,
  value,
  unit,
  footer,
  badge,
  alert = false,
}: {
  icon: LucideIcon;
  title: string;
  value: ReactNode;
  unit?: string;
  footer?: ReactNode;
  /** Alerte courte affichée à la place du détail. */
  badge?: { icon?: LucideIcon; label: string; description?: string };
  /** Met la ligne de détail en rouge. */
  alert?: boolean;
  /** Ignoré : gardé pour la compatibilité avec StatCard. */
  color?: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-slate-500">
          <Icon className="size-3.5" />
        </span>
        <span className="truncate text-sm font-medium text-slate-600">{title}</span>
      </div>
      <div className="min-w-0">
        <div className="truncate text-xl font-semibold tracking-tight text-slate-900 tabular-nums">
          {value}
          {unit && <span className="ml-1 text-xs font-medium text-slate-400">{unit}</span>}
        </div>
        {badge ? (
          <div className="mt-1 flex items-center gap-1 truncate text-xs text-rose-600" title={badge.description}>
            {badge.icon && <badge.icon className="size-3 shrink-0" />}
            <span className="truncate">
              {badge.label}
              {badge.description && <span className="text-slate-500"> · {badge.description}</span>}
            </span>
          </div>
        ) : (
          footer && <div title={typeof footer === "string" ? footer : undefined} className={cn("mt-1 truncate text-xs", alert ? "text-rose-600" : "text-slate-500")}>{footer}</div>
        )}
      </div>
    </div>
  );
}

/** Grille des cartes KPI : 2 colonnes, 4 sur écran large. */
export const KPI_GRID = "grid grid-cols-2 gap-3 @5xl/main:grid-cols-4";
