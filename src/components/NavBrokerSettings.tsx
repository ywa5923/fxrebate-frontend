"use client"

import { BookOpen, ChevronRight, Settings, Star } from "lucide-react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"

const settingsItems = [
  { title: "Broker Ratings", slug: "ratings", icon: Star, iconClassName: "fill-yellow-400 text-yellow-500!" },
  { title: "Guides", slug: "guides", icon: BookOpen },
]

export function NavBrokerSettings() {
  const { isMobile, state, setOpenMobile } = useSidebar()
  const { locale, brokerId } = useParams<{ locale: string; brokerId: string }>()
  const pathname = usePathname()
  const isCollapsed = state === "collapsed" && !isMobile
  const items = settingsItems.map((item) => {
    const href = `/${locale}/control-panel/${brokerId}/broker-profile/${item.slug}`
    return { ...item, href, isActive: pathname === href || pathname.startsWith(`${href}/`) }
  })
  const isSettingsPage = items.some((item) => item.isActive)

  return (
    <SidebarGroup>
      <SidebarMenu>
        {isCollapsed ? (
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton type="button" tooltip="SuperAdmin Settings" isActive={isSettingsPage}>
                  <Settings aria-hidden="true" />
                  <span>SuperAdmin Settings</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="min-w-48">
                <DropdownMenuLabel>SuperAdmin Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {items.map((item) => (
                  <DropdownMenuItem
                    key={item.title}
                    asChild
                    className={item.isActive ? "bg-accent text-accent-foreground" : undefined}
                  >
                    <Link href={item.href} aria-current={item.isActive ? "page" : undefined}>
                      <item.icon aria-hidden="true" className={item.iconClassName} />
                      <span>{item.title}</span>
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ) : (
          <Collapsible asChild defaultOpen={isSettingsPage} className="group/broker-settings">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton type="button" className="h-10" isActive={isSettingsPage}>
                  <Settings aria-hidden="true" />
                  <span>SuperAdmin Settings</span>
                  <ChevronRight
                    aria-hidden="true"
                    className="ml-auto transition-transform duration-200 group-data-[state=open]/broker-settings:rotate-90"
                  />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {items.map((item) => (
                    <SidebarMenuSubItem key={item.title}>
                      <SidebarMenuSubButton asChild isActive={item.isActive} className="h-9 w-full text-left">
                        <Link
                          href={item.href}
                          aria-current={item.isActive ? "page" : undefined}
                          onClick={() => setOpenMobile(false)}
                        >
                          <item.icon aria-hidden="true" className={item.iconClassName} />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
