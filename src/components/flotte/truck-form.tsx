"use client";

import { useState } from "react";
import { AlertTriangleIcon, LockIcon, SaveIcon, UnlockIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { DRIVERS, type Truck, type TruckState } from "@/lib/data";
import { useTeam } from "@/lib/team-store";

const STATES: TruckState[] = ["Disponible", "En mission", "Atelier"];
const PLATE_RE = /^[A-Z]{2}-\d{4}-[A-Z]{1,2}$/;

type Draft = { plate: string; model: string; year: string; driver: string; state: TruckState; reference: string; workshopReason: string };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      <span>
        {label} {hint && <span className="text-xs font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

/** Ajout (truck = null) ou modification d'un camion. La plaque est verrouillée par défaut. */
export function TruckForm({
  open,
  truck,
  takenPlates,
  onClose,
  onSave,
}: {
  open: boolean;
  truck: Truck | null;
  takenPlates: string[];
  onClose: () => void;
  onSave: (patch: Partial<Truck> & { plate: string }) => void;
}) {
  const { can } = useTeam();
  const creating = !truck;
  const [draft, setDraft] = useState<Draft | null>(null);
  const [unlocked, setUnlocked] = useState(false);
  const [openedFor, setOpenedFor] = useState<string | null>(null);

  const key = open ? (truck?.plate ?? "nouveau") : null;
  if (key !== openedFor) {
    setOpenedFor(key);
    setUnlocked(false);
    setDraft(
      truck
        ? { plate: truck.plate, model: truck.model, year: String(truck.year), driver: truck.driver, state: truck.state, reference: String(truck.reference), workshopReason: truck.workshopReason ?? "" }
        : { plate: "", model: "", year: "2024", driver: "", state: "Disponible", reference: "40", workshopReason: "" },
    );
  }
  if (!draft) return null;

  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });
  const plate = draft.plate.trim().toUpperCase();
  const plateEditable = creating || unlocked;
  const plateError = !PLATE_RE.test(plate) ? "Format attendu : TG-1234-A" : takenPlates.includes(plate) && plate !== truck?.plate ? "Cette plaque existe déjà dans la flotte" : null;
  const ok = !plateError && draft.model.trim() && Number(draft.year) > 1990 && Number(draft.reference) > 0;
  const canPlate = can("flotte.plate");

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b border-slate-200 p-6">
          <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">{creating ? "Ajouter un camion" : `Modifier ${truck.plate}`}</SheetTitle>
          <SheetDescription>{creating ? "Le camion apparaîtra dans la flotte, disponible au port." : "Les changements s'appliquent à toute l'application."}</SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <Field label="Plaque d'immatriculation">
            <div className="flex gap-2">
              <Input
                value={draft.plate}
                disabled={!plateEditable}
                onChange={(e) => set({ plate: e.target.value.toUpperCase() })}
                placeholder="TG-1234-A"
                aria-invalid={plateEditable && !!plateError}
                className="border-slate-200 bg-white font-medium tracking-wide"
              />
              {!creating && (
                <Button
                  type="button"
                  variant="outline"
                  className="gap-1.5 border-slate-200 bg-white shadow-none"
                  disabled={!canPlate}
                  onClick={() => {
                    if (unlocked) set({ plate: truck.plate });
                    setUnlocked(!unlocked);
                  }}
                >
                  {unlocked ? <LockIcon className="size-4" /> : <UnlockIcon className="size-4" />}
                  {unlocked ? "Annuler" : "Déverrouiller"}
                </Button>
              )}
            </div>
            {!creating && !canPlate && (
              <span className="flex items-center gap-1 text-xs font-normal text-slate-500">
                <LockIcon className="size-3" />
                Réservé aux rôles autorisés dans Équipe & accès.
              </span>
            )}
            {!creating && unlocked && (
              <span className="flex gap-1.5 rounded-lg bg-amber-500/10 p-2.5 text-xs font-normal text-amber-800">
                <AlertTriangleIcon className="size-4 shrink-0" />
                À ne modifier qu&apos;après un changement d&apos;immatriculation officiel. La nouvelle plaque remplacera l&apos;ancienne sur les voyages, la carte et les
                documents, et la modification sera tracée.
              </span>
            )}
            {plateEditable && plateError && draft.plate && <span className="text-xs font-normal text-rose-600">{plateError}</span>}
          </Field>

          <Field label="Modèle">
            <Input value={draft.model} onChange={(e) => set({ model: e.target.value })} placeholder="Mercedes Actros 3341" className="border-slate-200 bg-white" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Année">
              <Input type="number" value={draft.year} onChange={(e) => set({ year: e.target.value })} className="border-slate-200 bg-white" />
            </Field>
            <Field label="Conso. de référence" hint="L/100 km">
              <Input type="number" step="0.1" value={draft.reference} onChange={(e) => set({ reference: e.target.value })} className="border-slate-200 bg-white" />
            </Field>
          </div>
          <Field label="Chauffeur attitré">
            <Select
              value={draft.driver || "aucun"}
              onValueChange={(v) => set({ driver: v === "aucun" ? "" : (v as string) })}
              items={[{ value: "aucun", label: "Aucun pour l'instant" }, ...DRIVERS.map((d) => ({ value: d.name, label: d.name }))]}
            >
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aucun">Aucun pour l&apos;instant</SelectItem>
                {DRIVERS.map((d) => (
                  <SelectItem key={d.plate} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="État">
            <div className="inline-flex rounded-lg bg-muted p-[3px]">
              {STATES.map((s) => (
                <button
                  key={s}
                  type="button"
                  disabled={creating && s === "En mission"}
                  onClick={() => set({ state: s })}
                  className={`flex-1 rounded-md px-3 py-1 text-sm font-medium disabled:opacity-40 ${draft.state === s ? "bg-background text-foreground" : "text-muted-foreground"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Field>
          {draft.state === "Atelier" && (
            <Field label="Motif de l'immobilisation">
              <Input value={draft.workshopReason} onChange={(e) => set({ workshopReason: e.target.value })} placeholder="Ex. Boîte de vitesses" className="border-slate-200 bg-white" />
            </Field>
          )}
        </div>

        <SheetFooter className="border-t border-slate-200 p-4">
          <Button
            className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            disabled={!ok}
            onClick={() =>
              onSave({
                plate,
                model: draft.model.trim(),
                year: Number(draft.year),
                driver: draft.driver || "Non attribué",
                state: draft.state,
                reference: Number(draft.reference),
                workshopReason: draft.state === "Atelier" ? draft.workshopReason || "Immobilisé" : undefined,
              })
            }
          >
            <SaveIcon className="size-4" />
            {creating ? "Ajouter le camion" : "Enregistrer"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
