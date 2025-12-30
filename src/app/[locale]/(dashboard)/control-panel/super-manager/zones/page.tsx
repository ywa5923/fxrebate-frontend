export const dynamic = 'force-dynamic';
export const revalidate = 0;

import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { Zone } from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';

interface ZonesPageProps {
  searchParams: Promise<SearchParams<Zone>>;
}



export default async function ZonesPage({ searchParams }: ZonesPageProps) {
  const log = logger.child('control-panel/super-manager/zones/page.tsx');
  const params = await searchParams;
  
  const queryString = getQueryStringFromSearchParams(params);

  let url=`/zones?${queryString}`;
  const optionDataResponse= await apiClient<Zone>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching zones list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for zones", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
    <FilterableTable
    propertyNameToDisplay="Zone"
     data={optionDataResponse.data as unknown as Zone[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<Zone>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<Zone>}
     LOCAL_STORAGE_KEY="zones-filters"
     formConfig={formConfig}
     getItemUrl={'/zones'}
     updateItemUrl={'/zones'}
     deleteUrl={'/zones'}
     />
     
  </div>);
 
}

