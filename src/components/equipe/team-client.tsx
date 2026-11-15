"use client";

import { useState } from "react";
import { CheckIcon, LockIcon, ShieldCheckIcon, UserPlusIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PERMISSIONS, ROLES, useTeam, type Role } from "@/lib/team-store";
import { cn, initials } from "@/lib/utils";

const TABLE = "@container overflow-hidden rounded-xl border border-slate-200 bg-white";
const THEAD = "border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500";
const ROLE_ITEMS = ROLES.map((r) => ({ value: r.name, label: r.name }));

const STATUS_STYLE = {
  Actif: "bg-emerald-500/10 text-emerald-700",
  Invité: "bg-blue-500/10 text-blue-700",
  Suspendu: "bg-slate-500/10 text-slate-600",
};

function RoleSelect({ value, onChange, disabled }: { value: Role; onChange: (r: Role) => void; disabled?: boolean }) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Role)} items={ROLE_ITEMS} disabled={disabled}>
      <SelectTrigger className="w-52 border-slate-200 bg-white" onClick={(e) => e.stopPropagation()}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ROLES.map((r) => (
          <SelectItem key={r.name} value={r.name}>
            {r.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TeamClient() {
  const { members, me, setMe, matrix, togglePermission, can, invite, updateMember } = useTeam();
  const [view, setView] = useState<"membres" | "roles">("membres");
  const [inviting, setInviting] = useState(false);
  const manage = can("equipe.manage");

  return (
    <div className="@container/main flex flex-1 flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Équipe & accès</h1>
          <p className="mt-1 text-sm text-slate-500">Qui a accès à Unico, avec quel rôle, et ce que chaque rôle peut faire.</p>
        </div>
        <Button className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700" disabled={!manage} onClick={() => setInviting(true)}>
          <UserPlusIcon className="size-4" />
          Inviter un collaborateur
        </Button>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-sm sm:flex-row sm:items-center">
        <ShieldCheckIcon className="size-5 shrink-0 text-blue-600" />
        <div className="flex-1 text-slate-700">
          Connecté en tant que <span className="font-semibold text-slate-900">{me.name}</span> · {me.role}. Pour la démonstration, changez d&apos;utilisateur
          pour voir l&apos;application avec ses droits.
        </div>
        <Select value={me.id} onValueChange={(v) => setMe(v as string)} items={members.map((m) => ({ value: m.id, label: `${m.name} · ${m.role}` }))}>
          <SelectTrigger className="w-full border-slate-200 bg-white sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name} · {m.role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Tabs value={view} onValueChange={(v) => setView(v as "membres" | "roles")}>
        <TabsList>
          <TabsTrigger value="membres" className="gap-1.5">
            Collaborateurs <span className="text-xs text-muted-foreground tabular-nums">{members.length}</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-1.5">
            Rôles et permissions <span className="text-xs text-muted-foreground tabular-nums">{ROLES.length}</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {view === "membres" && (
        <div className={TABLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className={THEAD}>
                <tr>
                  <th className="px-4 py-3">Collaborateur</th>
                  <th className="px-4 py-3">Rôle</th>
                  <th className="hidden px-4 py-3 @3xl:table-cell">Dernière connexion</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="hidden px-4 py-3 @2xl:table-cell" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {members.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9">
                          <AvatarFallback className="bg-slate-100 font-medium text-slate-600">{initials(m.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold whitespace-nowrap text-slate-900">
                            {m.name}
                            {m.id === me.id && <span className="ml-1.5 text-xs font-normal text-slate-400">(vous)</span>}
                          </div>
                          <div className="text-xs whitespace-nowrap text-slate-500">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <RoleSelect
                        value={m.role}
                        disabled={!manage || m.id === me.id}
                        onChange={(role) => {
                          updateMember(m.id, { role });
                          toast.success("Rôle modifié", { description: `${m.name} est maintenant ${role}` });
                        }}
                      />
                    </td>
                    <td className="hidden px-4 py-3 whitespace-nowrap @3xl:table-cell">{m.lastSeen}</td>
                    <td className="px-4 py-3">
                      <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", STATUS_STYLE[m.status])}>{m.status}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-right @2xl:table-cell">
                      {manage && m.id !== me.id && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-slate-200 bg-white shadow-none"
                          onClick={() => {
                            const status = m.status === "Suspendu" ? "Actif" : "Suspendu";
                            updateMember(m.id, { status });
                            toast.success(status === "Suspendu" ? "Accès suspendu" : "Accès rétabli", { description: m.name });
                          }}
                        >
                          {m.status === "Suspendu" ? "Rétablir" : "Suspendre"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === "roles" && (
        <div className={TABLE}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className={THEAD}>
                <tr>
                  <th className="px-4 py-3">Permission</th>
                  {ROLES.map((r) => (
                    <th key={r.name} className="px-3 py-3 text-center normal-case" title={r.description}>
                      {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {PERMISSIONS.map((p) => (
                  <tr key={p.key}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 font-medium text-slate-800">
                        {p.label}
                        {p.sensitive && <LockIcon className="size-3.5 text-amber-600" aria-label="Donnée sensible" />}
                      </div>
                      <div className="text-xs text-slate-500">{p.module}</div>
                    </td>
                    {ROLES.map((r) => {
                      const on = matrix[r.name].includes(p.key);
                      const locked = r.name === "Administrateur" || !manage;
                      return (
                        <td key={r.name} className="px-3 py-3 text-center">
                          <button
                            type="button"
                            disabled={locked}
                            onClick={() => togglePermission(r.name, p.key)}
                            aria-label={`${p.label} pour ${r.name}`}
                            className={cn(
                              "inline-grid size-7 place-items-center rounded-md border transition-colors",
                              on ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-300",
                              !locked && "hover:border-blue-300",
                              locked && "cursor-default",
                            )}
                          >
                            {on ? <CheckIcon className="size-4" /> : <XIcon className="size-3.5" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <InviteSheet
        open={inviting}
        onClose={() => setInviting(false)}
        onInvite={(m) => {
          invite(m);
          toast.success("Invitation envoyée", { description: `${m.email} · ${m.role}` });
          setInviting(false);
        }}
      />
    </div>
  );
}

function InviteSheet({ open, onClose, onInvite }: { open: boolean; onClose: () => void; onInvite: (m: { name: string; email: string; phone: string; role: Role }) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<Role>("Exploitation");
  const ok = name.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full gap-0 p-0 data-[side=right]:sm:max-w-md">
        <SheetHeader className="border-b border-slate-200 p-6">
          <SheetTitle className="text-xl font-bold tracking-tight text-slate-900">Inviter un collaborateur</SheetTitle>
          <SheetDescription>Il reçoit un e-mail pour créer son mot de passe. Ses droits dépendent du rôle choisi.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Nom complet
            <Input value={name} onChange={(e) => setName(e.target.value)} className="border-slate-200 bg-white" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            E-mail
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="prenom.nom@unico.tg" className="border-slate-200 bg-white" />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
            Téléphone
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+228 90 00 00 00" className="border-slate-200 bg-white" />
          </label>
          <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
            Rôle
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.name}
                  type="button"
                  onClick={() => setRole(r.name)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition-colors",
                    role === r.name ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50",
                  )}
                >
                  <div className="font-medium text-slate-900">{r.name}</div>
                  <div className="text-xs font-normal text-slate-500">{r.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <SheetFooter className="border-t border-slate-200 p-4">
          <Button
            className="gap-2 bg-blue-600 text-white shadow-none hover:bg-blue-700"
            disabled={!ok}
            onClick={() => {
              onInvite({ name: name.trim(), email: email.trim(), phone: phone.trim(), role });
              setName("");
              setEmail("");
              setPhone("");
            }}
          >
            <UserPlusIcon className="size-4" />
            Envoyer l&apos;invitation
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
