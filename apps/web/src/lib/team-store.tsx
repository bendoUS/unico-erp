"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export type Role = "Administrateur" | "Gestionnaire de flotte" | "Exploitation" | "Comptable" | "Lecture seule";

export const ROLES: { name: Role; description: string }[] = [
  { name: "Administrateur", description: "Tous les droits, gère l'équipe et les données sensibles" },
  { name: "Gestionnaire de flotte", description: "Camions, chauffeurs, entretien et documents" },
  { name: "Exploitation", description: "Voyages, suivi GPS et sous-traitance au quotidien" },
  { name: "Comptable", description: "Dépenses, reçus, devis, contrats et factures" },
  { name: "Lecture seule", description: "Consulte tout, ne modifie rien" },
];

export type Permission =
  | "voyages.edit"
  | "flotte.edit"
  | "flotte.plate"
  | "flotte.documents"
  | "chauffeurs.edit"
  | "depenses.validate"
  | "ventes.edit"
  | "partenaires.edit"
  | "equipe.manage";

export const PERMISSIONS: { key: Permission; module: string; label: string; sensitive?: boolean }[] = [
  { key: "voyages.edit", module: "Voyages", label: "Créer et modifier les voyages" },
  { key: "flotte.edit", module: "Flotte", label: "Ajouter et modifier les camions" },
  { key: "flotte.plate", module: "Flotte", label: "Modifier une plaque d'immatriculation", sensitive: true },
  { key: "flotte.documents", module: "Flotte", label: "Ajouter et remplacer les documents des camions" },
  { key: "chauffeurs.edit", module: "Chauffeurs", label: "Gérer les chauffeurs et bloquer les avances" },
  { key: "depenses.validate", module: "Dépenses", label: "Valider les dépenses et signaler les anomalies" },
  { key: "ventes.edit", module: "Ventes", label: "Envoyer devis, contrats et factures, enregistrer les paiements" },
  { key: "partenaires.edit", module: "Sous-traitance", label: "Déléguer un fret à un partenaire" },
  { key: "equipe.manage", module: "Équipe", label: "Inviter des collaborateurs et changer les rôles", sensitive: true },
];

const DEFAULT_MATRIX: Record<Role, Permission[]> = {
  Administrateur: PERMISSIONS.map((p) => p.key),
  "Gestionnaire de flotte": ["flotte.edit", "flotte.documents", "chauffeurs.edit", "depenses.validate"],
  Exploitation: ["voyages.edit", "partenaires.edit", "chauffeurs.edit"],
  Comptable: ["depenses.validate", "ventes.edit"],
  "Lecture seule": [],
};

export type Member = { id: string; name: string; email: string; phone: string; role: Role; status: "Actif" | "Invité" | "Suspendu"; lastSeen: string };

const MEMBERS: Member[] = [
  { id: "m1", name: "Direction Générale", email: "direction@unico.tg", phone: "+228 90 00 11 22", role: "Administrateur", status: "Actif", lastSeen: "En ligne" },
  { id: "m2", name: "Kafui Amegavi", email: "k.amegavi@unico.tg", phone: "+228 91 45 33 10", role: "Gestionnaire de flotte", status: "Actif", lastSeen: "il y a 20 min" },
  { id: "m3", name: "Rachidatou Bello", email: "r.bello@unico.tg", phone: "+228 92 18 74 05", role: "Comptable", status: "Actif", lastSeen: "il y a 2 h" },
  { id: "m4", name: "Elom Kpeglo", email: "e.kpeglo@unico.tg", phone: "+228 93 60 27 81", role: "Exploitation", status: "Actif", lastSeen: "hier" },
  { id: "m5", name: "Sylvain Agbo", email: "s.agbo@unico.tg", phone: "+228 99 02 56 47", role: "Lecture seule", status: "Invité", lastSeen: "jamais" },
];

type TeamState = {
  members: Member[];
  me: Member;
  setMe: (id: string) => void;
  matrix: Record<Role, Permission[]>;
  togglePermission: (role: Role, p: Permission) => void;
  can: (p: Permission) => boolean;
  invite: (m: Omit<Member, "id" | "status" | "lastSeen">) => void;
  updateMember: (id: string, patch: Partial<Member>) => void;
};

const TeamContext = createContext<TeamState | null>(null);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [members, setMembers] = useState(MEMBERS);
  const [meId, setMe] = useState("m1");
  const [matrix, setMatrix] = useState(DEFAULT_MATRIX);
  const me = members.find((m) => m.id === meId) ?? members[0];

  const can = useCallback((p: Permission) => matrix[me.role].includes(p), [matrix, me.role]);
  const togglePermission = useCallback(
    (role: Role, p: Permission) =>
      setMatrix((prev) => ({ ...prev, [role]: prev[role].includes(p) ? prev[role].filter((x) => x !== p) : [...prev[role], p] })),
    [],
  );
  const invite = useCallback(
    (m: Omit<Member, "id" | "status" | "lastSeen">) => setMembers((prev) => [...prev, { ...m, id: `m${Date.now()}`, status: "Invité", lastSeen: "jamais" }]),
    [],
  );
  const updateMember = useCallback((id: string, patch: Partial<Member>) => setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m))), []);

  const value = useMemo(() => ({ members, me, setMe, matrix, togglePermission, can, invite, updateMember }), [members, me, matrix, togglePermission, can, invite, updateMember]);
  return <TeamContext.Provider value={value}>{children}</TeamContext.Provider>;
}

export function useTeam() {
  const ctx = useContext(TeamContext);
  if (!ctx) throw new Error("useTeam doit être utilisé dans TeamProvider");
  return ctx;
}
