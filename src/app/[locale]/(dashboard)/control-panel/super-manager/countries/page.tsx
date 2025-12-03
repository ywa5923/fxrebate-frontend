import { getCountryList } from '@/lib/country-requests';
import { CountriesTable } from './CountriesTable';
import logger from '@/lib/logger';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import {apiClient} from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CountriesPageProps {
  searchParams: Promise<{ 
    page?: string; 
    per_page?: string;
    order_by?: string;
    order_direction?: 'asc' | 'desc';
    
  }&Partial<Country>>;
}

interface Country {
  id: number;
  name: string;
  country_code: string;
  zone_name: string;
  zone_code: string;
  brokers_count: number;
  created_at: string | null;
  updated_at?: string | null;
}

export default async function CountriesPage({ searchParams }: CountriesPageProps) {
  const params = await searchParams;
  const log = logger.child('control-panel/super-manager/countries/page.tsx');
  

  const queryString = new URLSearchParams(
    Object.entries(params)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => [k, String(v)])
  ).toString();

  let url=`/countries?${queryString}`;
  console.log("url", url);
 
 const optionDataResponse= await apiClient<Country>(url,true);
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
     data={optionDataResponse.data as unknown as Country[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<Country>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<Country>}
     LOCAL_STORAGE_KEY="countries-filters"
     formConfig={formConfig}
     getItemUrl={`/countries`}
     updateItemUrl={`/countries`}
     />
     
  </div>
);
}

