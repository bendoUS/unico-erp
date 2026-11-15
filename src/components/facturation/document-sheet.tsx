"use client";

import { useState } from "react";
import {
  DownloadIcon,
  FileSignatureIcon,
  PlusIcon,
  RefreshCwIcon,
  SendIcon,
  Trash2Icon,
} from "lucide-react";
import { toast } from "sonner";

import {
  ContractPreview,
  DocumentPreview,
  type DraftDoc,
} from "@/components/facturation/document-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  CLIENTS,
  VAT_RATE,
  clientByName,
  lineTotal,
  type Contract,
} from "@/lib/billing";
import { formatNumber } from "@/lib/utils";

/** Échéances proposées, comptées depuis aujourd'hui (15 nov). */
export const DUE_OPTIONS = [
  { days: 15, label: "30 nov" },
  { days: 30, label: "15 déc" },
  { days: 45, label: "30 déc" },
  { days: 60, label: "14 janv." },
];

const SHEET_WIDE = "w-full gap-0 p-0 data-[side=right]:sm:max-w-6xl";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {children}
    </label>
  );
}

export function DocumentSheet({
  draft,
  readOnly,
  onClose,
  onSend,
}: {
  draft: DraftDoc | null;
  readOnly?: boolean;
  onClose: () => void;
  onSend: (doc: DraftDoc) => void;
}) {
  return (
    <Sheet open={!!draft} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className={SHEET_WIDE}>
        {draft && (
          <Editor
            key={draft.number}
            initial={draft}
            readOnly={readOnly}
            onSend={onSend}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}

function Editor({
  initial,
  readOnly,
  onSend,
}: {
  initial: DraftDoc;
  readOnly?: boolean;
  onSend: (doc: DraftDoc) => void;
}) {
  const [doc, setDoc] = useState(initial);
  const set = (patch: Partial<DraftDoc>) => setDoc((d) => ({ ...d, ...patch }));
  const setLine = (i: number, patch: Partial<DraftDoc["lines"][number]>) =>
    set({ lines: doc.lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  const isQuote = doc.kind === "devis";
  const ttc = Math.round(lineTotal(doc.lines) * (1 + VAT_RATE));
  const client = clientByName(doc.client);
  // Destinataire modifiable : par défaut l'e-mail du client, sinon une autre adresse saisie.
  const [to, setTo] = useState<string | null>(null);
  const [cc, setCc] = useState("");
  const recipient = to ?? client.email;
  const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  const ccList = cc.split(/[,;\s]+/).filter(Boolean);
  const canSend = emailOk(recipient) && ccList.every(emailOk);

  return (
    <>
      <SheetHeader className="border-b border-slate-200 p-6">
        <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">
          {readOnly
            ? `${isQuote ? "Devis" : "Facture"} ${doc.number}`
            : isQuote
              ? "Nouveau devis"
              : "Préparer la facture"}
        </SheetTitle>
        <SheetDescription>
          {readOnly
            ? `${doc.client} · document déjà envoyé`
            : "Modifiez à gauche, l'aperçu se met à jour à droite. Rien n'est envoyé avant votre validation."}
        </SheetDescription>
      </SheetHeader>

      <div className="grid min-h-0 flex-1 overflow-y-auto lg:grid-cols-[380px_1fr] lg:overflow-hidden">
        <div className="flex flex-col gap-4 border-slate-200 p-6 lg:overflow-y-auto lg:border-r">
          <Field label="Client">
            <Select
              disabled={readOnly}
              value={doc.client}
              onValueChange={(v) => set({ client: v as string })}
              items={CLIENTS.map((c) => ({ value: c.name, label: c.name }))}
            >
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLIENTS.map((c) => (
                  <SelectItem key={c.name} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Trajet">
            <Input
              disabled={readOnly}
              value={doc.route}
              onChange={(e) => set({ route: e.target.value })}
              className="border-slate-200 bg-white"
            />
          </Field>
          <Field label="Marchandise">
            <Input
              disabled={readOnly}
              value={doc.cargo}
              onChange={(e) => set({ cargo: e.target.value })}
              className="border-slate-200 bg-white"
            />
          </Field>
          <Field label={isQuote ? "Valable jusqu'au" : "Échéance de paiement"}>
            <Select
              disabled={readOnly}
              value={doc.dueLabel}
              onValueChange={(v) => set({ dueLabel: v as string })}
              items={DUE_OPTIONS.map((o) => ({
                value: o.label,
                label: `${o.label} (${o.days} jours)`,
              }))}
            >
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DUE_OPTIONS.map((o) => (
                  <SelectItem key={o.days} value={o.label}>
                    {o.label} ({o.days} jours)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-700">Lignes</span>
            {doc.lines.map((l, i) => (
              <div
                key={i}
                className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3"
              >
                <Input
                  disabled={readOnly}
                  value={l.label}
                  placeholder="Désignation"
                  onChange={(e) => setLine(i, { label: e.target.value })}
                  className="border-slate-200 bg-white"
                />
                <div className="flex items-center gap-2">
                  <Input
                    disabled={readOnly}
                    type="number"
                    min={1}
                    value={l.qty}
                    onChange={(e) =>
                      setLine(i, { qty: Number(e.target.value) || 0 })
                    }
                    className="w-16 border-slate-200 bg-white tabular-nums"
                    aria-label="Quantité"
                  />
                  <span className="text-xs text-slate-400">×</span>
                  <Input
                    disabled={readOnly}
                    type="number"
                    step={5000}
                    value={l.unit}
                    onChange={(e) =>
                      setLine(i, { unit: Number(e.target.value) || 0 })
                    }
                    className="flex-1 border-slate-200 bg-white tabular-nums"
                    aria-label="Prix unitaire"
                  />
                  {!readOnly && doc.lines.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() =>
                        set({ lines: doc.lines.filter((_, j) => j !== i) })
                      }
                      aria-label="Retirer la ligne"
                    >
                      <Trash2Icon className="size-4 text-slate-400" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {!readOnly && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 self-start border-slate-200 bg-white shadow-none"
                onClick={() =>
                  set({ lines: [...doc.lines, { label: "", qty: 1, unit: 0 }] })
                }
              >
                <PlusIcon className="size-3.5" />
                Ajouter une ligne
              </Button>
            )}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-3">
            <span className="text-sm font-medium text-slate-700">Envoi</span>
            <Field label="Destinataire">
              <Input
                type="email"
                value={recipient}
                onChange={(e) => setTo(e.target.value)}
                aria-invalid={!emailOk(recipient)}
                className="border-slate-200 bg-white"
              />
            </Field>
            {to !== null && to !== client.email && (
              <button type="button" onClick={() => setTo(null)} className="-mt-1 self-start text-xs font-medium text-blue-600 hover:underline">
                Revenir à {client.email}
              </button>
            )}
            <Field label="Copie (facultatif)">
              <Input
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                placeholder="compta@client.com, transit@client.com"
                aria-invalid={!ccList.every(emailOk)}
                className="border-slate-200 bg-white"
              />
            </Field>
          </div>

          <Field label="Note sur le document">
            <Textarea
              disabled={readOnly}
              value={doc.note}
              onChange={(e) => set({ note: e.target.value })}
              placeholder="Ex. Acompte de 30 % reçu le 10 nov."
              className="border-slate-200 bg-white"
            />
          </Field>
        </div>

        <div className="bg-slate-50 p-4 lg:overflow-y-auto lg:p-8">
          <DocumentPreview doc={doc} />
        </div>
      </div>

      <SheetFooter className="flex-col gap-3 border-t border-slate-200 p-4 sm:flex-row sm:items-center">
        <div className="text-sm text-slate-500 sm:flex-1">
          Total TTC{" "}
          <span className="font-semibold tabular-nums text-slate-900">
            {formatNumber(ttc)} FCFA
          </span>
          <span className="hidden sm:inline"> · envoi à {recipient}{ccList.length > 0 && ` (+${ccList.length} en copie)`}</span>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
            onClick={() =>
              toast.success("PDF téléchargé", {
                description: `${doc.number}.pdf`,
              })
            }
          >
            <DownloadIcon className="size-4" />
            PDF
          </Button>
          <Button
            className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            disabled={
              !readOnly &&
              (lineTotal(doc.lines) <= 0 ||
                doc.lines.some((l) => !l.label.trim()))
            }
            onClick={() => {
              onSend(doc);
              toast.success(
                readOnly
                  ? "Document renvoyé"
                  : isQuote
                    ? "Devis envoyé"
                    : "Facture envoyée",
                { description: `${doc.number} · ${client.email}` },
              );
            }}
          >
            <SendIcon className="size-4" />
            {readOnly ? "Renvoyer" : "Envoyer au client"}
          </Button>
        </div>
      </SheetFooter>
    </>
  );
}

export function ContractSheet({
  contract,
  onClose,
  onRenew,
}: {
  contract: Contract | null;
  onClose: () => void;
  onRenew: (c: Contract, email: string) => void;
}) {
  const [shown, setShown] = useState(contract);
  if (contract && contract !== shown) setShown(contract);
  const c = shown;
  const [to, setTo] = useState<{ id: string; email: string } | null>(null);
  const email = c && to?.id === c.id ? to.email : c ? clientByName(c.client).email : "";
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <Sheet open={!!contract} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-3xl">
        {c && (
          <>
            <SheetHeader className="border-b border-slate-200 p-6">
              <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">
                Contrat {c.client}
              </SheetTitle>
              <SheetDescription>
                {c.id} · du {c.start} au {c.end} · {c.tripsDone} voyages sur{" "}
                {c.minTrips} prévus
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-8">
              <ContractPreview contract={c} />
            </div>
            <div className="flex flex-col gap-1.5 border-t border-slate-200 px-4 pt-4 sm:flex-row sm:items-center sm:gap-3">
              <span className="text-sm font-medium whitespace-nowrap text-slate-700">Envoyer à</span>
              <Input type="email" value={email} onChange={(e) => setTo({ id: c.id, email: e.target.value })} aria-invalid={!emailOk} className="border-slate-200 bg-white" />
            </div>
            <SheetFooter className="flex-row gap-2 p-4">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
                onClick={() =>
                  toast.success("PDF téléchargé", {
                    description: `${c.id}.pdf`,
                  })
                }
              >
                <DownloadIcon className="size-4" />
                PDF
              </Button>
              {c.status === "Actif" ? (
                <Button
                  variant="outline"
                  className="flex-1 gap-2 border-slate-200 bg-white shadow-none"
                  disabled={!emailOk} onClick={() => onRenew(c, email)}
                >
                  <RefreshCwIcon className="size-4" />
                  Proposer un avenant
                </Button>
              ) : (
                <Button
                  className="flex-1 gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
                  disabled={!emailOk} onClick={() => onRenew(c, email)}
                >
                  <FileSignatureIcon className="size-4" />
                  Envoyer pour signature
                </Button>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
