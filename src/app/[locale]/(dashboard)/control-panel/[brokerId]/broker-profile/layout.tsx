import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';

import '@/app/globals.css';
import { Providers } from '@/providers/Theme';
import { AppSidebar } from "@/components/app-sidebar"

import { BASE_URL } from '@/constants';
import { AuthUser } from '@/types';
import { isAuthenticated } from '@/lib/auth-actions';
import logger from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Toaster } from "@/components/ui/sonner"

import { getCategoriesWithOptions } from '@/lib/getCategoriesWithOptions';
import ThemeToggleDashboard from '@/components/ThemeToggleDashboard';

async function getBrokerOptions2() {
  try {
    const response = await fetch(
      `${BASE_URL}/broker_options?language[eq]=en&all_columns[eq]=1&broker_type[eq]=brokers`,
      { next: { revalidate:0 } } // Revalidate every hour
    )
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const responseData = await response.json()
    
    return responseData.data; // Fallback to original format if structure is different
  } catch (error) {
    console.error('Error fetching broker options:', error)
    throw error
  }
}

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ brokerId: string }>;
}) {
  const resolvedParams = await params;
  const brokerId = parseInt(resolvedParams.brokerId);
  let layoutLogger = logger.child('control-panel/[brokerId]/broker-profile/layout.tsx');
  const categoriesWithOptions = await getCategoriesWithOptions("en")

  const user: AuthUser | null = await isAuthenticated();
  if (!user) {
  layoutLogger.info('User not authenticated, redirecting to login');
  redirect('/en');
  }
  let isBrokerManager=hasPermission(user, 'manage', 'broker', brokerId);

  let teamManagementLink: { name: string; url: string; icon: string } | null = null;
  if(isBrokerManager){
    teamManagementLink = {
      name: 'Manage YourTeam',
      url: `/en/control-panel/${brokerId}/broker-profile/team-management`,  
      icon: "TrendingUp"
    }
  }

  let sidebarOptionsLinks = categoriesWithOptions?.map((optionCategory: any) => {
    let categoryName = optionCategory.name.toLowerCase().replace(/ /g, '-')
    return {
      name: optionCategory.name,
      url: `/en/control-panel/${brokerId}/broker-profile/${optionCategory.id}/${categoryName}`,  
      icon: "TrendingUp"
    }
  }) || []
 
  return (
    <div className={cn(satoshi.variable, 'min-h-screen bg-[#FFF] dark:bg-black')}>
      <Providers>
        <SidebarProvider>
          <AppSidebar brokerOptionsLinks={sidebarOptionsLinks} teamManagementLink={teamManagementLink} isBrokerManager={isBrokerManager} userName={user?.name} userEmail={user?.email}/>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-950/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-3 sm:px-4 w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 data-[orientation=vertical]:h-4 hidden sm:block"
                />
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#">
                        Building Your Profile
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage>FXREBATE Control Panel</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
                <div className="ml-auto">
                  <ThemeToggleDashboard />
                </div>
              </div>
            </header>
            <main className="flex-1 overflow-x-hidden">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </Providers>
      <Toaster />
    </div>
   
  );
}