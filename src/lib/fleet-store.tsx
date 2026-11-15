"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { TRUCKS, type Truck } from "@/lib/data";
import { truckDocuments } from "@/lib/truck-history";

/** Un document de camion, avec ses versions précédentes. */
export type StoredDocument = {
  id: string;
  name: string;
  reference: string;
  until: string | null;
  fileName: string | null;
  fileUrl: string | null; // fichier ajouté pendant la session (aperçu et téléchargement réels)
  fileType: string | null;
  addedOn: string;
  previous: StoredDocument[];
};

type FleetState = {
  trucks: Truck[];
  getTruck: (key: string) => Truck | undefined;
  updateTruck: (key: string, patch: Partial<Truck>) => void;
  addTruck: (truck: Truck) => void;
  documentsOf: (key: string) => StoredDocument[];
  saveDocument: (key: string, doc: Omit<StoredDocument, "id" | "previous">, replaceId?: string) => void;
};

const FleetContext = createContext<FleetState | null>(null);

function seedDocuments(truck: Truck): StoredDocument[] {
  return truckDocuments(truck).map((d, i) => ({
    id: `${truck.plate}-doc-${i}`,
    ...d,
    fileName: `${d.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${truck.plate}.pdf`,
    fileUrl: null,
    fileType: "application/pdf",
    addedOn: "1 sept. 2026",
    previous: [],
  }));
}

/**
 * Flotte modifiable pendant la session. Chaque camion garde sa clé d'origine
 * (la plaque à l'achat) même si la plaque affichée change.
 */
export function FleetProvider({ children }: { children: React.ReactNode }) {
  const [edits, setEdits] = useState<Record<string, Partial<Truck>>>({});
  const [added, setAdded] = useState<Truck[]>([]);
  const [docs, setDocs] = useState<Record<string, StoredDocument[]>>({});

  const trucks = useMemo(() => [...TRUCKS, ...added].map((t) => ({ ...t, ...edits[t.plate], key: t.plate }) as Truck & { key: string }), [edits, added]);

  const getTruck = useCallback((key: string) => trucks.find((t) => (t as Truck & { key: string }).key === key || t.plate === key), [trucks]);
  const updateTruck = useCallback((key: string, patch: Partial<Truck>) => setEdits((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } })), []);
  const addTruck = useCallback((truck: Truck) => setAdded((prev) => [...prev, truck]), []);

  const documentsOf = useCallback(
    (key: string) => {
      if (docs[key]) return docs[key];
      const t = [...TRUCKS, ...added].find((x) => x.plate === key);
      return t ? seedDocuments(t) : [];
    },
    [docs, added],
  );

  const saveDocument = useCallback(
    (key: string, doc: Omit<StoredDocument, "id" | "previous">, replaceId?: string) => {
      setDocs((prev) => {
        const t = [...TRUCKS, ...added].find((x) => x.plate === key);
        const list = prev[key] ?? (t ? seedDocuments(t) : []);
        const id = `${key}-doc-${Date.now()}`;
        if (replaceId) {
          return {
            ...prev,
            [key]: list.map((d) => (d.id === replaceId ? { ...doc, id, previous: [{ ...d, previous: [] }, ...d.previous] } : d)),
          };
        }
        return { ...prev, [key]: [...list, { ...doc, id, previous: [] }] };
      });
    },
    [added],
  );

  const value = useMemo(
    () => ({ trucks, getTruck, updateTruck, addTruck, documentsOf, saveDocument }),
    [trucks, getTruck, updateTruck, addTruck, documentsOf, saveDocument],
  );
  return <FleetContext.Provider value={value}>{children}</FleetContext.Provider>;
}

export function useFleet() {
  const ctx = useContext(FleetContext);
  if (!ctx) throw new Error("useFleet doit être utilisé dans FleetProvider");
  return ctx;
}

/** Clé stable d'un camion (sa plaque d'origine). */
export const truckKey = (t: Truck) => (t as Truck & { key?: string }).key ?? t.plate;
