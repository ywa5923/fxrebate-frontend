"use client"

import {
  Folder,
  Forward,
  MoreHorizontal,
  Trash2,
  type LucideIcon,
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
}: {
  projects: {
    name: string
    url: string
    icon: string
  }[]
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      {/* FXREBATE Logo Full Width */}
      <div
        className="w-full rounded-lg mb-4 flex items-center justify-center"
        style={{
          background: 'linear-gradient(90deg, #111827 0%, #22C55E 100%)',
          minHeight: '36px',
        }}
      >
        <span className="font-bold text-white text-xl tracking-wider" style={{fontFamily: 'Satoshi, Arial, sans-serif', letterSpacing: '0.08em'}}>FXREBATE</span>
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
                  className="group flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-200 text-gray-800 hover:bg-green-50 hover:text-green-600"
                >
                  <div className="w-2 h-2 rounded-full bg-gray-300 transition-colors duration-200" />
                  <span className="font-medium text-sm transition-colors duration-200">{item.name}</span>
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
  )
}
