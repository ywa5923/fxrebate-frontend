
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { DropdownList } from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';


interface DropdownListsPageProps {
  searchParams: Promise<SearchParams<DropdownList>>;
}


export default async function DropdownListsPage({ searchParams }: DropdownListsPageProps) {
  const log = logger.child('control-panel/super-manager/dropdown-lists/page.tsx');
  const params = await searchParams;
  
  const queryString = getQueryStringFromSearchParams(params);

  let url=`/dropdown-lists?${queryString}`;
  const optionDataResponse= await apiClient<DropdownList>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching dropdown lists", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for dropdown lists", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
    <FilterableTable
     propertyNameToDisplay="Dropdown List"
     data={optionDataResponse.data as unknown as DropdownList[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<DropdownList>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<DropdownList>}
     LOCAL_STORAGE_KEY="dropdown-lists-filters"
     formConfig={formConfig}
     getItemUrl={'/dropdown-lists'}
     updateItemUrl={'/dropdown-lists'}
     deleteUrl={'/dropdown-lists'}
     />
     
  </div>);
}



