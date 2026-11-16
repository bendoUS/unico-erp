import Link from "next/link";
import { TruckIcon } from "lucide-react";

import { BRAND } from "@erp/brand";

export function SiteBrand() {
  return (
    <Link href="/app" className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-sidebar-accent">
      <span className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white">
        <TruckIcon className="size-5" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-lg font-bold tracking-tight text-slate-900">{BRAND.name}</span>
        <span className="text-xs text-muted-foreground">Transport & transit</span>
      </span>
    </Link>
  );
}
