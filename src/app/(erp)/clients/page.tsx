import { ClientsClient } from "@/components/clients/clients-client";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Clients · Unico" };

export default function ClientsPage() {
  return (
    <>
      <SiteHeader title="Clients" />
      <ClientsClient />
    </>
  );
}
