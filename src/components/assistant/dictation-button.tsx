"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Loader2Icon, MicIcon, SquareIcon, XIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Dictée (même interface que Schoolvi) : la voix est transcrite par la
// reconnaissance vocale du navigateur, en français, puis le texte est rendu
// à la zone de saisie sans être envoyé. 2 minutes au plus.

const MAX_SECONDS = 120;

type State = "idle" | "recording" | "transcribing";

interface RecognitionResult {
  isFinal: boolean;
  0: { transcript: string };
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<RecognitionResult> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const noSubscribe = () => () => {};
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export function DictationButton({ disabled, onText }: { disabled?: boolean; onText: (text: string) => void }) {
  // Reconnaissance vocale disponible dans ce navigateur (faux au rendu serveur).
  const supported = useSyncExternalStore(noSubscribe, () => getRecognition() !== null, () => false);
  const [state, setState] = useState<State>("idle");
  const [seconds, setSeconds] = useState(0);
  const recognition = useRef<Recognition | null>(null);
  const transcript = useRef("");
  const cancelled = useRef(false);
  const startedAt = useRef(0);

  // Minuteur et arrêt automatique à 2 minutes.
  useEffect(() => {
    if (state !== "recording") return;
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAt.current) / 1000);
      setSeconds(elapsed);
      if (elapsed >= MAX_SECONDS) stop();
    }, 250);
    return () => clearInterval(timer);
  }, [state]);

  // Micro libéré si le composant disparaît pendant l'enregistrement.
  useEffect(
    () => () => {
      cancelled.current = true;
      recognition.current?.abort();
    },
    [],
  );

  function stop() {
    if (!recognition.current) return;
    setState("transcribing");
    recognition.current.stop();
  }

  function start() {
    const Ctor = getRecognition();
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    transcript.current = "";
    cancelled.current = false;

    rec.onresult = (e) => {
      let finalText = "";
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
      }
      if (finalText) transcript.current = finalText;
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        cancelled.current = true;
        toast.error("Micro inaccessible", { description: "Autorisez le micro pour ce site dans votre navigateur, puis réessayez." });
      } else if (e.error !== "aborted" && e.error !== "no-speech") {
        toast.error("Dictée impossible", { description: "Réessayez ou tapez votre message." });
      }
    };
    rec.onend = () => {
      recognition.current = null;
      setState("idle");
      if (cancelled.current) return;
      const text = transcript.current.trim();
      if (!text) {
        toast.info("Je n'ai rien entendu", { description: "Parlez plus près du micro et réessayez." });
        return;
      }
      onText(text.charAt(0).toUpperCase() + text.slice(1));
    };

    recognition.current = rec;
    startedAt.current = Date.now();
    setSeconds(0);
    try {
      rec.start();
      setState("recording");
    } catch {
      toast.error("Dictée impossible", { description: "Réessayez dans un instant." });
    }
  }

  if (!supported) return null;

  if (state === "recording") {
    return (
      <div className="flex shrink-0 items-center gap-1">
        <span className="flex items-center gap-1.5 px-1 text-xs font-medium tabular-nums text-rose-600" aria-live="polite">
          <span className="size-2 animate-pulse rounded-full bg-rose-500" />
          {clock(seconds)}
        </span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={() => {
            cancelled.current = true;
            recognition.current?.abort();
          }}
          aria-label="Annuler la dictée"
          className="size-8 shrink-0 rounded-full text-slate-500"
        >
          <XIcon className="size-4" />
        </Button>
        <Button type="button" size="icon" onClick={stop} aria-label="Terminer la dictée" className="shrink-0 rounded-full bg-rose-600 text-white hover:bg-rose-700">
          <SquareIcon className="size-3.5 fill-current" />
        </Button>
      </div>
    );
  }

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      disabled={disabled || state === "transcribing"}
      onClick={start}
      aria-label={state === "transcribing" ? "Transcription en cours" : "Dicter un message"}
      title={state === "transcribing" ? "Transcription…" : "Dicter un message (2 minutes au plus)"}
      className={cn("shrink-0 rounded-full text-slate-500 hover:text-slate-900", state === "transcribing" && "text-blue-600")}
    >
      {state === "transcribing" ? <Loader2Icon className="size-4 animate-spin" /> : <MicIcon className="size-4" />}
    </Button>
  );
}
