"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building, Home, Users, Settings, FileText, LogOut, PanelLeft } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "../ui/button";
import { LogoutButton } from "../auth/logout-button";

export function AppSidebar() {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  
  const menuItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/dashboard/clients", label: "Clientes", icon: Users },
    { href: "/dashboard/reports", label: "Relatórios", icon: FileText },
    { href: "/dashboard/settings", label: "Configurações", icon: Settings },
  ];

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <Building className="w-8 h-8 text-primary" />
            <h1 className="text-xl font-semibold font-headline">AssistManager</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                  icon={<item.icon />}
                  tooltip={item.label}
                >
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <LogoutButton />
      </SidebarFooter>
    </>
  );
}

export function PageHeader() {
    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <div className="w-full flex-1">
                {/* Você pode adicionar um campo de pesquisa aqui se desejar */}
            </div>
        </header>
    )
}
