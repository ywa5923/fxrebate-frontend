import { cn } from '@/lib/utils';
import { satoshi } from '@/lib/fonts';
import '@/app/globals.css';
import { Providers } from '@/providers/Theme';
import { AppSidebarSuper } from "@/components/app-sidebar-super"
import { isAuthenticated } from '@/lib/auth-actions';
import { isSuperAdmin } from '@/lib/permissions';
import logger from '@/lib/logger';
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

export default async function SuperManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const layoutLogger = logger.child('control-panel/super-manager/layout.tsx');
  
  const loggedUser = await isAuthenticated();
  if (!loggedUser) {
    layoutLogger.info('User not authenticated, redirecting to login');
    redirect('/en');
  }

  //const isSuper = isSuperAdmin(user);
  const isSuper = true;
  if (!isSuper) {
    layoutLogger.warn('User is not super admin, access denied');
    //redirect('/en/control-panel');
  }

  const sidebarUserLinks = [
    {
      name: 'Brokers',
      url: '/en/control-panel/super-manager/brokers',
      icon: 'Building'
    },
    {
      name: 'Platform Users',
      url: '/en/control-panel/super-manager/platform-users',
      icon: 'Users'
    },
    {
      name: 'User Permissions',
      url: '/en/control-panel/super-manager/user-permissions',
      icon: 'Shield'
    }
  ];

  const sidebarSettingsLinks = [
  {
    name: 'Countries',
    url: '/en/control-panel/super-manager/countries',
    icon: 'MapPin'
  },
  {
    name: 'Zones',
    url: '/en/control-panel/super-manager/zones',
    icon: 'Compass'
  },
  {
    name: 'Dropdown Lists',
    url: '/en/control-panel/super-manager/dropdown-lists',
    icon: 'List'
  },
  {
    name: 'Dropdown Lists Values',
    url: '/en/control-panel/super-manager/dropdown-lists-values',
    icon: 'List'
  },
  {
    name: 'Broker Dynamic Options',
    url: '/en/control-panel/super-manager/broker-dynamic-options',
    icon: 'Options'
  }
]

  const sidebarI18nLinks = [
    {
      name: 'System Languages',
      url: '/en/control-panel/super-manager/system-languages',
      icon: 'Flag'
    },
    {
      name: 'Translations',
      url: '/en/control-panel/super-manager/translations',
      icon: 'FileText'
    },
  ]

  return (
    <div className={cn(satoshi.variable, 'min-h-screen bg-[#FFF] dark:bg-black')}>
      <Providers>
        <SidebarProvider>
          <AppSidebarSuper 
            userLinks={sidebarUserLinks} 
            settingsLinks={sidebarSettingsLinks}
            i18nLinks={sidebarI18nLinks}
            userName={loggedUser?.name}
            userEmail={loggedUser?.email}
          />
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-3 sm:px-4 w-full">
                <SidebarTrigger className="-ml-1" />
                <Separator
                  orientation="vertical"
                  className="mr-2 h-4 hidden sm:block"
                />
                <Breadcrumb className="flex-1 min-w-0">
                  <BreadcrumbList>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href="#" className="max-w-20 truncate md:max-w-none">
                        Super Admin Dashboard
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="line-clamp-1">Control Panel</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <main className="flex-1 p-2 sm:p-4 md:p-6">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </Providers>
      <Toaster />
    </div>
  );
}

