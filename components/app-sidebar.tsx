"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconMessage,
  IconMessage2Bolt,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconShoppingCart,
  IconBuildingStore,
  IconChefHat,
  IconCategory,
  IconPackage,
  IconGasStation,
  IconMotorbike,
  IconCoin,
  IconWallet,
  IconClock,
  IconBoxSeam
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Admin Novic",
    email: "contact@novic.dev",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Gestion",
      url: "#",
      icon: IconBuildingStore,
      items: [
        {
          title: "Restaurants",
          url: "/dashboard/restaurant",
          icon: IconBuildingStore,
        },
        {
          title: "Catégories",
          url: "/dashboard/categorie",
          icon: IconCategory,
        },
        {
          title: "Repas & Menu",
          url: "/dashboard/repas",
          icon: IconChefHat,
        },
        {
          title: "Stock",
          url: "/dashboard/stock",
          icon: IconBoxSeam,
        },
        {
          title: "Utilisateurs",
          url: "/dashboard/users",
          icon: IconUsers,
        },
        {
          title: "Horaires",
          url: "/dashboard/horaires",
          icon: IconClock,
        },
      ],
    },
    {
      title: "Commandes",
      url: "#",
      icon: IconShoppingCart,
      items: [
        {
          title: "Toutes les commandes",
          url: "/dashboard/commande",
          icon: IconListDetails,
        },
        {
          title: "Colis",
          url: "/dashboard/colis",
          icon: IconPackage,
        },
        {
          title: "Gaz",
          url: "/dashboard/gaz",
          icon: IconGasStation,
        },
      ],
    },
    {
      title: "Opérations",
      url: "#",
      icon: IconMotorbike,
      items: [
        {
          title: "Livreurs",
          url: "/dashboard/livreurs",
          icon: IconMotorbike,
        },
        {
          title: "Tarifs",
          url: "/dashboard/tarifs",
          icon: IconCoin,
        },
      ],
    },
    {
      title: "Finances",
      url: "#",
      icon: IconWallet,
      items: [
        {
          title: "Wallet Admin",
          url: "/dashboard/wallet",
          icon: IconWallet,
        },
        {
          title: "Wallet Livreurs",
          url: "/dashboard/wallet-livreurs",
          icon: IconMotorbike,
        },
      ],
    },
    {
      title: "Configuration",
      url: "/dashboard/configuration",
      icon: IconSettings,
    },
    {
      title: "Analytics",
      url: "/dashboard",
      icon: IconChartBar,
      items: [
        {
          title: "Vue d'ensemble",
          url: "/dashboard#commissions",
        },
        {
          title: "Commissions",
          url: "/dashboard#analytics",
        },
      ],
    },
  ],
  services: [
    {
      title: "Services de Livraison",
      icon: IconInnerShadowTop,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Livraison Repas",
          url: "/dashboard/commande",
          icon: IconChefHat,
        },
        {
          title: "Expédition Colis",
          url: "/dashboard/colis",
          icon: IconPackage,
        },
        {
          title: "Livraison Gaz",
          url: "/dashboard/gaz",
          icon: IconGasStation,
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Équipe",
      url: "/dashboard/team",
      icon: IconUsers,
    },
    {
      name: "Messages",
      url: "/dashboard/chat",
      icon: IconMessage2Bolt,
    },
    {
      name: "Rapports",
      url: "/dashboard/reports",
      icon: IconReport,
    },
    {
      name: "Statistiques",
      url: "/dashboard/analytics",
      icon: IconDatabase,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Koursier Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.services} title="Services" />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
