import { Suspense } from "react";

import { DriversClient } from "@/components/chauffeurs/drivers-client";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Chauffeurs" };

export default function ChauffeursPage() {
  return (
    <>
      <SiteHeader title="Chauffeurs" />
      <Suspense>
        <DriversClient />
      </Suspense>
    </>
  );
}
