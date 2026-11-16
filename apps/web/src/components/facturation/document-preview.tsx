import { TruckIcon } from "lucide-react";

import {
  COMPANY,
  VAT_RATE,
  clientByName,
  lineTotal,
  type Contract,
  type DocLine,
} from "@/lib/billing";
import { formatNumber } from "@/lib/utils";

export type DocKind = "facture" | "devis";

export type DraftDoc = {
  kind: DocKind;
  number: string;
  client: string;
  route: string;
  cargo: string;
  tripId?: string;
  date: string;
  dueLabel: string;
  lines: DocLine[];
  note: string;
};

function Paper({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 rounded-md border border-slate-200 bg-white p-8 text-[12px] leading-relaxed text-slate-700">
      {children}
    </div>
  );
}

function Letterhead({
  title,
  number,
  date,
}: {
  title: string;
  number: string;
  date: string;
}) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-white">
          <TruckIcon className="size-5" />
        </span>
        <div>
          <div className="text-sm font-semibold text-slate-900">
            {COMPANY.name}
          </div>
          <div className="text-slate-500">{COMPANY.address}</div>
          <div className="text-slate-500">
            {COMPANY.city} · {COMPANY.phone}
          </div>
          <div className="text-slate-500">
            {COMPANY.nif} · {COMPANY.rccm}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-semibold tracking-wide text-slate-900 uppercase">
          {title}
        </div>
        <div className="font-medium text-slate-700">{number}</div>
        <div className="text-slate-500">Lomé, le {date}</div>
      </div>
    </div>
  );
}

function ClientBlock({ name, label }: { name: string; label: string }) {
  const c = clientByName(name);
  return (
    <div className="ml-auto w-64 rounded-md bg-slate-50 p-3">
      <div className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
        {label}
      </div>
      <div className="font-semibold text-slate-900">{c.name}</div>
      <div>{c.address}</div>
      <div>{c.nif}</div>
      <div className="text-slate-500">À l&apos;attention de {c.contact}</div>
    </div>
  );
}

export function DocumentPreview({ doc }: { doc: DraftDoc }) {
  const ht = lineTotal(doc.lines);
  const vat = Math.round(ht * VAT_RATE);
  const isQuote = doc.kind === "devis";

  return (
    <Paper>
      <Letterhead
        title={isQuote ? "Devis" : "Facture"}
        number={doc.number}
        date={doc.date}
      />
      <ClientBlock
        name={doc.client}
        label={isQuote ? "Devis pour" : "Facturé à"}
      />

      <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-md border border-slate-200 p-3">
        <div>
          <span className="text-slate-400">Trajet : </span>
          {doc.route || "À préciser"}
        </div>
        <div>
          <span className="text-slate-400">Marchandise : </span>
          {doc.cargo || "À préciser"}
        </div>
        {doc.tripId && (
          <div>
            <span className="text-slate-400">Voyage : </span>
            {doc.tripId}
          </div>
        )}
        <div>
          <span className="text-slate-400">
            {isQuote ? "Valable jusqu'au : " : "Échéance : "}
          </span>
          {doc.dueLabel}
        </div>
      </div>

      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-300 text-left text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            <th className="py-2">Désignation</th>
            <th className="py-2 text-right">Qté</th>
            <th className="py-2 text-right">Prix unitaire</th>
            <th className="py-2 text-right">Montant HT</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {doc.lines.map((l, i) => (
            <tr key={i}>
              <td className="py-2 pr-4">{l.label || "Ligne sans libellé"}</td>
              <td className="py-2 text-right tabular-nums">{l.qty}</td>
              <td className="py-2 text-right tabular-nums">
                {formatNumber(l.unit)}
              </td>
              <td className="py-2 text-right font-medium tabular-nums text-slate-900">
                {formatNumber(l.qty * l.unit)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto flex w-64 flex-col gap-1 tabular-nums">
        <div className="flex justify-between">
          <span className="text-slate-500">Total HT</span>
          <span>{formatNumber(ht)} FCFA</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">TVA 18 %</span>
          <span>{formatNumber(vat)} FCFA</span>
        </div>
        <div className="mt-1 flex justify-between border-t border-slate-300 pt-2 text-sm font-semibold text-slate-900">
          <span>Total TTC</span>
          <span>{formatNumber(ht + vat)} FCFA</span>
        </div>
      </div>

      {doc.note && (
        <p className="rounded-md bg-slate-50 p-3 text-slate-600">{doc.note}</p>
      )}

      <div className="border-t border-slate-200 pt-3 text-[11px] text-slate-500">
        {isQuote ? (
          <>
            Devis valable 30 jours. Bon pour accord : date, cachet et signature
            du client.
          </>
        ) : (
          <>
            Paiement par virement, {COMPANY.bank}, en rappelant le numéro{" "}
            {doc.number}. Toute somme non réglée à l&apos;échéance entraîne des
            pénalités de retard.
          </>
        )}
      </div>
    </Paper>
  );
}

export function ContractPreview({ contract: c }: { contract: Contract }) {
  const client = clientByName(c.client);
  return (
    <Paper>
      <Letterhead title="Contrat" number={c.id} date={c.start} />
      <div className="text-center">
        <div className="text-sm font-semibold text-slate-900">
          Contrat cadre de transport routier de marchandises
        </div>
        <div className="text-slate-500">
          du {c.start} au {c.end}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <p>
          <span className="font-semibold text-slate-900">Entre</span>{" "}
          {COMPANY.name}, {COMPANY.address}, {COMPANY.nif}, ci-après « le
          Transporteur »,
        </p>
        <p>
          <span className="font-semibold text-slate-900">Et</span> {client.name}
          , {client.address}, {client.nif}, représentée par {client.contact},
          ci-après « le Client ».
        </p>
      </div>

      <Article n={1} title="Objet">
        Le Transporteur assure pour le Client l&apos;enlèvement au Port autonome
        de Lomé et l&apos;acheminement des marchandises jusqu&apos;aux
        destinations ci-dessous, ainsi que les formalités de transit associées.
      </Article>

      <Article n={2} title="Tarifs">
        <table className="mt-2 w-full">
          <thead>
            <tr className="border-b border-slate-300 text-left text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
              <th className="py-1.5">Trajet</th>
              <th className="py-1.5">Unité</th>
              <th className="py-1.5 text-right">Prix HT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {c.rates.map((r) => (
              <tr key={r.route + r.unit}>
                <td className="py-1.5">{r.route}</td>
                <td className="py-1.5">{r.unit}</td>
                <td className="py-1.5 text-right tabular-nums">
                  {formatNumber(r.price)} FCFA
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Article>

      <Article n={3} title="Commandes">
        Ce contrat est un contrat cadre : il couvre tous les transports de l&apos;année. Chaque envoi (un conteneur, un camion) fait l&apos;objet d&apos;un ordre de
        transport du Client, par e-mail ou par téléphone, au moins 48 heures avant l&apos;enlèvement. Aucun devis n&apos;est nécessaire pour les trajets listés à
        l&apos;article 2 ; les autres trajets font l&apos;objet d&apos;un devis séparé.
      </Article>

      <Article n={4} title="Volume et durée">
        Le Client s&apos;engage sur un minimum de {c.minTrips} voyages du {c.start} au {c.end}. Les tarifs sont fermes sur cette période, sauf variation du prix
        du gazole à la pompe supérieure à 10 %, auquel cas ils sont révisés par avenant.
      </Article>

      <Article n={5} title="Délais de livraison">
        À titre indicatif : Ouagadougou 3 à 4 jours, Niamey 4 à 5 jours, Bamako 6 à 8 jours après l&apos;enlèvement au port. Le Client suit ses camions en
        temps réel depuis son espace.
      </Article>

      <Article n={6} title="Facturation et paiement">
        Chaque voyage est facturé à la livraison, sur la base du bon de livraison signé. Les factures sont payables à {c.paymentDays} jours par virement
        ({COMPANY.bank}). Au-delà, des pénalités de 1 % par mois de retard s&apos;appliquent et le Transporteur peut suspendre les enlèvements.
      </Article>

      <Article n={7} title="Assurance et responsabilité">
        Le Transporteur assure les marchandises de l&apos;enlèvement à la livraison, dans la limite de 25 000 000 FCFA par camion. Les retards dus aux
        formalités douanières, aux contrôles aux frontières ou à un cas de force majeure ne lui sont pas imputables.
      </Article>

      <Article n={8} title="Résiliation et litiges">
        Chaque partie peut résilier le contrat avec un préavis de 60 jours par lettre recommandée. À défaut d&apos;accord amiable, tout litige relève du
        Tribunal de commerce de Lomé, selon l&apos;Acte uniforme OHADA relatif aux contrats de transport de marchandises par route.
      </Article>

      <div className="grid grid-cols-2 gap-6 pt-4">
        <Signature label="Pour le Transporteur" name="Direction Générale" />
        <Signature label="Pour le Client" name={client.contact} />
      </div>
    </Paper>
  );
}

function Article({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="font-semibold text-slate-900">
        Article {n}. {title}
      </div>
      <div>{children}</div>
    </div>
  );
}

function Signature({ label, name }: { label: string; name: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{name}</span>
      <div className="mt-2 h-14 rounded-md border border-dashed border-slate-300" />
    </div>
  );
}
