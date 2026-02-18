import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';

import '@/app/globals.css';
import { Providers } from '@/providers/Theme';
import { AppSidebar } from "@/components/app-sidebar"

import { BASE_URL } from '@/constants';
import { AuthUser, OptionCategory } from '@/types';
import { isAuthenticated } from '@/lib/auth-actions';
import logger from '@/lib/logger';
import { hasPermission } from '@/lib/permissions';
import { notFound, redirect } from 'next/navigation';
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

import ThemeToggleDashboard from '@/components/ThemeToggleDashboard';
import { Suspense } from 'react';
import NProgressBar from '@/components/NProgressBar';
import { getBrokerInfo } from '@/lib/auth-actions';
import { apiClient } from '@/lib/api-client';
import { ErrorMode, UseTokenAuth } from '@/lib/enums';

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
  const brokerInfo = await getBrokerInfo(brokerId);
  const brokerType = brokerInfo.broker_type;
  let layoutLogger = logger.child('control-panel/[brokerId]/broker-profile/layout.tsx');


 

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

  let optionCategoriesUrl = `/option-categories/get-list?broker_type=${brokerType}`;
  let optionCategoriesResponse = await apiClient<OptionCategory[]>(optionCategoriesUrl, UseTokenAuth.Yes, {
    method: "GET",
    cache: "no-store",
  }, ErrorMode.Return);
  if(!optionCategoriesResponse.success){
    layoutLogger.error("Error fetching option categories", {context: {optionCategoriesResponse: optionCategoriesResponse.message}});
    notFound();
  }
  let optionCategories = optionCategoriesResponse.data ?? [];
  let sidebarOptionsLinks = optionCategories.map((optionCategory: OptionCategory) => {
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
        <Suspense fallback={null}>
          <NProgressBar />
        </Suspense>
        <SidebarProvider>
          <AppSidebar brokerOptionsLinks={sidebarOptionsLinks} teamManagementLink={teamManagementLink} isBrokerManager={isBrokerManager} userName={user?.name} userEmail={user?.email} brokerType={brokerType}/>
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b border-gray-200 dark:border-gray-800 bg-sidebar dark:bg-sidebar transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
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
                        Build Your Profile
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
            <main className="flex-1 overflow-x-hidden bg-[#ffffff] dark:bg-gray-950">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </Providers>
      <Toaster />
    </div>
   
  );
}