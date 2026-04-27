export const dynamic = 'force-dynamic';
export const revalidate = 0;

import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { BrokerGroup} from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';

interface BrokerGroupsPageProps {
  searchParams: Promise<SearchParams<BrokerGroup>>;
}



export default async function BrokerGroupsPage({ searchParams }: BrokerGroupsPageProps) {
  const log = logger.child('control-panel/super-manager/broker-groups/page.tsx');
  const params = await searchParams;
  
  const queryString = getQueryStringFromSearchParams(params);

  let url=`/broker-groups?${queryString}`;
  const optionDataResponse= await apiClient<BrokerGroup>(url,false);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching broker groups list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching BROKER GROUPS list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for broker groups", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
    <FilterableTable
    propertyNameToDisplay="Broker Group"
     data={optionDataResponse.data as unknown as BrokerGroup[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<BrokerGroup>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<BrokerGroup>}
     LOCAL_STORAGE_KEY="broker-groups-filters"
     formConfig={formConfig}
     getItemUrl={'/broker-groups'}
     updateItemUrl={'/broker-groups'}
     deleteUrl={'/broker-groups'}
     />
     
  </div>);
 
}

