"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { IconExternalLink } from "@tabler/icons-react"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ModeToggle } from "./ui/mode-toggle"

const TITLES: Record<string, string> = {
  "/dashboard": "Vue d'ensemble",
  "/dashboard/validation": "Validation des restaurants",
  "/dashboard/tarification": "Tarification de la livraison",
  "/dashboard/restaurant": "Restaurants",
  "/dashboard/categorie": "Catégories",
  "/dashboard/repas": "Repas et menus",
  "/dashboard/users": "Utilisateurs",
  "/dashboard/horaires": "Horaires",
  "/dashboard/commande": "Commandes",
  "/dashboard/colis": "Colis",
  "/dashboard/gaz": "Gaz",
  "/dashboard/livreurs": "Livreurs",
  "/dashboard/tarifs": "Tarifs",
  "/dashboard/wallet": "Portefeuille",
}

export function SiteHeader() {
  const pathname = usePathname()
  const title = TITLES[pathname] ?? "Administration"
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-3 border-b px-4 lg:px-6">
      <SidebarTrigger className="-ml-1" />
      <h1 className="truncate font-display text-base font-bold">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Link href="/" target="_blank" className="hidden items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground sm:inline-flex">Voir le site <IconExternalLink className="h-3.5 w-3.5" /></Link>
        <ModeToggle />
      </div>
    </header>
  )
}
