"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangleIcon, SearchIcon, SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PARTNERS, partnerHref, type PartnerTruck, type PartnerTruckStatus } from "@/lib/partners";
import { cn } from "@/lib/utils";

export const TRUCK_STATUS_STYLE: Record<PartnerTruckStatus, string> = {
  Disponible: "bg-emerald-500/10 text-emerald-700",
  "Mission Unico": "bg-blue-500/10 text-blue-700",
  "Autre client": "bg-slate-500/10 text-slate-600",
  Atelier: "bg-amber-500/10 text-amber-700",
};

const STATUSES: ("Tous" | PartnerTruckStatus)[] = ["Tous", "Disponible", "Mission Unico", "Autre client", "Atelier"];
const PARTNER_ITEMS = [{ value: "tous", label: "Tous les partenaires" }, ...PARTNERS.map((p) => ({ value: p.id, label: p.name }))];

export function PartnerTrucks({
  trucks,
  partnerId,
  onPartnerChange,
  onReserve,
  locked = false,
}: {
  trucks: PartnerTruck[];
  partnerId: string;
  onPartnerChange?: (id: string) => void;
  onReserve: (t: PartnerTruck) => void;
  /** Sur une fiche partenaire : pas de choix du partenaire ni de colonne Partenaire. */
  locked?: boolean;
}) {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>(locked ? "Tous" : "Disponible");
  const [query, setQuery] = useState("");

  const scoped = trucks.filter((t) => partnerId === "tous" || t.partnerId === partnerId);
  const q = query.trim().toLowerCase();
  const rows = scoped
    .filter((t) => status === "Tous" || t.status === status)
    .filter((t) => !q || [t.plate, t.driver, t.body, t.location, t.model].some((v) => v.toLowerCase().includes(q)))
    .sort((a, b) => STATUSES.indexOf(a.status) - STATUSES.indexOf(b.status));
  const count = (s: (typeof STATUSES)[number]) => (s === "Tous" ? scoped.length : scoped.filter((t) => t.status === s).length);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 @3xl/main:flex-row @3xl/main:items-center">
        <div className="inline-flex flex-wrap rounded-lg bg-muted p-[3px]">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn("flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium text-muted-foreground", status === s && "bg-background text-foreground")}
            >
              {s}
              <span className="text-xs text-muted-foreground tabular-nums">{count(s)}</span>
            </button>
          ))}
        </div>
        {!locked && (
        <Select value={partnerId} onValueChange={(v) => onPartnerChange?.(v as string)} items={PARTNER_ITEMS}>
          <SelectTrigger className="w-full border-slate-200 bg-white @3xl/main:w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PARTNER_ITEMS.map((p) => (
              <SelectItem key={p.value} value={p.value}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        )}
        <div className="relative flex-1">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Plaque, chauffeur, type, position…" className="border-slate-200 bg-white pl-9" />
        </div>
      </div>

      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Camion</th>
                {!locked && <th className="hidden px-4 py-3 @2xl:table-cell">Partenaire</th>}
                <th className={cn("hidden px-4 py-3", locked ? "@4xl:table-cell" : "@6xl:table-cell")}>Type</th>
                <th className="hidden px-4 py-3 @3xl:table-cell">Position</th>
                <th className="px-4 py-3">Disponibilité</th>
                <th className="hidden px-4 py-3 text-right @xl:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Aucun camion dans cette liste.
                  </td>
                </tr>
              )}
              {rows.map((t) => {
                const partner = PARTNERS.find((p) => p.id === t.partnerId)!;
                return (
                  <tr key={t.plate} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="font-semibold whitespace-nowrap text-slate-900">{t.plate}</div>
                      <div className="text-xs whitespace-nowrap text-slate-500">
                        {t.body}, {t.capacityT} t · {t.driver}
                      </div>
                      {!t.docsOk && (
                        <div className="mt-0.5 flex items-center gap-1 text-xs font-medium text-amber-700">
                          <AlertTriangleIcon className="size-3" />
                          Assurance à vérifier
                        </div>
                      )}
                    </td>
                    {!locked && (
                      <td className="hidden px-4 py-3 @2xl:table-cell">
                        <Link href={partnerHref(partner.id)} className="font-medium whitespace-nowrap text-slate-800 hover:text-blue-700">
                          {partner.name}
                        </Link>
                        <div className="text-xs whitespace-nowrap text-slate-500">{partner.onTime} % à l&apos;heure</div>
                      </td>
                    )}
                    <td className={cn("hidden px-4 py-3", locked ? "@4xl:table-cell" : "@6xl:table-cell")}>
                      <div className="whitespace-nowrap text-slate-700">{t.body}</div>
                      <div className="text-xs text-slate-500">
                        {t.capacityT} t · {t.model}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 @3xl:table-cell">
                      <div className="whitespace-nowrap text-slate-700">{t.location}</div>
                      <div className="text-xs text-slate-500">{t.gps === "GPS en veille" ? t.gps : `GPS ${t.gps}`}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium whitespace-nowrap", TRUCK_STATUS_STYLE[t.status])}>
                        {t.status}
                      </span>
                      {t.freeOn && <div className="mt-1 text-xs whitespace-nowrap text-slate-500">{t.freightId ? `${t.freightId} · ` : ""}libre le {t.freeOn}</div>}
                    </td>
                    <td className="hidden px-4 py-3 text-right @xl:table-cell">
                      {t.status === "Disponible" && (
                        <Button size="sm" variant="outline" className="gap-1.5 border-slate-200 bg-white shadow-none" onClick={() => onReserve(t)}>
                          <SendIcon className="size-3.5" />
                          Confier
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
