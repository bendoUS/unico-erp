import { Suspense } from "react";

import { TruckProfile } from "@/components/flotte/truck-profile";
import { SiteHeader } from "@/components/site-header";
import { TRUCKS } from "@/lib/data";

export function generateStaticParams() {
  return TRUCKS.map((t) => ({ plate: t.plate }));
}

export async function generateMetadata({ params }: { params: Promise<{ plate: string }> }) {
  const { plate } = await params;
  return { title: `${decodeURIComponent(plate)}` };
}

export default async function TruckPage({ params }: { params: Promise<{ plate: string }> }) {
  const { plate } = await params;
  return (
    <>
      <SiteHeader title="Fiche camion" />
      <Suspense>
        <TruckProfile plate={decodeURIComponent(plate)} />
      </Suspense>
    </>
  );
}
