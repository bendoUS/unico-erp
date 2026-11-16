"use client";

import { useRef, useState } from "react";
import { DownloadIcon, EyeIcon, FileTextIcon, HistoryIcon, PlusIcon, RefreshCwIcon, UploadIcon } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { Truck } from "@/lib/data";
import { useFleet, type StoredDocument } from "@/lib/fleet-store";
import { downloadBlob, textPdf } from "@/lib/mini-pdf";
import { useTeam } from "@/lib/team-store";
import { daysUntil, documentState, frDate, TODAY } from "@/lib/truck-history";
import { cn } from "@/lib/utils";

const DOC_TYPES = ["Carte grise", "Assurance", "Visite technique", "Licence de transport", "Carnet TRIE (transit)", "Carte de transport CEDEAO", "Patente", "Autre"];

const STATE_STYLE = {
  valide: { label: "Valide", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  bientôt: { label: "Expire bientôt", className: "border-amber-200 bg-amber-50 text-amber-700" },
  expiré: { label: "Expiré", className: "border-rose-200 bg-rose-50 text-rose-700" },
};

const FR_MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

function download(doc: StoredDocument, truck: Truck) {
  if (doc.fileUrl) {
    const a = document.createElement("a");
    a.href = doc.fileUrl;
    a.download = doc.fileName ?? doc.name;
    a.click();
    return;
  }
  downloadBlob(
    textPdf([
      doc.name,
      `Vehicule : ${truck.plate} (${truck.model}, ${truck.year})`,
      `Reference : ${doc.reference}`,
      `Valable jusqu'au : ${doc.until ?? "sans limite"}`,
      `Titulaire : Unico Transport & Transit SARL, Lome`,
      `Copie numerique ajoutee le ${doc.addedOn}`,
    ]),
    doc.fileName ?? `${doc.name}.pdf`,
  );
}

export function TruckDocuments({ truck, truckKey }: { truck: Truck; truckKey: string }) {
  const { documentsOf, saveDocument } = useFleet();
  const { can } = useTeam();
  const docs = documentsOf(truckKey);
  const [preview, setPreview] = useState<StoredDocument | null>(null);
  const [editing, setEditing] = useState<{ replace?: StoredDocument } | null>(null);
  const allowed = can("flotte.documents");

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-500">Papiers du véhicule exigés aux contrôles et aux frontières. Ouvrez-les, téléchargez-les ou remplacez-les à leur renouvellement.</p>
        <Button size="sm" className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" disabled={!allowed} onClick={() => setEditing({})}>
          <PlusIcon className="size-4" />
          Ajouter un document
        </Button>
      </div>
      <div className="@container overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Document</th>
                <th className="px-4 py-3">Valable jusqu&apos;au</th>
                <th className="px-4 py-3">État</th>
                <th className="px-4 py-3 text-right" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {docs.map((d) => {
                const state = STATE_STYLE[documentState(d.until)];
                const left = d.until ? daysUntil(d.until) : null;
                return (
                  <tr key={d.id} onClick={() => setPreview(d)} className="cursor-pointer transition-colors hover:bg-slate-50/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-600">
                          <FileTextIcon className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900">{d.name}</div>
                          <div className="truncate text-xs text-slate-500">
                            {d.reference}
                            {d.previous.length > 0 && ` · ${d.previous.length} ancienne${d.previous.length > 1 ? "s" : ""} version${d.previous.length > 1 ? "s" : ""}`}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-slate-900">{d.until ?? "Sans limite"}</div>
                      {left !== null && left >= 0 && <div className="text-xs text-slate-500">dans {left} jours</div>}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={cn("font-medium", state.className)}>
                        {state.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon-sm" aria-label="Aperçu" onClick={() => setPreview(d)}>
                          <EyeIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="Télécharger" onClick={() => download(d, truck)}>
                          <DownloadIcon className="size-4" />
                        </Button>
                        <Button variant="ghost" size="icon-sm" aria-label="Remplacer" disabled={!allowed} onClick={() => setEditing({ replace: d })}>
                          <RefreshCwIcon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PreviewSheet doc={preview} truck={truck} onClose={() => setPreview(null)} onReplace={allowed ? (d) => (setPreview(null), setEditing({ replace: d })) : undefined} />
      <DocumentForm
        state={editing}
        onClose={() => setEditing(null)}
        onSave={(doc, replaceId) => {
          saveDocument(truckKey, doc, replaceId);
          toast.success(replaceId ? "Document remplacé" : "Document ajouté", { description: `${doc.name} · ${truck.plate}` });
          setEditing(null);
        }}
      />
    </div>
  );
}

function PreviewSheet({ doc, truck, onClose, onReplace }: { doc: StoredDocument | null; truck: Truck; onClose: () => void; onReplace?: (d: StoredDocument) => void }) {
  const [shown, setShown] = useState(doc);
  if (doc && doc !== shown) setShown(doc);
  const d = shown;
  return (
    <Sheet open={!!doc} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-2xl">
        {d && (
          <>
            <SheetHeader className="border-b border-slate-200 p-6">
              <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">{d.name}</SheetTitle>
              <SheetDescription>
                {truck.plate} · {d.reference} · ajouté le {d.addedOn}
              </SheetDescription>
            </SheetHeader>
            <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto bg-slate-50 p-6">
              {d.fileUrl && d.fileType?.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={d.fileUrl} alt={d.name} className="mx-auto max-h-[60vh] rounded-md border border-slate-200 bg-white object-contain" />
              ) : d.fileUrl && d.fileType === "application/pdf" ? (
                <iframe src={d.fileUrl} title={d.name} className="h-[60vh] w-full rounded-md border border-slate-200 bg-white" />
              ) : (
                <div className="mx-auto flex w-full max-w-md flex-col gap-4 rounded-md border border-slate-200 bg-white p-6 text-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <span className="text-xs font-semibold tracking-wide text-slate-400 uppercase">République togolaise</span>
                    <span className="text-xs text-slate-400">Copie numérique</span>
                  </div>
                  <div className="text-lg font-semibold text-slate-900">{d.name}</div>
                  <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
                    <dt className="text-slate-500">Véhicule</dt>
                    <dd className="font-medium text-slate-900">{truck.plate}</dd>
                    <dt className="text-slate-500">Modèle</dt>
                    <dd>
                      {truck.model} ({truck.year})
                    </dd>
                    <dt className="text-slate-500">Référence</dt>
                    <dd>{d.reference}</dd>
                    <dt className="text-slate-500">Titulaire</dt>
                    <dd>Unico Transport & Transit SARL</dd>
                    <dt className="text-slate-500">Validité</dt>
                    <dd>{d.until ? `jusqu'au ${d.until}` : "sans limite"}</dd>
                  </dl>
                </div>
              )}
              {d.previous.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <HistoryIcon className="size-4" />
                    Versions précédentes
                  </div>
                  <ul className="divide-y divide-slate-100 text-sm">
                    {d.previous.map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2 py-2">
                        <span>
                          {p.reference} <span className="text-slate-400">· valable jusqu&apos;au {p.until ?? "sans limite"}</span>
                        </span>
                        <Button variant="ghost" size="icon-sm" aria-label="Télécharger" onClick={() => download(p, truck)}>
                          <DownloadIcon className="size-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <SheetFooter className="flex-row gap-2 border-t border-slate-200 p-4">
              <Button variant="outline" className="flex-1 gap-2 border-slate-200 bg-white shadow-none" onClick={() => download(d, truck)}>
                <DownloadIcon className="size-4" />
                Télécharger
              </Button>
              {onReplace && (
                <Button className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" onClick={() => onReplace(d)}>
                  <RefreshCwIcon className="size-4" />
                  Remplacer par une nouvelle version
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DocumentForm({
  state,
  onClose,
  onSave,
}: {
  state: { replace?: StoredDocument } | null;
  onClose: () => void;
  onSave: (doc: Omit<StoredDocument, "id" | "previous">, replaceId?: string) => void;
}) {
  const replace = state?.replace;
  const [type, setType] = useState("Assurance");
  const [reference, setReference] = useState("");
  const [until, setUntil] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const key = state ? replace?.id ?? "new" : null;
  if (key !== lastKey) {
    setLastKey(key);
    setType(replace?.name ?? "Assurance");
    setReference("");
    setUntil("");
    setFile(null);
  }

  const today = TODAY;
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const ok = reference.trim() && file;

  return (
    <Sheet open={!!state} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b border-slate-200 p-6">
          <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">{replace ? `Remplacer : ${replace.name}` : "Ajouter un document"}</SheetTitle>
          <SheetDescription>{replace ? "L'ancienne version est conservée dans l'historique du document." : "Photo ou PDF du document original."}</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Type de document
            <Select value={type} onValueChange={(v) => setType(v as string)} disabled={!!replace} items={DOC_TYPES.map((t) => ({ value: t, label: t }))}>
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOC_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Numéro ou référence
            <Input value={reference} onChange={(e) => setReference(e.target.value)} placeholder={replace?.reference ?? "Ex. Police n° 552177"} className="border-slate-200 bg-white" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Valable jusqu&apos;au <span className="text-xs font-normal text-slate-400">laisser vide si sans limite</span>
            <Input type="date" min={minDate} value={until} onChange={(e) => setUntil(e.target.value)} className="border-slate-200 bg-white" />
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) setFile(f);
            }}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-6 text-center text-sm transition-colors",
              drag ? "border-blue-400 bg-blue-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100",
            )}
          >
            <UploadIcon className="size-5 text-slate-500" />
            {file ? (
              <span className="font-medium text-slate-900">{file.name}</span>
            ) : (
              <>
                <span className="font-medium text-slate-700">Glissez le fichier ici ou cliquez pour choisir</span>
                <span className="text-xs text-slate-500">Photo (JPG, PNG) ou PDF</span>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </div>
        </div>
        <SheetFooter className="border-t border-slate-200 p-4">
          <Button
            className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            disabled={!ok}
            onClick={() => {
              if (!file) return;
              const d = until ? new Date(`${until}T00:00`) : null;
              onSave(
                {
                  name: type,
                  reference: reference.trim(),
                  until: d ? `${d.getDate()} ${FR_MONTHS[d.getMonth()]} ${d.getFullYear()}` : null,
                  fileName: file.name,
                  fileUrl: URL.createObjectURL(file),
                  fileType: file.type,
                  addedOn: frDate(TODAY),
                },
                replace?.id,
              );
            }}
          >
            <UploadIcon className="size-4" />
            {replace ? "Enregistrer la nouvelle version" : "Ajouter le document"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
