"use client";

import { useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { SendIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PARTNERS, PENDING_LOADS, type DelegatedFreight, type PartnerTruck } from "@/lib/partners";
import { usePartners } from "@/lib/partners-store";
import { fcfa, formatNumber } from "@/lib/utils";

/** Fenêtre « Déléguer un fret » : lot au port, partenaire, camion précis. Partagée par la liste et les fiches partenaires. */
export function DelegateDialog({
  open,
  onOpenChange,
  preset,
  partnerOnly,
}: {
  preset: PartnerTruck | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  /** Sur une fiche partenaire : le partenaire est déjà choisi. */
  partnerOnly?: string;
}) {
  const { trucks, delegate, nextFreightId: nextId } = usePartners();
  const [loadId, setLoadId] = useState<string | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [plate, setPlate] = useState<string | null>(null);
  const [lastPreset, setLastPreset] = useState<PartnerTruck | null>(null);
  if (open && partnerOnly && partnerId !== partnerOnly) setPartnerId(partnerOnly);
  if (open && preset !== lastPreset) {
    setLastPreset(preset);
    if (preset) {
      setPartnerId(preset.partnerId);
      setPlate(preset.plate);
    }
  }
  const load = PENDING_LOADS.find((l) => l.id === loadId);
  const partner = PARTNERS.find((p) => p.id === partnerId);
  const freeTrucks = trucks.filter((t) => t.partnerId === partnerId && t.status === "Disponible");
  const truck = freeTrucks.find((t) => t.plate === plate);
  const cost = load ? Math.round((load.price * 0.82) / 5000) * 5000 : 0;

  const submit = () => {
    if (!load || !partner || !truck) return;
    const [, route] = load.label.split(" · ");
    const [origin, destination] = route.split(" → ");
    const f: DelegatedFreight = {
      id: nextId,
      cargo: load.label.split(" · ")[0],
      origin,
      destination,
      partnerId: partner.id,
      plate: truck.plate,
      driver: truck.driver,
      clientPrice: load.price,
      partnerCost: cost,
      status: "Chargement",
      progress: 0,
      lastPing: "au port",
    };
    delegate(f);
    onOpenChange(false);
    toast.success("Fret délégué", { description: `${load.label.split(" · ")[0]} confié à ${partner.name}` });
    setLoadId(null);
    setPartnerId(null);
    setPlate(null);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-5 rounded-xl border border-slate-200 bg-white p-6 transition-all duration-150 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900">Déléguer un fret</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-slate-500">Confiez une marchandise en attente à un partenaire du réseau.</Dialog.Description>
            </div>
            <Dialog.Close render={<Button variant="ghost" size="icon-sm" />}>
              <XIcon className="size-4" />
              <span className="sr-only">Fermer</span>
            </Dialog.Close>
          </div>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Marchandise en attente
            <Select value={loadId} onValueChange={(v) => setLoadId(v as string)} items={PENDING_LOADS.map((l) => ({ value: l.id, label: l.label }))}>
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue placeholder="Choisir un lot au port" />
              </SelectTrigger>
              <SelectContent>
                {PENDING_LOADS.map((l) => (
                  <SelectItem key={l.id} value={l.id}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Partenaire
            <Select
              disabled={!!partnerOnly}
              value={partnerId}
              onValueChange={(v) => {
                setPartnerId(v as string);
                setPlate(null);
              }} items={PARTNERS.map((p) => ({ value: p.id, label: p.name }))}>
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue placeholder="Choisir un transporteur" />
              </SelectTrigger>
              <SelectContent>
                {PARTNERS.map((p) => (
                  <SelectItem key={p.id} value={p.id} disabled={!trucks.some((t) => t.partnerId === p.id && t.status === "Disponible")}>
                    {p.name} · {(() => {
                      const n = trucks.filter((t) => t.partnerId === p.id && t.status === "Disponible").length;
                      return n ? `${n} libre${n > 1 ? "s" : ""}` : "complet";
                    })()} · {p.onTime} %
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          {partner && (
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Camion
              <Select value={plate} onValueChange={(v) => setPlate(v as string)} items={freeTrucks.map((t) => ({ value: t.plate, label: `${t.plate} · ${t.body}` }))}>
                <SelectTrigger className="w-full border-slate-200 bg-white">
                  <SelectValue placeholder="Choisir un camion disponible" />
                </SelectTrigger>
                <SelectContent>
                  {freeTrucks.map((t) => (
                    <SelectItem key={t.plate} value={t.plate}>
                      {t.plate} · {t.body}, {t.capacityT} t · {t.driver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {truck && (
                <span className="text-xs font-normal text-slate-500">
                  {truck.location} · GPS {truck.gps}
                  {!truck.docsOk && <span className="font-medium text-amber-700"> · assurance à vérifier avant le départ</span>}
                </span>
              )}
            </label>
          )}

          {load && (
            <div className="grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
              <div>
                <div className="text-slate-500">Prix client</div>
                <div className="font-semibold tabular-nums text-slate-800">{formatNumber(load.price)}</div>
              </div>
              <div>
                <div className="text-slate-500">Coût partenaire</div>
                <div className="font-semibold tabular-nums text-slate-800">{formatNumber(cost)}</div>
              </div>
              <div>
                <div className="text-slate-500">Votre marge</div>
                <div className="font-semibold tabular-nums text-emerald-700">+{fcfa(load.price - cost)}</div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Dialog.Close render={<Button variant="outline" className="flex-1 border-slate-200 bg-white shadow-none" />}>Annuler</Dialog.Close>
            <Button className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" disabled={!load || !partner || !truck} onClick={submit}>
              <SendIcon className="size-4" />
              Déléguer
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
