import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';
import '@/app/globals.css';
import { Providers } from '@/providers/Theme';
import { isAuthenticated } from '@/lib/auth-actions';
import logger from '@/lib/logger';
import { redirect } from 'next/navigation';
import { AppSidebarSuper } from '@/components/app-sidebar-super';
import { BreadcrumbsSuperManager } from '@/components/breadcrumbs-super-manager';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';

export default async function PlatformManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutLogger = logger.child('control-panel/platform-manager/layout.tsx');

  const loggedUser = await isAuthenticated();
  if (!loggedUser) {
    layoutLogger.info('User not authenticated, redirecting to login');
    // redirect('/en');
  }

  // Build sidebar link sections (reuse super-manager design)
  const userLinks = [
    {
      name: 'Brokers',
      url: '/en/control-panel/platform-manager/brokers',
      icon: 'Building',
    },
  ];

  const settingsLinks: { name: string; url: string; icon: string }[] = [];
  const i18nLinks: { name: string; url: string; icon: string }[] = [];

  return (
    <div className={cn(satoshi.variable, 'h-screen overflow-hidden bg-[#FFF] dark:bg-black')}>
      <Providers>
        <SidebarProvider>
          <AppSidebarSuper
            userLinks={userLinks}
            settingsLinks={settingsLinks}
            i18nLinks={i18nLinks}
            userName={loggedUser?.name}
            userEmail={loggedUser?.email}
            basePath="/en/control-panel/platform-manager"
            roleLabel="Platform User"
            panelTitle="Platform User Dashboard"
            panelTitleClassName="bg-orange-100 text-orange-700"
          />
          <SidebarInset className="flex flex-col h-screen overflow-hidden">
            <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-3 sm:px-4 w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4 hidden sm:block" />
                <BreadcrumbsSuperManager />
              </div>
            </header>
            <main className="flex-1 p-2 sm:p-4 md:p-6 overflow-y-auto overflow-x-hidden">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </Providers>
      <Toaster />
    </div>
  );
}


