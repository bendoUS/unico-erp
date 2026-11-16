import { PartnersClient } from "@/components/partenaires/partners-client";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Réseau Partenaires" };

export default function PartenairesPage() {
  return (
    <>
      <SiteHeader title="Réseau Partenaires" />
      <PartnersClient />
    </>
  );
}
