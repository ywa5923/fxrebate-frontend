
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { Broker } from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';


interface BrokersPageProps {
  searchParams: Promise<SearchParams<Broker>>;
}

export default async function BrokersPage({ searchParams }: BrokersPageProps) {
 
  const log = logger.child('control-panel/super-manager/brokers/page.tsx');
  const params = await searchParams;
  
  const queryString = getQueryStringFromSearchParams(params);

  let url=`/brokers/broker-list?${queryString}`;

  log.debug("Fetching brokers list", { url });

  let dashboardUrl = `/en/control-panel/#dashboard_id#/broker-profile/1/general-information`;
  let toggleActiveUrl = `/brokers/toggle-active-status`;
 
 const optionDataResponse= await apiClient<Broker>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching brokers list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for brokers", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
    <FilterableTable
     data={optionDataResponse.data as unknown as Broker[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<Broker>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<Broker>}
     LOCAL_STORAGE_KEY="brokers-filters"
     formConfig={formConfig}
     propertyNameToDisplay="trading_name"
     dashboardUrl={dashboardUrl}
     toggleActiveUrl={toggleActiveUrl}
     />
     
  </div>
);
}

