import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { TripsClient } from "@/components/voyages/trips-client";

export const metadata = { title: "Voyages · Unico" };

export default function VoyagesPage() {
  return (
    <>
      <SiteHeader title="Voyages" />
      <Suspense>
        <TripsClient />
      </Suspense>
    </>
  );
}
