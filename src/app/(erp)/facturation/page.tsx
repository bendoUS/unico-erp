import { BillingClient } from "@/components/facturation/billing-client";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Ventes · Unico" };

export default function Page() {
  return (
    <>
      <SiteHeader title="Ventes" />
      <BillingClient />
    </>
  );
}
