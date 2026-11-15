import { AppShell } from "@/components/app-shell";
import { TmsProvider } from "@/lib/store";

/** Partie application (démo ERP) : menu latéral, données partagées, assistant. */
export default function ErpLayout({ children }: { children: React.ReactNode }) {
  return (
    <TmsProvider>
      <AppShell>{children}</AppShell>
    </TmsProvider>
  );
}
