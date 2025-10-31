'use client';

import { usePathname } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const pathNameMap: Record<string, string> = {
  '/en/control-panel/super-manager/brokers': 'Brokers',
  '/en/control-panel/super-manager/platform-users': 'Platform Users',
  '/en/control-panel/super-manager/user-permissions': 'User Permissions',
  '/en/control-panel/super-manager/countries': 'Countries',
  '/en/control-panel/super-manager/zones': 'Zones',
  '/en/control-panel/super-manager/dropdown-lists': 'Dropdown Lists',
  '/en/control-panel/super-manager/dropdown-lists-values': 'Dropdown Lists Values',
  '/en/control-panel/super-manager/broker-dynamic-options': 'Broker Dynamic Options',
  '/en/control-panel/super-manager/system-languages': 'System Languages',
  '/en/control-panel/super-manager/translations': 'Translations',
};

export function BreadcrumbsSuperManager() {
  const pathname = usePathname();
  
  // Find the matching page name
  // Check if pathname starts with any of the keys in pathNameMap
  let currentPageName: string | null = null;
  for (const [path, name] of Object.entries(pathNameMap)) {
    if (pathname === path || pathname.startsWith(path + '/')) {
      currentPageName = name;
      break;
    }
  }

  return (
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
        {currentPageName && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="line-clamp-1">{currentPageName}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}


