import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { STAT_COLOR_STYLES, type StatColor } from "@/components/dashboard/stat-colors";
import { cn } from "@/lib/utils";

export type { StatColor };

export type StatBreakdownItem = {
  label: string;
  value: string;
};

export type StatBadge = {
  icon?: LucideIcon;
  label: string;
  description: string;
  variant?: "destructive" | "secondary" | "outline";
};

export interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: ReactNode;
  color?: StatColor;
  unit?: string;
  footer?: ReactNode;
  description?: string;
  badge?: StatBadge;
  breakdown?: StatBreakdownItem[];
  className?: string;
  valueClassName?: string;
  href?: string;
}

export function StatCard({
  icon: Icon,
  title,
  value,
  color = "blue",
  unit,
  footer,
  description,
  badge,
  breakdown,
  className,
  valueClassName,
  href,
}: StatCardProps) {
  const colorStyles = STAT_COLOR_STYLES[color];

  return (
    <Card
      className={cn(
        "group @container/card relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 border border-slate-200 shadow-none ring-0",
        colorStyles.cardBg || "bg-white",
        className,
      )}
    >
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-6 -right-6 size-16 rounded-full opacity-40 blur-xl transition-transform duration-300 group-hover:scale-125",
          colorStyles.glow,
        )}
      />
      <CardHeader className="relative flex flex-row items-center justify-between border-0 pb-0">
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
              colorStyles.iconBox,
            )}
          >
            <Icon className="size-4.5" />
          </div>
          <span className="text-sm font-semibold text-foreground">{title}</span>
        </div>
        
        {href && (
          <Link 
            href={href} 
            className="text-xs font-medium text-muted-foreground hover:text-foreground flex items-center transition-colors"
          >
            Tout voir
            <ChevronRightIcon className="ml-0.5 size-3" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="relative flex flex-col gap-3.5">
        <div className="flex items-baseline gap-2">
          <span className={cn("text-2xl font-semibold tracking-tight tabular-nums text-slate-800", valueClassName)}>
            {value}
          </span>
          {unit && <span className="text-xs font-medium text-muted-foreground">{unit}</span>}
        </div>

        {badge && (
          <div className="flex flex-col items-start gap-1.5">
            <Badge variant={badge.variant ?? "destructive"} className="gap-1">
              {badge.icon && <badge.icon className="size-3.5" />}
              {badge.label}
            </Badge>
            <span className="text-sm text-muted-foreground">{badge.description}</span>
          </div>
        )}

        {footer && <p className="text-sm text-muted-foreground">{footer}</p>}
        {description && <p className="text-sm text-muted-foreground">{description}</p>}

        {breakdown && breakdown.length > 0 && (
          <div className="flex flex-col gap-1.5">
            {breakdown.map((item) => (
              <div
                key={item.label}
                className={cn(
                  "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm",
                  colorStyles.row,
                )}
              >
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-semibold">{item.value}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
