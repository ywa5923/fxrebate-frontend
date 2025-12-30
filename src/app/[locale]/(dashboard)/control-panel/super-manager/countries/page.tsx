
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import logger from '@/lib/logger';
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import {apiClient} from '@/lib/api-client';
import { Country } from '@/types';
import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';

interface CountriesPageProps {
  searchParams: Promise<SearchParams<Country>>;
}


export default async function CountriesPage({ searchParams }: CountriesPageProps) {
  const log = logger.child('control-panel/super-manager/countries/page.tsx');
  const params = await searchParams;
  
  const queryString = getQueryStringFromSearchParams(params);

  let url=`/countries?${queryString}`;
  log.debug("Fetching countries list", { url });
 
 const optionDataResponse= await apiClient<Country>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching countries list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching options list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for countries", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }

 return (
  <div className="flex-1 space-y-4">
   
    <FilterableTable
     propertyNameToDisplay="Country"
     data={optionDataResponse.data as unknown as Country[]} 
     pagination={optionDataResponse.pagination as unknown as FTPagination}
     columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<Country>} 
     filters={optionDataResponse.filters_config as unknown as FTFilters<Country>}
     LOCAL_STORAGE_KEY="countries-filters"
     formConfig={formConfig}
     getItemUrl={'/countries'}
     updateItemUrl={'/countries'}
     deleteUrl={'/countries'}
     />
     
  </div>
);
}

