import { getPlatformUserList } from '@/lib/platform-user-requests';
import { PlatformUsersTable } from './PlatformUsersTable';
import { FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable/types';
import { FilterableTable } from '@/components/FilterableTable';
import { Broker } from '../brokers/page';
import { apiClient } from '@/lib/api-client';
import { PlatformUser } from '@/types/PlatformUser';
import logger from '@/lib/logger';

export default async function PlatformUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  
  const params = await searchParams;
  const log = logger.child('control-panel/super-manager/platform-users/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/platform-users?${queryString}`;

  log.info("Fetching platform users list", { url });

 
  let toggleActiveUrl = '/platform-users/toggle-active-status';
 
 const platformUsersResponse= await apiClient<PlatformUser>(url,true);
 //console.log("---------optionDataResponse", optionDataResponse);

 if (! platformUsersResponse?.success || !platformUsersResponse?.data) {
  log.error("Error fetching platform users list", { url,message: platformUsersResponse?.message });
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


