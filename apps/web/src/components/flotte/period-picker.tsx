"use client";

import { CalendarIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TODAY, frDate } from "@/lib/truck-history";

export type Period = { preset: Preset; from: Date; to: Date };
type Preset = "mois" | "mois-dernier" | "3-mois" | "annee" | "perso";

const PRESETS: { value: Preset; label: string }[] = [
  { value: "mois", label: "Ce mois" },
  { value: "mois-dernier", label: "Mois dernier" },
  { value: "3-mois", label: "3 derniers mois" },
  { value: "annee", label: "Cette année" },
  { value: "perso", label: "Dates précises" },
];

export function presetPeriod(preset: Preset, current?: Period): Period {
  const y = TODAY.getFullYear();
  const m = TODAY.getMonth();
  switch (preset) {
    case "mois":
      return { preset, from: new Date(y, m, 1), to: TODAY };
    case "mois-dernier":
      return { preset, from: new Date(y, m - 1, 1), to: new Date(y, m, 0) };
    case "3-mois":
      return { preset, from: new Date(y, m - 2, 1), to: TODAY };
    case "annee":
      return { preset, from: new Date(y, 0, 1), to: TODAY };
    default:
      return { preset, from: current?.from ?? new Date(y, m, 1), to: current?.to ?? TODAY };
  }
}

export function periodLabel(p: Period) {
  return `du ${frDate(p.from, false)} au ${frDate(p.to, false)}`;
}

export function inPeriod(d: Date, p: Period) {
  const end = new Date(p.to);
  end.setHours(23, 59, 59);
  return d >= p.from && d <= end;
}

/** "14 nov · 08:42" → date de 2026. */
export function receiptDate(label: string) {
  const months: Record<string, number> = { janv: 0, févr: 1, mars: 2, avr: 3, mai: 4, juin: 5, juil: 6, août: 7, sept: 8, oct: 9, nov: 10, déc: 11 };
  const [day, month] = label.split(" · ")[0].split(" ");
  return new Date(2026, months[month.replace(".", "")] ?? 10, Number(day));
}

const iso = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export function PeriodPicker({ value, onChange }: { value: Period; onChange: (p: Period) => void }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={value.preset} onValueChange={(v) => onChange(presetPeriod(v as Preset, value))} items={PRESETS}>
        <SelectTrigger className="w-48 border-slate-200 bg-white">
          <CalendarIcon className="size-4 text-slate-500" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.preset === "perso" ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Input
            type="date"
            value={iso(value.from)}
            max={iso(value.to)}
            onChange={(e) => e.target.value && onChange({ ...value, from: new Date(`${e.target.value}T00:00`) })}
            className="w-40 border-slate-200 bg-white"
            aria-label="Du"
          />
          au
          <Input
            type="date"
            value={iso(value.to)}
            min={iso(value.from)}
            max={iso(TODAY)}
            onChange={(e) => e.target.value && onChange({ ...value, to: new Date(`${e.target.value}T00:00`) })}
            className="w-40 border-slate-200 bg-white"
            aria-label="Au"
          />
        </div>
      ) : (
        <span className="text-sm text-slate-500">{periodLabel(value)}</span>
      )}
    </div>
  );
}
