"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2Icon,
  CircleHelpIcon,
  FileTextIcon,
  HandshakeIcon,
  LayoutDashboardIcon,
  RouteIcon,
  Settings2Icon,
  ShieldCheckIcon,
  TruckIcon,
  UsersIcon,
  WalletIcon,
  type LucideIcon,
} from "lucide-react";

import { SiteBrand } from "@/components/site-brand";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useTms } from "@/lib/store";
import { cn } from "@/lib/utils";

type NavItem = { title: string; href: string; icon: LucideIcon; count?: number };

const NAV_MAIN: NavItem[] = [
  { title: "Tableau de bord", href: "/app", icon: LayoutDashboardIcon },
  { title: "Voyages", href: "/voyages", icon: RouteIcon, count: 8 },
  { title: "Flotte & GPS", href: "/flotte", icon: TruckIcon },
  { title: "Chauffeurs", href: "/chauffeurs", icon: UsersIcon },
  { title: "Clients", href: "/clients", icon: Building2Icon },
  { title: "Dépenses & reçus", href: "/depenses", icon: WalletIcon },
];

const NAV_NETWORK: NavItem[] = [{ title: "Réseau Partenaires", href: "/partenaires", icon: HandshakeIcon }];

const NAV_OPS: NavItem[] = [
  { title: "Ventes", href: "/facturation", icon: FileTextIcon },
  { title: "Équipe & accès", href: "/equipe", icon: ShieldCheckIcon },
];

const NAV_SECONDARY: { title: string; icon: LucideIcon; href?: string }[] = [
  { title: "Paramètres", icon: Settings2Icon, href: "/parametres" },
  { title: "Aide", icon: CircleHelpIcon },
];

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}

function NavMain() {
  const pathname = usePathname();
  const activeIndex = NAV_MAIN.findIndex((item) => isActive(pathname, item.href));
  const limelightRef = React.useRef<HTMLLIElement>(null);
  const [isReady, setIsReady] = React.useState(false);
  // Le trait bleu se place après le chargement (position mesurée dans le navigateur).
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useLayoutEffect(() => {
    if (activeIndex < 0 || !limelightRef.current) return;
    const parent = limelightRef.current.parentElement;
    const items = parent?.querySelectorAll(':scope > [data-sidebar="menu-item"]');
    const activeItem = items?.[activeIndex] as HTMLElement | undefined;
    if (!activeItem) return;
    limelightRef.current.style.top = `${activeItem.offsetTop}px`;
    limelightRef.current.style.height = `${activeItem.offsetHeight}px`;
    if (!isReady) requestAnimationFrame(() => setIsReady(true));
  }, [activeIndex, isReady, mounted]);

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu className="relative gap-1">
          {mounted && activeIndex >= 0 && (
            <li
              aria-hidden
              ref={limelightRef}
              className={cn(
                "absolute left-[-8px] z-10 w-[3px] rounded-r-full bg-blue-600",
                isReady && "transition-[top,height] duration-300 ease-in-out",
              )}
              style={{ top: "-999px", height: "32px" }}
            >
              <div className="pointer-events-none absolute top-[-30%] left-[3px] h-[160%] w-24 bg-gradient-to-r from-blue-600/30 to-transparent [clip-path:polygon(0_25%,100%_0%,100%_100%,0_75%)]" />
            </li>
          )}
          {NAV_MAIN.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton tooltip={item.title} isActive={isActive(pathname, item.href)} render={<Link href={item.href} />}>
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
              {item.count && <SidebarMenuBadge>{item.count}</SidebarMenuBadge>}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SiteBrand />
      </SidebarHeader>
      <SidebarContent>
        <NavMain />
        <SidebarGroup>
          <SidebarGroupLabel>Opérations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_OPS.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive(pathname, item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Sous-traitance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {NAV_NETWORK.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} isActive={isActive(pathname, item.href)} render={<Link href={item.href} />}>
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_SECONDARY.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={!!item.href && isActive(pathname, item.href)}
                    render={item.href ? <Link href={item.href} /> : undefined}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <Avatar className="size-8 rounded-lg">
                <AvatarFallback className="rounded-lg">DG</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">Direction Générale</span>
                <span className="truncate text-xs text-foreground/70">Agence Port de Lomé</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
