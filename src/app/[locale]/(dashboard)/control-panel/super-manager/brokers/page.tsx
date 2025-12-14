import { Broker, getBrokerList } from '@/lib/broker-management';
import { BrokersTable } from './BrokersTable';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
import logger from '@/lib/logger';
import { apiClient } from '@/lib/api-client';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';


interface BrokersPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
   
  }&Partial<Broker>>;
}

export interface Broker {
  id: number;
  broker_type: string;
  country_id: number | null;
  zone_id: number | null;
  country_code: string | null;
  zone_code: string | null;
  logo: string;
  trading_name: string;
  home_url: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default async function BrokersPage({ searchParams }: BrokersPageProps) {
  // const params = await searchParams;
  // const page = parseInt(params.page || '1');
  // const perPage = parseInt(params.per_page || '25');
  // const orderBy = params.order_by;
  // const orderDirection = params.order_direction;
  
  // const filters = {
  //   broker_type: params.broker_type,
  //   country: params.country,
  //   zone: params.zone,
  //   trading_name: params.trading_name,
  // } as { broker_type?: string; country?: string; zone?: string; trading_name?: string };

  // const brokerData = await getBrokerList(page, perPage, orderBy, orderDirection, filters);

  // return (
  //   <div className="flex-1 space-y-4">
  //     <BrokersTable 
  //       data={brokerData?.data || []} 
  //       meta={brokerData?.pagination}
  //     />
  //   </div>
  // );


//   //=========================
  const params = await searchParams;
  const log = logger.child('control-panel/super-manager/countries/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/brokers/broker-list?${queryString}`;

  console.log("url", url);

  let dashboardUrl = `/en/control-panel/#dashboard_id#/broker-profile/1/general-information`;
  let toggleActiveUrl = `/brokers/toggle-active-status`;
 
 const optionDataResponse= await apiClient<Broker>(url,true);
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

