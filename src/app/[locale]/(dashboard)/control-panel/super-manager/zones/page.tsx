
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { Zone } from '@/types';
//export const dynamic = 'force-dynamic';
//export const revalidate = 0;

interface ZonesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    
  }&Partial<Zone>>;
}



export default async function ZonesPage({ searchParams }: ZonesPageProps) {
  const params = await searchParams;
  const log = logger.child('control-panel/super-manager/zones/page.tsx');
  
  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

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
     getItemUrl={`/zones`}
     updateItemUrl={`/zones`}
     />
     
  </div>);
 
}

