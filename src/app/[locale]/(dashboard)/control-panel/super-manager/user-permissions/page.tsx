import { getUserPermissionList } from '@/lib/user-permission-requests';
import { PermissionsTable } from './PermissionsTable';
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { UserPermission } from '@/types/UserPermission';
import { FilterableTable } from '@/components/FilterableTable';
import { FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable/types';

export default async function UserPermissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[]>> }) {
  // const sp = await searchParams;
  // const page = Number((sp?.page as string) || 1);
  // const per_page = Number((sp?.per_page as string) || 15);
  // const data = await getUserPermissionList(page, per_page, {
  //   subject_type: sp?.subject_type as string | undefined,
  //   subject_id: sp?.subject_id as string | undefined,
  //   permission_type: sp?.permission_type as string | undefined,
  //   resource_id: sp?.resource_id as string | undefined,
  //   resource_value: sp?.resource_value as string | undefined,
  //   action: sp?.action as string | undefined,
  //   subject: sp?.subject as string | undefined,
  //   is_active: sp?.is_active as string | undefined,
  //   order_by: sp?.order_by as string | undefined,
  //   order_direction: sp?.order_direction as 'asc' | 'desc' | undefined,
  // });
  // return <PermissionsTable data={data.data || []} meta={data.pagination} />;
  ///////////////////////


 const params = await searchParams;
 const log = logger.child('control-panel/super-manager/user-permissions/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/user-permissions?${queryString}`;

  log.info("Fetching user permissions list", { url });

 
  let toggleActiveUrl = '/user-permissions/toggle-active-status';
 
 const userPermissionsResponse= await apiClient<UserPermission>(url,true);
 //console.log("---------optionDataResponse", optionDataResponse);

 if (! userPermissionsResponse?.success || !userPermissionsResponse?.data) {
  log.error("Error fetching user permissions list", { url,message: userPermissionsResponse?.message });
  throw new Error(userPermissionsResponse?.message || "Error fetching user permissions list");
 }
 const userPermissions = userPermissionsResponse.data;
//  const formConfig = userPermissionsResponse.form_config;
//  if (!formConfig) {
//   log.error("Error fetching form config for user permissions", { url, message: "Form config not found" });
//   throw new Error("Form config not found");
//  }
 
 return (
  <div className="flex-1 space-y-4">
    <FilterableTable
     data={ userPermissionsResponse.data as unknown as UserPermission[]} 
     pagination={userPermissionsResponse.pagination as unknown as FTPagination}
     columnsConfig={userPermissionsResponse.table_columns_config as unknown as FTColumnsConfig<UserPermission>} 
     filters={userPermissionsResponse.filters_config as unknown as FTFilters<UserPermission>}
     LOCAL_STORAGE_KEY="user-permissions-filters"
    // formConfig={formConfig}
     propertyNameToDisplay="User Permission"
     toggleActiveUrl={toggleActiveUrl}
     //getItemUrl={'/user-permissions'}
    // updateItemUrl={'/user-permissions'}
     deleteUrl={'/user-permissions'}
     />
     
  </div>
);


}


