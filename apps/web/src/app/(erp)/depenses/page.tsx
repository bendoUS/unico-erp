import { Suspense } from "react";

import { ExpensesClient } from "@/components/depenses/expenses-client";
import { SiteHeader } from "@/components/site-header";

export const metadata = { title: "Dépenses & reçus" };

export default function DepensesPage() {
  return (
    <>
      <SiteHeader title="Dépenses & reçus" />
      <Suspense>
        <ExpensesClient />
      </Suspense>
    </>
  );
}
