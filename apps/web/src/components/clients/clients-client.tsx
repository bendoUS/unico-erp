"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlarmClockIcon, BanknoteIcon, Building2Icon, ChevronRightIcon, PlusIcon, SearchIcon, TruckIcon } from "lucide-react";
import { toast } from "sonner";

import { clientStats } from "@/components/clients/client-stats";
import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CLIENTS } from "@/lib/billing";
import { useSales } from "@/lib/sales-store";
import { useTms } from "@/lib/store";
import { cn, formatNumber, initials } from "@/lib/utils";

export function ClientsClient() {
  const { trips } = useTms();
  const { invoices, contracts } = useSales();
  const router = useRouter();
  const [query, setQuery] = useState("");

  const all = CLIENTS.map((c) => ({ client: c, stats: clientStats(c, trips, invoices, contracts) }));
  const q = query.trim().toLowerCase();
  const rows = all.filter(({ client: c }) => !q || [c.name, c.city, c.contact, c.email].some((v) => v.toLowerCase().includes(q)));

  const active = all.reduce((s, r) => s + r.stats.active.length, 0);
  const billed = all.reduce((s, r) => s + r.stats.billed, 0);
  const unpaid = all.reduce((s, r) => s + r.stats.unpaid, 0);
  const lateClients = all.filter((r) => r.stats.late.length > 0);

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clients</h1>
          <p className="mt-1 text-sm text-slate-500">Voyages en cours, chiffre d&apos;affaires et impayés de chaque client.</p>
        </div>
        <Button
          className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
          onClick={() => toast.success("Nouveau client", { description: "Le formulaire de création arrive dans la prochaine version." })}
        >
          <PlusIcon className="size-4" />
          Ajouter un client
        </Button>
      </div>

      <div className={KPI_GRID}>
        <KpiCard icon={Building2Icon} title="Clients actifs" value={CLIENTS.length} color="blue" footer={`${all.filter((r) => r.stats.contract?.status === "Actif").length} sous contrat actif`} />
        <KpiCard icon={TruckIcon} title="Camions chez nos clients" value={active} color="amber" footer="Voyages en cours ou en chargement" />
        <KpiCard icon={BanknoteIcon} title="Facturé ce mois" value={formatNumber(billed)} unit="FCFA" color="emerald" footer="Tous voyages de novembre" />
        <KpiCard
          icon={AlarmClockIcon}
          title="Impayés"
          value={formatNumber(unpaid)}
          unit="FCFA"
          alert={lateClients.length > 0}
          footer={lateClients.length ? `En retard : ${lateClients.map((r) => r.client.name).join(", ")}` : "Aucun retard"}
        />
      </div>

      <div className="relative">
        <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
        <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un client, une ville, un contact…" className="border-slate-200 bg-white pl-9" />
      </div>

      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="hidden px-4 py-3 @3xl:table-cell">Contact</th>
                <th className="px-4 py-3 text-right">En cours</th>
                <th className="hidden px-4 py-3 text-right @2xl:table-cell">Facturé</th>
                <th className="px-4 py-3 text-right">Impayés</th>
                <th className="hidden px-4 py-3 @4xl:table-cell">Contrat</th>
                <th className="hidden w-10 px-4 py-3 @xl:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map(({ client: c, stats }) => (
                <tr key={c.slug} onClick={() => router.push(`/clients/${c.slug}`)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9 rounded-lg">
                        <AvatarFallback className="rounded-lg bg-slate-100 font-medium text-slate-600">{initials(c.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold whitespace-nowrap text-slate-900">{c.name}</div>
                        <div className="text-xs whitespace-nowrap text-slate-500">{c.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 @3xl:table-cell">
                    <div className="whitespace-nowrap text-slate-700">{c.contact}</div>
                    <div className="text-xs whitespace-nowrap text-slate-500">{c.email}</div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {stats.active.length > 0 ? (
                      <span className="font-semibold text-slate-800">
                        {stats.active.length} camion{stats.active.length > 1 ? "s" : ""}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Aucun</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-right tabular-nums @2xl:table-cell">{formatNumber(stats.billed)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    <div className={cn("font-semibold whitespace-nowrap", stats.unpaid ? (stats.late.length ? "text-rose-600" : "text-slate-800") : "text-slate-400")}>
                      {stats.unpaid ? formatNumber(stats.unpaid) : "0"}
                    </div>
                    {stats.late.length > 0 && <div className="text-xs whitespace-nowrap text-rose-600">{stats.late.length} en retard</div>}
                  </td>
                  <td className="hidden px-4 py-3 @4xl:table-cell">
                    {stats.contract ? (
                      <div className="text-xs whitespace-nowrap">
                        <div className="font-medium text-slate-700">{stats.contract.status}</div>
                        <div className="text-slate-500">jusqu&apos;au {stats.contract.end}</div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">Sans contrat</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 @xl:table-cell">
                    <ChevronRightIcon className="size-4 text-slate-400" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
