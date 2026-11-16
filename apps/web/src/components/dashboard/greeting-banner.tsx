import { ZapIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export type GreetingStat = { label: string; value: number };

export function GreetingBanner({
  name,
  date,
  stats,
  className,
}: {
  name: string;
  date: string;
  stats?: GreetingStat[];
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 px-4 lg:px-6", className)}>
      <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold tracking-wide text-emerald-600 uppercase">
        <ZapIcon className="size-3.5" />
        {date}
      </div>

      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Bon retour, {name}{" "}
        <span aria-hidden className="animate-wave">
          👋
        </span>
      </h1>

      {stats && stats.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Vous avez{" "}
          {stats.map((stat, index) => (
            <span key={stat.label}>
              {index > 0 && <span className="mx-1.5">·</span>}
              <span className="font-semibold text-foreground">{stat.value}</span> {stat.label}
            </span>
          ))}
          .
        </p>
      )}
    </div>
  );
}
