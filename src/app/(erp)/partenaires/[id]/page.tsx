import { notFound } from "next/navigation";

import { PartnerProfile } from "@/components/partenaires/partner-profile";
import { SiteHeader } from "@/components/site-header";
import { PARTNERS, partnerById } from "@/lib/partners";

export function generateStaticParams() {
  return PARTNERS.map((p) => ({ id: p.id.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `${partnerById(id)?.name ?? "Partenaire"} · Unico` };
}

export default async function PartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const partner = partnerById(id);
  if (!partner) notFound();
  return (
    <>
      <SiteHeader title="Fiche partenaire" />
      <PartnerProfile id={partner.id} />
    </>
  );
}
