import { getUserPermissionList } from '@/lib/user-permission-requests';
import { PermissionsTable } from './PermissionsTable';
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { UserPermission } from '@/types';
import { FilterableTable } from '@/components/FilterableTable';
import { FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable/types';

export default async function UserPermissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  
 const params = await searchParams;
 const log = logger.child('control-panel/super-manager/user-permissions/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/user-permissions?${queryString}`;

  log.debug("Fetching user permissions list", { url });

 
  let toggleActiveUrl = '/user-permissions/toggle-active-status';
 
 const userPermissionsResponse= await apiClient<UserPermission>(url,true);
 

 if (! userPermissionsResponse?.success || !userPermissionsResponse?.data) {
  log.error("Error fetching user permissions list", { url,message: userPermissionsResponse?.message });
  throw new Error(userPermissionsResponse?.message || "Error fetching user permissions list");
 }
 const userPermissions = userPermissionsResponse.data;

 
 return (
  <div className="flex-1 space-y-4">
    <FilterableTable
     data={ userPermissionsResponse.data as unknown as UserPermission[]} 
     pagination={userPermissionsResponse.pagination as unknown as FTPagination}
     columnsConfig={userPermissionsResponse.table_columns_config as unknown as FTColumnsConfig<UserPermission>} 
     filters={userPermissionsResponse.filters_config as unknown as FTFilters<UserPermission>}
     LOCAL_STORAGE_KEY="user-permissions-filters"
     propertyNameToDisplay="User Permission"
     toggleActiveUrl={toggleActiveUrl}
     //getItemUrl={'/user-permissions'}
    // updateItemUrl={'/user-permissions'}
     deleteUrl={'/user-permissions'}
     />
     
  </div>
);


}


