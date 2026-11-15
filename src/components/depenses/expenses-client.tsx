"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertCircleIcon, CheckCheckIcon, ChevronRightIcon, CircleDashedIcon, DownloadIcon, FileWarningIcon, ReceiptIcon, SearchIcon, ShieldAlertIcon } from "lucide-react";
import { toast } from "sonner";

import { KPI_GRID, KpiCard } from "@/components/kpi-card";
import { ExpenseSheet, type ExpenseRow } from "@/components/depenses/expense-sheet";
import { CategoryIcon } from "@/components/expense-ui";
import { ReceiptBadge } from "@/components/trip-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CATEGORIES, type ReceiptStatus } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn, formatNumber } from "@/lib/utils";

type Filter = "Tous" | ReceiptStatus;
const FILTERS: { value: Filter; label: string }[] = [
  { value: "Tous", label: "Toutes" },
  { value: "en attente", label: "À vérifier" },
  { value: "sans reçu", label: "Sans reçu" },
  { value: "anomalie", label: "Anomalies" },
  { value: "validé", label: "Validées" },
];
const isFilter = (v: string | null): v is Filter => FILTERS.some((f) => f.value === v);

const MONTHS: Record<string, number> = { oct: 10, nov: 11 };
// « 13 nov · 05:48 » → nombre triable
function sortKey(date: string) {
  const m = date.match(/^(\d+) (\w+) · (\d+):(\d+)/);
  if (!m) return 0;
  return (MONTHS[m[2]] ?? 0) * 1e6 + Number(m[1]) * 1e4 + Number(m[3]) * 100 + Number(m[4]);
}

export function ExpensesClient() {
  const { trips, setExpenseStatus } = useTms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>(() => (isFilter(params.get("status")) ? (params.get("status") as Filter) : "Tous"));
  const [category, setCategory] = useState("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const s = params.get("status");
    if (isFilter(s)) setFilter(s);
  }, [params]);

  const all: ExpenseRow[] = useMemo(
    () =>
      trips
        .flatMap((trip) => trip.expenses.map((expense) => ({ expense, trip })))
        .sort((a, b) => sortKey(b.expense.date) - sortKey(a.expense.date)),
    [trips],
  );

  const selected = all.find((r) => r.expense.id === params.get("receipt")) ?? null;
  const openReceipt = (id: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (id) next.set("receipt", id);
    else next.delete("receipt");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const rows = all.filter(({ expense: x, trip }) => {
    if (filter !== "Tous" && x.status !== filter) return false;
    if (category !== "all" && x.category !== category) return false;
    const q = query.trim().toLowerCase();
    return !q || [x.label, x.location, trip.id, trip.driver, trip.plate].some((v) => v.toLowerCase().includes(q));
  });

  const sum = (list: ExpenseRow[]) => list.reduce((s, r) => s + r.expense.amount, 0);
  const by = (s: ReceiptStatus) => all.filter((r) => r.expense.status === s);
  const pending = by("en attente");
  const shownPending = rows.filter((r) => r.expense.status === "en attente");

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dépenses & reçus</h1>
          <p className="mt-1 text-sm text-slate-500">Toutes les dépenses envoyées par vos chauffeurs, avec leurs justificatifs.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-2 border-slate-200 bg-white shadow-none"
            onClick={() => toast.success("Export prêt", { description: `${rows.length} dépenses exportées en CSV.` })}
          >
            <DownloadIcon className="size-4" />
            Exporter
          </Button>
          <Button
            className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            disabled={shownPending.length === 0}
            onClick={() => {
              shownPending.forEach((r) => setExpenseStatus(r.expense.id, "validé"));
              toast.success(`${shownPending.length} dépense(s) validée(s)`, { description: `${formatNumber(sum(shownPending))} FCFA` });
            }}
          >
            <CheckCheckIcon className="size-4" />
            Valider les reçus à vérifier {shownPending.length > 0 && `(${shownPending.length})`}
          </Button>
        </div>
      </div>

      <div className={KPI_GRID}>
        <KpiCard icon={ReceiptIcon} title="Dépenses des voyages" value={formatNumber(sum(all))} unit="FCFA" color="blue" footer={`${all.length} reçus sur ${trips.length} voyages`} />
        <KpiCard icon={CircleDashedIcon} title="À vérifier" value={pending.length} color="violet" footer={`${formatNumber(sum(pending))} FCFA en attente de validation`} />
        <KpiCard
          icon={FileWarningIcon}
          title="Sans reçu"
          value={formatNumber(sum(by("sans reçu")))}
          unit="FCFA"
          color="amber"
          footer={`${by("sans reçu").length} dépenses déclarées sans justificatif`}
        />
        <KpiCard
          icon={ShieldAlertIcon}
          title="Anomalies"
          value={formatNumber(sum(by("anomalie")))}
          unit="FCFA"
          color="rose"
          badge={{ icon: AlertCircleIcon, label: `${by("anomalie").length} reçus suspects`, description: "carburant, entretien, reçus illisibles" }}
        />
      </div>

      <div className="flex flex-col gap-4 @4xl/main:flex-row @4xl/main:items-center">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            {FILTERS.map((f) => (
              <TabsTrigger key={f.value} value={f.value} className="gap-1.5">
                {f.label}
                <span className="text-xs text-muted-foreground tabular-nums">{f.value === "Tous" ? all.length : by(f.value).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-1 gap-3">
          <div className="relative flex-1">
            <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-500" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une dépense, un lieu, un chauffeur…" className="border-slate-200 bg-white pl-9" />
          </div>
          <Select value={category} onValueChange={(v) => setCategory((v as string) || "all")}>
            <SelectTrigger className="min-w-[170px] border-slate-200 bg-white">
              <SelectValue placeholder="Catégorie">{category === "all" ? "Toutes catégories" : category}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4">Dépense</th>
                <th className="hidden px-6 py-4 @3xl:table-cell">Voyage</th>
                <th className="hidden px-6 py-4 @4xl:table-cell">Chauffeur</th>
                <th className="px-6 py-4 text-right">Montant</th>
                <th className="px-6 py-4">Reçu</th>
                <th className="hidden w-12 px-6 py-4 @5xl:table-cell" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rows.map(({ expense: x, trip }) => (
                <tr key={x.id} onClick={() => openReceipt(x.id)} className={cn("cursor-pointer transition-colors hover:bg-slate-50/50", x.live && "bg-blue-50/40")}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <CategoryIcon category={x.category} />
                      <div className="flex min-w-0 flex-col">
                        <span className="flex items-center gap-1.5 font-semibold text-slate-900">
                          <span className="truncate">{x.label}</span>
                          {x.live && (
                            <Badge variant="secondary" className="h-4 rounded-full bg-blue-500/10 px-1.5 text-[9px] font-bold text-blue-600">
                              NOUVEAU
                            </Badge>
                          )}
                        </span>
                        <span className="truncate text-xs text-slate-500">
                          {x.location} · {x.date}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 @3xl:table-cell">
                    <div className="font-medium whitespace-nowrap text-slate-900">{trip.id}</div>
                    <div className="text-xs whitespace-nowrap text-slate-500">{trip.destination}</div>
                  </td>
                  <td className="hidden px-6 py-4 @4xl:table-cell">
                    <div className="whitespace-nowrap text-slate-900">{trip.driver}</div>
                    <div className="text-xs whitespace-nowrap text-slate-500">{trip.plate}</div>
                  </td>
                  <td className="px-6 py-4 text-right font-semibold whitespace-nowrap text-slate-900 tabular-nums">{formatNumber(x.amount)}</td>
                  <td className="px-6 py-4">
                    <ReceiptBadge status={x.status} />
                  </td>
                  <td className="hidden px-6 py-4 @5xl:table-cell">
                    <ChevronRightIcon className="size-4 text-slate-400" />
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    Aucune dépense ne correspond à votre recherche.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-3 text-sm">
          <span className="text-slate-500">{rows.length} dépenses affichées</span>
          <span className="font-semibold text-slate-900 tabular-nums">{formatNumber(sum(rows))} FCFA</span>
        </div>
      </div>

      <ExpenseSheet row={selected} onClose={() => openReceipt(null)} />
    </div>
  );
}
