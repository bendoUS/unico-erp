"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { LIVE_EXPENSE_POOL, MONTHLY, TRIPS, type Expense, type ReceiptStatus, type Trip } from "./data";

interface LiveTick {
  tripId: string;
  expense: Expense;
  at: number;
}

/** Réglages de l'application, gardés dans le navigateur. */
export interface Settings {
  assistantAutoOpen: boolean; // ouvrir le panneau de l'assistant au chargement
  assistantBriefing: boolean; // l'assistant présente l'audit de la semaine au démarrage
  liveReceipts: boolean; // reçus simulés qui arrivent en direct
  liveGps: boolean; // camions qui avancent sur la carte
}

export const DEFAULT_SETTINGS: Settings = {
  assistantAutoOpen: false,
  assistantBriefing: true,
  liveReceipts: true,
  liveGps: true,
};

const SETTINGS_KEY = "unico.settings";

interface TmsState {
  trips: Trip[];
  liveExpensesTotal: number; // dépenses ajoutées depuis l'ouverture de la démo
  lastTick: LiveTick | null;
  blockedAdvances: string[]; // plaques dont l'avance est bloquée par l'IA
  blockAdvance: (plate: string) => void;
  unblockAdvance: (plate: string) => void;
  setExpenseStatus: (expenseId: string, status: ReceiptStatus) => void;
  validateReceipts: (tripId: string) => void;
  assistantOpen: boolean;
  setAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;
  assistantUnread: number;
  setAssistantUnread: React.Dispatch<React.SetStateAction<number>>;
  monthlyExpenses: number;
  settings: Settings;
  settingsReady: boolean; // réglages relus depuis le navigateur
  updateSettings: (patch: Partial<Settings>) => void;
}

const TmsContext = createContext<TmsState | null>(null);

function nowLabel() {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `15 nov · ${hh}:${mm}`;
}

export function TmsProvider({ children }: { children: React.ReactNode }) {
  const [trips, setTrips] = useState<Trip[]>(TRIPS);
  const [liveExpensesTotal, setLiveExpensesTotal] = useState(0);
  const [lastTick, setLastTick] = useState<LiveTick | null>(null);
  const [blockedAdvances, setBlocked] = useState<string[]>([]);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantUnread, setAssistantUnread] = useState(0);
  const toggleAssistant = useCallback(() => setAssistantOpen((o) => !o), []);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [settingsReady, setSettingsReady] = useState(false);

  // Réglages relus après le chargement (le serveur ne connaît pas le navigateur).
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(SETTINGS_KEY);
      if (saved) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(saved) });
    } catch {
      // stockage indisponible (navigation privée) : réglages par défaut
    }
    setSettingsReady(true);
  }, []);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      try {
        window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      } catch {
        // stockage indisponible : le réglage vaut pour cette visite seulement
      }
      return next;
    });
  }, []);

  // Raccourci clavier Ctrl+J / Cmd+J, comme dans Schoolvi.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setAssistantOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (assistantOpen) setAssistantUnread(0);
  }, [assistantOpen]);
  const counter = useRef(9000);

  // Simulation temps réel : un chauffeur soumet un reçu toutes les ~8 s
  useEffect(() => {
    if (!settings.liveReceipts) return;
    const id = window.setInterval(() => {
      const enRoute = TRIPS.filter((t) => t.status === "En route");
      const target = enRoute[Math.floor(Math.random() * enRoute.length)];
      const template = LIVE_EXPENSE_POOL[Math.floor(Math.random() * LIVE_EXPENSE_POOL.length)];
      counter.current += 1;
      const expense: Expense = {
        ...template,
        id: `REC-${counter.current}`,
        date: nowLabel(),
        live: true,
      };
      setLiveExpensesTotal((v) => v + expense.amount);
      setLastTick({ tripId: target.id, expense, at: Date.now() });
      setTrips((current) =>
        current.map((t) =>
          t.id === target.id
            ? { ...t, expenses: [...t.expenses, expense], progress: Math.min(96, t.progress + 1) }
            : t,
        ),
      );
    }, 8000);
    return () => window.clearInterval(id);
  }, [settings.liveReceipts]);

  const blockAdvance = useCallback((plate: string) => {
    setBlocked((b) => (b.includes(plate) ? b : [...b, plate]));
  }, []);

  const unblockAdvance = useCallback((plate: string) => {
    setBlocked((b) => b.filter((p) => p !== plate));
  }, []);

  const setExpenseStatus = useCallback((expenseId: string, status: ReceiptStatus) => {
    setTrips((current) =>
      current.map((t) =>
        t.expenses.some((x) => x.id === expenseId)
          ? { ...t, expenses: t.expenses.map((x) => (x.id === expenseId ? { ...x, status } : x)) }
          : t,
      ),
    );
  }, []);

  const validateReceipts = useCallback((tripId: string) => {
    setTrips((current) =>
      current.map((t) =>
        t.id === tripId
          ? {
              ...t,
              expenses: t.expenses.map((x) => (x.status === "en attente" ? { ...x, status: "validé" } : x)),
            }
          : t,
      ),
    );
  }, []);

  const value = useMemo<TmsState>(
    () => ({
      trips,
      liveExpensesTotal,
      lastTick,
      blockedAdvances,
      blockAdvance,
      unblockAdvance,
      setExpenseStatus,
      validateReceipts,
      assistantOpen,
      setAssistantOpen,
      toggleAssistant,
      assistantUnread,
      setAssistantUnread,
      monthlyExpenses: MONTHLY.expenses + liveExpensesTotal,
      settings,
      settingsReady,
      updateSettings,
    }),
    [trips, liveExpensesTotal, lastTick, blockedAdvances, blockAdvance, unblockAdvance, setExpenseStatus, validateReceipts, assistantOpen, toggleAssistant, assistantUnread, settings, settingsReady, updateSettings],
  );

  return <TmsContext.Provider value={value}>{children}</TmsContext.Provider>;
}

export function useTms() {
  const ctx = useContext(TmsContext);
  if (!ctx) throw new Error("useTms doit être utilisé dans <TmsProvider>");
  return ctx;
}
