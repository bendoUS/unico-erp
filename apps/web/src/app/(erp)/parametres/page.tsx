import { Suspense } from "react";

import { SettingsView } from "@/components/settings-view";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Paramètres" };

export default function ParametresPage() {
  return (
    <>
      <SiteHeader title="Paramètres" />
      <Suspense>
        <SettingsView />
      </Suspense>
    </>
  );
}
