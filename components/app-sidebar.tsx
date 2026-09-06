"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { useSelector } from "react-redux"
import {
  IconChartBar,
  IconDashboard,
  IconListDetails,
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
  IconIdBadge2,
  IconStar
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
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
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Validation restaurants",
      url: "/dashboard/validation",
      icon: IconChefHat,
    },
    {
      title: "Vérification livreurs",
      url: "/dashboard/livreurs/validation",
      icon: IconIdBadge2,
    },
    {
      title: "Performance livreurs",
      url: "/dashboard/livreurs/performance",
      icon: IconStar,
    },
    {
      title: "Tarification livraison",
      url: "/dashboard/tarification",
      icon: IconCoin,
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
      ],
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
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { admin } = useSelector((state: any) => state.adminAuth || {})
  const currentUser = { name: admin?.username || "Administrateur", email: admin?.email || "", avatar: "" }
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Image src="/brand/koursier-mark.png" alt="" width={24} height={24} />
                <span className="flex flex-col leading-tight"><span className="font-display text-base font-bold">Koursier</span><span className="text-[11px] text-muted-foreground">Administration</span></span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}
