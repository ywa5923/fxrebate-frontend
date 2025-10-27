"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
  ChevronRight
} from "lucide-react"
import Link from "next/link"

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
  useSidebar,
} from "@/components/ui/sidebar"

import { 
  Frame, 
  Building2, 
  Banknote, 
  TrendingUp, 
  BarChart3, 
  Wallet, 
  Shield, 
  Globe, 
  Zap, 
  Users, 
  Settings, 
  FileText, 
  CreditCard, 
  Smartphone 
} from "lucide-react"

const iconMap: Record<string, LucideIcon> = {
  Frame,
  Building2,
  Banknote,
  TrendingUp,
  BarChart3,
  Wallet,
  Shield,
  Globe,
  Zap,
  Users,
  Settings,
  FileText,
  CreditCard,
  Smartphone
}

export function NavProjects({
  projects,
  teamManagementLink = null,
  isBrokerManager = false,
}: {
  projects: {
    name: string
    url: string
    icon: string
  }[]
  teamManagementLink?: { name: string; url: string; icon: string } | null,
  isBrokerManager?: boolean,
}) {
  const { isMobile } = useSidebar()

  return (
    <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* FXREBATE Logo Full Width */}
      <div className="w-full mt-4 mb-4 flex items-center justify-center">
        <img 
          src="/assets/darkFxRebate-logo.svg" 
          alt="FXREBATE Logo" 
          className="h-10 w-auto"
        />
      </div>
      <SidebarGroupLabel>Control Panel</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
         // const IconComponent = iconMap[item.icon] || Building2
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.url}
                  className="flex items-center px-3 py-2 rounded-md transition-all duration-200 text-gray-800 hover:bg-green-50 hover:text-green-600 font-medium text-sm"
                >
                  <ChevronRight className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              </SidebarMenuButton>
            {/*<DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-48 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Folder className="text-muted-foreground" />
                  <span>View Project</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Forward className="text-muted-foreground" />
                  <span>Share Project</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>*/}
          </SidebarMenuItem>
          )
        })}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal className="text-sidebar-foreground/70" />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>

    {/* Settings Section */}
    {isBrokerManager && teamManagementLink && (
      <SidebarGroup className="group-data-[collapsible=icon]:hidden">
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href={teamManagementLink?.url || '#'} className="flex items-center px-4 py-3 rounded-lg transition-all duration-300 bg-gray-800 hover:bg-green-800 border border-gray-600 hover:border-green-600 text-gray-200 hover:text-green-100 font-medium text-sm shadow-md hover:-translate-y-1 group">
                <Settings className="mr-3 h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
                {teamManagementLink?.name || 'Settings'}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    )}
    </>
  )
}
