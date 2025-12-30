
import { FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable/types';
import { FilterableTable } from '@/components/FilterableTable';
import { apiClient } from '@/lib/api-client';
import { PlatformUser } from '@/types/PlatformUser';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';
import logger from '@/lib/logger';

interface PlatformUsersPageProps {
  searchParams: Promise<SearchParams<PlatformUser>>;
}

export default async function PlatformUsersPage({ searchParams }: PlatformUsersPageProps) {
  const log = logger.child('control-panel/super-manager/platform-users/page.tsx');
  const params = await searchParams;
  
  const queryString = getQueryStringFromSearchParams(params);

  let url=`/platform-users?${queryString}`;

  log.debug("Fetching platform users list", { url });

 
  let toggleActiveUrl = '/platform-users/toggle-active-status';
 
 const platformUsersResponse= await apiClient<PlatformUser>(url,true);

 if (! platformUsersResponse?.success || !platformUsersResponse?.data) {
  log.error("Error fetching platform users list", { url, message: platformUsersResponse?.message });
  throw new Error(platformUsersResponse?.message || "Error fetching platform users list");
 }
 const platformUsers = platformUsersResponse.data;
 const formConfig = platformUsersResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for platform users", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
    <FilterableTable
     data={platformUsers as unknown as PlatformUser[]} 
     pagination={platformUsersResponse.pagination as unknown as FTPagination}
     columnsConfig={platformUsersResponse.table_columns_config as unknown as FTColumnsConfig<PlatformUser>} 
     filters={platformUsersResponse.filters_config as unknown as FTFilters<PlatformUser>}
     LOCAL_STORAGE_KEY="platform-users-filters"
     formConfig={formConfig}
     propertyNameToDisplay="Platform User"
     toggleActiveUrl={toggleActiveUrl}
     getItemUrl={`/platform-users`}
     updateItemUrl={`/platform-users`}
     deleteUrl={`/platform-users`}
     />
     
  </div>
);
}


