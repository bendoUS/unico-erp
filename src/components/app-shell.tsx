"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { FleetProvider } from "@/lib/fleet-store";
import { PartnersProvider } from "@/lib/partners-store";
import { SalesProvider } from "@/lib/sales-store";
import { TeamProvider } from "@/lib/team-store";

/** Cadre de l'application : menu latéral, contenu, panneau de l'assistant. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TeamProvider>
    <FleetProvider>
    <SalesProvider>
    <PartnersProvider>
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset className="min-w-0">{children}</SidebarInset>
      <AssistantPanel />
    </SidebarProvider>
    </PartnersProvider>
    </SalesProvider>
    </FleetProvider>
    </TeamProvider>
  );
}
