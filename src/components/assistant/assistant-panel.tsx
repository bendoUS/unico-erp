"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpIcon, CheckIcon, Loader2Icon, PlusIcon, ShieldAlertIcon, SparklesIcon, TrendingUpIcon, XIcon } from "lucide-react";

import { DictationButton } from "@/components/assistant/dictation-button";
import { Button } from "@/components/ui/button";
import { useTms } from "@/lib/store";
import { cn } from "@/lib/utils";

const ICON_BUTTON =
  "flex size-8 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800";

/** Hauteur maximale du champ de saisie (px), au-delà il défile. */
const INPUT_MAX_HEIGHT = 160;

const SUGGESTIONS = [
  "Quel camion est le moins rentable ce mois-ci ?",
  "Résume les dépenses de Kossi",
  "Prévision de marge fin novembre",
];

type CardAction = { label: string; primary?: boolean; run: () => void };
type Card = { tone: "alert" | "insight"; title: string; body: React.ReactNode; actions: CardAction[]; done?: string };
type NewMessage = { role: "user"; text: string } | { role: "assistant"; text?: React.ReactNode; card?: Card };
type Message = NewMessage & { id: number };

function StatusLine({ label, spinning, done }: { label: string; spinning?: boolean; done?: boolean }) {
  return (
    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
      {spinning ? (
        <Loader2Icon className="size-3.5 shrink-0 animate-spin text-blue-500" />
      ) : done ? (
        <CheckIcon className="size-3.5 shrink-0 text-emerald-600" />
      ) : null}
      <span>{label}</span>
    </div>
  );
}

function CardBlock({ card, onAction }: { card: Card; onAction: (a: CardAction) => void }) {
  const alert = card.tone === "alert";
  const Icon = alert ? ShieldAlertIcon : TrendingUpIcon;
  return (
    <div className={cn("flex flex-col gap-3 rounded-xl border p-3", alert ? "border-rose-200 bg-rose-50/60" : "border-blue-200 bg-blue-50/60")}>
      <div className={cn("flex items-center gap-2 text-sm font-semibold", alert ? "text-rose-900" : "text-blue-900")}>
        <Icon className="size-4 shrink-0" />
        {card.title}
      </div>
      <p className="text-sm text-slate-800 [overflow-wrap:anywhere]">{card.body}</p>
      {card.done ? (
        <StatusLine done label={card.done} />
      ) : (
        <div className="flex flex-wrap justify-end gap-2">
          {card.actions.map((a) => (
            <Button
              key={a.label}
              type="button"
              size="sm"
              variant={a.primary ? "default" : "outline"}
              onClick={() => onAction(a)}
              className={cn(!a.primary && "bg-white", a.primary && alert && "bg-rose-600 text-white hover:bg-rose-700")}
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

// Panneau de l'assistant, à droite de toutes les pages (comme dans Schoolvi).
// Il reste monté quand on le ferme ou qu'on change de page : la conversation
// ne se perd pas.
export function AssistantPanel() {
  const { assistantOpen: open, setAssistantOpen, setAssistantUnread, blockAdvance, settings, settingsReady } = useTms();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [asked, setAsked] = useState(false);
  const idRef = useRef(0);
  const openRef = useRef(open);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    openRef.current = open;
  }, [open]);

  // Panneau ouvert à côté du contenu : la page s'adapte à la largeur qui lui
  // reste (voir les points de rupture dans globals.css).
  useEffect(() => {
    const root = document.documentElement;
    if (open) root.dataset.assistantPanel = "open";
    else delete root.dataset.assistantPanel;
    return () => {
      delete root.dataset.assistantPanel;
    };
  }, [open]);

  const push = useCallback(
    (m: NewMessage) => {
      // Numéro fixé tout de suite : React peut appliquer la mise à jour plus
      // tard, après un autre message, et deux messages auraient le même numéro.
      idRef.current += 1;
      const message = { ...m, id: idRef.current } as Message;
      setMessages((prev) => [...prev, message]);
      if (!openRef.current && m.role === "assistant") setAssistantUnread((u) => u + 1);
    },
    [setAssistantUnread],
  );

  const closeCard = useCallback((id: number, done: string) => {
    setMessages((prev) => prev.map((m) => (m.id === id && m.role === "assistant" && m.card ? { ...m, card: { ...m.card, done } } : m)));
  }, []);

  const answer = useCallback(
    (m: NewMessage, label = "L'assistant réfléchit…", delay = 1200) => {
      setThinking(label);
      window.setTimeout(() => {
        setThinking(null);
        push(m);
      }, delay);
    },
    [push],
  );

  // Au chargement : l'assistant présente l'audit de la semaine (selon les
  // réglages). Le panneau ne s'ouvre tout seul que si on l'a demandé dans
  // Paramètres ; sinon le bouton « Assistant » affiche le nombre de messages.
  useEffect(() => {
    if (!settingsReady || !settings.assistantBriefing) return;
    const timers: number[] = [];
    const at = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms));

    if (settings.assistantAutoOpen && window.matchMedia("(min-width: 1024px)").matches) at(700, () => setAssistantOpen(true));
    at(900, () => setThinking("Analyse des clôtures de la semaine…"));
    at(2000, () => {
      setThinking(null);
      push({ role: "assistant", text: <>👋 Bonjour, j&apos;ai terminé l&apos;analyse des clôtures de la semaine.</> });
    });
    at(2200, () => setThinking("Contrôle des reçus carburant…"));
    at(3600, () => {
      setThinking(null);
      const id = idRef.current + 1;
      push({
        role: "assistant",
        card: {
          tone: "alert",
          title: "Alerte rentabilité",
          body: (
            <>
              ⚠️ Le camion <strong className="font-semibold">TG-5521-A</strong> (chauffeur : Koffi) a consommé{" "}
              <strong className="font-semibold">15 % de carburant en plus</strong> que sa moyenne historique sur le trajet
              Lomé-Ouagadougou. Voulez-vous que je bloque sa prochaine avance sur frais de route ?
            </>
          ),
          actions: [
            {
              label: "Voir le voyage",
              run: () => router.push("/voyages?trip=VOY-2026-042"),
            },
            {
              label: "Bloquer l'avance",
              primary: true,
              run: () => {
                closeCard(id, "Avance bloquée");
                blockAdvance("TG-5521-A");
                push({ role: "user", text: "Oui, bloque son avance." });
                answer({
                  role: "assistant",
                  text: (
                    <>
                      ✅ C&apos;est fait. La prochaine avance de <strong className="font-semibold text-slate-900">Koffi Mensah</strong> est
                      suspendue jusqu&apos;à justification des 2 compléments carburant (204 000 FCFA). Le chef de parc a été prévenu.
                    </>
                  ),
                });
              },
            },
          ],
        },
      });
    });
    at(3800, () => setThinking("Lecture des positions GPS…"));
    at(5000, () => {
      setThinking(null);
      push({
        role: "assistant",
        card: {
          tone: "insight",
          title: "Optimisation",
          body: (
            <>
              📈 <strong className="font-semibold">3 camions</strong> sont actuellement en attente à la frontière de{" "}
              <strong className="font-semibold">Cinkassé</strong> depuis plus de 24 h. Le manque à gagner est estimé à{" "}
              <strong className="font-semibold">450 000 FCFA</strong>.
            </>
          ),
          actions: [{ label: "Voir les camions", primary: true, run: () => router.push("/voyages?status=Frontière") }],
        },
      });
    });
    return () => timers.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settingsReady]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, thinking, open]);

  // Le champ grandit avec le texte.
  useLayoutEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, INPUT_MAX_HEIGHT)}px`;
    el.style.overflowY = el.scrollHeight > INPUT_MAX_HEIGHT ? "auto" : "hidden";
  }, [draft]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || thinking) return;
    setAsked(true);
    setDraft("");
    push({ role: "user", text: value });
    answer({ role: "assistant", text: "Analyse de la requête en cours..." });
  };

  return (
    <aside
      aria-label="Assistant"
      className={cn(
        "fixed inset-0 z-50 flex min-w-0 flex-col bg-white lg:sticky lg:inset-auto lg:top-0 lg:z-auto lg:h-svh lg:w-[400px] lg:shrink-0 lg:border-l lg:border-slate-200",
        !open && "hidden lg:hidden",
      )}
    >
      <div className="flex h-12 shrink-0 items-center justify-between gap-2 border-b border-slate-200 px-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-blue-50 text-blue-600">
            <SparklesIcon className="size-4" />
          </span>
          <span className="truncate text-sm font-semibold text-slate-900">Assistant</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              setMessages([]);
              setAsked(false);
            }}
            className={ICON_BUTTON}
            aria-label="Nouvelle conversation"
            title="Nouvelle conversation"
          >
            <PlusIcon className="size-4" />
          </button>
          <button type="button" onClick={() => setAssistantOpen(false)} className={ICON_BUTTON} aria-label="Fermer l'assistant" title="Fermer (Ctrl+J)">
            <XIcon className="size-4" />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex w-full min-w-0 flex-col gap-5 px-4 py-4">
          {messages.length === 0 && !thinking && (
            <div className="flex flex-col gap-1 pt-2">
              <p className="text-lg font-semibold text-blue-600">Bonjour, Madame la Directrice</p>
              <p className="text-base font-semibold text-slate-900">Que puis-je faire pour vous ?</p>
              <p className="mt-1 text-sm text-slate-500">
                Je surveille les voyages, les reçus et le carburant, et je vous signale chaque fuite d&apos;argent.
              </p>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div key={m.id} className="flex w-full min-w-0 justify-end">
                <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm text-slate-900 [overflow-wrap:anywhere]">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={m.id} className="flex w-full min-w-0 flex-col gap-2">
                {m.text && <div className="min-w-0 text-sm leading-relaxed text-slate-700 [overflow-wrap:anywhere]">{m.text}</div>}
                {m.card && <CardBlock card={m.card} onAction={(a) => a.run()} />}
              </div>
            ),
          )}

          {thinking && <StatusLine spinning label={thinking} />}

          {!asked && messages.length > 0 && !thinking && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-left text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="shrink-0 px-4 pt-2 pb-4"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 focus-within:border-blue-300">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            rows={1}
            placeholder="Question, voyage, chauffeur…"
            className="min-h-9 min-w-0 flex-1 resize-none overflow-y-hidden bg-transparent px-2 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <DictationButton
            disabled={!!thinking}
            onText={(text) => {
              // Le texte dicté s'ajoute à ce qui est déjà tapé ; il n'est pas envoyé.
              setDraft((prev) => (prev.trim() ? `${prev.trimEnd()} ${text}` : text));
              inputRef.current?.focus();
            }}
          />
          <Button type="submit" size="icon" disabled={!draft.trim() || !!thinking} aria-label="Envoyer" className="shrink-0 rounded-full">
            <ArrowUpIcon className="size-4" />
          </Button>
        </div>
        <p className="mt-1.5 truncate px-2 text-center text-[11px] text-slate-400">Vous validez chaque action · l&apos;IA peut se tromper</p>
      </form>
    </aside>
  );
}
