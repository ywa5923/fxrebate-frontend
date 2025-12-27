import { getPlatformUserList } from '@/lib/platform-user-requests';
import { PlatformUsersTable } from './PlatformUsersTable';
import { FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable/types';
import { FilterableTable } from '@/components/FilterableTable';
import { Broker } from '../brokers/page';
import { apiClient } from '@/lib/api-client';
import { PlatformUser } from '@/types/PlatformUser';
import logger from '@/lib/logger';

export default async function PlatformUsersPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  // const sp = await searchParams;
  // const pageParam = Number((sp?.page as string) || 1);
  // const perPageParam = Number((sp?.per_page as string) || 15);
  // const name = (sp?.name as string) || undefined;
  // const email = (sp?.email as string) || undefined;
  // const role = (sp?.role as string) || undefined;
  // const order_by = (sp?.order_by as string) || undefined;
  // const order_direction = ((sp?.order_direction as string) as 'asc' | 'desc') || undefined;
  // const is_active = (sp?.is_active as string) || undefined;

  // const data = await getPlatformUserList(pageParam, perPageParam, {
  //   name,
  //   email,
  //   role,
  //   order_by,
  //   order_direction,
  //   is_active,
  // });

  // return <PlatformUsersTable data={data.data || []} meta={data.pagination} />;

  //   //=========================
  const params = await searchParams;
  const log = logger.child('control-panel/super-manager/countries/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/platform-users?${queryString}`;

  log.info("url", { url });

 
  let toggleActiveUrl = '/platform-users/toggle-active-status';
 
 const platformUsersResponse= await apiClient<PlatformUser>(url,true);
 //console.log("---------optionDataResponse", optionDataResponse);

 if (! platformUsersResponse?.success || !platformUsersResponse?.data) {
  //log.error("Error fetching options list", { message: optionDataResponse?.message });
  throw new Error(platformUsersResponse?.message || "Error fetching options list");
 }
 const platformUsers = platformUsersResponse.data;
 const formConfig = platformUsersResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config", { message: "Form config not found" });
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


