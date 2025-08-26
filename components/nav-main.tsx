"use client"

import { IconCirclePlusFilled, IconMail, IconChevronRight, type Icon } from "@tabler/icons-react"
import Link from "next/link"
import { useState, memo, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import * as Collapsible from "@radix-ui/react-collapsible"
import { usePathname, useRouter } from "next/navigation"

// Composant mémorisé pour les sous-éléments
const SubMenuItem = memo(function SubMenuItem({ 
  subItem, 
  isSubActive, 
  onNavigate 
}: { 
  subItem: { title: string; url: string; icon?: Icon }, 
  isSubActive: boolean,
  onNavigate: (url: string) => void
}) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate(subItem.url)
  }, [subItem.url, onNavigate])

  return (
    <SidebarMenuSubItem>
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
          {subItem.icon && <subItem.icon className="w-4 h-4" />}
          <span>{subItem.title}</span>
        </a>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  )
})

// Composant mémorisé pour les éléments avec sous-menu
const CollapsibleMenuItem = memo(function CollapsibleMenuItem({ 
  item, 
  isActive, 
  pathname, 
  onNavigate 
}: { 
  item: { title: string; url: string; icon?: Icon; items: any[] }, 
  isActive: boolean,
  pathname: string,
  onNavigate: (url: string) => void
}) {
  return (
    <Collapsible.Root key={item.title} defaultOpen={isActive}>
      <SidebarMenuItem>
        <Collapsible.Trigger asChild>
          <SidebarMenuButton 
            tooltip={item.title}
            className={
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-150"
                : "hover:bg-muted transition-all duration-150"
            }
          >
            {item.icon && <item.icon className="w-4 h-4" />}
            <span>{item.title}</span>
            <IconChevronRight className="ml-auto transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </Collapsible.Trigger>
        <Collapsible.Content className="overflow-hidden data-[state=closed]:animate-[collapsible-up_150ms_ease-out] data-[state=open]:animate-[collapsible-down_150ms_ease-out]">
          <SidebarMenuSub>
            {item.items.map((subItem) => (
              <SubMenuItem
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

// Composant mémorisé pour les éléments simples
const SimpleMenuItem = memo(function SimpleMenuItem({ 
  item, 
  isActive, 
  onNavigate 
}: { 
  item: { title: string; url: string; icon?: Icon }, 
  isActive: boolean,
  onNavigate: (url: string) => void
}) {
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    onNavigate(item.url)
  }, [item.url, onNavigate])

  return (
    <SidebarMenuItem key={item.title}>
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
          {item.icon && <item.icon className="w-4 h-4" />}
          <span>{item.title}</span>
        </a>
      </SidebarMenuButton>
    </SidebarMenuItem>
  )
})

// Mémoriser le composant principal pour éviter les re-renders inutiles
const NavMain = memo(function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: Icon
    items?: {
      title: string
      url: string
      icon?: Icon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Navigation optimisée avec prefetch
  const handleNavigate = useCallback((url: string) => {
    // Prefetch immédiat pour une navigation plus rapide
    router.prefetch(url)
    // Navigation instantanée
    router.push(url)
  }, [router])

  // Calculer les états actifs une seule fois
  const itemsWithActiveState = useMemo(() => {
    return items.map(item => ({
      ...item,
      isActive: pathname === item.url || (item.items && item.items.some(subItem => pathname === subItem.url))
    }))
  }, [items, pathname])
  
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        <SidebarMenu>
          {itemsWithActiveState.map((item) => {
            if (item.items) {
              return (
                <CollapsibleMenuItem
                  key={item.title}
                  item={item}
                  isActive={item.isActive}
                  pathname={pathname}
                  onNavigate={handleNavigate}
                />
              )
            }
            
            return (
              <SimpleMenuItem
                key={item.title}
                item={item}
                isActive={item.isActive}
                onNavigate={handleNavigate}
              />
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
})

export { NavMain }
