import { notFound } from "next/navigation";

import { DriverProfile } from "@/components/chauffeurs/driver-profile";
import { SiteHeader } from "@/components/site-header";
import { DRIVERS } from "@/lib/data";

export function generateStaticParams() {
  return DRIVERS.map((d) => ({ plate: d.plate }));
}

export async function generateMetadata({ params }: { params: Promise<{ plate: string }> }) {
  const { plate } = await params;
  return { title: `${DRIVERS.find((d) => d.plate === decodeURIComponent(plate))?.name ?? "Chauffeur"} · Unico` };
}

export default async function DriverPage({ params }: { params: Promise<{ plate: string }> }) {
  const { plate } = await params;
  const driver = DRIVERS.find((d) => d.plate === decodeURIComponent(plate));
  if (!driver) notFound();
  return (
    <>
      <SiteHeader title="Fiche chauffeur" />
      <DriverProfile plate={driver.plate} />
    </>
  );
}
