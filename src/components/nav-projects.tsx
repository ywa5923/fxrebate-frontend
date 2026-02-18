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
      <SidebarMenu className="gap-0">
        {projects.map((item, index) => {
          const isActive = pathname === item.url || pathname.startsWith(item.url + "/")
          const isLast = index === projects.length - 1
          return (
            <SidebarMenuItem key={item.name} className="list-none">
              <SidebarMenuButton asChild className="h-auto p-0 !rounded-none">
                <Link
                  href={item.url}
                  className={`!rounded-none flex items-center justify-between px-4 py-3.5 w-full transition-colors duration-150 ${
                    !isLast ? "border-b border-gray-100 dark:border-gray-800" : ""
                  } ${
                    isActive
                      ? "bg-gray-50 dark:bg-gray-800/60 text-gray-900 dark:text-white border-r-[3px] border-r-gray-900 dark:border-r-white"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-100 border-r-[3px] border-r-transparent"
                  }`}
                >
                  <span className={`text-sm ${isActive ? "font-semibold" : "font-normal"}`}>{item.name}</span>
                  <ChevronRight className={`h-3.5 w-3.5 ${
                    isActive ? "text-slate-300 dark:text-slate-400" : "text-gray-300 dark:text-gray-600"
                  }`} />
                </Link>
              </SidebarMenuButton>
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
