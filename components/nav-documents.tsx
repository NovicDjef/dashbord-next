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
import { usePathname } from "next/navigation"

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

export function NavDocuments({
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

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const itemTitle = item.name || item.title || ""
          const isActive = pathname === item.url || (item.items && item.items.some(subItem => pathname === subItem.url))
          
          if (item.items) {
            return (
              <Collapsible.Root key={itemTitle} defaultOpen={isActive}>
                <SidebarMenuItem>
                  <Collapsible.Trigger asChild>
                    <SidebarMenuButton 
                      className={
                        isActive
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-muted"
                      }
                    >
                      <item.icon />
                      <span>{itemTitle}</span>
                      <IconChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <SidebarMenuSub>
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link 
                                href={subItem.url}
                                className={
                                  isSubActive
                                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                    : "hover:bg-muted"
                                }
                              >
                                <subItem.icon />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        )
                      })}
                    </SidebarMenuSub>
                  </Collapsible.Content>
                </SidebarMenuItem>
              </Collapsible.Root>
            )
          }
          
          return (
            <SidebarMenuItem key={itemTitle}>
              <SidebarMenuButton asChild>
                <Link 
                  href={item.url}
                  className={
                    isActive
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted"
                  }
                >
                  <item.icon />
                  <span>{itemTitle}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}
