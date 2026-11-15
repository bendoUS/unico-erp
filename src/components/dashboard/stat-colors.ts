export const STAT_COLOR_STYLES = {
  blue: {
    iconBox: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    row: "bg-blue-500/5 dark:bg-blue-500/10",
    glow: "bg-blue-400",
    hoverRing: "hover:ring-blue-500/30",
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    cardBg: "bg-blue-50/50 dark:bg-blue-950/20",
  },
  violet: {
    iconBox: "bg-violet-500/10 text-violet-600 dark:bg-violet-500/15 dark:text-violet-400",
    row: "bg-violet-500/5 dark:bg-violet-500/10",
    glow: "bg-violet-400",
    hoverRing: "hover:ring-violet-500/30",
    dot: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    cardBg: "bg-violet-50/50 dark:bg-violet-950/20",
  },
  amber: {
    iconBox: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
    row: "bg-amber-500/5 dark:bg-amber-500/10",
    glow: "bg-amber-400",
    hoverRing: "hover:ring-amber-500/30",
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    cardBg: "bg-amber-50/50 dark:bg-amber-950/20",
  },
  rose: {
    iconBox: "bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400",
    row: "bg-rose-500/5 dark:bg-rose-500/10",
    glow: "bg-rose-400",
    hoverRing: "hover:ring-rose-500/30",
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    cardBg: "bg-rose-50/50 dark:bg-rose-950/20",
  },
  emerald: {
    iconBox: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    row: "bg-emerald-500/5 dark:bg-emerald-500/10",
    glow: "bg-emerald-400",
    hoverRing: "hover:ring-emerald-500/30",
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    cardBg: "bg-emerald-50/50 dark:bg-emerald-950/20",
  },
} as const;

export type StatColor = keyof typeof STAT_COLOR_STYLES;
