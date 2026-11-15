"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRightIcon, CoinsIcon, HandshakeIcon, PhoneIcon, SendIcon, TruckIcon } from "lucide-react";
import { toast } from "sonner";

import { StatCard } from "@/components/dashboard/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DelegateDialog } from "@/components/partenaires/delegate-dialog";
import { GpsLive, reliabilityTone, STATUS_STYLE } from "@/components/partenaires/partner-ui";
import { PartnerTrucks } from "@/components/partenaires/partner-trucks";
import { DELEGATED, MONTH_COMMISSIONS, MONTH_DELEGATED, PARTNERS, partnerHref, type PartnerTruck } from "@/lib/partners";
import { usePartners } from "@/lib/partners-store";
import { cn, formatNumber } from "@/lib/utils";

type View = "frets" | "camions" | "annuaire";

export function PartnersClient() {
  const { freights, trucks } = usePartners();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("frets");
  const [truckPartner, setTruckPartner] = useState("tous");
  const [preset, setPreset] = useState<PartnerTruck | null>(null);

  const freeOf = (id: string) => trucks.filter((t) => t.partnerId === id && t.status === "Disponible").length;
  const available = trucks.filter((t) => t.status === "Disponible").length;
  const inProgress = freights.filter((f) => f.status !== "Livré");

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Réseau Partenaires</h1>
          <p className="mt-1 text-sm text-slate-500">Déléguez vos surplus à des transporteurs de confiance, gardez la marge et le suivi GPS.</p>
        </div>
        <Button className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" onClick={() => setOpen(true)}>
          <SendIcon className="size-4" />
          Déléguer un fret
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        <StatCard icon={HandshakeIcon} title="Missions déléguées ce mois" value={MONTH_DELEGATED + freights.length - DELEGATED.length} color="blue" footer={`${inProgress.length} en cours · ${freights.length - inProgress.length} livrées cette semaine`} />
        <StatCard icon={CoinsIcon} title="Commissions générées" value={formatNumber(MONTH_COMMISSIONS)} unit="FCFA" color="emerald" footer="Marge gardée sur les frets délégués" />
        <StatCard icon={TruckIcon} title="Camions partenaires au port" value={`${available} disponibles`} color="amber" footer={`Chez ${PARTNERS.filter((p) => freeOf(p.id) > 0).length} partenaires sur ${PARTNERS.length} · ${trucks.filter((t) => t.status === "Mission Unico").length} roulent pour vous`} />
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as View)}>
        <TabsList>
          <TabsTrigger value="frets" className="gap-1.5">
            Frets délégués
            <span className="text-xs text-muted-foreground tabular-nums">{freights.length}</span>
          </TabsTrigger>
          <TabsTrigger value="camions" className="gap-1.5">
            Camions partenaires
            <span className="text-xs text-muted-foreground tabular-nums">{trucks.length}</span>
          </TabsTrigger>
          <TabsTrigger value="annuaire" className="gap-1.5">
            Annuaire des sous-traitants
            <span className="text-xs text-muted-foreground tabular-nums">{PARTNERS.length}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "frets" && (
        <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Fret</th>
                  <th className="hidden px-4 py-3 @2xl:table-cell">Partenaire</th>
                  <th className="hidden px-4 py-3 text-right @4xl:table-cell">Prix client</th>
                  <th className="hidden px-4 py-3 text-right @4xl:table-cell">Coût partenaire</th>
                  <th className="px-4 py-3 text-right">Marge nette</th>
                  <th className="hidden px-4 py-3 @3xl:table-cell">Suivi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {freights.map((f) => {
                  const partner = PARTNERS.find((p) => p.id === f.partnerId)!;
                  const margin = f.clientPrice - f.partnerCost;
                  return (
                    <tr key={f.id} onClick={() => router.push(partnerHref(f.partnerId))} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold whitespace-nowrap text-slate-900">{f.id}</span>
                          <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", STATUS_STYLE[f.status])}>{f.status}</span>
                        </div>
                        <div className="text-xs whitespace-nowrap text-slate-500">
                          {f.origin} → {f.destination}
                        </div>
                        <div className="mt-1 @3xl:hidden">
                          <GpsLive freight={f} />
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 @2xl:table-cell">
                        <div className="font-medium whitespace-nowrap text-slate-800">{partner.name}</div>
                        <div className="text-xs whitespace-nowrap text-slate-500">
                          {f.plate} · {f.driver}
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-right tabular-nums @4xl:table-cell">{formatNumber(f.clientPrice)}</td>
                      <td className="hidden px-4 py-3 text-right tabular-nums @4xl:table-cell">{formatNumber(f.partnerCost)}</td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        <div className="font-semibold whitespace-nowrap text-emerald-700">+{formatNumber(margin)}</div>
                        <div className="text-xs text-slate-400">{Math.round((margin / f.clientPrice) * 100)} %</div>
                      </td>
                      <td className="hidden px-4 py-3 @3xl:table-cell">
                        <div className="flex flex-col gap-1.5">
                          <GpsLive freight={f} />
                          {f.status !== "Chargement" && (
                            <div className="h-1 w-32 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${f.progress * 100}%` }} />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "camions" && (
        <PartnerTrucks
          trucks={trucks}
          partnerId={truckPartner}
          onPartnerChange={setTruckPartner}
          onReserve={(t) => {
            setPreset(t);
            setOpen(true);
          }}
        />
      )}

      {view === "annuaire" && (
        <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Partenaire</th>
                  <th className="hidden px-4 py-3 @xl:table-cell">Flotte disponible</th>
                  <th className="px-4 py-3">Fiabilité</th>
                  <th className="px-4 py-3 text-right" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {PARTNERS.map((p) => (
                  <tr key={p.id} onClick={() => router.push(partnerHref(p.id))} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <Link href={partnerHref(p.id)} className="font-semibold whitespace-nowrap text-slate-900 hover:text-blue-700">
                        {p.name}
                      </Link>
                      <div className="text-xs whitespace-nowrap text-slate-500">
                        {p.city} · {p.trucks} camions · {p.contact}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 @xl:table-cell">
                      {freeOf(p.id) > 0 ? (
                        <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                          {freeOf(p.id)} libre{freeOf(p.id) > 1 ? "s" : ""} sur {p.trucks}
                        </Badge>
                      ) : (
                        <span className="text-xs text-slate-400">Complet</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("font-semibold tabular-nums", reliabilityTone(p.onTime))}>{p.onTime} %</span>
                      <span className="hidden text-xs text-slate-500 sm:inline"> à l&apos;heure</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5 border-slate-200 bg-white shadow-none"
                        onClick={(e) => (e.stopPropagation(), toast.success(`Appel vers ${p.name}`, { description: p.phone }))}
                      >
                        <PhoneIcon className="size-3.5" />
                        Contacter
                      </Button>
                      <ChevronRightIcon className="ml-2 hidden size-4 text-muted-foreground sm:inline" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <DelegateDialog
        open={open}
        preset={preset}
        onOpenChange={(o) => {
          setOpen(o);
          if (!o) setPreset(null);
        }}
      />
    </div>
  );
}
