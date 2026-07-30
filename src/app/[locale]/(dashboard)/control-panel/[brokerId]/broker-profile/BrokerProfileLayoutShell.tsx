import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';
import { Providers } from '@/providers/Theme';
import { AppSidebar } from "@/components/app-sidebar"
import "flag-icons/css/flag-icons.min.css";

import { AuthUser, OptionCategory } from '@/types';
import { isAuthenticated } from '@/lib/auth-actions';
import logger from '@/lib/logger';

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
import { canEditBroker, canManageBroker, isAdminOfBroker, isSuperAdmin } from '@/lib/permissions';


type Props={
  params: Promise<{brokerId: string, locale: string}>;
  children: React.ReactNode;
}

export default async function BrokerProfileLayoutShell({params, children}: Props) {
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
  
  
    let userCanManageBroker = canManageBroker(user, brokerInfo);
    let userIsAdminOfBroker = isAdminOfBroker(user, brokerInfo);
    let userIsSuperAdmin = isSuperAdmin(user);
    let userCanEditBroker = canEditBroker(user, brokerInfo);
  
    const teamManagementLink = userCanManageBroker
      ? {
          name: 'Manage Your Team',
          url: `/en/control-panel/${brokerId}/broker-profile/team-management`,
          icon: 'TrendingUp',
        }
      : null
  
     
  
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
            <AppSidebar
              brokerOptionsLinks={sidebarOptionsLinks}
              teamManagementLink={teamManagementLink}
              isBrokerAdmin={userIsAdminOfBroker}
              isSuperAdmin={userIsSuperAdmin}
              canEditBroker={userCanEditBroker}
              canManageBroker={userCanManageBroker}
              userName={user?.name}
              userEmail={user?.email}
              brokerType={brokerType}
              brokerLogo={brokerInfo.broker_logo}
              brokerTradingName={brokerInfo.broker_trading_name}
            />
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