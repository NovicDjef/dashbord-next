"use client"

import {
  IconDots,
  IconFolder,
  IconShare3,
  IconTrash,
  IconChevronRight,
  type Icon,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { memo, useCallback, useMemo } from "react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import * as Collapsible from "@radix-ui/react-collapsible"

// Composant mémorisé pour les sous-éléments des documents
const DocumentSubMenuItem = memo(function DocumentSubMenuItem({ 
  subItem, 
  isSubActive, 
  onNavigate 
}: { 
  subItem: { title: string; url: string; icon: Icon }, 
  isSubActive: boolean,
  onNavigate: (url: string) => void
}) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate(subItem.url)
  }, [subItem.url, onNavigate])

  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton asChild>
        <a 
          href={subItem.url}
          onClick={handleClick}
          className={
            isSubActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150"
              : "hover:bg-muted transition-all duration-150"
          }
        >
          <subItem.icon className="w-4 h-4" />
          <span>{subItem.title}</span>
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
})

// Composant mémorisé pour les documents avec sous-menu
const CollapsibleDocumentItem = memo(function CollapsibleDocumentItem({ 
  item, 
  itemTitle, 
  isActive, 
  pathname, 
  onNavigate 
}: { 
  item: { items: any[]; icon: Icon }, 
  itemTitle: string,
  isActive: boolean,
  pathname: string,
  onNavigate: (url: string) => void
}) {
  return (
    <Collapsible.Root key={itemTitle} defaultOpen={isActive}>
      <SidebarMenuItem>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton 
            className={
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150"
                : "hover:bg-muted transition-all duration-150"
            }
          >
            <item.icon className="w-4 h-4" />
            <span>{itemTitle}</span>
            <IconChevronRight className="ml-auto transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-[collapsible-up_150ms_ease-out] data-[state=open]:animate-[collapsible-down_150ms_ease-out]">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <DocumentSubMenuItem
                key={subItem.title}
                subItem={subItem}
                isSubActive={pathname === subItem.url}
                onNavigate={onNavigate}
              />
            ))}
          </SidebarMenuSub>
        </Collapsible.Content>
      </SidebarMenuItem>
    </Collapsible.Root>
  )
})

// Composant mémorisé pour les documents simples
const SimpleDocumentItem = memo(function SimpleDocumentItem({ 
  item, 
  itemTitle, 
  isActive, 
  onNavigate 
}: { 
  item: { url: string; icon: Icon }, 
  itemTitle: string,
  isActive: boolean,
  onNavigate: (url: string) => void
}) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate(item.url)
  }, [item.url, onNavigate])

  return (
    <SidebarMenuItem key={itemTitle}>
      <SidebarMenuButton asChild>
        <a 
          href={item.url}
          onClick={handleClick}
          className={
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150"
              : "hover:bg-muted transition-all duration-150"
          }
        >
          <item.icon className="w-4 h-4" />
          <span>{itemTitle}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})

export const NavDocuments = memo(function NavDocuments({
  items,
  title = "Documents"
}: {
  items: {
    name?: string
    title?: string
    url: string
    icon: Icon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon: Icon
    }[]
  }[]
  title?: string
}) {
  const { isMobile } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()

  // Navigation optimisée avec prefetch
  const handleNavigate = useCallback((url: string) => {
    // Prefetch immédiat pour une navigation plus rapide
    router.prefetch(url)
    // Navigation instantanée
    router.push(url)
  }, [router])

  // Calculer les états actifs et titres une seule fois
  const processedItems = useMemo(() => {
    return items.map(item => ({
      ...item,
      itemTitle: item.name || item.title || "",
      isActive: pathname === item.url || (item.items && item.items.some(subItem => pathname === subItem.url))
    }))
  }, [items, pathname])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{title}</SidebarGroupLabel>
      <SidebarMenu>
        {processedItems.map((item) => {
          if (item.items) {
            return (
              <CollapsibleDocumentItem
                key={item.itemTitle}
                item={item}
                itemTitle={item.itemTitle}
                isActive={item.isActive}
                pathname={pathname}
                onNavigate={handleNavigate}
              />
            )
          }
          
          return (
            <SimpleDocumentItem
              key={item.itemTitle}
              item={item}
              itemTitle={item.itemTitle}
              isActive={item.isActive}
              onNavigate={handleNavigate}
            />
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
})
