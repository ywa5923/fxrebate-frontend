"use client"

import * as React from "react"
import {
  Frame,
  Map,
  PieChart,
  LogOut,
  Users,
  HelpCircle,
  MessageCircle,
  ExternalLink,
} from "lucide-react"

import { NavProjects } from "@/components/nav-projects"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { logoutUser } from "@/lib/auth-actions"

// This is sample data.
const data = {
  // user: {
  //   name: "shadcn",
  //   email: "m@example.com",
  //   avatar: "/avatars/shadcn.jpg",
  // },
  // teams: [
  //   {
  //     name: "Acme Inc",
  //     logo: GalleryVerticalEnd,
  //     plan: "Enterprise",
  //   },
  //   {
  //     name: "Acme Corp.",
  //     logo: AudioWaveform,
  //     plan: "Startup",
  //   },
  //   {
  //     name: "Evil Corp.",
  //     logo: Command,
  //     plan: "Free",
  //   },
  // ],
  // navMain: [
  //   {
  //     title: "Playground",
  //     url: "#",
  //     icon: SquareTerminal,
  //     isActive: true,
  //     items: [
  //       {
  //         title: "History",
  //         url: "mue",
  //       },
  //       {
  //         title: "Starred",
  //         url: "#",
  //       },
  //       {
  //         title: "Settings",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Models",
  //     url: "#",
  //     icon: Bot,
  //     items: [
  //       {
  //         title: "Genesis",
  //         url: "#",
  //       },
  //       {
  //         title: "Explorer",
  //         url: "#",
  //       },
  //       {
  //         title: "Quantum",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Documentation",
  //     url: "#",
  //     icon: BookOpen,
  //     items: [
  //       {
  //         title: "Introduction",
  //         url: "#",
  //       },
  //       {
  //         title: "Get Started",
  //         url: "#",
  //       },
  //       {
  //         title: "Tutorials",
  //         url: "#",
  //       },
  //       {
  //         title: "Changelog",
  //         url: "#",
  //       },
  //     ],
  //   },
  //   {
  //     title: "Settings",
  //     url: "#",
  //     icon: Settings2,
  //     items: [
  //       {
  //         title: "General",
  //         url: "#",
  //       },
  //       {
  //         title: "Team",
  //         url: "#",
  //       },
  //       {
  //         title: "Billing",
  //         url: "#",
  //       },
  //       {
  //         title: "Limits",
  //         url: "#",
  //       },
  //     ],
  //   },
  // ],
  projects: [
    {
      name: "Design Engineering",
      url: "broker-profile/",
      icon: Frame,
    },
    {
      name: "Sales & Marketing",
      url: "#",
      icon: PieChart,
    },
    {
      name: "Travel",
      url: "#",
      icon: Map,
    },
  ],
}

export function AppSidebar({ brokerOptionsLinks, teamManagementLink = null, isBrokerManager = false, userName, userEmail, brokerType, ...props }: React.ComponentProps<typeof Sidebar> & { brokerOptionsLinks?: any, teamManagementLink?: { name: string; url: string; icon: string } | null, isBrokerManager?: boolean, userName?: string, userEmail?: string, brokerType?: string }) {

  return (
    <Sidebar collapsible="icon" {...props}>
     
      <SidebarContent>
        {/* <NavMain items={data.navMain} /> */}
        <NavProjects projects={brokerOptionsLinks} teamManagementLink={teamManagementLink} isBrokerManager={isBrokerManager} />

        <div className="mt-auto px-3 sm:px-4 pb-3 sm:pb-4 group-data-[collapsible=icon]:hidden">
          <div className="rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800">
                <HelpCircle className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Need Help?</p>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 leading-relaxed">
              Have questions about rebates or your account? Our team is here to help.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="mailto:support@fxrebate.com"
                className="flex items-center gap-2 text-xs font-medium text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition-colors"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Contact Support
              </a>
              <a
                href="https://fxrebate.com/faq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                View FAQ
              </a>
            </div>
          </div>
        </div>
      </SidebarContent>
      <SidebarFooter className="border-t border-gray-200 dark:border-gray-800 group-data-[collapsible=icon]:hidden">
        <div className="p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {userName ?? "User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userEmail ?? ""}
              </p>
              {brokerType && (
                <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                  {brokerType}
                </span>
              )}
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100"
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
