"use client"

import * as React from "react"
import { 
  Settings2, 
  ChevronRight,
  Building,
  Users,
  Globe,
  Globe2,
  Search,
  Map,
  List,
  Sliders,
  MapPin,
  Compass,
  Languages,
  FileText,
  MessageSquare,
  Flag,
  Shield,
  Crown,
  LogOut,
  MoreVertical,
  Eye,
  UserPlus,
  Plus,
  type LucideIcon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutUser } from "@/lib/auth-actions"

interface SidebarLink {
  name: string;
  url: string;
  icon: string;
}

interface AppSidebarSuperProps extends React.ComponentProps<typeof Sidebar> {
  userLinks?: SidebarLink[];
  settingsLinks?: SidebarLink[];
  i18nLinks?: SidebarLink[];
  userName?: string;
  userEmail?: string;
  basePath?: string; // panel base path, e.g. /en/control-panel/super-manager
  roleLabel?: string; // label shown under user name in footer
  panelTitle?: string; // optional colored title badge below logo
  panelTitleClassName?: string; // classes for the title badge
}

const iconMap: Record<string, LucideIcon> = {
  Building,
  Users,
  Globe,
  Globe2,
  Languages,
  FileText,
  MessageSquare,
  Flag,
  Search,
  Map,
  MapPin,
  Compass,
  List,
  Sliders,
  Shield,
  Settings: Settings2,
  Options: Sliders,
  Cog: Settings2,
  Translate: Languages,
}

export function AppSidebarSuper({ 
  userLinks = [], 
  settingsLinks = [], 
  i18nLinks = [],
  userName = "Admin",
  userEmail = "",
  basePath = "/en/control-panel/super-manager",
  roleLabel = "Super Admin",
  panelTitle,
  panelTitleClassName,
  ...props 
}: AppSidebarSuperProps) {
  const pathname = usePathname();
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        {/* Logo */}
        <div className="w-full mt-4 mb-4 flex items-center justify-center group-data-[collapsible=icon]:hidden">
          <img 
            src="/assets/darkFxRebate-logo.svg" 
            alt="FXREBATE Logo" 
            className="h-10 w-auto"
          />
        </div>

        {/* Optional Panel Title Badge */}
        {panelTitle && (
          <div className="px-3 group-data-[collapsible=icon]:hidden">
            <div className={`rounded-md px-3 py-2 text-sm font-semibold ${panelTitleClassName || 'bg-orange-100 text-orange-700'}`}>
              {panelTitle}
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        {userLinks.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <Users className="h-4 w-4 mr-2 inline" />
              Staff Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userLinks.map((link) => {
                  const IconComponent = iconMap[link.icon] || Building;
                  // Check if current path matches or starts with the link URL (for sub-routes)
                  const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
                  const isManageBrokers = link.name === 'Brokers';
                  const isPlatformUsers = link.name === 'Platform Users';
                  const isUserPermissions = link.name === 'User Permissions';
                  
                  return (
                    <SidebarMenuItem key={link.name}>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton asChild className="flex-1">
                          <Link
                            href={link.url}
                            className={`flex items-center w-full rounded-md transition-all duration-200 font-medium text-sm ${
                              isActive 
                                ? 'bg-[#308360] text-white hover:bg-[#276B52] px-4 py-3' 
                                : 'text-gray-800 hover:bg-green-50 hover:text-green-600 px-3 py-2'
                            }`}
                          >
                            <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 min-w-0">{link.name}</span>
                          </Link>
                        </SidebarMenuButton>
                        
                        {isManageBrokers && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href={`${basePath}/brokers`} className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Brokers List
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`${basePath}/brokers/register`} className="flex items-center cursor-pointer">
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Register New Broker
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {isPlatformUsers && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/platform-users" className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Platform Users
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/platform-users/add" className="flex items-center cursor-pointer">
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  Add Platform User
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {isUserPermissions && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/user-permissions" className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Permissions
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/user-permissions/broker-permission/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Broker Type Permission
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/user-permissions/country-permission/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Country Type Permission
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/user-permissions/zone-permission/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Zone Type Permission
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/user-permissions/seo-permission/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create SEO Type Permission
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/user-permissions/translator-permission/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create Translator Type Permission
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings Section */}
        {settingsLinks.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <Settings2 className="h-4 w-4 mr-2 inline" />
              Settings
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {settingsLinks.map((link) => {
                  const IconComponent = iconMap[link.icon] || Settings2;
                  // Check if current path matches or starts with the link URL (for sub-routes)
                  const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
                  const isZones = link.name === 'Zones';
                  const isCountries = link.name === 'Countries';
                  const isDropdownLists = link.name === 'Dropdown Lists';
                  const isDynamicOptions = link.name === 'Dynamic Options';
                  
                  return (
                    <SidebarMenuItem key={link.name}>
                      <div className="flex items-center w-full">
                        <SidebarMenuButton asChild className="flex-1">
                          <Link
                            href={link.url}
                            className={`flex items-center w-full rounded-md transition-all duration-200 font-medium text-sm ${
                              isActive 
                                ? 'bg-[#308360] text-white hover:bg-[#276B52] px-4 py-3' 
                                : 'text-gray-800 hover:bg-green-50 hover:text-green-600 px-3 py-2'
                            }`}
                          >
                            <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
                            <span className="flex-1 min-w-0">{link.name}</span>
                          </Link>
                        </SidebarMenuButton>
                        
                        {isZones && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/zones" className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Zones List
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/zones/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add New Zone
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        
                        {isDropdownLists && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/dropdown-lists" className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Dropdown Lists
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/dropdown-lists/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create New Dropdown List
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        
                        {isCountries && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/countries" className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Countries List
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/countries/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add New Country
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                        
                        {isDynamicOptions && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start" className="w-56">
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/dynamic-options" className="flex items-center cursor-pointer">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Dynamic Options
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href="/en/control-panel/super-manager/dynamic-options/add" className="flex items-center cursor-pointer">
                                  <Plus className="mr-2 h-4 w-4" />
                                  Create New Dynamic Option
                                </Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* System Languages & Translations Section */}
        {i18nLinks.length > 0 && (
          <SidebarGroup className="group-data-[collapsible=icon]:hidden">
            <SidebarGroupLabel>
              <Globe2 className="h-4 w-4 mr-2 inline" />
              Translation Management
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {i18nLinks.map((link) => {
                  const IconComponent = iconMap[link.icon] || Languages;
                  const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
                  return (
                    <SidebarMenuItem key={link.name}>
                      <SidebarMenuButton asChild className="flex-1">
                        <Link
                          href={link.url}
                          className={`flex items-center w-full rounded-md transition-all duration-200 font-medium text-sm ${
                            isActive 
                              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3' 
                              : 'text-gray-800 hover:bg-green-50 hover:text-green-600 px-3 py-2'
                          }`}
                        >
                          <IconComponent className="mr-3 h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 min-w-0">{link.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t group-data-[collapsible=icon]:hidden">
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
              <Crown className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {userName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {roleLabel}
              </p>
            </div>
          </div>
          <div className="text-center py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-600 dark:text-gray-300">
              Full System Access
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={async () => {
              await logoutUser();
              window.location.href = '/en';
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

