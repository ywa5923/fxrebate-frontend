"use client"

import {
  type LucideIcon,
  ChevronRight
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
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
  const pathname = usePathname()

  return (
    <>
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* FXREBATE Logo Full Width - CSS-based swap to avoid hydration mismatch */}
      <div className="w-full mt-4 mb-4 flex items-center justify-center">
        <img 
          src="/assets/darkFxRebate-logo.svg"
          alt="FXREBATE Logo" 
          className="h-10 w-auto block dark:hidden"
        />
        <img 
          src="/assets/lightFxRebate-logo.svg"
          alt="FXREBATE Logo" 
          className="h-10 w-auto hidden dark:block"
        />
      </div>
      <SidebarGroupLabel>Control Panel</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.url}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                    isActive
                      ? "bg-green-800 text-white shadow-sm"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
                  }`}
                >
                  <ChevronRight className={`mr-2 h-4 w-4 transition-transform duration-200 ${isActive ? "text-green-200 rotate-90" : "text-gray-400"}`} />
                  <span className={isActive ? "font-semibold" : "font-medium"}>{item.name}</span>
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
