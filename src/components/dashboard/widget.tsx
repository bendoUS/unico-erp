import Link from "next/link";

import { STAT_COLOR_STYLES, type StatColor } from "@/components/dashboard/stat-colors";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// En-tête et cadre des cartes du tableau de bord (repris de Schoolvi V1).

export const WIDGET_CARD = "flex w-full min-w-0 flex-col gap-5 rounded-3xl border bg-card p-6 text-card-foreground";

export function WidgetHeader({
  icon,
  title,
  subtitle,
  href,
  action,
  color = "blue",
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  href?: string;
  action?: React.ReactNode;
  color?: StatColor;
}) {
  const styles = STAT_COLOR_STYLES[color];
  return (
    <header className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <div className={cn("grid size-12 shrink-0 place-items-center rounded-full", styles.iconBox)}>{icon}</div>
        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold">{title}</h2>
          <p className="truncate text-sm text-muted-foreground" title={subtitle}>
            {subtitle}
          </p>
        </div>
      </div>
      {action}
      {href && (
        <Button variant="ghost" size="sm" className={cn("shrink-0", styles.text)} render={<Link href={href} />}>
          Voir tout
        </Button>
      )}
    </header>
  );
}
