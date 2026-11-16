"use client";

import { BRAND } from "@erp/brand";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { KeyboardIcon, MapPinIcon, MonitorPlayIcon, PanelRightOpenIcon, ReceiptIcon, SparklesIcon, type LucideIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DEFAULT_SETTINGS, useTms, type Settings } from "@/lib/store";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "assistant", label: "Assistant IA", icon: SparklesIcon },
  { id: "demo", label: "Démonstration", icon: MonitorPlayIcon },
] as const;
type TabId = (typeof TABS)[number]["id"];

/** Interrupteur, même rendu que les réglages de Schoolvi. */
function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-3 focus-visible:ring-blue-500/30",
        checked ? "bg-emerald-600" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
          checked ? "translate-x-5" : "translate-x-0",
        )}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 size-5 shrink-0 text-slate-400" />
        <div>
          <div className="text-sm font-medium text-slate-900">{title}</div>
          <div className="text-xs text-slate-500">{description}</div>
        </div>
      </div>
      <Toggle checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">{children}</div>
    </section>
  );
}

export function SettingsView() {
  const { settings, updateSettings } = useTms();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const requested = params.get("onglet");
  const [tab, setTabState] = useState<TabId>(TABS.some((t) => t.id === requested) ? (requested as TabId) : "assistant");
  const setTab = (id: TabId) => {
    setTabState(id);
    router.replace(id === "assistant" ? pathname : `${pathname}?onglet=${id}`, { scroll: false });
  };

  const change = (patch: Partial<Settings>, message: string) => {
    updateSettings(patch);
    toast.success("Réglage enregistré", { description: message });
  };

  return (
    <div className="flex h-full flex-col bg-slate-50/50">
      <div className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row">
          <aside className="w-full shrink-0 md:w-64">
            <nav className="flex flex-col gap-1">
              {TABS.map((t) => {
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                      active ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    )}
                  >
                    <t.icon className={cn("size-4", active ? "text-blue-600" : "text-slate-400")} />
                    {t.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col gap-6">
            {tab === "assistant" && (
              <Section title="Assistant IA" description={`Comment l'assistant se présente quand vous ouvrez ${BRAND.name}.`}>
                <SettingRow
                  icon={PanelRightOpenIcon}
                  title="Ouvrir l'assistant au chargement"
                  description="Le panneau s'ouvre tout seul à droite de l'écran. Désactivé : il reste fermé, et le bouton « Assistant » de l'en-tête indique le nombre de nouveaux messages."
                  checked={settings.assistantAutoOpen}
                  onChange={(v) => change({ assistantAutoOpen: v }, v ? "L'assistant s'ouvrira au chargement." : "L'assistant restera fermé au chargement.")}
                />
                <SettingRow
                  icon={SparklesIcon}
                  title="Résumé de la semaine au démarrage"
                  description="L'assistant présente son audit (carburant, frontière) dès l'ouverture de l'application. Prend effet au prochain chargement."
                  checked={settings.assistantBriefing}
                  onChange={(v) => change({ assistantBriefing: v }, v ? "Le résumé sera présenté au prochain chargement." : "Plus de résumé au démarrage.")}
                />
                <div className="flex items-start gap-3 p-4">
                  <KeyboardIcon className="mt-0.5 size-5 shrink-0 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-slate-900">Raccourci clavier</div>
                    <div className="text-xs text-slate-500">
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono">Ctrl</kbd> +{" "}
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono">J</kbd> (ou{" "}
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono">⌘</kbd> +{" "}
                      <kbd className="rounded border border-slate-200 bg-slate-50 px-1 font-mono">J</kbd> sur Mac) ouvre et ferme l&apos;assistant depuis
                      n&apos;importe quelle page.
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {tab === "demo" && (
              <Section title="Démonstration" description={`Données simulées pour présenter ${BRAND.name}. À couper si vous voulez un écran immobile.`}>
                <SettingRow
                  icon={ReceiptIcon}
                  title="Reçus en direct"
                  description="Un chauffeur envoie un nouveau reçu toutes les 8 secondes : les dépenses et la marge bougent en temps réel."
                  checked={settings.liveReceipts}
                  onChange={(v) => change({ liveReceipts: v }, v ? "Les reçus arrivent de nouveau en direct." : "Les reçus en direct sont en pause.")}
                />
                <SettingRow
                  icon={MapPinIcon}
                  title="Camions en mouvement sur la carte"
                  description="Les camions en route avancent sur leur itinéraire (temps accéléré) dans Flotte & GPS."
                  checked={settings.liveGps}
                  onChange={(v) => change({ liveGps: v }, v ? "Les camions avancent de nouveau." : "Les camions sont à l'arrêt sur la carte.")}
                />
              </Section>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                className="border-slate-200 bg-white shadow-none"
                onClick={() => change(DEFAULT_SETTINGS, "Réglages par défaut rétablis.")}
              >
                Rétablir les réglages par défaut
              </Button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
