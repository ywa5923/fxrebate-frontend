import { getZoneList } from '@/lib/zone-requests';
import { ZonesTable } from './ZonesTable';
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ZonesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    
  }&Partial<Zone>>;
}

interface Zone {
  id: number;
  name: string;
  zone_code: string;
  description: string;
  countries: string;
  countries_count: number;
  brokers_count:number;
  created_at: string | null;
  updated_at?: string | null;
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
 //console.log("---------optionDataResponse", optionDataResponse);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  //log.error("Error fetching options list", { message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config", { message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
   
    <FilterableTable
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
  // const params = await searchParams;
  // const page = parseInt(params.page || '1');
  // const perPage = parseInt(params.per_page || '25');
  // const orderBy = params.order_by;
  // const orderDirection = params.order_direction;
  
  // const filters = {
  //   name: params.name,
  //   zone_code: params.zone_code,
  // };

  // const zoneData = await getZoneList(page, perPage, orderBy, orderDirection, filters);

  // return (
  //   <div className="flex-1 space-y-4">
  //     <ZonesTable 
  //       data={zoneData?.data || []} 
  //       meta={zoneData?.pagination}
  //     />
  //   </div>
  // );
}

