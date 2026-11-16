"use client";

import { createContext, useContext, useMemo, useState } from "react";

import { DELEGATED, PARTNER_HISTORY, PARTNER_TRUCKS, type DelegatedFreight, type PartnerMission, type PartnerTruck } from "@/lib/partners";

type PartnersState = {
  freights: DelegatedFreight[];
  trucks: PartnerTruck[];
  history: PartnerMission[];
  nextFreightId: string;
  delegate: (f: DelegatedFreight) => void;
  settle: (missionId: string) => void;
};

const Ctx = createContext<PartnersState | null>(null);

/** Frets délégués, camions et historique des partenaires, partagés entre la liste et les fiches. */
export function PartnersProvider({ children }: { children: React.ReactNode }) {
  const [freights, setFreights] = useState(DELEGATED);
  const [trucks, setTrucks] = useState(PARTNER_TRUCKS);
  const [history, setHistory] = useState(PARTNER_HISTORY);

  const value = useMemo<PartnersState>(
    () => ({
      freights,
      trucks,
      history,
      nextFreightId: `FRT-${119 + freights.length - DELEGATED.length}`,
      delegate: (f) => {
        setFreights((prev) => [f, ...prev]);
        setTrucks((prev) =>
          prev.map((t) => (t.plate === f.plate ? { ...t, status: "Mission Unico", freightId: f.id, location: `Chargement au port, vers ${f.destination}`, freeOn: "25 nov" } : t)),
        );
      },
      settle: (id) => setHistory((prev) => prev.map((m) => (m.id === id ? { ...m, settlement: "Réglé" } : m))),
    }),
    [freights, trucks, history],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePartners() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePartners doit être utilisé dans PartnersProvider");
  return ctx;
}
