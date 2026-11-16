import { redirect } from "next/navigation";

/** L'ERP s'ouvre directement sur le tableau de bord. La présentation du produit vit dans apps/landing. */
export default function Home() {
  redirect("/app");
}
