import { notFound } from "next/navigation";

import { ClientProfile } from "@/components/clients/client-profile";
import { SiteHeader } from "@/components/site-header";
import { CLIENTS, clientBySlug } from "@/lib/billing";

export function generateStaticParams() {
  return CLIENTS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${clientBySlug(slug)?.name ?? "Client"}` };
}

export default async function ClientPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const client = clientBySlug(slug);
  if (!client) notFound();
  return (
    <>
      <SiteHeader title="Fiche client" />
      <ClientProfile slug={client.slug} />
    </>
  );
}
