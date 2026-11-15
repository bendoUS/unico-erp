import { SiteHeader } from "@/components/site-header";
import { TeamClient } from "@/components/equipe/team-client";

export const metadata = { title: "Équipe & accès · Unico" };

export default function EquipePage() {
  return (
    <>
      <SiteHeader title="Équipe & accès" />
      <TeamClient />
    </>
  );
}
