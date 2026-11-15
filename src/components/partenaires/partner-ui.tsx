import type { DelegatedFreight, FreightStatus } from "@/lib/partners";

export const STATUS_STYLE: Record<FreightStatus, string> = {
  "En route": "bg-blue-500/10 text-blue-700",
  Frontière: "bg-amber-500/10 text-amber-700",
  Chargement: "bg-slate-500/10 text-slate-600",
  Livré: "bg-emerald-500/10 text-emerald-700",
};

export function reliabilityTone(v: number) {
  return v >= 95 ? "text-emerald-700" : v >= 90 ? "text-blue-700" : "text-amber-700";
}

/** Badge « God View » : le GPS du chauffeur partenaire remonte en direct. */
export function GpsLive({ freight }: { freight: DelegatedFreight }) {
  const live = freight.status === "En route" || freight.status === "Frontière";
  if (!live) return <span className="text-xs text-slate-400">{freight.lastPing}</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-emerald-700">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-500 opacity-75" />
        <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
      </span>
      GPS partenaire actif · {freight.lastPing}
    </span>
  );
}
