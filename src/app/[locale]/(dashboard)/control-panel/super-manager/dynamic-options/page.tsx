
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { apiClient } from '@/lib/api-client';

import logger from '@/lib/logger';

import {DynamicOption} from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface DynamicOptionsPageProps {
    searchParams: Promise<SearchParams<DynamicOption>>;
}


export default async function DynamicOptionsPage({ searchParams }: DynamicOptionsPageProps) {
  const log = logger.child('control-panel/super-manager/dynamic-options/page.tsx');
  const params = await searchParams;

  const queryString = getQueryStringFromSearchParams(params);

  let url=`/broker-options/get-list?${queryString}`;
  log.debug("Fetching dynamic options list", { url });
 
 const optionDataResponse= await apiClient<DynamicOption>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching dynamic options list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for dynamic options", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }
  


  return (
    <div className="flex-1 space-y-4">
     
      <FilterableTable
       propertyNameToDisplay="Dynamic Option"
       data={optionDataResponse.data as unknown as DynamicOption[]} 
       pagination={optionDataResponse.pagination as unknown as FTPagination}
       columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<DynamicOption>} 
       filters={optionDataResponse.filters_config as unknown as FTFilters<DynamicOption>}
       LOCAL_STORAGE_KEY="dynamic-options-filters"
       formConfig={formConfig}
       getItemUrl={'/broker-options'}
       updateItemUrl={'/broker-options'}
       deleteUrl={'/broker-options'}
       />
       
    </div>
  );
}
