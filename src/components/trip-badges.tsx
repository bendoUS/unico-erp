import { CheckCircle2Icon, CircleDashedIcon, FileWarningIcon, ShieldAlertIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { DriverStatus, ReceiptStatus, TripStatus, TruckState } from "@/lib/data";
import { cn } from "@/lib/utils";

const TRIP_STATUS_STYLES: Record<TripStatus, string> = {
  "En chargement": "border-slate-200 bg-slate-50 text-slate-700",
  "En route": "border-blue-200 bg-blue-50 text-blue-700",
  Frontière: "border-amber-200 bg-amber-50 text-amber-700",
  Terminé: "border-emerald-200 bg-emerald-50 text-emerald-700",
};

export function TripStatusBadge({ status }: { status: TripStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", TRIP_STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}

const RECEIPT: Record<ReceiptStatus, { label: string; className: string; icon: React.ElementType }> = {
  validé: { label: "Validé", className: "border-emerald-200 bg-emerald-50 text-emerald-700", icon: CheckCircle2Icon },
  "en attente": { label: "À vérifier", className: "border-slate-200 bg-slate-50 text-slate-700", icon: CircleDashedIcon },
  "sans reçu": { label: "Sans reçu", className: "border-amber-200 bg-amber-50 text-amber-700", icon: FileWarningIcon },
  anomalie: { label: "Anomalie", className: "border-rose-200 bg-rose-50 text-rose-700", icon: ShieldAlertIcon },
};

export function ReceiptBadge({ status }: { status: ReceiptStatus }) {
  const r = RECEIPT[status];
  return (
    <Badge variant="outline" className={cn("font-medium", r.className)}>
      <r.icon />
      {r.label}
    </Badge>
  );
}

export function ProfitBadge({ margin }: { margin: number }) {
  return margin >= 0 ? (
    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 font-medium text-emerald-700">
      Rentable
    </Badge>
  ) : (
    <Badge variant="outline" className="border-rose-200 bg-rose-50 font-medium text-rose-700">
      Déficitaire
    </Badge>
  );
}

const TRUCK_STATE_STYLES: Record<TruckState, string> = {
  "En mission": "border-blue-200 bg-blue-50 text-blue-700",
  Disponible: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Atelier: "border-amber-200 bg-amber-50 text-amber-700",
};

export function TruckStateBadge({ state }: { state: TruckState }) {
  return (
    <Badge variant="outline" className={cn("font-medium", TRUCK_STATE_STYLES[state])}>
      {state}
    </Badge>
  );
}

const DRIVER_STATUS_STYLES: Record<DriverStatus, string> = {
  "En mission": "border-blue-200 bg-blue-50 text-blue-700",
  Disponible: "border-emerald-200 bg-emerald-50 text-emerald-700",
  Repos: "border-slate-200 bg-slate-50 text-slate-700",
};

export function DriverStatusBadge({ status }: { status: DriverStatus }) {
  return (
    <Badge variant="outline" className={cn("font-medium", DRIVER_STATUS_STYLES[status])}>
      {status}
    </Badge>
  );
}
