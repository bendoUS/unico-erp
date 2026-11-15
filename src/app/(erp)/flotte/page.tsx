import { Suspense } from "react";

import { FleetClient } from "@/components/flotte/fleet-client";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Flotte & GPS · Unico" };

export default function FlottePage() {
  return (
    <>
      <SiteHeader title="Flotte & GPS" />
      <Suspense>
        <FleetClient />
      </Suspense>
    </>
  );
}
