"use client";

import { CalendarIcon, ChevronDownIcon, SparklesIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { MONTH_LABEL } from "@/lib/data";
import { useTms } from "@/lib/store";
import { cn } from "@/lib/utils";

// Bouton de l'en-tête qui ouvre ou ferme le panneau de l'assistant.
function AssistantTrigger() {
  const { assistantOpen, toggleAssistant, assistantUnread } = useTms();
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={toggleAssistant}
      aria-pressed={assistantOpen}
      title="Assistant (Ctrl+J)"
      className={cn(
        "relative gap-1.5 border-slate-200 bg-white shadow-none",
        assistantOpen && "border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100",
      )}
    >
      <SparklesIcon className="size-4 text-blue-600" />
      <span className="hidden sm:inline">Assistant</span>
      {!assistantOpen && assistantUnread > 0 && (
        <span className="absolute -top-1.5 -right-1.5 grid size-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
          {assistantUnread}
        </span>
      )}
    </Button>
  );
}

export function SiteHeader({ title }: { title: string }) {
  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 rounded-t-xl border-b bg-white">
      <div className="flex items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 h-4 data-vertical:self-auto" />
        <h1 className="text-base font-medium">{title}</h1>
      </div>
      <div className="flex items-center gap-2 px-4 lg:px-6">
        <AssistantTrigger />
        <Button variant="outline" size="sm" className="hidden gap-1.5 border-slate-200 bg-white shadow-none sm:inline-flex">
          <CalendarIcon className="size-4 text-slate-500" />
          {MONTH_LABEL}
          <ChevronDownIcon className="size-3.5 text-slate-400" />
        </Button>
      </div>
    </header>
  );
}
