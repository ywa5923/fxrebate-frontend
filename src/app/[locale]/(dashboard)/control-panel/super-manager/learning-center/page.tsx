
import { FilterableTable, FTColumnsConfig, FTFilters, FTPagination } from '@/components/FilterableTable';
import { apiClient } from '@/lib/api-client';

import logger from '@/lib/logger';

import {  SearchParams } from '@/types/SearchParams';
import { getQueryStringFromSearchParams } from '@/lib/getQueryStringFromSearchParams';
import { InfoSection } from '@/types';


interface LearningCenterPageProps {
    searchParams: Promise<SearchParams<InfoSection>>;
}


export default async function LearningCenterPage({ searchParams }: LearningCenterPageProps) {
  const log = logger.child('control-panel/super-manager/learning-center/page.tsx');
  const params = await searchParams;

  const queryString = getQueryStringFromSearchParams(params);

  let url=`/info-sections?${queryString}`;
  log.debug("Fetching learning center list", { url });
 
 const optionDataResponse= await apiClient<InfoSection[]>(url,true);

 if (!optionDataResponse?.success || !optionDataResponse?.data) {
  log.error("Error fetching learning center list", { url,message: optionDataResponse?.message });
  throw new Error(optionDataResponse?.message || "Error fetching learning center list");
 }
 const optionData = optionDataResponse.data;
 const formConfig = optionDataResponse.form_config;
 
 if (!formConfig) {
  log.error("Error fetching form config for learning center", { url, message: "Form config not found" });
  throw new Error("Form config not found");
 }
  


  return (
    <div className="flex-1 space-y-4">
     
      <FilterableTable
       propertyNameToDisplay="Learning Center"
       data={optionDataResponse.data as unknown as InfoSection[]} 
       pagination={optionDataResponse.pagination as unknown as FTPagination}
       columnsConfig={optionDataResponse.table_columns_config as unknown as FTColumnsConfig<InfoSection>} 
       filters={optionDataResponse.filters_config as unknown as FTFilters<InfoSection>}
       LOCAL_STORAGE_KEY="learning-center-filters"
       formConfig={formConfig}
       getItemUrl={'/info-sections'}
       updateItemUrl={'/info-sections'}
       deleteUrl={'/info-sections'}
       />
       
    </div>
  );
}
